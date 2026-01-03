import { Router } from 'express';
import ItineraryController from '../controllers/ItineraryController';
import StopController from '../controllers/StopController';
import BudgetController from '../controllers/BudgetController';

const router = Router();

// Itinerary routes
router.post('/', ItineraryController.createItinerary);
router.get('/', ItineraryController.getItineraries);
router.get('/:id', ItineraryController.getItineraryById);
router.put('/:id', ItineraryController.updateItinerary);
router.delete('/:id', ItineraryController.deleteItinerary);

// Stop routes
router.get('/:id/stops', StopController.getStops);
router.post('/:id/stops', StopController.addStop);
router.put('/:id/stops/:stopId', StopController.updateStop);
router.delete('/:id/stops/:stopId', StopController.deleteStop);

// Stop activities and hotels
router.post('/:id/stops/:stopId/activities', StopController.addActivity);
router.post('/:id/stops/:stopId/hotels', StopController.addHotel);
router.post('/:id/stops/:stopId/hotels/refresh', BudgetController.refreshHotelPricing);

// Flight routes
router.post('/:id/flights', BudgetController.addFlight);

// Budget routes
router.get('/:id/budget', BudgetController.calculateBudget);

export default router;
