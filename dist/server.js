"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const data_store_1 = require("./data-store");
const reminders_1 = require("./reminders");
const streaks_1 = require("./utils/streaks");
const charts_1 = require("./utils/charts");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Get all habits
app.get('/api/habits', (req, res) => {
    res.json(data_store_1.habits);
});
// Create a new habit
app.post('/api/habits', (req, res) => {
    const { name, reminderTime, reminderChannels } = req.body;
    if (!name || !reminderTime || !reminderChannels) {
        return res.status(400).json({ error: 'Name, reminderTime, and reminderChannels are required' });
    }
    try {
        const habit = (0, data_store_1.addHabit)(name, reminderTime, reminderChannels);
        (0, reminders_1.scheduleReminders)(); // Re-schedule all reminders
        res.status(201).json(habit);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Mark habit as complete for today
app.post('/api/habits/:id/complete', (req, res) => {
    const habitId = parseInt(req.params.id, 10);
    const habit = data_store_1.habits.find(h => h.id === habitId);
    if (!habit) {
        return res.status(404).json({ error: 'Habit not found' });
    }
    (0, data_store_1.markHabitComplete)(habitId);
    const streak = (0, streaks_1.calculateStreak)(habitId);
    res.json({ success: true, streak });
});
// Get progress data for chart
app.get('/api/habits/:id/progress', (req, res) => {
    const habitId = parseInt(req.params.id, 10);
    const habit = data_store_1.habits.find(h => h.id === habitId);
    if (!habit) {
        return res.status(404).json({ error: 'Habit not found' });
    }
    const progress = (0, data_store_1.getHabitProgress)(habitId);
    const chartData = (0, charts_1.generateChartData)(progress);
    res.json(chartData);
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    (0, reminders_1.scheduleReminders)(); // Start reminder scheduler
});
exports.default = app;
