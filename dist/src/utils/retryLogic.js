"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRetry = void 0;
const withRetry = async (operation, options) => {
    const { retries, delayMs, backoffFactor = 2 } = options;
    let attempt = 1;
    let currentDelay = delayMs;
    while (attempt <= retries) {
        try {
            return await operation(attempt);
        }
        catch (error) {
            if (attempt === retries) {
                throw error;
            }
            await new Promise((resolve) => setTimeout(resolve, currentDelay));
            currentDelay *= backoffFactor;
            attempt += 1;
        }
    }
    throw new Error('Retry operation failed unexpectedly');
};
exports.withRetry = withRetry;
