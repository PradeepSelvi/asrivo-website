const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('app/admin/(dashboard)/contacts/[id]/contact-detail.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

const targetStr = '<a href={`mailto:${contact.email}?subject=Re: ${contact.subject}`}>';
const replacementStr = '<a href={`mailto:${encodeURIComponent(contact.email)}?subject=${encodeURIComponent(`Re: ${contact.subject}`)}`}>';

if (!content.includes(targetStr)) {
  console.error('Target string not found in contact-detail.tsx');
  process.exit(1);
}

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully updated contact-detail.tsx');

