import { Router } from 'express';
import tripController from '../controllers/TripController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Trip CRUD routes
router.post('/', (req, res) => tripController.createTrip(req, res));
router.get('/', (req, res) => tripController.getTrips(req, res));
router.get('/:id', (req, res) => tripController.getTripById(req, res));
router.put('/:id', (req, res) => tripController.updateTrip(req, res));
router.delete('/:id', (req, res) => tripController.deleteTrip(req, res));

// Trip activities management
router.post('/:tripId/activities', (req, res) => tripController.addActivityToTrip(req, res));
router.delete('/:tripId/activities/:activityId', (req, res) => tripController.removeActivityFromTrip(req, res));

export default router;
