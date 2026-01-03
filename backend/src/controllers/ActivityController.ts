import { Request, Response } from 'express';
import prisma from '../config/database';
import { ActivityCategory } from '@prisma/client';

export class ActivityController {
  // Search activities using Amadeus API or database
  async searchActivities(req: Request, res: Response) {
    try {
      const { cityId, keyword, category, limit = '20' } = req.query;

      let activities;

      if (cityId && typeof cityId === 'string') {
        // Search activities for specific city
        const whereClause: any = { cityId };
        
        if (keyword && typeof keyword === 'string') {
          whereClause.OR = [
            { name: { contains: keyword, mode: 'insensitive' } },
            { description: { contains: keyword, mode: 'insensitive' } },
          ];
        }

        if (category && typeof category === 'string') {
          whereClause.category = category as ActivityCategory;
        }

        activities = await prisma.activity.findMany({
          where: whereClause,
          take: parseInt(limit as string),
          include: {
            city: true,
          },
        });

        return res.json(activities);
      }

      // General search
      const whereClause: any = {};
      if (keyword && typeof keyword === 'string') {
        whereClause.OR = [
          { name: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ];
      }

      if (category && typeof category === 'string') {
        whereClause.category = category as ActivityCategory;
      }

      activities = await prisma.activity.findMany({
        where: whereClause,
        take: parseInt(limit as string),
        include: {
          city: true,
        },
      });

      return res.json(activities);
    } catch (error) {
      console.error('Search activities error:', error);
      return res.status(500).json({ error: 'Failed to search activities' });
    }
  }

  // Get activity by ID
  async getActivityById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const activity = await prisma.activity.findUnique({
        where: { id },
        include: {
          city: true,
        },
      });

      if (!activity) {
        return res.status(404).json({ error: 'Activity not found' });
      }

      return res.json(activity);
    } catch (error) {
      console.error('Get activity error:', error);
      return res.status(500).json({ error: 'Failed to get activity' });
    }
  }

  // Get activities by city
  async getActivitiesByCity(req: Request, res: Response) {
    try {
      const { cityId } = req.params;
      const { category, limit = '20' } = req.query;

      const whereClause: any = { cityId };
      
      if (category && typeof category === 'string') {
        whereClause.category = category as ActivityCategory;
      }

      const activities = await prisma.activity.findMany({
        where: whereClause,
        take: parseInt(limit as string),
        orderBy: {
          rating: 'desc',
        },
      });

      return res.json(activities);
    } catch (error) {
      console.error('Get activities by city error:', error);
      return res.status(500).json({ error: 'Failed to get activities' });
    }
  }

  // Helper: Map Amadeus activity type to our category
  private mapCategory(type: string): ActivityCategory {
    const lowerType = type.toLowerCase();
    
    if (lowerType.includes('museum') || lowerType.includes('art') || lowerType.includes('culture')) {
      return ActivityCategory.CULTURE;
    }
    if (lowerType.includes('food') || lowerType.includes('restaurant') || lowerType.includes('dining')) {
      return ActivityCategory.FOOD_DRINK;
    }
    if (lowerType.includes('adventure') || lowerType.includes('sport')) {
      return ActivityCategory.ADVENTURE;
    }
    if (lowerType.includes('nature') || lowerType.includes('park') || lowerType.includes('outdoor')) {
      return ActivityCategory.SPORTS; // Using SPORTS as closest match for nature
    }
    if (lowerType.includes('shop') || lowerType.includes('market')) {
      return ActivityCategory.SHOPPING;
    }
    if (lowerType.includes('night') || lowerType.includes('club') || lowerType.includes('bar')) {
      return ActivityCategory.NIGHTLIFE;
    }
    if (lowerType.includes('relax') || lowerType.includes('spa') || lowerType.includes('wellness')) {
      return ActivityCategory.RELAXATION;
    }
    if (lowerType.includes('sight') || lowerType.includes('tour')) {
      return ActivityCategory.SIGHTSEEING;
    }

    return ActivityCategory.TRANSPORTATION;
  }
}
