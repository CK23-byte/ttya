# Security Audit Report
**Date:** 2025-12-04
**Project:** TalkToYouAI - Living Legacy Application
**Auditor:** Claude (Automated Security Review)

---

## Executive Summary

This security audit reviewed the TalkToYouAI codebase for common vulnerabilities including XSS, SQL injection, authentication issues, and data exposure. The audit identified **8 security concerns** ranging from low to high severity.

### Summary of Findings
- 🔴 **High Severity:** 2 issues
- 🟡 **Medium Severity:** 3 issues
- 🟢 **Low Severity:** 3 issues

---

## 🔴 High Severity Issues

### 1. Overly Permissive CORS Configuration
**Location:** `api/legacy/create-profile.ts:10`

**Issue:**
```typescript
res.setHeader('Access-Control-Allow-Origin', '*')
```

The API allows requests from **any origin** (`*`), which exposes the API to CSRF attacks and unauthorized access from malicious websites.

**Impact:**
- Malicious websites can make API requests on behalf of authenticated users
- Increases attack surface for data theft
- Violates principle of least privilege

**Recommendation:**
Replace wildcard with specific allowed origins:
```typescript
const allowedOrigins = [
  'https://talktoyouai.com',
  'https://www.talktoyouai.com',
  process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : null
].filter(Boolean)

const origin = req.headers.origin
if (origin && allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Credentials', 'true')
}
```

**Files to update:**
- `api/legacy/create-profile.ts`
- `api/legacy/finalize.ts`
- `api/legacy/get-profile.ts`
- `api/legacy/messages.ts`
- `api/voice/session.ts`
- `api/voice/function-call.ts`
- `api/voice/end-session.ts`
- `api/did/stream-message.ts`
- `api/did/close-stream.ts`

---

### 2. Console.log Statements Exposing Sensitive Data
**Locations:** Multiple files

**Issue:**
Production code contains `console.log()` and `console.error()` statements that may leak sensitive information:

```typescript
// src/pages/ContactPage.tsx:50
console.log('Contact form submitted:', formData)

// api/did/stream-message.ts:29
console.log('Sending message to D-ID stream...', { sessionId, message })

// src/contexts/SupabaseAuthContext.tsx:171
console.error('Error creating profile:', profileError)
```

**Impact:**
- User PII (emails, names, messages) exposed in browser console
- API keys, session IDs, and internal errors visible to attackers
- Violation of GDPR/privacy requirements

**Recommendation:**
1. Remove all `console.log` statements from production code
2. Implement proper logging service (e.g., Sentry, LogRocket)
3. Use environment-aware logging:

```typescript
const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args)
    }
  },
  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
      // sentryLog(message, error)
    } else {
      console.error(message, error)
    }
  }
}
```

**Files to clean up:**
- `src/pages/ContactPage.tsx`
- `src/components/DirectRecordingModal.tsx`
- `src/components/WhatsAppUploader.tsx`
- `src/contexts/SupabaseAuthContext.tsx`
- `src/services/avatar.service.ts`
- `api/did/stream-message.ts`
- `api/did/close-stream.ts`
- `api/legacy/*.ts`

---

## 🟡 Medium Severity Issues

### 3. Missing Rate Limiting on API Endpoints
**Location:** All API endpoints in `/api/*`

**Issue:**
No rate limiting implemented on API endpoints, allowing:
- Brute force attacks on authentication
- DoS attacks through excessive API calls
- Credit/resource exhaustion

**Impact:**
- Attackers can overwhelm the service with requests
- Credential stuffing attacks possible
- Increased infrastructure costs from abuse

**Recommendation:**
Implement rate limiting using `express-rate-limit` or Vercel's built-in rate limiting:

```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
})

// For auth endpoints, be more strict:
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true
})
```

---

### 4. Weak Password Validation
**Location:** Auth pages (no explicit validation found)

**Issue:**
No password strength requirements enforced in the UI. Supabase may have defaults, but client-side validation is missing.

**Impact:**
- Users can create weak passwords (e.g., "password123")
- Increased risk of account compromise
- Brute force attacks easier to execute

**Recommendation:**
Add password validation to sign-up forms:

```typescript
const validatePassword = (password: string): string | null => {
  if (password.length < 12) {
    return 'Password must be at least 12 characters'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number'
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character'
  }
  return null
}
```

Apply in:
- `src/pages/AuthChoicePage.tsx`
- `src/pages/ResetPasswordPage.tsx`

---

### 5. Missing Input Sanitization on File Uploads
**Location:** `src/components/WhatsAppUploader.tsx`

**Issue:**
ZIP file extraction doesn't validate file size limits or perform deep content inspection:

```typescript
const zipContent = await zip.loadAsync(file) // No size limit check
```

**Impact:**
- Zip bombs could crash the browser
- Malicious file names could cause path traversal
- Large files could cause DoS

**Recommendation:**
Add file size and content validation:

```typescript
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_UNCOMPRESSED_SIZE = 200 * 1024 * 1024 // 200MB

const handleFile = async (file: File) => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    setError('File is too large. Maximum size is 50MB')
    return
  }

  if (file.name.endsWith('.zip')) {
    const zip = new JSZip()
    const zipContent = await zip.loadAsync(file)

    // Check total uncompressed size
    let totalSize = 0
    Object.values(zipContent.files).forEach(f => {
      totalSize += f._data?.uncompressedSize || 0
    })

    if (totalSize > MAX_UNCOMPRESSED_SIZE) {
      setError('Uncompressed file size too large')
      return
    }

    // Validate file path to prevent path traversal
    const txtFile = Object.keys(zipContent.files).find(
      filename => {
        const normalized = filename.replace(/\\/g, '/')
        return normalized.endsWith('.txt') &&
               !normalized.startsWith('__MACOSX') &&
               !normalized.includes('../') &&
               !normalized.startsWith('/')
      }
    )

    // ... rest of code
  }
}
```

