import { Request, Response } from 'express';
import prisma from '../config/database';
import { UserStatus } from '@prisma/client';

export class AdminController {
  // Get dashboard statistics
  async getStats(req: Request, res: Response) {
    try {
      const [
        totalUsers,
        activeUsers,
        totalTrips,
        totalCities,
        totalActivities,
        totalShares,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
        prisma.trip.count(),
        prisma.city.count(),
        prisma.activity.count(),
        prisma.shareLink.count(),
      ]);

      // Get recent users
      const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          status: true,
        },
      });

      // Get recent trips
      const recentTrips = await prisma.trip.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: { tripActivities: true },
          },
        },
      });

      // Get popular cities
      const popularCities = await prisma.city.findMany({
        take: 5,
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

      return res.json({
        stats: {
          totalUsers,
          activeUsers,
          totalTrips,
          totalCities,
          totalActivities,
          totalShares,
        },
        recentUsers,
        recentTrips,
        popularCities,
      });
    } catch (error) {
      console.error('Get stats error:', error);
      return res.status(500).json({ error: 'Failed to get statistics' });
    }
  }

  // Get all users with pagination
  async getAllUsers(req: Request, res: Response) {
    try {
      const { page = '1', limit = '20', status, search } = req.query;
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const whereClause: any = {};

      if (status && typeof status === 'string') {
        whereClause.status = status as UserStatus;
      }

      if (search && typeof search === 'string') {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          skip,
          take: parseInt(limit as string),
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            status: true,
            createdAt: true,
            lastLogin: true,
            _count: {
              select: { trips: true },
            },
          },
        }),
        prisma.user.count({ where: whereClause }),
      ]);

      return res.json({
        users,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      console.error('Get all users error:', error);
      return res.status(500).json({ error: 'Failed to get users' });
    }
  }

  // Update user status (suspend/activate)
  async updateUserStatus(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      if (!status || !Object.values(UserStatus).includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { status },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
        },
      });

      return res.json(user);
    } catch (error) {
      console.error('Update user status error:', error);
      return res.status(500).json({ error: 'Failed to update user status' });
    }
  }

  // Get all trips with pagination
  async getAllTrips(req: Request, res: Response) {
    try {
      const { page = '1', limit = '20', status, userId } = req.query;
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const whereClause: any = {};

      if (status && typeof status === 'string') {
        whereClause.status = status;
      }

      if (userId && typeof userId === 'string') {
        whereClause.userId = userId;
      }

      const [trips, total] = await Promise.all([
        prisma.trip.findMany({
          where: whereClause,
          skip,
          take: parseInt(limit as string),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: { tripActivities: true },
            },
          },
        }),
        prisma.trip.count({ where: whereClause }),
      ]);

      return res.json({
        trips,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      console.error('Get all trips error:', error);
      return res.status(500).json({ error: 'Failed to get trips' });
    }
  }

  // Delete user (admin only)
  async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Cannot delete admin users
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role === 'ADMIN') {
        return res.status(403).json({ error: 'Cannot delete admin users' });
      }

      // Delete user and all related data (cascading)
      await prisma.user.delete({
        where: { id: userId },
      });

      return res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  }
}
