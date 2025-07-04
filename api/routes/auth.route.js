import express from 'express';
import { google, signOut, signin, signup } from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Create a new user account with username, email, and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's username
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       201:
 *         description: User successfully created
 *       400:
 *         description: Invalid input or validation error
 *       500:
 *         description: Server error
 */
router.post("/signup", signup);

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: Authenticate a user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post("/signin", signin);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Google OAuth authentication
 *     description: Authenticate user with Google OAuth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenId
 *             properties:
 *               tokenId:
 *                 type: string
 *                 description: Google OAuth token ID
 *     responses:
 *       200:
 *         description: Successfully authenticated with Google
 *       401:
 *         description: Invalid Google token
 *       500:
 *         description: Server error
 */
router.post('/google', google);

/**
 * @swagger
 * /api/auth/signout:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Sign out user
 *     description: Clear user session and sign out
 *     responses:
 *       200:
 *         description: Successfully signed out
 *       500:
 *         description: Server error
 */
router.get('/signout', signOut)

export default router;