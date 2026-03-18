"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.getClient = getClient;
exports.transaction = transaction;
exports.testConnection = testConnection;
const pg_1 = require("pg");
const config_1 = __importDefault(require("./config"));
const pool = new pg_1.Pool({
    host: config_1.default.database.host,
    port: config_1.default.database.port,
    database: config_1.default.database.database,
    user: config_1.default.database.user,
    password: config_1.default.database.password,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
async function query(text, values) {
    const start = Date.now();
    try {
        const result = await pool.query(text, values);
        const duration = Date.now() - start;
        if (config_1.default.nodeEnv === 'development') {
            console.log('Executed query', { text, duration, rows: result.rowCount });
        }
        return result;
    }
    catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}
async function getClient() {
    return await pool.connect();
}
async function transaction(callback) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
async function testConnection() {
    try {
        const result = await query('SELECT NOW()');
        console.log('Database connection successful:', result.rows[0]);
        return true;
    }
    catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}
exports.default = {
    query,
    getClient,
    transaction,
    testConnection,
    pool,
};
//# sourceMappingURL=database.js.map