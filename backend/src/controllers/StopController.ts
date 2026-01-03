import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Controller for managing itinerary stops (cities)
 */
export class StopController {
  /**
   * Add a city stop to an itinerary
   * POST /api/itineraries/:id/stops
   */
  async addStop(req: Request, res: Response): Promise<void> {
    try {
      const { id: itineraryId } = req.params;
      const {
        cityCode,
        cityName,
        countryCode,
        latitude,
        longitude,
        sequence,
        checkInDate,
        checkOutDate,
        nights,
        notes,
      } = req.body;

      // Validation
      if (!cityCode || !cityName) {
        res.status(400).json({
          error: 'Missing required fields',
          required: ['cityCode', 'cityName'],
        });
        return;
      }

      // Verify itinerary exists
      const itinerary = await prisma.itinerary.findUnique({
        where: { id: itineraryId },
      });

      if (!itinerary) {
        res.status(404).json({
          error: 'Itinerary not found',
        });
        return;
      }

      // If no sequence provided, add to end
      let stopSequence = sequence;
      if (!stopSequence) {
        const lastStop = await prisma.itineraryStop.findFirst({
          where: { itineraryId },
          orderBy: { sequence: 'desc' },
        });
        stopSequence = lastStop ? lastStop.sequence + 1 : 1;
      }

      const stop = await prisma.itineraryStop.create({
        data: {
          itineraryId,
          cityCode,
          cityName,
          countryCode,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          sequence: stopSequence,
          checkInDate: checkInDate ? new Date(checkInDate) : null,
          checkOutDate: checkOutDate ? new Date(checkOutDate) : null,
          nights: nights ? parseInt(nights) : null,
          notes,
        },
        include: {
          activities: true,
          hotels: true,
        },
      });

      console.log(
        `✅ Added stop: ${cityName} (${cityCode}) to itinerary ${itineraryId}`
      );

      res.status(201).json({
        success: true,
        data: stop,
      });
    } catch (error: any) {
      console.error('❌ Error adding stop:', error);

      if (error.code === 'P2002') {
        res.status(409).json({
          error: 'A stop with this sequence already exists in this itinerary',
        });
        return;
      }

      res.status(500).json({
        error: 'Failed to add stop',
        message: error.message,
      });
    }
  }

  /**
   * Get all stops for an itinerary
   * GET /api/itineraries/:id/stops
   */
  async getStops(req: Request, res: Response): Promise<void> {
    try {
      const { id: itineraryId } = req.params;

      const stops = await prisma.itineraryStop.findMany({
        where: { itineraryId },
        include: {
          activities: true,
          hotels: true,
        },
        orderBy: {
          sequence: 'asc',
        },
      });

      res.json({
        success: true,
        count: stops.length,
        data: stops,
      });
    } catch (error: any) {
      console.error('❌ Error fetching stops:', error);
      res.status(500).json({
        error: 'Failed to fetch stops',
        message: error.message,
      });
    }
  }

  /**
   * Update a stop
   * PUT /api/itineraries/:id/stops/:stopId
   */
  async updateStop(req: Request, res: Response): Promise<void> {
    try {
      const { stopId } = req.params;
      const {
        cityCode,
        cityName,
        countryCode,
        latitude,
        longitude,
        sequence,
        checkInDate,
        checkOutDate,
        nights,
        notes,
      } = req.body;

      const updateData: any = {};
      if (cityCode !== undefined) updateData.cityCode = cityCode;
      if (cityName !== undefined) updateData.cityName = cityName;
      if (countryCode !== undefined) updateData.countryCode = countryCode;
      if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
      if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
      if (sequence !== undefined) updateData.sequence = sequence;
      if (checkInDate !== undefined)
        updateData.checkInDate = new Date(checkInDate);
      if (checkOutDate !== undefined)
        updateData.checkOutDate = new Date(checkOutDate);
      if (nights !== undefined) updateData.nights = parseInt(nights);
      if (notes !== undefined) updateData.notes = notes;

      const stop = await prisma.itineraryStop.update({
        where: { id: stopId },
        data: updateData,
        include: {
          activities: true,
          hotels: true,
        },
      });

      console.log(`✅ Updated stop: ${stopId}`);

      res.json({
        success: true,
        data: stop,
      });
    } catch (error: any) {
      console.error(`❌ Error updating stop ${req.params.stopId}:`, error);

      if (error.code === 'P2025') {
        res.status(404).json({
          error: 'Stop not found',
        });
        return;
      }

      if (error.code === 'P2002') {
        res.status(409).json({
          error: 'A stop with this sequence already exists in this itinerary',
        });
        return;
      }

      res.status(500).json({
        error: 'Failed to update stop',
        message: error.message,
      });
    }
  }

