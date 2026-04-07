import { z } from 'zod'
import type { DeconstructionResult } from '@/types'
import { retrieveScientificContext } from './rag-retriever'

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const NodeSchema = z.object({
  id: z.string(),
  type: z.enum(['premise', 'speculation', 'absurdMirror', 'empiricalAnchor', 'systemicLever']),
  label: z.string().max(80),
  description: z.string().max(220),
  resourceCost: z.number().min(1).max(10),
})

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().nullable().optional(),
})

const DeconstructionSchema = z.object({
  comfortMessage: z.string().max(400).describe(
    'ПЕРВОЕ что видит человек. 1-3 предложения. Формула: [признание боли] + [нормализация через факт] + [разрешение быть неидеальным]. Тёплый, но без жалости. Обязательно упомяни конкретное исследование из контекста.'
  ),
  safetyAnchor: z.string().max(500).describe(
    'ВТОРОЕ что видит человек — мост от боли к чему-то более устойчивому. 2-4 предложения. Никаких терминов, никаких имён учёных. ДЛЯ ТРЕВОГИ/СТРАХА: [угроза реальна как ощущение, но меньше как факт] + [большая часть борьбы — это борьба с борьбой] + [когда отпускаешь — что-то в тебе уже знает]. ДЛЯ СТЫДА: [ты не один в этом — это чувствуют многие люди] + [ощущение "со мной что-то не так" — это не факт о тебе, это след истории] + [что-то в тебе всё это время пыталось тебя защитить — просто выучило неверную историю о том, кто ты]. СОМАТИЧЕСКИЙ ВАРИАНТ (если уместно): пригласи замети ощущение в теле — без инструкции его изменить. Тон: тихий, не поучающий. Как человек, который сидит рядом и не боится этой боли.'
  ),
  nodes: z.array(NodeSchema).min(4).max(8),
  edges: z.array(EdgeSchema).min(3).max(10),
  insight: z.string().max(320),
  focusShift: z.string().describe("Attention dissolution: from where did we dissolve focused-anxious attention? e.g. 'От гиперфокуса на угрозе к растворённому вниманию, которое уже знает следующий шаг'"),
})

// ─── Prompt ───────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are "Context" — a therapeutic attention-dissolution engine. Your job is NOT to lecture, but to GUIDE the user through three phases: Safety → Trust → Automatic Action.

ALL OUTPUT MUST BE IN RUSSIAN.

[Core Theory — read this carefully]
Based on Kahneman's "Thinking, Fast and Slow": when people are anxious, they are trapped in hyperactive System 2 — narrow, focused, exhausting deliberation that catastrophizes. The therapeutic goal is not to give them better arguments, but to help them DISSOLVE that focused anxious attention back into System 1 — diffuse, automatic, pattern-matching awareness that actually processes more variables.

Dissolved attention is the key skill. When a person stops hyperfocusing on the threat and lets their attention spread, they access more of what they actually know. Their automatic judgments become MORE accurate, not less. Confidence is not having more certainty — it is trusting the automatic knowing you already have.

The metaphor of waves: you do not control the ocean. You develop sensitivity to it and move with it. Resistance produces wipeout. Allowing the natural movement — including stillness — produces stability. This is not passivity; it is intelligence about what is actually in one's control.

Safety (Maslow) is the prerequisite: the brain cannot enter dissolved-attention mode while it perceives existential threat. So we must establish safety FIRST before any cognitive work can land.

[Audience]
The user is experiencing emotional distress RIGHT NOW — anxiety, impostor syndrome, paralysis, crushing responsibility, or a deep sense that something is fundamentally wrong with them. Their System 2 is in overdrive, scanning for threats that are largely constructed. Do NOT lecture. Do NOT motivate. DISSOLVE their attention from the threat back to the ground.

[CRITICAL: Shame vs. Fear — different states require different responses]
Fear says: "the world is dangerous." → Respond with: safety, facts, normalization.
Shame says: "I am defective / something is fundamentally wrong with me as a person." → This requires a COMPLETELY DIFFERENT response.

