/**
 * Setup Supabase Storage Bucket for Living Legacy
 * Run this script once to create the storage bucket and policies
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  console.error('   Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupStorage() {
  try {
    console.log('🔧 Setting up Supabase storage for Living Legacy...')

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets()

    if (listError) {
      console.error('❌ Error listing buckets:', listError.message)
      process.exit(1)
    }

    const bucketExists = buckets.some(bucket => bucket.id === 'living-legacy')

    if (bucketExists) {
      console.log('✅ Bucket "living-legacy" already exists')
    } else {
      console.log('📦 Creating bucket "living-legacy"...')

      const { data: bucket, error: createError } = await supabase
        .storage
        .createBucket('living-legacy', {
          public: true,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: [
            'audio/mpeg',
            'audio/wav',
            'audio/webm',
            'audio/mp3',
            'video/mp4',
            'video/webm',
            'image/jpeg',
            'image/png',
            'image/jpg',
            'text/plain'
          ]
        })

      if (createError) {
        console.error('❌ Error creating bucket:', createError.message)
        process.exit(1)
      }

      console.log('✅ Bucket "living-legacy" created successfully')
    }

    // Test upload to verify permissions
    console.log('🧪 Testing bucket permissions...')

    const testFile = Buffer.from('test')
    const testPath = 'test/test.txt'

    const { error: uploadError } = await supabase
      .storage
      .from('living-legacy')
      .upload(testPath, testFile, {
        contentType: 'text/plain',
        upsert: true
      })

    if (uploadError) {
      console.warn('⚠️  Upload test failed:', uploadError.message)
      console.warn('   This might be due to RLS policies. You may need to configure storage policies in Supabase dashboard.')
    } else {
      console.log('✅ Upload test successful')

      // Cleanup test file
      await supabase
        .storage
        .from('living-legacy')
        .remove([testPath])
    }

    console.log('\n✨ Storage setup complete!')
    console.log('\n📋 Next steps:')
    console.log('   1. If you saw warnings above, configure storage policies in Supabase:')
    console.log('      https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/storage/policies')
    console.log('   2. Run the SQL migration for avatar tables:')
    console.log('      supabase/migrations/20241202_avatar_tables.sql')
    console.log('   3. Start testing the avatar creation!')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

setupStorage()
