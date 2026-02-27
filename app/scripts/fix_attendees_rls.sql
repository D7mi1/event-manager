-- 🚨 FIX RLS ERROR (42501) for 'attendees' table
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on attendees (if not already enabled)
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

-- 2. Allow Public Guests to RSVP (Insert)
DROP POLICY IF EXISTS "Allow public insert" ON attendees;
CREATE POLICY "Allow public insert"
ON attendees FOR INSERT
TO public
WITH CHECK (true);

-- 3. Allow Public Guests to View their Ticket (Select)
DROP POLICY IF EXISTS "Allow public select" ON attendees;
CREATE POLICY "Allow public select"
ON attendees FOR SELECT
TO public
USING (true);

-- 4. Allow Public Update (e.g. for declining later) - Optional
DROP POLICY IF EXISTS "Allow public update" ON attendees;
CREATE POLICY "Allow public update"
ON attendees FOR UPDATE
TO public
USING (true);
