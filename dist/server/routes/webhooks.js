"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messaging = __importStar(require("../services/messaging"));
const habitsService = __importStar(require("../services/habits"));
const userModel = __importStar(require("../models/user"));
const habitModel = __importStar(require("../models/habit"));
const router = (0, express_1.Router)();
// Twilio SMS webhook
router.post('/twilio/sms', async (req, res) => {
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
        }
        else {
            await messaging.sendMessage({
                channel: 'sms',
                recipient: From,
                message: result.error || 'Failed to complete habit',
            });
        }
        res.status(200).send('OK');
    }
    catch (error) {
        console.error('Twilio webhook error:', error);
        res.status(500).send('Internal server error');
    }
});
// Telegram webhook
router.post('/telegram', async (req, res) => {
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
        }
        else {
            await messaging.sendMessage({
                channel: 'telegram',
                recipient: chatId,
                message: result.error || 'Failed to complete habit',
            });
        }
        res.status(200).send('OK');
    }
    catch (error) {
        console.error('Telegram webhook error:', error);
        res.status(500).send('Internal server error');
    }
});
// WhatsApp webhook (via Twilio)
router.post('/twilio/whatsapp', async (req, res) => {
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
        }
        else {
            await messaging.sendMessage({
                channel: 'whatsapp',
                recipient: phoneNumber,
                message: result.error || 'Failed to complete habit',
            });
        }
        res.status(200).send('OK');
    }
    catch (error) {
        console.error('WhatsApp webhook error:', error);
        res.status(500).send('Internal server error');
    }
});
exports.default = router;
//# sourceMappingURL=webhooks.js.map