"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initializeDatabase = initializeDatabase;
exports.query = query;
exports.queryOne = queryOne;
exports.execute = execute;
exports.closeDatabase = closeDatabase;
exports.getDatabase = getDatabase;
exports.getUser = getUser;
exports.getHabitsByUser = getHabitsByUser;
exports.createHabit = createHabit;
exports.getHabit = getHabit;
exports.updateHabit = updateHabit;
exports.getCompletionsByDate = getCompletionsByDate;
exports.createCompletion = createCompletion;
exports.getCompletionsByHabit = getCompletionsByHabit;
exports.updateStreak = updateStreak;
exports.getStreak = getStreak;
const sqlite3_1 = __importDefault(require("sqlite3"));
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = __importDefault(require("./config"));
const sqlite = sqlite3_1.default.verbose();
let db;
async function initializeDatabase() {
    return new Promise((resolve, reject) => {
        // Ensure data directory exists
        const dbDir = path_1.default.dirname(config_1.default.databasePath);
        if (!fs_1.default.existsSync(dbDir)) {
            fs_1.default.mkdirSync(dbDir, { recursive: true });
        }
        db = new sqlite.Database(config_1.default.databasePath, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
                return;
            }
            console.log('Connected to SQLite database');
            createTables()
                .then(() => resolve())
                .catch(reject);
        });
    });
}
async function createTables() {
    const run = (0, util_1.promisify)(db.run.bind(db));
    // Users table
    await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      phone_number TEXT,
      telegram_chat_id TEXT,
      whatsapp_number TEXT,
      timezone TEXT DEFAULT 'UTC',
      created_at TEXT DEFAULT (datetime('now', 'utc')),
      updated_at TEXT DEFAULT (datetime('now', 'utc'))
    )
  `);
    // Habits table
    await run(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      goal TEXT,
      reminder_time TEXT,
      reminder_frequency TEXT DEFAULT 'daily',
      reminder_enabled INTEGER DEFAULT 1,
      preferred_channel TEXT DEFAULT 'sms',
      created_at TEXT DEFAULT (datetime('now', 'utc')),
      updated_at TEXT DEFAULT (datetime('now', 'utc')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
    // Habit completions table
    await run(`
    CREATE TABLE IF NOT EXISTS habit_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      completion_date TEXT NOT NULL,
      completed_at TEXT DEFAULT (datetime('now', 'utc')),
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      UNIQUE(habit_id, completion_date)
    )
  `);
    // Streaks table (optional for persistence)
    await run(`
    CREATE TABLE IF NOT EXISTS streaks (
      habit_id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      current_streak INTEGER NOT NULL,
      longest_streak INTEGER NOT NULL,
      last_completion_date TEXT,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
    // Messaging delivery log table
    await run(`
    CREATE TABLE IF NOT EXISTS message_delivery_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      habit_id INTEGER,
      channel TEXT NOT NULL,
      recipient TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL,
      attempt_count INTEGER DEFAULT 1,
      error_message TEXT,
      sent_at TEXT DEFAULT (datetime('now', 'utc')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE SET NULL
    )
  `);
    // Rate limit tracking table
    await run(`
    CREATE TABLE IF NOT EXISTS rate_limit_tracking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel TEXT NOT NULL,
      window_start TEXT NOT NULL,
      window_type TEXT NOT NULL,
      message_count INTEGER DEFAULT 0,
      UNIQUE(channel, window_start, window_type)
    )
  `);
    // Create indexes for performance
    await run(`CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_completions_habit_id ON habit_completions(habit_id)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_completions_date ON habit_completions(completion_date)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_message_log_user_id ON message_delivery_log(user_id)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_rate_limit_channel ON rate_limit_tracking(channel, window_start)`);
    console.log('Database tables created successfully');
}
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Query error:', err, 'SQL:', sql);
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}
function queryOne(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error('Query error:', err, 'SQL:', sql);
                reject(err);
            }
            else {
                resolve(row);
            }
        });
    });
}
function execute(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                console.error('Execute error:', err, 'SQL:', sql);
                reject(err);
            }
            else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
}
function closeDatabase() {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    console.log('Database connection closed');
                    resolve();
                }
            });
        }
        else {
            resolve();
        }
    });
}
function getDatabase() {
    return db;
}
/** Additional helper methods used by services */
async function getUser(userId) {
    return queryOne('SELECT * FROM users WHERE id = ?', [userId]);
}
async function getHabitsByUser(userId) {
    return query('SELECT * FROM habits WHERE user_id = ?', [userId]);
}
async function createHabit(habit) {
    const result = await execute(`INSERT INTO habits (user_id, name, description, goal, created_at, isActive)
     VALUES (?, ?, ?, ?, ?, ?)`, [habit.userId, habit.name, habit.description, habit.goal, habit.createdAt.toISOString(), habit.isActive ? 1 : 0]);
    return { ...habit, id: String(result.lastID) };
}
async function getHabit(habitId) {
    return queryOne('SELECT * FROM habits WHERE id = ?', [habitId]);
}
async function updateHabit(habitId, updates) {
    const fields = Object.keys(updates);
    if (fields.length === 0)
        return getHabit(habitId);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const params = fields.map(f => updates[f]);
    params.push(habitId);
    await execute(`UPDATE habits SET ${setClause} WHERE id = ?`, params);
    return getHabit(habitId);
}
async function getCompletionsByDate(habitId, date) {
    return query('SELECT * FROM habit_completions WHERE habit_id = ? AND completion_date = ?', [habitId, date]);
}
async function createCompletion(completion) {
    const result = await execute(`INSERT INTO habit_completions (habit_id, completion_date, completed_at)
     VALUES (?, ?, ?)`, [completion.habitId, completion.date, completion.completedAt.toISOString()]);
    return { ...completion, id: String(result.lastID) };
}
async function getCompletionsByHabit(habitId) {
    return query('SELECT * FROM habit_completions WHERE habit_id = ?', [habitId]);
}
async function updateStreak(habitId, streak) {
    await execute(`INSERT INTO streaks (habit_id, user_id, current_streak, longest_streak, last_completion_date)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(habit_id) DO UPDATE SET 
       user_id = excluded.user_id,
       current_streak = excluded.current_streak,
       longest_streak = excluded.longest_streak,
       last_completion_date = excluded.last_completion_date`, [habitId, streak.userId, streak.currentStreak, streak.longestStreak, streak.lastCompletionDate]);
    return streak;
}
async function getStreak(habitId) {
    return queryOne('SELECT * FROM streaks WHERE habit_id = ?', [habitId]);
}
// Export a db-like object for compatibility
exports.db = {
    getUser,
    getHabitsByUser,
    createHabit,
    getHabit,
    updateHabit,
    getCompletionsByDate,
    createCompletion,
    getCompletionsByHabit,
    updateStreak,
    getStreak,
};
