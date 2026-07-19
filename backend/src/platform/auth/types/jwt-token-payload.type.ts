export interface JwtTokenPayload {
  sub: string;
  sessionId: string;
  identifier: string;
  type: 'access' | 'refresh';
}
