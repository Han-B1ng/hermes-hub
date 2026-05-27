import { useEffect, useState } from 'react'
import { getTasks, getTrace, getReplay, type Task, type TaskStatus, type TraceResult, type TaskEvent } from '../api/client'

const STATUS_STYLE: Record<TaskStatus, string> = {
  PENDING: 'text-ctp-yellow',
  RUNNING: 'text-ctp-blue',
  COMPLETED: 'text-ctp-green',
  FAILED: 'text-ctp-red',
}

function formatDuration(ms: number | null): string {
  if (ms == null) return '—'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

export default function TaskCenter() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [trace, setTrace] = useState<TraceResult | null>(null)
  const [replay, setReplay] = useState<TaskEvent[] | null>(null)
  const [detailView, setDetailView] = useState<'trace' | 'replay' | null>(null)

  useEffect(() => {
    getTasks().then(setTasks).catch(() => {})
  }, [])

  const handleDetail = async (taskId: string, view: 'trace' | 'replay') => {
    if (expandedTask === taskId && detailView === view) {
      setExpandedTask(null)
      setDetailView(null)
      return
    }
    setExpandedTask(taskId)
    setDetailView(view)
    if (view === 'trace') {
      setReplay(null)
      getTrace(taskId).then(setTrace).catch(() => setTrace(null))
    } else {
      setTrace(null)
      getReplay(taskId).then(setReplay).catch(() => setReplay(null))
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ctp-text">Task Queue</h2>
        <span className="text-[10px] text-ctp-overlay0">{tasks.length} tasks</span>
      </div>

      <div className="bg-ctp-mantle rounded-lg border border-ctp-surface1 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ctp-subtext0 border-b border-ctp-surface1 bg-ctp-crust/50">
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider">Title</th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider">Agent</th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider">Status</th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider">Duration</th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tbody key={task.id}>
                <tr className="border-b border-ctp-surface0 hover:bg-ctp-surface0/50 transition-colors">
                  <td className="px-4 py-2.5 text-ctp-text truncate max-w-[200px]">{task.title}</td>
                  <td className="px-4 py-2.5 text-ctp-subtext1 font-mono text-xs">{task.agentId ?? '—'}</td>
                  <td className={`px-4 py-2.5 ${STATUS_STYLE[task.status]}`}>{task.status}</td>
                  <td className="px-4 py-2.5 text-ctp-overlay0">{formatDuration(task.durationMs)}</td>
                  <td className="px-4 py-2.5 space-x-2">
                    <button
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        expandedTask === task.id && detailView === 'trace'
                          ? 'bg-ctp-blue/20 text-ctp-blue'
                          : 'text-ctp-subtext0 hover:text-ctp-blue hover:bg-ctp-surface0'
                      }`}
                      onClick={() => handleDetail(task.id, 'trace')}
                    >
                      Trace
                    </button>
                    <button
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        expandedTask === task.id && detailView === 'replay'
                          ? 'bg-ctp-mauve/20 text-ctp-mauve'
                          : 'text-ctp-subtext0 hover:text-ctp-mauve hover:bg-ctp-surface0'
                      }`}
                      onClick={() => handleDetail(task.id, 'replay')}
                    >
                      Replay
                    </button>
                  </td>
                </tr>
                {expandedTask === task.id && (
                  <tr className="bg-ctp-crust/50">
                    <td colSpan={5} className="px-6 py-4">
                      {detailView === 'trace' && trace && (
                        <div className="text-xs space-y-1 max-h-64 overflow-y-auto">
                          <div className="text-ctp-subtext0 mb-2 font-semibold">
                            Trace for {task.id}
                          </div>
                          <pre className="text-ctp-subtext1 font-mono whitespace-pre-wrap">
                            {JSON.stringify(trace.nodes, null, 2)}
                          </pre>
                        </div>
                      )}
                      {detailView === 'replay' && replay && (
                        <div className="text-xs space-y-1 max-h-64 overflow-y-auto">
                          <div className="text-ctp-subtext0 mb-2 font-semibold">
                            Replay ({replay.length} events)
                          </div>
                          {replay.map((e, i) => (
                            <div key={i} className="flex items-center gap-2 py-1 border-b border-ctp-surface0/50">
                              <span className="text-ctp-overlay0 w-16 shrink-0">
                                {new Date(e.createdAt).toLocaleTimeString()}
                              </span>
                              <span className="text-ctp-blue font-mono w-32 shrink-0">{e.eventType}</span>
                              <span className="text-ctp-subtext1 truncate">{e.eventData}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 && (
          <div className="py-8 text-center text-xs text-ctp-overlay0 italic">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  )
}
