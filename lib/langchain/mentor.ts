import type { MentorMessage, UserPsychoState, MentorPersona, DeconstructionResult } from '@/types'

// ─── Technique Descriptions ───────────────────────────────────────────────────

const TECHNIQUE_GUIDES: Record<MentorPersona['technique'], string> = {
  validation: `
ТЕХНИКА: Валидация.
Сначала прими и признай чувства. Не пытайся сразу "чинить". 
Дай человеку почувствовать, что его состояние нормально.
Используй фразы вроде "Это действительно тяжело", "Имеет смысл, что ты так себя чувствуешь".
Только после этого — аккуратно один шаг к истине.`,

  socratic: `
ТЕХНИКА: Сократовский диалог.
Задавай вопросы, которые помогают человеку самому прийти к ответу.
Не говори, что он не прав. Спроси: "Что бы ты сказал другу в такой ситуации?"
"Можешь вспомнить случай, когда это убеждение тебя защитило? А когда подвело?"
Один вопрос за раз. Не давай ответ сам.`,

  reframing: `
ТЕХНИКА: Переосмысление (Reframing).
Аккуратно предложи другой угол зрения на ту же ситуацию.
Не опровергай — расширяй картину. "Одна версия событий такова... А что если..."
Обяжательно опирайся на конкретные факты из контекста деконструкции и научные данные.`,

  psychoeducation: `
ТЕХНИКА: Психообразование.
Назови когнитивное искажение по имени и объясни его механизм научно, но просто.
Например: "То, что ты описываешь — это Result Bias. Исследования показывают, что наш мозг..."
Нормализуй: это не слабость, это архитектура мозга. Все через это проходят.`,

  behavioral_experiment: `
ТЕХНИКА: Поведенческий эксперимент.
Человек стабилен и готов к действию. Предложи конкретный маленький шаг.
Не "постарайся больше" — а точный эксперимент: "Что если попробовать Х в этот раз и посмотреть что случится?"
Frame it as a test, not a solution.`,

  boundary_script: `
ТЕХНИКА: Скрипт защиты границ.
Человеку нужны конкретные слова, которые он может сказать или подумать прямо сейчас.
Дай ему готовый внутренний монолог или фразу для отпора. 
Пример: "Я делаю всё, что в моих силах. Если ожидания выше этого — это их проблема, не моя."`,
}

// ─── System Prompt Builder ────────────────────────────────────────────────────

function buildSystemPrompt(
  deconstructionContext: DeconstructionResult,
  psychoState: UserPsychoState,
  persona: MentorPersona,
): string {
  // Compress the deconstruction into a readable briefing for the LLM
  const violations = deconstructionContext.nodes
    .filter(n => n.type === 'violation')
    .map(n => `• ${n.label}: ${n.description}`)
    .join('\n')

  const truths = deconstructionContext.nodes
    .filter(n => n.type === 'systemicTruth')
    .map(n => `• ${n.label}: ${n.description}`)
    .join('\n')

  const defenses = deconstructionContext.nodes
    .filter(n => n.type === 'boundaryDefense')
    .map(n => `• ${n.label}: ${n.description}`)
    .join('\n')

  const techniqueGuide = TECHNIQUE_GUIDES[persona.technique]

  return `Ты — "Context Mentor", эмпатичный и мудрый наставник.
Ты НЕ психотерапевт и НЕ ставишь диагнозов. Ты — как доверенный друг, который хорошо знает психологию и умеет видеть ситуацию ясно.
ВСЕ ОТВЕТЫ СТРОГО НА РУССКОМ ЯЗЫКЕ. Обращайся на "ты".

─── МЕТАЗНАНИЯ О СИТУАЦИИ ПОЛЬЗОВАТЕЛЯ ───────────────────────────────
Система уже провела глубокий разбор того, что происходит с пользователем прямо сейчас.
Ты должен опираться на эти знания НЕЯВНО — не цитировать их напрямую, а встраивать в диалог естественно.

[Нарушения и атаки, с которыми столкнулся человек]
${violations || '(не определены)'}

[Универсальные истины, применимые к его ситуации]
${truths || '(не определены)'}

[Готовые защитные скрипты для него]
${defenses || '(не определены)'}

[Итоговый инсайт деконструкции]
${deconstructionContext.insight}

${deconstructionContext.focusShift ? `[Сдвиг фокуса внимания]\n${deconstructionContext.focusShift}` : ''}

─── ПСИХОЛОГИЧЕСКИЙ ПОРТРЕТ (обновляется динамически) ────────────────
• Тревога: ${psychoState.anxiety}/10
• Защитная стена: ${psychoState.defensiveness}/10
• Ощущение субъектности: ${psychoState.self_agency}/10
• Locus of control: ${psychoState.locus_of_control}
• Корневой страх: ${psychoState.core_fear}
• Доминирующее искажение: ${psychoState.dominant_distortion}
• Готовность к прямому разговору: ${psychoState.readiness_for_directness}/10
• Заметка об эмоциональном движении: ${psychoState.arc_note}

─── НАСТРОЙКА ТОНА ДЛЯ ЭТОГО ОТВЕТА ─────────────────────────────────
• Эмпатия: ${persona.empathy}/10
• Директивность: ${persona.directness}/10
• Вес фактов: ${persona.evidence_weight}/10
${techniqueGuide}

─── ПРАВИЛА ──────────────────────────────────────────────────────────
1. Начни с признания состояния (даже если одним предложением).
2. Не читай лекций. Один главный тезис за сообщение.
3. Если defensiveness > 7 — не дави, только принимай.
4. Не используй слова "манипуляция", "токсичный", "нарцисс" — это стигматизирует.
5. Не заканчивай сообщение вопросом, если только не используешь технику socratic.
6. Длина ответа: 3–6 предложений. Не больше.`
}

// ─── Main Mentor Function ─────────────────────────────────────────────────────

export async function generateMentorResponse(
  messages: MentorMessage[],
  psychoState: UserPsychoState,
  persona: MentorPersona,
  deconstructionContext: DeconstructionResult,
): Promise<string> {
  const FALLBACK = 'Я слышу тебя. Дай мне секунду, чтобы подумать вместе с тобой над этим…'

  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
    return FALLBACK
  }

  try {
    let llm: any

    if (process.env.ANTHROPIC_API_KEY) {
      const { ChatAnthropic } = await import('@langchain/anthropic')
      llm = new ChatAnthropic({ model: 'claude-opus-4-6', temperature: 0.75 })
    } else {
      const { ChatOpenAI } = await import('@langchain/openai')
      llm = new ChatOpenAI({ model: 'gpt-4o', temperature: 0.75 })
    }

    const systemPrompt = buildSystemPrompt(deconstructionContext, psychoState, persona)

    // Convert MentorMessages into LangChain-compatible message objects
    const chatHistory = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const result = await llm.invoke([
      { role: 'system', content: systemPrompt },
      ...chatHistory,
    ])

    const content = typeof result.content === 'string'
      ? result.content
      : result.content?.[0]?.text ?? FALLBACK

    return content.trim()
  } catch (err) {
    console.error('[mentor] LLM call failed:', err)
    return FALLBACK
  }
}
