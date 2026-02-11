-- 감사일기 (gratitude_entries) 테이블
CREATE TABLE IF NOT EXISTS public.gratitude_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  text TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  linked_prayer_id UUID REFERENCES public.prayers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 공감 (empathy) - 남의 감사일기에만 사용, 좋아요 대신 가벼운 공감
CREATE TABLE IF NOT EXISTS public.gratitude_empathies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES public.gratitude_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entry_id, user_id)
);

-- RLS
ALTER TABLE public.gratitude_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gratitude_empathies ENABLE ROW LEVEL SECURITY;

-- gratitude_entries: 본인만 읽기/쓰기, 공개 글은 모두 읽기
DROP POLICY IF EXISTS "Users can view own gratitude" ON public.gratitude_entries;
CREATE POLICY "Users can view own gratitude" ON public.gratitude_entries
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view public gratitude" ON public.gratitude_entries;
CREATE POLICY "Anyone can view public gratitude" ON public.gratitude_entries
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can insert own gratitude" ON public.gratitude_entries;
CREATE POLICY "Users can insert own gratitude" ON public.gratitude_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own gratitude" ON public.gratitude_entries;
CREATE POLICY "Users can update own gratitude" ON public.gratitude_entries
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own gratitude" ON public.gratitude_entries;
CREATE POLICY "Users can delete own gratitude" ON public.gratitude_entries
  FOR DELETE USING (auth.uid() = user_id);

-- gratitude_empathies: 로그인 사용자만 추가/삭제, 읽기는 모두
DROP POLICY IF EXISTS "Empathies are viewable by everyone" ON public.gratitude_empathies;
CREATE POLICY "Empathies are viewable by everyone" ON public.gratitude_empathies
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can add own empathy" ON public.gratitude_empathies;
CREATE POLICY "Users can add own empathy" ON public.gratitude_empathies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove own empathy" ON public.gratitude_empathies;
CREATE POLICY "Users can remove own empathy" ON public.gratitude_empathies
  FOR DELETE USING (auth.uid() = user_id);

-- updated_at 트리거
DROP TRIGGER IF EXISTS set_gratitude_entries_updated_at ON public.gratitude_entries;
CREATE TRIGGER set_gratitude_entries_updated_at
  BEFORE UPDATE ON public.gratitude_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_gratitude_entries_user_date ON public.gratitude_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_gratitude_entries_public_date ON public.gratitude_entries(is_public, date DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_gratitude_empathies_entry ON public.gratitude_empathies(entry_id);
