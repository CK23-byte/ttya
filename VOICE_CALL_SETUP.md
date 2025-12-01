# Voice Call Feature - Setup Guide

Complete setup instructions for the OpenAI Realtime WebRTC voice call system.

## 📋 Prerequisites

Before using the voice call feature, you need:

1. OpenAI API account with Realtime API access
2. Anthropic Claude API account
3. Supabase project (already configured)
4. Vercel deployment (or local development)

---

## Step 1: Add Environment Variables

### Vercel Deployment (Production)

Go to your Vercel project dashboard:

```
https://vercel.com/[your-username]/ttya/settings/environment-variables
```

Add the following environment variables:

#### Required for Voice Calls:

```bash
# OpenAI Realtime API Key
OPENAI_API_KEY=sk-proj-[your-openai-api-key]
```

#### Already configured (verify these exist):

```bash
# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-[your-anthropic-key]

# Supabase
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ[your-service-role-key]
```

**Important:**
- Select all environments: Production, Preview, Development
- Click "Save" after adding each variable
- Redeploy your project after adding variables

### Local Development

Create or update your `.env` file in the project root:

```bash
# OpenAI Realtime API
OPENAI_API_KEY=sk-proj-[your-openai-api-key]

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-[your-anthropic-key]

# Supabase
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ[your-service-role-key]
```

**Note:** The `.env` file is in `.gitignore` and will not be committed.

---

## Step 2: Run Database Migration

### Option A: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `supabase/migrations/002_voice_conversations.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

You should see: "Success. No rows returned"

### Option B: Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref [your-project-ref]

# Run migrations
supabase db push
```

### Verify Migration

Check that the following tables were created:

```sql
-- Run this in SQL Editor to verify:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('voice_sessions', 'voice_conversations', 'voice_function_calls');
```

You should see 3 rows returned.

---

## Step 3: Get Your OpenAI API Key

### Sign up for OpenAI Realtime API:

1. Go to https://platform.openai.com/
2. Sign in or create an account
3. Navigate to **API Keys** (https://platform.openai.com/api-keys)
4. Click **Create new secret key**
5. Name it "TalkToYouAI - Realtime API"
6. Copy the key (starts with `sk-proj-...`)
7. Add to Vercel environment variables (Step 1)

### Check Realtime API Access:

The Realtime API is in beta. If you don't have access yet:

1. Visit https://platform.openai.com/docs/guides/realtime
2. Request access via the form
3. Wait for approval (usually 1-2 business days)

### Pricing (as of 2024):

- Audio input: $0.06/minute
- Audio output: $0.24/minute
- **Total: ~$0.30/minute** (~$3.00 per 10-minute call)

---

## Step 4: Test the Voice Call Feature

### Local Testing:

```bash
# Start dev server
npm run dev

# Open browser
http://localhost:5173
```

### Test Flow:

1. Login to your account
2. Navigate to a personality (or create one)
3. Click the **"Voice Call"** button
4. Allow microphone access when prompted
5. Start speaking naturally
6. The AI should respond in ~1 second

### Test URL Format:

```
/voice-call?personalityId=xxx&name=Dad&relationship=Father&description=Warm and supportive
```

### Browser Requirements:

- ✅ Chrome/Edge (recommended - best WebRTC support)
- ✅ Firefox (good support)
- ⚠️ Safari (basic support, may have issues)
- ❌ IE/Old browsers (not supported)

### Troubleshooting:

**"Microphone permission denied"**
- Click the 🔒 icon in the browser address bar
- Allow microphone access
- Reload the page

**"Failed to create session"**
- Check Vercel logs for API errors
- Verify `OPENAI_API_KEY` is set correctly
- Ensure Realtime API access is enabled

**"Connection failed"**
- Check browser console for WebRTC errors
- Verify firewall isn't blocking WebRTC
- Try Chrome if using Safari/Firefox

**"API key not configured"**
- Double-check environment variables in Vercel
- Redeploy after adding variables
- Wait 2-3 minutes for deployment to complete

---

## Step 5: Usage Costs & Monitoring

### Cost Breakdown (per 10-minute call):

| Service | Cost |
|---------|------|
| OpenAI Realtime API | ~$3.00 |
| Claude function calls (5 calls) | ~$0.10 |
| **Total** | **~$3.10** |

### Monitor Usage:

**OpenAI Dashboard:**
- Visit https://platform.openai.com/usage
- View Realtime API usage in real-time
- Set up usage alerts

**Database Analytics:**
```sql
-- Total calls and minutes
SELECT * FROM get_voice_usage_stats('[user-id]');

