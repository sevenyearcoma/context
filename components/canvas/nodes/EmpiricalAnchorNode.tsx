'use client'

import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { motion } from 'framer-motion'

type EmpiricalAnchorNodeType = Node<{ label: string; description: string }, 'empiricalAnchor'>

export function EmpiricalAnchorNode({ data }: NodeProps<EmpiricalAnchorNodeType>) {
  return (
    <div style={{ position: 'relative', width: 300 }}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: 'rgba(141,160,177,0.45)', left: -4, borderRadius: 2 }}
      />

      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.9, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          padding: '18px 22px',
          background: '#161a1e',
          borderRadius: '0.5rem',
          border: '1px solid rgba(141,160,177,0.25)',
          boxShadow:
            '0 0 32px rgba(141,160,177,0.07), 0 4px 24px rgba(0,0,0,0.3)',
        }}
      >

        <p
          style={{
            fontSize: 13,
            fontWeight: 400,
            color: 'rgba(190,210,228,0.9)',
            letterSpacing: '0.03em',
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
            color: 'rgba(141,160,177,0.48)',
            lineHeight: 1.7,
            fontFamily: 'var(--font-inter), sans-serif',
            letterSpacing: '0.02em',
          }}
        >
          {data.description}
        </p>
      </motion.div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: 'rgba(141,160,177,0.45)', right: -4, borderRadius: 2 }}
      />
    </div>
  )
}
