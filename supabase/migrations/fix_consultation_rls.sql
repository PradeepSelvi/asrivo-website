-- Fix broken RLS policies on consultation_requests
-- The original policies referenced 'profiles.role' which does not exist.
-- The correct table is 'admin_profiles' with column 'id'.
--
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New query

-- Drop broken policies
DROP POLICY IF EXISTS "Admins can view all consultation requests" ON consultation_requests;
DROP POLICY IF EXISTS "Admins can update consultation requests" ON consultation_requests;

-- Create correct policies using admin_profiles
CREATE POLICY "Admins can view all consultation requests"
  ON consultation_requests FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update consultation requests"
  ON consultation_requests FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );
