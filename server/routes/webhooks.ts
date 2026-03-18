import { Router, Request, Response } from 'express';
import * as messaging from '../services/messaging';
import * as habitsService from '../services/habits';
import * as userModel from '../models/user';
import * as habitModel from '../models/habit';

const router = Router();

// Twilio SMS webhook
router.post('/twilio/sms', async (req: Request, res: Response) => {
  try {
    const { From, Body } = req.body;

    if (!From || !Body) {
      return res.status(400).send('Missing required fields');
    }

    console.log('Received SMS from:', From, 'Body:', Body);

    // Find user by phone number
    const user = await userModel.findUserByChannelIdentifier(From);

    if (!user) {
      console.log('User not found for phone number:', From);
      return res.status(200).send('OK');
    }

    // Parse completion reply
    const habitId = messaging.parseCompletionReply(Body);

    if (!habitId) {
      console.log('Could not parse habit ID from message:', Body);
      // Send help message
      await messaging.sendMessage({
        channel: 'sms',
        recipient: From,
        message: 'To mark a habit complete, reply with: Habit (ID): done',
      });
      return res.status(200).send('OK');
    }

    // Verify habit belongs to user
    const habit = await habitModel.findHabitById(habitId);

    if (!habit || habit.user_id !== user.id) {
      console.log('Habit not found or does not belong to user');
      await messaging.sendMessage({
        channel: 'sms',
        recipient: From,
        message: 'Habit not found. Please check the habit ID.',
      });
      return res.status(200).send('OK');
    }

    // Complete the habit
    const result = await habitsService.completeHabitForToday(habitId, user.id, 'sms');

    if (result.success) {
      const confirmMessage = messaging.formatCompletionConfirmation(habit.name);
      await messaging.sendMessage({
        channel: 'sms',
        recipient: From,
        message: confirmMessage,
      });
    } else {
      await messaging.sendMessage({
        channel: 'sms',
        recipient: From,
        message: result.error || 'Failed to complete habit',
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Twilio webhook error:', error);
    res.status(500).send('Internal server error');
  }
});

// Telegram webhook
router.post('/telegram', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || !message.text || !message.from) {
      return res.status(200).send('OK');
    }

    const chatId = message.chat.id.toString();
    const text = message.text;

    console.log('Received Telegram message from:', chatId, 'Text:', text);

    // Find user by chat ID
    const user = await userModel.findUserByChannelIdentifier(chatId);

    if (!user) {
      console.log('User not found for chat ID:', chatId);
      return res.status(200).send('OK');
    }

    // Parse completion reply
    const habitId = messaging.parseCompletionReply(text);

    if (!habitId) {
      console.log('Could not parse habit ID from message:', text);
      // Send help message
      await messaging.sendMessage({
        channel: 'telegram',
        recipient: chatId,
        message: 'To mark a habit complete, reply with: Habit (ID): done',
      });
      return res.status(200).send('OK');
    }

    // Verify habit belongs to user
    const habit = await habitModel.findHabitById(habitId);

    if (!habit || habit.user_id !== user.id) {
      console.log('Habit not found or does not belong to user');
      await messaging.sendMessage({
        channel: 'telegram',
        recipient: chatId,
        message: 'Habit not found. Please check the habit ID.',
      });
      return res.status(200).send('OK');
    }

    // Complete the habit
    const result = await habitsService.completeHabitForToday(habitId, user.id, 'telegram');

    if (result.success) {
      const confirmMessage = messaging.formatCompletionConfirmation(habit.name);
      await messaging.sendMessage({
        channel: 'telegram',
        recipient: chatId,
        message: confirmMessage,
      });
    } else {
      await messaging.sendMessage({
        channel: 'telegram',
        recipient: chatId,
        message: result.error || 'Failed to complete habit',
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.status(500).send('Internal server error');
  }
});

// WhatsApp webhook (via Twilio)
router.post('/twilio/whatsapp', async (req: Request, res: Response) => {
  try {
    const { From, Body } = req.body;

    if (!From || !Body) {
      return res.status(400).send('Missing required fields');
    }

    // Remove 'whatsapp:' prefix
    const phoneNumber = From.replace('whatsapp:', '');

    console.log('Received WhatsApp message from:', phoneNumber, 'Body:', Body);

    // Find user by phone number
    const user = await userModel.findUserByChannelIdentifier(phoneNumber);

    if (!user) {
      console.log('User not found for phone number:', phoneNumber);
      return res.status(200).send('OK');
    }

    // Parse completion reply
    const habitId = messaging.parseCompletionReply(Body);

    if (!habitId) {
      console.log('Could not parse habit ID from message:', Body);
      // Send help message
      await messaging.sendMessage({
        channel: 'whatsapp',
        recipient: phoneNumber,
        message: 'To mark a habit complete, reply with: Habit (ID): done',
      });
      return res.status(200).send('OK');
    }

    // Verify habit belongs to user
    const habit = await habitModel.findHabitById(habitId);

    if (!habit || habit.user_id !== user.id) {
      console.log('Habit not found or does not belong to user');
      await messaging.sendMessage({
        channel: 'whatsapp',
        recipient: phoneNumber,
        message: 'Habit not found. Please check the habit ID.',
      });
      return res.status(200).send('OK');
    }

    // Complete the habit
    const result = await habitsService.completeHabitForToday(habitId, user.id, 'whatsapp');

    if (result.success) {
      const confirmMessage = messaging.formatCompletionConfirmation(habit.name);
      await messaging.sendMessage({
        channel: 'whatsapp',
        recipient: phoneNumber,
        message: confirmMessage,
      });
    } else {
      await messaging.sendMessage({
        channel: 'whatsapp',
        recipient: phoneNumber,
        message: result.error || 'Failed to complete habit',
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).send('Internal server error');
  }
});

export default router;
