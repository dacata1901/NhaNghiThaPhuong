import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  loginAt: string;
}

interface AdminAuthContextValue {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const ADMIN_AUTH_STORAGE_KEY = 'tp_hotel_admin_session_v1';

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const raw = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AdminUser;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (adminUser) {
      localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(adminUser));
    } else {
      localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
    }
  }, [adminUser]);

  // Listen to Supabase Auth state if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setAdminUser({
          id: session.user.id,
          email: session.user.email,
          name: 'Quản trị viên Nhà Nghỉ Tha Phương',
          role: 'admin',
          loginAt: new Date().toISOString(),
        });
      } else if (_event === 'SIGNED_OUT') {
        setAdminUser(null);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Khi đã kết nối Supabase Cloud -> Xác thực 100% qua Supabase Auth trên Server
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data.user) {
        return {
          success: false,
          error:
            'Email hoặc mật khẩu quản trị không chính xác trên hệ thống Supabase Auth.',
        };
      }

      const user: AdminUser = {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        name: 'Quản trị viên Nhà Nghỉ Tha Phương',
        role: 'admin',
        loginAt: new Date().toISOString(),
      };
      setAdminUser(user);
      return { success: true };
    }

    // 2. Chế độ Local Fallback (Chỉ dùng khi chưa cấu hình VITE_SUPABASE_URL)
    const allowedLocalEmails = [
      'minhkhang19012006@gmail.com',
      'admin@nhanghithaphuong.vn',
      'huynhduykhanh0406@gmail.com',
    ];
    const expectedPass = import.meta.env.VITE_ADMIN_DEFAULT_PASSWORD || 'ThaPhuong@2026';

    if (allowedLocalEmails.includes(cleanEmail) && password === expectedPass) {
      const user: AdminUser = {
        id: 'admin-owner-01',
        email: cleanEmail,
        name: 'Quản trị viên Nhà Nghỉ Tha Phương',
        role: 'admin',
        loginAt: new Date().toISOString(),
      };
      setAdminUser(user);
      return { success: true };
    }

    return {
      success: false,
      error:
        'Email hoặc mật khẩu quản trị không chính xác. Hệ thống chỉ cho phép tài khoản Chủ nhà truy cập.',
    };
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAuthenticated: Boolean(adminUser),
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  }
  return ctx;
}
