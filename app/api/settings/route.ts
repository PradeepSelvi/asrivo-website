import { NextResponse } from 'next/server'
import { getSiteSettingsMap } from '@/lib/utils/get-site-settings'

export async function GET() {
  try {
    const settings = await getSiteSettingsMap()
    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}
