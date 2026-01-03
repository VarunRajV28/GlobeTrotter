import { Router } from 'express';
import usersRouter from './users';
import itinerariesRouter from './itineraries';
import destinationsRouter from './destinations';
import flightsRouter from './flights';
import authRouter from './auth';
import tripsRouter from './trips';
import citiesRouter from './cities';
import activitiesRouter from './activities';
import shareRouter from './share';
import adminRouter from './admin';

const router = Router();

// Mount route modules
router.use('/users', usersRouter);
router.use('/itineraries', itinerariesRouter);
router.use('/destinations', destinationsRouter);
router.use('/flights', flightsRouter);

// New authentication and trip management routes
router.use('/auth', authRouter);
router.use('/trips', tripsRouter);
router.use('/cities', citiesRouter);
router.use('/activities', activitiesRouter);
router.use('/shared', shareRouter);
router.use('/admin', adminRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'GlobeTrotter API',
  });
});

export default router;
