import { UserSession, UserRole } from '../types/index.js';

const STORAGE_KEY = 'kissan_mithar_expert_session';

export class AuthStore {
  static getSession(): UserSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.getDefaultExpertSession();
      return JSON.parse(raw);
    } catch {
      return this.getDefaultExpertSession();
    }
  }

  static setSession(session: UserSession): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  static clearSession(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  static getDefaultExpertSession(): UserSession {
    return {
      userId: 'EXPERT-001',
      name: 'Dr. Sunil Rao',
      role: 'EXPERT',
      phoneNumber: '+919811122233',
      token: 'demo_expert_jwt_token',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200',
    };
  }

  static getAdminSession(): UserSession {
    return {
      userId: 'ADMIN-001',
      name: 'Kisan Mithar Ops Admin',
      role: 'ADMIN',
      phoneNumber: '+919999900000',
      token: 'demo_admin_jwt_token',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    };
  }
}
