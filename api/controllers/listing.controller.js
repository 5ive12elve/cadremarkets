import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

export const createListing = async (req, res, next) => {
  try {
    if (req.body.price < 100) {
      return next(errorHandler(400, 'Price must be at least 100 EGP'));
    }

    // Validate clothing sizes if type is Clothing & Wearables
    if (req.body.type === 'Clothing & Wearables') {
      if (!req.body.availableSizes || !Array.isArray(req.body.availableSizes) || req.body.availableSizes.length === 0) {
        return next(errorHandler(400, 'Available sizes are required for clothing items'));
      }
      
      const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50', 'One Size'];
      const invalidSizes = req.body.availableSizes.filter(size => !validSizes.includes(size));
      
      if (invalidSizes.length > 0) {
        return next(errorHandler(400, `Invalid sizes: ${invalidSizes.join(', ')}. Valid sizes are: ${validSizes.join(', ')}`));
      }

      if (req.body.availableSizes.length > 10) {
        return next(errorHandler(400, 'Maximum 10 sizes allowed'));
      }
    } else {
      // For non-clothing items, ensure dimensions are provided
      if (!req.body.dimensions || !req.body.width || !req.body.height) {
        return next(errorHandler(400, 'Dimensions, width, and height are required for non-clothing items'));
      }
      
      if (req.body.dimensions === '3D' && !req.body.depth) {
        return next(errorHandler(400, 'Depth is required for 3D items'));
      }
    }

    const listing = await Listing.create({
      ...req.body,
      userRef: req.user.id, // Set userRef from authenticated user
      quantity: req.body.quantity && req.body.quantity > 1 ? req.body.quantity : 1,
      cadremarketsService: req.body.cadremarketsService || false,
    });

    return res.status(201).json({ success: true, id: listing._id, listing });
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json('Listing has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }
  if (req.user.id !== listing.userRef.toString()) {
    return next(errorHandler(401, 'You can only update your own listings!'));
  }

  // Validate price if it's being updated
  if (req.body.price !== undefined && req.body.price < 100) {
    return next(errorHandler(400, 'Price must be at least 100 EGP'));
  }

  try {
    // Validate clothing sizes if type is being updated to Clothing & Wearables
    const typeToUpdate = req.body.type || listing.type;
    
    if (typeToUpdate === 'Clothing & Wearables') {
      const sizesToUpdate = req.body.availableSizes || listing.availableSizes;
      
      if (!sizesToUpdate || !Array.isArray(sizesToUpdate) || sizesToUpdate.length === 0) {
        return next(errorHandler(400, 'Available sizes are required for clothing items'));
      }
      
      const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50', 'One Size'];
      const invalidSizes = sizesToUpdate.filter(size => !validSizes.includes(size));
      
      if (invalidSizes.length > 0) {
        return next(errorHandler(400, `Invalid sizes: ${invalidSizes.join(', ')}. Valid sizes are: ${validSizes.join(', ')}`));
      }

      if (sizesToUpdate.length > 10) {
        return next(errorHandler(400, 'Maximum 10 sizes allowed'));
      }
    } else {
      // For non-clothing items, ensure dimensions are provided
      const dimensionsToUpdate = req.body.dimensions || listing.dimensions;
      const widthToUpdate = req.body.width || listing.width;
      const heightToUpdate = req.body.height || listing.height;
      
      if (!dimensionsToUpdate || !widthToUpdate || !heightToUpdate) {
        return next(errorHandler(400, 'Dimensions, width, and height are required for non-clothing items'));
      }
      
      if (dimensionsToUpdate === '3D') {
        const depthToUpdate = req.body.depth || listing.depth;
        if (!depthToUpdate) {
          return next(errorHandler(400, 'Depth is required for 3D items'));
        }
      }
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    const {
      type,
      searchTerm = '',
      sort = 'createdAt',
      order = 'desc',
      city,
      district,
      dimensions,
      cadremarketsService,
    } = req.query;

    // Build filters dynamically
    const filters = {
      name: { $regex: searchTerm, $options: 'i' }, // Search by name
      type: type && type !== 'all' ? type : { $in: [
        'Paintings & Drawings',
        'Sculptures & 3D Art',
        'Antiques & Collectibles',
        'Clothing & Wearables',
        'Home Décor',
        'Accessories',
        'Prints & Posters',
      ]}, // Match categories
      status: 'For Sale', // Only show listings that are for sale
    };

    // Add optional filters
    if (city) filters.city = city;
    if (district) filters.district = district;
    if (dimensions) filters.dimensions = dimensions;
    if (cadremarketsService === 'true') filters.cadremarketsService = true;

    // Sorting and pagination
    const sortField = sort;
    const sortOrder = order === 'asc' ? 1 : -1;

    const listings = await Listing.find(filters)
      .sort({ [sortField]: sortOrder })
      .limit(limit)
      .skip(startIndex);

    console.log('🔍 Backend getListings: Found', listings.length, 'listings');
    console.log('🔍 Backend getListings: Filters:', filters);
    console.log('🔍 Backend getListings: Response type:', typeof listings);
    console.log('🔍 Backend getListings: Is array?', Array.isArray(listings));

    // ✅ FIX: Always return an array, even if empty
    return res.status(200).json(listings || []);
  } catch (error) {
    console.error('🔥 getListings error:', error.message);
    // ✅ FIX: Return empty array instead of passing to error handler
    return res.status(200).json([]);
  }
};

// ✅ New API: Update Listing Status
export const updateListingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'For Sale', 'Confirmed', 'Cancelled', 'Sold'].includes(status)) {
      return next(errorHandler(400, 'Invalid status'));
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(errorHandler(404, 'Listing not found!'));

    listing.status = status;
    await listing.save();
    
    res.status(200).json({ message: 'Listing status updated', listing });
  } catch (error) {
    next(error);
  }
};

