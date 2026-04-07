import { NextRequest, NextResponse } from 'next/server'
import { deconstructMyth } from '@/lib/langchain/deconstructor'

export async function POST(req: NextRequest) {
  try {
    const { myth, mythId } = (await req.json()) as { myth: string; mythId?: string }

    if (!myth || typeof myth !== 'string') {
      return NextResponse.json({ error: 'myth is required' }, { status: 400 })
    }

    const result = await deconstructMyth(myth.trim(), mythId)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/deconstruct]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
