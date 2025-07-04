import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  toggleFeatured,
  updateStatus
} from '../controllers/project.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/projects:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get all projects
 *     description: Retrieve all projects with optional filtering
 *     parameters:
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter by featured projects
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, draft, completed]
 *         description: Filter by project status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by project category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of projects to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: Successfully retrieved projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalProjects:
 *                   type: integer
 *   post:
 *     tags:
 *       - Projects
 *     summary: Create a new project
 *     description: Create a new project (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *               category:
 *                 type: string
 *               imageUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 10
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               budget:
 *                 type: number
 *               timeline:
 *                 type: string
 *               clientName:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft, completed]
 *                 default: draft
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.get('/', getProjects);
router.post('/', verifyToken, createProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get project by ID
 *     description: Retrieve a specific project by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Successfully retrieved project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *   put:
 *     tags:
 *       - Projects
 *     summary: Update project
 *     description: Update a project (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               imageUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               budget:
 *                 type: number
 *               timeline:
 *                 type: string
 *               clientName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *   delete:
 *     tags:
 *       - Projects
 *     summary: Delete project
 *     description: Delete a project (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.get('/:id', getProjectById);
router.put('/:id', verifyToken, updateProject);
router.delete('/:id', verifyToken, deleteProject);

/**
 * @swagger
 * /api/projects/{id}/featured:
 *   patch:
 *     tags:
 *       - Projects
 *     summary: Toggle project featured status
 *     description: Toggle whether a project is featured (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - featured
 *             properties:
 *               featured:
 *                 type: boolean
 *                 description: Whether the project should be featured
 *     responses:
 *       200:
 *         description: Project featured status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.patch('/:id/featured', verifyToken, toggleFeatured);

/**
 * @swagger
 * /api/projects/{id}/status:
 *   patch:
 *     tags:
 *       - Projects
 *     summary: Update project status
 *     description: Update the status of a project (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
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
 *                 enum: [active, inactive, draft, completed]
 *                 description: New project status
 *     responses:
 *       200:
 *         description: Project status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid status value
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.patch('/:id/status', verifyToken, updateStatus);

export default router; 