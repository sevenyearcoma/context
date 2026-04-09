'use client'

import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { motion } from 'framer-motion'

type IntegrationBridgeNodeType = Node<{ label: string; description: string }, 'integrationBridge'>

export function IntegrationBridgeNode({ data }: NodeProps<IntegrationBridgeNodeType>) {
  return (
    <div style={{ position: 'relative', width: 300 }}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: 'rgba(251,191,36,0.45)', left: -4, borderRadius: 2 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          background: '#1a1710',
          borderRadius: '0.5rem',
          border: '1px solid rgba(251,191,36,0.25)',
          boxShadow:
            '0 0 40px rgba(251,191,36,0.06), 0 4px 24px rgba(0,0,0,0.35)',
          overflow: 'hidden',
        }}
      >
        {/* Protocol header */}
        <div
          style={{
            padding: '7px 14px 6px',
            background: 'rgba(251,191,36,0.08)',
            borderBottom: '1px solid rgba(251,191,36,0.14)',
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(251,191,36,0.65)',
              fontFamily: 'var(--font-inter), sans-serif',
            }}
          >
            протокол интеграции
          </span>
        </div>

        <div style={{ padding: '14px 18px 16px' }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: '#f5e8c0',
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
        style={{ background: 'rgba(251,191,36,0.45)', right: -4, borderRadius: 2 }}
      />
    </div>
  )
}
