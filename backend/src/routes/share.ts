import { Router } from 'express';
import { ShareController } from '../controllers/ShareController';
import { authenticate } from '../middleware/auth';

const router = Router();
const shareController = new ShareController();

// Public route (no auth required)
router.get('/:token', (req, res) => shareController.getSharedTrip(req, res));

// Protected routes
router.post('/', authenticate, (req, res) => shareController.createShareLink(req, res));
router.delete('/:token', authenticate, (req, res) => shareController.revokeShareLink(req, res));
router.get('/user/links', authenticate, (req, res) => shareController.getUserShareLinks(req, res));

export default router;
