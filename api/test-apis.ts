/**
 * Vercel Serverless Function: Test All API Connections
 *
 * This endpoint tests all configured API connections in the Vercel environment.
 * Deploy to Vercel and access at: https://your-domain.vercel.app/api/test-apis
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

interface TestResult {
  service: string
  status: 'success' | 'failure' | 'skipped'
  message: string
  details?: any
  duration?: number
}

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
        details: { statusCode: response.status, error: error.error },
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
        details: { statusCode: response.status, error },
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
          availableVoices: data.voices?.slice(0, 5).map((v: any) => v.name) || [],
        },
        duration,
      }
    } else {
      const error = await response.text()
      return {
        service: 'ElevenLabs API',
        status: 'failure',
        message: `API returned ${response.status}`,
        details: { statusCode: response.status, error },
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
        details: { statusCode: response.status, error: error.error },
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
          sampleAvatars: data.data?.avatars?.slice(0, 5).map((a: any) => a.avatar_name) || [],
        },
        duration,
      }
    } else {
      const error = await response.json()
      return {
        service: 'HeyGen API',
        status: 'failure',
        message: `API returned ${response.status}: ${error.message || 'Unknown error'}`,
        details: { statusCode: response.status, error },
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

    // 404 is expected for the root endpoint, means connection works
    if (response.ok || response.status === 404) {
      return {
        service: 'Supabase',
        status: 'success',
        message: 'Connection successful',
        details: {
          url: url.replace(/https?:\/\//, '').split('.')[0] + '.supabase.co',
          authenticated: true,
        },
        duration,
      }
    } else {
      return {
        service: 'Supabase',
        status: 'failure',
        message: `Connection returned ${response.status}`,
        details: { statusCode: response.status },
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
 * Main handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Allow only GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Running API connection tests...')

    // Run all tests in parallel
    const results = await Promise.all([
      testAnthropicAPI(),
      testDIDAPI(),
      testElevenLabsAPI(),
      testOpenAIAPI(),
      testHeyGenAPI(),
      testSupabase(),
    ])

    // Calculate summary
    const summary = {
      total: results.length,
      passed: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failure').length,
      skipped: results.filter(r => r.status === 'skipped').length,
    }

    // Add warnings for missing keys
    const warnings = results
      .filter(r => r.status === 'skipped')
      .map(r => `${r.service}: ${r.message}`)

    const response = {
      summary,
      results,
      warnings: warnings.length > 0 ? warnings : undefined,
      timestamp: new Date().toISOString(),
      environment: 'Vercel',
    }

    // Return appropriate status code
    const statusCode = summary.failed > 0 ? 500 : summary.passed === 0 ? 503 : 200

    return res.status(statusCode).json(response)

  } catch (error) {
    console.error('Test endpoint error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
