'use client';

import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center px-6">
        <h1 className="text-xl font-medium text-stone-800 mb-2">로그인 오류</h1>
        <p className="text-stone-600 mb-6">로그인 처리 중 문제가 발생했습니다.</p>
        <Link
          href="/"
          className="text-amber-600 hover:text-amber-700 font-medium"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
