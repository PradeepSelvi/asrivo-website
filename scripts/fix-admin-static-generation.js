#!/usr/bin/env node

/**
 * Script to add dynamic rendering exports to admin pages
 * This fixes static generation errors during build
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '..')

// Directories to scan for admin pages
const adminDirs = [
  'app/admin/(dashboard)',
]

// Dynamic rendering exports to add
const dynamicExports = `
// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0
`

function hasReactOrNextImports(content) {
  return (
    content.includes("from 'react'") ||
    content.includes('from "react"') ||
    content.includes("from 'next/") ||
    content.includes('from "next/')
  )
}

function hasDynamicExports(content) {
  return content.includes("export const dynamic = 'force-dynamic'")
}

function addDynamicExports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    
    // Skip if already has dynamic exports
    if (hasDynamicExports(content)) {
      console.log(`✓ Already has dynamic exports: ${filePath}`)
      return
    }

    // Only process React/Next.js pages
    if (!hasReactOrNextImports(content)) {
      return
    }

    // Find the position to insert dynamic exports
    const lines = content.split('\n')
    let insertIndex = -1

    // Find the last import statement
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.startsWith('import ') || line.startsWith("import'") || line.startsWith('import"')) {
        insertIndex = i
      }
    }

    if (insertIndex === -1) {
      console.log(`⚠ No imports found in: ${filePath}`)
      return
    }

    // Insert dynamic exports after imports
    lines.splice(insertIndex + 1, 0, dynamicExports)
    
    const newContent = lines.join('\n')
    fs.writeFileSync(filePath, newContent, 'utf8')
    
    console.log(`✓ Added dynamic exports to: ${filePath}`)
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message)
  }
}

function scanDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath)
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath)
      } else if (item === 'page.tsx' || item === 'layout.tsx') {
        const relativePath = path.relative(projectRoot, fullPath)
        addDynamicExports(fullPath)
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message)
  }
}

console.log('🔧 Adding dynamic rendering exports to admin pages...\n')

for (const dir of adminDirs) {
  const fullDirPath = path.join(projectRoot, dir)
  
  if (fs.existsSync(fullDirPath)) {
    console.log(`📁 Scanning ${dir}...`)
    scanDirectory(fullDirPath)
  } else {
    console.log(`⚠ Directory not found: ${dir}`)
  }
}

console.log('\n✅ Finished processing admin pages')
console.log('\n📝 Next steps:')
console.log('1. Run: npm run build')
console.log('2. Check if build succeeds without static generation errors')