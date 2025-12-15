/**
 * Test HeyGen API Connection
 *
 * Tests if HeyGen API key works and can create streaming sessions
 */

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || 'YOUR_API_KEY_HERE'
const AVATAR_ID = 'Angela-inblackskirt-20220820' // Default HeyGen avatar

async function testHeyGenAPI() {
  console.log('🧪 Testing HeyGen API...\n')

  if (!HEYGEN_API_KEY || HEYGEN_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('❌ Error: HEYGEN_API_KEY not set!')
    console.log('Set it with: export HEYGEN_API_KEY=your_key_here')
    process.exit(1)
  }

  console.log('✓ API Key found:', HEYGEN_API_KEY.substring(0, 10) + '...')
  console.log('✓ Avatar ID:', AVATAR_ID)
  console.log()

  try {
    console.log('📡 Creating streaming session...')

    const response = await fetch('https://api.heygen.com/v1/streaming.new', {
      method: 'POST',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quality: 'medium',
        avatar_name: AVATAR_ID,
        version: 'v2'
      })
    })

    console.log('Response status:', response.status, response.statusText)
    console.log()

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ HeyGen API Error:')
      console.error(error)

      try {
        const errorJson = JSON.parse(error)
        console.log('\n📋 Parsed error:')
        console.log(JSON.stringify(errorJson, null, 2))
      } catch (e) {
        // Not JSON
      }

      return
    }

    const data = await response.json()
    console.log('✅ Success! Full response:')
    console.log(JSON.stringify(data, null, 2))
    console.log()

    // Validate response
    console.log('🔍 Validation:')
    console.log('- Has data:', !!data.data)
    console.log('- Has session_id:', !!data.data?.session_id)
    console.log('- Has SDP:', !!data.data?.sdp)
    console.log('- SDP type:', typeof data.data?.sdp)
    console.log('- SDP keys:', data.data?.sdp ? Object.keys(data.data.sdp) : 'N/A')

    if (data.data?.sdp?.sdp) {
      console.log('- SDP.sdp length:', data.data.sdp.sdp.length)
      console.log('- SDP starts with v=:', data.data.sdp.sdp.startsWith('v='))
      console.log('- SDP preview:', data.data.sdp.sdp.substring(0, 100))
    } else if (data.data?.sdp && typeof data.data.sdp === 'string') {
      console.log('- SDP (direct string) length:', data.data.sdp.length)
      console.log('- SDP starts with v=:', data.data.sdp.startsWith('v='))
      console.log('- SDP preview:', data.data.sdp.substring(0, 100))
    } else {
      console.log('⚠️  Warning: SDP format unexpected!')
    }

    console.log()
    console.log('🎉 Test completed successfully!')
    console.log()
    console.log('Credits info:')
    console.log('- Check your HeyGen dashboard for remaining credits')
    console.log('- Free tier: 10 credits for streaming')

  } catch (error) {
    console.error('❌ Error:', error)
    if (error instanceof Error) {
      console.error('Message:', error.message)
      console.error('Stack:', error.stack)
    }
  }
}

testHeyGenAPI()
