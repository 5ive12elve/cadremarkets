import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import Listing from '../models/listing.model.js';
import Order from '../models/order.model.js';

export const test = (req, res) => {
  console.log('=== TEST ENDPOINT DEBUG ===');
  console.log('Request headers:', req.headers);
  console.log('Request cookies:', req.cookies);
  console.log('Authorization header:', req.headers.authorization);
  
  res.json({
    message: 'Api route is working!',
    headers: req.headers,
    cookies: req.cookies,
    authorization: req.headers.authorization ? 'Present' : 'Missing'
  });
};

export const testAuth = (req, res) => {
  console.log('=== AUTH TEST DEBUG ===');
  console.log('Request cookies:', req.cookies);
  console.log('Request headers:', req.headers);
  console.log('User object:', req.user);
  
  res.json({
    success: true,
    message: 'Authentication successful',
    user: req.user,
    timestamp: new Date().toISOString(),
    cookies: req.cookies,
    hasAccessToken: !!req.cookies.access_token,
    hasAuthHeader: !!req.headers.authorization,
    authHeaderValue: req.headers.authorization ? req.headers.authorization.substring(0, 30) + '...' : 'None'
  });
};

// Get current user profile
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(errorHandler(404, 'User not found!'));
    
    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// Update user role (admin only)
export const updateUserRole = async (req, res, next) => {
  try {
    // Check if requester is admin and has proper back office access
    if (!req.user.role || req.user.role !== 'admin' || req.user.tokenType !== 'backoffice') {
      return next(errorHandler(403, 'Only back office admins can update user roles'));
    }

    const { role } = req.body;
    if (!['user', 'admin', 'moderator'].includes(role)) {
      return next(errorHandler(400, 'Invalid role specified'));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) return next(errorHandler(404, 'User not found'));

    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// Ban/Unban user (admin only)
export const updateUserStatus = async (req, res, next) => {
  try {
    if (!req.user.role || req.user.role !== 'admin' || req.user.tokenType !== 'backoffice') {
      return next(errorHandler(403, 'Only back office admins can ban/unban users'));
    }

    const { status } = req.body;
    if (!['active', 'banned'].includes(status)) {
      return next(errorHandler(400, 'Invalid status specified'));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!user) return next(errorHandler(404, 'User not found'));

    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// Get user statistics
export const getUserStats = async (req, res, next) => {
  try {
    // Check if user is admin or requesting their own stats
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return next(errorHandler(403, 'You can only view your own statistics'));
    }

    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, 'User not found'));

    // Get listings count
    const listingsCount = await Listing.countDocuments({ userRef: req.params.id });
    
    // Get active listings count
    const activeListingsCount = await Listing.countDocuments({ 
      userRef: req.params.id,
      status: 'For Sale'
    });

    // Get sold listings count
    const soldListingsCount = await Listing.countDocuments({ 
      userRef: req.params.id,
      status: 'Sold'
    });

    res.status(200).json({
      totalListings: listingsCount,
      activeListings: activeListingsCount,
      soldListings: soldListingsCount,
      joinedDate: user.createdAt,
      lastActive: user.lastActive || user.updatedAt
    });
  } catch (error) {
    next(error);
  }
};

// Update user email preferences
export const updateEmailPreferences = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      return next(errorHandler(403, 'You can only update your own preferences'));
    }

    const { emailPreferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { emailPreferences },
      { new: true }
    );

    if (!user) return next(errorHandler(404, 'User not found'));

    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// Update user notification settings
