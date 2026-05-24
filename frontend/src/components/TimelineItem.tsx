import type { TaskEvent, EventType } from '../api/client'

const CATEGORY_COLORS: Record<string, string> = {
  TASK: 'bg-blue-500',
  AGENT: 'bg-green-500',
  TOOL: 'bg-purple-500',
  MCP: 'bg-orange-500',
  ERROR: 'bg-red-500',
  WARNING: 'bg-yellow-500',
  INFO: 'bg-gray-500',
}

const CATEGORY_TEXT: Record<string, string> = {
  TASK: 'text-blue-400',
  AGENT: 'text-green-400',
  TOOL: 'text-purple-400',
  MCP: 'text-orange-400',
  ERROR: 'text-red-400',
  WARNING: 'text-yellow-400',
  INFO: 'text-gray-400',
}

function getCategory(type: EventType): string {
  if (type.startsWith('TASK_')) return 'TASK'
  if (type.startsWith('AGENT_')) return 'AGENT'
  if (type.startsWith('TOOL_')) return 'TOOL'
  if (type.startsWith('MCP_')) return 'MCP'
  return type
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour12: false })
}

interface TimelineItemProps {
  event: TaskEvent
}

export default function TimelineItem({ event }: TimelineItemProps) {
  const cat = getCategory(event.eventType)
  const dotColor = CATEGORY_COLORS[cat] ?? 'bg-gray-500'
  const textColor = CATEGORY_TEXT[cat] ?? 'text-gray-400'

  return (
    <div className="flex items-start gap-4 relative">
      <span className="text-xs text-gray-500 font-mono w-16 shrink-0 pt-1">
        {formatTime(event.createdAt)}
      </span>
      <div className="flex flex-col items-center shrink-0">
        <span className={`w-3 h-3 rounded-full ${dotColor}`} />
        <span className="w-px flex-1 bg-gray-700 min-h-[24px]" />
      </div>
      <div className="flex-1 min-w-0 pb-4">
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono ${dotColor} bg-opacity-20 ${textColor}`}>
          {event.eventType}
        </span>
        {event.eventData && (
          <p className="text-sm text-gray-400 mt-1 truncate">{event.eventData}</p>
        )}
      </div>
    </div>
  )
}
