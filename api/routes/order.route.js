import express from 'express';
import { createOrder, getOrders, updateOrderStatus, deleteOrder, updateItemStatusChecks, deleteOrderItem, updateOrderItemQuantity, getOrderStatistics } from '../controllers/order.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { verifyBackOfficeToken } from '../utils/verifyBackOfficeUser.js';
import { errorHandler } from '../utils/error.js';

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order
 *     description: Create a new order with items and customer information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderItems
 *               - customerInfo
 *             properties:
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - _id
 *                     - quantity
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Listing ID
 *                     quantity:
 *                       type: number
 *                       description: Quantity to order
 *               customerInfo:
 *                 type: object
 *                 required:
 *                   - name
 *                   - phoneNumber
 *                   - address
 *                   - city
 *                   - district
 *                 properties:
 *                   name:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   district:
 *                     type: string
 *                   paymentMethod:
 *                     type: string
 *                     enum: [cash, visa]
 *                     default: cash
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid input or insufficient stock
 *       500:
 *         description: Server error
 *   get:
 *     tags: [Orders]
 *     summary: Get all orders
 *     description: Retrieve all orders (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 */
router.post('/', createOrder);
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
}, getOrders);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Update order status
 *     description: Update the status of an existing order (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
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
 *                 enum: [placed, out for delivery, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
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
}, updateOrderStatus);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     tags: [Orders]
 *     summary: Delete order
 *     description: Delete an existing order (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
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
}, deleteOrder);

/**
 * @swagger
 * /api/orders/{orderId}/items/{itemId}/status-checks:
 *   put:
 *     tags: [Orders]
 *     summary: Update order item status checks
 *     description: Update the status checks for a specific item in an order (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID (e.g., CM1)
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID within the order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statusChecks:
 *                 type: object
 *                 properties:
 *                   itemReceived:
 *                     type: boolean
 *                   itemVerified:
 *                     type: boolean
 *                   itemPacked:
 *                     type: boolean
 *                   readyForShipment:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Status checks updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusChecks:
 *                   type: object
 *                   properties:
 *                     itemReceived:
 *                       type: boolean
 *                     itemVerified:
 *                       type: boolean
 *                     itemPacked:
 *                       type: boolean
 *                     readyForShipment:
 *                       type: boolean
 *       400:
 *         description: Invalid status checks
 *       404:
 *         description: Order or item not found
 *       500:
 *         description: Server error
 */
// Note: This route supports both regular user access and back office admin access
router.put('/:orderId/items/:itemId/status-checks', (req, res, next) => {
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
}, updateItemStatusChecks);

/**
 * @swagger
 * /api/orders/{orderId}/items/{itemId}:
 *   delete:
 *     tags: [Orders]
 *     summary: Delete order item
 *     description: Delete a specific item from an order (admin only). If this is the last item, the entire order will be deleted.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID (e.g., CM1)
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID within the order
 *     responses:
 *       200:
 *         description: Order item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *                 orderDeleted:
 *                   type: boolean
 *                   description: True if the entire order was deleted because no items remained
 *       404:
 *         description: Order or item not found
 *       500:
 *         description: Server error
 */
// Note: This route supports both regular user access and back office admin access
router.delete('/:orderId/items/:itemId', (req, res, next) => {
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
}, deleteOrderItem);

/**
 * @swagger
 * /api/orders/{orderId}/items/{itemId}/quantity:
 *   put:
 *     tags: [Orders]
 *     summary: Update order item quantity
 *     description: Update the quantity of a specific item in an order (admin only). Automatically manages listing inventory.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID (e.g., CM1)
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID within the order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newQuantity
 *             properties:
 *               newQuantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: New quantity for the order item
 *     responses:
 *       200:
 *         description: Order item quantity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *                 updatedItem:
 *                   type: object
 *                 listingStock:
 *                   type: object
 *                   properties:
 *                     currentQuantity:
 *                       type: integer
 *                     soldQuantity:
 *                       type: integer
 *       400:
 *         description: Invalid quantity or insufficient stock
 *       404:
 *         description: Order or item not found
 *       500:
 *         description: Server error
 */
// Note: This route supports both regular user access and back office admin access
router.put('/:orderId/items/:itemId/quantity', (req, res, next) => {
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
}, updateOrderItemQuantity);

/**
 * @swagger
 * /api/orders/backoffice/statistics:
 *   get:
 *     summary: Get order statistics for back office dashboard
 *     tags: [Orders]
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
 *         description: Returns comprehensive order statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overview:
 *                   type: object
 *                   properties:
 *                     totalOrders:
 *                       type: number
 *                     totalRevenue:
 *                       type: number
 *                     totalCadreRevenue:
 *                       type: number
 *                     averageOrderValue:
 *                       type: number
 *                     totalItemsSold:
 *                       type: number
 *                     activeCount:
 *                       type: number
 *                     completedCount:
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
 *                     paymentMethod:
 *                       type: object
 *                     geographic:
 *                       type: object
 *                     itemType:
 *                       type: object
 *                 fulfillment:
 *                   type: object
 *                   properties:
 *                     progress:
 *                       type: object
 *                     completionPercentages:
 *                       type: object
 *                 trends:
 *                   type: object
 *                   properties:
 *                     orderGrowth:
 *                       type: object
 *                     revenueGrowth:
 *                       type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/backoffice/statistics', verifyBackOfficeToken, getOrderStatistics);

export default router; // Use ES Module export