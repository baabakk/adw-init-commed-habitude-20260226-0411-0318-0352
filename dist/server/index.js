"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("./config"));
const database_1 = __importDefault(require("./database"));
const scheduler = __importStar(require("./services/scheduler"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const habits_1 = __importDefault(require("./routes/habits"));
const webhooks_1 = __importDefault(require("./routes/webhooks"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Serve static files
app.use(express_1.default.static(path_1.default.join(__dirname, '../../public')));
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/habits', habits_1.default);
app.use('/api/webhooks', webhooks_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Commed Habitude API is running',
        timestamp: new Date().toISOString(),
    });
});
// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../public/index.html'));
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
});
// Initialize application
async function initialize() {
    try {
        console.log('Starting Commed Habitude application...');
        // Test database connection
        const dbConnected = await database_1.default.testConnection();
        if (!dbConnected) {
            console.error('Failed to connect to database');
            process.exit(1);
        }
        // Initialize scheduler
        await scheduler.initializeScheduler();
        // Start server
        app.listen(config_1.default.port, () => {
            console.log(`Server running on port ${config_1.default.port}`);
            console.log(`Environment: ${config_1.default.nodeEnv}`);
            console.log(`Access the application at: http://localhost:${config_1.default.port}`);
        });
    }
    catch (error) {
        console.error('Failed to initialize application:', error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    scheduler.cancelAllReminders();
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    scheduler.cancelAllReminders();
    process.exit(0);
});
// Start the application
initialize();
exports.default = app;
//# sourceMappingURL=index.js.map