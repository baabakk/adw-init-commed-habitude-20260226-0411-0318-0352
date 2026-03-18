"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const connection_1 = require("./db/connection");
const streakService_1 = require("./services/streakService");
dotenv_1.default.config();
const port = Number(process.env.PORT || 3000);
const bootstrap = async () => {
    try {
        await (0, connection_1.initializeDatabase)();
        (0, streakService_1.registerStreakHandlers)();
        app_1.default.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error('Failed to start server', error);
        process.exit(1);
    }
};
void bootstrap();
