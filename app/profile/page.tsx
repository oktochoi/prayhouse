'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthProvider';
import { getMyDatesWithEntries } from '@/lib/gratitude';
import { createClient } from '@/utils/supabase/client';
import ProfileSetupForm from '@/components/ProfileSetupForm';

type Profile = {
  name: string;
  birth_date: string | null;
  gender: string | null;
  church: string | null;
  profile_completed: boolean;
  is_public: boolean;
};

type MyPrayer = {
  id: string;
  title: string;
  date: string;
  status: string;
  prayerCount: number;
};

function formatDateKr(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function getLocalDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const { userData, signOut, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'prayers' | 'gratitude' | 'posts'>('prayers');
  const [myPrayers, setMyPrayers] = useState<MyPrayer[]>([]);
  const [prayerLoading, setPrayerLoading] = useState(true);
  const [gratitudeStreak, setGratitudeStreak] = useState(0);

  useEffect(() => {
    const userId = userData?.id;
    if (!userId) return;
    async function fetchProfile() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('name, birth_date, gender, church, profile_completed, is_public')
        .eq('id', userId)
        .single();

      if (!data || error) {
        const fallbackProfile = {
          id: userId,
          name: userData?.name ?? '사용자',
          birth_date: null,
          gender: null,
          church: null,
          profile_completed: true,
          is_public: true,
        };
        await supabase.from('profiles').upsert(fallbackProfile, { onConflict: 'id' });
        setProfile({
          name: fallbackProfile.name,
          birth_date: fallbackProfile.birth_date,
          gender: fallbackProfile.gender,
          church: fallbackProfile.church,
          profile_completed: true,
          is_public: true,
        });
        return;
      }

      const resolvedIsPublic = data.is_public ?? true;
      if (!data.profile_completed) {
        await supabase
          .from('profiles')
          .update({ profile_completed: true, is_public: resolvedIsPublic })
          .eq('id', userId);
      }

      setProfile({
        name: data.name ?? '사용자',
        birth_date: data.birth_date ?? null,
        gender: data.gender ?? null,
        church: data.church ?? null,
        profile_completed: true,
        is_public: resolvedIsPublic,
      });
    }
    fetchProfile();
  }, [userData?.id, userData?.name]);

  useEffect(() => {
    const userId = userData?.id;
    if (!userId) return;
    const safeUserId: string = userId;
    async function fetchGratitudeDates() {
      const dates = await getMyDatesWithEntries(safeUserId);
      if (!dates.length) {
        setGratitudeStreak(0);
        return;
      }
      const dateSet = new Set(dates);
      let count = 0;
      const cursor = new Date(getLocalDateKey(new Date()) + 'T12:00:00');
      while (dateSet.has(getLocalDateKey(cursor))) {
        count += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
      setGratitudeStreak(count);
    }
    async function fetchMyPrayers() {
      const supabase = createClient();
      const { data } = await supabase
        .from('prayers')
        .select('id, title, created_at, status')
        .eq('user_id', safeUserId)
        .order('created_at', { ascending: false });

      if (!data?.length) {
        setMyPrayers([]);
        setPrayerLoading(false);
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

      setMyPrayers(
        data.map((p) => ({
          id: p.id,
          title: p.title,
          date: formatDateKr(p.created_at),
          status: p.status,
          prayerCount: countMap[p.id] || 0,
        }))
      );
      setPrayerLoading(false);
    }
    fetchGratitudeDates();
    fetchMyPrayers();
  }, [userData?.id]);

  useEffect(() => {
    if (!authLoading && !userData) {
      router.replace('/');
    }
  }, [authLoading, userData, router]);

  const handleProfileSubmit = async (data: {
    name: string;
    birth_date: string | null;
    gender: string | null;
    church: string;
  }) => {
    if (!userData?.id) return;
    const supabase = createClient();
    const { data: updated, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userData.id,
          name: data.name,
          birth_date: data.birth_date,
          gender: data.gender,
          church: data.church || null,
          profile_completed: true,
          is_public: profile?.is_public ?? true,
        },
        { onConflict: 'id' }
      )
      .select('name, birth_date, gender, church, profile_completed, is_public')
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setProfile({
      name: updated?.name ?? data.name,
      birth_date: updated?.birth_date ?? data.birth_date,
      gender: updated?.gender ?? data.gender,
      church: updated?.church ?? (data.church || null),
      profile_completed: true,
      is_public: updated?.is_public ?? (profile?.is_public ?? true),
    });
    setShowEditForm(false);
  };

  const handleTogglePublic = async () => {
    if (!userData?.id || !profile) return;
    const supabase = createClient();
    const nextValue = !profile.is_public;
    const { error } = await supabase
      .from('profiles')
      .update({ is_public: nextValue })
      .eq('id', userData.id);
    if (error) {
      alert(error.message);
      return;
    }
    setProfile({ ...profile, is_public: nextValue });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== '탈퇴') return;
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/auth/delete-account', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '삭제 실패');
      await signOut();
      router.replace('/');
    } catch (e) {
      alert(e instanceof Error ? e.message : '계정 삭제에 실패했습니다');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setDeleteConfirm('');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <p className="text-stone-400 text-sm">불러오는 중...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const prayerCount = myPrayers.length;
  const missionCount = gratitudeStreak;
  const postCount = 0;
  const isProfilePublic = profile?.is_public ?? true;

  // 온보딩: 프로필 미완성 시 설정 폼 표시 (profile이 없거나 profile_completed가 false)
  const needsOnboarding = false;
  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-24 max-w-3xl mx-auto px-6 pb-32">
          <ProfileSetupForm
            initialData={{
              name: profile?.name ?? userData.name,
              birth_date: profile?.birth_date ?? null,
              gender: profile?.gender ?? null,
              church: profile?.church ?? '',
            }}
            onSubmit={handleProfileSubmit}
            isOnboarding
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="py-24">
            <p className="text-xs font-light tracking-[0.2em] uppercase text-stone-400 mb-4">
              My Profile
            </p>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-5xl font-light text-stone-900 mb-6">
                  {profile?.name ?? userData.name}
                </h1>
                <p className="text-lg font-light text-stone-500 leading-relaxed mb-1">
                  {userData.email || '이메일 없음'}
                </p>
                {profile?.church && (
                  <p className="text-base font-light text-stone-400">출석 교회: {profile.church}</p>
                )}
                {profile?.birth_date && (
                  <p className="text-base font-light text-stone-400">
                    출생일: {profile.birth_date}
                  </p>
                )}
                {profile?.gender && (
                  <p className="text-base font-light text-stone-400">
                    성별: {profile.gender}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">

                <button
                  onClick={() => setShowEditForm(true)}
                  className="text-sm font-medium text-stone-500 hover:text-stone-700 border border-stone-200 hover:border-stone-300 px-4 py-2 rounded-lg transition-colors"
                >
                  프로필 수정
                </button>
              </div>
            </div>
          </div>

          {showEditForm && profile && (
            <div className="mb-16 p-6 bg-stone-50 rounded-2xl border border-stone-100">
              <h3 className="text-lg font-medium text-stone-800 mb-4">프로필 수정</h3>
              <ProfileSetupForm
                initialData={{
                  name: profile.name,
                  birth_date: profile.birth_date,
                  gender: profile.gender,
                  church: profile.church ?? '',
                }}
                onSubmit={handleProfileSubmit}
                isOnboarding={false}
              />
              <button
                onClick={() => setShowEditForm(false)}
                className="mt-4 text-sm text-stone-500 hover:text-stone-700"
              >
                취소
              </button>
            </div>
          )}

          <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent mb-16"></div>

          <div className="grid grid-cols-3 gap-12 py-12 mb-16">
            <div className="text-center">
              <div className="text-4xl font-light text-stone-900 mb-2">{prayerCount}</div>
              <div className="text-sm font-light text-stone-400">기도 제목</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light text-stone-900 mb-2">{missionCount}</div>
              <div className="text-sm font-light text-stone-400">감사 일기 연속</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light text-stone-900 mb-2">{postCount}</div>
              <div className="text-sm font-light text-stone-400">게시글</div>
            </div>
          </div>

          <div className="h-px bg-stone-100 mb-16"></div>

          {!isProfilePublic && (
            <div className="mb-16 p-6 bg-stone-50 rounded-2xl border border-stone-100">
              <p className="text-sm text-stone-500">
                프로필이 비공개로 설정되어 있어 기도 제목과 작성 글이 표시되지 않습니다.
              </p>
            </div>
          )}

          {isProfilePublic && (
            <>
              <div className="flex gap-8 mb-16">
                <button
                  onClick={() => setActiveTab('prayers')}
                  className={`text-sm font-light tracking-wide transition-colors cursor-pointer ${
                    activeTab === 'prayers'
                      ? 'text-stone-900 border-b border-stone-900'
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  나의 기도
                </button>
                <button
                  onClick={() => setActiveTab('gratitude')}
                  className={`text-sm font-light tracking-wide transition-colors cursor-pointer ${
                    activeTab === 'gratitude'
                      ? 'text-stone-900 border-b border-stone-900'
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  감사 일기
                </button>
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`text-sm font-light tracking-wide transition-colors cursor-pointer ${
                    activeTab === 'posts'
                      ? 'text-stone-900 border-b border-stone-900'
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  작성한 글
                </button>
              </div>
            </>
          )}

          {isProfilePublic && activeTab === 'prayers' && (
            <div className="space-y-12 pb-16">
              {prayerLoading ? (
                <div className="py-12 text-center text-stone-500 text-sm">불러오는 중...</div>
              ) : myPrayers.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-base font-light text-stone-400 mb-4">
                    등록한 기도 제목이 없습니다
                  </p>
                  <Link
                    href="/prayers/new"
                    className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                  >
                    첫 번째 기도 제목 올리기 →
                  </Link>
                </div>
              ) : (
                myPrayers.map((prayer) => (
                  <Link
                    key={prayer.id}
                    href={`/prayers/${prayer.id}`}
                    className="block pb-12 border-b border-stone-100 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-2xl font-light text-stone-900 group-hover:text-amber-700">
                        {prayer.title}
                      </h3>
                      {prayer.status === 'answered' && (
                        <span className="ml-4 text-xs font-light tracking-wide text-stone-400 bg-stone-50 px-3 py-1 whitespace-nowrap">
                          응답됨
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm font-light text-stone-400">
                      <span>{prayer.date}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {isProfilePublic && activeTab === 'gratitude' && (
            <div className="space-y-12 pb-16">
              <div className="py-16 text-center">
                <p className="text-base font-light text-stone-700">
                  감사 일기 연속 {gratitudeStreak}일
                </p>
                <Link
                  href="/gratitude"
                  className="text-amber-600 hover:text-amber-700 font-medium text-sm mt-4 inline-block"
                >
                  감사 일기 보러가기 →
                </Link>
              </div>
            </div>
          )}

          {isProfilePublic && activeTab === 'posts' && (
            <div className="space-y-12 pb-16">
              <div className="py-16 text-center">
                <p className="text-base font-light text-stone-400">작성한 게시글이 없습니다</p>
              </div>
            </div>
          )}

          {/* 계정 설정 / 회원 탈퇴 */}
          <div className="pt-16 pb-32 border-t border-stone-100">
            <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-6">
              계정 설정
            </h3>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-sm text-stone-400 hover:text-red-600 transition-colors"
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      </main>

      {/* 회원 탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-medium text-stone-900 mb-2">회원 탈퇴</h3>
            <p className="text-stone-600 text-sm mb-4 leading-relaxed">
              탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다. 정말 탈퇴하시겠습니까?
            </p>
            <p className="text-stone-500 text-xs mb-2">
              탈퇴를 진행하려면 아래에 <strong>탈퇴</strong>를 입력하세요.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="탈퇴"
              className="w-full px-4 py-2 border border-stone-200 rounded-lg mb-6 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm('');
                }}
                className="flex-1 py-2.5 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== '탈퇴' || deleteLoading}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleteLoading ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
