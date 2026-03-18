import { Pool, QueryResult } from 'pg';
export interface QueryParams {
    text: string;
    values?: any[];
}
export declare function query(text: string, values?: any[]): Promise<QueryResult>;
export declare function getClient(): Promise<import("pg").PoolClient>;
export declare function transaction<T>(callback: (client: any) => Promise<T>): Promise<T>;
export declare function testConnection(): Promise<boolean>;
declare const _default: {
    query: typeof query;
    getClient: typeof getClient;
    transaction: typeof transaction;
    testConnection: typeof testConnection;
    pool: Pool;
};
export default _default;
//# sourceMappingURL=database.d.ts.map