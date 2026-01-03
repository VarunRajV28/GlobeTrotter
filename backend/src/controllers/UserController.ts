import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Controller for User management (basic CRUD)
 */
export class UserController {
  /**
   * Create a new user
   * POST /api/users
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, password } = req.body;

      if (!email) {
        res.status(400).json({
          error: 'email is required',
        });
        return;
      }

      if (!password) {
        res.status(400).json({
          error: 'password is required',
        });
        return;
      }

      const user = await prisma.user.create({
        data: {
          email,
          name,
          password,
        },
      });

      console.log(`✅ Created user: ${user.id} - ${email}`);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      console.error('❌ Error creating user:', error);

      if (error.code === 'P2002') {
        res.status(409).json({
          error: 'User with this email already exists',
        });
        return;
      }

      res.status(500).json({
        error: 'Failed to create user',
        message: error.message,
      });
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          itineraries: {
            include: {
              stops: true,
              budgetSummary: true,
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({
          error: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      console.error(`❌ Error fetching user ${req.params.id}:`, error);
      res.status(500).json({
        error: 'Failed to fetch user',
        message: error.message,
      });
    }
  }

  /**
   * Get user by email
   * GET /api/users/email/:email
   */
  async getUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          itineraries: {
            include: {
              stops: true,
              budgetSummary: true,
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({
          error: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      console.error(`❌ Error fetching user by email ${req.params.email}:`, error);
      res.status(500).json({
        error: 'Failed to fetch user',
        message: error.message,
      });
    }
  }
}

export default new UserController();
