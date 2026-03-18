import { Request, Response } from 'express';
declare const router: import("express-serve-static-core").Router;
export declare const authenticate: (req: Request, res: Response, next: Function) => Response<any, Record<string, any>> | undefined;
export default router;
