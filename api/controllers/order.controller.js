import mongoose from 'mongoose';
import Order from '../models/order.model.js';
import Listing from '../models/listing.model.js';


// Create a new order
export const createOrder = async (req, res, next) => {
  try {
    const { orderItems, customerInfo, notes } = req.body;
    let totalPrice = 0;

    // Generate a unique order ID with CM prefix and 5-digit number
    const randomNum = Math.floor(10000 + Math.random() * 90000); // Generates a number between 10000 and 99999
    const orderId = `CM${randomNum}`;

    const updatedItems = await Promise.all(
      orderItems.map(async (item) => {
        const listing = await Listing.findById(item._id).populate('userRef', 'username email');

        if (!listing) {
          console.error(`Listing not found for ID: ${item._id}`);
          return null;
        }

        // Ensure quantity does not exceed available stock
        if (listing.currentQuantity < item.quantity) {
          throw new Error(`Not enough stock for listing: ${listing.name}`);
        }

        const sellerInfo = {
          username: listing.userRef?.username || "Unknown Seller",
          email: listing.userRef?.email || "No Email",
          phoneNumber: listing.phoneNumber || "No Phone",
          city: listing.city || "Unknown City",
          district: listing.district || "Unknown District",
          address: listing.address || "No Address",
          contactPreference: listing.contactPreference || "No Preference",
        };

        const sellerProfit = listing.price * item.quantity - listing.price * item.quantity * 0.1;
        totalPrice += listing.price * item.quantity;

        // Update listing quantities
        listing.currentQuantity -= item.quantity;
        listing.soldQuantity += item.quantity;
        await listing.save();

        // Build the order item with conditional fields based on item type
        const orderItem = {
          name: listing.name || "Unnamed Product",
          description: listing.description || "No Description",
          price: listing.price || 0,
          type: listing.type || "Unknown Type",
          quantity: item.quantity,
          sellerInfo,
          profit: sellerProfit,
          _id: listing._id,
        };

        // Add size or dimensions based on item type
        if (listing.type === 'Clothing & Wearables') {
          // For clothing items, add the selected size from the cart item
          if (item.selectedSize) {
            orderItem.selectedSize = item.selectedSize;
          }
        } else {
          // For non-clothing items, add dimensions from the listing
          if (listing.dimensions) {
            orderItem.dimensions = listing.dimensions;
          }
          if (listing.width) {
            orderItem.width = listing.width;
          }
          if (listing.height) {
            orderItem.height = listing.height;
          }
          if (listing.depth && listing.dimensions === '3D') {
            orderItem.depth = listing.depth;
          }
        }

        return orderItem;
      })
    );

    // Remove any failed items from order
    const validItems = updatedItems.filter(item => item !== null);
    if (validItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid items found in the order.',
      });
    }

    const finalPrice = totalPrice + 85; // Only add shipping fee
    const cadreProfit = totalPrice * 0.10; // Keep the 10% profit calculation

    // Create the order
    const newOrder = new Order({
      _id: orderId,
      orderItems: validItems,
      customerInfo,
      shipmentFees: 85, // Fixed shipping fee
      totalPrice: finalPrice,
      cadreProfit,
      notes,
      status: 'placed', // Default status
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId,
    });
  } catch (error) {
    console.error('Error in createOrder:', error);
    next(error);
  }
};

// Get all orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error in getOrders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['placed', 'out for delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status.' });
    }

    // Find the order first to access order items
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Handle automatic listing status changes based on order status
    if (status === 'out for delivery' || status === 'delivered') {
      // Update listing statuses for unique items and stock items with zero quantity
      for (const orderItem of order.orderItems) {
        try {
          const listing = await Listing.findById(orderItem._id);
          if (!listing) continue;

          const isUniqueItem = listing.listingType === 'unique';
          const isStockWithZeroQuantity = !isUniqueItem && listing.currentQuantity === 0;
          
          if (isUniqueItem || isStockWithZeroQuantity) {
            let newListingStatus = listing.status;
            
            if (status === 'out for delivery' && listing.status === 'For Sale') {
              newListingStatus = 'Confirmed';
            } else if (status === 'delivered' && listing.status === 'Confirmed') {
              newListingStatus = 'Sold';
            }
            
            // Update listing status if it changed
            if (newListingStatus !== listing.status) {
              listing.status = newListingStatus;
              await listing.save();
            }
          }
        } catch (error) {
          console.error(`Error updating listing status for item ${orderItem._id}:`, error);
          // Continue processing other items even if one fails
        }
      }
    } else if (status === 'cancelled') {
      // Handle cancellation - restore item statuses and quantities
      for (const orderItem of order.orderItems) {
        try {
          const listing = await Listing.findById(orderItem._id);
          if (!listing) continue;

          const isUniqueItem = listing.listingType === 'unique';
          
          // Restore listing status to 'For Sale' if it was Confirmed or Sold
          if (listing.status === 'Confirmed' || listing.status === 'Sold') {
            listing.status = 'For Sale';
          }
          
          // For non-unique items, also restore quantities
          if (!isUniqueItem) {
            listing.currentQuantity += orderItem.quantity;
            listing.soldQuantity = Math.max(0, listing.soldQuantity - orderItem.quantity);
          }
          
          await listing.save();
        } catch (error) {
          console.error(`Error restoring listing for item ${orderItem._id}:`, error);
          // Continue processing other items even if one fails
        }
      }
    }

    // Update the order status
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({ message: 'Failed to update order', error });
  }
};

