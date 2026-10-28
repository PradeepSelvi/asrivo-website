-- Migration: Harden client_inquiries RLS against mass assignment (Finding F-031 / CWE-915)
-- Description: Constrains public INSERT policy to require status = 'new' with administrative
-- workflow fields (notes, assigned_to, converted_to_lead_id) left unset (NULL).
-- Also restricts anonymous permissions and ensures verified admin/owner access.

-- 1. Enable Row Level Security (idempotent)
ALTER TABLE client_inquiries ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON client_inquiries;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON client_inquiries;
DROP POLICY IF EXISTS "Admins can update inquiries" ON client_inquiries;
DROP POLICY IF EXISTS "Admins can delete inquiries" ON client_inquiries;
DROP POLICY IF EXISTS "Public submitters can insert new inquiries" ON client_inquiries;

-- 3. Policy for public submissions:
-- Requires status to be 'new' and internal administrative fields to be NULL.
-- Prevents anonymous callers from forging 'converted' or 'qualified' statuses or fake notes.
CREATE POLICY "Anyone can submit inquiries"
  ON client_inquiries
  FOR INSERT
  TO public
  WITH CHECK (
    status = 'new'
    AND notes IS NULL
    AND assigned_to IS NULL
    AND converted_to_lead_id IS NULL
  );

-- 4. Policy for viewing inquiries:
-- Verified admins can view all inquiries; authenticated submitters can view only their own.
CREATE POLICY "Admins can view all inquiries"
  ON client_inquiries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
    OR (
      email = (auth.jwt() ->> 'email')
    )
  );

-- 5. Policy for updating inquiries:
-- Only verified administrators can update inquiry status, notes, or assignment.
CREATE POLICY "Admins can update inquiries"
  ON client_inquiries
  FOR UPDATE
  TO authenticated
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

-- 6. Policy for deleting inquiries:
-- Only verified administrators can delete inquiries.
CREATE POLICY "Admins can delete inquiries"
  ON client_inquiries
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- 7. Secure Table Grants:
-- Never grant table-wide SELECT or UPDATE to anon.
REVOKE ALL ON client_inquiries FROM anon;
GRANT INSERT ON client_inquiries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON client_inquiries TO authenticated;
