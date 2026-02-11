'use client';

import { createClient } from '@/utils/supabase/client';

export const CHAR_LIMIT = 200;

export type GratitudeEntry = {
  id: string;
  user_id: string;
  date: string;
  text: string;
  is_public: boolean;
  linked_prayer_id: string | null;
  created_at: string;
  empathy_count?: number;
  user_empathized?: boolean;
};

export function getCharLimit(): number {
  return CHAR_LIMIT;
}

/** 내 감사일기 목록 (날짜별) */
export async function getMyEntries(userId: string): Promise<GratitudeEntry[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('gratitude_entries')
    .select('id, user_id, date, text, is_public, linked_prayer_id, created_at')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  return data ?? [];
}

/** 특정 날짜 내 감사일기 */
export async function getMyEntryByDate(userId: string, date: string): Promise<GratitudeEntry | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('gratitude_entries')
    .select('id, user_id, date, text, is_public, linked_prayer_id, created_at')
    .eq('user_id', userId)
    .eq('date', date)
    .single();
  return data;
}

/** 감사일기 저장 (upsert: user_id + date unique) */
export async function saveGratitudeEntry(
  userId: string,
  date: string,
  text: string,
  isPublic: boolean,
  linkedPrayerId?: string | null
): Promise<GratitudeEntry | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('gratitude_entries')
    .upsert(
      {
        user_id: userId,
        date,
        text: text.slice(0, CHAR_LIMIT),
        is_public: isPublic,
        linked_prayer_id: linkedPrayerId || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single();
  if (error) return null;
  return data;
}

/** 감사일기 수정 */
export async function updateGratitudeEntry(
  id: string,
  updates: { text?: string; is_public?: boolean; linked_prayer_id?: string | null }
): Promise<GratitudeEntry | null> {
  const supabase = createClient();
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.text !== undefined) payload.text = String(updates.text).slice(0, CHAR_LIMIT);
  if (updates.is_public !== undefined) payload.is_public = updates.is_public;
  if (updates.linked_prayer_id !== undefined) payload.linked_prayer_id = updates.linked_prayer_id;

  const { data } = await supabase
    .from('gratitude_entries')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  return data;
}

/** 공개된 감사일기 목록 (남의 감사 보기용, 익명) */
export async function getPublicEntries(userId?: string): Promise<
  (GratitudeEntry & { empathy_count: number; user_empathized: boolean })[]
> {
  const supabase = createClient();
  const { data: entries } = await supabase
    .from('gratitude_entries')
    .select('id, date, text, created_at')
    .eq('is_public', true)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (!entries?.length) return [];

  const ids = entries.map((e) => e.id);
  const { data: empathies } = await supabase
    .from('gratitude_empathies')
    .select('entry_id, user_id')
    .in('entry_id', ids);

  const countMap: Record<string, number> = {};
  const userEmpathizedSet = new Set<string>();
  empathies?.forEach((row) => {
    countMap[row.entry_id] = (countMap[row.entry_id] || 0) + 1;
    if (userId && row.user_id === userId) userEmpathizedSet.add(row.entry_id);
  });

  return entries.map((e) => ({
    ...e,
    user_id: '',
    is_public: true,
    linked_prayer_id: null,
    empathy_count: countMap[e.id] || 0,
    user_empathized: userId ? userEmpathizedSet.has(e.id) : false,
  }));
}

/** 공감 토글 */
export async function toggleEmpathy(entryId: string, userId: string): Promise<boolean> {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from('gratitude_empathies')
    .select('id')
    .eq('entry_id', entryId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    await supabase
      .from('gratitude_empathies')
      .delete()
      .eq('entry_id', entryId)
      .eq('user_id', userId);
    return false;
  } else {
    await supabase.from('gratitude_empathies').insert({ entry_id: entryId, user_id: userId });
    return true;
  }
}

/** 내가 작성한 감사일기 날짜 목록 (캘린더용) */
export async function getMyDatesWithEntries(userId: string): Promise<string[]> {
  const entries = await getMyEntries(userId);
  return entries.map((e) => e.date);
}
