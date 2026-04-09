'use client'

import { useMemo } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  type Node as RFNode,
  type Edge as RFEdge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import type { DeconstructionResult, NodeType } from '@/types'
import { ViolationNode } from './nodes/ViolationNode'
import { ResultBiasNode } from './nodes/ResultBiasNode'
import { SystemicTruthNode } from './nodes/SystemicTruthNode'
import { BoundaryDefenseNode } from './nodes/BoundaryDefenseNode'

const nodeTypes = {
  violation: ViolationNode,
  resultBias: ResultBiasNode,
  systemicTruth: SystemicTruthNode,
  boundaryDefense: BoundaryDefenseNode,
}

const NODE_WIDTH = 300
const NODE_HEIGHT = 140
const H_GAP = 110
const V_GAP = 20

const TYPE_COL: Record<NodeType, number> = {
  violation: 0,
  resultBias: 1,
  systemicTruth: 2,
  boundaryDefense: 3,
}

function buildRFNodes(nodes: DeconstructionResult['nodes']): RFNode[] {
  const byType: Partial<Record<NodeType, DeconstructionResult['nodes']>> = {}
  nodes.forEach(n => {
    if (!byType[n.type]) byType[n.type] = []
    byType[n.type]!.push(n)
  })

  const maxCount = Math.max(...Object.values(byType).map(arr => arr?.length ?? 0))
  const maxColHeight = maxCount * (NODE_HEIGHT + V_GAP) - V_GAP

  return nodes.map(node => {
    const colIdx = TYPE_COL[node.type] ?? 0
    const siblings = byType[node.type] ?? []
    const rowIdx = siblings.findIndex(s => s.id === node.id)
    const colHeight = siblings.length * (NODE_HEIGHT + V_GAP) - V_GAP

    const x = colIdx * (NODE_WIDTH + H_GAP)
    const y = (maxColHeight - colHeight) / 2 + rowIdx * (NODE_HEIGHT + V_GAP)

    return {
      id: node.id,
      type: node.type,
      position: { x, y },
      data: { label: node.label, description: node.description },
    }
  })
}

function buildRFEdges(edges: DeconstructionResult['edges']): RFEdge[] {
  return edges.map(edge => {
    const label = edge.label?.toLowerCase() ?? ''
    const isViolation =
      label.includes('наруш') ||
      label.includes('требует') ||
      label.includes('атаку') ||
      label.includes('создает')
    const isBias =
      label.includes('искаж') ||
      label.includes('заставляет') ||
      label.includes('ожида')
    const isTruth =
      label.includes('разбива') ||
      label.includes('факт') ||
      label.includes('истин') ||
      label.includes('опирается')
    const isDefense =
      label.includes('защит') ||
      label.includes('право') ||
      label.includes('разрешает')

    const strokeColor = isViolation
      ? 'rgba(239,68,68,0.25)' // muted red
      : isBias
        ? 'rgba(245,158,11,0.25)' // muted amber
        : isTruth
          ? 'rgba(56,189,248,0.25)' // muted sky blue
          : isDefense
            ? 'rgba(34,197,94,0.25)' // muted green
            : 'rgba(179,204,191,0.15)' // muted default

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'default', // bezier
      animated: true,
      style: { stroke: strokeColor, strokeWidth: 1.5 },
      labelStyle: {
        fill: 'rgba(166,172,178,0.5)',
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: 9,
        letterSpacing: '0.08em',
      },
      labelBgStyle: { fill: 'transparent', opacity: 0 },
    }
  })
}

function LogicFlowInner({ data }: { data: DeconstructionResult }) {
  const initialNodes = useMemo(() => buildRFNodes(data.nodes), [data.nodes])
  const initialEdges = useMemo(() => buildRFEdges(data.edges), [data.edges])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.28 }}
      minZoom={0.2}
      maxZoom={1.5}
      style={{ background: '#0c0e10', width: '100%', height: '100%' }}
      proOptions={{ hideAttribution: true }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={32}
        size={1}
        color="#20262c"
      />
      <Controls
        position="bottom-right"
        style={{ bottom: 100, right: 24 }}
        showInteractive={false}
      />
    </ReactFlow>
  )
}

export function LogicFlow({ data }: { data: DeconstructionResult }) {
  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: '100%' }}>
        <LogicFlowInner data={data} />
      </div>
    </ReactFlowProvider>
  )
}
