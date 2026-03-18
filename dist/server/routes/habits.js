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
const habitsService = __importStar(require("../services/habits"));
const habitModel = __importStar(require("../models/habit"));
const authService = __importStar(require("../services/auth"));
const router = (0, express_1.Router)();
// Authentication middleware
function authenticate(req, res, next) {
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
    req.userId = session.userId;
    next();
}
// Get all habits for user
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const habits = await habitModel.findHabitsByUserId(userId);
        res.json({
            success: true,
            habits,
        });
    }
    catch (error) {
        console.error('Get habits error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
// Create new habit
router.post('/', authenticate, async (req, res) => {
    try {
        const userId = req.userId;
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
    }
    catch (error) {
        console.error('Create habit error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
// Get habit stats
router.get('/:habitId/stats', authenticate, async (req, res) => {
    try {
        const userId = req.userId;
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
    }
    catch (error) {
        console.error('Get habit stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
// Complete habit for today
router.post('/:habitId/complete', authenticate, async (req, res) => {
    try {
        const userId = req.userId;
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
    }
    catch (error) {
        console.error('Complete habit error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
// Stop habit
router.post('/:habitId/stop', authenticate, async (req, res) => {
    try {
        const userId = req.userId;
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
    }
    catch (error) {
        console.error('Stop habit error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
// Delete habit
router.delete('/:habitId', authenticate, async (req, res) => {
    try {
        const userId = req.userId;
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
    }
    catch (error) {
        console.error('Delete habit error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=habits.js.map