// Delete an order
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json({ message: 'Order deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteOrder:', error);
    res.status(500).json({ message: 'Failed to delete order', error: error.message });
  }
};

// Update item status checks
export const updateItemStatusChecks = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { statusChecks } = req.body;

    // Validate status checks
    const validStatusChecks = ['itemReceived', 'itemVerified', 'itemPacked', 'readyForShipment'];
    const invalidChecks = Object.keys(statusChecks).filter(key => !validStatusChecks.includes(key));
    
    if (invalidChecks.length > 0) {
      return res.status(400).json({ 
        message: `Invalid status checks: ${invalidChecks.join(', ')}` 
      });
    }

    // Find the order and update the specific item's status checks
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Find the specific item in the order
    const item = order.orderItems.find(item => item._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Order item not found' });
    }

    // Update status checks
    item.statusChecks = {
      ...item.statusChecks,
      ...statusChecks
    };

    // Save the updated order
    await order.save();

    res.status(200).json({
      message: 'Status checks updated successfully',
      statusChecks: item.statusChecks
    });
  } catch (error) {
    console.error('Error in updateItemStatusChecks:', error);
    res.status(500).json({ 
      message: 'Failed to update status checks', 
      error: error.message 
    });
  }
};

// Delete an order item
export const deleteOrderItem = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Find the item to be deleted
    const itemIndex = order.orderItems.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: 'Order item not found' 
      });
    }

    const itemToDelete = order.orderItems[itemIndex];

    // Restore listing quantities (reverse the quantity changes made during order creation)
    try {
      const listing = await Listing.findById(itemToDelete._id);
      if (listing) {
        listing.currentQuantity += itemToDelete.quantity;
        listing.soldQuantity = Math.max(0, listing.soldQuantity - itemToDelete.quantity);
        await listing.save();
      }
    } catch (error) {
      console.error('Error restoring listing quantities:', error);
      // Continue with item deletion even if listing update fails
    }

    // Remove the item from the order
    order.orderItems.splice(itemIndex, 1);

    // Check if order has any items left
    if (order.orderItems.length === 0) {
      // Delete the entire order if no items left
      await Order.findByIdAndDelete(orderId);
      return res.status(200).json({
        success: true,
        message: 'Order item deleted successfully. Order was also deleted as it had no remaining items.',
        orderDeleted: true
      });
    }

    // Recalculate order totals
    const newSubtotal = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newTotal = newSubtotal + order.shipmentFees;
    const newCadreProfit = newSubtotal * 0.10;

    order.totalPrice = newTotal;
    order.cadreProfit = newCadreProfit;

    // Save the updated order
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order item deleted successfully',
      order: order,
      orderDeleted: false
    });
  } catch (error) {
    console.error('Error in deleteOrderItem:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete order item', 
      error: error.message 
    });
  }
};

