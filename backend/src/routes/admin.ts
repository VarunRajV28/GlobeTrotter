import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const adminController = new AdminController();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Admin dashboard and management routes
router.get('/stats', (req, res) => adminController.getStats(req, res));
router.get('/users', (req, res) => adminController.getAllUsers(req, res));
router.put('/users/:userId/status', (req, res) => adminController.updateUserStatus(req, res));
router.delete('/users/:userId', (req, res) => adminController.deleteUser(req, res));
router.get('/trips', (req, res) => adminController.getAllTrips(req, res));

export default router;
