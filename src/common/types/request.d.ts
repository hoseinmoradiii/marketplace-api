export {};
declare global {
  namespace Express {
    export interface Request {
      user?: {
        userId?: string;
        tokenId?: string;
      };
    }
  }
}
declare module 'express-serve-static-core' {
  export interface Request {
    user?: {
      userId?: string;
      tokenId?: string;
    };
  }
}
