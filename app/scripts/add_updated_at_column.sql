-- 🚨 FIX PGRST204: Add missing 'updated_at' column
-- Run this in Supabase SQL Editor

-- 1. Add the missing column
ALTER TABLE attendees 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Optional: Add a trigger to automatically update this timestamp
-- (Good practice but not strictly required for the fix)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_attendees_updated_at ON attendees;
CREATE TRIGGER update_attendees_updated_at
    BEFORE UPDATE ON attendees
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- 3. Reload Schema Cache (Force Supabase to recognize the new column)
NOTIFY pgrst, 'reload config';
