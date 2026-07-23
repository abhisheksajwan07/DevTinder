declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        sessionId: string;
        profileId?: string;
      };
    }
  }
}

export {};