// Update order item quantity
export const updateOrderItemQuantity = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { newQuantity } = req.body;

    // Validate input
    if (!newQuantity || newQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'New quantity must be at least 1'
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Find the item to be updated
    const itemIndex = order.orderItems.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Order item not found'
      });
    }

    const orderItem = order.orderItems[itemIndex];
    const oldQuantity = orderItem.quantity;
    const quantityDifference = newQuantity - oldQuantity;

    // Get the listing to check availability and update quantities
    const listing = await Listing.findById(itemId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if we have enough stock for quantity increase
    if (quantityDifference > 0 && listing.currentQuantity < quantityDifference) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock available. Only ${listing.currentQuantity} items remaining.`
      });
    }

    // Update listing quantities
    listing.currentQuantity -= quantityDifference; // Decrease if quantity increased, increase if quantity decreased
    listing.soldQuantity += quantityDifference; // Increase if quantity increased, decrease if quantity decreased
    
    // Ensure soldQuantity doesn't go below 0
    listing.soldQuantity = Math.max(0, listing.soldQuantity);
    
    await listing.save();

    // Update order item quantity and recalculate profit
    orderItem.quantity = newQuantity;
    orderItem.profit = listing.price * newQuantity * 0.9; // Seller gets 90%, Cadre gets 10%

    // Recalculate order totals
    const newSubtotal = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newTotal = newSubtotal + order.shipmentFees;
    const newCadreProfit = newSubtotal * 0.10;

    order.totalPrice = newTotal;
    order.cadreProfit = newCadreProfit;

    // Save the updated order
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order item quantity updated successfully',
      order: order,
      updatedItem: orderItem,
      listingStock: {
        currentQuantity: listing.currentQuantity,
        soldQuantity: listing.soldQuantity
      }
    });
  } catch (error) {
    console.error('Error in updateOrderItemQuantity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order item quantity',
      error: error.message 
    });
  }
};

// Get order statistics for back office dashboard
export const getOrderStatistics = async (req, res, next) => {
  try {
    const { timeframe = '30' } = req.query; // Default to last 30 days
    
    // Calculate date for timeframe filtering
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

    // Get all orders
    const allOrders = await Order.find({});
    
    // Get recent orders for trend calculation
    const recentOrders = await Order.find({
      createdAt: { $gte: daysAgo }
    });

    // Calculate basic metrics (excluding cancelled orders from revenue calculations)
    const totalOrders = allOrders.length;
    const nonCancelledOrders = allOrders.filter(order => order.status !== 'cancelled');
    const totalRevenue = nonCancelledOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const totalCadreRevenue = nonCancelledOrders.reduce((sum, order) => sum + (order.cadreProfit || 0), 0);
    const totalShipmentFees = nonCancelledOrders.reduce((sum, order) => sum + (order.shipmentFees || 0), 0);
    const averageOrderValue = nonCancelledOrders.length > 0 ? (totalRevenue - totalShipmentFees) / nonCancelledOrders.length : 0;

    // Total items sold across all orders (excluding cancelled orders)
    const totalItemsSold = nonCancelledOrders.reduce((sum, order) => {
      return sum + order.orderItems.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0);
    }, 0);

    // Status distribution
    const statusDistribution = allOrders.reduce((acc, order) => {
      const status = order.status || 'placed';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Active vs Completed (Active = placed + out for delivery)
    const activeStatuses = ['placed', 'out for delivery'];
    const activeCount = allOrders.filter(order => activeStatuses.includes(order.status)).length;
    const completedCount = allOrders.filter(order => order.status === 'delivered').length;
    const cancelledCount = allOrders.filter(order => order.status === 'cancelled').length;

    // Payment method distribution
    const paymentMethodDistribution = allOrders.reduce((acc, order) => {
      const method = order.customerInfo?.paymentMethod || 'cash';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    // Geographic distribution (by customer city, excluding cancelled orders from revenue)
    const geoDistribution = allOrders.reduce((acc, order) => {
      const city = order.customerInfo?.city || 'Unknown';
      if (!acc[city]) {
        acc[city] = { count: 0, revenue: 0, districts: {} };
      }
      acc[city].count += 1;
      // Only count revenue for non-cancelled orders
      if (order.status !== 'cancelled') {
        acc[city].revenue += order.totalPrice || 0;
      }
      
      if (order.customerInfo?.district) {
        acc[city].districts[order.customerInfo.district] = (acc[city].districts[order.customerInfo.district] || 0) + 1;
      }
      return acc;
    }, {});

    // Item type performance (excluding cancelled orders)
    const itemTypeStats = nonCancelledOrders.reduce((acc, order) => {
      order.orderItems.forEach(item => {
        const type = item.type || 'Other';
        if (!acc[type]) {
          acc[type] = { count: 0, quantity: 0, revenue: 0, avgPrice: 0 };
        }
        acc[type].count += 1;
        acc[type].quantity += item.quantity || 0;
        acc[type].revenue += (item.price || 0) * (item.quantity || 0);
        acc[type].avgPrice = acc[type].revenue / acc[type].quantity;
      });
      return acc;
    }, {});

    // Revenue ranges (excluding cancelled orders)
    const revenueRanges = nonCancelledOrders.reduce((acc, order) => {
      const revenue = (order.totalPrice || 0) - (order.shipmentFees || 0); // Exclude shipping
      if (revenue >= 1000 && revenue < 3000) acc['1K-3K EGP'] += 1;
      else if (revenue >= 3000 && revenue < 5000) acc['3K-5K EGP'] += 1;
      else if (revenue >= 5000 && revenue < 10000) acc['5K-10K EGP'] += 1;
      else if (revenue >= 10000) acc['10K+ EGP'] += 1;
      return acc;
    }, {
      '1K-3K EGP': 0,
      '3K-5K EGP': 0,
      '5K-10K EGP': 0,
      '10K+ EGP': 0
    });

    // Recent activity trends
    const previousPeriodStart = new Date(daysAgo);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(timeframe));
    
    const previousPeriodOrders = await Order.find({
      createdAt: { $gte: previousPeriodStart, $lt: daysAgo }
    });

    const previousTotalOrders = previousPeriodOrders.length;
    const orderGrowth = previousTotalOrders > 0 
      ? ((recentOrders.length - previousTotalOrders) / previousTotalOrders) * 100 
      : 0;

    const previousTotalRevenue = previousPeriodOrders.filter(order => order.status !== 'cancelled').reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const recentTotalRevenue = recentOrders.filter(order => order.status !== 'cancelled').reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const revenueGrowth = previousTotalRevenue > 0
      ? ((recentTotalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100
      : 0;

    // Order fulfillment progress (item status checks)
    const fulfillmentProgress = allOrders.reduce((acc, order) => {
      order.orderItems.forEach(item => {
        const checks = item.statusChecks || {};
        acc.totalItems += 1;
        if (checks.itemReceived) acc.itemsReceived += 1;
        if (checks.itemVerified) acc.itemsVerified += 1;
        if (checks.itemPacked) acc.itemsPacked += 1;
        if (checks.readyForShipment) acc.itemsReadyForShipment += 1;
      });
      return acc;
    }, {
      totalItems: 0,
      itemsReceived: 0,
      itemsVerified: 0,
      itemsPacked: 0,
      itemsReadyForShipment: 0
    });

    // Top selling cities by order volume
    const topCities = Object.entries(geoDistribution)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10);

    // Average fulfillment time (for delivered orders)
    const deliveredOrders = allOrders.filter(order => order.status === 'delivered');
    const avgFulfillmentTime = deliveredOrders.length > 0
      ? deliveredOrders.reduce((sum, order) => {
          // Calculate days between order creation and delivery
          const orderDate = new Date(order.createdAt);
          const deliveryDate = new Date(order.updatedAt || order.createdAt);
          return sum + (deliveryDate - orderDate) / (1000 * 60 * 60 * 24);
        }, 0) / deliveredOrders.length
      : 0;

    const statistics = {
      overview: {
        totalOrders,
        totalRevenue,
        totalCadreRevenue,
        totalShipmentFees,
        averageOrderValue,
        totalItemsSold,
        activeCount,
        completedCount,
        cancelledCount,
        activePercentage: totalOrders > 0 ? (activeCount / totalOrders) * 100 : 0,
        completionRate: totalOrders > 0 ? (completedCount / totalOrders) * 100 : 0,
        avgFulfillmentTime: avgFulfillmentTime.toFixed(1)
      },
      trends: {
        orderGrowth: {
          value: orderGrowth,
          direction: orderGrowth > 0 ? 'up' : orderGrowth < 0 ? 'down' : 'neutral',
          period: `${timeframe} days`
        },
        revenueGrowth: {
          value: revenueGrowth,
          direction: revenueGrowth > 0 ? 'up' : revenueGrowth < 0 ? 'down' : 'neutral',
          period: `${timeframe} days`
        }
      },
      distributions: {
        status: statusDistribution,
        paymentMethod: paymentMethodDistribution,
        geographic: geoDistribution,
        itemType: itemTypeStats,
        revenueRanges,
        topCities
      },
      fulfillment: {
        progress: fulfillmentProgress,
        completionPercentages: {
          received: fulfillmentProgress.totalItems > 0 ? (fulfillmentProgress.itemsReceived / fulfillmentProgress.totalItems) * 100 : 0,
          verified: fulfillmentProgress.totalItems > 0 ? (fulfillmentProgress.itemsVerified / fulfillmentProgress.totalItems) * 100 : 0,
          packed: fulfillmentProgress.totalItems > 0 ? (fulfillmentProgress.itemsPacked / fulfillmentProgress.totalItems) * 100 : 0,
          readyForShipment: fulfillmentProgress.totalItems > 0 ? (fulfillmentProgress.itemsReadyForShipment / fulfillmentProgress.totalItems) * 100 : 0
        }
      },
      timeframe: {
        days: parseInt(timeframe),
        periodStart: daysAgo.toISOString(),
        periodEnd: new Date().toISOString()
      }
    };

    res.status(200).json(statistics);
  } catch (error) {
    next(error);
  }
};