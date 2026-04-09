'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MentorMessage, UserPsychoState, MentorPersona, DeconstructionResult } from '@/types'

const EASE = [0.25, 0.1, 0.25, 1] as const

// ─── Psycho State Visualizer ──────────────────────────────────────────────────

const DISTORTION_LABELS: Record<string, string> = {
  result_bias: 'Result Bias',
  catastrophizing: 'Катастрофизация',
  mind_reading: 'Чтение мыслей',
  should_statements: 'Долженствование',
  overgeneralizing: 'Сверхобобщение',
  personalization: 'Персонализация',
  none: 'нет',
}

const TECHNIQUE_LABELS: Record<string, string> = {
  validation: 'Валидация',
  socratic: 'Сократ',
  reframing: 'Переосмысление',
  psychoeducation: 'Психообразование',
  behavioral_experiment: 'Эксперимент',
  boundary_script: 'Скрипт защиты',
}

function StateBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 9, color: 'rgba(166,172,178,0.5)', letterSpacing: '0.08em', fontFamily: 'var(--font-inter), sans-serif' }}>
          {label}
        </span>
        <span style={{ fontSize: 9, color: 'rgba(166,172,178,0.4)', fontFamily: 'var(--font-inter), sans-serif' }}>
          {value}/10
        </span>
      </div>
      <div style={{ height: 2, background: 'rgba(66,73,78,0.4)', borderRadius: 1 }}>
        <motion.div
          animate={{ width: `${value * 10}%` }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{ height: '100%', background: color, borderRadius: 1 }}
        />
      </div>
    </div>
  )
}

