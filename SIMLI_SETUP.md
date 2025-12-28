# Simli Setup Guide

**Real-time Photo-Based Avatars for TalkToYouAI**

Simli provides ultra-fast, cost-effective real-time avatars from a single photo. This is the **recommended option** for quick deployment.

---

## 🎯 Why Simli?

✅ **Single Photo** - No video training required
✅ **Fast Setup** - Ready in minutes
✅ **Real-Time** - <300ms latency with lip sync
✅ **Cheapest** - $0.05/min (15-20x cheaper than competitors)
✅ **Free Tier** - 50 minutes/month included
✅ **Voice Cloning** - Works perfectly with your ElevenLabs integration

---

## 📋 Quick Setup (10 Minutes)

### 1. Sign Up for Simli

1. Go to: https://simli.com/
2. Click "Get Started" or "Sign Up"
3. Create your free account
4. **Get $10 credit + 50 min/month free!**

### 2. Get Your API Key

1. Go to Dashboard: https://simli.com/dashboard
2. Navigate to "API Keys" section
3. Click "Create API Key"
4. **Copy the key** (you won't see it again!)

### 3. Add to Vercel Environment Variables

1. Go to your Vercel project: https://vercel.com/[your-project]/settings/environment-variables
2. Click "Add New"
3. **Name:** `SIMLI_API_KEY`
4. **Value:** Paste your API key
5. **Environment:** ✅ Production + ✅ Preview
6. Click **Save**

### 4. Apply Database Migration

1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/[your-project]/sql
2. Open file: `/supabase/migrations/20241227_simli_integration.sql`
3. Copy **entire contents**
4. Paste in SQL Editor
5. Click **Run**
6. Verify: Tables `simli_avatars` and `simli_sessions` created

### 5. Redeploy

The code is already deployed! Just **trigger a redeploy** to load the new env var:

```bash
# Option A: Via Vercel Dashboard
1. Go to: https://vercel.com/[your-project]/deployments
2. Click latest deployment → "..." menu
3. Click "Redeploy"

# Option B: Push a small change to git
# (Any git push will auto-deploy)
```

### 6. Test!

1. Upload a **photo** in Profile Settings
2. Go to Dashboard
3. Click **Video Call** button
4. Should redirect to `/video-simli`
5. **Start Call** to see your talking avatar!

---

## 💰 Pricing

### Free Tier
- **$10 signup credit**
- **50 minutes/month** included
- No credit card required
- Perfect for testing!

### Pay-As-You-Go
- **$0.05 per minute** of video call
- Only charged for actual usage
- **Example:** 100 users × 30 min/month = $150/month

### Comparison
| Service | Price/Min | 100 Users/Month |
|---------|-----------|-----------------|
| **Simli** | **$0.05** | **$150** |
| D-ID | $0.20-0.30 | $600-900 |
| HeyGen | $0.20 | $600 |
| Tavus | $0.05-0.20 | $150-600 |

---

## 🔧 How It Works

### User Flow
1. User uploads **1 photo** in Profile Settings
2. Photo is stored in Supabase Storage
3. User clicks "Video Call" button
4. Simli creates **real-time avatar** from photo
5. **WebRTC streaming** with <300ms latency
6. **Voice cloning** integration (if configured)
7. Credits deducted: 1 credit (5 min) + 0.2/min after

### Technical Flow
```
Photo Upload
   ↓
Supabase Storage (50MB limit)
   ↓
/api/simli/conversation?action=avatar
   ↓
SimliVideoPage.tsx
   ↓
SimliClient (WebRTC)
   ↓
Real-time lip-synced avatar
```

### Credit System
- **First 5 minutes:** 1 credit
- **After 5 minutes:** 0.2 credits/minute
- **Example:** 10-min call = 1 + (5 × 0.2) = 2 credits

---

## 🎨 Features

### ✅ Already Implemented
- `/api/simli/conversation.ts` - Backend API
- `SimliVideoPage.tsx` - Video call UI
- Database schema (simli_avatars, simli_sessions)
- Credit management integration
- Voice cloning support
- Photo validation (<10MB, 256x256 min)

### 🔄 Auto-Redirect
- `/video` → `/video-simli` (automatic)
- Dashboard Video button → Simli
- Works immediately after deployment!

---

## 🚀 Advanced Configuration

### Voice Cloning Integration

Simli automatically uses ElevenLabs voice if configured:

1. User sets up voice cloning in Profile Settings
2. Voice ID is stored in profile data
3. Simli passes `voiceId` to SimliClient
4. Avatar speaks with cloned voice!

No extra configuration needed - it just works!

### Custom Video Routes

You have **3 video options** available:

1. **`/video-simli`** - Simli (photo-based, recommended)
2. **`/video-tavus`** - Tavus (video-based, ultra-realistic)
3. **`/video`** - Redirects to `/video-simli`

### SDK Loading (Optional)

If you encounter "Simli SDK not loaded" error:

#### Option A: NPM Package (Recommended)
```bash
npm install @simli/client
```

Then update `SimliVideoPage.tsx`:
```typescript
import SimliClient from '@simli/client'
```

#### Option B: CDN (Quick Fix)
Add to `index.html`:
```html
<script src="https://cdn.simli.com/simli-client.js"></script>
```

**Note:** Check https://docs.simli.com for latest SDK URL

---

## 🐛 Troubleshooting

### "SIMLI_API_KEY not configured"
- Add key to Vercel environment variables
- **Must redeploy** after adding env vars!

### "Simli SDK not loaded"
- Install via NPM: `npm install @simli/client`
- Or add CDN script to `index.html`

### "Payment required"
- Check Simli dashboard for credits
- Free tier gives 50 min/month + $10 credit
- Add payment method if needed

### "Photo required"
- User must upload photo first
- Go to Profile Settings → Photos section
- Upload at least one photo

### "Database query timeout"
- Apply database migration (step 4 above)
- Check Supabase SQL Editor for errors

### Video Upload Limit
- Maximum: **50MB** (Supabase free tier)
- For photos: 10MB limit
- Compress large files before upload

---

## 📊 Monitoring

### Check Usage
1. Go to: https://simli.com/dashboard/usage
2. View: Minutes used, credits remaining
3. Set up billing alerts if needed

### Database Records
```sql
-- Check avatar configurations
SELECT * FROM simli_avatars ORDER BY created_at DESC LIMIT 10;

-- Check recent sessions
SELECT * FROM simli_sessions ORDER BY started_at DESC LIMIT 10;

-- Check credit usage
SELECT user_id, SUM(credits_used) as total_credits
FROM simli_sessions
GROUP BY user_id
ORDER BY total_credits DESC;
```

---

## 🎯 Next Steps

### Phase 1: Live Now! ✅
- Simli integration complete
- Single photo → talking avatar
- Real-time video calls
- Voice cloning integration

### Phase 2: Future Enhancements
- [ ] Multiple avatar templates
- [ ] Custom backgrounds
- [ ] Screen sharing during calls
- [ ] Recording capabilities
- [ ] Group video calls

### Phase 3: Alternative Options
- Keep Tavus for **ultra-realistic** avatars (requires 2-min video)
- Use D-ID for **pre-rendered** content
- Simli remains **default** for real-time calls

---

## 🆘 Support

### Simli Support
- Docs: https://docs.simli.com
- Discord: https://discord.gg/simli
- Email: support@simli.com

### Your App
- Check Vercel deployment logs
- Check Supabase logs
- Test with `/video-simli?profile=[profileId]`

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] SIMLI_API_KEY added to Vercel
- [ ] Vercel redeployed after adding env var
- [ ] Database migration applied
- [ ] At least one photo uploaded
- [ ] `/video-simli` route accessible
- [ ] Video call button redirects correctly
- [ ] Credits deducted properly
- [ ] Voice cloning works (if configured)

---

**You're all set! Simli is ready to go live.** 🎉

Just add the API key, redeploy, and start making real-time video calls with photo-based avatars!
