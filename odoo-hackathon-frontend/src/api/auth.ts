import { v4 as uuidv4 } from 'uuid';
import type { User, Company, Session } from '../types';
import {
  getUsersCookie,
  setUsersCookie,
  getCompanyCookie,
  setCompanyCookie,
  getSessionCookie,
  setSessionCookie,
} from '../utils/cookieStore';

export interface SignupDTO {
  email: string;
  password: string;
  name: string;
  companyName: string;
  country: string;
  currency: string;
}

export async function signup(dto: SignupDTO): Promise<{ user: User; company: Company }> {
  const users = getUsersCookie();
  const existingUser = users.find(u => u.email === dto.email);

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const existingCompany = getCompanyCookie();
  let company: Company;

  if (!existingCompany) {
    company = {
      id: uuidv4(),
      name: dto.companyName,
      currency: dto.currency,
      country: dto.country,
      createdAt: new Date().toISOString(),
    };
    setCompanyCookie(company);
  } else {
    company = existingCompany;
  }

  const isFirstUser = users.length === 0;

  const user: User = {
    id: uuidv4(),
    email: dto.email,
    password: dto.password,
    name: dto.name,
    role: isFirstUser ? 'admin' : 'employee',
    companyId: company.id,
    isManagerApprover: false,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  setUsersCookie(users);

  const session: Session = {
    userId: user.id,
    companyId: company.id,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  setSessionCookie(session);

  return { user, company };
}

export async function login(email: string, password: string): Promise<{ user: User; company: Company }> {
  const users = getUsersCookie();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const company = getCompanyCookie();
  if (!company) {
    throw new Error('Company not found');
  }

  const session: Session = {
    userId: user.id,
    companyId: company.id,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  setSessionCookie(session);

  return { user, company };
}

export async function logout(): Promise<void> {
  setSessionCookie(null);
}

export async function getCurrentUser(): Promise<{ user: User; company: Company } | null> {
  const session = getSessionCookie();
  if (!session) return null;

  if (new Date(session.expiresAt) < new Date()) {
    setSessionCookie(null);
    return null;
  }

  const users = getUsersCookie();
  const user = users.find(u => u.id === session.userId);
  const company = getCompanyCookie();

  if (!user || !company) {
    setSessionCookie(null);
    return null;
  }

  return { user, company };
}
