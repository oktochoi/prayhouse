'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import AnimatedSection from './AnimatedSection';

type PrayerItem = {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  date: string;
  prayerCount: number;
  isUrgent: boolean;
};

const categories = ['전체', '건강', '가족', '학업', '직장', '교회', '사역', '진로', '관계', '재정', '기타'];

function formatDateKr(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function PrayerSection() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [prayers, setPrayers] = useState<PrayerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrayers() {
      const supabase = createClient();
      const { data: prayersData } = await supabase
        .from('prayers')
        .select('id, title, content, category, priority, author_name, is_anonymous, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!prayersData?.length) {
        setPrayers([]);
        setLoading(false);
        return;
      }

      const ids = prayersData.map((p) => p.id);
      const { data: countsData } = await supabase
        .from('prayer_participations')
        .select('prayer_id')
        .in('prayer_id', ids);

      const countMap: Record<string, number> = {};
      countsData?.forEach((row) => {
        countMap[row.prayer_id] = (countMap[row.prayer_id] || 0) + 1;
      });

      const items: PrayerItem[] = prayersData.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        category: p.category,
        author: p.is_anonymous ? '익명' : (p.author_name || '익명'),
        date: formatDateKr(p.created_at),
        prayerCount: countMap[p.id] || 0,
        isUrgent: p.priority === '긴급',
      }));

      setPrayers(items);
      setLoading(false);
    }
    fetchPrayers();
  }, []);

  const filtered = prayers.filter(
    (p) => selectedCategory === '전체' || p.category === selectedCategory
  );

  return (
    <section className="py-20 sm:py-28 lg:py-32 bg-stone-50/80">
      <div className="max-w-2xl mx-auto px-5 sm:px-6">
        <AnimatedSection>
          <header className="mb-12 sm:mb-16 text-center">
            <p className="text-[10px] sm:text-xs tracking-[0.25em] text-amber-600 uppercase mb-3 font-medium">
              Prayer Requests
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-stone-800 mb-4 leading-tight">
              함께 기도할 제목들
            </h2>
            <p className="text-sm sm:text-base text-stone-500 leading-relaxed max-w-md mx-auto">
              형제자매들의 기도 제목에 마음을 모아 함께 기도해주세요
            </p>
          </header>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <div className="mb-10 sm:mb-12 flex flex-wrap justify-center gap-2 sm:gap-2.5">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-stone-800 text-white shadow-md shadow-stone-800/20'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/80 hover:border-stone-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {loading ? (
          <div className="py-16 text-center text-stone-500 text-sm">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-stone-500">
            <p className="mb-4">아직 등록된 기도 제목이 없습니다.</p>
            <Link
              href="/prayers/new"
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              첫 번째 기도 제목을 등록해보세요 →
            </Link>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {filtered.slice(0, 4).map((prayer, index) => (
              <AnimatedSection key={prayer.id} delay={150 + index * 80}>
                <article className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-sm hover:shadow-xl hover:shadow-stone-200/50 hover:-translate-y-0.5 transition-all duration-300 border border-stone-100/80">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <span className="px-3 py-1 bg-stone-100 text-stone-600 text-[10px] sm:text-xs font-medium rounded-full">
                      {prayer.category}
                    </span>
                    {prayer.isUrgent && (
                      <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] sm:text-xs font-medium rounded-full">
                        긴급
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-stone-800 mb-2 sm:mb-3 leading-snug group-hover:text-stone-900 transition-colors">
                    {prayer.title}
                  </h3>

                  <p className="text-sm sm:text-base text-stone-500 leading-relaxed mb-5 sm:mb-6 line-clamp-2">
                    {prayer.content}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-5 border-t border-stone-100">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-stone-100 to-stone-200 rounded-full flex items-center justify-center">
                        <span className="text-stone-600 font-medium text-sm">
                          {prayer.author.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-stone-800 font-medium text-sm">{prayer.author}</p>
                        <p className="text-stone-400 text-xs">{prayer.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="flex items-center gap-2 text-stone-400">
                        <i className="ri-hand-heart-line text-base text-amber-500"></i>
                        <span className="text-sm font-medium">{prayer.prayerCount}명</span>
                      </div>
                      <Link
                        href={`/prayers/${prayer.id}`}
                        className="px-5 sm:px-6 py-2.5 bg-stone-800 text-white text-sm font-medium rounded-full hover:bg-stone-700 transition-all duration-300 whitespace-nowrap cursor-pointer"
                      >
                        기도하기
                      </Link>
                    </div>
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        )}

        <AnimatedSection delay={500}>
          <div className="text-center mt-12 sm:mt-14">
            <Link
              href="/prayers"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 border-2 border-stone-800 text-stone-800 text-sm font-medium rounded-full hover:bg-stone-800 hover:text-white transition-all duration-300 cursor-pointer"
            >
              더 많은 기도 제목 보기
              <i className="ri-arrow-right-line text-lg"></i>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
