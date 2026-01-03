import { Request, Response } from 'express';
import prisma from '../config/database';
import crypto from 'crypto';

export class ShareController {
  // Create a share link for a trip
  async createShareLink(req: Request, res: Response) {
    try {
      const { tripId } = req.body;
      const userId = (req as any).user.id;

      // Verify trip belongs to user
      const trip = await prisma.trip.findFirst({
        where: {
          id: tripId,
          userId,
        },
      });

      if (!trip) {
        return res.status(404).json({ error: 'Trip not found or unauthorized' });
      }

      // Generate unique share token
      const shareId = crypto.randomBytes(32).toString('hex');

      // Create share link
      const shareLink = await prisma.shareLink.create({
        data: {
          shareId,
          tripId,
          userId,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        include: {
          trip: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      return res.status(201).json({
        shareUrl: `${process.env.FRONTEND_URL}/shared/${shareId}`,
        shareId,
        expiresAt: shareLink.expiresAt,
        tripId: shareLink.tripId,
      });
    } catch (error) {
      console.error('Create share link error:', error);
      return res.status(500).json({ error: 'Failed to create share link' });
    }
  }

  // Get shared trip by token (public access)
  async getSharedTrip(req: Request, res: Response) {
    try {
      const { token } = req.params;

      const shareLink = await prisma.shareLink.findUnique({
        where: { shareId: token },
        include: {
          trip: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
              tripActivities: {
                include: {
                  activity: {
                    include: {
                      city: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!shareLink) {
        return res.status(404).json({ error: 'Share link not found' });
      }

      // Check if expired
      if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
        return res.status(410).json({ error: 'Share link has expired' });
      }

      return res.json({
        trip: shareLink.trip,
        sharedBy: shareLink.trip.user,
        expiresAt: shareLink.expiresAt,
      });
    } catch (error) {
      console.error('Get shared trip error:', error);
      return res.status(500).json({ error: 'Failed to get shared trip' });
    }
  }

  // Revoke a share link
  async revokeShareLink(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const userId = (req as any).user.id;

      // Verify share link belongs to user
      const shareLink = await prisma.shareLink.findUnique({
        where: { shareId: token },
      });

      if (!shareLink) {
        return res.status(404).json({ error: 'Share link not found' });
      }

      if (shareLink.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized to revoke this link' });
      }

      // Delete share link
      await prisma.shareLink.delete({
        where: { shareId: token },
      });

      return res.json({ message: 'Share link revoked successfully' });
    } catch (error) {
      console.error('Revoke share link error:', error);
      return res.status(500).json({ error: 'Failed to revoke share link' });
    }
  }

  // Get all share links for user's trips
  async getUserShareLinks(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const shareLinks = await prisma.shareLink.findMany({
        where: { userId },
        include: {
          trip: {
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.json(shareLinks);
    } catch (error) {
      console.error('Get user share links error:', error);
      return res.status(500).json({ error: 'Failed to get share links' });
    }
  }
}
