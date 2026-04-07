export type NodeType = 'premise' | 'speculation' | 'absurdMirror' | 'empiricalAnchor' | 'systemicLever'

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
