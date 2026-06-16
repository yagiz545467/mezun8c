export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
}

const STORAGE_KEY = '8c_user';

export function saveUser(user: AppUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function loadUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}
