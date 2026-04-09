'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogicFlow } from '@/components/canvas/LogicFlow'
import { MentorChat } from '@/components/ui/MentorChat'
import { EMOTIONAL_STATES } from '@/lib/emotional-states'
import type { EmotionalState, Myth, DeconstructionResult, DeconstructionNode } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────
const EASE = [0.25, 0.1, 0.25, 1] as const
const STORAGE_KEY = 'context-history'

// ─── Types ────────────────────────────────────────────────────────────────────
interface HistoryEntry {
  id: string
  myth: Myth
  graphData: DeconstructionResult
  timestamp: number
  archived: boolean
}

type ViewState = 'home' | 'loading' | 'journey' | 'canvas' | 'history' | 'archives' | 'mindmap' | 'mentor'

const STATE_COLOR: Record<EmotionalState['category'], string> = {
  inadequacy: 'rgba(255,248,244,0.85)',
  paralysis: '#8da0b1',
  pressure: 'rgba(238,195,100,0.9)',
  shame: 'rgba(180,165,200,0.85)',
}

const STATE_ICON: Record<EmotionalState['category'], string> = {
  inadequacy: '◇',
  paralysis: '○',
  pressure: '△',
  shame: '▽',
}

// Legacy colors for history entries
const CATEGORY_COLOR: Record<string, string> = {
  productivity: '#b3ccbf',
  spiritual: '#8da0b1',
  identity: 'rgba(255,248,244,0.85)',
  social: 'rgba(238,195,100,0.9)',
  inadequacy: 'rgba(255,248,244,0.85)',
  paralysis: '#8da0b1',
  pressure: 'rgba(238,195,100,0.9)',
  shame: 'rgba(180,165,200,0.85)',
}