export const getForSaleListings = async (req, res) => {
  try {
      // ✅ Filter listings: Only "For Sale" & quantity > 0
      let query = { status: "For Sale", quantity: { $gt: 0 } };

      // ✅ Sort: Show `cadremarketsService: true` first, then `false`
      const listings = await Listing.find(query)
          .sort({ cadremarketsService: -1 }); // ✅ Sorting Logic

      res.status(200).json(listings);
  } catch (error) {
      console.error("Error fetching for-sale listings:", error);
      res.status(500).json({ message: "Error retrieving listings" });
  }
};

// Update listing quantities
export const updateListingQuantities = async (req, res, next) => {
  try {
    const { currentQuantity, soldQuantity } = req.body;
    
    if (typeof currentQuantity !== 'number' || typeof soldQuantity !== 'number') {
      return next(errorHandler(400, 'Current quantity and sold quantity must be numbers'));
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }

    // Basic validations
    if (currentQuantity < 0 || soldQuantity < 0) {
      return next(errorHandler(400, 'Quantities cannot be negative'));
    }

    if (currentQuantity > listing.initialQuantity) {
      return next(errorHandler(400, 'Current quantity cannot exceed initial quantity'));
    }

    if (soldQuantity > listing.initialQuantity) {
      return next(errorHandler(400, 'Sold quantity cannot exceed initial quantity'));
    }

    // Update quantities
    listing.currentQuantity = currentQuantity;
    listing.soldQuantity = soldQuantity;
    
    await listing.save();
    
    res.status(200).json({ 
      message: 'Listing quantities updated successfully',
      listing 
    });
  } catch (error) {
    next(error);
  }
};

