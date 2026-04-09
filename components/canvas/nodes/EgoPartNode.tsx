'use client'

import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { motion } from 'framer-motion'

type EgoPartNodeType = Node<{ label: string; description: string }, 'egoPart'>

export function EgoPartNode({ data }: NodeProps<EgoPartNodeType>) {
  return (
    <div style={{ position: 'relative', width: 300 }}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: 'rgba(99,102,241,0.5)', left: -4, borderRadius: 2 }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          background: '#13111d',
          borderRadius: '0.5rem',
          border: '1px solid rgba(99,102,241,0.35)',
          boxShadow: '0 0 40px rgba(99,102,241,0.08), 0 4px 24px rgba(0,0,0,0.35)',
          overflow: 'hidden',
        }}
      >
        {/* Persona header strip */}
        <div
          style={{
            padding: '7px 14px 6px',
            background: 'rgba(99,102,241,0.12)',
            borderBottom: '1px solid rgba(99,102,241,0.18)',
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(165,168,255,0.7)',
              fontFamily: 'var(--font-inter), sans-serif',
            }}
          >
            часть
          </span>
        </div>

        <div style={{ padding: '14px 18px 16px' }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#dde0ff',
              letterSpacing: '0.02em',
              lineHeight: 1.5,
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
        style={{ background: 'rgba(99,102,241,0.5)', right: -4, borderRadius: 2 }}
      />
    </div>
  )
}
