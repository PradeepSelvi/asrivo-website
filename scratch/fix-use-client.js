const fs = require('fs');
const path = require('path');

const files = [
  'app/admin/(dashboard)/applications/page.tsx',
  'app/admin/(dashboard)/complaints/[id]/complaint-detail.tsx',
  'app/admin/(dashboard)/consultations/[id]/consultation-detail.tsx',
  'app/admin/(dashboard)/consultations/page.tsx',
  'app/admin/(dashboard)/contacts/[id]/contact-detail.tsx',
  'app/admin/(dashboard)/crm/deals/[id]/page.tsx',
  'app/admin/(dashboard)/crm/leads/[id]/page.tsx',
  'app/admin/(dashboard)/inquiries/[id]/inquiry-detail.tsx',
  'app/admin/(dashboard)/partnerships/page.tsx',
];

for (const relPath of files) {
  const filePath = path.resolve(relPath);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if it has 'use client' or "use client"
  const clientDirectiveMatch = content.match(/^([\s\S]*?)(['"]use client['"];?\r?\n)/);
  
  // If the import is before 'use client', move 'use client' to the very top
  const importStr = "import { buildSafeMailto } from '@/lib/utils/mailto-helper'\n";
  const importStrCRLF = "import { buildSafeMailto } from '@/lib/utils/mailto-helper'\r\n";
  
  if (content.startsWith(importStr) || content.startsWith(importStrCRLF)) {
    // Remove the import from line 1
    content = content.replace(/^import \{ buildSafeMailto \} from '@\/lib\/utils\/mailto-helper'\r?\n/, '');

    // If file has 'use client' / "use client"
    const match = content.match(/^(['"]use client['"];?\r?\n)/);
    if (match) {
      const directive = match[1];
      const rest = content.slice(directive.length);
      content = directive + '\n' + importStr + rest;
    } else {
      content = importStr + content;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed directive ordering in: ${relPath}`);
  }
}

