import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Habit, HabitCompletion, Reminder, User } from './models';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'habitude',
  synchronize: true,
  logging: false,
  entities: [User, Habit, HabitCompletion, Reminder]
});

export async function initializeDatabase(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('Database connected');
  }
}
