export type UserRole = "ADMIN" | "STUDENT" | "PANELIST";

export interface SessionUser {
  role: UserRole;
  email: string;
  userId: string;
}

const SESSION_KEY = "placify_session";

export function saveSession(role: UserRole, email: string): SessionUser {
  const user: SessionUser = {
    role,
    email,
    userId: email.split("@")[0].trim().toLowerCase() || "s1",
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function getSession(): SessionUser | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}
