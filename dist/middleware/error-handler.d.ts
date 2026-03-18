import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare class ValidationError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string);
}
export declare class NotFoundError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string);
}
export declare class MessagingError extends Error {
    statusCode: number;
    isOperational: boolean;
    provider?: string;
    constructor(message: string, provider?: string);
}
export declare function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction): void;
export declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): (req: Request, res: Response, next: NextFunction) => void;
export declare function notFoundHandler(req: Request, res: Response): void;
