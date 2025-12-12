/**
 * API Connection Test Script
 *
 * Tests all configured API connections to verify they're working correctly.
 * Run with: npx tsx scripts/test-api-connections.ts
 */

import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
dotenv.config()

interface TestResult {
  service: string
  status: 'success' | 'failure' | 'skipped'
  message: string
  details?: any
  duration?: number
}

const results: TestResult[] = []

/**
 * Test Anthropic API
 */
async function testAnthropicAPI(): Promise<TestResult> {
  const startTime = Date.now()
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return {
      service: 'Anthropic API',
      status: 'skipped',
      message: 'API key not configured (ANTHROPIC_API_KEY)',
    }
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Test' }],
      }),
    })

    const duration = Date.now() - startTime

    if (response.ok) {
      const data = await response.json()
      return {
        service: 'Anthropic API',
        status: 'success',
        message: 'Connection successful',
        details: {
          model: data.model,
          usage: data.usage,
        },
        duration,
      }
    } else {
      const error = await response.json()
      return {
        service: 'Anthropic API',
        status: 'failure',
        message: `API returned ${response.status}: ${error.error?.message || 'Unknown error'}`,
        details: error,
        duration,
      }
    }
  } catch (error) {
    return {
      service: 'Anthropic API',
      status: 'failure',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
    }
  }
}

/**
 * Test D-ID API
 */
async function testDIDAPI(): Promise<TestResult> {
  const startTime = Date.now()
  const apiKey = process.env.DID_API_KEY

  if (!apiKey) {
    return {
      service: 'D-ID API',
      status: 'skipped',
      message: 'API key not configured (DID_API_KEY)',
    }
  }

  try {
    const response = await fetch('https://api.d-id.com/credits', {
      headers: {
        'Authorization': `Basic ${Buffer.from(apiKey).toString('base64')}`,
      },
    })

    const duration = Date.now() - startTime

    if (response.ok) {
      const data = await response.json()
      return {
        service: 'D-ID API',
        status: 'success',
        message: 'Connection successful',
        details: data,
        duration,
      }
    } else {
      const error = await response.json()
      return {
        service: 'D-ID API',
        status: 'failure',
        message: `API returned ${response.status}: ${error.description || 'Unknown error'}`,
        details: error,
        duration,
      }
    }
  } catch (error) {
    return {
      service: 'D-ID API',
      status: 'failure',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
    }
  }
}

/**
 * Test ElevenLabs API
 */
async function testElevenLabsAPI(): Promise<TestResult> {
  const startTime = Date.now()
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    return {
      service: 'ElevenLabs API',
      status: 'skipped',
      message: 'API key not configured (ELEVENLABS_API_KEY)',
    }
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    })

    const duration = Date.now() - startTime

    if (response.ok) {
      const data = await response.json()
      return {
        service: 'ElevenLabs API',
        status: 'success',
        message: 'Connection successful',
        details: {
          voicesCount: data.voices?.length || 0,
          voices: data.voices?.map((v: any) => v.name) || [],
        },
        duration,
      }
    } else {
      const error = await response.text()
      return {
        service: 'ElevenLabs API',
        status: 'failure',
        message: `API returned ${response.status}: ${error}`,
        duration,
      }
    }
  } catch (error) {
    return {
      service: 'ElevenLabs API',
      status: 'failure',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
    }
  }
}

/**
 * Test OpenAI API
 */
async function testOpenAIAPI(): Promise<TestResult> {
  const startTime = Date.now()
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return {
      service: 'OpenAI API',
      status: 'skipped',
      message: 'API key not configured (OPENAI_API_KEY)',
    }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    const duration = Date.now() - startTime

    if (response.ok) {
      const data = await response.json()
      const realtimeModel = data.data.find((m: any) => m.id.includes('realtime'))

      return {
        service: 'OpenAI API',
        status: 'success',
        message: 'Connection successful',
        details: {
          modelsCount: data.data.length,
          hasRealtimeModel: !!realtimeModel,
          realtimeModel: realtimeModel?.id,
        },
        duration,
      }
    } else {
      const error = await response.json()
      return {
        service: 'OpenAI API',
        status: 'failure',
        message: `API returned ${response.status}: ${error.error?.message || 'Unknown error'}`,
        details: error,
        duration,
      }
    }
  } catch (error) {
    return {
      service: 'OpenAI API',
      status: 'failure',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
    }
  }
}

/**
 * Test HeyGen API
 */
