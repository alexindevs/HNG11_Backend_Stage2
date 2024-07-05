// tests/token.spec.ts

import { AccessTokenService } from "../src/services/accesstoken.service";
import jwt from "jsonwebtoken";

const ATS = new AccessTokenService();

describe('Token Generation', () => {
  it('should generate a token that expires at the correct time', () => {
    const user = { userId: '12345', email: 'user@example.com', firstName: 'John', lastName: 'Doe', phone: '1234567890', password: 'password123' };
    const accessToken = ATS.generateAccessToken(user);

    const currentTime = Math.floor(Date.now() / 1000);
    const decodedToken = jwt.decode(accessToken) as { exp: number };

    expect(decodedToken.exp).toBeGreaterThan(currentTime);
  });

  it('should include correct user details in the token', () => {
    const user = { userId: '12345', email: 'user@example.com', firstName: 'John', lastName: 'Doe', phone: '1234567890', password: 'password123' };
    const accessToken = ATS.generateAccessToken(user);

    const decodedToken = jwt.decode(accessToken) as { userId: string; email: string };

    expect(decodedToken.userId).toEqual(user.userId);
    expect(decodedToken.email).toEqual(user.email);
  });
});
