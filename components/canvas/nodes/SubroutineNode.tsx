'use client'

import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { motion } from 'framer-motion'

type SubroutineNodeType = Node<{ label: string; description: string }, 'subroutine'>

export function SubroutineNode({ data }: NodeProps<SubroutineNodeType>) {
  return (
    <div style={{ position: 'relative', width: 300 }}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: 'rgba(180,140,220,0.4)', left: -4, borderRadius: 2 }}
      />

      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          padding: '18px 22px',
          background: '#161a1e',
          borderRadius: '0.5rem',
          border: '1px solid rgba(180,140,220,0.2)',
          boxShadow:
            '0 0 32px rgba(180,140,220,0.06), 0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 400,
            color: '#e0e6ed',
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
            color: 'rgba(166,172,178,0.55)',
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
        style={{ background: 'rgba(180,140,220,0.4)', right: -4, borderRadius: 2 }}
      />
    </div>
  )
}
