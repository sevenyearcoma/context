'use client'

import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { motion } from 'framer-motion'

type SpeculationNodeType = Node<{ label: string; description: string }, 'speculation'>

export function SpeculationNode({ data }: NodeProps<SpeculationNodeType>) {
  return (
    <div style={{ position: 'relative', width: 300 }}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: 'rgba(238,125,119,0.4)', left: -4, borderRadius: 2 }}
      />

      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          padding: '18px 22px',
          background: '#161a1e',
          borderRadius: '0.5rem',
          border: '1px solid rgba(238,125,119,0.22)',
          boxShadow:
            '0 0 28px rgba(238,125,119,0.06), 0 4px 24px rgba(0,0,0,0.3)',
        }}
      >

        <p
          style={{
            fontSize: 13,
            fontWeight: 400,
            color: 'rgba(238,200,198,0.9)',
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
            color: 'rgba(238,170,168,0.42)',
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
        style={{ background: 'rgba(238,125,119,0.4)', right: -4, borderRadius: 2 }}
      />
    </div>
  )
}
