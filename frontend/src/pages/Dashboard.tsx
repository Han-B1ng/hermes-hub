import { useEffect, useState } from 'react'
import { getAgents, getTasks, getLatestEvents, type Agent, type Task, type TaskEvent } from '../api/client'

const EVENT_COLORS: Record<string, string> = {
  TASK_CREATED: 'border-l-ctp-blue',
  TASK_STARTED: 'border-l-ctp-blue',
  TASK_COMPLETED: 'border-l-ctp-green',
  TASK_FAILED: 'border-l-ctp-red',
  AGENT_ONLINE: 'border-l-ctp-green',
  AGENT_OFFLINE: 'border-l-ctp-overlay0',
  ERROR: 'border-l-ctp-red',
  WARNING: 'border-l-ctp-peach',
  INFO: 'border-l-ctp-blue',
  TOOL_START: 'border-l-ctp-mauve',
  TOOL_END: 'border-l-ctp-mauve',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60000) return `${Math.floor(diff / 1000)}s`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  return `${Math.floor(diff / 3600000)}h`
}

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<TaskEvent[]>([])

  useEffect(() => {
    getAgents().then(setAgents).catch(() => {})
    getTasks().then(setTasks).catch(() => {})
    getLatestEvents(15).then(setEvents).catch(() => {})
  }, [])

  const online = agents.filter(a => a.status === 'ONLINE').length
  const running = tasks.filter(t => t.status === 'RUNNING').length
  const completed = tasks.filter(t => t.status === 'COMPLETED').length
  const failed = tasks.filter(t => t.status === 'FAILED').length

  const stats = [
    { label: 'Online', value: online, color: 'text-ctp-green', bg: 'bg-ctp-green/10', border: 'border-ctp-green/20' },
    { label: 'Running', value: running, color: 'text-ctp-yellow', bg: 'bg-ctp-yellow/10', border: 'border-ctp-yellow/20' },
    { label: 'Completed', value: completed, color: 'text-ctp-blue', bg: 'bg-ctp-blue/10', border: 'border-ctp-blue/20' },
    { label: 'Failed', value: failed, color: 'text-ctp-red', bg: 'bg-ctp-red/10', border: 'border-ctp-red/20' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`${s.bg} border ${s.border} rounded-lg p-4`}
          >
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-ctp-subtext0 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Agent Status */}
      <div className="bg-ctp-mantle rounded-lg border border-ctp-surface1 p-4">
        <h3 className="text-xs font-semibold text-ctp-subtext0 uppercase tracking-wider mb-3">
          Agent Status
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {agents.slice(0, 6).map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-2 px-3 py-2 rounded bg-ctp-surface0 text-sm"
            >
              <span className={`w-2 h-2 rounded-full ${
                a.status === 'ONLINE' ? 'bg-ctp-green' :
                a.status === 'RUNNING' ? 'bg-ctp-yellow animate-pulse' :
                'bg-ctp-overlay0'
              }`} />
              <span className="text-ctp-text flex-1 truncate">{a.name}</span>
              <span className="text-[10px] text-ctp-overlay0">{a.status}</span>
            </div>
          ))}
          {agents.length === 0 && (
            <div className="col-span-2 text-xs text-ctp-overlay0 italic py-3 text-center">
              No agents registered
            </div>
          )}
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-ctp-mantle rounded-lg border border-ctp-surface1 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-ctp-subtext0 uppercase tracking-wider">
            Recent Events
          </h3>
          <span className="text-[10px] text-ctp-overlay0">{events.length} events</span>
        </div>
        {events.length === 0 ? (
          <div className="text-xs text-ctp-overlay0 italic py-4 text-center">
            No events yet
          </div>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {events.map((e) => (
              <div
                key={e.id}
                className={`flex items-center gap-3 px-3 py-2 rounded bg-ctp-surface0 border-l-2 ${
                  EVENT_COLORS[e.eventType] ?? 'border-l-ctp-overlay0'
                }`}
              >
                <span className="text-[10px] text-ctp-overlay0 w-10 shrink-0">
                  {timeAgo(e.createdAt)}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  e.eventType === 'ERROR' ? 'bg-ctp-red/20 text-ctp-red' :
                  e.eventType === 'WARNING' ? 'bg-ctp-peach/20 text-ctp-peach' :
                  'bg-ctp-surface1 text-ctp-subtext1'
                }`}>
                  {e.eventType}
                </span>
                <span className="text-[10px] text-ctp-subtext0">{e.agentId}</span>
                <span className="text-[10px] text-ctp-overlay0 truncate flex-1 font-mono">
                  {e.taskId}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
