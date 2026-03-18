"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completions = exports.habits = void 0;
exports.addHabit = addHabit;
exports.markHabitComplete = markHabitComplete;
exports.getHabitProgress = getHabitProgress;
exports.getHabitById = getHabitById;
let habits = [];
exports.habits = habits;
let completions = [];
exports.completions = completions;
let currentId = 1;
function addHabit(name, reminderTime, reminderChannels) {
    // Validate input
    if (!name.trim()) {
        throw new Error('Habit name cannot be empty');
    }
    if (habits.some(h => h.name.toLowerCase() === name.toLowerCase())) {
        throw new Error('A habit with this name already exists');
    }
    const habit = {
        id: currentId++,
        name,
        reminderTime,
        reminderChannels,
        createdAt: new Date()
    };
    habits.push(habit);
    return habit;
}
function markHabitComplete(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) {
        throw new Error('Habit not found');
    }
    const today = new Date().toISOString().split('T')[0];
    const existing = completions.find(c => c.habitId === habitId && c.date === today);
    if (existing) {
        // Update completion time if already completed today
        existing.completedAt = new Date();
    }
    else {
        // Add new completion
        completions.push({
            habitId,
            date: today,
            completedAt: new Date()
        });
    }
}
function getHabitProgress(habitId) {
    return completions
        .filter(c => c.habitId === habitId)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
function getHabitById(habitId) {
    return habits.find(h => h.id === habitId);
}
