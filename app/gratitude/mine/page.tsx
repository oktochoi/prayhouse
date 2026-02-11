'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  getMyEntryByDate,
  saveGratitudeEntry,
  updateGratitudeEntry,
  getMyDatesWithEntries,
  getCharLimit,
  type GratitudeEntry,
} from '@/lib/gratitude';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/utils/supabase/client';
import { requireLogin } from '@/lib/auth';
import Link from 'next/link';
import LoginModal from '@/components/LoginModal';

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function getLocalDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 오늘, 어제만 작성 가능. 그 이전은 읽기 전용 */
function isWritableDate(dateKey: string): boolean {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const todayStr = getLocalDateKey(today);
  const yesterdayStr = getLocalDateKey(yesterday);
  return dateKey === todayStr || dateKey === yesterdayStr;
}

export default function MyGratitudePage() {
  const { userData, loading: authLoading } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(() => getLocalDateKey(new Date()));
  const [myEntry, setMyEntry] = useState<GratitudeEntry | null>(null);
  const [datesWithEntries, setDatesWithEntries] = useState<string[]>([]);
  const [formText, setFormText] = useState('');
  const [formPublic, setFormPublic] = useState(false);
  const [formPrayerId, setFormPrayerId] = useState<string | null>(null);
  const [prayers, setPrayers] = useState<{ id: string; title: string }[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const loadData = useCallback(async () => {
    if (!userData?.id) return;
    const dates = await getMyDatesWithEntries(userData.id);
    setDatesWithEntries(dates);
  }, [userData?.id]);

  useEffect(() => {
    async function fetchPrayers() {
      const supabase = createClient();
      const { data } = await supabase
        .from('prayers')
        .select('id, title')
        .order('created_at', { ascending: false })
        .limit(20);
      setPrayers(data ?? []);
    }
    fetchPrayers();
  }, []);

  useEffect(() => {
    if (!userData?.id) {
      setLoading(false);
      return;
    }
    loadData().finally(() => setLoading(false));
  }, [userData?.id, loadData]);

  useEffect(() => {
    if (!userData?.id || !selectedDate) return;
    getMyEntryByDate(userData.id, selectedDate).then((entry) => {
      setMyEntry(entry);
      if (entry) {
        setFormText(entry.text);
        setFormPublic(entry.is_public);
        setFormPrayerId(entry.linked_prayer_id);
      } else {
        setFormText('');
        setFormPublic(false);
        setFormPrayerId(null);
      }
    });
  }, [userData?.id, selectedDate]);

  const handleSave = async () => {
    const check = requireLogin(userData ?? null);
    if (check.needLogin) {
      alert(check.message);
      return;
    }
    if (!userData || !selectedDate) return;
    if (!formText.trim()) {
      alert('감사할 내용을 적어주세요.');
      return;
    }

    const result = myEntry
      ? await updateGratitudeEntry(myEntry.id, {
          text: formText.trim(),
          is_public: formPublic,
          linked_prayer_id: formPrayerId || null,
        })
      : await saveGratitudeEntry(
          userData.id,
          selectedDate,
          formText.trim(),
          formPublic,
          formPrayerId
        );

    if (result) {
      setMyEntry(result);
      setSaved(true);
      loadData();
    } else {
      alert('저장에 실패했습니다.');
    }
  };

  const handleSelectDate = (dateKey: string) => {
    setSaved(false);
    setSelectedDate(dateKey);
  };

  const entrySet = useMemo(() => new Set(datesWithEntries), [datesWithEntries]);

  const monthDateKeys = useMemo(() => {
    const keys: string[] = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= days; day += 1) {
      const key = getLocalDateKey(new Date(year, month, day));
      keys.push(key);
    }
    return keys;
  }, [currentMonth]);

  const monthEntryCount = useMemo(
    () => monthDateKeys.filter((key) => entrySet.has(key)).length,
    [monthDateKeys, entrySet]
  );

  const completionRatio = useMemo(
    () => (monthDateKeys.length ? monthEntryCount / monthDateKeys.length : 0),
    [monthEntryCount, monthDateKeys.length]
  );

  const glowOpacity = useMemo(() => {
    const min = 0.05;
    const max = 0.4;
    return Math.min(max, min + completionRatio * (max - min));
  }, [completionRatio]);

  const currentStreak = useMemo(() => {
    let count = 0;
    const cursor = new Date(getLocalDateKey(new Date()) + 'T12:00:00');
    while (entrySet.has(getLocalDateKey(cursor))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [entrySet]);

  const longestStreak = useMemo(() => {
    if (datesWithEntries.length === 0) return 0;
    const sorted = [...datesWithEntries].sort();
    let best = 1;
    let run = 1;
    for (let i = 1; i < sorted.length; i += 1) {
      const prev = new Date(sorted[i - 1] + 'T12:00:00');
      const curr = new Date(sorted[i] + 'T12:00:00');
      const diff = (curr.getTime() - prev.getTime()) / 86400000;
      if (diff === 1) {
        run += 1;
        best = Math.max(best, run);
      } else {
        run = 1;
      }
    }
    return best;
  }, [datesWithEntries]);

  const isFullMonth = monthEntryCount > 0 && monthEntryCount === monthDateKeys.length;

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startPad = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();
  const calendarDays: (string | null)[] = [];
  for (let i = 0; i < startPad; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push(key);
  }

  const todayKey = getLocalDateKey(new Date());
  const canWrite = selectedDate ? isWritableDate(selectedDate) : false;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <p className="text-stone-400 text-sm">불러오는 중...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <Header />
        <main className="pt-20 max-w-2xl mx-auto px-6 py-16 text-center">
          <p className="text-stone-600 font-light mb-6">감사일기를 작성하려면 로그인해 주세요.</p>
          <button
            type="button"
            onClick={() => setShowLoginModal(true)}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
          >
            로그인하기
          </button>
          <Link
            href="/gratitude"
            className="mt-4 ml-4 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white text-amber-700 text-sm font-medium border border-amber-200 hover:border-amber-300 hover:bg-amber-50 transition-colors"
          >
            메인으로
          </Link>
        </main>
        <Footer />
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          redirectPath="/gratitude/mine"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Header />

      <main className="pt-16 sm:pt-8 lg:pt-10">
        <div className="max-w-2xl mx-auto px-5 sm:px-6">
          <div className="mb-8">
            <Link
              href="/gratitude"
              className="text-sm text-stone-500 hover:text-stone-700 inline-flex items-center gap-1"
            >
              <i className="ri-arrow-left-line" /> 감사일기
            </Link>
          </div>

          <div className="py-4 sm:py-6">
            <h1 className="text-2xl sm:text-3xl font-light text-stone-800 mb-2">내 감사일기</h1>
            <p className="text-sm font-light text-stone-500">날짜를 선택하고 오늘의 감사를 기록하세요.</p>
          </div>

          <div className="h-px bg-stone-200/80 mb-10 sm:mb-12" />

          {/* Calendar */}
          <section className="mb-12 sm:mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-medium text-stone-700">캘린더</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
                  }
                  className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                  aria-label="이전 달"
                >
                  <i className="ri-arrow-left-s-line text-xl" />
                </button>
                <span className="text-sm font-medium text-stone-700 w-28 text-center">
                  {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                </span>
                <button
                  onClick={() =>
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
                  }
                  className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                  aria-label="다음 달"
                >
                  <i className="ri-arrow-right-s-line text-xl" />
                </button>
              </div>
            </div>

            <div
              className={`relative bg-[#F8F6F2] rounded-2xl border border-stone-200/60 p-4 sm:p-6 transition-all duration-500 ${
                isFullMonth ? 'shadow-[0_0_50px_rgba(251,191,36,0.3)]' : 'shadow-[0_8px_24px_rgba(15,23,42,0.04)]'
              }`}
              style={{
                backgroundImage: `radial-gradient(circle at 50% 30%, rgba(251,191,36,${glowOpacity}), transparent 70%)`,
              }}
            >
              <div className="grid grid-cols-7 gap-1 mb-3">
                {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
                  <div
                    key={d}
                    className="text-center text-[10px] sm:text-xs font-medium text-stone-500 py-1"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((dateKey, i) => {
                  if (!dateKey) {
                    return <div key={`empty-${i}`} className="aspect-square" />;
                  }
                  const hasEntry = entrySet.has(dateKey);
                  const isSelected = selectedDate === dateKey;
                  const isToday = dateKey === todayKey;
                  const prevDate = new Date(dateKey + 'T12:00:00');
                  prevDate.setDate(prevDate.getDate() - 1);
                  const hasPrev = entrySet.has(getLocalDateKey(prevDate));
                  return (
                    <button
                      key={dateKey}
                      onClick={() => handleSelectDate(dateKey)}
                      className={`relative aspect-square flex flex-col items-center justify-center text-xs sm:text-sm transition-all duration-250 ease-out cursor-pointer ${
                        hasEntry
                          ? 'rounded-lg bg-amber-50/60 text-amber-900 hover:bg-amber-100/60 hover:-translate-y-[2px]'
                          : 'rounded-lg bg-transparent text-neutral-500 hover:bg-stone-100/60 hover:-translate-y-[2px]'
                      } ${
                        isSelected && !hasEntry ? 'ring-2 ring-stone-300/70' : ''
                      } ${
                        isToday
                          ? 'ring-1 ring-amber-400 ring-offset-2 ring-offset-[#F8F6F2]'
                          : ''
                      }`}
                    >
                      <span>{new Date(dateKey + 'T12:00:00').getDate()}</span>
                      {hasEntry && (
                        <span className="w-1 h-1 rounded-full mt-1 bg-amber-500/70" />
                      )}
                      {hasEntry && hasPrev && (
                        <span className="absolute -bottom-1 left-1 right-1 h-px bg-amber-300/60" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-stone-600">
              <div>
                <p className="text-xs text-stone-400 mb-1">이번 달 작성</p>
                <p className="text-base text-stone-800">
                  {monthEntryCount}일 / {monthDateKeys.length}일
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-1">현재 연속</p>
                <p className="text-base text-stone-800">{currentStreak}일</p>
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-1">최장 연속</p>
                <p className="text-base text-stone-800">{longestStreak}일</p>
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-1">이번 달 배지</p>
                <p className="text-base text-stone-800">
                  {isFullMonth ? '완주 축복' : '—'}
                </p>
              </div>
            </div>

            {isFullMonth && (
              <div className="mt-6 text-sm text-amber-900/90 bg-amber-100/40 border border-amber-200/50 rounded-xl px-4 py-3 shadow-[0_0_28px_rgba(251,191,36,0.25)] animate-[pulse_2.5s_ease-in-out_1]">
                이번 달을 완주했습니다 ✨
              </div>
            )}
          </section>

          {/* Entry form / View */}
          <section className="mb-12 sm:mb-16">
            {selectedDate && (
              <div className="mb-6 space-y-2">
                <p className="text-xs text-stone-500 font-light">
                  {formatDisplayDate(selectedDate)}
                </p>
                {myEntry?.text && (
                  <p className="text-sm text-stone-600 font-light">
                    {myEntry.text.split('\n')[0].slice(0, 60)}
                    {myEntry.text.length > 60 ? '…' : ''}
                  </p>
                )}
              </div>
            )}

            {myEntry ? (
              <div className="bg-white/80 rounded-2xl border border-stone-100 p-6 sm:p-8">
                <p className="font-lora text-base sm:text-lg text-stone-700 leading-relaxed mb-6">
                  {myEntry.text}
                </p>
                {myEntry.linked_prayer_id && (
                  <div className="mb-6 py-3 px-4 bg-stone-50 rounded-lg border border-stone-100">
                    <p className="text-xs text-stone-600 font-light">
                      이 감사는 다음 기도와 연결되어 있습니다.
                    </p>
                    <Link
                      href={`/prayers/${myEntry.linked_prayer_id}`}
                      className="text-sm text-stone-700 hover:text-stone-900 mt-1 inline-block"
                    >
                      {prayers.find((p) => p.id === myEntry.linked_prayer_id)?.title ?? '기도 제목 보기'} →
                    </Link>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span>{myEntry.is_public ? '공개' : '비공개'}</span>
                </div>
                {canWrite && (
                  <button
                    onClick={() => {
                      setMyEntry(null);
                      setFormText(myEntry.text);
                      setFormPublic(myEntry.is_public);
                      setFormPrayerId(myEntry.linked_prayer_id);
                    }}
                    className="mt-4 text-sm text-stone-500 hover:text-stone-700"
                  >
                    수정하기
                  </button>
                )}
                {!canWrite && (
                  <p className="mt-4 text-xs text-stone-400">지난 날짜는 읽기만 가능합니다.</p>
                )}
              </div>
            ) : canWrite ? (
              <div className="bg-white/80 rounded-2xl border border-stone-100 p-6 sm:p-8">
                <textarea
                  value={formText}
                  onChange={(e) => setFormText(e.target.value.slice(0, getCharLimit()))}
                  placeholder="오늘 하루, 하나님께 감사할 한 가지를 기록해보세요."
                  className="w-full min-h-[120px] px-0 py-0 text-base sm:text-lg font-light text-stone-700 placeholder-stone-400 bg-transparent border-0 resize-none focus:outline-none leading-relaxed font-lora"
                />
                <div className="flex justify-between items-center mt-4 text-xs text-stone-400">
                  <span>
                    {formText.length} / {getCharLimit()}
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPublic}
                      onChange={(e) => setFormPublic(e.target.checked)}
                      className="w-4 h-4 rounded border-stone-300 text-stone-600 focus:ring-stone-400"
                    />
                    <span className="text-sm font-light text-stone-600">
                      공개로 공유하기 (익명으로 감사일기 보기에 노출됩니다)
                    </span>
                  </label>

                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2">
                      기도와 연결하기 (선택)
                    </label>
                    <select
                      value={formPrayerId ?? ''}
                      onChange={(e) => setFormPrayerId(e.target.value || null)}
                      className="w-full px-4 py-2.5 text-sm font-light text-stone-700 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
                    >
                      <option value="">선택 안 함</option>
                      {prayers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={!formText.trim()}
                  className="mt-8 w-full sm:w-auto px-6 py-3 bg-stone-700 text-white text-sm font-medium rounded-full hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  오늘의 감사 기록하기
                </button>
              </div>
            ) : (
              <div className="bg-white/80 rounded-2xl border border-stone-100 p-6 sm:p-8">
                <p className="text-stone-500 text-xs sm:text-sm font-light">
                  오늘과 어제만 감사를 작성할 수 있습니다.
                </p>
              </div>
            )}
          </section>

          {saved && (
            <p className="text-center text-sm text-stone-500 font-light py-4">
              이 은혜를 기억합니다.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
