import { useEffect, useState } from 'react'
import { getAgents, type Agent, type AgentStatus } from '../api/client'

const STATUS_DOT: Record<AgentStatus, string> = {
  ONLINE: 'bg-green-500',
  OFFLINE: 'bg-gray-500',
  RUNNING: 'bg-blue-500',
  IDLE: 'bg-yellow-500',
  ERROR: 'bg-red-500',
}

export default function AgentCenter() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    getAgents().then(setAgents)
  }, [])

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <h1 className="text-xl font-bold mb-4">Agents</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-700">
            <th className="pb-2">Name</th>
            <th className="pb-2">Type</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Current Task</th>
          </tr>
        </thead>
        <tbody>
          {agents.map(agent => (
            <tbody key={agent.id}>
              <tr
                className="border-b border-gray-800 cursor-pointer hover:bg-gray-800"
                onClick={() => setExpanded(expanded === agent.id ? null : agent.id)}
              >
                <td className="py-2">{agent.name}</td>
                <td className="py-2 text-gray-400">{agent.type}</td>
                <td className="py-2">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${STATUS_DOT[agent.status]}`} />
                  {agent.status}
                </td>
                <td className="py-2 text-gray-400 font-mono text-xs">
                  {agent.currentTaskId ?? '—'}
                </td>
              </tr>
              {expanded === agent.id && (
                <tr className="bg-gray-800/50">
                  <td colSpan={4} className="px-4 py-2 text-xs text-gray-400 space-y-1">
                    <p>started_at: {agent.startedAt ?? '—'}</p>
                    <p>updated_at: {agent.updatedAt}</p>
                    <p>current_task_id: {agent.currentTaskId ?? '—'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          ))}
        </tbody>
      </table>
    </div>
  )
}
