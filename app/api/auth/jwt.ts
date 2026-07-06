import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Please define the JWT_SECRET environment variable");
  }

  return new TextEncoder().encode(secret);
})();

export interface AuthTokenPayload extends JWTPayload {
  sub: string;
  email: string;
  activeMode: string;
}

export async function signAuthToken(payload: AuthTokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as AuthTokenPayload;
}