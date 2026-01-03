import { Router } from 'express';
import { CityController } from '../controllers/CityController';
import { optionalAuth } from '../middleware/auth';

const router = Router();
const cityController = new CityController();

// Public routes (with optional authentication)
router.use(optionalAuth);

router.get('/search', (req, res) => cityController.searchCities(req, res));
router.get('/popular', (req, res) => cityController.getPopularCities(req, res));
router.get('/:id', (req, res) => cityController.getCityById(req, res));

export default router;
