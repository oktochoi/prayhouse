-- 선교 일기 (missions) 테이블
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  type TEXT NOT NULL DEFAULT '단기선교',
  region TEXT NOT NULL DEFAULT '아시아',
  country TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT '전도',
  priority TEXT NOT NULL DEFAULT '일반' CHECK (priority IN ('일반', '긴급', '특별')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT NOT NULL,
  missionary_name TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  needs_support BOOLEAN NOT NULL DEFAULT false,
  support_goal INTEGER DEFAULT 0,
  support_description TEXT,
  current_support INTEGER NOT NULL DEFAULT 0,
  supporters INTEGER NOT NULL DEFAULT 0,
  account_bank TEXT,
  account_number TEXT,
  account_holder TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 선교 이미지 (글당 최대 3장)
CREATE TABLE IF NOT EXISTS public.mission_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 선교 일일 기록 (mission_daily_entries)
CREATE TABLE IF NOT EXISTS public.mission_daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT DEFAULT '감사',
  weather TEXT DEFAULT '맑음',
  activities TEXT[] DEFAULT '{}',
  prayer_requests TEXT,
  thanksgiving TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mission_id, day)
);

-- 일일 기록 이미지 (글당 최대 3장)
CREATE TABLE IF NOT EXISTS public.mission_daily_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_entry_id UUID NOT NULL REFERENCES public.mission_daily_entries(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_daily_images ENABLE ROW LEVEL SECURITY;

-- missions: 모두 읽기, 로그인 사용자만 작성
DROP POLICY IF EXISTS "Missions are viewable by everyone" ON public.missions;
CREATE POLICY "Missions are viewable by everyone" ON public.missions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own missions" ON public.missions;
CREATE POLICY "Users can insert own missions" ON public.missions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own missions" ON public.missions;
CREATE POLICY "Users can update own missions" ON public.missions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own missions" ON public.missions;
CREATE POLICY "Users can delete own missions" ON public.missions FOR DELETE USING (auth.uid() = user_id);

-- mission_images
DROP POLICY IF EXISTS "Mission images are viewable by everyone" ON public.mission_images;
CREATE POLICY "Mission images are viewable by everyone" ON public.mission_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert mission images" ON public.mission_images;
CREATE POLICY "Users can insert mission images" ON public.mission_images FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.missions m WHERE m.id = mission_id AND m.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update mission images" ON public.mission_images;
CREATE POLICY "Users can update mission images" ON public.mission_images FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.missions m WHERE m.id = mission_id AND m.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete mission images" ON public.mission_images;
CREATE POLICY "Users can delete mission images" ON public.mission_images FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.missions m WHERE m.id = mission_id AND m.user_id = auth.uid()));

-- mission_daily_entries
DROP POLICY IF EXISTS "Daily entries are viewable by everyone" ON public.mission_daily_entries;
CREATE POLICY "Daily entries are viewable by everyone" ON public.mission_daily_entries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert daily entries" ON public.mission_daily_entries;
CREATE POLICY "Users can insert daily entries" ON public.mission_daily_entries FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.missions m WHERE m.id = mission_id AND m.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update daily entries" ON public.mission_daily_entries;
CREATE POLICY "Users can update daily entries" ON public.mission_daily_entries FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.missions m WHERE m.id = mission_id AND m.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete daily entries" ON public.mission_daily_entries;
CREATE POLICY "Users can delete daily entries" ON public.mission_daily_entries FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.missions m WHERE m.id = mission_id AND m.user_id = auth.uid()));

-- mission_daily_images
DROP POLICY IF EXISTS "Daily images are viewable by everyone" ON public.mission_daily_images;
CREATE POLICY "Daily images are viewable by everyone" ON public.mission_daily_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert daily images" ON public.mission_daily_images;
CREATE POLICY "Users can insert daily images" ON public.mission_daily_images FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.mission_daily_entries e
    JOIN public.missions m ON m.id = e.mission_id
    WHERE e.id = daily_entry_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update daily images" ON public.mission_daily_images;
CREATE POLICY "Users can update daily images" ON public.mission_daily_images FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.mission_daily_entries e
    JOIN public.missions m ON m.id = e.mission_id
    WHERE e.id = daily_entry_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete daily images" ON public.mission_daily_images;
CREATE POLICY "Users can delete daily images" ON public.mission_daily_images FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.mission_daily_entries e
    JOIN public.missions m ON m.id = e.mission_id
    WHERE e.id = daily_entry_id AND m.user_id = auth.uid()
  ));

-- updated_at 트리거
DROP TRIGGER IF EXISTS set_missions_updated_at ON public.missions;
CREATE TRIGGER set_missions_updated_at
  BEFORE UPDATE ON public.missions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_mission_daily_entries_updated_at ON public.mission_daily_entries;
CREATE TRIGGER set_mission_daily_entries_updated_at
  BEFORE UPDATE ON public.mission_daily_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_missions_created_at ON public.missions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mission_images_mission_id ON public.mission_images(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_daily_entries_mission_id ON public.mission_daily_entries(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_daily_images_entry_id ON public.mission_daily_images(daily_entry_id);
