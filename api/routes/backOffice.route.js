import express from 'express';
import jwt from 'jsonwebtoken';
import { verifyBackOfficeToken } from '../utils/verifyBackOfficeUser.js';
import { createUser, getUsers, updateUser, deleteUser, login, logout, getStats } from '../controllers/backOffice.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/backoffice/login:
 *   post:
 *     tags: [Back Office]
 *     summary: Login to back office
 *     description: Authenticate back office user and get access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BackOfficeUser'
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.post('/login', login);

/**
 * @swagger
 * /api/backoffice/logout:
 *   post:
 *     tags: [Back Office]
 *     summary: Logout from back office
 *     description: Clear back office authentication token
 *     responses:
 *       200:
 *         description: Successfully logged out
 */
router.post('/logout', logout);

/**
 * @swagger
 * /api/backoffice/users:
 *   post:
 *     tags: [Back Office]
 *     summary: Create new back office user
 *     description: Create a new back office user (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BackOfficeUser'
 *     responses:
 *       201:
 *         description: User created successfully
 *       403:
 *         description: Not authorized
 *   get:
 *     tags: [Back Office]
 *     summary: Get all back office users
 *     description: Retrieve all back office users (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of back office users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BackOfficeUser'
 *       403:
 *         description: Not authorized
 */
router.post('/users', verifyBackOfficeToken, createUser);
router.get('/users', verifyBackOfficeToken, getUsers);
router.get('/stats', verifyBackOfficeToken, getStats);

/**
 * @swagger
 * /api/backoffice/users/{id}:
 *   put:
 *     tags: [Back Office]
 *     summary: Update back office user
 *     description: Update a back office user's information
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
 *             $ref: '#/components/schemas/BackOfficeUser'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 *   delete:
 *     tags: [Back Office]
 *     summary: Delete back office user
 *     description: Delete a back office user (admin only)
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
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.put('/users/:id', verifyBackOfficeToken, updateUser);
router.delete('/users/:id', verifyBackOfficeToken, deleteUser);

/**
 * @swagger
 * /api/backoffice/stats:
 *   get:
 *     tags: [Back Office]
 *     summary: Get back office statistics
 *     description: Get comprehensive platform statistics (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, quarter, year]
 *           default: month
 *         description: Time period for statistics
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for custom date range
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for custom date range
 *     responses:
 *       200:
 *         description: Successfully retrieved statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     active:
 *                       type: integer
 *                     newThisPeriod:
 *                       type: integer
 *                 listings:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     active:
 *                       type: integer
 *                     sold:
 *                       type: integer
 *                     newThisPeriod:
 *                       type: integer
 *                 orders:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     completed:
 *                       type: integer
 *                     pending:
 *                       type: integer
 *                     cancelled:
 *                       type: integer
 *                     totalRevenue:
 *                       type: number
 *                     revenueThisPeriod:
 *                       type: number
 *                 services:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pending:
 *                       type: integer
 *                     approved:
 *                       type: integer
 *                     completed:
 *                       type: integer
 *                 supportRequests:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     open:
 *                       type: integer
 *                     resolved:
 *                       type: integer
 *                     averageResponseTime:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/stats', verifyBackOfficeToken, getStats);

/**
 * @swagger
 * /api/backoffice/dashboard:
 *   get:
 *     tags: [Back Office]
 *     summary: Get dashboard data
 *     description: Get dashboard welcome message and user info (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Welcome to the dashboard"
 *                 user:
 *                   $ref: '#/components/schemas/BackOfficeUser'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/dashboard', verifyBackOfficeToken, (req, res) => {
  res.json({ 
    success: true,
    message: 'Welcome to the dashboard',
    user: req.user
  });
});

export default router; 