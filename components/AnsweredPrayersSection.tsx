'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import AnimatedSection from './AnimatedSection';

type AnswerItem = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
};

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function AnsweredPrayersSection() {
  const [answers, setAnswers] = useState<AnswerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnswers() {
      const supabase = createClient();
      const { data } = await supabase
        .from('prayers')
        .select('id, title, content, author_name, is_anonymous, created_at')
        .eq('status', 'answered')
        .order('created_at', { ascending: false })
        .limit(3);

      if (!data?.length) {
        setAnswers([]);
        setLoading(false);
        return;
      }

      setAnswers(
        data.map((p) => ({
          id: p.id,
          title: p.title,
          excerpt: p.content.slice(0, 80) + (p.content.length > 80 ? '...' : ''),
          author: p.is_anonymous ? '익명' : (p.author_name || '익명'),
          date: formatDateShort(p.created_at),
        }))
      );
      setLoading(false);
    }
    fetchAnswers();
  }, []);

  return (
    <section className="py-20 sm:py-28 lg:py-32 bg-white">
      <div className="max-w-2xl mx-auto px-5 sm:px-6">
        <AnimatedSection>
          <header className="mb-12 sm:mb-16 text-center">
            <p className="text-[10px] sm:text-xs tracking-[0.25em] text-amber-600 uppercase mb-3 font-medium">
              Answered Prayers
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-stone-800 mb-4 leading-tight">
              기도 응답 이야기
            </h2>
            <p className="text-sm sm:text-base text-stone-500">
              하나님께서 들어주신 기도들
            </p>
          </header>
        </AnimatedSection>

        {loading ? (
          <div className="py-12 text-center text-stone-500 text-sm">불러오는 중...</div>
        ) : answers.length === 0 ? (
          <div className="py-12 text-center text-stone-500">
            <p>아직 등록된 기도 응답이 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5">
            {answers.map((answer, index) => (
              <AnimatedSection key={answer.id} delay={100 + index * 80}>
                <Link href={`/prayers/${answer.id}`}>
                  <article className="group relative overflow-hidden bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-amber-50/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 border border-amber-100/80 hover:shadow-lg hover:shadow-amber-100/50 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="absolute top-5 right-5 w-12 h-12 rounded-full bg-amber-200/30 flex items-center justify-center">
                      <i className="ri-sparkling-fill text-amber-600/70 text-lg"></i>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-amber-600 text-[10px] sm:text-xs font-semibold tracking-wider uppercase">
                        응답
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-medium text-stone-800 mb-2 sm:mb-3 pr-14">
                      {answer.title}
                    </h3>
                    <p className="text-sm sm:text-base text-stone-600 leading-relaxed mb-5 sm:mb-6">
                      {answer.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-amber-200/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-200/80 rounded-full flex items-center justify-center">
                          <span className="text-amber-800 font-medium text-sm">
                            {answer.author.charAt(0)}
                          </span>
                        </div>
                        <span className="text-stone-700 font-medium text-sm">{answer.author}</span>
                      </div>
                      <span className="text-stone-400 text-xs sm:text-sm">{answer.date}</span>
                    </div>
                  </article>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        )}

        <AnimatedSection delay={400}>
          <div className="text-center mt-12 sm:mt-14">
            <Link
              href="/prayers?filter=answered"
              className="inline-flex items-center gap-2 text-sm text-stone-600 font-medium hover:text-stone-800 transition-colors cursor-pointer"
            >
              더 많은 응답 이야기 보기
              <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
