import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import PrayerDetailClient from './PrayerDetailClient';

export const dynamic = 'force-dynamic';

export default async function PrayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: prayer, error } = await supabase
    .from('prayers')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !prayer) {
    notFound();
  }

  const { count } = await supabase
    .from('prayer_participations')
    .select('*', { count: 'exact', head: true })
    .eq('prayer_id', id);


  const prayerData = {
    id: prayer.id,
    userId: prayer.user_id,
    title: prayer.title,
    content: prayer.content,
    category: prayer.category,
    priority: prayer.priority,
    author: prayer.is_anonymous ? '익명' : (prayer.author_name || '익명'),
    date: new Date(prayer.created_at).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    prayerCount: count || 0,
    status: prayer.status,
    allowComments: prayer.allow_comments ?? false,
  };

  return (
    <PrayerDetailClient
      prayerId={id}
      initialPrayer={prayerData}
    />
  );
}
