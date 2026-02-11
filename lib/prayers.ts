export type Prayer = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  status: 'active' | 'answered';
  is_anonymous: boolean;
  author_name: string | null;
  created_at: string;
  updated_at: string;
};

export type PrayerWithMeta = Prayer & {
  author: string;
  prayer_count: number;
  excerpt?: string;
};

export type PrayerComment = {
  id: string;
  prayer_id: string;
  user_id: string;
  content: string;
  author_name: string | null;
  created_at: string;
};

export const CATEGORIES = ['건강', '가족', '학업', '직장', '교회', '사역', '진로', '관계', '재정', '기타'];
export const PRIORITIES = ['일반', '긴급', '감사'];
