'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { getMissionById, getDailyEntries, type Mission, type MissionDailyEntry } from '@/lib/missions';

interface MissionReportClientProps {
  reportId: string;
}

function formatDateKr(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function isMissionEnded(endDate: string) {
  const end = new Date(endDate + 'T23:59:59');
  const now = new Date();
  return end.getTime() < now.getTime();
}

export default function MissionReportClient({ reportId }: MissionReportClientProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mission, setMission] = useState<Mission | null>(null);
  const [dailyEntries, setDailyEntries] = useState<MissionDailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!reportId) return;
    Promise.all([getMissionById(reportId), getDailyEntries(reportId)]).then(([m, entries]) => {
      setMission(m ?? null);
      setDailyEntries(entries);
      setLoading(false);
    });
  }, [reportId]);

  if (loading || !mission) {
    return (
      <>
        <main className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-50">
          <Header />
          <div className="py-20 text-center text-stone-500">
            {loading ? '불러오는 중...' : '선교 일기를 찾을 수 없습니다.'}
            {!loading && !mission && (
              <Link href="/missions" className="block mt-4 text-amber-600 hover:text-amber-700">
                선교 목록으로
              </Link>
            )}
          </div>
          <Footer />
        </main>
      </>
    );
  }

  const location = `${mission.region} ${mission.country}`;
  const firstImage = mission.images?.[0]?.url;
  const supportAmount = mission.needs_support
    ? `₩${mission.current_support.toLocaleString()} / ₩${mission.support_goal.toLocaleString()}`
    : null;
  const isOwner = userData?.id === mission.user_id;
  const ended = isMissionEnded(mission.end_date);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: mission.title,
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      alert('공유 링크를 복사했어요.');
    } catch (error) {
      console.error(error);
      alert('공유에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  const handleDeleteMission = async () => {
    if (!isOwner) return;
    if (!confirm('정말로 이 선교 일기서를 삭제하시겠습니까?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('missions').delete().eq('id', mission.id);
    if (error) {
      alert(error.message);
      return;
    }
    router.push('/missions');
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-50">
        <Header />

        <article className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-3xl mx-auto px-5 sm:px-6">
            <div
              className="mb-10 sm:mb-16 transition-all duration-700"
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
              }}
            >
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between gap-4 mb-3 sm:mb-4">
                  <p className="text-[10px] sm:text-xs text-stone-400 tracking-widest uppercase">
                    {location}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="px-3 py-1.5 text-xs text-stone-700 bg-white border border-stone-200 hover:border-amber-200 hover:text-amber-700 transition-colors"
                    >
                      공유
                    </button>
                    {isOwner && (
                      <>
                        <Link
                          href={`/missions/reports/${reportId}/daily`}
                          className="px-3 py-1.5 text-xs text-white bg-amber-600 hover:bg-amber-700 transition-colors"
                        >
                          일기 작성
                        </Link>
                        <Link
                          href={`/missions/new?edit=${mission.id}`}
                          className="px-3 py-1.5 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                        >
                          수정
                        </Link>
                        <button
                          type="button"
                          onClick={handleDeleteMission}
                          className="px-3 py-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                        >
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {ended && (
                  <div className="inline-flex items-center px-2.5 py-1 text-[11px] tracking-wide text-stone-600 bg-stone-100 border border-stone-200 rounded-full mb-4">
                    종료된 선교
                  </div>
                )}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-stone-800 mb-3 sm:mb-4 tracking-wide leading-tight">
                  {mission.title}
                </h1>
                <div
                  className="text-sm sm:text-base text-stone-600 leading-relaxed mb-4 sm:mb-6 prose prose-sm max-w-none [&_strong]:font-semibold [&_em]:italic"
                  dangerouslySetInnerHTML={{ __html: mission.description }}
                />
              </div>

              <div
                className="aspect-[2/1] relative overflow-hidden bg-stone-100 mb-6 sm:mb-8 rounded-lg sm:rounded-none transition-all duration-1000"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'scale(1)' : 'scale(0.95)',
                  transitionDelay: '200ms',
                }}
              >
                {firstImage ? (
                  <img
                    src={firstImage}
                    alt={mission.title}
                    className="w-full h-full object-cover object-top opacity-80 hover:opacity-100 transition-opacity duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="ri-image-line text-4xl text-stone-300" />
                  </div>
                )}
              </div>

              <div
                className="flex items-center justify-between py-4 sm:py-6 border-y border-stone-200/60 text-xs sm:text-sm transition-all duration-700"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transitionDelay: '400ms',
                }}
              >
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-stone-400 text-[10px] sm:text-xs tracking-wide">기간</p>
                  <p className="text-stone-600 text-xs sm:text-sm">
                    {formatDateKr(mission.start_date)} - {formatDateKr(mission.end_date)}
                  </p>
                </div>
                {supportAmount && (
                  <div className="space-y-0.5 sm:space-y-1 text-right">
                    <p className="text-stone-400 text-[10px] sm:text-xs tracking-wide">후원</p>
                    <p className="text-stone-600 text-xs sm:text-sm">{supportAmount}</p>
                  </div>
                )}
              </div>
            </div>

            <div
              className="mb-10 sm:mb-16 transition-all duration-700"
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                transitionDelay: '500ms',
              }}
            >
              <h2 className="text-xl sm:text-2xl font-light text-stone-800 mb-6 sm:mb-8 tracking-wide">
                여정의 기록
              </h2>

              {dailyEntries.length === 0 ? (
                <p className="text-stone-500 text-sm py-8">아직 기록된 일기가 없습니다.</p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {dailyEntries.map((entry, index) => (
                    <Link
                      key={entry.id}
                      href={`/missions/reports/${reportId}/daily/${entry.day}`}
                      className="block group"
                      style={{
                        opacity: isLoaded ? 1 : 0,
                        transform: isLoaded ? 'translateX(0)' : 'translateX(-20px)',
                        transition: 'all 0.5s ease-out',
                        transitionDelay: `${600 + index * 80}ms`,
                      }}
                    >
                      <div className="flex items-center py-3 sm:py-4 px-4 sm:px-6 bg-white/40 border border-stone-200/60 hover:border-amber-200/80 hover:bg-white/80 hover:translate-x-2 transition-all duration-300 rounded-lg sm:rounded-none">
                        <div className="flex-shrink-0 w-12 sm:w-16">
                          <span className="text-xs sm:text-sm text-stone-400 tracking-wider group-hover:text-amber-600 transition-colors">
                            Day {entry.day}
                          </span>
                        </div>
                        <div className="flex-1 px-3 sm:px-6">
                          <h3 className="text-sm sm:text-base text-stone-700 group-hover:text-stone-900 transition-colors">
                            {entry.title}
                          </h3>
                        </div>
                        <div className="flex-shrink-0 hidden sm:flex items-center gap-3">
                          <span className="text-xs text-stone-400">{formatDateShort(entry.date)}</span>
                          <i className="ri-arrow-right-s-line text-stone-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all"></i>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div
              className="text-center pt-8 sm:pt-12 border-t border-stone-200/60 transition-all duration-700"
              style={{
                opacity: isLoaded ? 1 : 0,
                transitionDelay: '1200ms',
              }}
            >
              <Link
                href="/missions"
                className="inline-block text-sm text-stone-600 hover:text-amber-700 transition-colors duration-300 tracking-wide border-b border-stone-300 hover:border-amber-400 pb-1"
              >
                ← 선교 여정 목록으로
              </Link>
            </div>
          </div>
        </article>

        <Footer />
      </main>
    </>
  );
}
