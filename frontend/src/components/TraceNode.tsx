import type { TraceNode as TraceNodeType, EventType } from '../api/client'

const CATEGORY_COLORS: Record<string, string> = {
  TASK: 'text-blue-400',
  AGENT: 'text-green-400',
  TOOL: 'text-purple-400',
  MCP: 'text-orange-400',
  ERROR: 'text-red-400',
  WARNING: 'text-yellow-400',
  INFO: 'text-gray-400',
}

const CATEGORY_ICONS: Record<string, string> = {
  TASK: '▶',
  AGENT: '◉',
  TOOL: '⚒',
  MCP: '⇄',
  ERROR: '✗',
  WARNING: '⚠',
  INFO: 'ℹ',
}

function getCategory(type: EventType): string {
  if (type.startsWith('TASK_')) return 'TASK'
  if (type.startsWith('AGENT_')) return 'AGENT'
  if (type.startsWith('TOOL_')) return 'TOOL'
  if (type.startsWith('MCP_')) return 'MCP'
  return type
}

function formatDuration(ms: number | null): string {
  if (ms == null) return ''
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

interface TraceNodeProps {
  node: TraceNodeType
  depth?: number
}

export default function TraceNode({ node, depth = 0 }: TraceNodeProps) {
  const cat = getCategory(node.eventType)
  const color = CATEGORY_COLORS[cat] ?? 'text-gray-400'
  const icon = CATEGORY_ICONS[cat] ?? '●'

  return (
    <div style={{ paddingLeft: depth * 20 }}>
      <div className="flex items-center gap-2 py-1">
        <span className={`${color} text-sm`}>{icon}</span>
        <span className={`text-sm font-mono ${color}`}>{node.eventType}</span>
        {node.toolName && (
          <span className="text-sm text-gray-300">{node.toolName}</span>
        )}
        {node.durationMs != null && (
          <span className="text-xs text-gray-500">{formatDuration(node.durationMs)}</span>
        )}
      </div>
      {node.children.map((child, i) => (
        <TraceNode key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}
