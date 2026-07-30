#!/usr/bin/env node

/**
 * Quick verification script to check if storage bucket is properly configured
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('\n🔍 Checking Storage Configuration...\n')

if (!supabaseUrl) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local')
  process.exit(1)
}

if (!supabaseAnonKey) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local')
  process.exit(1)
}

console.log('✅ Environment variables found')
console.log(`   URL: ${supabaseUrl}`)
console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...\n`)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkBucket() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.log('❌ Could not list buckets:', error.message)
      return false
    }

    const bucket = buckets?.find(b => b.name === 'user-profiles')

    if (!bucket) {
      console.log('❌ Bucket "user-profiles" NOT FOUND')
      console.log('\n💡 Fix: Run "pnpm run setup-storage"')
      console.log('   Or see: PROFILE-UPLOAD-SETUP.md\n')
      return false
    }

    console.log('✅ Bucket "user-profiles" exists')
    console.log(`   Public: ${bucket.public ? '✅ Yes' : '❌ No (PROBLEM!)'}`)
    console.log(`   Created: ${new Date(bucket.created_at).toLocaleDateString()}`)
    
    if (!bucket.public) {
      console.log('\n⚠️  CRITICAL: Bucket must be PUBLIC!')
      console.log('   Supabase Dashboard → Storage → user-profiles → Settings')
      console.log('   → Check "Public bucket"\n')
      return false
    }

    console.log('\n✅ Storage is properly configured!')
    console.log('   You can now upload profile pictures at /profile/settings\n')
    return true

  } catch (error) {
    console.log('❌ Error:', error.message)
    return false
  }
}

checkBucket()
