"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const models_1 = require("./models");
const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/habitude';
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: databaseUrl,
    synchronize: true,
    logging: false,
    entities: [models_1.User, models_1.Habit, models_1.HabitCompletion, models_1.ReminderSchedule, models_1.Streak, models_1.MessagingEventLog],
});
const initializeDatabase = async () => {
    if (!exports.AppDataSource.isInitialized) {
        await exports.AppDataSource.initialize();
    }
};
exports.initializeDatabase = initializeDatabase;
