#!/usr/bin/env node

/**
 * Automated Storage Bucket Setup Script
 * This script creates the user-profiles storage bucket in Supabase
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Required:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nAdd SUPABASE_SERVICE_ROLE_KEY to your .env.local file')
  console.error('Find it in: Supabase Dashboard → Settings → API → service_role key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createStorageBucket() {
  console.log('🚀 Starting storage bucket setup...\n')

  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`)
    }

    const existingBucket = buckets?.find(b => b.name === 'user-profiles')
    
    if (existingBucket) {
      console.log('✅ Bucket "user-profiles" already exists')
      console.log(`   Public: ${existingBucket.public}`)
      
      if (!existingBucket.public) {
        console.log('\n⚠️  WARNING: Bucket exists but is NOT public!')
        console.log('   Make it public in Supabase Dashboard:')
        console.log('   Storage → user-profiles → Settings → Make bucket public')
      }
      
      return true
    }

    // Create the bucket
    console.log('📦 Creating "user-profiles" bucket...')
    
    const { data, error } = await supabase.storage.createBucket('user-profiles', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    })

    if (error) {
      throw new Error(`Failed to create bucket: ${error.message}`)
    }

    console.log('✅ Bucket created successfully!\n')
    return true

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('\n💡 Manual Setup Required:')
    console.error('   1. Go to Supabase Dashboard → Storage')
    console.error('   2. Click "New bucket"')
    console.error('   3. Name: user-profiles')
    console.error('   4. Public: ✅ CHECKED')
    console.error('   5. File size limit: 10485760')
    console.error('   6. Allowed MIME types: image/jpeg,image/png,image/gif,image/webp')
    return false
  }
}

async function applyStoragePolicies() {
  console.log('🔐 Applying storage policies...\n')

  const policies = [
    {
      name: 'Users can upload their own profile images',
      sql: `
        CREATE POLICY "Users can upload their own profile images"
        ON storage.objects
        FOR INSERT
        TO authenticated
        WITH CHECK (
          bucket_id = 'user-profiles' 
          AND (storage.foldername(name))[1] IN ('avatars', 'covers')
          AND (storage.foldername(name))[2] = auth.uid()::text
        );
      `
    },
    {
      name: 'Users can update their own profile images',
      sql: `
        CREATE POLICY "Users can update their own profile images"
        ON storage.objects
        FOR UPDATE
        TO authenticated
        USING (
          bucket_id = 'user-profiles'
          AND (storage.foldername(name))[2] = auth.uid()::text
        )
        WITH CHECK (
          bucket_id = 'user-profiles'
          AND (storage.foldername(name))[2] = auth.uid()::text
        );
      `
    },
    {
      name: 'Users can delete their own profile images',
      sql: `
        CREATE POLICY "Users can delete their own profile images"
        ON storage.objects
        FOR DELETE
        TO authenticated
        USING (
          bucket_id = 'user-profiles'
          AND (storage.foldername(name))[2] = auth.uid()::text
        );
      `
    },
    {
      name: 'Public read access to profile images',
      sql: `
        CREATE POLICY "Public read access to profile images"
        ON storage.objects
        FOR SELECT
        TO public
        USING (bucket_id = 'user-profiles');
      `
    }
  ]

  try {
    for (const policy of policies) {
      console.log(`   Creating: ${policy.name}...`)
      
      // Drop if exists
      await supabase.rpc('exec_sql', { 
        sql: `DROP POLICY IF EXISTS "${policy.name}" ON storage.objects;` 
      }).catch(() => {})
      
      // Create policy
      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql })
      
      if (error && !error.message.includes('already exists')) {
        console.log(`   ⚠️  Could not create policy: ${error.message}`)
      } else {
        console.log(`   ✅ Done`)
      }
    }

    console.log('\n💡 If policies failed, run this SQL manually:')
    console.log('   File: supabase/migrations/create_user_profiles_storage.sql')
    console.log('   Location: Supabase Dashboard → SQL Editor\n')

  } catch (error) {
    console.error('⚠️  Policy creation requires manual setup')
    console.error('   Run: supabase/migrations/create_user_profiles_storage.sql')
    console.error('   In: Supabase Dashboard → SQL Editor\n')
  }
}

async function verifySetup() {
  console.log('🔍 Verifying setup...\n')

  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucket = buckets?.find(b => b.name === 'user-profiles')

    if (!bucket) {
      console.log('❌ Bucket not found')
      return false
    }

    console.log('✅ Bucket: user-profiles')
    console.log(`   Public: ${bucket.public ? '✅ Yes' : '❌ No'}`)
    console.log(`   File size limit: ${bucket.file_size_limit || '10485760'} bytes`)
    
    if (!bucket.public) {
      console.log('\n⚠️  Bucket must be PUBLIC for profile pictures to display!')
      return false
    }

    console.log('\n✨ Setup complete! You can now upload profile pictures.\n')
    return true

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    return false
  }
}

async function main() {
  console.log('═════════════════════════════════════════════════')
  console.log('  User Profile Storage Bucket Setup')
  console.log('═════════════════════════════════════════════════\n')

  const bucketCreated = await createStorageBucket()
  
  if (bucketCreated) {
    await applyStoragePolicies()
    await verifySetup()
  }

  console.log('═════════════════════════════════════════════════')
  console.log('\n📚 Next Steps:')
  console.log('   1. Go to /profile/settings')
  console.log('   2. Try uploading a profile picture')
  console.log('   3. Check that it appears in the user menu')
  console.log('\n   If issues persist, see: docs/profile-picture-upload-test.md\n')
}

main().catch(console.error)

//for console details:
//contact Asrivo tech