const CATEGORY_LABEL: Record<string, string> = {
  productivity: 'Продуктивность',
  spiritual: 'Духовность',
  identity: 'Личность',
  social: 'Общество',
  inadequacy: 'Неполноценность',
  paralysis: 'Паралич',
  pressure: 'Давление',
  shame: 'Стыд',
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Только что'
  if (mins < 60) return `${mins}м назад`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}ч назад`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Вчера'
  return `${days}д назад`
}

// ─── Sidebar helpers ──────────────────────────────────────────────────────────
function NavItem({
  label,
  active,
  disabled = false,
  onClick,
}: {
  label: string
  active: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '8px 12px',
        background: active ? 'rgba(179,204,191,0.08)' : 'transparent',
        border: 'none',
        borderRadius: 2,
        cursor: disabled ? 'default' : 'pointer',
        marginBottom: 2,
        textAlign: 'left',
        opacity: disabled ? 0.3 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div
        style={{
          width: 4,
          height: 4,
          background: active ? '#b3ccbf' : 'rgba(166,172,178,0.3)',
          flexShrink: 0,
          transition: 'background 0.4s ease',
        }}
      />
      <span
        style={{
          fontSize: 12,
          color: active ? '#b3ccbf' : 'rgba(224,230,237,0.45)',
          fontFamily: 'var(--font-inter), sans-serif',
          letterSpacing: '0.04em',
          transition: 'color 0.4s ease',
        }}
      >
        {label}
      </span>
    </button>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({
  view,
  graphData,
  entries,
  onNavigate,
  onOpenEntry,
}: {
  view: ViewState
  graphData: DeconstructionResult | null
  entries: HistoryEntry[]
  onNavigate: (v: ViewState) => void
  onOpenEntry: (e: HistoryEntry) => void
}) {
  const recent = entries.filter(e => !e.archived).slice(0, 3)

  return (
    <div
      style={{
        width: 220,
        background: '#111416',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        padding: '32px 0',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 5, height: 5, background: '#b3ccbf', flexShrink: 0 }} />
          <span
            style={{
              fontSize: 10,
              letterSpacing: '0.28em',
              color: '#e0e6ed',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-inter), sans-serif',
              fontWeight: 500,
            }}
          >
            Контекст
          </span>
        </div>
        <p
          style={{
            fontSize: 10,
            color: 'rgba(166,172,178,0.45)',
            letterSpacing: '0.04em',
            fontFamily: 'var(--font-inter), sans-serif',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          мир безопаснее, чем кажется
        </p>
      </div>

      <div style={{ height: 1, background: 'rgba(66,73,78,0.22)', margin: '0 24px 20px' }} />

      {/* Navigation */}
      <div style={{ padding: '0 12px' }}>
        <p
          style={{
            fontSize: 8,
            letterSpacing: '0.2em',
            color: 'rgba(166,172,178,0.35)',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-inter), sans-serif',
            padding: '0 12px',
            marginBottom: 8,
          }}
        >
          Разделы
        </p>
        <NavItem
          label="Главная"
          active={view === 'home' || view === 'loading'}
          onClick={() => onNavigate('home')}
        />
        <NavItem
          label="Путь"
          active={view === 'journey'}
          disabled={!graphData}
          onClick={() => graphData && onNavigate('journey')}
        />
        <NavItem
          label="Карта логики"
          active={view === 'canvas'}
          disabled={!graphData}
          onClick={() => graphData && onNavigate('canvas')}
        />
        <NavItem
          label="Ментор"
          active={view === 'mentor'}
          disabled={!graphData}
          onClick={() => graphData && onNavigate('mentor')}
        />
        <NavItem
          label="Mind Map"
          active={view === 'mindmap'}
          disabled={entries.length === 0}
          onClick={() => entries.length > 0 && onNavigate('mindmap')}
        />
        <NavItem
          label="История"
          active={view === 'history'}
          onClick={() => onNavigate('history')}
        />
        <NavItem
          label="Архив"
          active={view === 'archives'}
          onClick={() => onNavigate('archives')}
        />
      </div>

      {/* Recent insights */}
      {recent.length > 0 && (
        <div style={{ padding: '20px 12px 0' }}>
          <div style={{ height: 1, background: 'rgba(66,73,78,0.18)', margin: '0 12px 16px' }} />
          <p
            style={{
              fontSize: 8,
              letterSpacing: '0.2em',
              color: 'rgba(166,172,178,0.35)',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-inter), sans-serif',
              padding: '0 12px',
              marginBottom: 8,
            }}
          >
            Недавние
          </p>
          {recent.map(entry => (
            <button
              key={entry.id}
              onClick={() => onOpenEntry(entry)}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                borderRadius: 2,
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: 2,
                transition: 'background 0.3s ease',
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.background = 'rgba(179,204,191,0.05)')
              }
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <p
                style={{
                  fontSize: 11,
                  color: 'rgba(224,230,237,0.55)',
                  fontFamily: 'var(--font-inter), sans-serif',
                  lineHeight: 1.4,
                  marginBottom: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 172,
                }}
              >
                {entry.myth.title}
              </p>
              <p
                style={{
                  fontSize: 9,
                  color: 'rgba(166,172,178,0.35)',
                  fontFamily: 'var(--font-inter), sans-serif',
                  letterSpacing: '0.04em',
                }}
              >
                {formatTime(entry.timestamp)}
              </p>
            </button>
          ))}
        </div>
      )}

      <div style={{ flex: 1 }} />
      <div style={{ height: 1, background: 'rgba(66,73,78,0.22)', margin: '0 24px 20px' }} />
      <p
        style={{
          fontSize: 9,
          color: 'rgba(166,172,178,0.22)',
          letterSpacing: '0.08em',
          padding: '0 24px',
          fontFamily: 'var(--font-inter), sans-serif',
        }}
      >
        Reductio ad Absurdum
      </p>
    </div>
  )
}

// ─── Home View ────────────────────────────────────────────────────────────────
function HomeView({
  onSelect,
  onCustom,
  error,
}: {
  onSelect: (s: EmotionalState) => void
  onCustom: (text: string) => void
  error: string | null
}) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [states, setStates] = useState<EmotionalState[]>(EMOTIONAL_STATES)
  const [statesKey, setStatesKey] = useState(0)

  useEffect(() => {
    fetch('/api/suggestions')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setStates(data)
          setStatesKey(k => k + 1)
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = () => {
    const text = input.trim()
    if (!text) return
    onCustom(text)
    setInput('')
  }

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.8, ease: EASE }}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ flex: 1, overflowY: 'auto', padding: '48px 48px 24px' }}>
        {/* Empathetic greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          style={{ marginBottom: 48, maxWidth: 560 }}
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            style={{
              fontSize: 24,
              fontWeight: 300,
              letterSpacing: '0.02em',
              color: '#e0e6ed',
              fontFamily: 'var(--font-inter), sans-serif',
              margin: '0 0 16px',
              lineHeight: 1.5,
            }}
          >
            Иногда всё кажется невозможным.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.6 }}
            style={{
              fontSize: 14,
              color: 'rgba(166,172,178,0.6)',
              fontFamily: 'var(--font-inter), sans-serif',
              fontWeight: 300,
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            Это не слабость — это перегруз системы.
            <br />
            Что из этого ближе к тому, что происходит прямо сейчас?
          </motion.p>
        </motion.div>

        {/* Emotional state cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 32,
            maxWidth: 560,
          }}
        >
          {states.map((state, i) => (
            <motion.button
              key={`${statesKey}-${state.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: statesKey === 0 ? 1.0 + i * 0.15 : i * 0.12, ease: EASE }}
              onClick={() => onSelect(state)}
              whileHover={{
                borderColor: STATE_COLOR[state.category],
                x: 4,
              }}
              whileTap={{ scale: 0.995 }}
              style={{
                background: 'rgba(37,45,51,0.35)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(66,73,78,0.25)',
                borderRadius: '0.75rem',
                padding: '22px 28px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'border-color 0.4s ease, background 0.4s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  color: STATE_COLOR[state.category],
                  opacity: 0.6,
                  flexShrink: 0,
                  width: 28,
                  textAlign: 'center',
                }}
              >
                {STATE_ICON[state.category]}
              </span>
              <div>
                <p
                  style={{
                    fontSize: 14,
                    color: '#e0e6ed',
                    fontFamily: 'var(--font-inter), sans-serif',
                    lineHeight: 1.5,
                    marginBottom: 4,
                    fontWeight: 400,
                    letterSpacing: '0.01em',
                  }}
                >
                  {state.feeling}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: 'rgba(166,172,178,0.45)',
                    fontFamily: 'var(--font-inter), sans-serif',
                    letterSpacing: '0.03em',
                    lineHeight: 1.5,
                  }}
                >
                  {state.subtext}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {error && (
          <p
            style={{
              fontSize: 10,
              color: 'rgba(238,125,119,0.7)',
              letterSpacing: '0.08em',
              fontFamily: 'var(--font-inter), sans-serif',
            }}
          >
            {error}
          </p>
        )}
      </div>

      {/* Chat input bar */}
      <div
        style={{
          padding: '18px 48px 22px',
          background: 'rgba(17,20,22,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(66,73,78,0.2)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', maxWidth: 560 }}>
          <div
            style={{
              flex: 1,
              background: '#1b2025',
              borderRadius: '0.5rem',
              padding: '11px 18px',
              display: 'flex',
              alignItems: 'center',
              border: '1px solid rgba(66,73,78,0.35)',
              transition: 'border-color 0.3s ease',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Или опиши своими словами, что ты чувствуешь…"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#e0e6ed',
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: 13,
                letterSpacing: '0.03em',
              }}
            />
          </div>
          <button
            onClick={handleSubmit}
            style={{
              background: '#b3ccbf',
              border: 'none',
              borderRadius: '0.5rem',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              opacity: input.trim() ? 1 : 0.35,
              transition: 'opacity 0.3s ease',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M7.5 13V2M2 7.5l5.5-5.5 5.5 5.5"
                stroke="#2e453b"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <p
          style={{
            fontSize: 9,
            color: 'rgba(166,172,178,0.28)',
            fontFamily: 'var(--font-inter), sans-serif',
            letterSpacing: '0.06em',
            marginTop: 10,
          }}
        >
          Всё остаётся на твоём устройстве — анонимно и локально
        </p>
      </div>
    </motion.div>
  )
}

