import { prisma } from '../client';
import type { User, DatabaseUser } from '../../../types';

export class UserRepository {
  async create(userData: Omit<DatabaseUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const user = await prisma.user.create({
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
        },
      });
      
      return this.mapToUser(user);
    } catch (_error) {
      if (_error instanceof Error && 'code' in _error && _error.code === 'P2002') {
        throw new Error('A user with this email already exists');
      }
      throw new Error('Failed to create user');
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      
      return user ? this.mapToUser(user) : null;
    } catch (_error) {
      throw new Error(`Failed to find user: ${_error instanceof Error ? _error.message : 'Unknown error'}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      
      return user ? this.mapToUser(user) : null;
    } catch (_error) {
      throw new Error(`Failed to find user by email: ${_error instanceof Error ? _error.message : 'Unknown error'}`);
    }
  }

  async update(id: string, userData: Partial<Omit<DatabaseUser, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: userData,
      });
      
      return this.mapToUser(user);
    } catch (_error) {
      if (_error instanceof Error && 'code' in _error && _error.code === 'P2025') {
        throw new Error('User not found');
      }
      throw new Error('Failed to update user');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id },
      });
    } catch (_error) {
      if (_error instanceof Error && 'code' in _error && _error.code === 'P2025') {
        throw new Error('User not found');
      }
      throw new Error('Failed to delete user');
    }
  }

  async findOrCreate(userData: Omit<DatabaseUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        return existingUser;
      }
      
      return await this.create(userData);
    } catch (_error) {
      throw new Error(`Failed to find or create user: ${_error instanceof Error ? _error.message : 'Unknown error'}`);
    }
  }

  private mapToUser(dbUser: DatabaseUser): User {
    return {
      id: dbUser.id,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      email: dbUser.email,
      phone: dbUser.phone || undefined,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };
  }
}

// Singleton instance
export const userRepository = new UserRepository();