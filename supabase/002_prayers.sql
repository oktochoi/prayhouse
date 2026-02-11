-- 기도 제목 (prayers) 테이블
CREATE TABLE IF NOT EXISTS public.prayers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '기타',
  priority TEXT NOT NULL DEFAULT '일반' CHECK (priority IN ('일반', '긴급', '감사')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'answered')),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  author_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 기도 참여 (기도하기 클릭)
CREATE TABLE IF NOT EXISTS public.prayer_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_id UUID NOT NULL REFERENCES public.prayers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(prayer_id, user_id)
);

-- 기도 댓글 (함께 나눈 기도)
CREATE TABLE IF NOT EXISTS public.prayer_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_id UUID NOT NULL REFERENCES public.prayers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_comments ENABLE ROW LEVEL SECURITY;

-- prayers: 모두 읽기, 로그인 사용자만 작성
DROP POLICY IF EXISTS "Prayers are viewable by everyone" ON public.prayers;
CREATE POLICY "Prayers are viewable by everyone" ON public.prayers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own prayers" ON public.prayers;
CREATE POLICY "Users can insert own prayers" ON public.prayers FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own prayers" ON public.prayers;
CREATE POLICY "Users can update own prayers" ON public.prayers FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own prayers" ON public.prayers;
CREATE POLICY "Users can delete own prayers" ON public.prayers FOR DELETE USING (auth.uid() = user_id);

-- prayer_participations: 읽기 모두, 추가 로그인만
DROP POLICY IF EXISTS "Participations are viewable by everyone" ON public.prayer_participations;
CREATE POLICY "Participations are viewable by everyone" ON public.prayer_participations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can add own participation" ON public.prayer_participations;
CREATE POLICY "Users can add own participation" ON public.prayer_participations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove own participation" ON public.prayer_participations;
CREATE POLICY "Users can remove own participation" ON public.prayer_participations FOR DELETE USING (auth.uid() = user_id);

-- prayer_comments: 읽기 모두, 작성 로그인만
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.prayer_comments;
CREATE POLICY "Comments are viewable by everyone" ON public.prayer_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own comments" ON public.prayer_comments;
CREATE POLICY "Users can insert own comments" ON public.prayer_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- updated_at 트리거
DROP TRIGGER IF EXISTS set_prayers_updated_at ON public.prayers;
CREATE TRIGGER set_prayers_updated_at
  BEFORE UPDATE ON public.prayers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_prayers_created_at ON public.prayers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prayers_status ON public.prayers(status);
CREATE INDEX IF NOT EXISTS idx_prayer_participations_prayer_id ON public.prayer_participations(prayer_id);
CREATE INDEX IF NOT EXISTS idx_prayer_comments_prayer_id ON public.prayer_comments(prayer_id);
