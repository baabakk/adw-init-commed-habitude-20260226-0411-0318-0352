export interface RetryOperationResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}
export declare const retryOperation: <T>(operation: () => Promise<T>, maxRetries?: number, baseDelay?: number) => Promise<RetryOperationResult<T>>;
