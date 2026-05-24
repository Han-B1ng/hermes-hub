import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getReplay, type TaskEvent } from '../api/client'
import TimelineItem from '../components/TimelineItem'

export default function TimelineViewer() {
  const { id } = useParams<{ id: string }>()
  const [events, setEvents] = useState<TaskEvent[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    getReplay(id).then(setEvents)
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events])

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/tasks" className="text-gray-400 hover:text-gray-200 text-sm">&larr; Tasks</Link>
        <h1 className="text-xl font-bold">Timeline</h1>
        <span className="text-sm text-gray-500 font-mono">{id}</span>
      </div>
      {events.length === 0 ? (
        <p className="text-gray-500">No events found.</p>
      ) : (
        <div className="max-w-2xl">
          {events.map((e) => (
            <TimelineItem key={e.id} event={e} />
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}
