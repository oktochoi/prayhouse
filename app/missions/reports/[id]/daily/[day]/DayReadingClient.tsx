'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getMissionById, getDailyEntryByDay, getDailyEntries } from '@/lib/missions';

interface DayReadingClientProps {
  params: { id: string; day: string };
}

function formatDateKr(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function isMissionEnded(endDate: string) {
  const end = new Date(endDate + 'T23:59:59');
  const now = new Date();
  return end.getTime() < now.getTime();
}

export default function DayReadingClient({ params }: DayReadingClientProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const reportId = params?.id || '';
  const currentDay = parseInt(params?.day || '1', 10);
  const [mission, setMission] = useState<{
    id: string;
    title: string;
    end_date?: string;
    is_completed?: boolean;
  } | null>(null);
  const [entry, setEntry] = useState<{
    day: number;
    date: string;
    title: string;
    content: string;
    images?: { url: string }[];
    activities?: string[];
    thanksgiving?: string | null;
    prayer_requests?: string | null;
  } | null>(null);
  const [allDays, setAllDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!reportId) return;
    Promise.all([
      getMissionById(reportId),
      getDailyEntryByDay(reportId, currentDay),
      getDailyEntries(reportId),
    ]).then(([m, e, entries]) => {
      setMission(
        m ? { id: m.id, title: m.title, end_date: m.end_date, is_completed: m.is_completed } : null
      );
      setEntry(e ? { ...e, date: formatDateKr(e.date) } : null);
      setAllDays(entries.map((x) => x.day).sort((a, b) => a - b));
      setLoading(false);
    });
  }, [reportId, currentDay]);

  const currentIndex = allDays.indexOf(currentDay);
  const prevDay = currentIndex > 0 ? allDays[currentIndex - 1] : null;
  const nextDay = currentIndex >= 0 && currentIndex < allDays.length - 1 ? allDays[currentIndex + 1] : null;

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-50">
        <Header />
        <div className="py-20 text-center text-stone-500">불러오는 중...</div>
        <Footer />
      </main>
    );
  }

  if (!entry || !mission) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-50">
        <Header />
        <div className="py-20 text-center">
          <p className="text-stone-500 mb-4">일기를 찾을 수 없습니다.</p>
          <Link href={`/missions/reports/${reportId}`} className="text-amber-600 hover:text-amber-700">
            선교 일기로 돌아가기
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#F8F6F2]">
        <Header />

        <article className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-[680px] mx-auto px-5 sm:px-6">
            <div className="mb-10 sm:mb-14">
              <Link
                href={`/missions/reports/${reportId}`}
                className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors tracking-widest mb-10 font-medium"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'all 0.5s ease-out',
                }}
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                {mission.title}
              </Link>

              <div
                className="space-y-2"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'all 0.7s ease-out',
                  transitionDelay: '200ms',
                }}
              >
                <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
                  Day {entry.day}
                </p>
                <p className="text-sm text-stone-500">{entry.date}</p>
                {mission?.title && (
                  <div className="flex items-center gap-3 text-sm text-stone-500">
                    <span>{mission.title}</span>
                    {((mission.is_completed ?? false) ||
                      (mission.end_date && isMissionEnded(mission.end_date))) && (
                      <span
                        className={`text-[11px] tracking-wide rounded-full px-2 py-0.5 ${
                          mission.is_completed
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                            : 'text-stone-600 bg-stone-100 border border-stone-200'
                        }`}
                      >
                        {mission.is_completed ? '선교 완료' : '종료된 선교'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl text-stone-900 leading-tight mb-8">
              {entry.title}
            </h1>

            <div className="h-px bg-stone-200/80 my-8" />

            {entry.images && entry.images.length > 0 && (
              <div className="my-10">
                <img
                  src={entry.images[0].url}
                  alt={`Day ${entry.day} 사진`}
                  className="w-full rounded-xl shadow-sm shadow-stone-300/50"
                />
              </div>
            )}

            <div
              className="space-y-6 text-stone-700 text-base sm:text-lg leading-8 border-l-2 border-amber-200 pl-6"
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'translateY(0)' : 'translateY(40px)',
                transition: 'all 0.8s ease-out',
                transitionDelay: '400ms',
              }}
            >
              <div
                className="[&_p]:mb-4 [&_strong]:font-semibold [&_em]:italic"
                dangerouslySetInnerHTML={{ __html: entry.content }}
              />
            </div>

            {entry.activities?.length ? (
              <div className="mt-10 text-sm text-stone-500">
                {entry.activities.map((activity, i) => (
                  <span key={`${activity}-${i}`} className="mr-2">
                    #{activity}
                  </span>
                ))}
              </div>
            ) : null}

            {entry.thanksgiving ? (
              <div className="mt-12">
                <h3 className="text-base font-medium text-stone-800 mb-2">🙏 오늘의 감사</h3>
                <p className="text-stone-700 leading-8 whitespace-pre-wrap">{entry.thanksgiving}</p>
              </div>
            ) : null}

            {entry.prayer_requests ? (
              <div className="mt-10">
                <h3 className="text-base font-medium text-stone-800 mb-2">🙏 오늘의 기도</h3>
                <p className="text-stone-700 leading-8 whitespace-pre-wrap">{entry.prayer_requests}</p>
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-12 mt-12 border-t border-stone-200/80">
              <div>
                {prevDay && (
                  <Link
                    href={`/missions/reports/${reportId}/daily/${prevDay}`}
                    className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
                  >
                    ← Day {prevDay}
                  </Link>
                )}
              </div>
              <div>
                {nextDay && (
                  <Link
                    href={`/missions/reports/${reportId}/daily/${nextDay}`}
                    className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
                  >
                    Day {nextDay} →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </article>

        <Footer />
      </main>
    </>
  );
}
