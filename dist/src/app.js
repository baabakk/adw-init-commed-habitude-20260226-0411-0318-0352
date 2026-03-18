"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const habitRoutes_1 = __importDefault(require("./routes/habitRoutes"));
const reminderRoutes_1 = __importDefault(require("./routes/reminderRoutes"));
const progressRoutes_1 = __importDefault(require("./routes/progressRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api/habits', habitRoutes_1.default);
app.use('/api/reminders', reminderRoutes_1.default);
app.use('/api/progress', progressRoutes_1.default);
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});
exports.default = app;
