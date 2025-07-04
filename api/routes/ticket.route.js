import express from 'express';
import { getTickets, createTicket, updateTicketStatus, getTicket } from '../controllers/ticket.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/customer-service/tickets:
 *   get:
 *     tags:
 *       - Customer Service Tickets
 *     summary: Get all tickets
 *     description: Retrieve all customer service tickets (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in_progress, resolved, closed]
 *         description: Filter by ticket status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority level
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by ticket category
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter by assigned agent ID
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
 *         description: Number of tickets per page
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
 *         description: Successfully retrieved tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tickets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalTickets:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *   post:
 *     tags:
 *       - Customer Service Tickets
 *     summary: Create a new ticket
 *     description: Create a new customer service ticket (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - description
 *               - category
 *             properties:
 *               subject:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 description: Ticket subject
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 description: Detailed description of the issue
 *               category:
 *                 type: string
 *                 enum: [technical, billing, account, order, refund, other]
 *                 description: Ticket category
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *                 description: Priority level
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of attachment URLs
 *               orderReference:
 *                 type: string
 *                 description: Reference to related order (if applicable)
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.get('/tickets', verifyToken, getTickets);

router.post('/tickets', verifyToken, createTicket);

/**
 * @swagger
 * /api/customer-service/tickets/{id}/status:
 *   put:
 *     tags:
 *       - Customer Service Tickets
 *     summary: Update ticket status
 *     description: Update the status of a customer service ticket (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
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
 *                 enum: [open, in_progress, resolved, closed]
 *                 description: New ticket status
 *               resolution:
 *                 type: string
 *                 description: Resolution details (required for resolved/closed status)
 *               assignedTo:
 *                 type: string
 *                 description: ID of the agent assigned to this ticket
 *               adminNotes:
 *                 type: string
 *                 description: Internal notes from admin/support team
 *     responses:
 *       200:
 *         description: Ticket status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Invalid status or missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Ticket not found
 */
router.put('/tickets/:id/status', verifyToken, updateTicketStatus);

/**
 * @swagger
 * /api/customer-service/tickets/{id}:
 *   get:
 *     tags:
 *       - Customer Service Tickets
 *     summary: Get ticket by ID
 *     description: Retrieve a specific customer service ticket by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Successfully retrieved ticket
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ticket not found
 */
router.get('/tickets/:id', verifyToken, getTicket);

export default router; 