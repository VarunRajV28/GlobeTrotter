# GlobeTrotter Backend - Complete Implementation Guide

## What's Been Created

✅ Updated Prisma schema with Trip/City/Activity/ShareLink models  
✅ Authentication middleware (JWT)  
✅ AuthController with register/login/getMe  
✅ TripController with full CRUD + activities  
✅ Auth routes  
✅ Updated dependencies

## Setup Instructions

### 1. Replace Files

```bash
cd C:\Users\91902\Documents\Other_Projects\globetrotter\GlobeTrotter\backend

# Replace schema
copy prisma\schema_updated.prisma prisma\schema.prisma

# Replace package.json
copy package_updated.json package.json

# Install dependencies
npm install
```

### 2. Generate Prisma Client & Migrate

```bash
npx prisma generate
npx prisma migrate dev --name add-auth-and-trips
```

### 3. Create Remaining Files

Copy the following code into these new files:

---

## FILE: src/controllers/CityController.ts

```typescript
import { Request, Response } from 'express';
import prisma from '../config/database';

class CityController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '20', country, sortBy = 'popularity' } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (country) where.country = country;

      const orderBy: any = {};
      if (sortBy === 'name') orderBy.name = 'asc';
      else if (sortBy === 'popularity') orderBy.popularity = 'desc';
      else if (sortBy === 'costIndex') orderBy.costIndex = 'asc';

      const [cities, total] = await Promise.all([
        prisma.city.findMany({ where, skip, take: limitNum, orderBy }),
        prisma.city.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          cities,
          pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch cities' } });
    }
  }

  async search(req: Request, res: Response): Promise<void> {
    try {
      const { q, limit = '10' } = req.query;

      if (!q) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Search query required' } });
        return;
      }

      const cities = await prisma.city.findMany({
        where: {
          OR: [
            { name: { contains: q as string, mode: 'insensitive' } },
            { country: { contains: q as string, mode: 'insensitive' } },
          ],
        },
        take: parseInt(limit as string),
        orderBy: { popularity: 'desc' },
      });

      res.json({ success: true, data: { cities } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Search failed' } });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const city = await prisma.city.findUnique({
        where: { id: req.params.id },
        include: { activities: true },
      });

      if (!city) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'City not found' } });
        return;
      }

      res.json({ success: true, data: { city } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch city' } });
    }
  }
}

export default new CityController();
```

---

## FILE: src/controllers/ActivityController.ts

```typescript
import { Request, Response } from 'express';
import prisma from '../config/database';

class ActivityController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '20', cityId, category, sortBy = 'name' } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (cityId) where.cityId = cityId;
      if (category) where.category = category;

      const orderBy: any = {};
      if (sortBy === 'name') orderBy.name = 'asc';
      else if (sortBy === 'estimatedCost') orderBy.estimatedCost = 'asc';
      else if (sortBy === 'duration') orderBy.duration = 'asc';

      const [activities, total] = await Promise.all([
        prisma.activity.findMany({
          where,
          skip,
          take: limitNum,
          orderBy,
          include: { city: true },
        }),
        prisma.activity.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          activities,
          pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch activities' } });
    }
  }

  async search(req: Request, res: Response): Promise<void> {
    try {
      const { q, cityId, category, limit = '10' } = req.query;

      if (!q) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Search query required' } });
        return;
      }

      const where: any = {
        OR: [
          { name: { contains: q as string, mode: 'insensitive' } },
          { description: { contains: q as string, mode: 'insensitive' } },
        ],
      };

      if (cityId) where.cityId = cityId;
      if (category) where.category = category;

      const activities = await prisma.activity.findMany({
        where,
        take: parseInt(limit as string),
        include: { city: true },
      });

      res.json({ success: true, data: { activities } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Search failed' } });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const activity = await prisma.activity.findUnique({
        where: { id: req.params.id },
        include: { city: true },
      });

      if (!activity) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Activity not found' } });
        return;
      }

      res.json({ success: true, data: { activity } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch activity' } });
    }
  }
}

export default new ActivityController();
```

---

## FILE: src/controllers/ShareController.ts

