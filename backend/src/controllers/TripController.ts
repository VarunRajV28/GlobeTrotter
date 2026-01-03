import { Request, Response } from 'express';
import prisma from '../config/database';
import { TripStatus } from '@prisma/client';

class TripController {
  /**
   * Create a new trip
   * POST /api/trips
   */
  async createTrip(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const { name, description, startDate, endDate, coverImageUrl, isPublic, budget, destinations } = req.body;

      if (!name) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name is required' } });
        return;
      }

      const trip = await prisma.trip.create({
        data: {
          userId: req.user.userId,
          name,
          description,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          coverImageUrl,
          isPublic: isPublic || false,
          budget,
          destinations: destinations || [],
        },
      });

      console.log(`✅ Trip created: ${trip.name}`);

      res.status(201).json({ success: true, data: { trip } });
    } catch (error: any) {
      console.error('❌ Error creating trip:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create trip' } });
    }
  }

  /**
   * Get all trips for current user
   * GET /api/trips
   */
  async getTrips(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const { status, page = '1', limit = '10' } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const where: any = { userId: req.user.userId };
      if (status) where.status = status;

      const [trips, total] = await Promise.all([
        prisma.trip.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
          include: {
            tripActivities: {
              include: {
                activity: {
                  include: { city: true },
                },
              },
            },
          },
        }),
        prisma.trip.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          trips,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error: any) {
      console.error('❌ Error fetching trips:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch trips' } });
    }
  }

  /**
   * Get trip by ID
   * GET /api/trips/:id
   */
  async getTripById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const { id } = req.params;

      const trip = await prisma.trip.findFirst({
        where: {
          id,
          OR: [
            { userId: req.user.userId },
            { isPublic: true },
          ],
        },
        include: {
          tripActivities: {
            include: {
              activity: {
                include: { city: true },
              },
            },
          },
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      });

      if (!trip) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Trip not found' } });
        return;
      }

      res.json({ success: true, data: { trip } });
    } catch (error: any) {
      console.error('❌ Error fetching trip:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch trip' } });
    }
  }

  /**
   * Update trip
   * PUT /api/trips/:id
   */
  async updateTrip(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const { id } = req.params;
      const { name, description, startDate, endDate, coverImageUrl, isPublic, budget, status } = req.body;

      // Check ownership
      const existingTrip = await prisma.trip.findUnique({ where: { id } });
      if (!existingTrip || existingTrip.userId !== req.user.userId) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Trip not found' } });
        return;
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (startDate !== undefined) updateData.startDate = new Date(startDate);
      if (endDate !== undefined) updateData.endDate = new Date(endDate);
      if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl;
      if (isPublic !== undefined) updateData.isPublic = isPublic;
      if (budget !== undefined) updateData.budget = budget;
      if (status !== undefined) updateData.status = status;

      const trip = await prisma.trip.update({
        where: { id },
        data: updateData,
      });

      console.log(`✅ Trip updated: ${trip.name}`);

      res.json({ success: true, data: { trip } });
    } catch (error: any) {
      console.error('❌ Error updating trip:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update trip' } });
    }
  }

  /**
   * Delete trip
   * DELETE /api/trips/:id
   */
  async deleteTrip(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const { id } = req.params;

      const existingTrip = await prisma.trip.findUnique({ where: { id } });
      if (!existingTrip || existingTrip.userId !== req.user.userId) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Trip not found' } });
        return;
      }

      await prisma.trip.delete({ where: { id } });

      console.log(`✅ Trip deleted: ${id}`);

      res.json({ success: true, message: 'Trip deleted successfully' });
    } catch (error: any) {
      console.error('❌ Error deleting trip:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete trip' } });
    }
  }

  /**
   * Add activity to trip
   * POST /api/trips/:tripId/activities
   */
  async addActivityToTrip(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const { tripId } = req.params;
      const { activityId, date, notes } = req.body;

      if (!activityId) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Activity ID is required' } });
        return;
      }

      // Check ownership
      const trip = await prisma.trip.findUnique({ where: { id: tripId } });
      if (!trip || trip.userId !== req.user.userId) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Trip not found' } });
        return;
      }

      // Use upsert to handle duplicate activities (update if exists, create if not)
      const tripActivity = await prisma.tripActivity.upsert({
        where: {
          tripId_activityId: {
            tripId,
            activityId,
          },
        },
        update: {
          date: date ? new Date(date) : null,
          notes,
        },
        create: {
          tripId,
          activityId,
          date: date ? new Date(date) : null,
          notes,
        },
        include: {
          activity: {
            include: { city: true },
          },
        },
      });

      res.status(201).json({ success: true, data: { tripActivity } });
    } catch (error: any) {
      console.error('❌ Error adding activity to trip:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add activity' } });
    }
  }

  /**
   * Remove activity from trip
   * DELETE /api/trips/:tripId/activities/:activityId
   */
  async removeActivityFromTrip(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const { tripId, activityId } = req.params;

      const trip = await prisma.trip.findUnique({ where: { id: tripId } });
      if (!trip || trip.userId !== req.user.userId) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Trip not found' } });
        return;
      }

      await prisma.tripActivity.deleteMany({
        where: { tripId, activityId },
      });

      res.json({ success: true, message: 'Activity removed from trip successfully' });
    } catch (error: any) {
      console.error('❌ Error removing activity:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to remove activity' } });
    }
  }
}

export default new TripController();
