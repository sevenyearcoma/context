import { NextRequest, NextResponse } from 'next/server'
import { evaluatePsychoState, deriveMentorPersona } from '@/lib/langchain/mentor-state'
import { generateMentorResponse } from '@/lib/langchain/mentor'
import type { MentorMessage, UserPsychoState, DeconstructionResult } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      messages: MentorMessage[]
      psychoState: UserPsychoState | null
      deconstructionContext: DeconstructionResult
    }

    const { messages, psychoState, deconstructionContext } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    if (!deconstructionContext) {
      return NextResponse.json({ error: 'deconstructionContext required' }, { status: 400 })
    }

    // Last user message — used for state evaluation
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content ?? ''

    // Build a short conversation snippet (last 6 messages) for context
    const conversationSnippet = messages
      .slice(-6)
      .map(m => `${m.role === 'user' ? 'Пользователь' : 'Ментор'}: ${m.content}`)
      .join('\n')

    // Step 1: Update the psycho-state vector based on the new user message
    const updatedState = await evaluatePsychoState(
      lastUserMessage,
      psychoState,
      conversationSnippet,
    )

    // Step 2: Derive the optimal mentor persona from the updated state
    const persona = deriveMentorPersona(updatedState)

    // Step 3: Generate the mentor's response
    const response = await generateMentorResponse(
      messages,
      updatedState,
      persona,
      deconstructionContext,
    )

    return NextResponse.json({
      response,
      updatedPsychoState: updatedState,
      persona,
    })
  } catch (err) {
    console.error('[api/mentor]', err)
    return NextResponse.json(
      { error: 'Internal server error', response: 'Что-то пошло не так. Попробуй ещё раз.' },
      { status: 500 },
    )
  }
}
