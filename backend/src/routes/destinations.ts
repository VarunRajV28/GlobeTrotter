import { Router } from 'express';
import DestinationController from '../controllers/DestinationController';

const router = Router();

// City search routes
router.get('/search', DestinationController.searchCities);
router.get('/:cityCode', DestinationController.getCityByCode);

// Activity routes
router.get('/:cityCode/activities', DestinationController.searchActivities);
router.get('/activities/:activityId', DestinationController.getActivityById);

// Hotel routes
router.get('/:cityCode/hotels', DestinationController.searchHotels);
router.post('/hotels/offers', DestinationController.getHotelOffers);
router.get('/hotels/offers/:offerId', DestinationController.getOfferDetails);

export default router;
