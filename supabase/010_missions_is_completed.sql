-- 선교 완료 여부 (작성자가 명시적으로 체크)
ALTER TABLE public.missions
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.missions
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
