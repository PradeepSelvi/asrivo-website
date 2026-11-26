const fs = require('fs');

const NEW_LINKEDIN_URL = 'https://www.linkedin.com/in/asrivo-tech-4820a2449?utm_source=share_via&utm_content=profile&utm_medium=member_ios';

// 1. config/company.ts
let comp = fs.readFileSync('config/company.ts', 'utf8');
comp = comp.replace(
  /linkedin:\s*'https:\/\/linkedin\.com\/company\/asrivotech'/,
  `linkedin: '${NEW_LINKEDIN_URL}'`
);
fs.writeFileSync('config/company.ts', comp, 'utf8');

// 2. components/footer.tsx
let foot = fs.readFileSync('components/footer.tsx', 'utf8');
foot = foot.replace(
  /social_linkedin:\s*'https:\/\/linkedin\.com\/company\/asrivotech'/,
  `social_linkedin: '${NEW_LINKEDIN_URL}'`
);
fs.writeFileSync('components/footer.tsx', foot, 'utf8');

// 3. app/team/page.tsx
let team = fs.readFileSync('app/team/page.tsx', 'utf8');
team = team.replace(
  'href={content.company_contact_linkedin || "https://linkedin.com/company/asrivotech"}',
  `href={content.company_contact_linkedin || "${NEW_LINKEDIN_URL}"}`
);
fs.writeFileSync('app/team/page.tsx', team, 'utf8');

// 4. app/admin/(dashboard)/content/[slug]/content-edit-form.tsx
let cform = fs.readFileSync('app/admin/(dashboard)/content/[slug]/content-edit-form.tsx', 'utf8');
cform = cform.replace(
  'placeholder="https://linkedin.com/company/asrivotech"',
  `placeholder="${NEW_LINKEDIN_URL}"`
);
cform = cform.replace(
  'placeholder="https://linkedin.com/company/asrivotech"',
  `placeholder="${NEW_LINKEDIN_URL}"`
);
fs.writeFileSync('app/admin/(dashboard)/content/[slug]/content-edit-form.tsx', cform, 'utf8');

// 5. app/admin/(dashboard)/settings/site/site-settings-form.tsx
let sform = fs.readFileSync('app/admin/(dashboard)/settings/site/site-settings-form.tsx', 'utf8');
sform = sform.replace(
  'defaultValue={initialSettings.social_linkedin || "https://linkedin.com/company/asrivotech"}',
  `defaultValue={initialSettings.social_linkedin || "${NEW_LINKEDIN_URL}"}`
);
fs.writeFileSync('app/admin/(dashboard)/settings/site/site-settings-form.tsx', sform, 'utf8');

console.log('LinkedIn URLs updated successfully');

