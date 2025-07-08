import express from 'express';
import { 
  test, 
  testAuth,
  updateUser, 
  deleteUser, 
  getUserListings,
  getUser,
  getAllUsers,
  updatePassword,
  getCurrentUser,
  updateUserRole,
  updateUserStatus,
  getUserStats,
  updateEmailPreferences,
  updateNotificationSettings,
  getUserStatistics
} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { verifyBackOfficeToken } from '../utils/verifyBackOfficeUser.js';
import { errorHandler } from '../utils/error.js';

const router = express.Router();

/**
 * @swagger
 * /api/user/test:
 *   get:
 *     tags:
 *       - User
 *     summary: Test user endpoint
 *     description: Test endpoint to verify user route functionality
 *     responses:
 *       200:
 *         description: Test successful
 */
router.get('/test', test);

/**
 * @swagger
 * /api/user/auth-test:
 *   get:
 *     tags:
 *       - User
 *     summary: Test authentication
 *     description: Test endpoint to verify authentication is working
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authentication successful
 *       401:
 *         description: Authentication failed
 */
router.get('/auth-test', verifyToken, testAuth);

/**
 * @swagger
 * /api/user/update/{id}:
 *   post:
 *     tags:
 *       - User
 *     summary: Update user
 *     description: Update user information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post('/update/:id', verifyToken, updateUser);

/**
 * @swagger
 * /api/user/delete/{id}:
 *   delete:
 *     tags:
 *       - User
 *     summary: Delete user
 *     description: Delete user account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
// Note: This route supports both regular user self-deletion and back office admin deletion
// The controller handles authentication type detection
router.delete('/delete/:id', (req, res, next) => {
  // Check if this is a back office request
  const backofficeToken = req.cookies.backoffice_token;
  const accessToken = req.cookies.access_token;
  
  if (backofficeToken) {
    // Use back office authentication
    verifyBackOfficeToken(req, res, next);
  } else if (accessToken) {
    // Use regular user authentication
    verifyToken(req, res, next);
  } else {
    return next(errorHandler(401, 'Unauthorized'));
  }
}, deleteUser);

/**
 * @swagger
 * /api/user/listings/{id}:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user listings
 *     description: Get all listings for a specific user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successfully retrieved user listings
 *       404:
 *         description: User not found
 */
router.get('/listings/:id', verifyToken, getUserListings);

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user
 *     description: Get user information by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
 *       404:
 *         description: User not found
 */
router.get('/:id', verifyToken, getUser);

/**
 * @swagger
 * /api/user/password/{id}:
 *   put:
 *     tags:
 *       - User
 *     summary: Update user password
 *     description: Update password for a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid current password
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put('/password/:id', verifyToken, updatePassword);

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     tags:
 *       - User
 *     summary: Get current user profile
 *     description: Get the current authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', verifyToken, getCurrentUser);

/**
 * @swagger
 * /api/user:
 *   get:
 *     tags:
 *       - User
 *     summary: Get all users
 *     description: Get all users (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for username or email
 *     responses:
 *       200:
 *         description: Successfully retrieved users list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalUsers:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/', verifyBackOfficeToken, getAllUsers);

/**
 * @swagger
 * /api/user/{id}/role:
 *   put:
 *     tags:
 *       - User
 *     summary: Update user role
 *     description: Update user role (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin, moderator]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */
router.put('/:id/role', verifyBackOfficeToken, updateUserRole);

/**
 * @swagger
 * /api/user/{id}/status:
 *   put:
 *     tags:
 *       - User
 *     summary: Update user status
 *     description: Update user status (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
 *                 enum: [active, inactive, suspended, banned]
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */
router.put('/:id/status', verifyBackOfficeToken, updateUserStatus);

