-- 기도 댓글 허용 여부 (기본: 비허용)
ALTER TABLE public.prayers
ADD COLUMN IF NOT EXISTS allow_comments BOOLEAN NOT NULL DEFAULT false;
