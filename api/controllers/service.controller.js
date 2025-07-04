import Service from '../models/service.model.js';
import { errorHandler } from '../utils/error.js';

// Get all services with optional filters
export const getServices = async (req, res, next) => {
  try {
    const { status, serviceType } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;
    
    const services = await Service.find(query).sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    next(error);
  }
};

// Create a new service
export const createService = async (req, res, next) => {
  try {
    const lastService = await Service.findOne().sort({ requestId: -1 });
    const lastId = lastService ? parseInt(lastService.requestId.slice(3)) : 0;
    const requestId = `SRV${String(lastId + 1).padStart(4, '0')}`;

    const service = await Service.create({
      ...req.body,
      requestId
    });

    res.status(201).json(service);
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (let field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Duplicate key error',
        field: Object.keys(error.keyPattern)[0]
      });
    }

    // Log the error for debugging
    console.error('Error creating service:', error);
    
    next(error);
  }
};

// Get service by ID
export const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    next(error);
  }
};

// Update service status
export const updateServiceStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.status = status;
    if (notes) service.notes = notes;
    
    await service.save();
    res.json(service);
  } catch (error) {
    next(error);
  }
};

// Delete service
export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get service statistics for back office dashboard
export const getServiceStatistics = async (req, res, next) => {
  try {
    const { timeframe = '30' } = req.query; // Default to last 30 days
    
    // Calculate date for timeframe filtering
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

    // Get all services
    const allServices = await Service.find({});
    
    // Get recent services for trend calculation
    const recentServices = await Service.find({
      createdAt: { $gte: daysAgo }
    });

    // Calculate basic metrics
    const totalServices = allServices.length;
    const averageValue = totalServices > 0 ? allServices.length / totalServices : 0;

    // Status distribution
    const statusDistribution = allServices.reduce((acc, service) => {
      const status = service.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Active vs Completed (Active = pending + approved)
    const activeStatuses = ['pending', 'approved'];
    const activeCount = allServices.filter(service => activeStatuses.includes(service.status)).length;
    const completedCount = allServices.filter(service => service.status === 'completed').length;
    const rejectedCount = allServices.filter(service => service.status === 'rejected').length;

    // Service type distribution
    const serviceTypeDistribution = allServices.reduce((acc, service) => {
      const type = service.serviceType || 'visual';
      if (!acc[type]) {
        acc[type] = { count: 0, pending: 0, approved: 0, completed: 0, rejected: 0 };
      }
      acc[type].count += 1;
      acc[type][service.status] = (acc[type][service.status] || 0) + 1;
      return acc;
    }, {});

    // Budget analysis
    const budgetRanges = allServices.reduce((acc, service) => {
      const budget = service.budget || 'Not specified';
      acc[budget] = (acc[budget] || 0) + 1;
      return acc;
    }, {});

    // Design stage distribution
    const designStageDistribution = allServices.reduce((acc, service) => {
      const stage = service.designStage || 'concept';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {});

    // Project scope analysis
    const projectScopeDistribution = allServices.reduce((acc, service) => {
      const scope = service.projectScope || 'small';
      acc[scope] = (acc[scope] || 0) + 1;
      return acc;
    }, {});

    // Sub-type analysis by service type
    const subTypeAnalysis = allServices.reduce((acc, service) => {
      const serviceType = service.serviceType || 'visual';
      const subType = service.subType || 'other';
      
      if (!acc[serviceType]) {
        acc[serviceType] = {};
      }
      acc[serviceType][subType] = (acc[serviceType][subType] || 0) + 1;
      return acc;
    }, {});

    // Recent activity trends
    const previousPeriodStart = new Date(daysAgo);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(timeframe));
    
    const previousPeriodServices = await Service.find({
      createdAt: { $gte: previousPeriodStart, $lt: daysAgo }
    });

    const previousTotalServices = previousPeriodServices.length;
    const serviceGrowth = previousTotalServices > 0 
      ? ((recentServices.length - previousTotalServices) / previousTotalServices) * 100 
      : 0;

    // Completion rate over time
    const completedServices = allServices.filter(service => service.status === 'completed');
    const completionRate = totalServices > 0 ? (completedServices.length / totalServices) * 100 : 0;

    // Average response time (for approved/rejected services)
    const processedServices = allServices.filter(service => 
      service.status === 'approved' || service.status === 'rejected' || service.status === 'completed'
    );
    const avgResponseTime = processedServices.length > 0
      ? processedServices.reduce((sum, service) => {
          const responseTime = (new Date(service.updatedAt) - new Date(service.createdAt)) / (1000 * 60 * 60 * 24);
          return sum + responseTime;
        }, 0) / processedServices.length
      : 0;

    // Monthly service requests (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthServices = allServices.filter(service => {
        const serviceDate = new Date(service.createdAt);
        return serviceDate >= monthStart && serviceDate < monthEnd;
      });
      
      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: monthServices.length,
        completed: monthServices.filter(s => s.status === 'completed').length
      });
    }

    // Performance metrics
    const pendingServices = allServices.filter(service => service.status === 'pending');
    const oldestPending = pendingServices.length > 0
      ? Math.max(...pendingServices.map(service => 
          (new Date() - new Date(service.createdAt)) / (1000 * 60 * 60 * 24)
        ))
      : 0;

    const statistics = {
      overview: {
        totalServices,
        activeCount,
        completedCount,
        rejectedCount,
        activePercentage: totalServices > 0 ? (activeCount / totalServices) * 100 : 0,
        completionRate,
        avgResponseTime: avgResponseTime.toFixed(1),
        oldestPending: oldestPending.toFixed(1)
      },
      trends: {
        serviceGrowth: {
          value: serviceGrowth,
          direction: serviceGrowth > 0 ? 'up' : serviceGrowth < 0 ? 'down' : 'neutral',
          period: `${timeframe} days`
        }
      },
      distributions: {
        status: statusDistribution,
        serviceType: serviceTypeDistribution,
        budget: budgetRanges,
        designStage: designStageDistribution,
        projectScope: projectScopeDistribution,
        subTypeAnalysis
      },
      performance: {
        pendingCount: pendingServices.length,
        avgResponseTime,
        oldestPending,
        monthlyData
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