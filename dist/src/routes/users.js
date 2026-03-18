"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../models/user");
const error_handler_1 = require("../middleware/error-handler");
const router = (0, express_1.Router)();
// Create a new user
router.post('/', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const { username, email, phone_number, telegram_chat_id, whatsapp_number, timezone } = req.body;
    if (!username) {
        throw new error_handler_1.ValidationError('Username is required');
    }
    // Check if username already exists
    const existingUser = await user_1.UserModel.findByUsername(username);
    if (existingUser) {
        throw new error_handler_1.ValidationError('Username already exists');
    }
    const user = await user_1.UserModel.create({
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
router.get('/', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const users = await user_1.UserModel.findAll();
    res.json(users);
}));
// Get user by ID
router.get('/:id', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
        throw new error_handler_1.ValidationError('Invalid user ID');
    }
    const user = await user_1.UserModel.findById(userId);
    if (!user) {
        throw new error_handler_1.NotFoundError('User not found');
    }
    res.json(user);
}));
// Get user by username
router.get('/username/:username', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const { username } = req.params;
    const user = await user_1.UserModel.findByUsername(username);
    if (!user) {
        throw new error_handler_1.NotFoundError('User not found');
    }
    res.json(user);
}));
// Update user
router.put('/:id', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
        throw new error_handler_1.ValidationError('Invalid user ID');
    }
    const { email, phone_number, telegram_chat_id, whatsapp_number, timezone } = req.body;
    const user = await user_1.UserModel.update(userId, {
        email,
        phone_number,
        telegram_chat_id,
        whatsapp_number,
        timezone,
    });
    res.json(user);
}));
// Delete user
router.delete('/:id', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
        throw new error_handler_1.ValidationError('Invalid user ID');
    }
    const user = await user_1.UserModel.findById(userId);
    if (!user) {
        throw new error_handler_1.NotFoundError('User not found');
    }
    await user_1.UserModel.delete(userId);
    res.status(204).send();
}));
// Get user messaging preferences
router.get('/:id/preferences', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
        throw new error_handler_1.ValidationError('Invalid user ID');
    }
    const preferences = await user_1.UserModel.getMessagingPreferences(userId);
    res.json(preferences);
}));
exports.default = router;
