# API Connection Test Guide

This guide explains how to test all API connections in your ttya project.

## Overview

The project integrates with multiple external APIs:

1. **Anthropic API** - Claude AI for chat interactions
2. **D-ID API** - Avatar video generation
3. **ElevenLabs API** - Voice cloning and text-to-speech
4. **OpenAI API** - Realtime voice conversations
5. **HeyGen API** - Interactive avatar streaming
6. **Supabase** - Database and storage

## Environment Variables

All API keys must be configured in **Vercel environment variables** (not in code):

```
ANTHROPIC_API_KEY     - Claude AI API key
DID_API_KEY           - D-ID avatar API key
ELEVENLABS_API_KEY    - ElevenLabs voice API key
OPENAI_API_KEY        - OpenAI realtime API key
HEYGEN_API_KEY        - HeyGen avatar streaming API key
VITE_SUPABASE_URL     - Supabase project URL
VITE_SUPABASE_ANON_KEY - Supabase anonymous key
```

### Important Notes:

- **Server-side APIs** (Anthropic, D-ID, ElevenLabs, OpenAI, HeyGen) should NOT have the `VITE_` prefix
- **Client-side variables** (Supabase) require the `VITE_` prefix to be accessible in the frontend
- All keys should be set to "All Environments" in Vercel

## Testing Methods

### Method 1: Vercel Endpoint (Recommended for Production)

Once deployed to Vercel, access the test endpoint:

```
https://your-domain.vercel.app/api/test-apis
```

This will return a JSON response with:
- ✅ Success status for working APIs
- ❌ Failure status with error details
- ⏭️ Skipped status for unconfigured APIs

**Example Response:**

```json
{
  "summary": {
    "total": 6,
    "passed": 5,
    "failed": 0,
    "skipped": 1
  },
  "results": [
    {
      "service": "Anthropic API",
      "status": "success",
      "message": "Connection successful",
      "details": {
        "model": "claude-sonnet-4-20250514",
        "usage": { "input_tokens": 10, "output_tokens": 5 }
      },
      "duration": 1234
    },
    // ... more results
  ],
  "timestamp": "2025-12-06T10:30:00.000Z",
  "environment": "Vercel"
}
```

### Method 2: Local Testing

For local development testing:

1. **Add API keys to `.env` file:**

```bash
# Copy from .env.example and add your keys
ANTHROPIC_API_KEY=your_key_here
DID_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
HEYGEN_API_KEY=your_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

2. **Run the test script:**

```bash
npm run test:api
```

This will display a formatted table showing the status of each API connection.

## Interpreting Results

### Success ✅

```
✅ SUCCESS    OpenAI API
   Message: Connection successful
   Duration: 845ms
   Details: {
     "modelsCount": 50,
     "hasRealtimeModel": true,
     "realtimeModel": "gpt-4o-realtime-preview-2024-12-17"
   }
```

- API key is valid
- API is accessible
- Service is operational

### Failure ❌

```
❌ FAILURE    D-ID API
   Message: API returned 401: Invalid API key
   Duration: 234ms
   Error: {
     "statusCode": 401,
     "error": {
       "description": "Invalid credentials"
     }
   }
```

**Common failure reasons:**

- Invalid API key
- Expired API key
- Incorrect key format
- API rate limit exceeded
- Service is down

**How to fix:**

1. Verify the API key in Vercel environment variables
2. Check the API key format (some APIs require specific prefixes)
3. Ensure the key has the correct permissions
4. Check your API usage/credits on the provider's dashboard

### Skipped ⏭️

```
⏭️ SKIPPED    HeyGen API
   Message: API key not configured (HEYGEN_API_KEY)
```

- API key is not set in environment variables
- Add the key to Vercel environment variables

## Troubleshooting

### All Tests Skipped

**Problem:** All APIs show "skipped" status

**Solution:**
1. Check Vercel environment variables are configured
2. Ensure variables are set for "All Environments"
3. Redeploy the application after adding variables

### Supabase Connection Failed

**Problem:** Supabase shows "fetch failed" or connection error

**Solution:**
1. Verify `VITE_SUPABASE_URL` is correct (format: `https://xxx.supabase.co`)
2. Verify `VITE_SUPABASE_ANON_KEY` is the anon/public key (not service role key)
3. Check Supabase project is active
4. Verify Row Level Security (RLS) policies if getting 403 errors

