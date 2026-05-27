import { useEffect, useState, useRef } from 'react'
import { getLatestEvents, type TaskEvent } from '../api/client'

const TYPE_COLORS: Record<string, string> = {
  TASK_CREATED: 'bg-ctp-blue',
  TASK_STARTED: 'bg-ctp-blue',
  TASK_COMPLETED: 'bg-ctp-green',
  TASK_FAILED: 'bg-ctp-red',
  AGENT_ONLINE: 'bg-ctp-green',
  AGENT_OFFLINE: 'bg-ctp-overlay0',
  AGENT_RUNNING: 'bg-ctp-yellow',
  TOOL_START: 'bg-ctp-mauve',
  TOOL_END: 'bg-ctp-mauve',
  MCP_REQUEST: 'bg-ctp-teal',
  MCP_RESPONSE: 'bg-ctp-teal',
  ERROR: 'bg-ctp-red',
  WARNING: 'bg-ctp-peach',
  INFO: 'bg-ctp-blue',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60000) return `${Math.floor(diff / 1000)}s`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
  return `${Math.floor(diff / 86400000)}d`
}

interface Props {
  visible: boolean
  onToggle: () => void
}

export default function TimelinePanel({ visible, onToggle }: Props) {
  const [events, setEvents] = useState<TaskEvent[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visible) return
    const poll = () => {
      getLatestEvents(30).then(setEvents).catch(() => {})
    }
    poll()
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [visible])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [events.length])

  if (!visible) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-ctp-mantle border border-ctp-surface1 border-r-0 rounded-l-lg px-1 py-3 text-xs text-ctp-subtext0 hover:text-ctp-text z-40"
        title="Show Timeline"
      >
        ◀
      </button>
    )
  }

  return (
    <div className="w-[300px] h-screen bg-ctp-mantle border-l border-ctp-surface0 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-ctp-surface1">
        <h2 className="text-sm font-bold text-ctp-text">Event Stream</h2>
        <button
          onClick={onToggle}
          className="text-ctp-overlay0 hover:text-ctp-text text-xs transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Event List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3">
        {events.length === 0 && (
          <div className="text-xs text-ctp-overlay0 italic text-center mt-8">
            No events yet.
            <br />
            Events will appear here in real-time.
          </div>
        )}

        <div className="relative pl-6 border-l-2 border-ctp-surface1 space-y-3">
          {events.map((e) => (
            <div key={e.id} className="relative">
              {/* Timeline dot */}
              <div
                className={`absolute -left-[25px] top-1.5 w-3 h-3 rounded-full border-2 border-ctp-mantle ${
                  TYPE_COLORS[e.eventType] ?? 'bg-ctp-overlay0'
                }`}
              />

              {/* Timestamp */}
              <div className="text-[10px] text-ctp-overlay0 mb-0.5">
                {timeAgo(e.createdAt)}
              </div>

              {/* Event type badge */}
              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono ${
                e.eventType === 'ERROR' ? 'bg-ctp-red/20 text-ctp-red' :
                e.eventType === 'WARNING' ? 'bg-ctp-peach/20 text-ctp-peach' :
                'bg-ctp-surface0 text-ctp-subtext1'
              }`}>
                {e.eventType}
              </span>

              {/* Agent */}
              <span className="text-[10px] text-ctp-subtext0 ml-1.5">
                {e.agentId}
              </span>

              {/* Task ID */}
              <div className="text-[10px] text-ctp-overlay0 mt-0.5 font-mono truncate">
                {e.taskId}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer stats */}
      <div className="p-3 border-t border-ctp-surface1">
        <div className="flex justify-between text-[10px] text-ctp-overlay0">
          <span>Events: {events.length}</span>
          <span>Auto-refresh 3s</span>
        </div>
      </div>
    </div>
  )
}
