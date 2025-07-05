import BackOfficeUser from '../models/backOfficeUser.model.js';
import Order from '../models/order.model.js';
import Listing from '../models/listing.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/error.js';

// Login with credentials
export const login = async (req, res, next) => {
  const { username, password } = req.body;
  
  try {
    const user = await BackOfficeUser.findOne({ username });
    if (!user) return next(errorHandler(404, 'User not found'));

    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) return next(errorHandler(401, 'Wrong credentials'));

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    const { password: pass, ...rest } = user._doc;

    res
      .cookie('backoffice_token', token, {
        httpOnly: true,
        // Secure and domain must be set for cross-origin cookies in production
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        domain: process.env.NODE_ENV === 'production' ? '.cadremarkets.com' : undefined,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

// Create new back-office user (admin only)
export const createUser = async (req, res, next) => {
  const { username, email, password, role, permissions } = req.body;

  try {
    // Check if requester is admin
    if (req.user.role !== 'admin') {
      return next(errorHandler(403, 'Only admins can create back-office users'));
    }

    const newUser = new BackOfficeUser({
      username,
      email,
      password,
      role,
      permissions
    });

    await newUser.save();
    
    const { password: pass, ...rest } = newUser._doc;
    res.status(201).json(rest);
  } catch (error) {
    next(error);
  }
};

// Get all back-office users (admin only)
export const getUsers = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(errorHandler(403, 'Only admins can view back-office users'));
    }

    const users = await BackOfficeUser.find({}, { password: 0 });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// Update back-office user
export const updateUser = async (req, res, next) => {
  const { id } = req.params;
  const { username, email, password, role, permissions } = req.body;

  try {
    // Only admins can update other users
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return next(errorHandler(403, 'You can only update your own account'));
    }

    // Only admins can update roles and permissions
    if (req.user.role !== 'admin') {
      delete req.body.role;
      delete req.body.permissions;
    }

    const user = await BackOfficeUser.findById(id);
    if (!user) return next(errorHandler(404, 'User not found'));

    if (password) {
      req.body.password = await bcryptjs.hash(password, 10);
    }

    const updatedUser = await BackOfficeUser.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    const { password: pass, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// Delete back-office user (admin only)
export const deleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(errorHandler(403, 'Only admins can delete back-office users'));
    }

    await BackOfficeUser.findByIdAndDelete(req.params.id);
    res.status(200).json('User has been deleted');
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req, res) => {
  res.clearCookie('backoffice_token');
  res.status(200).json('Logged out successfully');
};

// Get dashboard statistics
export const getStats = async (req, res, next) => {
  try {
    // Get orders by status
    const [
      placedOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      totalOrders,
      totalRevenue,
      totalCadreProfit
    ] = await Promise.all([
      Order.countDocuments({ status: 'placed' }),
      Order.countDocuments({ status: 'out for delivery' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.countDocuments({}), // Total count of all orders
      Order.aggregate([
        {
          $match: { status: { $ne: 'cancelled' } } // Exclude cancelled orders
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalPrice" }
          }
        }
      ]), // Total revenue from all orders excluding cancelled
      Order.aggregate([
        {
          $match: { status: 'delivered' } // Only delivered orders
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$cadreProfit" }
          }
        }
      ]) // Total Cadre profit from delivered orders only
    ]);

    // Get orders by payment type
    const [cashOrders, instapayOrders] = await Promise.all([
      Order.aggregate([
        {
          $match: { 'customerInfo.paymentMethod': 'cash' }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            total: { $sum: "$totalPrice" }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: { 'customerInfo.paymentMethod': 'instapay' }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            total: { $sum: "$totalPrice" }
          }
        }
      ])
    ]);

    // Get revenue data for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Get order trends
    const orderTrends = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Get top selling districts (based on number of listings)
    const topSellingDistricts = await Listing.aggregate([
      {
        $group: {
          _id: "$district",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          label: "$_id",
          value: "$count"
        }
      }
    ]);

    // Get top buying districts (based on number of orders)
    const topBuyingDistricts = await Order.aggregate([
      {
        $match: { status: 'delivered' }
      },
      {
        $group: {
          _id: "$customerInfo.district",
          count: { $sum: 1 },
          revenue: { $sum: "$totalPrice" }
        }
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          label: "$_id",
          value: "$count",
          revenue: 1
        }
      }
    ]);

    // Get top selling users (based on seller profit from delivered orders)
    const topSellingUsers = await Order.aggregate([
      {
        $match: { status: 'delivered' }
      },
      {
        $unwind: '$orderItems'
      },
      {
        $lookup: {
          from: 'listings',
          localField: 'orderItems._id',
          foreignField: '_id',
          as: 'listing'
        }
      },
      {
        $unwind: '$listing'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'listing.userRef',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $group: {
          _id: '$listing.userRef',
          label: { $first: '$user.username' },
          value: { $sum: '$orderItems.profit' }, // Total seller profit from delivered orders
          count: { $sum: 1 } // Count of sold items
        }
      },
      {
        $sort: { value: -1 } // Sort by total seller profit
      },
      {
        $limit: 5
      }
    ]);

    // Get highest priced unique listings
    const uniqueListingsHighPrice = await Listing.aggregate([
      {
        $match: {
          listingType: 'unique',
          status: 'For Sale'
        }
      },
      {
        $sort: { price: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          price: 1
        }
      }
    ]);

    // Get highest priced stock listings
    const stockListingsHighPrice = await Listing.aggregate([
      {
        $match: {
          listingType: 'stock',
          status: 'For Sale',
          currentQuantity: { $gt: 0 }
        }
      },
      {
        $sort: { price: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          price: 1
        }
      }
    ]);

    res.status(200).json({
      placedOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      totalOrders,
      totalRevenue: totalRevenue[0] || { total: 0 },
      totalCadreProfit: totalCadreProfit[0] || { total: 0 },
      cashOrders: cashOrders[0] || { count: 0, total: 0 },
      visaOrders: instapayOrders[0] || { count: 0, total: 0 },
      revenueData: revenueData.map(item => ({
        date: item._id,
        amount: item.revenue
      })),
      orderTrends: orderTrends.map(item => ({
        date: item._id,
        count: item.count
      })),
      topSellingDistricts,
      topBuyingDistricts,
      topSellingUsers,
      uniqueListingsHighPrice,
      stockListingsHighPrice
    });
  } catch (error) {
    next(error);
  }
}; 