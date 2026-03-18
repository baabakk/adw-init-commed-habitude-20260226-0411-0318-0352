"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("./auth");
const router = (0, express_1.Router)();
// Helper to extract user id from request (set by auth middleware)
const getUserId = (req) => {
    const user = req.user;
    return user?.id;
};
// CREATE habit
router.post('/', auth_1.authenticate, async (req, res) => {
    const userId = getUserId(req);
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Habit name required' });
    }
    try {
        const result = await (0, db_1.query)('INSERT INTO habits (user_id, name, description, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id', [userId, name, description || null]);
        const habitId = result.rows[0].id;
        res.status(201).json({ id: habitId, name, description });
    }
    catch (err) {
        console.error('Create habit error', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// READ habit by id
router.get('/:id', auth_1.authenticate, async (req, res) => {
    const userId = getUserId(req);
    const habitId = Number(req.params.id);
    try {
        const result = await (0, db_1.query)('SELECT id, name, description, created_at, updated_at FROM habits WHERE id = $1 AND user_id = $2', [habitId, userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Habit not found' });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error('Get habit error', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// LIST all habits for user
router.get('/', auth_1.authenticate, async (req, res) => {
    const userId = getUserId(req);
    try {
        const result = await (0, db_1.query)('SELECT id, name, description, created_at, updated_at FROM habits WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(result.rows);
    }
    catch (err) {
        console.error('List habits error', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// UPDATE habit (partial)
router.patch('/:id', auth_1.authenticate, async (req, res) => {
    const userId = getUserId(req);
    const habitId = Number(req.params.id);
    const { name, description } = req.body;
    if (!name && !description) {
        return res.status(400).json({ error: 'At least one field (name or description) required' });
    }
    const fields = [];
    const values = [];
    let idx = 1;
    if (name) {
        fields.push(`name = $${idx++}`);
        values.push(name);
    }
    if (description !== undefined) {
        fields.push(`description = $${idx++}`);
        values.push(description);
    }
    values.push(habitId, userId);
    const setClause = fields.join(', ');
    const sql = `UPDATE habits SET ${setClause}, updated_at = NOW() WHERE id = $${idx++} AND user_id = $${idx} RETURNING id, name, description`;
    try {
        const result = await (0, db_1.query)(sql, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Habit not found' });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error('Update habit error', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE habit
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    const userId = getUserId(req);
    const habitId = Number(req.params.id);
    try {
        await (0, db_1.query)('DELETE FROM habits WHERE id = $1 AND user_id = $2', [habitId, userId]);
        res.status(204).send();
    }
    catch (err) {
        console.error('Delete habit error', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// MARK habit as complete for a given date (default today)
router.post('/:id/complete', auth_1.authenticate, async (req, res) => {
    const userId = getUserId(req);
    const habitId = Number(req.params.id);
    const { date } = req.body; // expected ISO string, optional
    const completionDate = date ? new Date(date) : new Date();
    const isoDate = completionDate.toISOString().split('T')[0]; // YYYY-MM-DD
    try {
        // Upsert completion (one per day)
        await (0, db_1.query)(`INSERT INTO completions (habit_id, user_id, completed_at) VALUES ($1, $2, $3)
       ON CONFLICT (habit_id, user_id, completed_at) DO NOTHING`, [habitId, userId, isoDate]);
        res.status(200).json({ habitId, date: isoDate });
    }
    catch (err) {
        console.error('Complete habit error', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET progress data for chart (last 30 days)
router.get('/:id/progress', auth_1.authenticate, async (req, res) => {
    const userId = getUserId(req);
    const habitId = Number(req.params.id);
    try {
        const result = await (0, db_1.query)(`SELECT completed_at::date AS date, COUNT(*) AS count
       FROM completions
       WHERE habit_id = $1 AND user_id = $2 AND completed_at >= (CURRENT_DATE - INTERVAL '30 days')
       GROUP BY date
       ORDER BY date`, [habitId, userId]);
        // Build array of dates for last 30 days with count 0 if missing
        const data = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const iso = d.toISOString().split('T')[0];
            const row = result.rows.find((r) => r.date === iso);
            data.push({ date: iso, count: row ? Number(row.count) : 0 });
        }
        res.json(data);
    }
    catch (err) {
        console.error('Progress error', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
