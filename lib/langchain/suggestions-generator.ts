import { z } from 'zod'
import type { EmotionalState } from '@/types'
import { EMOTIONAL_STATES } from '@/lib/emotional-states'

// ─── Schema ───────────────────────────────────────────────────────────────────

const SuggestionSchema = z.object({
  feeling: z.string().max(80),
  subtext: z.string().max(120),
  category: z.enum(['inadequacy', 'paralysis', 'pressure', 'shame']),
  hiddenMyth: z.string().max(220),
})

const SuggestionsSchema = z.object({
  suggestions: z.array(SuggestionSchema).length(4),
})

// ─── Prompt ───────────────────────────────────────────────────────────────────

const PROMPT = `Сгенерируй 4 варианта эмоциональных состояний для приложения психологической поддержки.
Каждое — конкретный человеческий момент, который кто-то переживает прямо сейчас.

Правила:
- Весь текст строго на русском языке
- Ровно одно состояние каждой категории: "inadequacy", "paralysis", "pressure", "shame"
- "feeling": 4–9 слов, от первого лица, конкретно и человечно — не абстрактно
- "subtext": одно короткое предложение, описывает текстуру этого ощущения с эмпатией
- "hiddenMyth": внутренняя подсказка для анализа (пользователь никогда не видит) — суть переживания, 1–2 предложения
- Каждый раз придумывай новые, не повторяй одни и те же формулировки
- Хорошие примеры "feeling": "Боюсь что снова всё испорчу", "Знаю что нужно делать, но не могу", "Всё держится на мне и я устал", "Чувствую что я просто не такой как все"
- Плохие примеры: слишком абстрактные ("Я тревожусь"), слишком клинические ("У меня депрессия")
- "hiddenMyth" описывает ситуативное ощущение, не диагноз характера — никаких "я ленивый", "я должен быть идеальным", "я самозванец"
- Для "pressure": фокус на ощущении ситуативного давления и потери контроля, не на перфекционизме как черте
- Для "paralysis": фокус на ощущении блокировки и разрыве между пониманием и действием, не на слабости воли
- Для "inadequacy": фокус на разрыве между внутренним ощущением и внешним сравнением, не на том что человек объективно хуже других
- Для "shame": фокус на ощущении фундаментального несоответствия — "со мной что-то не так" как про личность, а не поступок. hiddenMyth должен описывать это как выученную защитную реакцию, не как факт`

// ─── Generator ────────────────────────────────────────────────────────────────

export async function generateSuggestions(): Promise<EmotionalState[]> {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
    return EMOTIONAL_STATES
  }

  try {
    let llm: { withStructuredOutput: (s: typeof SuggestionsSchema) => { invoke: (m: unknown[]) => Promise<unknown> } }

    if (process.env.ANTHROPIC_API_KEY) {
      const { ChatAnthropic } = await import('@langchain/anthropic')
      llm = new ChatAnthropic({ model: 'claude-haiku-4-5-20251001', temperature: 0.92 }) as typeof llm
    } else {
      const { ChatOpenAI } = await import('@langchain/openai')
      llm = new ChatOpenAI({ model: 'gpt-4o-mini', temperature: 0.92 }) as typeof llm
    }

    const structured = llm.withStructuredOutput(SuggestionsSchema)
    const result = await structured.invoke([{ role: 'user', content: PROMPT }]) as z.infer<typeof SuggestionsSchema>

    return result.suggestions.map((s, i) => ({
      id: `gen-${i}-${Date.now()}`,
      feeling: s.feeling,
      subtext: s.subtext,
      category: s.category,
      hiddenMyth: s.hiddenMyth,
    }))
  } catch (err) {
    console.error('[suggestions-generator] failed, using static fallback:', err)
    return EMOTIONAL_STATES
  }
}
