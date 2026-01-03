import { Request, Response } from 'express';
import prisma from '../config/database';

export class CityController {
  // Search cities using Amadeus API or database
  async searchCities(req: Request, res: Response) {
    try {
      const { keyword, limit = '10' } = req.query;

      if (!keyword || typeof keyword !== 'string') {
        return res.status(400).json({ error: 'Keyword is required' });
      }

      // First try to get from database
      const dbCities = await prisma.city.findMany({
        where: {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { country: { contains: keyword, mode: 'insensitive' } },
          ],
        },
        take: parseInt(limit as string),
      });

      return res.json(dbCities);
    } catch (error) {
      console.error('Search cities error:', error);
      return res.status(500).json({ error: 'Failed to search cities' });
    }
  }

  // Get city by ID
  async getCityById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const city = await prisma.city.findUnique({
        where: { id },
        include: {
          activities: true,
        },
      });

      if (!city) {
        return res.status(404).json({ error: 'City not found' });
      }

      return res.json(city);
    } catch (error) {
      console.error('Get city error:', error);
      return res.status(500).json({ error: 'Failed to get city' });
    }
  }

  // Get popular cities (most visited)
  async getPopularCities(req: Request, res: Response) {
    try {
      const { limit = '10' } = req.query;

      const cities = await prisma.city.findMany({
        take: parseInt(limit as string),
        orderBy: {
          activities: {
            _count: 'desc',
          },
        },
        include: {
          _count: {
            select: { activities: true },
          },
        },
      });

      return res.json(cities);
    } catch (error) {
      console.error('Get popular cities error:', error);
      return res.status(500).json({ error: 'Failed to get popular cities' });
    }
  }
}
