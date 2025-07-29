import SupportRequest from '../models/supportRequest.model.js';
import { sendContactMessageEmail } from '../utils/emailService.js';

// Create a new support request
export const createSupportRequest = async (req, res) => {
  try {
    const newRequest = new SupportRequest(req.body);
    await newRequest.save();

    // Send email notification for new contact message
    try {
      const emailResult = await sendContactMessageEmail(newRequest);
      if (emailResult.success) {
        console.log('Contact message notification email sent successfully');
      } else {
        console.error('Failed to send contact message notification email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Error sending contact message notification email:', emailError);
      // Don't fail the contact creation if email fails
    }

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all support requests with filtering
export const getSupportRequests = async (req, res) => {
  try {
    const {
      type,
      status,
      priority,
      category,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { orderNumber: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await SupportRequest.countDocuments(filter);

    // Get requests with pagination and sorting
    const requests = await SupportRequest.find(filter)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      requests,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single support request by ID
export const getSupportRequestById = async (req, res) => {
  try {
    const request = await SupportRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a support request
export const updateSupportRequest = async (req, res) => {
  try {
    const updatedRequest = await SupportRequest.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a support request
export const deleteSupportRequest = async (req, res) => {
  try {
    const deletedRequest = await SupportRequest.findByIdAndDelete(req.params.id);
    if (!deletedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get support request statistics
export const getSupportStats = async (req, res) => {
  try {
    const stats = await SupportRequest.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          newRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          closed: {
            $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
          },
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]);

    const categoryStats = await SupportRequest.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      overview: stats[0] || {
        total: 0,
        newRequests: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        avgResponseTime: 0
      },
      byCategory: categoryStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get comprehensive support request statistics for back office dashboard
export const getSupportRequestStatistics = async (req, res, next) => {
  try {
    const { timeframe = '30' } = req.query; // Default to last 30 days
    
    // Calculate date for timeframe filtering
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

    // Get all support requests
    const allRequests = await SupportRequest.find({});
    
    // Get recent requests for trend calculation
    const recentRequests = await SupportRequest.find({
      createdAt: { $gte: daysAgo }
    });

    // Calculate basic metrics
    const totalRequests = allRequests.length;

    // Status distribution
    const statusDistribution = allRequests.reduce((acc, request) => {
      const status = request.status || 'new';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Active vs Resolved (Active = new + in-progress)
    const activeStatuses = ['new', 'in-progress'];
    const activeCount = allRequests.filter(request => activeStatuses.includes(request.status)).length;
    const resolvedCount = allRequests.filter(request => request.status === 'resolved').length;
    const closedCount = allRequests.filter(request => request.status === 'closed').length;

    // Type distribution (support vs contact)
    const typeDistribution = allRequests.reduce((acc, request) => {
      const type = request.type || 'support';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Priority distribution
    const priorityDistribution = allRequests.reduce((acc, request) => {
      const priority = request.priority || 'normal';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    // Category distribution
    const categoryDistribution = allRequests.reduce((acc, request) => {
      const category = request.category || 'general';
      if (!acc[category]) {
        acc[category] = { count: 0, new: 0, inProgress: 0, resolved: 0, closed: 0 };
      }
      acc[category].count += 1;
      acc[category][request.status.replace('-', '')] = (acc[category][request.status.replace('-', '')] || 0) + 1;
      return acc;
    }, {});

    // Issue type analysis (for support requests)
    const issueDistribution = allRequests
      .filter(req => req.type === 'support' && req.specificIssue)
      .reduce((acc, request) => {
        const issue = request.specificIssue;
        acc[issue] = (acc[issue] || 0) + 1;
        return acc;
      }, {});

    // Recent activity trends
    const previousPeriodStart = new Date(daysAgo);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(timeframe));
    
    const previousPeriodRequests = await SupportRequest.find({
      createdAt: { $gte: previousPeriodStart, $lt: daysAgo }
    });

    const previousTotalRequests = previousPeriodRequests.length;
    const requestGrowth = previousTotalRequests > 0 
      ? ((recentRequests.length - previousTotalRequests) / previousTotalRequests) * 100 
      : 0;

    // Resolution rate
    const resolvedRequests = allRequests.filter(request => 
      request.status === 'resolved' || request.status === 'closed'
    );
    const resolutionRate = totalRequests > 0 ? (resolvedRequests.length / totalRequests) * 100 : 0;

    // Average response time (for processed requests)
    const processedRequests = allRequests.filter(request => 
      request.status === 'in-progress' || request.status === 'resolved' || request.status === 'closed'
    );
    const avgResponseTime = processedRequests.length > 0
      ? processedRequests.reduce((sum, request) => {
          const responseTime = (new Date(request.updatedAt) - new Date(request.createdAt)) / (1000 * 60 * 60 * 24);
          return sum + responseTime;
        }, 0) / processedRequests.length
      : 0;

    // Monthly support requests (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthRequests = allRequests.filter(request => {
        const requestDate = new Date(request.createdAt);
        return requestDate >= monthStart && requestDate < monthEnd;
      });
      
      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: monthRequests.length,
        resolved: monthRequests.filter(r => r.status === 'resolved' || r.status === 'closed').length
      });
    }

    // Performance metrics
    const newRequests = allRequests.filter(request => request.status === 'new');
    const oldestNew = newRequests.length > 0
      ? Math.max(...newRequests.map(request => 
          (new Date() - new Date(request.createdAt)) / (1000 * 60 * 60 * 24)
        ))
      : 0;

    // High priority requests
    const highPriorityRequests = allRequests.filter(request => request.priority === 'high');
    const urgentCount = highPriorityRequests.length;

    // Assigned vs Unassigned
    const assignedRequests = allRequests.filter(request => request.assignedTo);
    const unassignedRequests = allRequests.filter(request => !request.assignedTo);

    // Contact form vs Support requests breakdown
    const contactFormRequests = allRequests.filter(request => request.type === 'contact');
    const supportRequests = allRequests.filter(request => request.type === 'support');

    const statistics = {
      overview: {
        totalRequests,
        activeCount,
        resolvedCount,
        closedCount,
        activePercentage: totalRequests > 0 ? (activeCount / totalRequests) * 100 : 0,
        resolutionRate,
        avgResponseTime: avgResponseTime.toFixed(1),
        oldestNew: oldestNew.toFixed(1),
        urgentCount,
        assignedCount: assignedRequests.length,
        unassignedCount: unassignedRequests.length
      },
      trends: {
        requestGrowth: {
          value: requestGrowth,
          direction: requestGrowth > 0 ? 'up' : requestGrowth < 0 ? 'down' : 'neutral',
          period: `${timeframe} days`
        }
      },
      distributions: {
        status: statusDistribution,
        type: typeDistribution,
        priority: priorityDistribution,
        category: categoryDistribution,
        issues: issueDistribution
      },
      breakdown: {
        contactFormRequests: contactFormRequests.length,
        supportRequests: supportRequests.length,
        contactFormPercentage: totalRequests > 0 ? (contactFormRequests.length / totalRequests) * 100 : 0,
        supportPercentage: totalRequests > 0 ? (supportRequests.length / totalRequests) * 100 : 0
      },
      performance: {
        newCount: newRequests.length,
        avgResponseTime,
        oldestNew,
        monthlyData,
        urgentCount,
        assignedPercentage: totalRequests > 0 ? (assignedRequests.length / totalRequests) * 100 : 0
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