"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRetry = withRetry;
async function withRetry(operation, retries = 3, delayMs = 500) {
    let lastError;
    for (let attempt = 1; attempt <= retries; attempt += 1) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (attempt < retries) {
                await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
            }
        }
    }
    throw lastError;
}
