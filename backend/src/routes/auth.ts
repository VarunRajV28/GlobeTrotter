import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', (req, res) => AuthController.register(req, res));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', (req, res) => AuthController.login(req, res));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, (req, res) => AuthController.getMe(req, res));

export default router;
