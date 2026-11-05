-- "Missed You" feature: private notes between a couple, revealed on the
-- partner's next visit. Idempotent — safe to re-run.

CREATE TABLE IF NOT EXISTS missed_you_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revealed_at TIMESTAMPTZ,
  CHECK (sender_id <> partner_id)
);

CREATE INDEX IF NOT EXISTS idx_missed_you_partner_unread
  ON missed_you_entries (partner_id, created_at DESC)
  WHERE revealed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_missed_you_sender
  ON missed_you_entries (sender_id, created_at DESC);

ALTER TABLE missed_you_entries ENABLE ROW LEVEL SECURITY;

-- Only the two people involved may see these.
DO $$ BEGIN
  CREATE POLICY "Missed-you entries visible to the couple"
    ON missed_you_entries FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = partner_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Missed-you entries writable by the sender"
    ON missed_you_entries FOR INSERT
    WITH CHECK (auth.uid() = sender_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Receivers mark entries revealed"
    ON missed_you_entries FOR UPDATE
    USING (auth.uid() = partner_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
