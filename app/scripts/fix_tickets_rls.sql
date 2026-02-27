-- 🚨 FIX RLS ERROR (42501): Enable Public RSVP
-- Run this in Supabase SQL Editor

-- 1. Ensure RLS is enabled (Standard Security)
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- 2. Allow Guests (Anon) and Users to create tickets
-- "true" means anyone can insert (since it's a public landing page)
DROP POLICY IF EXISTS "Allow public insert" ON tickets;
CREATE POLICY "Allow public insert"
ON tickets FOR INSERT
TO public
WITH CHECK (true);

-- 3. Allow Guests to view their ticket (Select)
-- Necessary for the "Redirect" step after registration
DROP POLICY IF EXISTS "Allow public select" ON tickets;
CREATE POLICY "Allow public select"
ON tickets FOR SELECT
TO public
USING (true);

-- 4. Allow Update (Optional: Only if guests can edit details later)
-- CREATE POLICY ...
