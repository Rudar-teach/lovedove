-- Love Dove — Birthday Sites Migration
-- Run in Supabase Dashboard > SQL Editor AFTER the main schema.

-- ============================================
-- 0. CREATE the table if it does not exist yet
-- ============================================
CREATE TABLE IF NOT EXISTS birthday_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT,
  photos TEXT[] DEFAULT '{}',
  theme TEXT DEFAULT 'pink',
  slug TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 1. EXTEND birthday_sites
-- ============================================
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS birthday_date DATE;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS from_name TEXT;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS relationship TEXT;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS spotify_url TEXT;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#ec4899';
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'inter';
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS confetti BOOLEAN DEFAULT true;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS music_autoplay BOOLEAN DEFAULT false;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Photos: store public URLs in the array. Keep the column name stable.
-- (Already exists in base schema: photos TEXT[] DEFAULT '{}')

CREATE INDEX IF NOT EXISTS idx_birthday_sites_created ON birthday_sites(created_at DESC);

-- ============================================
-- 2. VIEW COUNTER — bump safely without exposing update rights
-- ============================================
CREATE OR REPLACE FUNCTION increment_site_views(site_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE birthday_sites
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE slug = site_slug AND is_public = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Anyone (even anon) can call the view bump
GRANT EXECUTE ON FUNCTION increment_site_views(TEXT) TO anon, authenticated;

-- ============================================
-- 3. RLS — make sure public can read published sites and call view bump
-- ============================================
ALTER TABLE birthday_sites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public sites viewable by anyone" ON birthday_sites;
  CREATE POLICY "Public sites viewable by anyone" ON birthday_sites
    FOR SELECT USING (is_public = true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Owners view own sites" ON birthday_sites;
  CREATE POLICY "Owners view own sites" ON birthday_sites
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Owners create own sites" ON birthday_sites;
  CREATE POLICY "Owners create own sites" ON birthday_sites
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Owners update own sites" ON birthday_sites;
  CREATE POLICY "Owners update own sites" ON birthday_sites
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Owners delete own sites" ON birthday_sites;
  CREATE POLICY "Owners delete own sites" ON birthday_sites
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ============================================
-- 4. STORAGE — public bucket for site photos + avatars
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read photos" ON storage.objects;
  CREATE POLICY "Public read photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'photos');
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Auth users upload photos" ON storage.objects;
  CREATE POLICY "Auth users upload photos" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'photos'
      AND auth.role() = 'authenticated'
    );
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Auth users update own photos" ON storage.objects;
  CREATE POLICY "Auth users update own photos" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'photos'
      AND auth.uid() = owner
    );
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Auth users delete own photos" ON storage.objects;
  CREATE POLICY "Auth users delete own photos" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'photos'
      AND auth.uid() = owner
    );
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ============================================
-- 5. Keep updated_at fresh
-- ============================================
CREATE OR REPLACE FUNCTION touch_birthday_site()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_birthday_site ON birthday_sites;
CREATE TRIGGER trg_touch_birthday_site
  BEFORE UPDATE ON birthday_sites
  FOR EACH ROW EXECUTE FUNCTION touch_birthday_site();
