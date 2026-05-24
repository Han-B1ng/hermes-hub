import { useEffect, useState } from 'react'
import { getAgents, getTasks, getLatestEvents, type Agent, type Task, type TaskEvent } from '../api/client'
import StatCard from '../components/StatCard'
import MiniTimeline from '../components/MiniTimeline'

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<TaskEvent[]>([])

  useEffect(() => {
    getAgents().then(setAgents)
    getTasks().then(setTasks)
    getLatestEvents(10).then(setEvents)
  }, [])

  const online = agents.filter(a => a.status === 'ONLINE').length
  const running = tasks.filter(t => t.status === 'RUNNING').length
  const errorCount = events.filter(e => e.eventType === 'ERROR').length

  return (
    <div className="bg-gray-900 min-h-screen p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Agents Online" value={online} accent="bg-green-500" />
        <StatCard label="Tasks Running" value={running} accent="bg-blue-500" />
        <StatCard label="Events" value={events.length} accent="bg-purple-500" />
        <StatCard label="Errors" value={errorCount} accent="bg-red-500" />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h2 className="text-lg font-semibold mb-3">Latest Events</h2>
        <MiniTimeline events={events} />
      </div>
    </div>
  )
}
