# API Validation Guide

## Quick Reference for Developers

This guide explains how to use the validation layer in API routes.

## Overview

All public-facing API routes use **Zod** for input validation. The schemas are centralized in `lib/utils/validation.ts`.

## Basic Usage

### 1. Import Required Modules

```typescript
import { [schemaName] } from '@/lib/utils/validation'
import { ZodError } from 'zod'
import { apiSuccess, apiError } from '@/lib/types/api'
import { HTTP_STATUS } from '@/lib/constants'
import { logError } from '@/lib/utils/error-handler'
```

### 2. Validate Request Body

```typescript
export async function POST(request: NextRequest) {
  let email: string | undefined
  let name: string | undefined

  try {
    const body = await request.json()
    
    // ✅ Validate with Zod
    const validatedData = contactFormSchema.parse(body)
    
    // Extract validated data
    email = validatedData.email
    name = validatedData.name
    const { message, company } = validatedData
    
    // ... rest of your logic
    
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      const firstError = error.errors[0]
      return NextResponse.json(
        apiError(
          `Validation failed: ${firstError.path.join('.')}: ${firstError.message}`, 
          'VALIDATION_ERROR'
        ),
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    // Handle other errors
    logError('POST /api/your-route', error, { email, name })
    return NextResponse.json(
      apiError('An error occurred processing your request', 'INTERNAL_SERVER_ERROR'),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}
```

## Available Schemas

### Contact Form
```typescript
import { contactFormSchema } from '@/lib/utils/validation'

// Fields: email, name, message, company?, subject?, type?, captchaToken?
```

### Service Inquiry
```typescript
import { serviceInquirySchema } from '@/lib/utils/validation'

// Fields: email, name, company, phone?, service_type, 
//         project_description?, timeline?, budget?, captchaToken?
```

### Newsletter Subscription
```typescript
import { newsletterSchema } from '@/lib/utils/validation'

// Fields: email, name?, captchaToken?
```

### Consultation Booking
```typescript
import { consultationSchema } from '@/lib/utils/validation'

// Fields: name, email, phone, whatsapp?, availability, 
//         preferredMode, message?
```

### Schedule Consultation
```typescript
import { scheduleSchema } from '@/lib/utils/validation'

// Fields: name, email, phone?, company?, service_type, 
//         preferred_date, preferred_time?, message?, timezone?
```

### Complaint Submission
```typescript
import { complaintSchema } from '@/lib/utils/validation'

// Fields: name, email, phone?, subject, description, 
//         category?, priority?, proofDocumentUrl?
```

### Job Application
```typescript
import { jobApplicationSchema } from '@/lib/utils/validation'

// Fields: name, email, phone?, job_id, job_title, resume_url,
//         cover_letter?, linkedin_url?, portfolio_url?,
//         years_of_experience?, expected_salary?, available_from?,
//         location?, willing_to_relocate?
```

## Error Handling Pattern

### Standard Error Response
```typescript
{
  "success": false,
  "error": {
    "message": "Validation failed: email: Invalid email format",
    "code": "VALIDATION_ERROR"
  }
}
```

### Validation Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `DATABASE_ERROR` - Database operation failed
- `CAPTCHA_FAILED` - CAPTCHA verification failed
- `DUPLICATE_EMAIL` - Email already exists
- `INTERNAL_SERVER_ERROR` - Unexpected server error

## Common Validation Rules

### Email
- Must be valid RFC 5322 format
- Example: `user@example.com`

### Phone
- Optional field
- 10-15 digits
- Example: `1234567890`

### URLs
- Must be valid HTTP/HTTPS URL
- Example: `https://example.com/resume.pdf`

### Enums
```typescript
// Service Types
'software-dev' | 'web-app' | 'mobile-app' | 'cloud-devops' | 
'ai-automation' | 'it-consulting'

// Priority Levels
'low' | 'medium' | 'high' | 'urgent'

// Complaint Categories
'service' | 'product' | 'support' | 'billing' | 'other'
```

### Text Length
- Most text fields: 3-500 characters
- Descriptions: 10-2000 characters
- Messages: No minimum, 5000 max

### Dates
- ISO 8601 format
- Example: `2025-01-15`

## Creating New Validation Schemas

### 1. Add Schema to validation.ts

```typescript
export const yourNewSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name too short').max(100, 'Name too long'),
  // ... more fields
})
```

### 2. Use in API Route

```typescript
import { yourNewSchema } from '@/lib/utils/validation'

const validatedData = yourNewSchema.parse(body)
```

## Best Practices

### ✅ DO:
- Always validate all incoming data
- Use Zod schemas for type safety
- Log errors with context (email, name)
- Return generic error messages to clients
- Keep validation logic in central schemas
- Update schemas when API changes

### ❌ DON'T:
- Skip validation for "trusted" sources
- Return internal error details to clients
- Expose database error messages
- Hard-code validation rules in routes
- Mix validation and business logic
- Ignore validation errors

## Testing Validation

### Valid Request Test
```typescript
const validData = {
  email: 'test@example.com',
  name: 'John Doe',
  message: 'Test message'
}

// Should return 200/201 with success response
```

### Invalid Email Test
```typescript
const invalidEmail = {
  email: 'not-an-email',
  name: 'John Doe',
  message: 'Test'
}

// Should return 400 with validation error
// Error: "Validation failed: email: Invalid email format"
```

### Missing Required Field Test
```typescript
const missingField = {
  email: 'test@example.com'
  // missing name and message
}

// Should return 400 with validation error
// Error: "Validation failed: name: Required"
```

## Debugging Tips

### Check Request Body
```typescript
console.log('Request body:', body)
```

### Check Validation Errors
```typescript
catch (error) {
  if (error instanceof ZodError) {
    console.log('Validation errors:', error.errors)
    // Show all validation failures
  }
}
```

### Test with curl
```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "John Doe",
    "message": "Test message"
  }'
```

## Additional Resources

- [Zod Documentation](https://zod.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- Project Security: `SECURITY.md`
- Implementation Details: `SECURITY_IMPLEMENTATION.md`

## Support

For questions or issues:
1. Check validation schema in `lib/utils/validation.ts`
2. Review error logs in console
3. Test with valid data first
4. Check field names match schema exactly
5. Verify all required fields are present

---

**Last Updated**: January 2025
**Maintained By**: Development Team
