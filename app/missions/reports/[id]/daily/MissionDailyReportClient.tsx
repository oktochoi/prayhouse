
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import { useAuth } from '@/components/AuthProvider';
import { requireLogin } from '@/lib/auth';
import { createClient } from '@/utils/supabase/client';
import { processImagesToWebP } from '@/lib/image-utils';
import {
  MISSION_IMAGES_BUCKET,
  createDailyEntry,
  deleteDailyEntry,
  getDailyEntries,
  getMissionById,
  updateDailyEntry,
  type Mission,
  type MissionDailyEntry,
} from '@/lib/missions';

function isMissionEnded(endDate: string) {
  const end = new Date(endDate + 'T23:59:59');
  const now = new Date();
  return end.getTime() < now.getTime();
}

interface MissionDailyReportClientProps {
  params: { id: string };
}

export default function MissionDailyReportClient({ params }: MissionDailyReportClientProps) {
  const { userData } = useAuth();
  const currentUser = userData ? { email: userData.email, name: userData.name } : null;
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState({
    day: 1,
    date: '',
    title: '',
    content: '',
    mood: '감사',
    weather: '맑음',
    activities: [] as string[],
    prayerRequests: '',
    thanksgiving: '',
    imageFiles: [] as File[],
    imagePreviews: [] as string[],
    author: '',
    isEdited: false
  });

  // params.id가 undefined인 경우를 대비한 안전한 기본값 설정
  const reportId = params?.id || '';

  const [missionReport, setMissionReport] = useState<Mission | null>(null);
  const [dailyEntries, setDailyEntries] = useState<MissionDailyEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!reportId) {
        setMissionReport(null);
        setDailyEntries([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [mission, entries] = await Promise.all([
          getMissionById(reportId),
          getDailyEntries(reportId),
        ]);
        if (cancelled) return;
        setMissionReport(mission);
        setDailyEntries(entries);
      } catch {
        if (cancelled) return;
        setMissionReport(null);
        setDailyEntries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reportId]);

  const moods = ['감사', '기쁨', '평안', '설렘', '숙연함', '보람참', '도전적', '피곤함'];
  const weathers = ['맑음', '구름많음', '흐림', '비', '더움', '선선함'];

  const isAuthor = () => {
    return !!(userData?.id && missionReport?.user_id && userData.id === missionReport.user_id);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Header />
        <div className="py-20 text-center text-gray-500">불러오는 중...</div>
        <Footer />
      </main>
    );
  }

  if (!missionReport) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Header />
        <div className="py-20 text-center text-gray-500">
          선교 일기서를 찾을 수 없습니다.
        </div>
        <Footer />
      </main>
    );
  }

  const nextImage = () => {
    const images = missionReport?.images ?? [];
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev >= images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    const images = missionReport?.images ?? [];
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev <= 0 ? images.length - 1 : prev - 1));
  };

  const handleAddEntry = () => {
    const loginCheck = requireLogin(userData);
    if (loginCheck.needLogin) {
      setShowLoginModal(true);
      return;
    }

    if (!isAuthor()) {
      alert('이 선교 일기서는 작성자만 편집할 수 있습니다.');
      return;
    }

    const nextDay = Math.max(...dailyEntries.map(entry => entry.day), 0) + 1;
    setNewEntry({
      day: nextDay,
      date: new Date().toISOString().split('T')[0],
      title: '',
      content: '',
      mood: '감사',
      weather: '맑음',
      activities: [],
      prayerRequests: '',
      thanksgiving: '',
      imageFiles: [],
      imagePreviews: [],
      author: currentUser?.email ?? '',
      isEdited: false,
    });
    setIsAddingNew(true);
    setSelectedDay(null);
  };

  const handleSaveEntry = async () => {
    const loginCheck = requireLogin(userData);
    if (loginCheck.needLogin) {
      setShowLoginModal(true);
      return;
    }

    if (!isAuthor()) {
      alert('이 선교 일기서는 작성자만 편집할 수 있습니다.');
      return;
    }

    if (newEntry.title.trim() && newEntry.content.trim()) {
      try {
        let imagePaths: string[] = [];
        if (newEntry.imageFiles.length > 0) {
          const blobs = await processImagesToWebP(newEntry.imageFiles, 3);
          const supabase = createClient();
          const uploads = [];
          for (let i = 0; i < blobs.length; i++) {
            const path = `missions/${reportId}/daily/${crypto.randomUUID()}.webp`;
            const { error } = await supabase.storage
              .from(MISSION_IMAGES_BUCKET)
              .upload(path, blobs[i], { contentType: 'image/webp', upsert: false });
            if (error) throw new Error(`이미지 업로드 실패: ${error.message}`);
            uploads.push(path);
          }
          imagePaths = uploads;
        }

        await createDailyEntry(reportId, {
          day: newEntry.day,
          date: newEntry.date,
          title: newEntry.title.trim(),
          content: newEntry.content.trim(),
          mood: newEntry.mood,
          weather: newEntry.weather,
          activities: newEntry.activities,
          prayer_requests: newEntry.prayerRequests,
          thanksgiving: newEntry.thanksgiving,
          imagePaths,
        });

        const entries = await getDailyEntries(reportId);
        setDailyEntries(entries);
        setNewEntry({
          day: 1,
          date: '',
          title: '',
          content: '',
          mood: '감사',
          weather: '맑음',
          activities: [],
          prayerRequests: '',
          thanksgiving: '',
          imageFiles: [],
          imagePreviews: [],
          author: '',
          isEdited: false,
        });
        setIsAddingNew(false);
      } catch (err) {
        alert(err instanceof Error ? err.message : '저장에 실패했습니다.');
      }
    }
  };

  const handleEditEntry = (day: number) => {
    const entryToEdit = dailyEntries.find(entry => entry.day === day);
    if (entryToEdit && isAuthor()) {
      setNewEntry({
        day: entryToEdit.day,
        date: entryToEdit.date,
        title: entryToEdit.title,
        content: entryToEdit.content,
        mood: entryToEdit.mood || '감사',
        weather: entryToEdit.weather || '맑음',
        activities: entryToEdit.activities || [],
        prayerRequests: entryToEdit.prayer_requests || '',
        thanksgiving: entryToEdit.thanksgiving || '',
        imageFiles: [],
        imagePreviews: entryToEdit.images?.map((img) => img.url) || [],
        author: currentUser?.email ?? '',
        isEdited: false,
      });
      setEditingEntryId(entryToEdit.id);
      setIsAddingNew(false);
      setSelectedDay(null);
    }
  };

  const handleUpdateEntry = async () => {
    if (newEntry.title.trim() && newEntry.content.trim() && editingEntryId) {
      const updated = await updateDailyEntry(editingEntryId, {
        title: newEntry.title.trim(),
        content: newEntry.content.trim(),
        mood: newEntry.mood,
        weather: newEntry.weather,
        activities: newEntry.activities,
        prayer_requests: newEntry.prayerRequests,
        thanksgiving: newEntry.thanksgiving,
      });
      if (!updated) {
        alert('수정에 실패했습니다.');
        return;
      }
      const entries = await getDailyEntries(reportId);
      setDailyEntries(entries);
      setEditingEntryId(null);
      setNewEntry({
        day: 1,
        date: '',
        title: '',
        content: '',
        mood: '감사',
        weather: '맑음',
        activities: [],
        prayerRequests: '',
        thanksgiving: '',
        imageFiles: [],
        imagePreviews: [],
        author: '',
        isEdited: false,
      });
    }
  };

  const handleDeleteEntry = async (day: number) => {
    const entry = dailyEntries.find((e) => e.day === day);
    if (!entry) return;
    if (isAuthor() && confirm('정말로 이 일기를 삭제하시겠습니까?')) {
      const ok = await deleteDailyEntry(entry.id);
      if (!ok) {
        alert('삭제에 실패했습니다.');
        return;
      }
      setDailyEntries(dailyEntries.filter(e => e.id !== entry.id));
      if (selectedDay === day) {
        setSelectedDay(null);
      }
    }
  };

  const cancelEdit = () => {
    setEditingEntryId(null);
    setNewEntry({
      day: 1,
      date: '',
      title: '',
      content: '',
      mood: '감사',
      weather: '맑음',
      activities: [],
      prayerRequests: '',
      thanksgiving: '',
      imageFiles: [],
      imagePreviews: [],
      author: '',
      isEdited: false,
    });
  };


  const handleActivityAdd = (activity: string) => {
    if (activity.trim() && !newEntry.activities.includes(activity)) {
      setNewEntry({ ...newEntry, activities: [...newEntry.activities, activity] });
    }
  };

  const handleActivityRemove = (activity: string) => {
    setNewEntry({ ...newEntry, activities: newEntry.activities.filter(a => a !== activity) });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const maxImages = 3;
      const currentCount = newEntry.imagePreviews.length;
      const remainingSlots = maxImages - currentCount;

      if (remainingSlots <= 0) {
        alert('최대 3장의 사진만 업로드할 수 있습니다.');
        return;
      }

      const filesToProcess = Array.from(files)
        .filter((f) => f.type.startsWith('image/'))
        .slice(0, remainingSlots);
      const previews = filesToProcess.map((file) => URL.createObjectURL(file));

      setNewEntry((prev) => ({
        ...prev,
        imageFiles: [...prev.imageFiles, ...filesToProcess],
        imagePreviews: [...prev.imagePreviews, ...previews],
      }));
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const prevUrl = newEntry.imagePreviews[index];
    if (prevUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(prevUrl);
    }
    setNewEntry((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  return (
    <>
      <main className="min-h-screen bg-[#F8F6F2] relative overflow-hidden">
        <Header />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-amber-100/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-10 flex justify-center">
          <p className="text-[64px] sm:text-[84px] tracking-[0.6em] text-stone-300/30 font-semibold">
            MISSION DIARY
          </p>
        </div>

        <section className="py-12 sm:py-16 relative z-10">
          <div className="max-w-[720px] mx-auto px-5 sm:px-6">
            <p className="text-sm uppercase tracking-[0.35em] text-stone-400">Mission Diary</p>
            <div className="mt-3 space-y-1 text-base text-stone-500">
              <p>{missionReport.region} • {missionReport.country}</p>
              <p>{missionReport.start_date} ~ {missionReport.end_date}</p>
              {isMissionEnded(missionReport.end_date) && (
                <span className="inline-block text-xs tracking-wide text-stone-600 bg-stone-100 border border-stone-200 rounded-full px-2.5 py-1 mt-2">
                  종료된 선교
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="pb-20 relative z-10">
          <div className="max-w-[720px] mx-auto px-5 sm:px-6">
            <div className="flex flex-col-reverse gap-16">
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm uppercase tracking-[0.3em] text-stone-400">
                      일기 목록
                    </h3>
                    {isAuthor() ? (
                      <button
                        onClick={handleAddEntry}
                        className="text-sm text-stone-700 bg-white/70 border border-stone-200 rounded-full px-3 py-1.5 hover:bg-white hover:border-stone-300 transition-colors"
                      >
                        새 일기 작성
                      </button>
                    ) : (
                      <div className="text-xs text-stone-400">작성자 전용</div>
                    )}
                  </div>

                  {!isAuthor() && (
                    <p className="text-sm text-stone-400 mb-4">작성자만 일기를 편집할 수 있습니다</p>
                  )}

                  <div className="space-y-3">
                    {dailyEntries.length === 0 && (
                      <div className="text-center text-base text-gray-500 py-6">
                        아직 등록된 일기가 없습니다.
                      </div>
                    )}
                    {dailyEntries.map((entry) => (
                      (() => {
                        const isSelected = selectedDay === entry.day;
                        return (
                      <button
                        key={entry.id}
                        onClick={() => {
                          setSelectedDay(entry.day);
                          setIsAddingNew(false);
                        }}
                        className={`w-full text-left py-5 px-4 rounded-2xl bg-white/85 border border-stone-200/70 shadow-sm transition-all ${
                          isSelected
                            ? 'border-amber-300/60 shadow-md'
                            : 'hover:border-stone-300 hover:shadow-md hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="inline-flex items-center text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                          Day {entry.day} • {entry.date}
                        </div>
                        <div className="text-lg text-stone-800 mt-2">{entry.title}</div>
                      </button>
                        );
                      })()
                    ))}

                    {isAddingNew && isAuthor() && (
                      <div className="py-4 text-base text-stone-500">새 일기 작성 중</div>
                    )}
                  </div>
                  <p className="mt-6 text-sm text-stone-500">
                    This journey has {dailyEntries.length} entries so far.
                  </p>
                </div>
              </div>

              <div>
                {selectedDay ? (
                  (() => {
                    const entry = dailyEntries.find(e => e.day === selectedDay);
                    return entry ? (
                      <div className="max-w-[680px] mx-auto">
                        <div className="mb-6">
                          <div className="flex items-start justify-between gap-6">
                            <div>
                              <span className="inline-flex items-center text-xs uppercase tracking-[0.25em] text-amber-900 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-3">
                                Day {entry.day}
                              </span>
                              <p className="text-base text-stone-500 mb-3">{entry.date}</p>
                              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-stone-900 leading-tight tracking-tight">
                                {entry.title}
                              </h1>
                            </div>
                            {isAuthor() && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditEntry(entry.day)}
                                  className="text-sm text-stone-700 bg-white/70 border border-stone-200 rounded-full px-3 py-1.5 hover:bg-white hover:border-stone-300 transition-colors"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() => handleDeleteEntry(entry.day)}
                                  className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-full px-3 py-1.5 hover:bg-rose-100 hover:border-rose-300 transition-colors"
                                >
                                  삭제
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="h-px bg-stone-200/80 mt-6" />
                        </div>

                        {entry.images && entry.images.length > 0 && (
                          <div className="my-10">
                            <img
                              src={entry.images[0].url}
                              alt={`Day ${entry.day} 사진`}
                              className="w-full rounded-xl shadow-sm shadow-stone-300/50"
                            />
                          </div>
                        )}

                        <div className="space-y-6 text-stone-700 text-lg sm:text-xl leading-8 border-l-2 border-amber-200 pl-6 mb-10">
                          <p className="whitespace-pre-wrap">{entry.content}</p>
                        </div>

                        {entry.activities?.length > 0 && (
                          <div className="text-base text-stone-500 mb-10">
                            {entry.activities.map((activity, i) => (
                              <span key={`${activity}-${i}`} className="mr-2">
                                #{activity}
                              </span>
                            ))}
                          </div>
                        )}

                        {entry.thanksgiving && (
                          <div className="mb-8">
                            <h3 className="text-lg font-medium text-stone-800 mb-2">🙏 오늘의 감사</h3>
                            <p className="text-stone-700 leading-8 whitespace-pre-wrap text-lg">
                              {entry.thanksgiving}
                            </p>
                          </div>
                        )}

                        {entry.prayer_requests && (
                          <div className="mb-2">
                            <h3 className="text-lg font-medium text-stone-800 mb-2">🙏 오늘의 기도</h3>
                            <p className="text-stone-700 leading-8 whitespace-pre-wrap text-lg">
                              {entry.prayer_requests}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()
                ) : (isAddingNew || editingEntryId) && isAuthor() ? (
                  <div className="max-w-[680px] mx-auto">
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="inline-flex items-center text-xs uppercase tracking-[0.25em] text-stone-500 border border-stone-200 rounded-full px-3 py-1">
                          Day {newEntry.day}
                        </span>
                        <h2 className="text-4xl font-serif text-stone-900">
                          {editingEntryId ? '일기 수정' : '일기 작성'}
                        </h2>
                      </div>
                      <div className="h-px bg-stone-200/80" />
                    </div>

                    <form className="space-y-8">
                      <div>
                        <label className="text-base text-stone-600">날짜</label>
                        <input
                          type="date"
                          value={newEntry.date}
                          onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}
                          className="w-full bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-2 text-base"
                        />
                      </div>

                      <div>
                        <label className="text-base text-stone-600">오늘의 제목</label>
                        <input
                          type="text"
                          value={newEntry.title}
                          onChange={e => setNewEntry({ ...newEntry, title: e.target.value })}
                          className="w-full bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-2 text-base"
                          placeholder="오늘 하루를 한 줄로 표현해보세요"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="text-base text-stone-600">오늘의 기분</label>
                          <select
                            value={newEntry.mood}
                            onChange={e => setNewEntry({ ...newEntry, mood: e.target.value })}
                            className="w-full bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-2 text-base"
                          >
                            {moods.map(mood => (
                              <option key={mood} value={mood}>{mood}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-base text-stone-600">날씨</label>
                          <select
                            value={newEntry.weather}
                            onChange={e => setNewEntry({ ...newEntry, weather: e.target.value })}
                            className="w-full bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-2 text-base"
                          >
                            {weathers.map(weather => (
                              <option key={weather} value={weather}>{weather}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-base text-stone-600">오늘의 이야기</label>
                        <textarea
                          value={newEntry.content}
                          onChange={e => setNewEntry({ ...newEntry, content: e.target.value })}
                          rows={6}
                          className="w-full bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-2 min-h-[160px] text-base"
                          placeholder="오늘의 이야기와 마음을 기록해보세요"
                        />
                      </div>

                      <div>
                        <label className="text-base text-stone-600">오늘의 활동</label>
                        <div className="mt-2 flex flex-wrap gap-2 text-base text-stone-500">
                          {newEntry.activities.map((activity, idx) => (
                            <span key={idx} className="mr-2">
                              #{activity}
                              <button
                                type="button"
                                onClick={() => handleActivityRemove(activity)}
                                className="ml-2 text-stone-400 hover:text-stone-600"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="활동을 입력하고 Enter를 누르세요"
                          className="w-full bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-2 mt-2 text-base"
                          onKeyPress={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleActivityAdd(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>

                      <div>
                        <label className="text-base text-stone-600">🙏 오늘의 감사</label>
                        <textarea
                          value={newEntry.thanksgiving}
                          onChange={e => setNewEntry({ ...newEntry, thanksgiving: e.target.value })}
                          rows={3}
                          className="w-full bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-2 text-base"
                        />
                      </div>

                      <div>
                        <label className="text-base text-stone-600">🙏 오늘의 기도</label>
                        <textarea
                          value={newEntry.prayerRequests}
                          onChange={e => setNewEntry({ ...newEntry, prayerRequests: e.target.value })}
                          rows={3}
                          className="w-full bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-2 text-base"
                        />
                      </div>

                      <div>
                        <label className="text-base text-stone-600">오늘의 사진 (최대 3장)</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="block text-base text-stone-500 mt-2"
                          disabled={!!editingEntryId || newEntry.imagePreviews.length >= 3}
                        />

                        {newEntry.imagePreviews.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                            {newEntry.imagePreviews.map((image, index) => (
                              <div key={index} className="relative aspect-video bg-stone-100 rounded-lg overflow-hidden">
                                <img
                                  src={image}
                                  alt={`업로드 사진 ${index + 1}`}
                                  className="w-full h-full object-cover object-top"
                                />
                                {!editingEntryId && (
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 text-xs text-white bg-black/50 rounded-full w-6 h-6 flex items-center justify-center"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4 pt-4">
                        {editingEntryId ? (
                          <>
                            <button
                              type="button"
                              onClick={handleUpdateEntry}
                              disabled={!newEntry.title.trim() || !newEntry.content.trim()}
                              className="text-sm text-stone-700 bg-white/70 border border-stone-200 rounded-full px-4 py-2 hover:bg-white hover:border-stone-300 disabled:text-stone-300"
                            >
                              수정 완료
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="text-sm text-stone-600 bg-white/60 border border-stone-200 rounded-full px-4 py-2 hover:bg-white hover:border-stone-300"
                            >
                              취소
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={handleSaveEntry}
                              disabled={!newEntry.title.trim() || !newEntry.content.trim()}
                              className="text-sm text-stone-700 bg-white/70 border border-stone-200 rounded-full px-4 py-2 hover:bg-white hover:border-stone-300 disabled:text-stone-300"
                            >
                              일기 저장
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingNew(false);
                                setNewEntry({
                                  day: 1,
                                  date: '',
                                  title: '',
                                  content: '',
                                  mood: '감사',
                                  weather: '맑음',
                                  activities: [],
                                  prayerRequests: '',
                                  thanksgiving: '',
                                  imageFiles: [],
                                  imagePreviews: [],
                                  author: '',
                                  isEdited: false,
                                });
                              }}
                              className="text-sm text-stone-600 bg-white/60 border border-stone-200 rounded-full px-4 py-2 hover:bg-white hover:border-stone-300"
                            >
                              취소
                            </button>
                          </>
                        )}
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="text-stone-600">
                    <p className="text-base leading-7">
                      {dailyEntries.length === 0
                        ? '아직 기록된 일기가 없습니다. 오늘의 이야기를 가장 먼저 남겨보세요.'
                        : '아래에서 일기를 선택하거나 새 일기를 작성해보세요.'}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-4 text-sm">
                      {dailyEntries.length > 0 && (
                        <button
                          onClick={() => setSelectedDay(dailyEntries[0]?.day ?? 1)}
                          className="text-sm text-stone-700 bg-white/70 border border-stone-200 rounded-full px-4 py-2 hover:bg-white hover:border-stone-300 transition-colors"
                        >
                          첫 번째 일기 보기
                        </button>
                      )}
                      {isAuthor() && (
                        <button
                          onClick={handleAddEntry}
                          className="text-sm text-stone-700 bg-white/70 border border-stone-200 rounded-full px-4 py-2 hover:bg-white hover:border-stone-300 transition-colors"
                        >
                          새 일기 작성하기
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-16 text-sm text-stone-500">
              <Link href="/missions" className="hover:text-stone-700">
                ← 선교 일기 목록으로
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => {}}
      />
    </>
  );
}
