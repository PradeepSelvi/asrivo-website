import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
// Load environment variables
function loadEnv(filePath: string) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const equalsIdx = trimmed.indexOf('=')
      if (equalsIdx !== -1) {
        const key = trimmed.slice(0, equalsIdx).trim()
        let val = trimmed.slice(equalsIdx + 1).trim()
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1)
        }
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  }
}

loadEnv('.env.local')
loadEnv('.env')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('Running services CMS migration...')
  
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'add_services_cms_fields.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      console.error('Migration error:', error)
      process.exit(1)
    }
    
    console.log('✅ Migration completed successfully!')
    console.log('Added 48 service fields (8 services × 6 fields each) to page_content table')
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(1)
  }
}

runMigration()
