import { Request, Response } from 'express';
import {
  CitySearchService,
  ActivityService,
  HotelService,
} from '../services/amadeus';

/**
 * Controller for Amadeus destination discovery APIs
 */
export class DestinationController {
  /**
   * Search cities by keyword
   * GET /api/destinations/search?keyword=paris&countryCode=FR&max=10
   */
  async searchCities(req: Request, res: Response): Promise<void> {
    try {
      const { keyword, countryCode, max } = req.query;

      if (!keyword) {
        res.status(400).json({
          error: 'keyword query parameter is required',
        });
        return;
      }

      const maxResults = max ? parseInt(max as string) : 10;

      const cities = await CitySearchService.searchCities(
        keyword as string,
        countryCode as string | undefined,
        maxResults
      );

      res.json({
        success: true,
        count: cities.length,
        data: cities,
      });
    } catch (error: any) {
      console.error('❌ City search error:', error);
      res.status(error.status || 500).json({
        error: error.message || 'Failed to search cities',
        code: error.code,
        details: error.errors,
      });
    }
  }

  /**
   * Get city by IATA code
   * GET /api/destinations/:cityCode
   */
  async getCityByCode(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;

      const city = await CitySearchService.getCityByCode(cityCode);

      res.json({
        success: true,
        data: city,
      });
    } catch (error: any) {
      console.error(`❌ City fetch error for ${req.params.cityCode}:`, error);
      res.status(error.status || 500).json({
        error: error.message || 'Failed to fetch city',
        code: error.code,
      });
    }
  }

  /**
   * Search activities by location
   * GET /api/destinations/:cityCode/activities?latitude=48.8566&longitude=2.3522&radius=5
   */
  async searchActivities(req: Request, res: Response): Promise<void> {
    try {
      const { latitude, longitude, radius } = req.query;

      if (!latitude || !longitude) {
        res.status(400).json({
          error: 'latitude and longitude query parameters are required',
        });
        return;
      }

      const searchRadius = radius ? parseFloat(radius as string) : 5;

      const activities = await ActivityService.searchActivitiesByLocation(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        searchRadius
      );

      res.json({
        success: true,
        count: activities.length,
        data: activities,
      });
    } catch (error: any) {
      console.error('❌ Activity search error:', error);
      res.status(error.status || 500).json({
        error: error.message || 'Failed to search activities',
        code: error.code,
        details: error.errors,
      });
    }
  }

  /**
   * Get activity by ID
   * GET /api/destinations/activities/:activityId
   */
  async getActivityById(req: Request, res: Response): Promise<void> {
    try {
      const { activityId } = req.params;

      const activity = await ActivityService.getActivityById(activityId);

      res.json({
        success: true,
        data: activity,
      });
    } catch (error: any) {
      console.error(`❌ Activity fetch error for ${req.params.activityId}:`, error);
      res.status(error.status || 500).json({
        error: error.message || 'Failed to fetch activity',
        code: error.code,
      });
    }
  }

  /**
   * Search hotels in a city
   * GET /api/destinations/:cityCode/hotels?radius=5&chainCodes=MC,RT&amenities=SWIMMING_POOL
   */
  async searchHotels(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;
      const { radius, chainCodes, amenities } = req.query;

      const searchRadius = radius ? parseFloat(radius as string) : 5;
      const chains = chainCodes
        ? (chainCodes as string).split(',')
        : undefined;
      const hotelAmenities = amenities
        ? (amenities as string).split(',')
        : undefined;

      const hotels = await HotelService.searchHotelsByCity(
        cityCode,
        searchRadius,
        chains,
        hotelAmenities
      );

      res.json({
        success: true,
        count: hotels.length,
        data: hotels,
      });
    } catch (error: any) {
      console.error(`❌ Hotel search error for ${req.params.cityCode}:`, error);
      res.status(error.status || 500).json({
        error: error.message || 'Failed to search hotels',
        code: error.code,
        details: error.errors,
      });
    }
  }

  /**
   * Get hotel offers with real-time pricing
   * POST /api/destinations/hotels/offers
   * Body: { hotelIds, checkInDate, checkOutDate, adults, roomQuantity, currency, priceRange }
   */
  async getHotelOffers(req: Request, res: Response): Promise<void> {
    try {
      const {
        hotelIds,
        checkInDate,
        checkOutDate,
        adults,
        roomQuantity,
        currency,
        priceRange,
      } = req.body;

      if (!hotelIds || !checkInDate || !checkOutDate) {
        res.status(400).json({
          error: 'Missing required fields',
          required: ['hotelIds', 'checkInDate', 'checkOutDate'],
        });
        return;
      }

      if (!Array.isArray(hotelIds) || hotelIds.length === 0) {
        res.status(400).json({
          error: 'hotelIds must be a non-empty array',
        });
        return;
      }

      const offers = await HotelService.getHotelOffers(
        hotelIds,
        checkInDate,
        checkOutDate,
        adults || 1,
        roomQuantity || 1,
        currency || 'USD',
        priceRange
      );

      res.json({
        success: true,
        count: offers.length,
        data: offers,
      });
    } catch (error: any) {
      console.error('❌ Hotel offers error:', error);
      res.status(error.status || 500).json({
        error: error.message || 'Failed to get hotel offers',
        code: error.code,
        details: error.errors,
      });
    }
  }

  /**
   * Get detailed pricing for a specific hotel offer
   * GET /api/destinations/hotels/offers/:offerId
   */
  async getOfferDetails(req: Request, res: Response): Promise<void> {
    try {
      const { offerId } = req.params;

      const offer = await HotelService.getOfferDetails(offerId);

      res.json({
        success: true,
        data: offer,
      });
    } catch (error: any) {
      console.error(`❌ Offer details error for ${req.params.offerId}:`, error);
      res.status(error.status || 500).json({
        error: error.message || 'Failed to get offer details',
        code: error.code,
      });
    }
  }
}

export default new DestinationController();
