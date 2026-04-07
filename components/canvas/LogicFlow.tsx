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
import { PremiseNode } from './nodes/PremiseNode'
import { SpeculationNode } from './nodes/SpeculationNode'
import { AbsurdMirrorNode } from './nodes/AbsurdMirrorNode'
import { EmpiricalAnchorNode } from './nodes/EmpiricalAnchorNode'
import { SystemicLeverNode } from './nodes/SystemicLeverNode'

const nodeTypes = {
  premise: PremiseNode,
  speculation: SpeculationNode,
  absurdMirror: AbsurdMirrorNode,
  empiricalAnchor: EmpiricalAnchorNode,
  systemicLever: SystemicLeverNode,
}

const NODE_WIDTH = 300
const NODE_HEIGHT = 140
const H_GAP = 110  // horizontal gap between type columns
const V_GAP = 20   // vertical gap between nodes in the same column

// Left-to-right: each type is a column
const TYPE_COL: Record<NodeType, number> = {
  premise: 0,
  speculation: 1,
  absurdMirror: 2,
  empiricalAnchor: 3,
  systemicLever: 4,
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
    const isAssumption = 
      label.includes('assum') || 
      label.includes('ignor') || 
      label.includes('предполагает') || 
      label.includes('игнорирует')
    const isAbsurd =
      label.includes('absurd') ||
      label.includes('arbitrar') ||
      label.includes('parallel') ||
      label.includes('абсурд')
    const isGrounding =
      label.includes('lead') ||
      label.includes('point') ||
      label.includes('support') ||
      label.includes('collapse') ||
      label.includes('ведет') ||
      label.includes('разбивается') ||
      label.includes('открывает') ||
      label.includes('выявляет')

    const strokeColor = isAssumption
      ? 'rgba(238,125,119,0.45)'
      : isAbsurd
        ? 'rgba(238,195,100,0.4)'
        : isGrounding
          ? 'rgba(141,160,177,0.45)'
          : 'rgba(179,204,191,0.25)'

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'default', // bezier
      animated: isAbsurd || isGrounding,
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