```typescript
import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/database';

class ShareController {
  async generateShareLink(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const { id: tripId } = req.params;
      const { expiresIn } = req.body;

      const trip = await prisma.trip.findUnique({ where: { id: tripId } });
      if (!trip || trip.userId !== req.user.userId) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Trip not found' } });
        return;
      }

      const shareId = crypto.randomBytes(16).toString('hex');
      const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000) : null;

      const shareLink = await prisma.shareLink.create({
        data: {
          shareId,
          tripId,
          userId: req.user.userId,
          expiresAt,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          shareId: shareLink.shareId,
          shareUrl: `${req.protocol}://${req.get('host')}/shared/${shareLink.shareId}`,
          expiresAt: shareLink.expiresAt,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create share link' } });
    }
  }

  async getSharedTrip(req: Request, res: Response): Promise<void> {
    try {
      const { shareId } = req.params;

      const shareLink = await prisma.shareLink.findUnique({
        where: { shareId },
        include: {
          trip: {
            include: {
              tripActivities: {
                include: {
                  activity: {
                    include: { city: true },
                  },
                },
              },
            },
          },
          user: {
            select: { name: true, avatar: true },
          },
        },
      });

      if (!shareLink) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Share link not found' } });
        return;
      }

      if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
        res.status(410).json({ success: false, error: { code: 'EXPIRED', message: 'Share link has expired' } });
        return;
      }

      res.json({
        success: true,
        data: {
          trip: shareLink.trip,
          creator: shareLink.user,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch shared trip' } });
    }
  }

  async copyTripToUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const { shareId } = req.params;
      const { name: customName } = req.body;

      const shareLink = await prisma.shareLink.findUnique({
        where: { shareId },
        include: {
          trip: {
            include: {
              tripActivities: true,
            },
          },
        },
      });

      if (!shareLink) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Share link not found' } });
        return;
      }

      if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
        res.status(410).json({ success: false, error: { code: 'EXPIRED', message: 'Share link has expired' } });
        return;
      }

      const newTrip = await prisma.trip.create({
        data: {
          userId: req.user.userId,
          name: customName || `Copy of ${shareLink.trip.name}`,
          description: shareLink.trip.description,
          startDate: shareLink.trip.startDate,
          endDate: shareLink.trip.endDate,
          coverImageUrl: shareLink.trip.coverImageUrl,
          isPublic: false,
          budget: shareLink.trip.budget,
          destinations: shareLink.trip.destinations,
          tripActivities: {
            create: shareLink.trip.tripActivities.map((ta) => ({
              activityId: ta.activityId,
              date: ta.date,
              notes: ta.notes,
            })),
          },
        },
      });

      res.status(201).json({ success: true, data: { trip: newTrip } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to copy trip' } });
    }
  }
}

export default new ShareController();
```

---

## FILE: src/controllers/AdminController.ts

```typescript
import { Request, Response } from 'express';
import prisma from '../config/database';
import { UserStatus } from '@prisma/client';

class AdminController {
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const [totalUsers, totalTrips, totalActivities, activeUsers] = await Promise.all([
        prisma.user.count(),
        prisma.trip.count(),
        prisma.activity.count(),
        prisma.user.count({ where: { status: 'ACTIVE' } }),
      ]);

      const topCities = await prisma.activity.groupBy({
        by: ['cityId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      });

      const cityDetails = await prisma.city.findMany({
        where: { id: { in: topCities.map((tc) => tc.cityId) } },
      });

      res.json({
        success: true,
        data: {
          totalUsers,
          totalTrips,
          totalActivities,
          activeUsers,
          topCities: topCities.map((tc) => {
            const city = cityDetails.find((c) => c.id === tc.cityId);
            return { name: city?.name || 'Unknown', count: tc._count.id };
          }),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' } });
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '20', status } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (status) where.status = status;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limitNum,
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            status: true,
            lastLogin: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          users,
          pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch users' } });
    }
  }

  async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(UserStatus).includes(status)) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid status' } });
        return;
      }

      await prisma.user.update({
        where: { id },
        data: { status },
      });

      res.json({ success: true, message: 'User status updated successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update user status' } });
    }
  }
}

export default new AdminController();
```

---

## Continue in next message for routes and seeding...

