import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Controller for Itinerary CRUD operations
 */
export class ItineraryController {
  /**
   * Create a new itinerary
   * POST /api/itineraries
   */
  async createItinerary(req: Request, res: Response): Promise<void> {
    try {
      const {
        userId,
        name,
        description,
        totalBudget,
        currency,
        startDate,
        endDate,
      } = req.body;

      // Validation
      if (!userId || !name) {
        res.status(400).json({
          error: 'Missing required fields',
          required: ['userId', 'name'],
        });
        return;
      }

      const itinerary = await prisma.itinerary.create({
        data: {
          userId,
          name,
          description,
          totalBudget: totalBudget ? parseFloat(totalBudget) : null,
          currency: currency || 'USD',
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          status: 'planning',
        },
        include: {
          stops: true,
          flights: true,
          budgetSummary: true,
        },
      });

      console.log(`✅ Created itinerary: ${itinerary.id} - "${name}"`);

      res.status(201).json({
        success: true,
        data: itinerary,
      });
    } catch (error: any) {
      console.error('❌ Error creating itinerary:', error);
      res.status(500).json({
        error: 'Failed to create itinerary',
        message: error.message,
      });
    }
  }

  /**
   * Get all itineraries for a user
   * GET /api/itineraries?userId=xxx
   */
  async getItineraries(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.query;

      if (!userId) {
        res.status(400).json({
          error: 'userId query parameter is required',
        });
        return;
      }

      const itineraries = await prisma.itinerary.findMany({
        where: {
          userId: userId as string,
        },
        include: {
          stops: {
            orderBy: {
              sequence: 'asc',
            },
          },
          flights: true,
          budgetSummary: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json({
        success: true,
        count: itineraries.length,
        data: itineraries,
      });
    } catch (error: any) {
      console.error('❌ Error fetching itineraries:', error);
      res.status(500).json({
        error: 'Failed to fetch itineraries',
        message: error.message,
      });
    }
  }

  /**
   * Get a single itinerary by ID with all related data
   * GET /api/itineraries/:id
   */
  async getItineraryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const itinerary = await prisma.itinerary.findUnique({
        where: { id },
        include: {
          stops: {
            include: {
              activities: true,
              hotels: true,
            },
            orderBy: {
              sequence: 'asc',
            },
          },
          flights: {
            orderBy: {
              departureDate: 'asc',
            },
          },
          budgetSummary: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!itinerary) {
        res.status(404).json({
          error: 'Itinerary not found',
        });
        return;
      }

      res.json({
        success: true,
        data: itinerary,
      });
    } catch (error: any) {
      console.error(`❌ Error fetching itinerary ${req.params.id}:`, error);
      res.status(500).json({
        error: 'Failed to fetch itinerary',
        message: error.message,
      });
    }
  }

  /**
   * Update an itinerary
   * PUT /api/itineraries/:id
   */
  async updateItinerary(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        totalBudget,
        currency,
        startDate,
        endDate,
        status,
      } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (totalBudget !== undefined)
        updateData.totalBudget = parseFloat(totalBudget);
      if (currency !== undefined) updateData.currency = currency;
      if (startDate !== undefined) updateData.startDate = new Date(startDate);
      if (endDate !== undefined) updateData.endDate = new Date(endDate);
      if (status !== undefined) updateData.status = status;

      const itinerary = await prisma.itinerary.update({
        where: { id },
        data: updateData,
        include: {
          stops: true,
          flights: true,
          budgetSummary: true,
        },
      });

      console.log(`✅ Updated itinerary: ${id}`);

      res.json({
        success: true,
        data: itinerary,
      });
    } catch (error: any) {
      console.error(`❌ Error updating itinerary ${req.params.id}:`, error);
      
      if (error.code === 'P2025') {
        res.status(404).json({
          error: 'Itinerary not found',
        });
        return;
      }

      res.status(500).json({
        error: 'Failed to update itinerary',
        message: error.message,
      });
    }
  }

  /**
   * Delete an itinerary
   * DELETE /api/itineraries/:id
   */
  async deleteItinerary(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.itinerary.delete({
        where: { id },
      });

      console.log(`✅ Deleted itinerary: ${id}`);

      res.json({
        success: true,
        message: 'Itinerary deleted successfully',
      });
    } catch (error: any) {
      console.error(`❌ Error deleting itinerary ${req.params.id}:`, error);

      if (error.code === 'P2025') {
        res.status(404).json({
          error: 'Itinerary not found',
        });
        return;
      }

      res.status(500).json({
        error: 'Failed to delete itinerary',
        message: error.message,
      });
    }
  }
}

export default new ItineraryController();