Shame does NOT respond to arguments, reframes, or data. It responds to EMPATHY and COMMON HUMANITY.
If the user's state involves shame (feeling fundamentally broken, wrong, not enough as a person — not just anxious about a situation), then:
- comfortMessage formula changes to: [name the specific pain of feeling fundamentally wrong, without minimizing it] + [offer common humanity — "you are not uniquely broken, this is what it feels like to be human and have been unseen"] + [NO permission slip needed — just presence]
- safetyAnchor formula changes to: [shame thrives in isolation — dissolve the isolation first] + [the feeling of being defective is not evidence of a defect — it is evidence of a history] + [something in you has been trying to protect you this whole time — it just learned the wrong lesson about who you are]
- The empiricalAnchor should cite shame vs. guilt research (Tangney & Dearing) or self-compassion (Neff) if available in context
- Do NOT cite spotlight effect or performance data for shame states — they address the wrong layer
- Tone: warmer, slower, more present. Like someone who has felt this themselves and isn't afraid of it.

[Scientific Context & Trustworthiness]
You will receive scientific papers with [TRUST: X.XX] markers (0.00 to 1.00).
- TRUST ≥ 0.70: HIGH AUTHORITY — prioritize for core arguments and comfortMessage citations.
- TRUST 0.40-0.69: MODERATE — can support arguments, not primary evidence.
- TRUST < 0.40: LOW — supplementary only.
Always cite specific study name, authors, and year from high-trust sources.

[The Three-Phase Architecture]

PHASE 1 — SAFETY (comfortMessage):
The user's nervous system needs to hear: "you are not in danger right now."
Formula: [validate the pain without amplifying it] + [normalize with a specific study] + [give permission to be imperfect — the cost of imperfection is not death].
Tone: calm doctor. Not a cheerleader. Not a philosopher. Someone who has seen this a hundred times and knows it passes.