function PsychoStatePanel({ state, persona }: { state: UserPsychoState; persona: MentorPersona }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        borderTop: '1px solid rgba(66,73,78,0.2)',
        padding: '10px 20px',
        background: 'rgba(17,20,22,0.6)',
        flexShrink: 0,
      }}
    >
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginBottom: expanded ? 14 : 0,
          width: '100%',
        }}
      >
        <div style={{ width: 3, height: 3, background: 'rgba(179,204,191,0.4)', borderRadius: '50%' }} />
        <span style={{ fontSize: 8, color: 'rgba(166,172,178,0.35)', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'var(--font-inter), sans-serif' }}>
          Психопортрет · {TECHNIQUE_LABELS[persona.technique]}
        </span>
        <span style={{ fontSize: 8, color: 'rgba(166,172,178,0.2)', marginLeft: 'auto' }}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
              <div>
                <StateBar label="Тревога" value={state.anxiety} color="rgba(239,68,68,0.5)" />
                <StateBar label="Защита" value={state.defensiveness} color="rgba(245,158,11,0.5)" />
                <StateBar label="Субъектность" value={state.self_agency} color="rgba(56,189,248,0.5)" />
                <StateBar label="Готовность слышать" value={state.readiness_for_directness} color="rgba(34,197,94,0.5)" />
              </div>
              <div>
                <div style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 9, color: 'rgba(166,172,178,0.4)', letterSpacing: '0.06em', marginBottom: 3, fontFamily: 'var(--font-inter), sans-serif' }}>Корневой страх</p>
                  <p style={{ fontSize: 10, color: 'rgba(224,230,237,0.5)', fontFamily: 'var(--font-inter), sans-serif', lineHeight: 1.4 }}>{state.core_fear}</p>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 9, color: 'rgba(166,172,178,0.4)', letterSpacing: '0.06em', marginBottom: 3, fontFamily: 'var(--font-inter), sans-serif' }}>Искажение</p>
                  <p style={{ fontSize: 10, color: 'rgba(224,230,237,0.5)', fontFamily: 'var(--font-inter), sans-serif' }}>{DISTORTION_LABELS[state.dominant_distortion]}</p>
                </div>
                <div>
                  <p style={{ fontSize: 9, color: 'rgba(166,172,178,0.4)', letterSpacing: '0.06em', marginBottom: 3, fontFamily: 'var(--font-inter), sans-serif' }}>Дуга</p>
                  <p style={{ fontSize: 10, color: 'rgba(224,230,237,0.45)', fontFamily: 'var(--font-inter), sans-serif', lineHeight: 1.4, fontStyle: 'italic' }}>{state.arc_note}</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <div style={{
                padding: '4px 10px',
                background: 'rgba(179,204,191,0.06)',
                border: '1px solid rgba(179,204,191,0.12)',
                borderRadius: 20,
              }}>
                <span style={{ fontSize: 8, color: 'rgba(179,204,191,0.45)', letterSpacing: '0.08em', fontFamily: 'var(--font-inter), sans-serif' }}>
                  Эмпатия {persona.empathy}/10
                </span>
              </div>
              <div style={{
                padding: '4px 10px',
                background: 'rgba(141,160,177,0.06)',
                border: '1px solid rgba(141,160,177,0.12)',
                borderRadius: 20,
              }}>
                <span style={{ fontSize: 8, color: 'rgba(141,160,177,0.45)', letterSpacing: '0.08em', fontFamily: 'var(--font-inter), sans-serif' }}>
                  Директивность {persona.directness}/10
                </span>
              </div>
              <div style={{
                padding: '4px 10px',
                background: 'rgba(56,189,248,0.06)',
                border: '1px solid rgba(56,189,248,0.12)',
                borderRadius: 20,
              }}>
                <span style={{ fontSize: 8, color: 'rgba(56,189,248,0.45)', letterSpacing: '0.08em', fontFamily: 'var(--font-inter), sans-serif' }}>
                  Факты {persona.evidence_weight}/10
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message, index }: { message: MentorMessage; index: number }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: EASE }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 14,
      }}
    >
      {!isUser && (
        <div style={{
          width: 5,
          height: 5,
          background: '#b3ccbf',
          borderRadius: 1,
          flexShrink: 0,
          marginTop: 8,
          marginRight: 12,
          opacity: 0.6,
        }} />
      )}
      <div
        style={{
          maxWidth: '72%',
          padding: isUser ? '10px 16px' : '12px 18px',
          background: isUser
            ? 'rgba(37,45,51,0.6)'
            : 'rgba(24,29,33,0.8)',
          border: `1px solid ${isUser ? 'rgba(66,73,78,0.35)' : 'rgba(179,204,191,0.1)'}`,
          borderRadius: isUser ? '0.75rem 0.75rem 0.25rem 0.75rem' : '0.75rem 0.75rem 0.75rem 0.25rem',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <p style={{
          fontSize: 13,
          color: isUser ? 'rgba(224,230,237,0.75)' : 'rgba(224,230,237,0.85)',
          fontFamily: 'var(--font-inter), sans-serif',
          fontWeight: 300,
          lineHeight: 1.75,
          letterSpacing: '0.01em',
          margin: 0,
          whiteSpace: 'pre-wrap',
        }}>
          {message.content}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
      <div style={{ width: 5, height: 5, background: '#b3ccbf', borderRadius: 1, opacity: 0.6 }} />
      <div style={{
        padding: '10px 16px',
        background: 'rgba(24,29,33,0.8)',
        border: '1px solid rgba(179,204,191,0.1)',
        borderRadius: '0.75rem 0.75rem 0.75rem 0.25rem',
        display: 'flex',
        gap: 5,
        alignItems: 'center',
      }}>
        {[0, 0.2, 0.4].map(delay => (
          <motion.div
            key={delay}
            style={{ width: 4, height: 4, background: '#b3ccbf', borderRadius: 2, opacity: 0.5 }}
            animate={{ opacity: [0.2, 0.8, 0.2], y: [0, -3, 0] }}
            transition={{ duration: 1.1, delay, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main MentorChat Component ────────────────────────────────────────────────

interface MentorChatProps {
  graphData: DeconstructionResult
  onClose?: () => void
}

export function MentorChat({ graphData, onClose }: MentorChatProps) {
  const [messages, setMessages] = useState<MentorMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [psychoState, setPsychoState] = useState<UserPsychoState | null>(null)
  const [persona, setPersona] = useState<MentorPersona | null>(null)
  const [hasStarted, setHasStarted] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Send opening mentor message on mount
  useEffect(() => {
    if (hasStarted) return
    setHasStarted(true)

    const openingMsg: MentorMessage = {
      id: `msg-open-${Date.now()}`,
      role: 'assistant',
      content: graphData.comfortMessage
        ? `${graphData.comfortMessage}\n\nЧто из этого отзывается сильнее всего? Или, может, хочешь рассказать подробнее?`
        : 'Я здесь. Расскажи, что сейчас происходит внутри — что из разбора отозвалось больше всего?',
      timestamp: Date.now(),
    }
    setMessages([openingMsg])
  }, [graphData.comfortMessage, hasStarted])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMessage: MentorMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }

    setInput('')
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          psychoState,
          deconstructionContext: graphData,
        }),
      })

      const data = await res.json()

      const assistantMessage: MentorMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.response ?? 'Дай мне секунду подумать…',
        timestamp: Date.now(),
      }

      setMessages(prev => [...prev, assistantMessage])

      if (data.updatedPsychoState) setPsychoState(data.updatedPsychoState)
      if (data.persona) setPersona(data.persona)
    } catch {
      const errorMsg: MentorMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: 'Что-то пошло не так. Попробуй ещё раз — я никуда не делся.',
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }, [input, isLoading, messages, psychoState, graphData])

  return (
    <motion.div
      key="mentor-chat"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '18px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(66,73,78,0.18)',
        flexShrink: 0,
        background: 'rgba(12,14,16,0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div>
          <p style={{ fontSize: 8, letterSpacing: '0.22em', color: 'rgba(166,172,178,0.45)', textTransform: 'uppercase', fontFamily: 'var(--font-inter), sans-serif', marginBottom: 3 }}>
            Ментор
          </p>
          <p style={{ fontSize: 12, color: 'rgba(224,230,237,0.6)', fontFamily: 'var(--font-inter), sans-serif', fontWeight: 300 }}>
            Адаптивный диалог
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {persona && (
            <div style={{
              padding: '4px 12px',
              background: 'rgba(179,204,191,0.06)',
              border: '1px solid rgba(179,204,191,0.12)',
              borderRadius: 20,
            }}>
              <span style={{ fontSize: 9, color: 'rgba(179,204,191,0.5)', letterSpacing: '0.1em', fontFamily: 'var(--font-inter), sans-serif' }}>
                {TECHNIQUE_LABELS[persona.technique]}
              </span>
            </div>
          )}
          {onClose && (
            <button
              onClick={onClose}
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
              }}
            >
              ← Вернуться
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 32px 12px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <MessageBubble key={msg.id} message={msg} index={idx} />
          ))}
        </AnimatePresence>
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Psycho state visualization (collapsible) */}
      {psychoState && persona && (
        <PsychoStatePanel state={psychoState} persona={persona} />
      )}

      {/* Input bar */}
      <div style={{
        padding: '14px 32px 20px',
        borderTop: '1px solid rgba(66,73,78,0.18)',
        flexShrink: 0,
        background: 'rgba(12,14,16,0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            flex: 1,
            background: '#1b2025',
            borderRadius: '0.5rem',
            padding: '11px 18px',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid rgba(66,73,78,0.35)',
            transition: 'border-color 0.3s ease',
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Напиши, что думаешь или чувствуешь…"
              disabled={isLoading}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#e0e6ed',
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: 13,
                letterSpacing: '0.03em',
                opacity: isLoading ? 0.5 : 1,
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            style={{
              background: '#b3ccbf',
              border: 'none',
              borderRadius: '0.5rem',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isLoading || !input.trim() ? 'default' : 'pointer',
              flexShrink: 0,
              opacity: isLoading || !input.trim() ? 0.3 : 1,
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
      </div>
    </motion.div>
  )
}
