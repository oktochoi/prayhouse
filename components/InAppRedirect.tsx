'use client';

import { useEffect, useState } from 'react';

export default function InAppRedirect() {
  const [isInApp, setIsInApp] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (
      ua.includes('kakaotalk') ||
      ua.includes('instagram') ||
      ua.includes('fbav') ||
      ua.includes('fban')
    ) {
      setIsInApp(true);
    }
  }, []);

  if (!isInApp) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl p-6 text-center max-w-sm">
        <h2 className="text-lg font-semibold mb-3">외부 브라우저에서 열어주세요</h2>
        <p className="text-sm text-gray-600 mb-4">
          Google 로그인은 카카오 인앱 브라우저에서 지원되지 않습니다. Chrome 또는
          Safari에서 열어주세요.
        </p>
        <button
          onClick={() => {
            window.location.href = 'https://prayhouse.vercel.app';
          }}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg"
        >
          브라우저에서 열기
        </button>
      </div>
    </div>
  );
}
