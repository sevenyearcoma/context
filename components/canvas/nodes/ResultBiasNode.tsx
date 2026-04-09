'use client'

import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { motion } from 'framer-motion'

type ResultBiasNodeType = Node<{ label: string; description: string }, 'resultBias'>

export function ResultBiasNode({ data }: NodeProps<ResultBiasNodeType>) {
  return (
    <div style={{ position: 'relative', width: 300 }}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: 'rgba(245,158,11,0.4)', left: -4, borderRadius: 2 }}
      />

      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          padding: '18px 22px',
          background: '#121518',
          borderRadius: '0.4rem',
          border: '1px solid rgba(245,158,11,0.25)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ fontSize: 9, color: 'rgba(245,158,11,0.7)', paddingBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>искажение контекста</div>
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
        style={{ background: 'rgba(245,158,11,0.4)', right: -4, borderRadius: 2 }}
      />
    </div>
  )
}
