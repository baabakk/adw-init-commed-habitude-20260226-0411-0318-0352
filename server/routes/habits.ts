import { Router, Request, Response } from 'express';
import * as habitsService from '../services/habits';
import * as habitModel from '../models/habit';
import * as authService from '../services/auth';

const router = Router();

// Authentication middleware
function authenticate(req: Request, res: Response, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  const session = authService.validateSession(token);

  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session',
    });
  }

  (req as any).userId = session.userId;
  next();
}

// Get all habits for user
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const habits = await habitModel.findHabitsByUserId(userId);

    res.json({
      success: true,
      habits,
    });
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Create new habit
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, goal, frequency, custom_times } = req.body;

    if (!name || !frequency) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, frequency',
      });
    }

    const result = await habitsService.createHabit({
      userId,
      name,
      goal,
      frequency,
      customTimes: custom_times,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get habit stats
router.get('/:habitId/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const habitId = parseInt(req.params.habitId, 10);

    if (isNaN(habitId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid habit ID',
      });
    }

    const stats = await habitsService.getHabitStats(habitId, userId);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Habit not found',
      });
    }

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Get habit stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Complete habit for today
router.post('/:habitId/complete', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const habitId = parseInt(req.params.habitId, 10);

    if (isNaN(habitId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid habit ID',
      });
    }

    const result = await habitsService.completeHabitForToday(habitId, userId, 'web');

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Complete habit error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Stop habit
router.post('/:habitId/stop', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const habitId = parseInt(req.params.habitId, 10);

    if (isNaN(habitId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid habit ID',
      });
    }

    const result = await habitsService.stopHabit(habitId, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Stop habit error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Delete habit
router.delete('/:habitId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const habitId = parseInt(req.params.habitId, 10);

    if (isNaN(habitId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid habit ID',
      });
    }

    const result = await habitsService.deleteHabit(habitId, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
