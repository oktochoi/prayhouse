'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/components/AuthProvider';

type PrayerData = {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  author: string;
  date: string;
  prayerCount: number;
  status: string;
  allowComments: boolean;
};

type PrayerComment = {
  id: string;
  userId: string;
  author: string;
  date: string;
  content: string;
};

type Props = {
  prayerId: string;
  initialPrayer: PrayerData;
};

export default function PrayerDetailClient({
  prayerId,
  initialPrayer,
}: Props) {
  const { userData } = useAuth();
  const router = useRouter();
  const [prayer, setPrayer] = useState(initialPrayer);
  const [hasPrayed, setHasPrayed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: initialPrayer.title,
    content: initialPrayer.content,
    category: initialPrayer.category,
    priority: initialPrayer.priority,
    status: initialPrayer.status,
    allowComments: initialPrayer.allowComments,
  });
  const [comments, setComments] = useState<PrayerComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const categories = ['건강', '가족', '사역', '진로', '관계', '재정', '학업', '기타'];
  const priorities = ['일반', '긴급', '감사'];
  const isAnswered = prayer.status === 'answered';

  useEffect(() => {
    if (!userData) return;
    const supabase = createClient();
    supabase
      .from('prayer_participations')
      .select('id')
      .eq('prayer_id', prayerId)
      .eq('user_id', userData.id)
      .maybeSingle()
      .then(({ data }) => setHasPrayed(!!data));
  }, [userData, prayerId]);

  useEffect(() => {
    setEditForm({
      title: prayer.title,
      content: prayer.content,
      category: prayer.category,
      priority: prayer.priority,
      status: prayer.status,
      allowComments: prayer.allowComments,
    });
  }, [prayer]);

  useEffect(() => {
    if (!prayer.allowComments) return;
    const supabase = createClient();
    supabase
      .from('prayer_comments')
      .select('id, content, user_id, author_name, created_at')
      .eq('prayer_id', prayerId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const list =
          data?.map((row) => ({
            id: row.id,
            userId: row.user_id,
            author: row.author_name || '익명',
            date: new Date(row.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            content: row.content,
          })) ?? [];
        setComments(list);
      });
  }, [prayerId, prayer.allowComments]);

  const handlePray = async () => {
    if (!userData) {
      alert('로그인이 필요합니다.');
      return;
    }
    const supabase = createClient();
    if (hasPrayed) {
      await supabase
        .from('prayer_participations')
        .delete()
        .eq('prayer_id', prayerId)
        .eq('user_id', userData.id);
      setHasPrayed(false);
      setPrayer((p) => ({ ...p, prayerCount: p.prayerCount - 1 }));
    } else {
      await supabase.from('prayer_participations').insert({
        prayer_id: prayerId,
        user_id: userData.id,
      });
      setHasPrayed(true);
      setPrayer((p) => ({ ...p, prayerCount: p.prayerCount + 1 }));
    }
  };


  const isOwner = userData?.id === prayer.userId;

  const handleMarkAnswered = async () => {
    if (!isOwner || !userData) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('prayers')
      .update({ status: 'answered' })
      .eq('id', prayerId);
    if (error) {
      alert(error.message);
      return;
    }
    setPrayer((prev) => ({ ...prev, status: 'answered' }));
    setEditForm((prev) => ({ ...prev, status: 'answered' }));
  };

  const handleUpdatePrayer = async () => {
    if (!isOwner) return;
    if (!editForm.title.trim() || !editForm.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }
    const supabase = createClient();
    const { error } = await supabase
      .from('prayers')
      .update({
        title: editForm.title.trim(),
        content: editForm.content.trim(),
        category: editForm.category,
        priority: editForm.priority,
        status: editForm.status,
        allow_comments: editForm.allowComments,
      })
      .eq('id', prayerId);

    if (error) {
      alert(error.message);
      return;
    }

    setPrayer((prev) => ({
      ...prev,
      title: editForm.title.trim(),
      content: editForm.content.trim(),
      category: editForm.category,
      priority: editForm.priority,
      status: editForm.status,
      allowComments: editForm.allowComments,
    }));
    setIsEditing(false);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    const supabase = createClient();
    const { error } = await supabase.from('prayer_comments').insert({
      prayer_id: prayerId,
      user_id: userData.id,
      content: commentText.trim(),
      author_name: commentAnonymous ? null : userData.name,
    });
    setSubmittingComment(false);
    if (error) {
      alert(error.message);
      return;
    }
    setCommentText('');
    const { data } = await supabase
      .from('prayer_comments')
      .select('id, content, user_id, author_name, created_at')
      .eq('prayer_id', prayerId)
      .order('created_at', { ascending: false });
    const list =
      data?.map((row) => ({
        id: row.id,
        userId: row.user_id,
        author: row.author_name || '익명',
        date: new Date(row.created_at).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        content: row.content,
      })) ?? [];
    setComments(list);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!userData) return;
    const supabase = createClient();
    await supabase
      .from('prayer_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userData.id);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleDeletePrayer = async () => {
    if (!isOwner) return;
    if (!confirm('정말로 이 기도 제목을 삭제하시겠습니까?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('prayers').delete().eq('id', prayerId);
    if (error) {
      alert(error.message);
      return;
    }
    router.push('/prayers');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <div className="py-7 sm:py-10 lg:py-12">
            <Link
              href="/prayers"
              className="inline-flex items-center gap-2 text-sm font-light text-stone-400 hover:text-stone-600 transition-colors mb-8 sm:mb-12"
            >
              <i className="ri-arrow-left-line"></i>
              <span>기도 제목 목록</span>
            </Link>

            <div className="mb-6 sm:mb-8">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <span className="text-[10px] sm:text-xs font-light tracking-[0.2em] uppercase text-stone-400">
                  {prayer.category}
                </span>
                <span className="text-[10px] sm:text-xs font-light tracking-[0.2em] uppercase text-stone-400">
                  {prayer.priority}
                </span>
                {isAnswered && (
                  <>
                    <span className="text-stone-300">·</span>
                    <span className="text-[10px] sm:text-xs font-medium tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 sm:px-3 py-1 rounded-full">
                      ✅ 응답됨
                    </span>
                  </>
                )}
                {isOwner && (
                  <div className="ml-auto flex items-center gap-2">
                    {!isAnswered && (
                      <button
                        type="button"
                        onClick={handleMarkAnswered}
                        className="px-3 py-1.5 text-xs font-light text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                      >
                        응답됨
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (isEditing) {
                          setEditForm({
                            title: prayer.title,
                            content: prayer.content,
                            category: prayer.category,
                            priority: prayer.priority,
                            status: prayer.status,
                            allowComments: prayer.allowComments,
                          });
                        }
                        setIsEditing((v) => !v);
                      }}
                      className="px-3 py-1.5 text-xs font-light text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                    >
                      {isEditing ? '편집 취소' : '수정'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeletePrayer}
                      className="px-3 py-1.5 text-xs font-light text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4 mb-4 sm:mb-6">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full text-xl sm:text-2xl lg:text-3xl font-light text-stone-900 border-b border-stone-200 focus:outline-none focus:border-stone-400 pb-2"
                  />
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="px-3 py-2 text-sm border border-stone-200 rounded-md"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, priority: e.target.value }))}
                      className="px-3 py-2 text-sm border border-stone-200 rounded-md"
                    >
                      {priorities.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <label className="inline-flex items-center gap-2 text-sm text-stone-600">
                      <input
                        type="checkbox"
                        checked={editForm.allowComments}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, allowComments: e.target.checked }))
                        }
                        className="w-4 h-4 text-stone-700 border-stone-300 rounded"
                      />
                      댓글 허용
                    </label>
                  </div>
                </div>
              ) : (
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-stone-900 mb-4 sm:mb-6 leading-tight">
                  {prayer.title}
                </h1>
              )}

              <div className="flex items-center gap-3 sm:gap-4 text-sm font-light text-stone-400">
                <span>{prayer.author}</span>
                <span>·</span>
                <span>{prayer.date}</span>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent my-8 sm:my-12" />

            {isAnswered && (
              <div className="mb-8 sm:mb-10 p-4 sm:p-6 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <p className="text-base sm:text-lg font-medium text-emerald-800">응답된 기도입니다</p>
              </div>
            )}

            <div
              className={`prose prose-base sm:prose-lg max-w-none mb-12 sm:mb-16 rounded-xl p-6 sm:p-8 ${
                isAnswered ? 'bg-emerald-50/50 border border-emerald-100' : ''
              }`}
            >
              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, content: e.target.value }))}
                    className="w-full min-h-[200px] text-base sm:text-lg font-light text-stone-600 leading-relaxed border border-stone-200 rounded-md p-3 focus:outline-none focus:border-stone-400"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleUpdatePrayer}
                      className="px-6 py-2.5 text-sm font-light text-white bg-stone-800 hover:bg-stone-700 transition-colors"
                    >
                      수정 저장
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-base sm:text-lg font-light text-stone-600 leading-relaxed whitespace-pre-line">
                  {prayer.content}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6 sm:py-8 border-y border-stone-100">
              <button
                onClick={handlePray}
                className={`px-6 py-2.5 text-sm font-light transition-colors whitespace-nowrap cursor-pointer ${
                  hasPrayed
                    ? 'text-stone-400 bg-stone-50'
                    : 'text-stone-900 bg-stone-100 hover:bg-stone-200'
                }`}
              >
                {hasPrayed ? '기도했습니다' : '기도하기'}
              </button>
            </div>
          </div>

          {prayer.allowComments && (
            <div className="py-14 sm:py-20 lg:py-24">
              <p className="text-[10px] sm:text-xs font-light tracking-[0.2em] uppercase text-stone-400 mb-3 sm:mb-4">
                Prayer Comments
              </p>
              <h2 className="text-2xl sm:text-3xl font-light text-stone-900 mb-8 sm:mb-12">
                함께 나눈 기도
              </h2>

              <div className="space-y-8 sm:space-y-12">
                {comments.map((comment) => (
                  <div key={comment.id} className="pb-8 sm:pb-12 border-b border-stone-100">
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <span className="text-sm sm:text-base font-light text-stone-900">
                        {comment.author}
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="text-xs sm:text-sm font-light text-stone-400">
                        {comment.date}
                      </span>
                      {userData?.id === comment.userId && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="ml-auto text-xs sm:text-sm font-light text-rose-600 hover:text-rose-700"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                    <p className="text-sm sm:text-base font-light text-stone-600 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>

              {userData && (
                <form
                  onSubmit={handleSubmitComment}
                  className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-stone-200"
                >
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="기도의 마음을 나눠주세요..."
                    className="w-full h-28 sm:h-32 px-0 py-3 sm:py-4 text-sm sm:text-base font-light text-stone-900 placeholder-stone-300 bg-transparent border-0 border-b border-stone-200 focus:border-stone-400 focus:outline-none resize-none transition-colors"
                  />
                  <div className="flex items-center justify-between mt-4 sm:mt-6">
                    <label className="inline-flex items-center gap-2 text-sm text-stone-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={commentAnonymous}
                        onChange={(e) => setCommentAnonymous(e.target.checked)}
                        className="w-4 h-4 text-stone-600 border-stone-300 rounded"
                      />
                      익명으로 작성
                    </label>
                    <div>
                    <button
                      type="submit"
                      disabled={!commentText.trim() || submittingComment}
                      className="px-5 sm:px-6 py-2 sm:py-2.5 text-sm font-light text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      {submittingComment ? '등록 중...' : '기도 남기기'}
                    </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
