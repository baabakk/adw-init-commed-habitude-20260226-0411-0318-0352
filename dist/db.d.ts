import { QueryResult } from 'pg';
declare const pool: any;
export declare const query: <T>(text: string, params?: any[]) => Promise<QueryResult<T>>;
export default pool;
