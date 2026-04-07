'use client'

import { motion } from 'framer-motion'
import type { Myth } from '@/types'

interface MythCardProps {
  myth: Myth
  onClick: (myth: Myth) => void
}

const CATEGORY_LABELS: Record<Myth['category'], string> = {
  productivity: 'PRODUCTIVITY',
  spiritual: 'SPIRITUAL',
  identity: 'IDENTITY',
  social: 'SOCIAL',
}

export function MythCard({ myth, onClick }: MythCardProps) {
  return (
    <motion.button
      onClick={() => onClick(myth)}
      whileHover={{
        backgroundColor: '#161a1e',
      }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full text-left p-6 group cursor-pointer"
      style={{
        background: '#111416',
        border: 'none',
        borderRadius: 2,
        outline: 'none',
      }}
    >
      <p
        style={{
          fontSize: 8,
          letterSpacing: '0.22em',
          color: 'rgba(166,172,178,0.5)',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-inter), sans-serif',
          marginBottom: 12,
        }}
      >
        {CATEGORY_LABELS[myth.category]}
      </p>

      <p
        style={{
          fontSize: 13,
          fontWeight: 400,
          color: '#e0e6ed',
          letterSpacing: '0.03em',
          lineHeight: 1.6,
          fontFamily: 'var(--font-inter), sans-serif',
          marginBottom: 8,
        }}
      >
        {myth.title}
      </p>

      <p
        style={{
          fontSize: 10,
          color: 'rgba(166,172,178,0.4)',
          letterSpacing: '0.08em',
          fontFamily: 'var(--font-inter), sans-serif',
          marginBottom: 20,
          textTransform: 'uppercase',
        }}
      >
        {myth.subtitle}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            height: 1,
            flex: 1,
            background: 'rgba(66,73,78,0.4)',
          }}
        />
        <span
          style={{
            fontSize: 7,
            letterSpacing: '0.2em',
            color: '#b3ccbf',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-inter), sans-serif',
            opacity: 0.7,
          }}
        >
          DECONSTRUCT
        </span>
      </div>
    </motion.button>
  )
}
