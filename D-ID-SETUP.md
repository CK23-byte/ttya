# D-ID Video Call Setup Guide

This guide explains how to set up D-ID API integration for video calls in TalkToYouAI.

## What is D-ID?

D-ID is an AI-powered platform that creates realistic video avatars from static images. It enables:
- **Talking avatars** from photos
- **Real-time video conversations** with AI personalities
- **Natural facial expressions** and lip-sync
- **WebRTC streaming** for low-latency video calls

Website: https://www.d-id.com/

## Prerequisites

1. **D-ID Account**
   - Sign up at https://studio.d-id.com/
   - Free tier available (limited credits)
   - Paid plans for production use

2. **API Key**
   - Get your API key from D-ID dashboard
   - Navigate to: Settings → API Keys
   - Create a new API key

## Installation Steps

### 1. Add Environment Variable

Add your D-ID API key to your environment:

**Local Development (.env.local):**
```bash
# For serverless functions (backend)
DID_API_KEY=your_d_id_api_key_here

# For frontend (if needed)
VITE_DID_API_KEY=your_d_id_api_key_here
```

**Vercel Deployment:**
1. Go to your Vercel project settings
2. Navigate to: Settings → Environment Variables
3. Add BOTH variables:

   **Variable 1 (Required for serverless functions):**
   - Name: `DID_API_KEY`
   - Value: Your D-ID API key
   - Environment: Production, Preview, Development (check all)

   **Variable 2 (Optional for frontend):**
   - Name: `VITE_DID_API_KEY`
   - Value: Your D-ID API key
   - Environment: Production, Preview, Development (check all)

4. Redeploy your project

**Important:** Serverless functions use `DID_API_KEY` (without VITE_ prefix). The VITE_ prefix is only for frontend build-time variables.

### 2. Test the Integration

1. **Create a personality profile** with a photo (optional but recommended)
2. **Open the chat** for that profile
3. **Click the Video button** in the chat header
4. **Start Call** - this will:
   - Create a D-ID streaming session
   - Set up WebRTC connection
   - Display the avatar video stream

### 3. Verify Setup

Check the browser console for any errors:
- ✅ "D-ID session created" = Success
- ❌ "D-ID API key not configured" = Missing env variable (add `DID_API_KEY` to Vercel)
- ❌ "Failed to create stream" = Check API key validity
- ❌ API calls fail = Make sure you're using `DID_API_KEY` (not `VITE_DID_API_KEY`) in Vercel

## Features

### Current Implementation

✅ **Basic Video Calls**
- WhatsApp-style video call interface
- Start/end call functionality
- WebRTC streaming setup
- Call status indicators (connecting, connected, ended)

✅ **Call Controls**
- Mute/unmute microphone
- Toggle video on/off
- Speaker control
- Fullscreen mode
- Return to chat

✅ **Error Handling**
- Connection error display
- Graceful fallbacks
- Session cleanup on end call

### Planned Features

🔄 **Coming Soon:**
- Real-time audio input (talk to avatar)
- Avatar responds based on personality profile
- Integration with Claude AI for conversational responses
- Multiple avatar poses/emotions
- Screen sharing
- Recording capabilities

## API Endpoints

The application uses these serverless endpoints:

### `/api/did/create-stream`
Creates a new D-ID streaming session
- **Method:** POST
- **Body:** `{ sourceUrl: string }`
- **Returns:** `{ id, session_id, offer }`

### `/api/did/stream-message`
Sends WebRTC SDP answer to D-ID
- **Method:** POST
- **Body:** `{ sessionId, message }`
- **Returns:** `{ success: true }`

### `/api/did/close-stream`
Closes an active streaming session
- **Method:** POST
- **Body:** `{ sessionId }`
- **Returns:** `{ success: true }`

## Usage in Code

### Starting a Video Call

```typescript
import { createDIDStreamingSession } from '../utils/didAPI'

// Create session with avatar image
const session = await createDIDStreamingSession(avatarUrl)

// Set up WebRTC
const pc = new RTCPeerConnection()
await pc.setRemoteDescription(session.offer)
const answer = await pc.createAnswer()
await pc.setLocalDescription(answer)
```

### Ending a Call

```typescript
import { closeDIDStreamSession } from '../utils/didAPI'

// Close D-ID session
await closeDIDStreamSession(sessionId)

// Close WebRTC connection
peerConnection.close()
```

## Troubleshooting

### Common Issues

**1. "D-ID API key not configured"**
- Solution: Add `VITE_DID_API_KEY` to environment variables
- Restart development server after adding env variable

**2. "Failed to create stream"**
- Check API key is valid
- Verify you have credits in your D-ID account
- Check avatar image URL is accessible

**3. "Connection timeout"**
- Check network connection
- Verify STUN server is reachable
- Try different browser (Chrome recommended)

**4. Black screen during call**
- Wait a few seconds (WebRTC can take time to connect)
- Check browser permissions for media
- Verify video element is properly set up

### Debug Mode

Enable detailed logging in browser console:

```typescript
// In VideoPage.tsx, add:
console.log('Session:', session)
console.log('PeerConnection state:', pc.connectionState)
```

## Costs & Limits

### D-ID Pricing (as of 2024)

**Free Tier:**
- 20 credits per month
- ~5 minutes of video generation
- Good for testing

**Paid Plans:**
- Lite: $5.90/month - 15 min/month
- Basic: $29/month - 90 min/month
- Advanced: Custom pricing

**Per-Use Credits:**
- ~$0.30 per minute of generated video
- Bulk discounts available

**Note:** Prices may change. Check https://www.d-id.com/pricing for latest pricing.

## Best Practices

1. **Avatar Images:**
   - Use high-quality photos (min 512x512px)
   - Face should be clearly visible and centered
   - Good lighting
   - Neutral background recommended

2. **Performance:**
   - Close unused sessions promptly
   - Monitor credit usage
   - Use efficient WebRTC settings

3. **Error Handling:**
   - Always implement fallbacks
   - Show clear error messages to users
   - Log errors for debugging

4. **Privacy:**
   - Inform users about D-ID usage
   - Don't store D-ID session data unnecessarily
   - Comply with privacy regulations

## Resources

- **D-ID Documentation:** https://docs.d-id.com/
- **D-ID API Reference:** https://docs.d-id.com/reference/api-overview
- **WebRTC Documentation:** https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- **Support:** https://support.d-id.com/

## Next Steps

1. ✅ Set up D-ID API key
2. ✅ Test video call functionality
3. 🔄 Integrate audio input for conversations
4. 🔄 Connect with Claude AI for responses
5. 🔄 Add personality-based avatar behaviors

---

**Questions or Issues?**
- Check the D-ID documentation
- Review browser console for errors
- Verify environment variables are set
- Test with different avatars/images
