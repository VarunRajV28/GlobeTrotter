import { Request, Response } from 'express';
import prisma from '../config/database';
import { FlightPriceService } from '../services/amadeus';
import { HotelService } from '../services/amadeus';

/**
 * Service and Controller for budget calculation and aggregation
 */
export class BudgetController {
  /**
   * Calculate complete budget for an itinerary
   * GET /api/itineraries/:id/budget?refresh=true
   */
  async calculateBudget(req: Request, res: Response): Promise<void> {
    try {
      const { id: itineraryId } = req.params;
      const { refresh } = req.query;

      // Get itinerary with all related data
      const itinerary = await prisma.itinerary.findUnique({
        where: { id: itineraryId },
        include: {
          stops: {
            include: {
              activities: true,
              hotels: true,
            },
            orderBy: { sequence: 'asc' },
          },
          flights: true,
          budgetSummary: true,
        },
      });

      if (!itinerary) {
        res.status(404).json({
          error: 'Itinerary not found',
        });
        return;
      }

      console.log(`💰 Calculating budget for itinerary: ${itineraryId}`);

      let flightsCost = 0;
      let hotelsCost = 0;
      let activitiesCost = 0;

      // Calculate flights cost
      for (const flight of itinerary.flights) {
        flightsCost += flight.priceTotal;
      }

      // Calculate hotels and activities cost per stop
      for (const stop of itinerary.stops) {
        // Hotels cost
        for (const hotel of stop.hotels) {
          hotelsCost += hotel.priceTotal;
        }

        // Activities cost
        for (const activity of stop.activities) {
          if (activity.price) {
            activitiesCost += activity.price;
          }
        }
      }

      const totalCost = flightsCost + hotelsCost + activitiesCost;

      // Update or create budget summary
      const budgetSummary = await prisma.budgetSummary.upsert({
        where: { itineraryId },
        create: {
          itineraryId,
          flightsCost,
          hotelsCost,
          activitiesCost,
          totalCost,
          currency: itinerary.currency,
        },
        update: {
          flightsCost,
          hotelsCost,
          activitiesCost,
          totalCost,
          currency: itinerary.currency,
          lastCalculated: new Date(),
        },
      });

      const breakdown = {
        flights: {
          cost: flightsCost,
          count: itinerary.flights.length,
          percentage: totalCost > 0 ? (flightsCost / totalCost) * 100 : 0,
        },
        hotels: {
          cost: hotelsCost,
          count: itinerary.stops.reduce(
            (sum, stop) => sum + stop.hotels.length,
            0
          ),
          percentage: totalCost > 0 ? (hotelsCost / totalCost) * 100 : 0,
        },
        activities: {
          cost: activitiesCost,
          count: itinerary.stops.reduce(
            (sum, stop) => sum + stop.activities.length,
            0
          ),
          percentage: totalCost > 0 ? (activitiesCost / totalCost) * 100 : 0,
        },
        total: totalCost,
        currency: itinerary.currency,
        budget: itinerary.totalBudget,
        remaining:
          itinerary.totalBudget !== null
            ? itinerary.totalBudget - totalCost
            : null,
        overBudget:
          itinerary.totalBudget !== null && totalCost > itinerary.totalBudget,
      };

      console.log(
        `✅ Budget calculated: ${totalCost} ${itinerary.currency} (Flights: ${flightsCost}, Hotels: ${hotelsCost}, Activities: ${activitiesCost})`
      );

      res.json({
        success: true,
        data: {
          summary: budgetSummary,
          breakdown,
          lastCalculated: budgetSummary.lastCalculated,
        },
      });
    } catch (error: any) {
      console.error('❌ Budget calculation error:', error);
      res.status(500).json({
        error: 'Failed to calculate budget',
        message: error.message,
      });
    }
  }

