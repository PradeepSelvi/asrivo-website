# Company Components

Centralized, reusable components for displaying company information.

All components use `config/company.ts` as their single source of truth, ensuring consistency across the entire site.

## 📦 Components

### PhoneLink & PhoneNumber
```tsx
import { PhoneLink, PhoneNumber } from '@/components/company'

// Clickable phone link
<PhoneLink showIcon={true} className="text-primary" />

// Just the number (not clickable)
<PhoneNumber className="font-medium" />
```

### WhatsAppLink
```tsx
import { WhatsAppLink } from '@/components/company'

// Link with default text
<WhatsAppLink message="Hi, I'd like to inquire about..." />

// Link with custom children
<WhatsAppLink showIcon={true}>
  Chat with us on WhatsApp
</WhatsAppLink>
```

### EmailLink & EmailAddress
```tsx
import { EmailLink, EmailAddress } from '@/components/company'

// Primary email (default)
<EmailLink type="primary" showIcon={true} />

// Support email
<EmailLink type="support" />

// Careers email
<EmailLink type="careers" />

// Just the address (not clickable)
<EmailAddress type="primary" />
```

### AddressDisplay & AddressLink
```tsx
import { AddressDisplay, AddressLink } from '@/components/company'

// Full address display
<AddressDisplay format="full" showIcon={true} />

// Short format
<AddressDisplay format="short" />

// Clickable (opens in Google Maps)
<AddressLink showIcon={true} />
```

### CompanyName
```tsx
import { CompanyName } from '@/components/company'

// Legal name (for contracts, legal docs)
<CompanyName variant="legal" />

// Display name (for marketing)
<CompanyName variant="display" />

// Short name (for headers)
<CompanyName variant="short" />
```

### SocialLinks & SocialLink
```tsx
import { SocialLinks, SocialLink } from '@/components/company'

// All social links
<SocialLinks showLabels={false} className="flex gap-4" />

// Single platform
<SocialLink platform="linkedin" />
<SocialLink platform="github" />
<SocialLink platform="twitter" />
<SocialLink platform="instagram" />
```

### BusinessHours
```tsx
import { BusinessHours, BusinessHoursText, isSupportAvailable } from '@/components/company'

// Formatted display
<BusinessHours showIcon={true} />

// Plain text
<BusinessHoursText />

// Check if support is currently available
{isSupportAvailable() && <span>We're online!</span>}
```

## 🎯 Benefits

### Single Source of Truth
All components pull from `config/company.ts`. Update once, reflect everywhere.

**Before:**
```tsx
// footer.tsx
<p>+91 9976422558</p>

// contact.tsx
<p>+91 8122575337</p>

// team.tsx
<a href="https://wa.me/1234567890">
```

**After:**
```tsx
// Everywhere:
<PhoneLink />  // Always correct, always consistent
```

### Type Safety
TypeScript ensures you can't make mistakes:

```tsx
<EmailLink type="primary" />  ✅
<EmailLink type="invalid" />  ❌ Type error
```

### Easy Updates
Change phone number in one place:

```ts
// config/company.ts
export const COMPANY = {
  contact: {
    phone: {
      display: '+91 8122575337', // Change here
      whatsapp: '918122575337',
      href: 'tel:+918122575337',
    }
  }
}
```

All components update automatically. No more find-and-replace across 20 files!

### Consistent Styling
All components accept `className` prop:

```tsx
<PhoneLink className="text-lg font-bold hover:text-primary" />
```

## 🔧 Usage Guide

### In Footer
```tsx
import { PhoneLink, EmailLink, AddressDisplay, SocialLinks } from '@/components/company'

export function Footer() {
  return (
    <footer>
      <PhoneLink />
      <EmailLink type="primary" />
      <AddressDisplay format="short" />
      <SocialLinks />
    </footer>
  )
}
```

### In Contact Page
```tsx
import { 
  PhoneLink, 
  WhatsAppLink, 
  EmailLink, 
  AddressDisplay, 
  BusinessHours 
} from '@/components/company'

export function ContactInfo() {
  return (
    <div>
      <PhoneLink showIcon={true} />
      <WhatsAppLink message="Hello from website" />
      <EmailLink type="support" />
      <AddressDisplay format="full" />
      <BusinessHours />
    </div>
  )
}
```

### In Team Page
```tsx
import { WhatsAppLink } from '@/components/company'

export function TeamCard() {
  return (
    <WhatsAppLink message={`Hi, I'd like to connect with ${member.name}`}>
      Chat on WhatsApp
    </WhatsAppLink>
  )
}
```

## ⚠️ Migration Guide

### Step 1: Find Hardcoded Values
Search for:
- Phone numbers: `+91`, `91`, `8122575337`
- Emails: `@asrivotech.com`, `info@`, `support@`
- Company names: `AsrivoTech`, `Asrivo Tech`
- Addresses: `Madurai`, `Tamil Nadu`

### Step 2: Replace with Components
```tsx
// Before:
<a href="tel:+918122575337">+91 8122575337</a>

// After:
<PhoneLink />
```

### Step 3: Test
1. Click all phone links (should dial correctly)
2. Click all email links (should open mail client)
3. Click WhatsApp links (should open WhatsApp)
4. Click address links (should open Google Maps)
5. Verify social links work

## 📚 Related Files

- `config/company.ts` - Configuration source
- `components/company/` - All components
- `WEBSITE_AUDIT_FIXES.md` - Audit action plan

## 🚀 Next Steps

Once owner confirms values in `config/company.ts`:
1. Replace hardcoded values in Footer
2. Replace hardcoded values in Contact page
3. Replace hardcoded values in About page
4. Replace hardcoded values in Team page
5. Search for any remaining hardcoded values
6. Test all links and displays

Estimated time: 2-3 hours
