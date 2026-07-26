const TOKEN_KEY = "ksp_auth_token";
let _mem: string | null = null;

export function setToken(token: string): void {
  _mem = token;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* blocked */
    }
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* blocked */
    }
    try {
      document.cookie = `ksp_auth=${encodeURIComponent(token)}; path=/; SameSite=Strict`;
    } catch {
      /* blocked */
    }
  }
}

export function getToken(): string | null {
  if (_mem) return _mem;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        _mem = stored;
        return stored;
      }
    } catch {
      /* blocked */
    }
    try {
      const stored = sessionStorage.getItem(TOKEN_KEY);
      if (stored) {
        _mem = stored;
        return stored;
      }
    } catch {
      /* blocked */
    }
  }
  return null;
}

export function clearToken(): void {
  _mem = null;
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* blocked */
    }
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* blocked */
    }
    try {
      document.cookie =
        "ksp_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
    } catch {
      /* blocked */
    }
  }
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

const ROLE_KEY = "ksp_auth_role";

export function setRole(role: string): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(ROLE_KEY, role);
    } catch {
      /* blocked */
    }
  }
}

export function getRole(): string {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem(ROLE_KEY) || "analyst";
    } catch {
      /* blocked */
    }
  }
  return "analyst";
}