  /**
   * Add flight to itinerary and confirm pricing
   * POST /api/itineraries/:id/flights
   */
  async addFlight(req: Request, res: Response): Promise<void> {
    try {
      const { id: itineraryId } = req.params;
      const {
        flightOfferId,
        fromCityCode,
        toCityCode,
        departureDate,
        arrivalDate,
        carrierCode,
        flightNumber,
        duration,
        passengers,
        priceBase,
        priceTotal,
        currency,
        cabinClass,
      } = req.body;

      if (!fromCityCode || !toCityCode || !priceTotal || !currency) {
        res.status(400).json({
          error: 'Missing required fields',
          required: ['fromCityCode', 'toCityCode', 'priceTotal', 'currency'],
        });
        return;
      }

      const flight = await prisma.flightSegment.create({
        data: {
          itineraryId,
          flightOfferId,
          fromCityCode,
          toCityCode,
          departureDate: departureDate ? new Date(departureDate) : null,
          arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
          carrierCode,
          flightNumber,
          duration,
          passengers: passengers || 1,
          priceBase: priceBase ? parseFloat(priceBase) : null,
          priceTotal: parseFloat(priceTotal),
          currency,
          cabinClass,
        },
      });

      console.log(
        `✅ Added flight: ${fromCityCode} → ${toCityCode} to itinerary ${itineraryId}`
      );

      res.status(201).json({
        success: true,
        data: flight,
      });
    } catch (error: any) {
      console.error('❌ Error adding flight:', error);
      res.status(500).json({
        error: 'Failed to add flight',
        message: error.message,
      });
    }
  }

  /**
   * Confirm flight pricing via Amadeus API
   * POST /api/flights/price
   * Body: { flightOffers: [] }
   */
  async confirmFlightPrice(req: Request, res: Response): Promise<void> {
    try {
      const { flightOffers, include } = req.body;

      if (!flightOffers || !Array.isArray(flightOffers)) {
        res.status(400).json({
          error: 'flightOffers array is required',
        });
        return;
      }

      const result = await FlightPriceService.confirmFlightPrice(
        flightOffers,
        include
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('❌ Flight price confirmation error:', error);
      res.status(error.status || 500).json({
        error: error.message || 'Failed to confirm flight price',
        code: error.code,
        details: error.errors,
      });
    }
  }

  /**
   * Refresh hotel pricing for an itinerary stop
   * POST /api/itineraries/:id/stops/:stopId/hotels/refresh
   */
  async refreshHotelPricing(req: Request, res: Response): Promise<void> {
    try {
      const { stopId } = req.params;

      // Get stop with hotels
      const stop = await prisma.itineraryStop.findUnique({
        where: { id: stopId },
        include: { hotels: true },
      });

      if (!stop) {
        res.status(404).json({
          error: 'Stop not found',
        });
        return;
      }

      if (stop.hotels.length === 0) {
        res.status(400).json({
          error: 'No hotels added to this stop',
        });
        return;
      }

      console.log(`🔄 Refreshing pricing for ${stop.hotels.length} hotel(s)`);

      // Get latest pricing from Amadeus
      const hotelIds = stop.hotels.map((h) => h.amadeusHotelId);
      const checkInDate = stop.checkInDate
        ? stop.checkInDate.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      const checkOutDate = stop.checkOutDate
        ? stop.checkOutDate.toISOString().split('T')[0]
        : new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const offers = await HotelService.getHotelOffers(
        hotelIds,
        checkInDate,
        checkOutDate
      );

      // Update hotel prices
      const updatedHotels: any[] = [];
      for (const offerData of offers) {
        if (offerData.offers && offerData.offers.length > 0) {
          const bestOffer = offerData.offers[0];
          const hotel = stop.hotels.find(
            (h) => h.amadeusHotelId === offerData.hotel.hotelId
          );

          if (hotel) {
            const updated = await prisma.itineraryHotel.update({
              where: { id: hotel.id },
              data: {
                offerId: bestOffer.id,
                priceBase: bestOffer.price.base,
                priceTotal: bestOffer.price.total,
                currency: bestOffer.price.currency,
              },
            });
            updatedHotels.push(updated);
          }
        }
      }

      console.log(`✅ Refreshed pricing for ${updatedHotels.length} hotel(s)`);

      res.json({
        success: true,
        count: updatedHotels.length,
        data: updatedHotels,
      });
    } catch (error: any) {
      console.error('❌ Hotel pricing refresh error:', error);
      res.status(500).json({
        error: 'Failed to refresh hotel pricing',
        message: error.message,
      });
    }
  }
}

export default new BudgetController();
