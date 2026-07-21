-- Test manual insert to verify table structure
INSERT INTO consultation_requests (
  name,
  email,
  phone,
  whatsapp,
  availability,
  preferred_modes,
  message,
  status
) VALUES (
  'Test User',
  'test@example.com',
  '+1 555-123-4567',
  '+1 555-123-4567',
  'Monday-Friday, 9 AM - 5 PM EST',
  ARRAY['video', 'phone'],
  'This is a test message',
  'pending'
);

-- Check if it was inserted
SELECT * FROM consultation_requests ORDER BY created_at DESC LIMIT 1;
