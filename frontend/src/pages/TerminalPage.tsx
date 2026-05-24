import { useEffect, useRef, useState } from 'react'
import { getLatestEvents, type TaskEvent } from '../api/client'

function formatLine(e: TaskEvent): string {
  const ts = new Date(e.createdAt).toLocaleTimeString()
  return `[${ts}] [${e.eventType}] ${e.agentId}: ${e.eventData}`
}

export default function TerminalPage() {
  const [lines, setLines] = useState<string[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true

    const load = () => {
      getLatestEvents(50).then(events => {
        if (!active) return
        setLines(events.map(formatLine))
      })
    }

    load()
    const id = setInterval(load, 5000)
    return () => { active = false; clearInterval(id) }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">Terminal - Live Event Stream</h1>
        <button
          onClick={() => setLines([])}
          className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
        >
          Clear
        </button>
      </div>
      <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-[calc(100vh-140px)] overflow-y-auto">
        {lines.length === 0 && <span className="text-gray-600">Waiting for events...</span>}
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
