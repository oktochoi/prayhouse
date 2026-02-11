'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createClient } from '@/utils/supabase/client';

type PrayerItem = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  prayerCount: number;
  status: string;
};

function formatDateKr(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function PrayersPageContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  const initialFilter = useMemo(() => {
    if (filterParam === 'active' || filterParam === 'answered') return filterParam;
    return 'all';
  }, [filterParam]);

  const [filter, setFilter] = useState<'all' | 'active' | 'answered'>(initialFilter);
  const [prayers, setPrayers] = useState<PrayerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    async function fetchPrayers() {
      const supabase = createClient();
      const { data } = await supabase
        .from('prayers')
        .select('id, title, content, category, status, author_name, is_anonymous, created_at')
        .order('created_at', { ascending: false });

      if (!data?.length) {
        setPrayers([]);
        setLoading(false);
        return;
      }

      const ids = data.map((p) => p.id);
      const { data: counts } = await supabase
        .from('prayer_participations')
        .select('prayer_id')
        .in('prayer_id', ids);

      const countMap: Record<string, number> = {};
      counts?.forEach((row) => {
        countMap[row.prayer_id] = (countMap[row.prayer_id] || 0) + 1;
      });

      const items: PrayerItem[] = data.map((p) => ({
        id: p.id,
        title: p.title,
        excerpt: p.content.slice(0, 80) + (p.content.length > 80 ? '...' : ''),
        author: p.is_anonymous ? '익명' : (p.author_name || '익명'),
        date: formatDateKr(p.created_at),
        category: p.category,
        prayerCount: countMap[p.id] || 0,
        status: p.status,
      }));

      setPrayers(items);
      setLoading(false);
    }
    fetchPrayers();
  }, []);

  const filtered = prayers.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/20 via-amber-50/10 to-stone-50">
      <Header />

      <main className="">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <div className="py-7 sm:py-10 lg:py-12">
            <p className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-amber-600 mb-3 sm:mb-4">
              Prayer Requests
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-stone-800 mb-4 sm:mb-6">
              기도 제목
            </h1>
            <p className="text-base sm:text-lg font-light text-stone-600 leading-relaxed">
              함께 기도하고 응답을 나누는 공간입니다
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent mb-10 sm:mb-16" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-10 sm:mb-16">
            <div className="flex gap-4 sm:gap-8 overflow-x-auto pb-2 sm:pb-0">
              <button
                onClick={() => setFilter('all')}
                className={`text-sm font-medium tracking-wide transition-colors cursor-pointer whitespace-nowrap ${
                  filter === 'all'
                    ? 'text-amber-700 border-b-2 border-amber-500'
                    : 'text-stone-400 hover:text-amber-600'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`text-sm font-medium tracking-wide transition-colors cursor-pointer whitespace-nowrap ${
                  filter === 'active'
                    ? 'text-amber-700 border-b-2 border-amber-500'
                    : 'text-stone-400 hover:text-amber-600'
                }`}
              >
                기도 중
              </button>
              <button
                onClick={() => setFilter('answered')}
                className={`text-sm font-medium tracking-wide transition-colors cursor-pointer whitespace-nowrap ${
                  filter === 'answered'
                    ? 'text-amber-700 border-b-2 border-amber-500'
                    : 'text-stone-400 hover:text-amber-600'
                }`}
              >
                응답됨
              </button>
            </div>

            <Link
              href="/prayers/new"
              className="text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors border-b border-amber-500 hover:border-amber-700 cursor-pointer self-start sm:self-auto"
            >
              기도 제목 올리기
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center text-stone-500 text-sm">불러오는 중...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-stone-500">
              <p className="mb-4">등록된 기도 제목이 없습니다.</p>
              <Link href="/prayers/new" className="text-amber-600 hover:text-amber-700 font-medium">
                첫 번째 기도 제목을 등록해보세요 →
              </Link>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-32">
              {filtered.map((prayer) => (
                <Link key={prayer.id} href={`/prayers/${prayer.id}`} className="block group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 border border-amber-100/60 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300">
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div className="flex-1 pr-3">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-light text-stone-800 mb-1.5 sm:mb-2 group-hover:text-amber-700 transition-colors">
                          {prayer.title}
                        </h3>
                        <p className="text-sm sm:text-base font-light text-stone-600 leading-relaxed mb-3 sm:mb-4">
                          {prayer.excerpt}
                        </p>
                      </div>
                      {prayer.status === 'answered' && (
                        <span className="text-[10px] sm:text-xs font-medium tracking-wide text-amber-700 bg-amber-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap flex-shrink-0">
                          응답됨
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 lg:gap-6 text-xs sm:text-sm font-light text-stone-500">
                      <span className="text-amber-600">{prayer.author}</span>
                      <span className="hidden sm:inline">·</span>
                      <span>{prayer.date}</span>
                      <span className="hidden sm:inline">·</span>
                      <span className="px-2 py-0.5 bg-stone-100 rounded-full text-stone-600">
                        {prayer.category}
                      </span>
                      <span className="hidden sm:inline">·</span>
                      <span className="flex items-center gap-1">
                        <i className="ri-hand-heart-line text-amber-500"></i>
                        <span className="hidden sm:inline">{prayer.prayerCount}명이 함께 기도</span>
                        <span className="sm:hidden">{prayer.prayerCount}</span>
                      </span>
                    </div>
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

export default function PrayersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-amber-50/20 via-amber-50/10 to-stone-50">
          <Header />
          <div className="py-16 text-center text-stone-500 text-sm">불러오는 중...</div>
          <Footer />
        </div>
      }
    >
      <PrayersPageContent />
    </Suspense>
  );
}
