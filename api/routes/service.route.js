import express from 'express';
import {
  getServices,
  createService,
  getServiceById,
  updateServiceStatus,
  deleteService,
  getServiceStatistics
} from '../controllers/service.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { verifyBackOfficeToken } from '../utils/verifyBackOfficeUser.js';
import { errorHandler } from '../utils/error.js';

const router = express.Router();

/**
 * @swagger
 * /api/services:
 *   get:
 *     tags:
 *       - Services
 *     summary: Get all services
 *     description: Retrieve all service requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, completed]
 *         description: Filter by status
 *       - in: query
 *         name: serviceType
 *         schema:
 *           type: string
 *           enum: [visual, ad, sound]
 *         description: Filter by service type
 *     responses:
 *       200:
 *         description: List of service requests retrieved successfully
 *       401:
 *         description: Unauthorized
 */
// Note: This route supports both regular user access and back office admin access
router.get('/', (req, res, next) => {
  // Check if this is a back office request
  const backofficeToken = req.cookies.backoffice_token;
  const accessToken = req.cookies.access_token;
  
  if (backofficeToken) {
    // Use back office authentication for admin access
    verifyBackOfficeToken(req, res, next);
  } else if (accessToken) {
    // Use regular user authentication
    verifyToken(req, res, next);
  } else {
    return next(errorHandler(401, 'Unauthorized'));
  }
}, getServices);

/**
 * @swagger
 * /api/services:
 *   post:
 *     tags:
 *       - Services
 *     summary: Create a new service request
 *     description: Submit a new service request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requesterName
 *               - phoneNumber
 *               - email
 *               - serviceType
 *               - subType
 *               - budget
 *               - designStage
 *               - projectScope
 *             properties:
 *               requesterName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *               serviceType:
 *                 type: string
 *                 enum: [visual, ad, sound]
 *               subType:
 *                 type: string
 *               budget:
 *                 type: string
 *               designStage:
 *                 type: string
 *               projectScope:
 *                 type: string
 *               details:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service request created successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/', createService);

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     tags:
 *       - Services
 *     summary: Get a service request by ID
 *     description: Retrieve a specific service request by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service request ID
 *     responses:
 *       200:
 *         description: Service request retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Service request not found
 */
router.get('/:id', verifyToken, getServiceById);

/**
 * @swagger
 * /api/services/{id}/status:
 *   put:
 *     tags:
 *       - Services
 *     summary: Update service request status
 *     description: Update the status of a service request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected, completed]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service request status updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Service request not found
 */
// Note: This route supports both regular user access and back office admin access
router.put('/:id/status', (req, res, next) => {
  // Check if this is a back office request
  const backofficeToken = req.cookies.backoffice_token;
  const accessToken = req.cookies.access_token;
  
  if (backofficeToken) {
    // Use back office authentication for admin access
    verifyBackOfficeToken(req, res, next);
  } else if (accessToken) {
    // Use regular user authentication
    verifyToken(req, res, next);
  } else {
    return next(errorHandler(401, 'Unauthorized'));
  }
}, updateServiceStatus);

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     tags:
 *       - Services
 *     summary: Delete a service request
 *     description: Delete a service request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service request ID
 *     responses:
 *       200:
 *         description: Service request deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Service request not found
 */
// Note: This route supports both regular user access and back office admin access
router.delete('/:id', (req, res, next) => {
  // Check if this is a back office request
  const backofficeToken = req.cookies.backoffice_token;
  const accessToken = req.cookies.access_token;
  
  if (backofficeToken) {
    // Use back office authentication for admin access
    verifyBackOfficeToken(req, res, next);
  } else if (accessToken) {
    // Use regular user authentication
    verifyToken(req, res, next);
  } else {
    return next(errorHandler(401, 'Unauthorized'));
  }
}, deleteService);

/**
 * @swagger
 * /api/services/backoffice/statistics:
 *   get:
 *     summary: Get service statistics for back office dashboard
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days for trend calculation
 *     responses:
 *       200:
 *         description: Returns comprehensive service statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overview:
 *                   type: object
 *                   properties:
 *                     totalServices:
 *                       type: number
 *                     activeCount:
 *                       type: number
 *                     completedCount:
 *                       type: number
 *                     rejectedCount:
 *                       type: number
 *                     activePercentage:
 *                       type: number
 *                     completionRate:
 *                       type: number
 *                 distributions:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: object
 *                     serviceType:
 *                       type: object
 *                     budget:
 *                       type: object
 *                     designStage:
 *                       type: object
 *                 performance:
 *                   type: object
 *                   properties:
 *                     pendingCount:
 *                       type: number
 *                     avgResponseTime:
 *                       type: number
 *                     oldestPending:
 *                       type: number
 *                 trends:
 *                   type: object
 *                   properties:
 *                     serviceGrowth:
 *                       type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/backoffice/statistics', verifyBackOfficeToken, getServiceStatistics);

export default router; 