export const updateNotificationSettings = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      return next(errorHandler(403, 'You can only update your own settings'));
    }

    const { notificationSettings } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { notificationSettings },
      { new: true }
    );

    if (!user) return next(errorHandler(404, 'User not found'));

    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only update your own account!'));
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    // Check if this is a back office admin (from BackOfficeUser collection)
    if (req.user.tokenType === 'backoffice' && req.user.role === 'admin') {
      // Back office admin can delete any regular user account
      await User.findByIdAndDelete(req.params.id);
      return res.status(200).json('User has been deleted!');
    }
    
    // For regular users (from User collection), they can only delete their own account
    if (req.user.id !== req.params.id) {
      return next(errorHandler(401, 'You can only delete your own account!'));
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json('User has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  console.log('=== GET USER LISTINGS DEBUG ===');
  console.log('Requested user ID:', req.params.id);
  console.log('Authenticated user ID:', req.user.id);
  console.log('User IDs match:', req.user.id === req.params.id);
  console.log('User object:', req.user);
  
  // Validate user ID format
  if (!req.params.id || req.params.id.length !== 24) {
    console.log('Invalid user ID format:', req.params.id);
    return next(errorHandler(400, 'Invalid user ID format'));
  }
  
  // Check if user is requesting their own listings
  if (req.user.id === req.params.id) {
    try {
      console.log('Fetching listings for user:', req.params.id);
      const listings = await Listing.find({ userRef: req.params.id });
      console.log('Found listings count:', listings.length);
      res.status(200).json(listings);
    } catch (error) {
      console.error('Error fetching listings:', error);
      next(error);
    }
  } else {
    console.log('User ID mismatch - access denied');
    console.log('Requested:', req.params.id);
    console.log('Authenticated:', req.user.id);
    return next(errorHandler(401, 'You can only view your own listings!'));
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
  
    if (!user) return next(errorHandler(404, 'User not found!'));
  
    const { password: pass, ...rest } = user._doc;
  
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    // Only back office admins can view all users
    if (!req.user.role || req.user.role !== 'admin' || req.user.tokenType !== 'backoffice') {
      return next(errorHandler(403, 'Only back office admins can view all users'));
    }
    const users = await User.find({}, { password: 0 }); // Exclude password for security

    // Fetch the number of listings for each user
    const usersWithListings = await Promise.all(users.map(async (user) => {
      const listingCount = await Listing.countDocuments({ userRef: user._id });
      return { ...user._doc, listingCount };
    }));

    res.status(200).json(usersWithListings);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error retrieving users' });
  }
};

// Get comprehensive user statistics for back office dashboard
export const getUserStatistics = async (req, res, next) => {
  try {
    // Verify this is a back office user with proper permissions
    if (!req.user.role || !['admin', 'moderator'].includes(req.user.role)) {
      return next(errorHandler(403, 'Back office access required with admin or moderator role'));
    }

    const { timeframe = '30' } = req.query; // Default to last 30 days
    
    // Calculate date for timeframe filtering
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

    // Get all users
    const allUsers = await User.find({});
    
    // Get recent users for trend calculation
    const recentUsers = await User.find({
      createdAt: { $gte: daysAgo }
    });

    // Calculate basic metrics
    const totalUsers = allUsers.length;

    // Role distribution
    const roleDistribution = allUsers.reduce((acc, user) => {
      const role = user.role || 'user';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    // Status distribution (active vs banned)
    const statusDistribution = allUsers.reduce((acc, user) => {
      const status = user.status || 'active';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const activeUsers = allUsers.filter(user => user.status === 'active').length;
    const bannedUsers = allUsers.filter(user => user.status === 'banned').length;

    // Activity analysis (based on lastActive)
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeLastWeek = allUsers.filter(user => 
      user.lastActive && new Date(user.lastActive) > lastWeek
    ).length;

    const activeLastMonth = allUsers.filter(user => 
      user.lastActive && new Date(user.lastActive) > lastMonth
    ).length;

    // Get all listings for user analysis
    const allListings = await Listing.find({});
    
    // Users with listings (artists)
    const usersWithListings = [...new Set(allListings.map(listing => listing.userRef.toString()))];
    const artistCount = usersWithListings.length;

    // Listing statistics per user
    const listingStats = allListings.reduce((acc, listing) => {
      const userId = listing.userRef.toString();
      if (!acc[userId]) {
        acc[userId] = { total: 0, active: 0, sold: 0, pending: 0 };
      }
      acc[userId].total += 1;
      if (listing.status === 'For Sale') acc[userId].active += 1;
      else if (listing.status === 'Sold') acc[userId].sold += 1;
      else if (listing.status === 'Pending') acc[userId].pending += 1;
      return acc;
    }, {});

    // Top performing artists
    const topArtists = Object.entries(listingStats)
      .map(([userId, stats]) => ({
        userId,
        ...stats,
        user: allUsers.find(u => u._id.toString() === userId)
      }))
      .filter(artist => artist.user)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Get order data for purchase analysis
    const allOrders = await Order.find({});
    
    // Users who made purchases
    const buyerIds = [...new Set(allOrders.map(order => order.userId.toString()))];
    const buyerCount = buyerIds.length;

    // Purchase behavior analysis
    const purchaseStats = allOrders.reduce((acc, order) => {
      const userId = order.userId.toString();
      if (!acc[userId]) {
        acc[userId] = { orderCount: 0, totalSpent: 0, averageOrder: 0 };
      }
      acc[userId].orderCount += 1;
      acc[userId].totalSpent += order.totalAmount || 0;
      return acc;
    }, {});

    // Calculate average order value per user
    Object.keys(purchaseStats).forEach(userId => {
      const stats = purchaseStats[userId];
      stats.averageOrder = stats.orderCount > 0 ? stats.totalSpent / stats.orderCount : 0;
    });

    // Recent activity trends
    const previousPeriodStart = new Date(daysAgo);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(timeframe));
    
    const previousPeriodUsers = await User.find({
      createdAt: { $gte: previousPeriodStart, $lt: daysAgo }
    });

    const previousTotalUsers = previousPeriodUsers.length;
    const userGrowth = previousTotalUsers > 0 
      ? ((recentUsers.length - previousTotalUsers) / previousTotalUsers) * 100 
      : 0;

    // Monthly user registration (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthUsers = allUsers.filter(user => {
        const userDate = new Date(user.createdAt);
        return userDate >= monthStart && userDate < monthEnd;
      });
      
      const monthActiveUsers = monthUsers.filter(user => 
        user.lastActive && new Date(user.lastActive) > monthStart
      );
      
      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        registrations: monthUsers.length,
        activeUsers: monthActiveUsers.length
      });
    }

    // Email preferences analysis
    const emailPreferences = allUsers.reduce((acc, user) => {
      if (user.emailPreferences) {
        acc.marketing += user.emailPreferences.marketing ? 1 : 0;
        acc.notifications += user.emailPreferences.notifications ? 1 : 0;
      }
      return acc;
    }, { marketing: 0, notifications: 0 });

    // User engagement levels
    const engagementLevels = {
      high: 0,    // Users with listings and recent activity
      medium: 0,  // Users with either listings or recent activity
      low: 0      // Users with minimal activity
    };

    allUsers.forEach(user => {
      const hasListings = usersWithListings.includes(user._id.toString());
      const recentlyActive = user.lastActive && new Date(user.lastActive) > lastMonth;
      
      if (hasListings && recentlyActive) {
        engagementLevels.high += 1;
      } else if (hasListings || recentlyActive) {
        engagementLevels.medium += 1;
      } else {
        engagementLevels.low += 1;
      }
    });

    const statistics = {
      overview: {
        totalUsers,
        activeUsers,
        bannedUsers,
        artistCount,
        buyerCount,
        activePercentage: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        artistPercentage: totalUsers > 0 ? (artistCount / totalUsers) * 100 : 0,
        activeLastWeek,
        activeLastMonth
      },
      trends: {
        userGrowth: {
          value: userGrowth,
          direction: userGrowth > 0 ? 'up' : userGrowth < 0 ? 'down' : 'neutral',
          period: `${timeframe} days`
        }
      },
      distributions: {
        role: roleDistribution,
        status: statusDistribution,
        engagement: engagementLevels
      },
      activity: {
        activeLastWeek,
        activeLastMonth,
        monthlyData,
        emailPreferences
      },
      marketplace: {
        topArtists,
        totalListings: allListings.length,
        totalOrders: allOrders.length,
        averageListingsPerArtist: artistCount > 0 ? (allListings.length / artistCount).toFixed(1) : 0
      },
      performance: {
        engagementRate: totalUsers > 0 ? ((engagementLevels.high + engagementLevels.medium) / totalUsers) * 100 : 0,
        conversionRate: totalUsers > 0 ? (buyerCount / totalUsers) * 100 : 0,
        artistAdoptionRate: totalUsers > 0 ? (artistCount / totalUsers) * 100 : 0
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