### D-ID Authorization Failed

**Problem:** D-ID returns 401 or authorization errors

**Solution:**
1. D-ID uses Basic authentication
2. The key should be the API key as-is (not base64 encoded)
3. Get your key from: https://studio.d-id.com/
4. Check you have sufficient credits

### ElevenLabs Voice Not Found

**Problem:** ElevenLabs returns success but 0 voices

**Solution:**
1. You need to create voices in the ElevenLabs dashboard
2. Or use pre-made voices from their library
3. Voice cloning requires audio samples to be uploaded

### OpenAI Realtime Model Not Available

**Problem:** OpenAI returns success but `hasRealtimeModel: false`

**Solution:**
1. Realtime API is in beta - request access if needed
2. Verify your API key has access to the realtime API
3. Check OpenAI account status and billing

### HeyGen Avatar List Empty

**Problem:** HeyGen returns success but 0 avatars

**Solution:**
1. Create or add avatars in HeyGen dashboard
2. Or use HeyGen's public avatar IDs
3. Check your HeyGen account tier/permissions

## API Usage Limits

Be aware of rate limits and costs:

- **Anthropic:** Token-based pricing, check your plan
- **D-ID:** Credit-based, ~$0.30 per video minute
- **ElevenLabs:** Character-based, varies by plan
- **OpenAI:** Token-based + realtime session costs
- **HeyGen:** Credit-based, varies by avatar and quality
- **Supabase:** Free tier has limits on storage and bandwidth

## Security Best Practices

1. **Never commit API keys to git**
2. **Use Vercel environment variables** for all sensitive keys
3. **Rotate keys regularly**
4. **Monitor API usage** for unexpected spikes
5. **Set up billing alerts** on each API provider
6. **Use separate keys** for development and production

## Automated Testing

To automate API testing:

1. **Add to CI/CD pipeline:**

```yaml
# .github/workflows/test-apis.yml
name: Test API Connections
on:
  schedule:
    - cron: '0 0 * * *'  # Daily
  workflow_dispatch:      # Manual trigger

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Test APIs
        run: curl https://your-domain.vercel.app/api/test-apis
```

2. **Set up monitoring:**
   - Use Vercel Analytics to track endpoint health
   - Set up alerts for API failures
   - Monitor response times

## Getting Help

If you continue to experience issues:

1. **Check API provider status pages:**
   - Anthropic: https://status.anthropic.com/
   - OpenAI: https://status.openai.com/
   - Supabase: https://status.supabase.com/

2. **Review API documentation:**
   - Each provider's documentation for authentication details
   - Check for recent API changes or deprecations

3. **Check application logs:**
   - Vercel function logs for detailed error messages
   - Browser console for client-side errors

4. **Contact support:**
   - Provider-specific support for API issues
   - Vercel support for deployment/environment issues

## Quick Reference

| Service | Env Variable | Test Endpoint | Documentation |
|---------|-------------|---------------|---------------|
| Anthropic | `ANTHROPIC_API_KEY` | `api.anthropic.com/v1/messages` | https://docs.anthropic.com |
| D-ID | `DID_API_KEY` | `api.d-id.com/credits` | https://docs.d-id.com |
| ElevenLabs | `ELEVENLABS_API_KEY` | `api.elevenlabs.io/v1/voices` | https://elevenlabs.io/docs |
| OpenAI | `OPENAI_API_KEY` | `api.openai.com/v1/models` | https://platform.openai.com/docs |
| HeyGen | `HEYGEN_API_KEY` | `api.heygen.com/v1/avatar.list` | https://docs.heygen.com |
| Supabase | `VITE_SUPABASE_URL`<br>`VITE_SUPABASE_ANON_KEY` | `{url}/rest/v1/` | https://supabase.com/docs |

## Next Steps

After verifying all APIs are connected:

1. ✅ Test each feature individually (chat, voice, video)
2. ✅ Monitor API usage and costs
3. ✅ Set up error handling for API failures
4. ✅ Implement rate limiting on your endpoints
5. ✅ Add user-facing error messages
6. ✅ Set up logging and monitoring

---

**Last Updated:** 2025-12-06
**Version:** 1.0.0
