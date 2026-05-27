import { useEffect, useState } from 'react'
import { getAgents, type Agent, type AgentStatus } from '../api/client'

const STATUS_STYLE: Record<AgentStatus, { dot: string; text: string }> = {
  ONLINE: { dot: 'bg-ctp-green', text: 'text-ctp-green' },
  OFFLINE: { dot: 'bg-ctp-overlay0', text: 'text-ctp-overlay0' },
  RUNNING: { dot: 'bg-ctp-yellow animate-pulse', text: 'text-ctp-yellow' },
  IDLE: { dot: 'bg-ctp-blue', text: 'text-ctp-blue' },
  ERROR: { dot: 'bg-ctp-red', text: 'text-ctp-red' },
}

export default function AgentCenter() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    getAgents().then(setAgents).catch(() => {})
  }, [])

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ctp-text">Agent Management</h2>
        <span className="text-[10px] text-ctp-overlay0">{agents.length} agents</span>
      </div>

      <div className="bg-ctp-mantle rounded-lg border border-ctp-surface1 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ctp-subtext0 border-b border-ctp-surface1 bg-ctp-crust/50">
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider">Name</th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider">Type</th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider">Status</th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider">Task</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(agent => (
              <tbody key={agent.id}>
                <tr
                  className="border-b border-ctp-surface0 cursor-pointer hover:bg-ctp-surface0 transition-colors"
                  onClick={() => setExpanded(expanded === agent.id ? null : agent.id)}
                >
                  <td className="px-4 py-2.5 text-ctp-text">{agent.name}</td>
                  <td className="px-4 py-2.5 text-ctp-subtext1">{agent.type}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${STATUS_STYLE[agent.status].dot}`} />
                    <span className={STATUS_STYLE[agent.status].text}>{agent.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-ctp-overlay0 font-mono text-xs truncate max-w-[200px]">
                    {agent.currentTaskId ?? '—'}
                  </td>
                </tr>
                {expanded === agent.id && (
                  <tr className="bg-ctp-crust/50">
                    <td colSpan={4} className="px-6 py-3 text-xs text-ctp-subtext0 space-y-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-ctp-overlay0">Started: </span>
                          {agent.startedAt ?? '—'}
                        </div>
                        <div>
                          <span className="text-ctp-overlay0">Updated: </span>
                          {agent.updatedAt}
                        </div>
                        <div className="col-span-2">
                          <span className="text-ctp-overlay0">Task: </span>
                          <span className="font-mono">{agent.currentTaskId ?? '—'}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            ))}
          </tbody>
        </table>
        {agents.length === 0 && (
          <div className="py-8 text-center text-xs text-ctp-overlay0 italic">
            No agents registered yet
          </div>
        )}
      </div>
    </div>
  )
}
