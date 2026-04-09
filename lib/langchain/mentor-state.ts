import { z } from 'zod'
import type { UserPsychoState, MentorPersona } from '@/types'

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const PsychoStateSchema = z.object({
  anxiety: z.number().min(1).max(10).describe('Общий уровень тревоги прямо сейчас (1–10)'),
  defensiveness: z.number().min(1).max(10).describe('Степень защитной реакции / закрытости (1=открыт, 10=укреплён)'),
  locus_of_control: z.enum(['internal', 'external', 'mixed']).describe('Воспринимает ли себя как причину или жертву обстоятельств'),
  self_agency: z.number().min(1).max(10).describe('Чувство собственной субъектности и влияния на ситуацию (1–10)'),
  core_fear: z.string().max(120).describe('Корневой страх или угроза, просматривающиеся в словах пользователя'),
  dominant_distortion: z.enum([
    'result_bias',
    'catastrophizing',
    'mind_reading',
    'should_statements',
    'overgeneralizing',
    'personalization',
    'none',
  ]).describe('Наиболее выраженное когнитивное искажение'),
  readiness_for_directness: z.number().min(1).max(10).describe('Насколько готов слышать прямые выводы (1=нужно тепло, 10=готов к логике)'),
  arc_note: z.string().max(200).describe('Краткое описание эмоционального движения пользователя в последних сообщениях'),
})

// ─── State Evaluator ──────────────────────────────────────────────────────────

const STATE_EVAL_PROMPT = `Ты — тихий наблюдатель. Твоя задача — оценить психологическое состояние пользователя по его последнему сообщению и всему контексту разговора.
Вернуть нужно только JSON-объект с точными полями. Без комментариев.
Оценивай честно: не добавляй оптимистичный уклон. Если человек захлопнут — ставь высокую defensiveness.`

export async function evaluatePsychoState(
  lastUserMessage: string,
  previousState: UserPsychoState | null,
  conversationSnippet: string,
): Promise<UserPsychoState> {
  // Fallback defaults for when there's no API key yet
  const fallback: UserPsychoState = previousState ?? {
    anxiety: 6,
    defensiveness: 5,
    locus_of_control: 'external',
    self_agency: 4,
    core_fear: 'неизвестно',
    dominant_distortion: 'none',
    readiness_for_directness: 4,
    arc_note: 'Начало разговора, данных мало.',
  }

  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
    return fallback
  }

  try {
    let llm: any

    if (process.env.ANTHROPIC_API_KEY) {
      const { ChatAnthropic } = await import('@langchain/anthropic')
      llm = new ChatAnthropic({ model: 'claude-opus-4-6', temperature: 0.3 })
    } else {
      const { ChatOpenAI } = await import('@langchain/openai')
      llm = new ChatOpenAI({ model: 'gpt-4o', temperature: 0.3 })
    }

    const structured = llm.withStructuredOutput(PsychoStateSchema)

    const userContent = [
      previousState
        ? `[Предыдущий вектор состояния]\n${JSON.stringify(previousState, null, 2)}`
        : '[Это первое сообщение — предыдущего вектора нет]',
      `[Последние сообщения диалога]\n${conversationSnippet}`,
      `[Последнее сообщение пользователя]\n"${lastUserMessage}"`,
      '\nОбнови вектор состояния. Двигайся плавно от предыдущих значений, не делай резких прыжков без весомых оснований.',
    ].join('\n\n')

    const result = await structured.invoke([
      { role: 'system', content: STATE_EVAL_PROMPT },
      { role: 'user', content: userContent },
    ])

    return result as UserPsychoState
  } catch (err) {
    console.error('[mentor-state] state evaluation failed, using previous/default:', err)
    return fallback
  }
}

// ─── Persona Derivation ───────────────────────────────────────────────────────

/**
 * Derives the optimal MentorPersona from the current user state.
 * This is a pure function — no LLM call needed, just psychology-informed heuristics.
 */
export function deriveMentorPersona(state: UserPsychoState): MentorPersona {
  const { anxiety, defensiveness, readiness_for_directness, dominant_distortion, self_agency } = state

  // Base empathy level: high when user is anxious or very defensive
  const empathy = Math.min(10, Math.round((anxiety * 0.5) + (defensiveness * 0.4) + 1))

  // Directness grows with readiness and self_agency, shrinks with defensiveness
  const directness = Math.max(1, Math.round(
    (readiness_for_directness * 0.5) + (self_agency * 0.3) - (defensiveness * 0.3)
  ))

  // Evidence matters more when there's a clear cognitive distortion to counter
  const evidence_weight = dominant_distortion !== 'none' ? 7 : 4

  // Choose technique based on the dominant state pattern
  let technique: MentorPersona['technique'] = 'validation'

  if (defensiveness >= 8) {
    // Don't push — just validate and stay warm
    technique = 'validation'
  } else if (dominant_distortion === 'result_bias' || dominant_distortion === 'overgeneralizing') {
    // These distortions respond well to reframing with facts
    technique = 'reframing'
  } else if (dominant_distortion === 'catastrophizing' || dominant_distortion === 'mind_reading') {
    // Socratic questions help user reach the truth themselves
    technique = 'socratic'
  } else if (dominant_distortion === 'should_statements' || dominant_distortion === 'personalization') {
    // Psychoeducation on cognitive biases is most effective here
    technique = 'psychoeducation'
  } else if (self_agency >= 7 && readiness_for_directness >= 7 && anxiety < 5) {
    // User is stable and ready — give them an actionable script
    technique = 'behavioral_experiment'
  } else if (locus_indicates_boundary_violation(state)) {
    technique = 'boundary_script'
  }

  return {
    empathy: clamp(empathy, 1, 10),
    directness: clamp(directness, 1, 10),
    evidence_weight: clamp(evidence_weight, 1, 10),
    technique,
  }
}

function locus_indicates_boundary_violation(state: UserPsychoState): boolean {
  return (
    state.locus_of_control === 'external' &&
    state.self_agency <= 3 &&
    state.core_fear.length > 0
  )
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}
