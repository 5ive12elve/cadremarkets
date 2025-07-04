import express from 'express';
import {
  createSupportRequest,
  getSupportRequests,
  getSupportRequestById,
  updateSupportRequest,
  deleteSupportRequest,
  getSupportStats,
  getSupportRequestStatistics
} from '../controllers/supportRequest.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { verifyBackOfficeToken } from '../utils/verifyBackOfficeUser.js';
import { errorHandler } from '../utils/error.js';

const router = express.Router();

/**
 * @swagger
 * /api/support:
 *   post:
 *     tags:
 *       - Support Requests
 *     summary: Create a new support request
 *     description: Submit a new support request (public endpoint)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Full name of the person submitting the request
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Contact email address
 *               phoneNumber:
 *                 type: string
 *                 description: Contact phone number (optional)
 *               subject:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 description: Subject of the support request
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 description: Detailed message describing the issue or request
 *               category:
 *                 type: string
 *                 enum: [technical, billing, general, account, bug_report, feature_request]
 *                 default: general
 *                 description: Category of the support request
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *                 description: Priority level of the request
 *     responses:
 *       201:
 *         description: Support request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportRequest'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 *   get:
 *     tags:
 *       - Support Requests
 *     summary: Get all support requests
 *     description: Retrieve all support requests (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in_progress, resolved, closed]
 *         description: Filter by request status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [technical, billing, general, account, bug_report, feature_request]
 *         description: Filter by request category
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority level
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of requests per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, priority, status]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Successfully retrieved support requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SupportRequest'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalRequests:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/', createSupportRequest);
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
}, getSupportRequests);

/**
 * @swagger
 * /api/support/stats:
 *   get:
 *     tags:
 *       - Support Requests
 *     summary: Get support request statistics
 *     description: Get comprehensive statistics about support requests (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *         description: Time period for statistics
 *     responses:
 *       200:
 *         description: Successfully retrieved support statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRequests:
 *                   type: integer
 *                   description: Total number of support requests
 *                 openRequests:
 *                   type: integer
 *                   description: Number of open requests
 *                 resolvedRequests:
 *                   type: integer
 *                   description: Number of resolved requests
 *                 averageResponseTime:
 *                   type: number
 *                   description: Average response time in hours
 *                 averageResolutionTime:
 *                   type: number
 *                   description: Average resolution time in hours
 *                 requestsByCategory:
 *                   type: object
 *                   properties:
 *                     technical:
 *                       type: integer
 *                     billing:
 *                       type: integer
 *                     general:
 *                       type: integer
 *                     account:
 *                       type: integer
 *                     bug_report:
 *                       type: integer
 *                     feature_request:
 *                       type: integer
 *                 requestsByPriority:
 *                   type: object
 *                   properties:
 *                     low:
 *                       type: integer
 *                     medium:
 *                       type: integer
 *                     high:
 *                       type: integer
 *                     urgent:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
// Note: This route supports both regular user access and back office admin access
router.get('/stats', (req, res, next) => {
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
}, getSupportStats);

/**
 * @swagger
 * /api/support/backoffice/statistics:
 *   get:
 *     summary: Get comprehensive support request statistics for back office dashboard
 *     tags: [Support Requests]
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
 *         description: Returns comprehensive support request statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overview:
 *                   type: object
 *                   properties:
 *                     totalRequests:
 *                       type: number
 *                     activeCount:
 *                       type: number
 *                     resolvedCount:
 *                       type: number
 *                     resolutionRate:
 *                       type: number
 *                     avgResponseTime:
 *                       type: number
 *                 distributions:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: object
 *                     type:
 *                       type: object
 *                     priority:
 *                       type: object
 *                     category:
 *                       type: object
 *                 performance:
 *                   type: object
 *                   properties:
 *                     urgentCount:
 *                       type: number
 *                     oldestNew:
 *                       type: number
 *                 trends:
 *                   type: object
 *                   properties:
 *                     requestGrowth:
 *                       type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/backoffice/statistics', verifyBackOfficeToken, getSupportRequestStatistics);

/**
 * @swagger
 * /api/support/{id}:
 *   get:
 *     tags:
 *       - Support Requests
 *     summary: Get support request by ID
 *     description: Retrieve a specific support request by ID (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Support request ID
 *     responses:
 *       200:
 *         description: Successfully retrieved support request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportRequest'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Support request not found
 *   put:
 *     tags:
 *       - Support Requests
 *     summary: Update support request
 *     description: Update a support request (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Support request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, in_progress, resolved, closed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               assignedTo:
 *                 type: string
 *                 description: ID of the admin/support agent assigned to this request
 *               adminNotes:
 *                 type: string
 *                 description: Internal notes from admin/support team
 *               resolution:
 *                 type: string
 *                 description: Resolution details (for resolved/closed requests)
 *     responses:
 *       200:
 *         description: Support request updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportRequest'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Support request not found
 *   delete:
 *     tags:
 *       - Support Requests
 *     summary: Delete support request
 *     description: Delete a support request (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Support request ID
 *     responses:
 *       200:
 *         description: Support request deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Support request not found
 */
// Note: These routes support both regular user access and back office admin access
router.get('/:id', (req, res, next) => {
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
}, getSupportRequestById);

router.put('/:id', (req, res, next) => {
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
}, updateSupportRequest);

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
}, deleteSupportRequest);

export default router; 