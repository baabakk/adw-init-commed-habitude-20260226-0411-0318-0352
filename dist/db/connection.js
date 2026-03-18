"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
exports.initializeDatabase = initializeDatabase;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const models_1 = require("./models");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'habitude',
    synchronize: true,
    logging: false,
    entities: [models_1.User, models_1.Habit, models_1.HabitCompletion, models_1.Reminder]
});
async function initializeDatabase() {
    if (!exports.AppDataSource.isInitialized) {
        await exports.AppDataSource.initialize();
        console.log('Database connected');
    }
}
