import { Router, Request, Response } from 'express';
import { UserModel } from '../models/user';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware/error-handler';

const router = Router();

// Create a new user
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { username, email, phone_number, telegram_chat_id, whatsapp_number, timezone } = req.body;

  if (!username) {
    throw new ValidationError('Username is required');
  }

  // Check if username already exists
  const existingUser = await UserModel.findByUsername(username);
  if (existingUser) {
    throw new ValidationError('Username already exists');
  }

  const user = await UserModel.create({
    username,
    email,
    phone_number,
    telegram_chat_id,
    whatsapp_number,
    timezone,
  });

  res.status(201).json(user);
}));

// Get all users
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const users = await UserModel.findAll();
  res.json(users);
}));

// Get user by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    throw new ValidationError('Invalid user ID');
  }

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.json(user);
}));

// Get user by username
router.get('/username/:username', asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;

  const user = await UserModel.findByUsername(username);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.json(user);
}));

// Update user
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    throw new ValidationError('Invalid user ID');
  }

  const { email, phone_number, telegram_chat_id, whatsapp_number, timezone } = req.body;

  const user = await UserModel.update(userId, {
    email,
    phone_number,
    telegram_chat_id,
    whatsapp_number,
    timezone,
  });

  res.json(user);
}));

// Delete user
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    throw new ValidationError('Invalid user ID');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  await UserModel.delete(userId);

  res.status(204).send();
}));

// Get user messaging preferences
router.get('/:id/preferences', asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    throw new ValidationError('Invalid user ID');
  }

  const preferences = await UserModel.getMessagingPreferences(userId);

  res.json(preferences);
}));

export default router;