/**
 * @swagger
 * /api/user/{id}/stats:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user statistics
 *     description: Get comprehensive statistics for a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successfully retrieved user statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalListings:
 *                   type: integer
 *                 activeListings:
 *                   type: integer
 *                 soldListings:
 *                   type: integer
 *                 totalSales:
 *                   type: number
 *                 totalRevenue:
 *                   type: number
 *                 averageRating:
 *                   type: number
 *                 totalReviews:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/:id/stats', verifyToken, getUserStats);

/**
 * @swagger
 * /api/user/{id}/email-preferences:
 *   put:
 *     tags:
 *       - User
 *     summary: Update email preferences
 *     description: Update user's email notification preferences
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               marketing:
 *                 type: boolean
 *                 description: Receive marketing emails
 *               orderUpdates:
 *                 type: boolean
 *                 description: Receive order update emails
 *               promotions:
 *                 type: boolean
 *                 description: Receive promotional emails
 *               newsletter:
 *                 type: boolean
 *                 description: Receive newsletter emails
 *     responses:
 *       200:
 *         description: Email preferences updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put('/:id/email-preferences', verifyToken, updateEmailPreferences);

/**
 * @swagger
 * /api/user/{id}/notification-settings:
 *   put:
 *     tags:
 *       - User
 *     summary: Update notification settings
 *     description: Update user's notification settings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pushNotifications:
 *                 type: boolean
 *                 description: Enable push notifications
 *               emailNotifications:
 *                 type: boolean
 *                 description: Enable email notifications
 *               smsNotifications:
 *                 type: boolean
 *                 description: Enable SMS notifications
 *               orderUpdates:
 *                 type: boolean
 *                 description: Receive order update notifications
 *               messageAlerts:
 *                 type: boolean
 *                 description: Receive message alerts
 *     responses:
 *       200:
 *         description: Notification settings updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put('/:id/notification-settings', verifyToken, updateNotificationSettings);

/**
 * @swagger
 * /api/user/backoffice/statistics:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user statistics for back office
 *     description: Get comprehensive user statistics for the back office dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           default: "30"
 *         description: Number of days for trend analysis (default 30)
 *     responses:
 *       200:
 *         description: Successfully retrieved user statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overview:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                     activeUsers:
 *                       type: integer
 *                     bannedUsers:
 *                       type: integer
 *                     artistCount:
 *                       type: integer
 *                     buyerCount:
 *                       type: integer
 *                     activePercentage:
 *                       type: number
 *                     artistPercentage:
 *                       type: number
 *                     activeLastWeek:
 *                       type: integer
 *                     activeLastMonth:
 *                       type: integer
 *                 trends:
 *                   type: object
 *                   properties:
 *                     userGrowth:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                         direction:
 *                           type: string
 *                           enum: [up, down, neutral]
 *                         period:
 *                           type: string
 *                 distributions:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: object
 *                     status:
 *                       type: object
 *                     engagement:
 *                       type: object
 *                       properties:
 *                         high:
 *                           type: integer
 *                         medium:
 *                           type: integer
 *                         low:
 *                           type: integer
 *                 activity:
 *                   type: object
 *                   properties:
 *                     activeLastWeek:
 *                       type: integer
 *                     activeLastMonth:
 *                       type: integer
 *                     monthlyData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                           registrations:
 *                             type: integer
 *                           activeUsers:
 *                             type: integer
 *                     emailPreferences:
 *                       type: object
 *                       properties:
 *                         marketing:
 *                           type: integer
 *                         notifications:
 *                           type: integer
 *                 marketplace:
 *                   type: object
 *                   properties:
 *                     topArtists:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                           total:
 *                             type: integer
 *                           active:
 *                             type: integer
 *                           sold:
 *                             type: integer
 *                           pending:
 *                             type: integer
 *                           user:
 *                             type: object
 *                     totalListings:
 *                       type: integer
 *                     totalOrders:
 *                       type: integer
 *                     averageListingsPerArtist:
 *                       type: string
 *                 performance:
 *                   type: object
 *                   properties:
 *                     engagementRate:
 *                       type: number
 *                     conversionRate:
 *                       type: number
 *                     artistAdoptionRate:
 *                       type: number
 *                 timeframe:
 *                   type: object
 *                   properties:
 *                     days:
 *                       type: integer
 *                     periodStart:
 *                       type: string
 *                       format: date-time
 *                     periodEnd:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/backoffice/statistics', verifyBackOfficeToken, getUserStatistics);

export default router;