// Get all listings for back office (no status filtering)
export const getAllListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const startIndex = parseInt(req.query.startIndex) || 0;
    const { searchTerm = '', sort = 'createdAt', order = 'desc' } = req.query;

    const filters = {};
    if (searchTerm) {
      filters.name = { $regex: searchTerm, $options: 'i' };
    }

    const sortField = sort;
    const sortOrder = order === 'asc' ? 1 : -1;

    const listings = await Listing.find(filters)
      .sort({ [sortField]: sortOrder })
      .limit(limit)
      .skip(startIndex)
      .populate('userRef', 'username email');

    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

// Get available clothing sizes
export const getClothingSizes = async (req, res, next) => {
  try {
    const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50', 'One Size'];
    res.status(200).json({ 
      success: true, 
      sizes: availableSizes,
      message: 'Available clothing sizes retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};
export const getAllListingsForBackOffice = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100; // Higher default limit for back office
    const startIndex = parseInt(req.query.startIndex) || 0;

    const {
      type,
      searchTerm = '',
      sort = 'createdAt',
      order = 'desc',
      city,
      district,
      dimensions,
      cadremarketsService,
      status, // Allow status filtering but don't make it mandatory
    } = req.query;

    // Build filters dynamically - NO hardcoded status filter
    const filters = {
      name: { $regex: searchTerm, $options: 'i' }, // Search by name
      type: type && type !== 'all' ? type : { $in: [
        'Paintings & Drawings',
        'Sculptures & 3D Art',
        'Antiques & Collectibles',
        'Clothing & Wearables',
        'Home Décor',
        'Accessories',
        'Prints & Posters',
      ]}, // Match categories
    };

    // Add optional filters
    if (city) filters.city = city;
    if (district) filters.district = district;
    if (dimensions) filters.dimensions = dimensions;
    if (cadremarketsService === 'true') filters.cadremarketsService = true;
    if (status) filters.status = status; // Only filter by status if provided

    // Sorting and pagination
    const sortField = sort;
    const sortOrder = order === 'asc' ? 1 : -1;

    const listings = await Listing.find(filters)
      .sort({ [sortField]: sortOrder })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

// Get listing statistics for back office dashboard
export const getListingStatistics = async (req, res, next) => {
  try {
    const { timeframe = '30' } = req.query; // Default to last 30 days
    
    // Calculate date for timeframe filtering
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

    // Get all listings
    const allListings = await Listing.find({});
    
    // Get recent listings for trend calculation
    const recentListings = await Listing.find({
      createdAt: { $gte: daysAgo }
    });

    // Calculate basic metrics
    const totalListings = allListings.length;
    const totalValue = allListings.reduce((sum, listing) => sum + (listing.price || 0), 0);
    const totalCadreRevenue = allListings.reduce((sum, listing) => sum + (listing.cadreProfit || 0), 0);
    const averagePrice = totalListings > 0 ? totalValue / totalListings : 0;

    // Status distribution
    const statusDistribution = allListings.reduce((acc, listing) => {
      const status = listing.status || 'Pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Active vs Inactive (Active = For Sale only)
    const activeCount = allListings.filter(listing => listing.status === 'For Sale').length;
    const inactiveCount = totalListings - activeCount;

    // Category distribution
    const categoryDistribution = allListings.reduce((acc, listing) => {
      const type = listing.type || 'Other';
      if (!acc[type]) {
        acc[type] = { count: 0, totalValue: 0, avgPrice: 0 };
      }
      acc[type].count += 1;
      acc[type].totalValue += listing.price || 0;
      acc[type].avgPrice = acc[type].totalValue / acc[type].count;
      return acc;
    }, {});

    // Geographic distribution
    const geoDistribution = allListings.reduce((acc, listing) => {
      const city = listing.city || 'Unknown';
      if (!acc[city]) {
        acc[city] = { count: 0, districts: {} };
      }
      acc[city].count += 1;
      
      if (listing.district) {
        acc[city].districts[listing.district] = (acc[city].districts[listing.district] || 0) + 1;
      }
      return acc;
    }, {});

    // Listing type performance
    const listingTypeStats = allListings.reduce((acc, listing) => {
      const type = listing.listingType || 'unique';
      if (!acc[type]) {
        acc[type] = { count: 0, totalValue: 0, avgPrice: 0, totalQuantity: 0, soldQuantity: 0 };
      }
      acc[type].count += 1;
      acc[type].totalValue += listing.price || 0;
      acc[type].avgPrice = acc[type].totalValue / acc[type].count;
      acc[type].totalQuantity += listing.currentQuantity || 0;
      acc[type].soldQuantity += listing.soldQuantity || 0;
      return acc;
    }, {});

    // Service requests
    const serviceRequests = allListings.filter(listing => listing.cadremarketsService === true);
    const serviceRequestsCount = serviceRequests.length;
    const serviceRequestsPercentage = totalListings > 0 ? (serviceRequestsCount / totalListings) * 100 : 0;

    // Price ranges
    const priceRanges = allListings.reduce((acc, listing) => {
      const price = listing.price || 0;
      if (price >= 1000 && price < 5000) acc['1K-5K EGP'] += 1;
      else if (price >= 5000 && price < 10000) acc['5K-10K EGP'] += 1;
      else if (price >= 10000 && price < 25000) acc['10K-25K EGP'] += 1;
      else if (price >= 25000) acc['25K+ EGP'] += 1;
      return acc;
    }, {
      '1K-5K EGP': 0,
      '5K-10K EGP': 0,
      '10K-25K EGP': 0,
      '25K+ EGP': 0
    });

    // Recent activity trends
    const previousPeriodStart = new Date(daysAgo);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(timeframe));
    
    const previousPeriodListings = await Listing.find({
      createdAt: { $gte: previousPeriodStart, $lt: daysAgo }
    });

    const previousTotalListings = previousPeriodListings.length;
    const listingGrowth = previousTotalListings > 0 
      ? ((recentListings.length - previousTotalListings) / previousTotalListings) * 100 
      : 0;

    const previousTotalValue = previousPeriodListings.reduce((sum, listing) => sum + (listing.price || 0), 0);
    const recentTotalValue = recentListings.reduce((sum, listing) => sum + (listing.price || 0), 0);
    const valueGrowth = previousTotalValue > 0
      ? ((recentTotalValue - previousTotalValue) / previousTotalValue) * 100
      : 0;

    // Inventory alerts (for stock items)
    const lowStockItems = allListings.filter(listing => 
      listing.listingType === 'stock' && listing.currentQuantity < 5 && listing.currentQuantity > 0
    );
    const outOfStockItems = allListings.filter(listing => 
      listing.listingType === 'stock' && listing.currentQuantity === 0
    );

    const statistics = {
      overview: {
        totalListings,
        totalValue,
        totalCadreRevenue,
        averagePrice,
        activeCount,
        inactiveCount,
        activePercentage: totalListings > 0 ? (activeCount / totalListings) * 100 : 0
      },
      trends: {
        listingGrowth: {
          value: listingGrowth,
          direction: listingGrowth > 0 ? 'up' : listingGrowth < 0 ? 'down' : 'neutral',
          period: `${timeframe} days`
        },
        valueGrowth: {
          value: valueGrowth,
          direction: valueGrowth > 0 ? 'up' : valueGrowth < 0 ? 'down' : 'neutral',
          period: `${timeframe} days`
        }
      },
      distributions: {
        status: statusDistribution,
        category: categoryDistribution,
        geographic: geoDistribution,
        listingType: listingTypeStats,
        priceRanges
      },
      services: {
        requestsCount: serviceRequestsCount,
        requestsPercentage: serviceRequestsPercentage,
        revenue: serviceRequests.reduce((sum, listing) => sum + (listing.cadreProfit || 0), 0)
      },
      inventory: {
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        lowStockItems: lowStockItems.map(item => ({
          id: item._id,
          name: item.name,
          currentQuantity: item.currentQuantity
        }))
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