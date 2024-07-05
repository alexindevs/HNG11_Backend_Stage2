import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { User } from '@prisma/client';

export class AccessTokenService {
  private readonly secret: string;
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.secret = process.env.JWT_SECRET || 'wahala';
  }

  generateAccessToken(user: User): string {
    const { userId, email } = user;
    const accessToken = jwt.sign(
      { userId, email },
      this.secret,
      { expiresIn: '70d' },
    );
    return accessToken;
  }

  async getAccountFromToken(token: string): Promise<User | null> {
    const { payload } = this.verifyAccessToken(token);
    if (!payload || !payload.userId) {
      throw new Error('Invalid token');
    }
    const user = await this.userRepository.findUserById(payload.userId);
    return user;
  }

  verifyAccessToken(token: string): { isValid: boolean; payload?: any } {
    try {
      const payload = jwt.verify(token, this.secret);
      return { isValid: true, payload };
    } catch (error) {
      const payload = jwt.decode(token);
      return { isValid: false, payload };
    }
  }
}
