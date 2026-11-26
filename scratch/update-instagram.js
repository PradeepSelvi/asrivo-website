const fs = require('fs');

const NEW_INSTAGRAM_URL = 'https://www.instagram.com/asrivotech?srtk=NTl1YXFrOXRibWNs&utm_source=qr&wa_status_inline=true';

// 1. config/company.ts
let comp = fs.readFileSync('config/company.ts', 'utf8');
comp = comp.replace(
  /instagram:\s*'https:\/\/instagram\.com\/asrivotech'/,
  `instagram: '${NEW_INSTAGRAM_URL}'`
);
fs.writeFileSync('config/company.ts', comp, 'utf8');

// 2. components/footer.tsx
let foot = fs.readFileSync('components/footer.tsx', 'utf8');
foot = foot.replace(
  /social_instagram:\s*'https:\/\/instagram\.com\/asrivotech'/,
  `social_instagram: '${NEW_INSTAGRAM_URL}'`
);
fs.writeFileSync('components/footer.tsx', foot, 'utf8');

// 3. app/admin/(dashboard)/content/[slug]/content-edit-form.tsx
let cform = fs.readFileSync('app/admin/(dashboard)/content/[slug]/content-edit-form.tsx', 'utf8');
cform = cform.replace(
  'placeholder="https://instagram.com/asrivotech"',
  `placeholder="${NEW_INSTAGRAM_URL}"`
);
fs.writeFileSync('app/admin/(dashboard)/content/[slug]/content-edit-form.tsx', cform, 'utf8');

// 4. app/admin/(dashboard)/settings/site/site-settings-form.tsx
let sform = fs.readFileSync('app/admin/(dashboard)/settings/site/site-settings-form.tsx', 'utf8');
sform = sform.replace(
  'defaultValue={initialSettings.social_instagram || "https://instagram.com/asrivotech"}',
  `defaultValue={initialSettings.social_instagram || "${NEW_INSTAGRAM_URL}"}`
);
fs.writeFileSync('app/admin/(dashboard)/settings/site/site-settings-form.tsx', sform, 'utf8');

console.log('Instagram URLs updated successfully');

