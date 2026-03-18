import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import config from './config';
import { User, Habit, Completion, Streak } from './models';

const sqlite = sqlite3.verbose();

let db: sqlite3.Database;

export interface DatabaseRow {
  [key: string]: any;
}

export async function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Ensure data directory exists
    const dbDir = path.dirname(config.databasePath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new sqlite.Database(config.databasePath, (err) => {
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

async function createTables(): Promise<void> {
  const run = promisify(db.run.bind(db));

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

export function query<T = DatabaseRow>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Query error:', err, 'SQL:', sql);
        reject(err);
      } else {
        resolve(rows as T[]);
      }
    });
  });
}

export function queryOne<T = DatabaseRow>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('Query error:', err, 'SQL:', sql);
        reject(err);
      } else {
        resolve(row as T | undefined);
      }
    });
  });
}

export function execute(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        console.error('Execute error:', err, 'SQL:', sql);
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

export function closeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

export function getDatabase(): sqlite3.Database {
  return db;
}

/** Additional helper methods used by services */

export async function getUser(userId: string): Promise<User | undefined> {
  return queryOne<User>('SELECT * FROM users WHERE id = ?', [userId]);
}

export async function getHabitsByUser(userId: string): Promise<Habit[]> {
  return query<Habit>('SELECT * FROM habits WHERE user_id = ?', [userId]);
}

export async function createHabit(habit: Habit): Promise<Habit> {
  const result = await execute(
    `INSERT INTO habits (user_id, name, description, goal, created_at, isActive)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [habit.userId, habit.name, habit.description, habit.goal, habit.createdAt.toISOString(), habit.isActive ? 1 : 0]
  );
  return { ...habit, id: String(result.lastID) };
}

export async function getHabit(habitId: string): Promise<Habit | undefined> {
  return queryOne<Habit>('SELECT * FROM habits WHERE id = ?', [habitId]);
}

export async function updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit | undefined> {
  const fields = Object.keys(updates);
  if (fields.length === 0) return getHabit(habitId);
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const params = fields.map(f => (updates as any)[f]);
  params.push(habitId);
  await execute(`UPDATE habits SET ${setClause} WHERE id = ?`, params);
  return getHabit(habitId);
}

export async function getCompletionsByDate(habitId: string, date: string): Promise<Completion[]> {
  return query<Completion>('SELECT * FROM habit_completions WHERE habit_id = ? AND completion_date = ?', [habitId, date]);
}

export async function createCompletion(completion: Completion): Promise<Completion> {
  const result = await execute(
    `INSERT INTO habit_completions (habit_id, completion_date, completed_at)
     VALUES (?, ?, ?)`,
    [completion.habitId, completion.date, completion.completedAt.toISOString()]
  );
  return { ...completion, id: String(result.lastID) };
}

export async function getCompletionsByHabit(habitId: string): Promise<Completion[]> {
  return query<Completion>('SELECT * FROM habit_completions WHERE habit_id = ?', [habitId]);
}

export async function updateStreak(habitId: string, streak: Streak): Promise<Streak> {
  await execute(
    `INSERT INTO streaks (habit_id, user_id, current_streak, longest_streak, last_completion_date)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(habit_id) DO UPDATE SET 
       user_id = excluded.user_id,
       current_streak = excluded.current_streak,
       longest_streak = excluded.longest_streak,
       last_completion_date = excluded.last_completion_date`,
    [habitId, streak.userId, streak.currentStreak, streak.longestStreak, streak.lastCompletionDate]
  );
  return streak;
}

export async function getStreak(habitId: string): Promise<Streak | undefined> {
  return queryOne<Streak>('SELECT * FROM streaks WHERE habit_id = ?', [habitId]);
}

// Export a db-like object for compatibility
export const db = {
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
