'use client';

import { useAuth } from '@/components/AuthProvider';

// Supabase Auth 사용 - useAuth 훅 사용 권장

export function useAuthState() {
  return useAuth();
}

export function requireLogin(userData: { id: string } | null) {
  if (!userData) {
    return {
      needLogin: true,
      message: '로그인이 필요한 기능입니다.',
    };
  }
  return { needLogin: false };
}
