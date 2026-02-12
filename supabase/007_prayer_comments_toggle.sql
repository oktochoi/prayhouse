-- 기도 댓글 허용 여부 (기본: 비허용)
ALTER TABLE public.prayers
ADD COLUMN IF NOT EXISTS allow_comments BOOLEAN NOT NULL DEFAULT false;

-- 프로필: 출생일(yyyy.mm.dd) 및 성별 추가
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS birth_date TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS gender TEXT;
