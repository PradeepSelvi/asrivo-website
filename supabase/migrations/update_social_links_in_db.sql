-- Run this SQL in your Supabase SQL Editor:
UPDATE public.site_settings 
SET setting_value = '"https://www.linkedin.com/in/asrivo-tech-4820a2449?utm_source=share_via&utm_content=profile&utm_medium=member_ios"' 
WHERE setting_key = 'social_linkedin';

UPDATE public.site_settings 
SET setting_value = '"https://www.instagram.com/asrivotech?srtk=NTl1YXFrOXRibWNs&utm_source=qr&wa_status_inline=true"' 
WHERE setting_key = 'social_instagram';

-- Also update if the table uses key without quotes:
UPDATE public.site_settings 
SET setting_value = 'https://www.linkedin.com/in/asrivo-tech-4820a2449?utm_source=share_via&utm_content=profile&utm_medium=member_ios' 
WHERE setting_key = 'social_linkedin' AND setting_value LIKE '%linkedin.com/company/asrivotech%';

UPDATE public.site_settings 
SET setting_value = 'https://www.instagram.com/asrivotech?srtk=NTl1YXFrOXRibWNs&utm_source=qr&wa_status_inline=true' 
WHERE setting_key = 'social_instagram' AND setting_value LIKE '%instagram.com/asrivotech%';

