'use client'

import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { motion } from 'framer-motion'

type SelfWitnessNodeType = Node<{ label: string; description: string }, 'selfWitness'>

export function SelfWitnessNode({ data }: NodeProps<SelfWitnessNodeType>) {
  return (
    <div style={{ position: 'relative', width: 300 }}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: 'rgba(147,197,253,0.45)', left: -4, borderRadius: 2 }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: '#0c1a22',
          borderRadius: '0.5rem',
          border: '1px solid rgba(147,197,253,0.28)',
          boxShadow:
            '0 0 48px rgba(147,197,253,0.07), 0 0 12px rgba(147,197,253,0.04), 0 4px 24px rgba(0,0,0,0.35)',
          overflow: 'hidden',
        }}
      >
        {/* Self header */}
        <div
          style={{
            padding: '7px 14px 6px',
            background: 'rgba(147,197,253,0.08)',
            borderBottom: '1px solid rgba(147,197,253,0.14)',
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(147,197,253,0.65)',
              fontFamily: 'var(--font-inter), sans-serif',
            }}
          >
            self · наблюдатель
          </span>
        </div>

        <div style={{ padding: '14px 18px 16px' }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: '#c8dff5',
              letterSpacing: '0.02em',
              lineHeight: 1.55,
              fontFamily: 'var(--font-inter), sans-serif',
              marginBottom: 8,
            }}
          >
            {data.label}
          </p>
          <p
            style={{
              fontSize: 11,
              color: 'rgba(166,172,178,0.55)',
              lineHeight: 1.7,
              fontFamily: 'var(--font-inter), sans-serif',
              letterSpacing: '0.02em',
            }}
          >
            {data.description}
          </p>
        </div>
      </motion.div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: 'rgba(147,197,253,0.45)', right: -4, borderRadius: 2 }}
      />
    </div>
  )
}
