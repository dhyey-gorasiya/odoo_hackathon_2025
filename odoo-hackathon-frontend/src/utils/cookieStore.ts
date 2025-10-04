import Cookies from 'js-cookie';
import type { User, Company, Expense, ApprovalRule, Session, UIPreferences, CurrencyRate } from '../types';

const COOKIE_EXPIRY_DAYS = 30;

export const COOKIE_NAMES = {
  USERS: 'expapp_users',
  COMPANY: 'expapp_company',
  EXPENSES: 'expapp_expenses',
  RULES: 'expapp_rules',
  SESSION: 'expapp_session',
  PREFS: 'expapp_prefs',
  RATES_PREFIX: 'expapp_rates_',
} as const;

interface VersionedCookie<T> {
  v: number;
  data: T;
}

export function setCookie<T>(name: string, data: T, version: number = 1): void {
  const payload: VersionedCookie<T> = { v: version, data };
  Cookies.set(name, JSON.stringify(payload), { expires: COOKIE_EXPIRY_DAYS });
}

export function getCookie<T>(name: string, expectedVersion: number = 1): T | null {
  const raw = Cookies.get(name);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as VersionedCookie<T>;
    if (parsed.v !== expectedVersion) {
      migrateCookie(name, parsed.v, expectedVersion);
      return getCookie<T>(name, expectedVersion);
    }
    return parsed.data;
  } catch {
    return null;
  }
}

export function removeCookie(name: string): void {
  Cookies.remove(name);
}

export function migrateCookie(name: string, fromVersion: number, toVersion: number): void {
  console.warn(`Migration needed for ${name} from v${fromVersion} to v${toVersion}`);

  if (fromVersion === toVersion) return;
}

export function setUsersCookie(users: User[]): void {
  setCookie(COOKIE_NAMES.USERS, users, 1);
}

export function getUsersCookie(): User[] {
  return getCookie<User[]>(COOKIE_NAMES.USERS, 1) || [];
}

export function setCompanyCookie(company: Company): void {
  setCookie(COOKIE_NAMES.COMPANY, company, 1);
}

export function getCompanyCookie(): Company | null {
  return getCookie<Company>(COOKIE_NAMES.COMPANY, 1);
}

export function setExpensesCookie(expenses: Expense[]): void {
  setCookie(COOKIE_NAMES.EXPENSES, expenses, 1);
}

export function getExpensesCookie(): Expense[] {
  return getCookie<Expense[]>(COOKIE_NAMES.EXPENSES, 1) || [];
}

export function setRulesCookie(rules: ApprovalRule[]): void {
  setCookie(COOKIE_NAMES.RULES, rules, 1);
}

export function getRulesCookie(): ApprovalRule[] {
  return getCookie<ApprovalRule[]>(COOKIE_NAMES.RULES, 1) || [];
}

export function setSessionCookie(session: Session | null): void {
  if (session) {
    setCookie(COOKIE_NAMES.SESSION, session, 1);
  } else {
    removeCookie(COOKIE_NAMES.SESSION);
  }
}

export function getSessionCookie(): Session | null {
  return getCookie<Session>(COOKIE_NAMES.SESSION, 1);
}

export function setPrefsCookie(prefs: UIPreferences): void {
  setCookie(COOKIE_NAMES.PREFS, prefs, 1);
}

export function getPrefsCookie(): UIPreferences {
  return getCookie<UIPreferences>(COOKIE_NAMES.PREFS, 1) || {
    pageSize: 10,
    filters: {},
  };
}

export function setRatesCookie(base: string, rates: CurrencyRate): void {
  setCookie(`${COOKIE_NAMES.RATES_PREFIX}${base}`, rates, 1);
}

export function getRatesCookie(base: string): CurrencyRate | null {
  return getCookie<CurrencyRate>(`${COOKIE_NAMES.RATES_PREFIX}${base}`, 1);
}

export function isRateCacheValid(rate: CurrencyRate | null): boolean {
  if (!rate) return false;
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;
  const lastUpdated = new Date(rate.lastUpdated).getTime();
  return Date.now() - lastUpdated < TWELVE_HOURS;
}

export function clearAllCookies(): void {
  Object.values(COOKIE_NAMES).forEach(name => {
    if (name.endsWith('_')) return;
    removeCookie(name);
  });

  const allCookies = Cookies.get();
  Object.keys(allCookies).forEach(key => {
    if (key.startsWith(COOKIE_NAMES.RATES_PREFIX)) {
      removeCookie(key);
    }
  });
}
