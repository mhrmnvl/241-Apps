declare global {
  namespace Express {
    interface User {
      id: string;
      sub: string;
      identifier: string;
      sessionId: string;
    }
    interface Request {
      _startTime?: number;
      user?: User;
    }
  }
}

export {};
