import { v4 as uuidv4 } from 'uuid';
import type { User, UserRole } from '../types';
import { getUsersCookie, setUsersCookie } from '../utils/cookieStore';

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  companyId: string;
  managerId?: string;
  isManagerApprover?: boolean;
}

export async function createUser(dto: CreateUserDTO): Promise<User> {
  const users = getUsersCookie();

  const existingUser = users.find(u => u.email === dto.email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const user: User = {
    id: uuidv4(),
    email: dto.email,
    password: dto.password,
    name: dto.name,
    role: dto.role,
    companyId: dto.companyId,
    managerId: dto.managerId,
    isManagerApprover: dto.isManagerApprover || false,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  setUsersCookie(users);

  return user;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const users = getUsersCookie();
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    throw new Error('User not found');
  }

  users[index] = { ...users[index], ...updates };
  setUsersCookie(users);

  return users[index];
}

export async function listUsers(companyId?: string): Promise<User[]> {
  const users = getUsersCookie();

  if (companyId) {
    return users.filter(u => u.companyId === companyId);
  }

  return users;
}

export async function getUser(id: string): Promise<User | null> {
  const users = getUsersCookie();
  return users.find(u => u.id === id) || null;
}

export async function deleteUser(id: string): Promise<void> {
  const users = getUsersCookie();
  const filtered = users.filter(u => u.id !== id);
  setUsersCookie(filtered);
}

export async function bulkImportUsers(csvData: CreateUserDTO[]): Promise<{ success: User[]; errors: string[] }> {
  const success: User[] = [];
  const errors: string[] = [];

  for (let i = 0; i < csvData.length; i++) {
    try {
      const user = await createUser(csvData[i]);
      success.push(user);
    } catch (error) {
      errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return { success, errors };
}
