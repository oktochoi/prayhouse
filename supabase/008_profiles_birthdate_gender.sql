-- 프로필: 출생일(yyyy.mm.dd) 및 성별 추가
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS birth_date TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS gender TEXT;
