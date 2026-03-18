"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingError = exports.NotFoundError = exports.ValidationError = void 0;
exports.errorHandler = errorHandler;
exports.asyncHandler = asyncHandler;
exports.notFoundHandler = notFoundHandler;
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
        this.isOperational = true;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 404;
        this.isOperational = true;
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class MessagingError extends Error {
    constructor(message, provider) {
        super(message);
        this.statusCode = 503;
        this.isOperational = true;
        this.name = 'MessagingError';
        this.provider = provider;
    }
}
exports.MessagingError = MessagingError;
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const isOperational = err.isOperational || false;
    // Log error details
    console.error('Error occurred:', {
        name: err.name,
        message: err.message,
        statusCode,
        isOperational,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
    });
    // Don't expose internal errors to client
    const message = isOperational ? err.message : 'Internal server error';
    res.status(statusCode).json({
        error: {
            message,
            statusCode,
            timestamp: new Date().toISOString(),
        },
    });
}
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
function notFoundHandler(req, res) {
    res.status(404).json({
        error: {
            message: 'Resource not found',
            statusCode: 404,
            path: req.path,
        },
    });
}
