interface JWTPayload {
  role: 'DEVELOPER' | 'ADMIN' | 'USER';
  userId: number;
  sub: string;
  iat: number;
  exp: number;
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Payload = token.split('.')[1];
    const payload = Buffer.from(base64Payload, 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

export function getUserRole(token: string): string | null {
  const payload = decodeJWT(token);
  return payload?.role || null;
}