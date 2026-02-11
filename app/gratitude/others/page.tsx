'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPublicEntries, toggleEmpathy } from '@/lib/gratitude';
import { useAuth } from '@/components/AuthProvider';

type EntryWithEmpathy = Awaited<ReturnType<typeof getPublicEntries>>[number];

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function OthersGratitudePage() {
  const { userData } = useAuth();
  const [entries, setEntries] = useState<EntryWithEmpathy[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    const list = await getPublicEntries(userData?.id);
    setEntries(list);
  }, [userData?.id]);

  useEffect(() => {
    loadEntries().finally(() => setLoading(false));
  }, [loadEntries]);

  const handleEmpathy = async (entry: EntryWithEmpathy) => {
    if (!userData) {
      alert('공감하려면 로그인해 주세요.');
      return;
    }
    await toggleEmpathy(entry.id, userData.id);
    loadEntries();
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Header />

      <main className="pt-12 sm:pt-16 lg:pt-20 pb-32">
        <div className="max-w-2xl mx-auto px-5 sm:px-6">
          <div className="mb-8">
            <Link
              href="/gratitude"
              className="text-sm text-stone-500 hover:text-stone-700 inline-flex items-center gap-1"
            >
              <i className="ri-arrow-left-line" /> 감사일기
            </Link>
          </div>

          <div className="py-8 sm:py-12">
            <h1 className="text-2xl sm:text-3xl font-light text-stone-800 mb-2">
              다른 사람의 감사
            </h1>
            <p className="text-sm font-light text-stone-500">
              함께 감사하며 은혜를 나눕니다. 조용히 읽어보세요.
            </p>
          </div>

          <div className="h-px bg-stone-200/80 mb-10 sm:mb-12" />

          {loading ? (
            <div className="py-16 text-center text-stone-400 text-sm">불러오는 중...</div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-stone-500 font-light mb-2">아직 공개된 감사일기가 없습니다.</p>
              <p className="text-sm text-stone-400">
                내 감사일기에서 공개로 설정하면 여기에서 볼 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {entries.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/gratitude/${entry.id}`}
                  className="block bg-white/80 rounded-2xl border border-stone-100 p-6 sm:p-8 hover:border-amber-100 hover:shadow-sm transition-all"
                >
                  <p className="font-lora text-base sm:text-lg text-stone-700 leading-relaxed mb-6">
                    {entry.text}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400">{formatDisplayDate(entry.date)}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleEmpathy(entry);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-light transition-colors ${
                        entry.user_empathized
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'text-stone-500 hover:bg-stone-50 border border-stone-200'
                      } ${userData ? 'cursor-pointer' : 'cursor-default'}`}
                      disabled={!userData}
                      title={userData ? '공감하기' : '로그인하면 공감할 수 있습니다'}
                    >
                      <i
                        className={`ri-heart-${entry.user_empathized ? 'fill' : 'line'} text-sm`}
                      />
                      <span>공감</span>
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
