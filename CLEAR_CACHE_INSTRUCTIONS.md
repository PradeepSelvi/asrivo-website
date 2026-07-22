# Fix CRM 404 Errors

The CRM detail pages exist but Next.js might have cached an old route configuration.

## Steps to Fix:

1. **Stop the development server** (press Ctrl+C in your terminal)

2. **Delete the .next cache folder:**
   ```bash
   rm -rf .next
   ```
   Or on Windows PowerShell:
   ```powershell
   Remove-Item -Recurse -Force .next
   ```

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

4. **Test the links again:**
   - http://localhost:3000/admin/crm/leads/1
   - http://localhost:3000/admin/crm/deals/1

## Files Confirmed to Exist:
- ✅ `app/admin/(dashboard)/crm/leads/[id]/page.tsx`
- ✅ `app/admin/(dashboard)/crm/deals/[id]/page.tsx`
- ✅ `app/admin/(dashboard)/crm/leads/[id]/edit/page.tsx`
- ✅ `app/admin/(dashboard)/crm/deals/[id]/edit/page.tsx`

The pages are there - this is just a Next.js cache issue that clearing the build folder will fix.
