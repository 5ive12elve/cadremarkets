import express from 'express';
import { signin, signup } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Main site auth routes
router.post("/signin", signin);
router.post("/signup", signup);

// Legacy back office routes removed for security
// All back office authentication now handled through /api/backoffice/ routes

export default router; 