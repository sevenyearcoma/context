import { NextResponse } from 'next/server'
import { generateSuggestions } from '@/lib/langchain/suggestions-generator'

// Cache for 5 minutes — all users share the same batch until revalidation
export const revalidate = 300

export async function GET() {
  try {
    const suggestions = await generateSuggestions()
    return NextResponse.json(suggestions)
  } catch (err) {
    console.error('[/api/suggestions]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