async function testHeyGenAPI(): Promise<TestResult> {
  const startTime = Date.now()
  const apiKey = process.env.HEYGEN_API_KEY

  if (!apiKey) {
    return {
      service: 'HeyGen API',
      status: 'skipped',
      message: 'API key not configured (HEYGEN_API_KEY)',
    }
  }

  try {
    // Test with HeyGen's avatar list endpoint
    const response = await fetch('https://api.heygen.com/v1/avatar.list', {
      headers: {
        'X-Api-Key': apiKey,
      },
    })

    const duration = Date.now() - startTime

    if (response.ok) {
      const data = await response.json()
      return {
        service: 'HeyGen API',
        status: 'success',
        message: 'Connection successful',
        details: {
          avatarsCount: data.data?.avatars?.length || 0,
          avatars: data.data?.avatars?.map((a: any) => a.avatar_name) || [],
        },
        duration,
      }
    } else {
      const error = await response.json()
      return {
        service: 'HeyGen API',
        status: 'failure',
        message: `API returned ${response.status}: ${error.message || 'Unknown error'}`,
        details: error,
        duration,
      }
    }
  } catch (error) {
    return {
      service: 'HeyGen API',
      status: 'failure',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
    }
  }
}

/**
 * Test Supabase Connection
 */
async function testSupabase(): Promise<TestResult> {
  const startTime = Date.now()
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return {
      service: 'Supabase',
      status: 'skipped',
      message: 'Credentials not configured (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)',
    }
  }

  try {
    // Test basic connection to Supabase REST API
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
    })

    const duration = Date.now() - startTime

    if (response.ok || response.status === 404) {
      // 404 is expected for the root endpoint, means connection works
      return {
        service: 'Supabase',
        status: 'success',
        message: 'Connection successful',
        details: {
          url,
          authenticated: true,
        },
        duration,
      }
    } else {
      return {
        service: 'Supabase',
        status: 'failure',
        message: `Connection returned ${response.status}`,
        duration,
      }
    }
  } catch (error) {
    return {
      service: 'Supabase',
      status: 'failure',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
    }
  }
}

/**
 * Print results in a formatted table
 */
function printResults(results: TestResult[]) {
  console.log('\n' + '='.repeat(80))
  console.log('API CONNECTION TEST RESULTS')
  console.log('='.repeat(80) + '\n')

  let successCount = 0
  let failureCount = 0
  let skippedCount = 0

  results.forEach((result) => {
    const statusEmoji = result.status === 'success' ? '✅' : result.status === 'failure' ? '❌' : '⏭️'
    const statusText = result.status.toUpperCase().padEnd(10)

    console.log(`${statusEmoji} ${statusText} ${result.service}`)
    console.log(`   Message: ${result.message}`)

    if (result.duration) {
      console.log(`   Duration: ${result.duration}ms`)
    }

    if (result.details && result.status === 'success') {
      console.log(`   Details:`, JSON.stringify(result.details, null, 2).split('\n').join('\n   '))
    }

    if (result.details && result.status === 'failure') {
      console.log(`   Error:`, JSON.stringify(result.details, null, 2).split('\n').join('\n   '))
    }

    console.log('')

    if (result.status === 'success') successCount++
    else if (result.status === 'failure') failureCount++
    else skippedCount++
  })

  console.log('='.repeat(80))
  console.log(`SUMMARY: ${successCount} passed, ${failureCount} failed, ${skippedCount} skipped`)
  console.log('='.repeat(80) + '\n')

  // Check for missing API keys
  const skippedServices = results.filter(r => r.status === 'skipped')
  if (skippedServices.length > 0) {
    console.log('⚠️  WARNING: Some services were skipped due to missing API keys:')
    skippedServices.forEach(s => console.log(`   - ${s.service}: ${s.message}`))
    console.log('\n   These API keys should be configured in Vercel environment variables.')
    console.log('   For local testing, add them to your .env file.\n')
  }

  // Exit with error code if any tests failed
  if (failureCount > 0) {
    process.exit(1)
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('Starting API connection tests...\n')

  // Run all tests in parallel for speed
  const testPromises = [
    testAnthropicAPI(),
    testDIDAPI(),
    testElevenLabsAPI(),
    testOpenAIAPI(),
    testHeyGenAPI(),
    testSupabase(),
  ]

  const results = await Promise.all(testPromises)
  printResults(results)
}

// Run tests
runTests().catch((error) => {
  console.error('Test runner error:', error)
  process.exit(1)
})
