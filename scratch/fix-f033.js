const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, searchStr, replaceStr) {
  const fullPath = path.resolve(filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  if (!content.includes(searchStr)) {
    console.error(`Search string not found in ${filePath}`);
    return false;
  }
  content = content.replace(searchStr, replaceStr);
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${filePath}`);
  return true;
}

// 1. inquiry-detail.tsx
{
  const file = 'app/admin/(dashboard)/inquiries/[id]/inquiry-detail.tsx';
  let content = fs.readFileSync(path.resolve(file), 'utf8');
  // Add import if not present
  if (!content.includes('buildSafeMailto')) {
    content = "import { buildSafeMailto } from '@/lib/utils/mailto-helper'\n" + content;
  }
  content = content.replace(
    '<a href={`mailto:${inquiry.email}`} className="text-primary hover:text-primary/80">{inquiry.email}</a>',
    '<a href={buildSafeMailto(inquiry.email)} className="text-primary hover:text-primary/80">{inquiry.email}</a>'
  );
  fs.writeFileSync(path.resolve(file), content, 'utf8');
  console.log(`Updated ${file}`);
}

// 2. complaint-detail.tsx
{
  const file = 'app/admin/(dashboard)/complaints/[id]/complaint-detail.tsx';
  let content = fs.readFileSync(path.resolve(file), 'utf8');
  if (!content.includes('buildSafeMailto')) {
    content = "import { buildSafeMailto } from '@/lib/utils/mailto-helper'\n" + content;
  }
  content = content.replace(
    '<a href={`mailto:${complaint.email}`} className="text-sm font-medium text-primary hover:underline">',
    '<a href={buildSafeMailto(complaint.email)} className="text-sm font-medium text-primary hover:underline">'
  );
  fs.writeFileSync(path.resolve(file), content, 'utf8');
  console.log(`Updated ${file}`);
}

// 3. partnerships/page.tsx
{
  const file = 'app/admin/(dashboard)/partnerships/page.tsx';
  let content = fs.readFileSync(path.resolve(file), 'utf8');
  if (!content.includes('buildSafeMailto')) {
    content = "import { buildSafeMailto } from '@/lib/utils/mailto-helper'\n" + content;
  }
  content = content.replace(
    'href={`mailto:${selectedPartnership.email}`}',
    'href={buildSafeMailto(selectedPartnership.email)}'
  );
  fs.writeFileSync(path.resolve(file), content, 'utf8');
  console.log(`Updated ${file}`);
}

// 4. contacts/[id]/contact-detail.tsx
{
  const file = 'app/admin/(dashboard)/contacts/[id]/contact-detail.tsx';
  let content = fs.readFileSync(path.resolve(file), 'utf8');
  if (!content.includes('buildSafeMailto')) {
    content = "import { buildSafeMailto } from '@/lib/utils/mailto-helper'\n" + content;
  }
  content = content.replace(
    '<a href={`mailto:${contact.email}`} className="text-sm font-medium text-primary hover:underline">',
    '<a href={buildSafeMailto(contact.email)} className="text-sm font-medium text-primary hover:underline">'
  );
  content = content.replace(
    '<a href={`mailto:${encodeURIComponent(contact.email)}?subject=${encodeURIComponent(`Re: ${contact.subject}`)}`}>',
    '<a href={buildSafeMailto(contact.email, { subject: `Re: ${contact.subject}` })}>'
  );
  fs.writeFileSync(path.resolve(file), content, 'utf8');
  console.log(`Updated ${file}`);
}

// 5. applications/page.tsx
{
  const file = 'app/admin/(dashboard)/applications/page.tsx';
  let content = fs.readFileSync(path.resolve(file), 'utf8');
  if (!content.includes('buildSafeMailto')) {
    content = "import { buildSafeMailto } from '@/lib/utils/mailto-helper'\n" + content;
  }
  content = content.replace(
    'href={`mailto:${selectedApplication.email}`}',
    'href={buildSafeMailto(selectedApplication.email)}'
  );
  fs.writeFileSync(path.resolve(file), content, 'utf8');
  console.log(`Updated ${file}`);
}

// 6. consultations/[id]/consultation-detail.tsx
{
  const file = 'app/admin/(dashboard)/consultations/[id]/consultation-detail.tsx';
  let content = fs.readFileSync(path.resolve(file), 'utf8');
  if (!content.includes('buildSafeMailto')) {
    content = "import { buildSafeMailto } from '@/lib/utils/mailto-helper'\n" + content;
  }
  content = content.replace(
    'href={`mailto:${consultation.email}`}',
    'href={buildSafeMailto(consultation.email)}'
  );
  fs.writeFileSync(path.resolve(file), content, 'utf8');
  console.log(`Updated ${file}`);
}

// 7. consultations/page.tsx
{
  const file = 'app/admin/(dashboard)/consultations/page.tsx';
  let content = fs.readFileSync(path.resolve(file), 'utf8');
  if (!content.includes('buildSafeMailto')) {
    content = "import { buildSafeMailto } from '@/lib/utils/mailto-helper'\n" + content;
  }
  content = content.replace(
    'href={`mailto:${consultation.email}`}',
    'href={buildSafeMailto(consultation.email)}'
  );
  fs.writeFileSync(path.resolve(file), content, 'utf8');
  console.log(`Updated ${file}`);
}

// 8. crm/leads/[id]/page.tsx
{
  const file = 'app/admin/(dashboard)/crm/leads/[id]/page.tsx';
  let content = fs.readFileSync(path.resolve(file), 'utf8');
  if (!content.includes('buildSafeMailto')) {
    content = "import { buildSafeMailto } from '@/lib/utils/mailto-helper'\n" + content;
  }
  content = content.replace(
    '<a href={`mailto:${lead.email}`} className="text-sm text-primary hover:underline">',
    '<a href={buildSafeMailto(lead.email)} className="text-sm text-primary hover:underline">'
  );
  fs.writeFileSync(path.resolve(file), content, 'utf8');
  console.log(`Updated ${file}`);
}

// 9. crm/deals/[id]/page.tsx
{
  const file = 'app/admin/(dashboard)/crm/deals/[id]/page.tsx';
  let content = fs.readFileSync(path.resolve(file), 'utf8');
  if (!content.includes('buildSafeMailto')) {
    content = "import { buildSafeMailto } from '@/lib/utils/mailto-helper'\n" + content;
  }
  content = content.replace(
    '<a href={`mailto:${deal.contact_email}`} className="text-sm text-primary hover:underline">',
    '<a href={buildSafeMailto(deal.contact_email)} className="text-sm text-primary hover:underline">'
  );
  fs.writeFileSync(path.resolve(file), content, 'utf8');
  console.log(`Updated ${file}`);
}

console.log('All admin mailto links updated successfully!');

