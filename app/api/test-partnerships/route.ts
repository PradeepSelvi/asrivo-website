import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test 1: Check if table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('partnerships')
      .select('count')
      .limit(1)

    if (tableError) {
      return NextResponse.json({
        success: false,
        error: 'Table check failed',
        details: tableError.message,
        hint: tableError.hint,
      })
    }

    // Test 2: Try to insert a test record
    const { data: insertTest, error: insertError } = await supabase
      .from('partnerships')
      .insert({
        company_name: 'Test Company',
        contact_person: 'Test Person',
        email: 'test@example.com',
        phone: '+1234567890',
        website: 'https://test.com',
        partnership_type: 'testing',
        company_size: '1-10',
        industry: 'Technology',
        services_offered: 'Test services',
        message: 'Test message',
        status: 'new',
      })
      .select()

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: 'Insert test failed',
        details: insertError.message,
        hint: insertError.hint,
        code: insertError.code,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'All tests passed!',
      tableCheck: 'Table exists',
      insertTest: 'Insert successful',
      data: insertTest,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
