import { Router } from 'express';
import { ActivityController } from '../controllers/ActivityController';
import { optionalAuth } from '../middleware/auth';

const router = Router();
const activityController = new ActivityController();

// Public routes (with optional authentication)
router.use(optionalAuth);

router.get('/search', (req, res) => activityController.searchActivities(req, res));
router.get('/city/:cityId', (req, res) => activityController.getActivitiesByCity(req, res));
router.get('/:id', (req, res) => activityController.getActivityById(req, res));

export default router;
