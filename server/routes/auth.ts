import { Router, Request, Response } from 'express';
import * as authService from '../services/auth';
import * as messaging from '../services/messaging';
import { MessagingChannel } from '../models/user';

const router = Router();

// Signup endpoint - initiate verification
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { messaging_channel, channel_identifier, timezone } = req.body;

    // Validate input
    if (!messaging_channel || !channel_identifier || !timezone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: messaging_channel, channel_identifier, timezone',
      });
    }

    // Validate messaging channel
    const validChannels: MessagingChannel[] = ['sms', 'telegram', 'whatsapp'];
    if (!validChannels.includes(messaging_channel)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid messaging channel. Must be: sms, telegram, or whatsapp',
      });
    }

    // Initiate signup
    const { user, code } = await authService.initiateSignup(
      messaging_channel,
      channel_identifier,
      timezone
    );

    // Send verification code
    const message = messaging.formatVerificationMessage(code);
    const sent = await messaging.sendMessage({
      channel: messaging_channel,
      recipient: channel_identifier,
      message,
    });

    if (!sent) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send verification code',
      });
    }

    res.json({
      success: true,
      message: 'Verification code sent',
      userId: user.id,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Verify code endpoint
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { channel_identifier, code } = req.body;

    if (!channel_identifier || !code) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: channel_identifier, code',
      });
    }

    const result = await authService.verifyCode(channel_identifier, code);

    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Login endpoint - resend verification code
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { channel_identifier } = req.body;

    if (!channel_identifier) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: channel_identifier',
      });
    }

    // Find user and resend code
    const userModel = await import('../models/user');
    const user = await userModel.findUserByChannelIdentifier(channel_identifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Generate new verification code
    const code = authService.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await userModel.updateVerificationCode(user.id, code, expiresAt);

    // Send verification code
    const message = messaging.formatVerificationMessage(code);
    const sent = await messaging.sendMessage({
      channel: user.messaging_channel,
      recipient: user.channel_identifier,
      message,
    });

    if (!sent) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send verification code',
      });
    }

    res.json({
      success: true,
      message: 'Verification code sent',
      userId: user.id,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Logout endpoint
router.post('/logout', (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      authService.destroySession(token);
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Session validation endpoint
router.get('/session', (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const session = authService.validateSession(token);

    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session',
      });
    }

    res.json({
      success: true,
      userId: session.userId,
    });
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
