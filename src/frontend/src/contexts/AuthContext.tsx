import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // btoa(password) for demo
  phone: string;
  monthlyBudget: number;
  createdAt: string;
}

interface AuthContextValue {
  currentUser: User | null;
  isLoading: boolean;
  signup: (
    name: string,
    email: string,
    password: string,
    monthlyBudget?: number,
  ) => void;
  login: (email: string, password: string) => void;
  loginWithPhone: (phone: string, otp: string) => void;
  loginWithGoogle: () => void;
  logout: () => void;
  updateProfile: (name: string, phone: string, monthlyBudget: number) => void;
  changePassword: (oldPassword: string, newPassword: string) => void;
  deleteAccount: () => void;
  getCurrentUserId: () => string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USERS_KEY = "ghk_users";
const CURRENT_USER_KEY = "ghk_current_user_id";

function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as User[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem(CURRENT_USER_KEY);
    if (userId) {
      const users = getUsers();
      const user = users.find((u) => u.id === userId) ?? null;
      setCurrentUser(user);
    }
    setIsLoading(false);
  }, []);

  const signup = useCallback(
    (name: string, email: string, password: string, monthlyBudget = 20000) => {
      const users = getUsers();
      const emailLower = email.trim().toLowerCase();
      if (users.some((u) => u.email.toLowerCase() === emailLower)) {
        throw new Error(
          "Yeh email already registered hai. Login karein ya dusri email use karein.",
        );
      }
      const newUser: User = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: emailLower,
        passwordHash: btoa(password),
        phone: "",
        monthlyBudget,
        createdAt: new Date().toISOString(),
      };
      saveUsers([...users, newUser]);
      localStorage.setItem(CURRENT_USER_KEY, newUser.id);
      setCurrentUser(newUser);
    },
    [],
  );

  const login = useCallback((email: string, password: string) => {
    const users = getUsers();
    const emailLower = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === emailLower);
    if (!user) {
      throw new Error("Email registered nahi hai. Pehle signup karein.");
    }
    if (user.passwordHash !== btoa(password)) {
      throw new Error("Password galat hai. Dobara try karein.");
    }
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    setCurrentUser(user);
  }, []);

  const loginWithPhone = useCallback((phone: string, otp: string) => {
    if (otp !== "123456") {
      throw new Error("OTP galat hai. Demo mode mein OTP: 123456");
    }
    const users = getUsers();
    let user = users.find((u) => u.phone === phone);
    if (!user) {
      user = {
        id: crypto.randomUUID(),
        name: `User ${phone.slice(-4)}`,
        email: `phone_${phone}@gharkharcha.demo`,
        passwordHash: btoa("phone_login"),
        phone,
        monthlyBudget: 20000,
        createdAt: new Date().toISOString(),
      };
      saveUsers([...users, user]);
    }
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    setCurrentUser(user);
  }, []);

  const loginWithGoogle = useCallback(() => {
    const demoGoogleUser: User = {
      id: crypto.randomUUID(),
      name: "Rahul Sharma",
      email: `rahul.sharma.${Date.now()}@gmail.com`,
      passwordHash: btoa("google_demo"),
      phone: "",
      monthlyBudget: 25000,
      createdAt: new Date().toISOString(),
    };
    const users = getUsers();
    saveUsers([...users, demoGoogleUser]);
    localStorage.setItem(CURRENT_USER_KEY, demoGoogleUser.id);
    setCurrentUser(demoGoogleUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback(
    (name: string, phone: string, monthlyBudget: number) => {
      const userId = localStorage.getItem(CURRENT_USER_KEY);
      if (!userId) throw new Error("Not logged in");
      const users = getUsers();
      const updated = users.map((u) =>
        u.id === userId ? { ...u, name: name.trim(), phone, monthlyBudget } : u,
      );
      saveUsers(updated);
      const updatedUser = updated.find((u) => u.id === userId) ?? null;
      setCurrentUser(updatedUser);
    },
    [],
  );

  const changePassword = useCallback(
    (oldPassword: string, newPassword: string) => {
      const userId = localStorage.getItem(CURRENT_USER_KEY);
      if (!userId) throw new Error("Not logged in");
      const users = getUsers();
      const user = users.find((u) => u.id === userId);
      if (!user) throw new Error("User not found");
      if (user.passwordHash !== btoa(oldPassword)) {
        throw new Error("Purana password galat hai.");
      }
      if (newPassword.length < 6) {
        throw new Error(
          "Naya password kam se kam 6 characters ka hona chahiye.",
        );
      }
      const updated = users.map((u) =>
        u.id === userId ? { ...u, passwordHash: btoa(newPassword) } : u,
      );
      saveUsers(updated);
      const updatedUser = updated.find((u) => u.id === userId) ?? null;
      setCurrentUser(updatedUser);
    },
    [],
  );

  const deleteAccount = useCallback(() => {
    const userId = localStorage.getItem(CURRENT_USER_KEY);
    if (!userId) return;
    const users = getUsers();
    saveUsers(users.filter((u) => u.id !== userId));
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(`ghk_expenses_${userId}`);
    localStorage.removeItem(`ghk_settings_${userId}`);
    setCurrentUser(null);
  }, []);

  const getCurrentUserId = useCallback(() => {
    return localStorage.getItem(CURRENT_USER_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        signup,
        login,
        loginWithPhone,
        loginWithGoogle,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
        getCurrentUserId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
