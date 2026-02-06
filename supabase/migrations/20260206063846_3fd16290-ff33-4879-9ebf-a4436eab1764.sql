
-- Add profile detail columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS farm_name text,
  ADD COLUMN IF NOT EXISTS farm_size text,
  ADD COLUMN IF NOT EXISTS crop_types text;
