const fs = require('fs');

const NEW_LINKEDIN = 'https://www.linkedin.com/in/asrivo-tech-4820a2449?utm_source=share_via&utm_content=profile&utm_medium=member_ios';
const NEW_INSTAGRAM = 'https://www.instagram.com/asrivotech?srtk=NTl1YXFrOXRibWNs&utm_source=qr&wa_status_inline=true';

// 1. lib/utils/get-site-settings.ts
let gss = fs.readFileSync('lib/utils/get-site-settings.ts', 'utf8');
gss = gss.replace(
  "social_linkedin: 'https://linkedin.com/company/asrivotech'",
  `social_linkedin: '${NEW_LINKEDIN}'`
);
gss = gss.replace(
  "social_instagram: 'https://instagram.com/asrivotech'",
  `social_instagram: '${NEW_INSTAGRAM}'`
);
fs.writeFileSync('lib/utils/get-site-settings.ts', gss, 'utf8');

// 2. lib/supabase/content-helpers.ts
let ch = fs.readFileSync('lib/supabase/content-helpers.ts', 'utf8');
ch = ch.replace(
  "contact_linkedin: 'https://linkedin.com/company/asrivotech'",
  `contact_linkedin: '${NEW_LINKEDIN}'`
);
ch = ch.replace(
  "company_contact_linkedin: 'https://linkedin.com/company/asrivotech'",
  `company_contact_linkedin: '${NEW_LINKEDIN}'`
);
ch = ch.replace(
  "contact_instagram: 'https://instagram.com/asrivotech'",
  `contact_instagram: '${NEW_INSTAGRAM}'`
);
fs.writeFileSync('lib/supabase/content-helpers.ts', ch, 'utf8');

console.log('Updated fallback settings in lib/utils/get-site-settings.ts and lib/supabase/content-helpers.ts');

