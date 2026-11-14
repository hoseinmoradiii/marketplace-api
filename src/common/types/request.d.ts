export {};
declare global {
  namespace Express {
    export interface Request {
      userId?: string;
    }
  }
}
declare module 'express-serve-static-core' {
  export interface Request {
    userId?: string;
  }
}