  /**
   * Delete a stop
   * DELETE /api/itineraries/:id/stops/:stopId
   */
  async deleteStop(req: Request, res: Response): Promise<void> {
    try {
      const { stopId } = req.params;

      await prisma.itineraryStop.delete({
        where: { id: stopId },
      });

      console.log(`✅ Deleted stop: ${stopId}`);

      res.json({
        success: true,
        message: 'Stop deleted successfully',
      });
    } catch (error: any) {
      console.error(`❌ Error deleting stop ${req.params.stopId}:`, error);

      if (error.code === 'P2025') {
        res.status(404).json({
          error: 'Stop not found',
        });
        return;
      }

      res.status(500).json({
        error: 'Failed to delete stop',
        message: error.message,
      });
    }
  }

  /**
   * Add activity to a stop
   * POST /api/itineraries/:id/stops/:stopId/activities
   */
  async addActivity(req: Request, res: Response): Promise<void> {
    try {
      const { stopId } = req.params;
      const {
        amadeusActivityId,
        name,
        shortDescription,
        description,
        rating,
        price,
        currency,
        bookingLink,
        minimumDuration,
        pictures,
        latitude,
        longitude,
      } = req.body;

      if (!amadeusActivityId || !name) {
        res.status(400).json({
          error: 'Missing required fields',
          required: ['amadeusActivityId', 'name'],
        });
        return;
      }

      const activity = await prisma.itineraryActivity.create({
        data: {
          stopId,
          amadeusActivityId,
          name,
          shortDescription,
          description,
          rating: rating ? parseFloat(rating) : null,
          price: price ? parseFloat(price) : null,
          currency,
          bookingLink,
          minimumDuration,
          pictures: pictures || [],
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
        },
      });

      console.log(`✅ Added activity: ${name} to stop ${stopId}`);

      res.status(201).json({
        success: true,
        data: activity,
      });
    } catch (error: any) {
      console.error('❌ Error adding activity:', error);
      res.status(500).json({
        error: 'Failed to add activity',
        message: error.message,
      });
    }
  }

  /**
   * Add hotel to a stop
   * POST /api/itineraries/:id/stops/:stopId/hotels
   */
  async addHotel(req: Request, res: Response): Promise<void> {
    try {
      const { stopId } = req.params;
      const {
        amadeusHotelId,
        hotelName,
        chainCode,
        offerId,
        roomType,
        checkInDate,
        checkOutDate,
        nights,
        priceBase,
        priceTotal,
        currency,
        paymentType,
        cancellation,
        latitude,
        longitude,
      } = req.body;

      if (!amadeusHotelId || !hotelName || !checkInDate || !checkOutDate || !priceTotal || !currency) {
        res.status(400).json({
          error: 'Missing required fields',
          required: ['amadeusHotelId', 'hotelName', 'checkInDate', 'checkOutDate', 'priceTotal', 'currency'],
        });
        return;
      }

      const hotel = await prisma.itineraryHotel.create({
        data: {
          stopId,
          amadeusHotelId,
          hotelName,
          chainCode,
          offerId,
          roomType,
          checkInDate: new Date(checkInDate),
          checkOutDate: new Date(checkOutDate),
          nights: nights || 1,
          priceBase: priceBase ? parseFloat(priceBase) : null,
          priceTotal: parseFloat(priceTotal),
          currency,
          paymentType,
          cancellation,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
        },
      });

      console.log(`✅ Added hotel: ${hotelName} to stop ${stopId}`);

      res.status(201).json({
        success: true,
        data: hotel,
      });
    } catch (error: any) {
      console.error('❌ Error adding hotel:', error);
      res.status(500).json({
        error: 'Failed to add hotel',
        message: error.message,
      });
    }
  }
}

export default new StopController();
