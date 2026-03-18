import { Router } from 'express';
import { AppDataSource } from '../db/connection';
import { Habit, Reminder, User } from '../db/models';
import { AuthenticatedRequest } from '../middleware/auth';
import { deliverReminder, ReminderChannel } from '../services/reminderDeliveryService';

const router = Router();

router.post('/', async (req: AuthenticatedRequest, res) => {
  const { habitId, time, frequency, channel } = req.body as {
    habitId: string;
    time: string;
    frequency: string;
    channel: ReminderChannel;
  };

  if (!habitId || !time || !channel) {
    return res.status(400).json({ error: 'habitId, time, and channel are required' });
  }

  const habitRepo = AppDataSource.getRepository(Habit);
  const reminderRepo = AppDataSource.getRepository(Reminder);

  const habit = await habitRepo.findOne({ where: { id: habitId, user: { id: req.user!.id } } });
  if (!habit) return res.status(404).json({ error: 'Habit not found' });

  const reminder = reminderRepo.create({ habit, time, frequency: frequency || 'daily', channel });
  await reminderRepo.save(reminder);

  res.status(201).json(reminder);
});

router.get('/', async (req: AuthenticatedRequest, res) => {
  const reminderRepo = AppDataSource.getRepository(Reminder);
  const reminders = await reminderRepo.find({
    where: { habit: { user: { id: req.user!.id } } },
    relations: ['habit']
  });
  res.json(reminders);
});

router.post('/:id/send-test', async (req: AuthenticatedRequest, res) => {
  const reminderRepo = AppDataSource.getRepository(Reminder);
  const userRepo = AppDataSource.getRepository(User);

  const reminder = await reminderRepo.findOne({
    where: { id: req.params.id, habit: { user: { id: req.user!.id } } },
    relations: ['habit', 'habit.user']
  });

  if (!reminder) return res.status(404).json({ error: 'Reminder not found' });

  const user = await userRepo.findOneBy({ id: req.user!.id });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const recipient =
    reminder.channel === 'sms'
      ? user.phoneNumber
      : reminder.channel === 'telegram'
      ? user.telegramChatId
      : user.whatsappNumber;

  if (!recipient) return res.status(400).json({ error: `No recipient configured for ${reminder.channel}` });

  await deliverReminder(reminder.channel, recipient, `Reminder: ${reminder.habit.name}`);
  res.json({ message: 'Test reminder sent' });
});

export default router;
