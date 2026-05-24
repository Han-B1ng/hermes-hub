import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTasks, type Task, type TaskStatus } from '../api/client'

const STATUS_COLOR: Record<TaskStatus, string> = {
  PENDING: 'text-yellow-400',
  RUNNING: 'text-blue-400',
  COMPLETED: 'text-green-400',
  FAILED: 'text-red-400',
}

function formatDuration(ms: number | null): string {
  if (ms == null) return '—'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

export default function TaskCenter() {
  const [tasks, setTasks] = useState<Task[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    getTasks().then(setTasks)
  }, [])

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <h1 className="text-xl font-bold mb-4">Tasks</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-700">
            <th className="pb-2">Title</th>
            <th className="pb-2">Agent</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Duration</th>
            <th className="pb-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id} className="border-b border-gray-800">
              <td className="py-2">{task.title}</td>
              <td className="py-2 text-gray-400 font-mono text-xs">{task.agentId ?? '—'}</td>
              <td className={`py-2 ${STATUS_COLOR[task.status]}`}>{task.status}</td>
              <td className="py-2 text-gray-400">{formatDuration(task.durationMs)}</td>
              <td className="py-2 space-x-3">
                <button
                  className="text-blue-400 hover:underline text-xs"
                  onClick={() => navigate(`/tasks/${task.id}/trace`)}
                >
                  Trace
                </button>
                <button
                  className="text-purple-400 hover:underline text-xs"
                  onClick={() => navigate(`/tasks/${task.id}/replay`)}
                >
                  Replay
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