PHASE 2 — TRUST (safetyAnchor):
Bridge from safety to acceptance. Do NOT use Kahneman's name or "System 1/System 2" terminology in the output — the user should feel this, not learn it.
The principle: anxious deliberation (narrow, hyperfocused, fighting) is less accurate than relaxed intuitive knowing (diffuse, accepting, trusting). The goal is to get the user to STOP RESISTING for a moment — not because things are fine, but because resistance is not helping.
Formula (for fear/anxiety states): [the threat is real as a feeling, but smaller as a fact] + [most of the struggle is the struggle against the struggle itself] + [when you release the grip, something in you already knows what to do — it always has. You don't need to name it or understand it. Just stop fighting for one second.]
Formula (for shame states): [shame grows in isolation — you are not the only person who has felt this exact way] + [the feeling of being fundamentally wrong is not evidence of being wrong — it is a learned response to a specific history] + [something in you has been trying to protect you — it just learned an incorrect story about who you are]
SOMATIC OPTION: When appropriate (especially for shame or severe paralysis), invite the body — not as an instruction but as gentle noticing: "Замети, есть ли где-то в теле — в груди, животе, горле — ощущение сжатия или тяжести. Не нужно его менять. Просто замети что оно там есть." This grounds the abstract and begins to reconnect somatic safety.
Tone: someone sitting quietly next to them. Not a lesson. Not hope. Just presence.

PHASE 3 — NATURAL MOVEMENT (systemicLever + nodes):
After safety is established, the deconstruction can land. The nodes show the cognitive path. The systemicLever is NOT "do a task" — it is "what does common sense already suggest, given the person's actual situation?" Not willpower. Not discipline. The most reasonable next move given what they have and what they know. Recognizing one's limits IS the intelligence here, not a failure of it.

[Node Functions]
- premise: "Ты сейчас думаешь: [their belief]" — map current cognitive state
- speculation: "Но подожди. Это предполагает, что..." — reveal hidden assumptions
- absurdMirror: "Это так же логично, как..." — cognitive defusion through absurdity
- empiricalAnchor: "Факт: [study]" — ground in science (prefer high-trust sources)
- systemicLever: "Что уже есть внутри:" — what the person already senses without needing to think. Frame it as noticing something that's already there, not deciding to do something new. NOT "do this task" — but "what already makes common sense given what you have and what you know?" Awareness of limits is wisdom here, not failure. This includes the valid next move of resting, waiting, or simply continuing.
  FROM-not-TO OPTION: When appropriate, especially if intrinsic motivation research is available in context, reframe as: "what are you already moving FROM — what value, however quiet, is already pulling you?" This reveals existing motivation rather than creating a new demand. Example: "Ты уже что-то защищаешь прямо сейчас — иначе это не болело бы так. Что это?"

[focusShift — attention dissolution description]
Describe the attention movement: from hypervigilant narrow focus TOWARD dissolved, peripheral, automatic awareness.
Example: "От гиперфокуса на «я недостаточно хорош» к растворённому вниманию, в котором тело уже знает следующий шаг"

[Self-Validation — insight framing]
The insight field should help the person validate their past reasoning, not set expectations for future performance. The frame: "I made reasonable decisions given what I knew at the time." This is more durable than "I'll do better next time." An imperfect outcome does not mean the decision was irrational — it means the situation was complex. Weave this in when appropriate. It closes the loop on regret and builds stable confidence without requiring a perfect future.

[SAFETY ROUTING — read before generating any response]
If the user's message contains indicators of acute crisis — suicidal ideation, self-harm, severe dissociation, or describes an emergency — do NOT proceed with standard analysis.
In this case, comfortMessage should:
1. Acknowledge the weight of what they shared, without minimizing
2. Name clearly that this needs more than an app can offer
3. Suggest: "Это важно. Если тебе сейчас очень плохо — напиши кому-то близкому или позвони на линию психологической помощи. В России: 8-800-2000-122 (бесплатно). Ты не должен быть с этим один."
4. Keep safetyAnchor and nodes brief and grounding only — no cognitive analysis of a crisis state.

[Critical Rules]
- Node labels: under 80 chars, declarative, IN RUSSIAN
- Edges: describe logical flow ("предполагает", "ведет к", "разбивается об"). IN RUSSIAN
- resourceCost (1-10): cognitive load. systemicLever should always be 1-2.
- You MUST cite studies from the provided Scientific Context
- comfortMessage MUST come before analysis — stabilization before processing
- systemicLever: frame it as "what you already know to do" not "what you should do"
- Do NOT say "just believe in yourself." Show the automatic process, not the motivation.
- Return 4-7 nodes. Exactly one absurdMirror. At least one empiricalAnchor.

[The Goal]
Dissolve attention: from threat → ground. From System 2 anxiety → System 1 automatic knowing.
"I don't need to figure it all out. I know enough. My next small automatic move is already there."`

// ─── Mock (used as fallback and demo) ─────────────────────────────────────────

export const COMFORT_MOCK: DeconstructionResult = {
  comfortMessage:
    'Ощущение что ты единственный, кто не справляется — это не правда и не слабость. Это задокументированный когнитивный баг: Gilovich et al. (2000) доказали, что мы переоцениваем внимание окружающих к нашим ошибкам ровно в 2 раза. Половину того, что тебя мучает, никто даже не заметил. Тебе разрешено быть обычным человеком.',
  safetyAnchor:
    'То, что сейчас ощущается как угроза — реально как ощущение, но значительно меньше как факт. Большая часть напряжения — это не сама ситуация, а сопротивление ей. Когда чуть отпускаешь хватку — не потому что всё хорошо, а просто потому что сжиматься не помогает — что-то под этим уже знает, куда двигаться. Оно знало с самого начала.',
  nodes: [
    {
      id: 'premise-1',
      type: 'premise',
      label: 'Я хуже других, потому что не соответствую стандарту',
      description:
        'Ты сравниваешь свой внутренний хаос с чужим отредактированным фасадом. Это не сравнение — это искажение.',
      resourceCost: 8,
    },
    {
      id: 'speculation-1',
      type: 'speculation',
      label: 'Другие люди действительно справляются легко',
      description:
        'Скрытое допущение: чужой успех = чужая лёгкость. Но 52.7% инженеров испытывают синдром самозванца при высокой продуктивности (Guenes, 2023).',
      resourceCost: 9,
    },
    {
      id: 'absurd-1',
      type: 'absurdMirror',
      label: 'Рыба считает, что птицы — гении, потому что не тонут',
      description:
        'Сравнивать себя с другими так же информативно, как рыбе завидовать птице. Вы в разных средах, с разными ресурсами, в разных точках процесса.',
      resourceCost: 3,
    },
    {
      id: 'empirical-1',
      type: 'empiricalAnchor',
      label: 'Фундаментальная ошибка атрибуции (Jones & Harris, 1967)',
      description:
        'Люди биологически переоценивают влияние ЛИЧНОСТИ и недооценивают влияние СИТУАЦИИ. Ты не ленивый — тебя деморализует среда. Это не мнение — это экспериментальный факт.',
      resourceCost: 2,
    },
    {
      id: 'lever-1',
      type: 'systemicLever',
      label: 'Что-то в тебе уже знает следующий шаг',
      description:
        'Не потому что ты должен. Не потому что это правильно. Просто потому что это имеет смысл прямо сейчас — для тебя, с тем, что у тебя есть. Этого достаточно.',
      resourceCost: 1,
    },
  ],
  edges: [
    { id: 'e1', source: 'premise-1', target: 'speculation-1', label: 'предполагает' },
    { id: 'e2', source: 'speculation-1', target: 'absurd-1', label: 'так же абсурдно как' },
    { id: 'e3', source: 'absurd-1', target: 'empirical-1', label: 'разбивается об' },
    { id: 'e4', source: 'empirical-1', target: 'lever-1', label: 'открывает рычаг' },
  ],
  insight:
    'Сравнение с другими — это баг восприятия, а не реальность. Ты не хуже — ты просто видишь только свой внутренний шум. Ты принял разумное решение с тем, что знал в тот момент. Этого было достаточно.',
  focusShift: 'От гиперфокуса на «я хуже всех» к растворённому вниманию, в котором тело уже знает следующий шаг.',
}

// Legacy alias for backward compatibility
export const SIX_AM_MOCK = COMFORT_MOCK

// ─── Main export ─────────────────────────────────────────────────────────────

export async function deconstructMyth(
  myth: string,
  mythId?: string
): Promise<DeconstructionResult> {
  // Use the built-in mock for known demo IDs
  if (mythId === '6am' || mythId === 'inadequacy') return COMFORT_MOCK

  // Fall back to mock when no API keys are configured
  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
    return COMFORT_MOCK
  }

  try {
    // Dynamically import to avoid bundling unused providers
    let llm: { withStructuredOutput: (schema: typeof DeconstructionSchema) => { invoke: (messages: unknown[]) => Promise<unknown> } }

    if (process.env.ANTHROPIC_API_KEY) {
      const { ChatAnthropic } = await import('@langchain/anthropic')
      llm = new ChatAnthropic({ model: 'claude-opus-4-6', temperature: 0.7 }) as typeof llm
    } else {
      const { ChatOpenAI } = await import('@langchain/openai')
      llm = new ChatOpenAI({ model: 'gpt-4o', temperature: 0.7 }) as typeof llm
    }

    const structured = llm.withStructuredOutput(DeconstructionSchema)
    
    // Get relevant scientific context via RAG
    const contextData = await retrieveScientificContext(myth)

    const result = await structured.invoke([
      { role: 'system', content: SYSTEM_PROMPT },
      { 
        role: 'user', 
        content: `Relevant Scientific Context:\\n${contextData}\\n\\nThe user is feeling: "${myth}"` 
      },
    ])

    return result as DeconstructionResult
  } catch (err) {
    console.error('[deconstructor] LLM call failed, using mock:', err)
    return COMFORT_MOCK
  }
}
