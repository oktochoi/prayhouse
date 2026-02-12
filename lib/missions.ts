'use client';

import { createClient } from '@/utils/supabase/client';

export const MISSION_IMAGES_BUCKET = 'mission-images';
export const MAX_IMAGES_PER_POST = 1;

export type Mission = {
  id: string;
  user_id: string;
  title: string;
  subtitle: string | null;
  type: string;
  region: string;
  country: string;
  theme: string;
  priority: string;
  start_date: string;
  end_date: string;
  description: string;
  missionary_name: string;
  is_anonymous: boolean;
  needs_support: boolean;
  support_goal: number;
  support_description: string | null;
  current_support: number;
  supporters: number;
  account_bank: string | null;
  account_number: string | null;
  account_holder: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  images?: { url: string }[];
  days?: number;
};

export type MissionDailyEntry = {
  id: string;
  mission_id: string;
  day: number;
  date: string;
  title: string;
  content: string;
  mood: string;
  weather: string;
  activities: string[];
  prayer_requests: string | null;
  thanksgiving: string | null;
  created_at: string;
  updated_at?: string;
  images?: { url: string }[];
};

/** 선교 목록 조회 */
export async function getMissions(): Promise<Mission[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('missions')
    .select('*')
    .order('created_at', { ascending: false });

  if (!data?.length) return [];

  const missionIds = data.map((m) => m.id);
  const { data: images } = await supabase
    .from('mission_images')
    .select('mission_id, storage_path')
    .in('mission_id', missionIds)
    .order('sort_order');

  const { data: dailyCounts } = await supabase
    .from('mission_daily_entries')
    .select('mission_id')
    .in('mission_id', missionIds);

  const countMap: Record<string, number> = {};
  dailyCounts?.forEach((row) => {
    countMap[row.mission_id] = (countMap[row.mission_id] || 0) + 1;
  });

  const imgMap: Record<string, string[]> = {};
  images?.forEach((row) => {
    if (!imgMap[row.mission_id]) imgMap[row.mission_id] = [];
    const url = supabase.storage.from(MISSION_IMAGES_BUCKET).getPublicUrl(row.storage_path).data.publicUrl;
    imgMap[row.mission_id].push(url);
  });

  return data.map((m) => ({
    ...m,
    images: (imgMap[m.id] || []).map((url) => ({ url })),
    days: countMap[m.id] || 0,
  }));
}

/** 선교 상세 조회 */
export async function getMissionById(id: string): Promise<Mission | null> {
  const supabase = createClient();
  const { data } = await supabase.from('missions').select('*').eq('id', id).single();
  if (!data) return null;

  const { data: images } = await supabase
    .from('mission_images')
    .select('storage_path')
    .eq('mission_id', id)
    .order('sort_order');

  const urls = (images || []).map((row) =>
    supabase.storage.from(MISSION_IMAGES_BUCKET).getPublicUrl(row.storage_path).data.publicUrl
  );

  const { count } = await supabase
    .from('mission_daily_entries')
    .select('*', { count: 'exact', head: true })
    .eq('mission_id', id);

  return {
    ...data,
    images: urls.map((url) => ({ url })),
    days: count ?? 0,
  };
}

/** 특정 일일 기록 조회 (mission_id + day) */
export async function getDailyEntryByDay(
  missionId: string,
  day: number
): Promise<MissionDailyEntry | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('mission_daily_entries')
    .select('*')
    .eq('mission_id', missionId)
    .eq('day', day)
    .single();

  if (!data) return null;

  const { data: images } = await supabase
    .from('mission_daily_images')
    .select('storage_path')
    .eq('daily_entry_id', data.id)
    .order('sort_order');

  const urls = (images || []).map((row) =>
    supabase.storage.from(MISSION_IMAGES_BUCKET).getPublicUrl(row.storage_path).data.publicUrl
  );

  return {
    ...data,
    activities: data.activities || [],
    images: urls.map((url) => ({ url })),
  };
}

/** 일일 기록 목록 */
export async function getDailyEntries(missionId: string): Promise<MissionDailyEntry[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('mission_daily_entries')
    .select('*')
    .eq('mission_id', missionId)
    .order('day');

  if (!data?.length) return [];

  const entryIds = data.map((e) => e.id);
  const { data: images } = await supabase
    .from('mission_daily_images')
    .select('daily_entry_id, storage_path')
    .in('daily_entry_id', entryIds)
    .order('sort_order');

  const imgMap: Record<string, string[]> = {};
  images?.forEach((row) => {
    if (!imgMap[row.daily_entry_id]) imgMap[row.daily_entry_id] = [];
    const url = supabase.storage.from(MISSION_IMAGES_BUCKET).getPublicUrl(row.storage_path).data.publicUrl;
    imgMap[row.daily_entry_id].push(url);
  });

  return data.map((e) => ({
    ...e,
    activities: e.activities || [],
    images: (imgMap[e.id] || []).map((url) => ({ url })),
  }));
}

/** 일일 기록 추가 */
export async function createDailyEntry(
  missionId: string,
  data: {
    day: number;
    date: string;
    title: string;
    content: string;
    mood?: string;
    weather?: string;
    activities?: string[];
    prayer_requests?: string;
    thanksgiving?: string;
    imagePaths?: string[];
  }
): Promise<MissionDailyEntry | null> {
  const supabase = createClient();
  const { data: entry, error } = await supabase
    .from('mission_daily_entries')
    .insert({
      mission_id: missionId,
      day: data.day,
      date: data.date,
      title: data.title,
      content: data.content,
      mood: data.mood ?? '감사',
      weather: data.weather ?? '맑음',
      activities: data.activities ?? [],
      prayer_requests: data.prayer_requests ?? null,
      thanksgiving: data.thanksgiving ?? null,
    })
    .select()
    .single();

  if (error || !entry) return null;

  if (data.imagePaths?.length) {
    for (let i = 0; i < data.imagePaths.length; i++) {
      await supabase.from('mission_daily_images').insert({
        daily_entry_id: entry.id,
        storage_path: data.imagePaths[i],
        sort_order: i,
      });
    }
  }

  return { ...entry, activities: entry.activities || [], images: [] };
}

/** 일일 기록 수정 */
export async function updateDailyEntry(
  entryId: string,
  data: Partial<{
    title: string;
    content: string;
    mood: string;
    weather: string;
    activities: string[];
    prayer_requests: string;
    thanksgiving: string;
  }>
): Promise<MissionDailyEntry | null> {
  const supabase = createClient();
  const { data: entry } = await supabase
    .from('mission_daily_entries')
    .update(data)
    .eq('id', entryId)
    .select()
    .single();
  return entry;
}

/** 일일 기록 삭제 */
export async function deleteDailyEntry(entryId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('mission_daily_entries').delete().eq('id', entryId);
  return !error;
}
