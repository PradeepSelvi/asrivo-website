const fs = require('fs');
const path = require('path');

const file = path.resolve('app/api/admin/notifications/[id]/route.ts');
let content = fs.readFileSync(file, 'utf8');

const target = "case 'complaint': {";
const replacement = `case 'complaint': {
        // Enforce HIGH admin requirement to mutate complaint workflow status (F-034 / CWE-862)
        if (adminResult.user.role !== 'high') {
          return NextResponse.json(
            { error: 'Forbidden: High administrator role required to update complaint status' },
            { status: 403 }
          )
        }`;

if (!content.includes(target)) {
  console.error('Target not found in [id]/route.ts');
  process.exit(1);
}

content = content.replace(target, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated app/api/admin/notifications/[id]/route.ts');