---

## 🟢 Low Severity Issues

### 6. Missing Content Security Policy (CSP)
**Location:** `index.html` (CSP headers not configured)

**Issue:**
No Content Security Policy headers configured to prevent XSS attacks.

**Impact:**
- If XSS vulnerability is introduced, damage is not contained
- Inline scripts/styles could be injected

**Recommendation:**
Add CSP meta tag to `index.html`:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline' 'unsafe-eval';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               font-src 'self' data:;
               connect-src 'self' https://*.supabase.co https://api.elevenlabs.io https://api.d-id.com">
```

Or configure in Vercel/server:
```typescript
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; ..."
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

---

### 7. Email Regex Validation Insufficient
**Location:** `src/pages/ContactPage.tsx:40`

**Issue:**
Simple email regex can be bypassed:
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

This accepts invalid emails like `test@test.c` or `test..test@domain.com`

**Impact:**
- Invalid emails accepted
- Potential for email injection attacks
- Poor UX (users enter invalid emails, don't get responses)

**Recommendation:**
Use a more robust email validation library or regex:

```typescript
import validator from 'validator'

if (!validator.isEmail(formData.email)) {
  setStatus('error')
  setErrorMessage('Please enter a valid email address')
  return
}
```

Or use comprehensive regex:
```typescript
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
```

---

### 8. Missing HTTPS Enforcement
**Location:** Application-wide

**Issue:**
No check to ensure the application is served over HTTPS in production.

**Impact:**
- Man-in-the-middle attacks possible
- Credentials transmitted in plaintext if accidentally served over HTTP
- SEO penalties

**Recommendation:**
Add HTTPS redirect in production:

```typescript
// In App.tsx or main entry point
useEffect(() => {
  if (
    process.env.NODE_ENV === 'production' &&
    window.location.protocol === 'http:'
  ) {
    window.location.href = window.location.href.replace('http:', 'https:')
  }
}, [])
```

And configure in `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

---

## ✅ Security Best Practices Already Implemented

### Good Practices Found:
1. ✅ **No `dangerouslySetInnerHTML`** - No XSS vulnerabilities from unsafe HTML rendering
2. ✅ **No `eval()`** - No arbitrary code execution risks
3. ✅ **Environment Variables** - API keys stored in env vars, not hardcoded
4. ✅ **`.env` files ignored** - Secrets not committed to git (.gitignore configured correctly)
5. ✅ **Supabase Auth** - Using industry-standard auth library
6. ✅ **Parameterized Queries** - Supabase client prevents SQL injection
7. ✅ **HTTPS for API Calls** - All external APIs use HTTPS
8. ✅ **File Type Validation** - Upload component checks file extensions
9. ✅ **Session Management** - Proper JWT token handling via Supabase
10. ✅ **Password Hashing** - Handled by Supabase (bcrypt)

---

## Priority Action Items

### Immediate (Fix Today):
1. 🔴 Remove all `console.log` statements exposing sensitive data
2. 🔴 Fix CORS configuration to whitelist specific origins

### Short-term (Fix This Week):
3. 🟡 Add rate limiting to API endpoints
4. 🟡 Implement password strength validation
5. 🟡 Add file size/content validation to uploads

### Medium-term (Fix This Month):
6. 🟢 Implement Content Security Policy
7. 🟢 Add comprehensive email validation
8. 🟢 Enforce HTTPS with HSTS headers

---

## Testing Recommendations

### Manual Testing:
1. Test CORS with different origins (use Postman/curl)
2. Attempt SQL injection on all input fields
3. Try uploading large files (>100MB) and zip bombs
4. Test XSS payloads in text inputs: `<script>alert('XSS')</script>`
5. Attempt brute force on auth endpoints

### Automated Testing:
1. Use OWASP ZAP for vulnerability scanning
2. Run `npm audit` regularly for dependency vulnerabilities
3. Use GitHub Dependabot for automated security updates
4. Consider penetration testing before public launch

---

## Compliance Notes

### GDPR Considerations:
- ✅ Privacy policy implemented
- ✅ User can request data deletion (Supabase supports this)
- ⚠️ Need to remove console.logs that expose PII
- ⚠️ Need data retention policy enforcement in code

### Industry Standards:
- Follow OWASP Top 10 guidelines
- Implement security headers (CSP, HSTS, X-Frame-Options)
- Regular security audits (quarterly recommended)
- Bug bounty program for responsible disclosure

---

## Conclusion

The application has a **solid security foundation** with proper authentication, no obvious XSS/SQL injection vulnerabilities, and good use of environment variables. The main concerns are:

1. **CORS misconfiguration** - Easily exploitable, fix immediately
2. **Console logging** - Exposes sensitive data, remove before production
3. **Missing rate limiting** - Could lead to abuse and DoS

With the recommended fixes implemented, the application will meet industry security standards for a production SaaS application.

---

**Next Audit Recommended:** 2026-03-04 (3 months)