-- Recent conversations
SELECT
  personality_name,
  duration_seconds,
  total_messages,
  sentiment_score,
  created_at
FROM voice_conversations
ORDER BY created_at DESC
LIMIT 10;
```

---

## Step 6: Production Checklist

Before going live:

- [ ] OpenAI API key added to Vercel (Production environment)
- [ ] Anthropic API key configured
- [ ] Supabase connected
- [ ] Database migration completed
- [ ] Tested voice call on staging/preview
- [ ] Set up OpenAI usage alerts ($50, $100, $200)
- [ ] Configure Stripe credit packs for voice calls
- [ ] Add usage tracking to user dashboard
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Add analytics tracking (optional)

---

## Security Notes

### Data Privacy:

- ✅ Ephemeral tokens expire after connection
- ✅ Tokens are cleared from database after session ends
- ✅ Row-level security prevents unauthorized access
- ✅ Audio recordings are optional (requires consent)
- ✅ All API keys are server-side only

### Best Practices:

1. **Never expose API keys in frontend code**
2. **Always use ephemeral tokens for WebRTC**
3. **Implement rate limiting** (prevent abuse)
4. **Monitor usage costs** (set alerts)
5. **Clear sensitive data** (tokens, temporary audio)

---

## Architecture Overview

```
Frontend (React)
    ↓ (navigates with personality data)
VoiceCallPage
    ↓ (requests ephemeral token)
/api/voice/session
    ↓ (generates token, creates session)
OpenAI Realtime API
    ↓ (WebRTC connection established)
[User speaks] → [OpenAI transcribes] → [AI responds]
    ↓ (if complex question, calls function)
/api/voice/function-call
    ↓ (gets personalized response)
Claude AI (with personality context)
    ↓ (returns response)
OpenAI synthesizes and speaks
    ↓ (call ends)
/api/voice/end-session
    ↓ (saves transcript)
Database (conversation saved)
```

---

## FAQ

### Q: Do I need both OpenAI AND Claude?
**A:** Yes. OpenAI handles real-time voice (transcription + synthesis), while Claude provides the deep personality embodiment for complex responses.

### Q: Can I use this feature for free?
**A:** The code is free, but you'll pay for API usage:
- OpenAI: ~$0.30/minute
- Claude: ~$0.02 per function call

### Q: How do I limit costs?
**A:**
1. Set OpenAI usage alerts
2. Implement credit system (users buy voice credits)
3. Add usage limits per subscription tier
4. Monitor database for unusual activity

### Q: What if OpenAI Realtime API changes?
**A:** The implementation follows OpenAI's official docs. If they update the API, you may need to update the code accordingly.

### Q: Can users save call recordings?
**A:** Yes, but:
1. You must get explicit consent (GDPR)
2. You need audio storage (S3, Cloudinary, etc.)
3. This increases costs and storage requirements

### Q: How do I add custom voices?
**A:** Currently using OpenAI's default voices (alloy, echo, etc.). Custom voice cloning requires:
1. ElevenLabs integration (additional cost)
2. Voice samples from the deceased person
3. More complex audio pipeline

---

## Support & Resources

### Documentation:
- OpenAI Realtime API: https://platform.openai.com/docs/guides/realtime-webrtc
- Anthropic Claude API: https://docs.anthropic.com/
- Supabase: https://supabase.com/docs

### Need Help?
1. Check Vercel logs for API errors
2. Check browser console for frontend errors
3. Check Supabase logs for database issues
4. Review this guide again

---

## Next Steps

After setup is complete:

1. **Add voice call buttons** to personality pages (already done in code)
2. **Test with real users** (beta testers)
3. **Configure Stripe pricing** for voice credits
4. **Add usage dashboard** for users
5. **Implement rate limiting** (prevent abuse)
6. **Add analytics** (track popular features)
7. **Consider video calls** (next feature)

---

**Version:** 1.0.0
**Last Updated:** December 2024
**Status:** Production Ready (pending API keys)
