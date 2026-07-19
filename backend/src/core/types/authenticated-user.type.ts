export interface AuthenticatedUser {
  id: string;
  sub: string;
  identifier: string;
  sessionId: string;
  role?: {
    id: string;
    code: string;
    name: string;
  };
}
