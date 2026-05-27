import { useEffect, useRef, useState } from 'react'
import { getLatestEvents } from '../api/client'

export default function TerminalPage() {
  const [lines, setLines] = useState<string[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true

    const load = () => {
      getLatestEvents(50).then(events => {
        if (!active) return
        setLines(events.map(e => {
          const ts = new Date(e.createdAt).toLocaleTimeString()
          return `[${ts}] [${e.eventType}] ${e.agentId}: ${e.eventData || ''}`
        }))
      }).catch(() => {})
    }

    load()
    const id = setInterval(load, 5000)
    return () => { active = false; clearInterval(id) }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  return (
    <div className="p-6 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ctp-text">Live Event Stream</h2>
        <button
          onClick={() => setLines([])}
          className="px-3 py-1 text-xs bg-ctp-surface0 text-ctp-subtext0 rounded hover:bg-ctp-surface1 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 bg-ctp-crust rounded-lg border border-ctp-surface1 p-4 font-mono text-sm overflow-y-auto">
        {lines.length === 0 && (
          <span className="text-ctp-overlay0 italic">Waiting for events...</span>
        )}
        {lines.map((line, i) => {
          const isError = line.includes('[ERROR]')
          const isWarn = line.includes('[WARNING]')
          const isGreen = line.includes('[TASK_COMPLETED]') || line.includes('[AGENT_ONLINE]')
          return (
            <div
              key={i}
              className={`py-0.5 ${
                isError ? 'text-ctp-red' :
                isWarn ? 'text-ctp-peach' :
                isGreen ? 'text-ctp-green' :
                'text-ctp-subtext1'
              }`}
            >
              {line}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
