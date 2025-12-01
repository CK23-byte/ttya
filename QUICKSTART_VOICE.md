# 🎤 Voice Call Quick Start Guide

Get your voice calls working in 5 minutes!

## ✅ Step 1: Add Environment Variables (2 min)

### Vercel Dashboard

Go to: `https://vercel.com/[your-username]/ttya/settings/environment-variables`

Add this **ONE NEW** variable:

```bash
OPENAI_API_KEY=sk-proj-your-key-here
```

✅ Select all environments: Production, Preview, Development
✅ Click Save
✅ Click "Redeploy" button in Vercel dashboard

### Get Your OpenAI Key

1. Visit: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it: "TalkToYouAI"
4. Copy the key (starts with `sk-proj-`)
5. Paste into Vercel

**Cost:** ~$0.30/minute (~$3 per 10-min call)

---

## ✅ Step 2: Run Database Migration (1 min)

1. Go to your Supabase dashboard
2. Click **SQL Editor** in sidebar
3. Copy/paste this file: `supabase/migrations/002_voice_conversations.sql`
4. Click **Run**
5. Should see: "Success. No rows returned"

**Done!** 3 new tables created: `voice_sessions`, `voice_conversations`, `voice_function_calls`

---

## ✅ Step 3: Test It! (2 min)

### From Dashboard:

1. Go to `/dashboard`
2. Find a personality card
3. Click the green **"Call"** button
4. Allow microphone access
5. Start talking!

### From Chat:

1. Open any chat
2. Click the Phone icon (🟢 green hover) in header
3. Allow microphone
4. Have a conversation!

### URL Format:

```
/voice-call?personalityId=xxx&name=Dad&relationship=Father&description=...
```

---

## 🔧 Troubleshooting

### "Failed to create session"
- Check Vercel logs for API errors
- Verify `OPENAI_API_KEY` is set
- Wait 2-3 minutes after adding env vars
- Try redeploying

### "Microphone permission denied"
- Click 🔒 icon in browser address bar
- Allow microphone
- Reload page

### "Connection failed"
- Use Chrome/Edge (best WebRTC support)
- Check firewall isn't blocking WebRTC
- Disable browser extensions temporarily

### "API key not configured"
- Double-check spelling: `OPENAI_API_KEY` (not OPENAI_API_KEY)
- Redeploy after adding variables
- Check all environments selected

---

## 💰 Costs

| Service | Cost per 10 min |
|---------|-----------------|
| OpenAI Realtime API | ~$3.00 |
| Claude function calls | ~$0.10 |
| **Total** | **~$3.10** |

**Set Usage Alerts:** https://platform.openai.com/usage

---

## 🎯 What Works Now

✅ Natural voice conversation
✅ Low latency (~1 second response)
✅ Real-time transcription
✅ Audio waveform visualization
✅ Personality integration via Claude
✅ Automatic conversation saving
✅ Call duration tracking

---

## 📱 Where to Find Call Buttons

### Dashboard Page (`/dashboard`)
- Each personality card has:
  - **"Call"** button (green) - Voice call
  - **"Video"** button (purple) - Video call (D-ID)
  - **"Open Chat"** button (orange) - Text chat

### Chat Page (`/chat`)
- Header actions:
  - **Phone icon** (🟢 green hover) - Voice call
  - **Video icon** - Video call
  - **More options** - Settings

---

## 🚀 Next Steps (Optional)

1. **Monitor Usage:** Check OpenAI dashboard daily
2. **Set Alerts:** $50, $100, $200 thresholds
3. **Configure Pricing:** Add voice credit packs to Stripe
4. **Add Analytics:** Track which features users love
5. **Test Mobile:** Safari/Chrome on iOS/Android

---

## 📚 Full Documentation

For detailed setup, architecture, and advanced features:
- See: `VOICE_CALL_SETUP.md`

---

## ❓ Need Help?

1. Check Vercel logs for API errors
2. Check browser console for frontend errors
3. Review this guide again
4. Check Supabase logs for database issues

---

**That's it!** Voice calls should work now. Test it and enjoy! 🎉
