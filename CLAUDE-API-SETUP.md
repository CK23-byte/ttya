# Claude API Setup Guide

## Environment Variable Configuration

The chat functionality requires the Anthropic Claude API key to be configured.

### Required Environment Variables

**For Vercel Deployment (Serverless Functions):**
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**For Local Development (Frontend):**
```bash
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Important:** Serverless functions use `ANTHROPIC_API_KEY` (without VITE_ prefix). The VITE_ prefix is only for frontend build-time variables.

## Setup Instructions

### 1. Get Your API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to: Settings → API Keys
4. Create a new API key
5. Copy the key (it starts with `sk-ant-...`)

### 2. Local Development

Create a `.env.local` file in the project root with BOTH variables:

```bash
# For serverless functions (backend)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# For frontend (if needed)
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**Important:** Never commit this file to git! It's already in `.gitignore`.

### 3. Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to: **Settings → Environment Variables**
3. Add BOTH variables:

   **Variable 1 (Required for serverless functions):**
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** Your Anthropic API key
   - **Environment:** Production, Preview, Development (check all)

   **Variable 2 (Optional for frontend):**
   - **Name:** `VITE_ANTHROPIC_API_KEY`
   - **Value:** Your Anthropic API key
   - **Environment:** Production, Preview, Development (check all)

4. Click **Save**
5. **Redeploy** your project for changes to take effect

**Why two variables?**
- `ANTHROPIC_API_KEY` is used by serverless functions (api/chat.ts)
- `VITE_ANTHROPIC_API_KEY` would be used if frontend needs the key (not recommended for security)

## Verification

### Check if API Key is Working

1. Open the chat interface
2. Send a message
3. Open browser console (F12)
4. Look for logs:
   - ✅ `Sending message to Claude API...` → API call initiated
   - ✅ `API response status: 200` → Success
   - ✅ `API response received` → Message received
   - ❌ `API key not configured` → Missing env variable
   - ❌ `API error: 401` → Invalid API key
   - ❌ `API error: 429` → Rate limit exceeded

### Common Issues

**Problem: "API key not configured"**
- **Solution:** Add `ANTHROPIC_API_KEY` to environment variables (for serverless functions)
- For local: Create `.env.local` file with both `ANTHROPIC_API_KEY` and `VITE_ANTHROPIC_API_KEY`
- For Vercel: Add `ANTHROPIC_API_KEY` in Settings → Environment Variables
- Restart dev server after adding
- **Important:** Use `ANTHROPIC_API_KEY` (not `VITE_ANTHROPIC_API_KEY`) for Vercel!

**Problem: "API error: 401"**
- **Solution:** Invalid API key
- Verify the key is correct
- Make sure you copied the full key (starts with `sk-ant-`)
- Generate a new key if needed

**Problem: "API error: 429"**
- **Solution:** Rate limit exceeded
- Check your Anthropic dashboard for usage limits
- Upgrade your plan if needed
- Wait a few minutes and try again

**Problem: "Network error" or "Failed to fetch"**
- **Solution:** Network connectivity issue
- Check internet connection
- Verify Vercel serverless functions are deployed
- Check browser console for CORS errors

## API Costs & Limits

### Anthropic Pricing (Claude Sonnet 4)

**Free Tier:**
- Limited credits for testing
- Check console.anthropic.com for current limits

**Paid Plans:**
- Pay-as-you-go pricing
- ~$3 per million input tokens
- ~$15 per million output tokens
- Check https://www.anthropic.com/pricing for latest rates

**Cost Estimation:**
- Average chat message: ~100-200 tokens
- 1000 messages ≈ $0.30-$0.60
- Actual costs depend on message length and conversation context

### Usage Monitoring

Monitor your usage at: https://console.anthropic.com/settings/usage

## Security Best Practices

1. **Never expose API keys:**
   - Don't commit `.env.local` to git
   - Don't log API keys in console
   - Use serverless functions (already implemented)

2. **Rotate keys regularly:**
   - Generate new keys periodically
   - Revoke old keys after rotation

3. **Monitor usage:**
   - Check Anthropic dashboard regularly
   - Set up usage alerts if available
   - Watch for unexpected spikes

## Architecture

### How it Works

```
User sends message
       ↓
Frontend (ChatPage.tsx)
       ↓
sendMessageToClaude() in claudeAPI.ts
       ↓
/api/chat (Vercel Serverless Function)
       ↓
Anthropic Claude API
       ↓
Response flows back to user
```

### Why Serverless Function?

- **Security:** API key stays server-side, never exposed to browser
- **CORS:** Avoids cross-origin issues
- **Rate limiting:** Can add custom rate limiting
- **Logging:** Centralized error logging

## Troubleshooting Commands

### Check Environment Variables (Local)

```bash
# List all env variables
printenv | grep VITE

# Check specific variable
echo $VITE_ANTHROPIC_API_KEY
```

### Check Vercel Deployment

```bash
# Check if serverless function is deployed
curl https://your-app.vercel.app/api/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "test"}], "systemPrompt": "test"}'

# Expected response if API key is missing:
# {"error": "API key not configured"}

# Expected response if API key is valid:
# {"response": "...actual Claude response..."}
```

### Browser Console Debugging

Enable detailed logging:
1. Open browser console (F12)
2. Go to Console tab
3. Send a chat message
4. Look for logs starting with:
   - `Sending message to Claude API...`
   - `API response status:`
   - `API response received:`

## Next Steps

After setting up the API key:

1. ✅ Test chat functionality
2. ✅ Monitor usage and costs
3. ✅ Set up usage alerts
4. 🔄 Configure rate limiting (optional)
5. 🔄 Add error recovery (optional)

## Resources

- **Anthropic Console:** https://console.anthropic.com/
- **API Documentation:** https://docs.anthropic.com/
- **Pricing:** https://www.anthropic.com/pricing
- **Status Page:** https://status.anthropic.com/

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify API key is set correctly
3. Check Anthropic status page
4. Review serverless function logs in Vercel
5. Contact Anthropic support if API issues persist
