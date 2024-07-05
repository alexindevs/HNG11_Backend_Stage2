import { PrismaClient, User, Organisation } from '@prisma/client';

const prisma = new PrismaClient();

export class UserRepository {
  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<User> {
    return prisma.user.create({
      data: userData,
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  async findUserById(userId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });
  }

  async getAllUsers(): Promise<User[]> {
    return prisma.user.findMany();
  }

  async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: {
        userId: userId,
      },
      data: updateData,
    });
  }

  async deleteUser(userId: string): Promise<User> {
    return prisma.user.delete({
      where: {
        userId: userId,
      },
    });
  }

  async getUserOrganizations(userId: string): Promise<Organisation[]> {
    return prisma.organisation.findMany({
      where: {
        users: {
          some: {
            userId: userId,
          },
        },
      },
    });
  }
}