// ─── Loading View ─────────────────────────────────────────────────────────────
function LoadingView() {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          fontSize: 14,
          letterSpacing: '0.03em',
          color: 'rgba(224,230,237,0.5)',
          fontFamily: 'var(--font-inter), sans-serif',
          fontWeight: 300,
          marginBottom: 8,
          textAlign: 'center',
          lineHeight: 1.7,
        }}
      >
        Подожди немного…
      </motion.p>
      <p
        style={{
          fontSize: 11,
          color: 'rgba(166,172,178,0.3)',
          fontFamily: 'var(--font-inter), sans-serif',
          letterSpacing: '0.06em',
          marginBottom: 32,
        }}
      >
        Подбираем исследования под твою ситуацию
      </p>

      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 0.22, 0.44].map(delay => (
          <motion.div
            key={delay}
            style={{ width: 3, height: 3, background: '#b3ccbf', borderRadius: 1 }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.3, delay, repeat: Infinity }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ─── Journey Step Types ───────────────────────────────────────────────────────
interface JourneyStepData {
  id: string
  type: 'comfort' | 'safetyAnchor' | 'violation' | 'resultBias' | 'systemicTruth' | 'boundaryDefense' | 'complete'
  prefix: string
  title: string
  body: string
  color: string
  accentColor: string
}

function buildJourneySteps(data: DeconstructionResult): JourneyStepData[] {
  const steps: JourneyStepData[] = []

  // Step 0: Comfort message — stabilization
  steps.push({
    id: 'comfort',
    type: 'comfort',
    prefix: '',
    title: '',
    body: data.comfortMessage || data.insight,
    color: 'rgba(179,204,191,0.9)',
    accentColor: 'rgba(179,204,191,0.2)',
  })

  // Step 1: Safety anchor — Kahneman/Maslow grounding
  if (data.safetyAnchor) {
    steps.push({
      id: 'safety-anchor',
      type: 'safetyAnchor',
      prefix: '',
      title: '',
      body: data.safetyAnchor,
      color: 'rgba(141,160,177,0.9)',
      accentColor: 'rgba(141,160,177,0.1)',
    })
  }

  // Steps 2-N: Nodes in narrative order
  const typeOrder = ['violation', 'resultBias', 'systemicTruth', 'boundaryDefense'] as const
  const prefixes: Record<string, string> = {
    violation: 'Столкновение:',
    resultBias: 'Искажение контекста:',
    systemicTruth: 'Универсальная Истина:',
    boundaryDefense: 'Отпор:',
  }
  const colors: Record<string, string> = {
    violation: 'rgba(239,68,68,0.7)',
    resultBias: 'rgba(245,158,11,0.7)',
    systemicTruth: 'rgba(56,189,248,0.7)',
    boundaryDefense: 'rgba(34,197,94,0.7)',
  }
  const accents: Record<string, string> = {
    violation: 'rgba(239,68,68,0.25)',
    resultBias: 'rgba(245,158,11,0.25)',
    systemicTruth: 'rgba(56,189,248,0.25)',
    boundaryDefense: 'rgba(34,197,94,0.25)',
  }

  for (const t of typeOrder) {
    const nodesOfType = data.nodes.filter((n: DeconstructionNode) => n.type === t)
    for (const node of nodesOfType) {
      steps.push({
        id: node.id,
        type: t,
        prefix: prefixes[t] || '',
        title: node.label,
        body: node.description,
        color: colors[t] || '#e0e6ed',
        accentColor: accents[t] || 'rgba(179,204,191,0.15)',
      })
    }
  }

  // Completion step
  steps.push({
    id: 'complete',
    type: 'complete',
    prefix: '',
    title: '',
    body: data.insight,
    color: '#e0e6ed',
    accentColor: 'rgba(179,204,191,0.08)',
  })

  return steps
}

// ─── Journey View ─────────────────────────────────────────────────────────────
function JourneyView({
  data,
  onShowGraph,
  onShowMentor,
}: {
  data: DeconstructionResult
  onShowGraph: () => void
  onShowMentor: () => void
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const steps = buildJourneySteps(data)
  const step = steps[currentStep]
  const isLast = currentStep === steps.length - 1
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = useCallback(() => {
    if (!isLast) setCurrentStep(prev => prev + 1)
  }, [isLast])

  const handleBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }, [currentStep])

  return (
    <motion.div
      key="journey"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          height: 2,
          background: 'rgba(66,73,78,0.3)',
          flexShrink: 0,
        }}
      >
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{
            height: '100%',
            background: 'rgba(179,204,191,0.5)',
          }}
        />
      </div>

      {/* Step counter */}
      <div style={{ padding: '20px 48px 0', flexShrink: 0 }}>
        <p
          style={{
            fontSize: 9,
            letterSpacing: '0.2em',
            color: 'rgba(166,172,178,0.3)',
            fontFamily: 'var(--font-inter), sans-serif',
            textTransform: 'uppercase',
          }}
        >
          {currentStep + 1} / {steps.length}
        </p>
      </div>

      {/* Step content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 48px',
          overflow: 'hidden',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{
              maxWidth: 560,
              width: '100%',
            }}
          >
            {/* Comfort step — special: warm, full-width, no prefix */}
            {step.type === 'comfort' && (
              <div style={{ padding: '40px 0' }}>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
                  style={{
                    width: 32,
                    height: 2,
                    background: 'rgba(179,204,191,0.3)',
                    marginBottom: 28,
                    transformOrigin: 'left',
                  }}
                />
                <p
                  style={{
                    fontSize: 16,
                    color: 'rgba(224,230,237,0.8)',
                    fontFamily: 'var(--font-inter), sans-serif',
                    fontWeight: 300,
                    lineHeight: 1.9,
                    letterSpacing: '0.01em',
                  }}
                >
                  {step.body}
                </p>
              </div>
            )}

            {/* Safety anchor — resistance/acceptance beat, no labels */}
            {step.type === 'safetyAnchor' && (
              <div style={{ padding: '48px 0 40px' }}>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.4, delay: 0.1 }}
                  style={{
                    fontSize: 16,
                    color: 'rgba(200,214,228,0.65)',
                    fontFamily: 'var(--font-inter), sans-serif',
                    fontWeight: 300,
                    lineHeight: 2.1,
                    letterSpacing: '0.015em',
                    margin: 0,
                  }}
                >
                  {step.body}
                </motion.p>
              </div>
            )}

            {/* Narrative steps */}
            {step.type !== 'comfort' && step.type !== 'safetyAnchor' && step.type !== 'complete' && (
              <div
                style={{
                  padding: '32px 36px',
                  background: '#161a1e',
                  borderRadius: '0.75rem',
                  border: `1px solid ${step.accentColor}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                {step.prefix && (
                  <p
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.15em',
                      color: 'rgba(166,172,178,0.45)',
                      fontFamily: 'var(--font-inter), sans-serif',
                      textTransform: 'uppercase',
                      marginBottom: 16,
                    }}
                  >
                    {step.prefix}
                  </p>
                )}
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 400,
                    color: step.color,
                    letterSpacing: '0.01em',
                    lineHeight: 1.6,
                    fontFamily: 'var(--font-inter), sans-serif',
                    marginBottom: 14,
                  }}
                >
                  {step.title}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: 'rgba(166,172,178,0.6)',
                    lineHeight: 1.75,
                    fontFamily: 'var(--font-inter), sans-serif',
                    letterSpacing: '0.02em',
                  }}
                >
                  {step.body}
                </p>
              </div>
            )}

            {/* Completion step */}
            {step.type === 'complete' && (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
                  style={{
                    width: 40,
                    height: 2,
                    background: 'rgba(179,204,191,0.3)',
                    margin: '0 auto 28px',
                    transformOrigin: 'center',
                  }}
                />
                <p
                  style={{
                    fontSize: 15,
                    color: 'rgba(224,230,237,0.65)',
                    fontFamily: 'var(--font-inter), sans-serif',
                    fontWeight: 300,
                    fontStyle: 'italic',
                    lineHeight: 1.8,
                    letterSpacing: '0.02em',
                    maxWidth: 480,
                    margin: '0 auto 36px',
                  }}
                >
                  {step.body}
                </p>

                {data.focusShift && (
                  <p
                    style={{
                      fontSize: 11,
                      color: 'rgba(141,160,177,0.35)',
                      fontFamily: 'var(--font-inter), sans-serif',
                      letterSpacing: '0.04em',
                      lineHeight: 1.6,
                      marginBottom: 36,
                      fontStyle: 'italic',
                    }}
                  >
                    {data.focusShift}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={onShowMentor}
                    style={{
                      background: 'rgba(179,204,191,0.15)',
                      border: '1px solid rgba(179,204,191,0.3)',
                      borderRadius: '0.5rem',
                      padding: '12px 28px',
                      cursor: 'pointer',
                      fontSize: 11,
                      color: '#b3ccbf',
                      letterSpacing: '0.1em',
                      fontFamily: 'var(--font-inter), sans-serif',
                      transition: 'background 0.3s ease',
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.background = 'rgba(179,204,191,0.25)')
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.background = 'rgba(179,204,191,0.15)')
                    }
                  >
                    Поговорить с ментором →
                  </button>
                  <button
                    onClick={onShowGraph}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(66,73,78,0.35)',
                      borderRadius: '0.5rem',
                      padding: '12px 28px',
                      cursor: 'pointer',
                      fontSize: 11,
                      color: 'rgba(166,172,178,0.5)',
                      letterSpacing: '0.1em',
                      fontFamily: 'var(--font-inter), sans-serif',
                      transition: 'background 0.3s ease',
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.background = 'rgba(66,73,78,0.12)')
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.background = 'transparent')
                    }
                  >
                    Карта логики
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div
        style={{
          padding: '18px 48px 28px',
          display: 'flex',
          gap: 12,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleBack}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: currentStep > 0 ? 'pointer' : 'default',
            opacity: currentStep > 0 ? 0.5 : 0,
            fontSize: 11,
            color: 'rgba(166,172,178,0.6)',
            fontFamily: 'var(--font-inter), sans-serif',
            letterSpacing: '0.08em',
            padding: '10px 16px',
            transition: 'opacity 0.3s ease',
          }}
        >
          ← Назад
        </button>

        {!isLast && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            style={{
              background: step.type === 'comfort'
                ? 'rgba(179,204,191,0.15)'
                : 'rgba(179,204,191,0.1)',
              border: '1px solid rgba(179,204,191,0.2)',
              borderRadius: '0.5rem',
              padding: '12px 32px',
              cursor: 'pointer',
              fontSize: 12,
              color: '#b3ccbf',
              letterSpacing: '0.06em',
              fontFamily: 'var(--font-inter), sans-serif',
              transition: 'background 0.3s ease',
            }}
          >
            {step.type === 'comfort' ? 'Покажи, почему →' : step.type === 'boundaryDefense' ? 'Есть смысл →' : 'Дальше →'}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

// ─── Canvas View ──────────────────────────────────────────────────────────────
function CanvasView({ data, onBack }: { data: DeconstructionResult; onBack: () => void }) {
  return (
    <motion.div
      key="canvas"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: EASE }}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: '18px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(12,14,16,0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(66,73,78,0.18)',
        }}
      >
        <div>
          <p
            style={{
              fontSize: 8,
              letterSpacing: '0.22em',
              color: 'rgba(166,172,178,0.45)',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-inter), sans-serif',
              marginBottom: 3,
            }}
          >
            Карта логики
          </p>
          <p
            style={{
              fontSize: 12,
              letterSpacing: '0.04em',
              color: 'rgba(224,230,237,0.6)',
              fontFamily: 'var(--font-inter), sans-serif',
              fontWeight: 300,
            }}
          >
            Полная структура разбора
          </p>
        </div>
        <button
          onClick={onBack}
          style={{
            padding: '6px 16px',
            background: 'rgba(179,204,191,0.08)',
            border: '1px solid rgba(179,204,191,0.15)',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: 10,
            color: '#b3ccbf',
            letterSpacing: '0.1em',
            fontFamily: 'var(--font-inter), sans-serif',
            pointerEvents: 'auto',
          }}
        >
          ← Вернуться к пути
        </button>
      </div>

      <LogicFlow data={data} />

      {/* Insight panel */}
      {data.insight && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.9, ease: EASE }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            padding: '18px 40px',
            background: 'rgba(17,20,22,0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(66,73,78,0.2)',
            pointerEvents: 'none',
          }}
        >
          <p
            style={{
              fontSize: 7,
              letterSpacing: '0.22em',
              color: '#b3ccbf',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-inter), sans-serif',
              marginBottom: 7,
            }}
          >
            Эмпирический вывод
          </p>
          <p
            style={{
              fontSize: 12,
              color: 'rgba(224,230,237,0.5)',
              fontFamily: 'var(--font-inter), sans-serif',
              fontWeight: 300,
              fontStyle: 'italic',
              letterSpacing: '0.04em',
              lineHeight: 1.7,
              maxWidth: 720,
            }}
          >
            {data.insight}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── History Entry Card ───────────────────────────────────────────────────────
function EntryCard({
  entry,
  index,
  onOpen,
  onToggleArchive,
}: {
  entry: HistoryEntry
  index: number
  onOpen: (e: HistoryEntry) => void
  onToggleArchive: (id: string) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: EASE }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '18px 20px',
        background: 'rgba(37,45,51,0.35)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(66,73,78,0.25)',
        borderRadius: '0.5rem',
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: 2,
          background: CATEGORY_COLOR[entry.myth.category] || '#b3ccbf',
          flexShrink: 0,
          opacity: 0.8,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            color: '#e0e6ed',
            fontFamily: 'var(--font-inter), sans-serif',
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {entry.myth.title}
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span
            style={{
              fontSize: 9,
              color: CATEGORY_COLOR[entry.myth.category] || '#b3ccbf',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-inter), sans-serif',
              opacity: 0.75,
            }}
          >
            {CATEGORY_LABEL[entry.myth.category] || entry.myth.category}
          </span>
          <span
            style={{
              fontSize: 9,
              color: 'rgba(166,172,178,0.4)',
              fontFamily: 'var(--font-inter), sans-serif',
              letterSpacing: '0.04em',
            }}
          >
            {formatTime(entry.timestamp)}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => onOpen(entry)}
          style={{
            padding: '6px 14px',
            background: 'rgba(179,204,191,0.1)',
            border: '1px solid rgba(179,204,191,0.2)',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: 10,
            color: '#b3ccbf',
            letterSpacing: '0.1em',
            fontFamily: 'var(--font-inter), sans-serif',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={e =>
            (e.currentTarget.style.background = 'rgba(179,204,191,0.18)')
          }
          onMouseLeave={e =>
            (e.currentTarget.style.background = 'rgba(179,204,191,0.1)')
          }
        >
          ОТКРЫТЬ
        </button>
        <button
          onClick={() => onToggleArchive(entry.id)}
          style={{
            padding: '6px 14px',
            background: 'transparent',
            border: '1px solid rgba(66,73,78,0.35)',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: 10,
            color: 'rgba(166,172,178,0.5)',
            letterSpacing: '0.1em',
            fontFamily: 'var(--font-inter), sans-serif',
            transition: 'border-color 0.3s ease, color 0.3s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(166,172,178,0.5)'
            e.currentTarget.style.color = 'rgba(224,230,237,0.7)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(66,73,78,0.35)'
            e.currentTarget.style.color = 'rgba(166,172,178,0.5)'
          }}
        >
          {entry.archived ? 'ВЕРНУТЬ' : 'В АРХИВ'}
        </button>
      </div>
    </motion.div>
  )
}

// ─── History View ─────────────────────────────────────────────────────────────
function HistoryView({
  entries,
  onOpen,
  onToggleArchive,
}: {
  entries: HistoryEntry[]
  onOpen: (e: HistoryEntry) => void
  onToggleArchive: (id: string) => void
}) {
  const items = entries.filter(e => !e.archived)

  return (
    <motion.div
      key="history"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '48px 48px 40px' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{ marginBottom: 32 }}
      >
        <p
          style={{
            fontSize: 8,
            letterSpacing: '0.28em',
            color: 'rgba(166,172,178,0.4)',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-inter), sans-serif',
            marginBottom: 10,
          }}
        >
          Запись сессии
        </p>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 300,
            letterSpacing: '0.04em',
            color: '#e0e6ed',
            fontFamily: 'var(--font-inter), sans-serif',
            margin: '0 0 8px',
          }}
        >
          История
        </h2>
        <p
          style={{
            fontSize: 12,
            color: 'rgba(166,172,178,0.5)',
            fontFamily: 'var(--font-inter), sans-serif',
            margin: 0,
          }}
        >
          {items.length} прошлых разборов
        </p>
      </motion.div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ padding: '48px 0', textAlign: 'center' }}
        >
          <p
            style={{
              fontSize: 12,
              color: 'rgba(166,172,178,0.35)',
              fontFamily: 'var(--font-inter), sans-serif',
              lineHeight: 1.7,
            }}
          >
            Истории пока нет.
            <br />
            Выбери состояние на главной, чтобы начать.
          </p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 860 }}>
          {items.map((entry, i) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              index={i}
              onOpen={onOpen}
              onToggleArchive={onToggleArchive}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ─── Archives View ────────────────────────────────────────────────────────────
function ArchivesView({
  entries,
  onOpen,
  onToggleArchive,
}: {
  entries: HistoryEntry[]
  onOpen: (e: HistoryEntry) => void
  onToggleArchive: (id: string) => void
}) {
  const items = entries.filter(e => e.archived)

  return (
    <motion.div
      key="archives"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '48px 48px 40px' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{ marginBottom: 32 }}
      >
        <p
          style={{
            fontSize: 8,
            letterSpacing: '0.28em',
            color: 'rgba(166,172,178,0.4)',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-inter), sans-serif',
            marginBottom: 10,
          }}
        >
          Сохранено
        </p>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 300,
            letterSpacing: '0.04em',
            color: '#e0e6ed',
            fontFamily: 'var(--font-inter), sans-serif',
            margin: '0 0 8px',
          }}
        >
          Архив
        </h2>
        <p
          style={{
            fontSize: 12,
            color: 'rgba(166,172,178,0.5)',
            fontFamily: 'var(--font-inter), sans-serif',
            margin: 0,
          }}
        >
          {items.length} архивных записей
        </p>
      </motion.div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ padding: '48px 0', textAlign: 'center' }}
        >
          <p
            style={{
              fontSize: 12,
              color: 'rgba(166,172,178,0.35)',
              fontFamily: 'var(--font-inter), sans-serif',
              lineHeight: 1.7,
            }}
          >
            В архиве пока ничего нет.
            <br />
            Архивируйте запись из истории, чтобы сохранить её здесь.
          </p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 860 }}>
          {items.map((entry, i) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              index={i}
              onOpen={onOpen}
              onToggleArchive={onToggleArchive}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [view, setView] = useState<ViewState>('home')
  const [graphData, setGraphData] = useState<DeconstructionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  // Load history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setEntries(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  // Persist entries
  useEffect(() => {
    if (entries.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
      } catch {
        // ignore
      }
    }
  }, [entries])

  const saveToHistory = (title: string, category: string, data: DeconstructionResult) => {
    const entry: HistoryEntry = {
      id: `entry-${Date.now()}`,
      myth: { id: `state-${Date.now()}`, title, subtitle: '', category: category as Myth['category'] },
      graphData: data,
      timestamp: Date.now(),
      archived: false,
    }
    setEntries(prev => [entry, ...prev.slice(0, 49)])
  }

  const handleSelectState = async (state: EmotionalState) => {
    if (view === 'loading') return
    setView('loading')
    setError(null)

    try {
      const res = await fetch('/api/deconstruct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myth: state.hiddenMyth, mythId: state.id }),
      })
      if (!res.ok) throw new Error('non-200')
      const data: DeconstructionResult = await res.json()
      setGraphData(data)
      saveToHistory(state.feeling, state.category, data)
      setView('journey')
    } catch {
      setError('Не удалось загрузить — попробуй ещё раз')
      setView('home')
    }
  }

  const handleCustom = async (text: string) => {
    if (view === 'loading') return
    setView('loading')
    setError(null)

    try {
      const res = await fetch('/api/deconstruct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myth: text }),
      })
      if (!res.ok) throw new Error('non-200')
      const data: DeconstructionResult = await res.json()
      setGraphData(data)
      saveToHistory(text, 'inadequacy', data)
      setView('journey')
    } catch {
      setError('Не удалось загрузить — попробуй ещё раз')
      setView('home')
    }
  }

  const handleOpenEntry = (entry: HistoryEntry) => {
    setGraphData(entry.graphData)
    setView('journey')
  }

  const handleToggleArchive = (id: string) => {
    setEntries(prev =>
      prev.map(e => (e.id === id ? { ...e, archived: !e.archived } : e))
    )
  }

  const handleNavigate = (v: ViewState) => {
    if ((v === 'canvas' || v === 'journey') && !graphData) return
    setView(v)
  }

  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#0c0e10',
        display: 'flex',
      }}
    >
      <Sidebar
        view={view}
        graphData={graphData}
        entries={entries}
        onNavigate={handleNavigate}
        onOpenEntry={handleOpenEntry}
      />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <HomeView
              key="home"
              onSelect={handleSelectState}
              onCustom={handleCustom}
              error={error}
            />
          )}
          {view === 'loading' && <LoadingView key="loading" />}
          {view === 'journey' && graphData && (
            <JourneyView
              key="journey"
              data={graphData}
              onShowGraph={() => setView('canvas')}
              onShowMentor={() => setView('mentor')}
            />
          )}
          {view === 'canvas' && graphData && (
            <CanvasView
              key="canvas"
              data={graphData}
              onBack={() => setView('journey')}
            />
          )}
          {view === 'mentor' && graphData && (
            <MentorChat
              key="mentor"
              graphData={graphData}
              onClose={() => setView('journey')}
            />
          )}
          {view === 'history' && (
            <HistoryView
              key="history"
              entries={entries}
              onOpen={handleOpenEntry}
              onToggleArchive={handleToggleArchive}
            />
          )}
          {view === 'archives' && (
            <ArchivesView
              key="archives"
              entries={entries}
              onOpen={handleOpenEntry}
              onToggleArchive={handleToggleArchive}
            />
          )}
          {view === 'mindmap' && (
            <div style={{ width: '100%', height: '100%' }}>
              <LogicFlow 
                data={{
                  comfortMessage: "Единая карта твоих границ",
                  safetyAnchor: "Каждая связь здесь — это шаг к устойчивости.",
                  nodes: entries.flatMap((e, idx) => 
                    e.graphData.nodes.map(n => ({
                      ...n,
                      id: `${e.id}-${n.id}`,
                      // We don't have n.position here, LogicFlow calculates it.
                      // We can pass a label prefix to distinguish them.
                      label: `[${idx + 1}] ${n.label}`
                    }))
                  ),
                  edges: entries.flatMap(e => 
                    e.graphData.edges.map(edge => ({
                      ...edge,
                      id: `${e.id}-${edge.id}`,
                      source: `${e.id}-${edge.source}`,
                      target: `${e.id}-${edge.target}`
                    }))
                  ),
                  insight: "Это твоя личная экосистема границ.",
                  focusShift: "От разрозненных мыслей к единой картине ресурсов."
                }} 
              />
              <button
                onClick={() => setView('home')}
                style={{
                  position: 'absolute',
                  top: 24,
                  right: 24,
                  background: 'rgba(27,32,37,0.8)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(66,73,78,0.3)',
                  color: '#e0e6ed',
                  padding: '8px 16px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12,
                  zIndex: 10
                }}
              >
                Вернуться
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
