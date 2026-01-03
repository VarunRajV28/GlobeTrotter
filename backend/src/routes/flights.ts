import { Router } from 'express';
import BudgetController from '../controllers/BudgetController';

const router = Router();

// Flight pricing confirmation
router.post('/price', BudgetController.confirmFlightPrice);

export default router;
