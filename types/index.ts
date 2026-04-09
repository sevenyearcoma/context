export type NodeType = 'violation' | 'resultBias' | 'systemicTruth' | 'boundaryDefense'

export interface DeconstructionNode {
  id: string
  type: NodeType
  label: string
  description: string
  resourceCost: number
}

export interface DeconstructionEdge {
  id: string
  source: string
  target: string
  label?: string
}

export interface DeconstructionResult {
  nodes: DeconstructionNode[]
  edges: DeconstructionEdge[]
  insight: string
  focusShift?: string
  comfortMessage: string
  /** Kahneman/Maslow safety beat: why the world is safer than it feels + why automatic knowing is trustworthy */
  safetyAnchor?: string
}

// Emotional states replace myths as entry points
export interface EmotionalState {
  id: string
  feeling: string
  subtext: string
  category: 'inadequacy' | 'paralysis' | 'pressure' | 'shame'
  /** Hidden prompt sent to the LLM — the user never sees this */
  hiddenMyth: string
}

// Legacy alias — keeps History/Archives working
export interface Myth {
  id: string
  title: string
  subtitle: string
  category: 'productivity' | 'spiritual' | 'identity' | 'social'
}

// ─── Adaptive Mentor Types ────────────────────────────────────────────────────

/**
 * Semantic State Vector — a living snapshot of the user's psychological state.
 * Updated by the LLM after EVERY user message.
 * Axes range 1–10 unless noted.
 */
export interface UserPsychoState {
  /** Overall anxiety level right now */
  anxiety: number
  /** How much the user is defending their current beliefs (1=open, 10=fortified) */
  defensiveness: number
  /** Internal / External locus of control */
  locus_of_control: 'internal' | 'external' | 'mixed'
  /** Does the user feel like the victim or an agent? */
  self_agency: number
  /** Core fear pattern visible in the conversation */
  core_fear: string
  /** Dominant cognitive distortion in play */
  dominant_distortion: 'result_bias' | 'catastrophizing' | 'mind_reading' | 'should_statements' | 'overgeneralizing' | 'personalization' | 'none'
  /** How ready is user to hear direct feedback? (1=needs warmth, 10=ready for logic) */
  readiness_for_directness: number
  /** Short freetext note the LLM adds to describe the user's current emotional arc */
  arc_note: string
}

/**
 * Mentor Persona — the mirror image of UserPsychoState.
 * Computed dynamically from the user state to tune the mentor's tone for each reply.
 */
export interface MentorPersona {
  /** Weight on validation & warmth (1–10) */
  empathy: number
  /** Weight on logical argument / Socratic questioning (1–10) */
  directness: number
  /** Weight on scientific evidence / facts (1–10) */
  evidence_weight: number
  /** Active technique for this response */
  technique: 'validation' | 'socratic' | 'reframing' | 'psychoeducation' | 'behavioral_experiment' | 'boundary_script'
}

/**
 * A single message in the mentor chat history.
 */
export interface MentorMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  /** Snapshot of psycho state AFTER this user message was processed (only on user messages) */
  psychoStateSnapshot?: UserPsychoState
}
