# HeyGen Avatar Creation Setup Guide

This guide explains how to enable custom avatar creation using HeyGen's Talking Photo API.

## 🎯 Overview

The app now supports creating custom talking avatars from user photos using HeyGen's API. This requires:
1. A HeyGen account with API access
2. API key configured in Vercel environment variables

## 📝 Step-by-Step Setup

### 1. Get Your HeyGen API Key

1. **Create a HeyGen account** (if you don't have one):
   - Visit https://app.heygen.com/
   - Sign up for an account
   - Choose a plan that includes API access (Free plan includes 3 photo avatars)

2. **Generate API Key**:
   - Log in to https://app.heygen.com/
   - Navigate to **Settings** → **API Keys**
   - Click **Generate New API Key**
   - Copy the API key (you won't be able to see it again!)
   - Store it safely

### 2. Add API Key to Vercel

1. **Open Vercel Dashboard**:
   - Go to https://vercel.com/dashboard
   - Select your **ttya** project

2. **Navigate to Environment Variables**:
   - Click **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Add the API Key**:
   - Click **Add New**
   - **Name**: `HEYGEN_API_KEY`
   - **Value**: Paste your HeyGen API key
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

4. **Redeploy the Application**:
   - Go to **Deployments** tab
   - Click the **⋮** menu on the latest deployment
   - Click **Redeploy**
   - Wait for deployment to complete (~2-3 minutes)

### 3. Verify Setup

1. **Test Avatar Creation**:
   - Log in to your app
   - Go to a personality profile
   - Click **Profile Improvement**
   - Upload a clear photo showing a frontal face
   - Click **Avatar Configuration** → **Custom Avatar**
   - Click **Create Avatar from Photo**
   - Wait 2-5 minutes for processing
   - You should see "Avatar Created Successfully!" message

2. **Check Console Logs** (for debugging):
   - Open browser DevTools (F12)
   - Go to Console tab
   - You should see detailed logs:
     ```
     🎬 AVATAR CREATION STARTED
     📸 Using photo: [URL]
     👤 Avatar name: [Name] Avatar
     📤 Step 1: Uploading photo to HeyGen...
     ✅ Avatar upload successful! ID: [ID]
     🔄 Step 2: Polling for avatar status...
     🔍 Checking status (attempt 1/60)...
     📊 Status: processing
     ...
     ✅ Avatar processing completed!
     🎉 Avatar creation completed successfully!
     ```

## 🔧 Required Environment Variables

The following environment variables must be set in Vercel:

| Variable | Description | Required |
|----------|-------------|----------|
| `HEYGEN_API_KEY` | Your HeyGen API key | ✅ Yes (for avatar creation) |
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ Yes (already set) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ Yes (for backend file access) |

## 📊 HeyGen API Limits

**Free Plan:**
- 3 custom photo avatars
- API access included

**Paid Plans:**
- More avatars
- Higher priority processing
- Check https://app.heygen.com/billing for details

## 🐛 Troubleshooting

### Error: "HeyGen API key not configured"
**Solution**: Make sure `HEYGEN_API_KEY` is added to Vercel environment variables and the app is redeployed.

### Error: "Failed to create avatar" (403 Forbidden)
**Possible causes**:
- Invalid API key
- HeyGen account doesn't have API access
- Free plan quota exceeded (3 avatars limit)

**Solution**:
- Verify API key is correct
- Check your HeyGen plan at https://app.heygen.com/billing
- Upgrade plan if needed

### Error: "Failed to download media from storage"
**Possible causes**:
- `SUPABASE_SERVICE_ROLE_KEY` not set
- Photo doesn't exist in Supabase Storage

**Solution**:
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
- Re-upload the photo

### Avatar processing takes too long
**Expected behavior**: Avatar processing typically takes 2-5 minutes.

**If it exceeds 5 minutes**:
- The frontend will show "Avatar processing timed out"
- Check HeyGen dashboard to see if the avatar was created
- You can manually add the avatar ID to the profile if needed

### Image format errors
**HeyGen only accepts**: JPG/JPEG format

**Solution**: The backend automatically converts PNG/WebP/HEIC to JPEG, but if it fails:
- Try uploading a JPG/JPEG image directly
- Ensure the photo is clear and shows a frontal face

## 📱 Photo Requirements

For best results, uploaded photos should:
- ✅ Show a **clear frontal face**
- ✅ Have **good lighting**
- ✅ Be in **JPG/JPEG format** (or PNG/WebP - will be auto-converted)
- ✅ Be **less than 10MB** in size
- ✅ Show only **one person**
- ✅ Have **neutral expression** (recommended)

Avoid:
- ❌ Side profiles
- ❌ Sunglasses or face coverings
- ❌ Poor lighting or blurry images
- ❌ Group photos
- ❌ Extreme facial expressions

## 🔐 Security Notes

- ✅ **API key is stored securely** in Vercel environment variables (not in code)
- ✅ **Never commit API keys** to Git repository
- ✅ **Backend validates requests** before calling HeyGen API
- ✅ **Service role key** allows backend to access Supabase Storage securely

## 📚 Additional Resources

- **HeyGen API Documentation**: https://docs.heygen.com/docs/photo-avatars-api
- **HeyGen Dashboard**: https://app.heygen.com/
- **Vercel Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables

## 💡 Development vs Production

**Production (Vercel)**:
- Uses environment variables from Vercel dashboard
- Automatically deployed on git push
- HEYGEN_API_KEY must be set for avatar creation to work

**Local Development**:
- Create a `.env` file in project root (NOT committed to git)
- Add: `HEYGEN_API_KEY=your_key_here`
- Add other required variables from Vercel dashboard
- Run `npm run dev`

## ✅ Testing Checklist

Before considering setup complete:

- [ ] HeyGen API key added to Vercel environment variables
- [ ] App redeployed after adding environment variable
- [ ] Test photo upload works
- [ ] Test avatar creation from photo
- [ ] Avatar creation shows progress (10% → 30% → ... → 100%)
- [ ] Success modal appears after ~2-5 minutes
- [ ] Avatar thumbnail is displayed
- [ ] "Save Changes" persists the avatar configuration
- [ ] Custom avatar is available for video calls

## 🎉 Success!

Once setup is complete, users can:
1. Upload photos of their loved ones
2. Create custom talking avatars from those photos
3. Use personalized avatars in video calls
4. Have a more immersive and emotional experience

The avatar will lip-sync and speak in video calls, creating a lifelike interaction!
