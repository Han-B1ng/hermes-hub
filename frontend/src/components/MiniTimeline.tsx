import type { TaskEvent, EventType } from '../api/client'

const TYPE_COLORS: Record<string, string> = {
  TASK_CREATED: 'bg-blue-500',
  TASK_STARTED: 'bg-blue-600',
  TASK_COMPLETED: 'bg-green-500',
  TASK_FAILED: 'bg-red-500',
  AGENT_ONLINE: 'bg-emerald-500',
  AGENT_OFFLINE: 'bg-gray-500',
  AGENT_RUNNING: 'bg-yellow-500',
  TOOL_START: 'bg-purple-500',
  TOOL_END: 'bg-purple-400',
  MCP_REQUEST: 'bg-indigo-500',
  MCP_RESPONSE: 'bg-indigo-400',
  ERROR: 'bg-red-600',
  WARNING: 'bg-amber-500',
  INFO: 'bg-sky-500',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

interface MiniTimelineProps {
  events: TaskEvent[]
}

export default function MiniTimeline({ events }: MiniTimelineProps) {
  if (events.length === 0) {
    return <p className="text-gray-500 text-sm">No events yet</p>
  }

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {events.map((e) => (
        <div key={e.id} className="flex items-center gap-3 text-sm">
          <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${TYPE_COLORS[e.eventType] ?? 'bg-gray-500'}`} />
          <span className="text-gray-400 w-16 shrink-0">{timeAgo(e.createdAt)}</span>
          <span className="px-1.5 py-0.5 rounded text-xs font-mono bg-gray-700 text-gray-300">
            {e.eventType}
          </span>
          <span className="text-gray-500 truncate">{e.taskId}</span>
        </div>
      ))}
    </div>
  )
}
