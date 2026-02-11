'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyDatesWithEntries } from '@/lib/gratitude';
import { useAuth } from './AuthProvider';

export default function GratitudeCard() {
  const { userData } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (userData?.id) {
      getMyDatesWithEntries(userData.id).then((dates) => setCount(dates.length));
    } else {
      setCount(0);
    }
  }, [userData?.id]);

  return (
    <Link
      href="/gratitude"
      className="block bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 border border-stone-100 shadow-sm hover:shadow-lg hover:shadow-amber-100/30 hover:border-amber-100 transition-all duration-300 group"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
          <i className="ri-quill-pen-line text-amber-600 text-lg sm:text-xl" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-stone-500 mb-1 font-medium">
            Gratitude Journal
          </p>
          <h3 className="text-base sm:text-lg font-light text-stone-800 mb-1 sm:mb-2 group-hover:text-amber-800 transition-colors">
            감사일기
          </h3>
          <p className="text-sm font-light text-stone-600 leading-relaxed mb-3 sm:mb-4">
            기도의 응답을 마음에 새기고, 감사로 하루를 마무리합니다.
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-light text-amber-700 group-hover:text-amber-800 transition-colors">
            {userData && count > 0 ? (
              <>지금까지 {count}일의 감사를 기록했습니다</>
            ) : (
              <>오늘의 감사 기록하기</>
            )}
            <i className="ri-arrow-right-line text-base" />
          </span>
        </div>
      </div>
    </Link>
  );
}
