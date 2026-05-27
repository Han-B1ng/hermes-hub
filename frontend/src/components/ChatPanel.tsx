import { useState, useRef, useEffect } from 'react'
import { getAgents, getTasks, type Agent, type Task } from '../api/client'

interface ChatEvent {
  type: string
  content?: string
  tool?: string
  args?: string
  duration_ms?: number
  status?: string
  input?: number
  output?: number
  cost?: number
}

interface ChatMessage {
  role: 'user' | 'agent'
  content?: string
  events: ChatEvent[]
}

interface Props {
  agentId: string
  agentName: string
}

export default function ChatPanel({ agentId, agentName }: Props) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const eventsRef = useRef<ChatEvent[]>([])

  // Stats polling
  useEffect(() => {
    const refresh = () => {
      getAgents().then(setAgents).catch(() => {})
      getTasks().then(setTasks).catch(() => {})
    }
    refresh()
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [agentId])

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // Connect WebSocket
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080/ws/chat/${agentId}`)
    wsRef.current = ws

    ws.onmessage = (e) => {
      try {
        const event: ChatEvent = JSON.parse(e.data)

        if (event.type === 'done') {
          setIsStreaming(false)
          return
        }

        eventsRef.current = [...eventsRef.current, event]
        setMessages(prev => {
          const updated = [...prev]
          const lastIdx = updated.length - 1
          if (lastIdx >= 0 && updated[lastIdx].role === 'agent') {
            updated[lastIdx] = { ...updated[lastIdx], events: [...eventsRef.current] }
          }
          return updated
        })
      } catch (err) {
        console.warn('WS parse error:', err)
      }
    }

    ws.onclose = () => { wsRef.current = null }
    ws.onerror = () => {} // don't stop streaming on error

    return () => { ws.close() }
  }, [agentId])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    eventsRef.current = []

    setMessages(prev => [
      ...prev,
      { role: 'user', events: [], content: text },
      { role: 'agent', events: [] },
    ])
    setIsStreaming(true)

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', content: text }))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const renderEvent = (event: ChatEvent, idx: number) => {
    switch (event.type) {
      case 'thinking':
        return (
          <div key={idx} className="my-2 rounded-lg border border-ctp-surface1 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-ctp-subtext0 bg-ctp-mantle">
              <span className="text-ctp-yellow">▶</span>
              <span className="text-ctp-subtext1 font-medium">Thinking</span>
            </div>
            <div className="px-4 py-3 text-sm text-ctp-subtext1 bg-ctp-crust/50 border-t border-ctp-surface1 whitespace-pre-wrap leading-relaxed">
              {event.content}
            </div>
          </div>
        )

      case 'tool_start':
        return (
          <div key={idx} className="my-2 rounded-lg border border-ctp-surface1 overflow-hidden bg-ctp-mantle">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-ctp-surface1">
              <span className="text-ctp-teal text-xs font-bold">TOOL</span>
              <span className="text-ctp-text text-sm font-medium">{event.tool}</span>
              <span className="ml-auto text-xs text-ctp-yellow">⟳ running</span>
            </div>
            {event.args && (
              <div className="px-3 py-2 text-xs text-ctp-subtext0 border-b border-ctp-surface0">
                <span className="text-ctp-blue">$</span> {event.args}
              </div>
            )}
          </div>
        )

      case 'tool_output':
        return (
          <div key={idx} className="my-2 rounded-lg border border-ctp-surface1 overflow-hidden bg-ctp-crust">
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-ctp-surface1 bg-ctp-mantle">
              <span className="text-ctp-green text-xs font-bold">OUTPUT</span>
            </div>
            <pre className="px-3 py-2 text-xs text-ctp-subtext1 overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto font-mono">
              {event.content}
            </pre>
          </div>
        )

      case 'tool_end':
        return (
          <div key={idx} className="text-xs text-ctp-overlay0 px-1 py-0.5">
            {event.tool} completed — {event.duration_ms}ms —
            <span className={event.status === 'success' ? 'text-ctp-green' : 'text-ctp-red'}> ✓ {event.status}</span>
          </div>
        )

      case 'assistant':
        return (
          <div key={idx} className="my-3 text-sm text-ctp-text leading-relaxed whitespace-pre-wrap">
            {event.content}
            {isStreaming && <span className="cursor-blink" />}
          </div>
        )

      case 'token':
        return (
          <div key={idx} className="text-[10px] text-ctp-overlay0 text-right px-1">
            ↑{event.input?.toLocaleString()} ↓{event.output?.toLocaleString()} · ${event.cost?.toFixed(4)}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-ctp-base min-w-0">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-ctp-surface1 bg-ctp-mantle">
        <span className="text-lg">⚡</span>
        <div>
          <h2 className="text-sm font-bold text-ctp-text">{agentName}</h2>
          <p className="text-[10px] text-ctp-overlay0">{agentId}</p>
        </div>
        {isStreaming && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 bg-ctp-green rounded-full animate-pulse" />
            <span className="text-xs text-ctp-green">Streaming</span>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-ctp-surface1 bg-ctp-crust/50 text-xs">
        <span className="text-ctp-subtext0">
          <span className="text-ctp-green">●</span> {agents.filter(a => a.status === 'ONLINE').length} online
        </span>
        <span className="text-ctp-subtext0">
          <span className="text-ctp-yellow">●</span> {tasks.filter(t => t.status === 'RUNNING').length} running
        </span>
        <span className="text-ctp-subtext0">
          <span className="text-ctp-blue">●</span> {tasks.filter(t => t.status === 'COMPLETED').length} done
        </span>
        <span className="text-ctp-subtext0">
          <span className="text-ctp-red">●</span> {tasks.filter(t => t.status === 'FAILED').length} failed
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-3xl mb-3">⚡</div>
              <p className="text-sm text-ctp-subtext1 mb-1">{agentName} is ready</p>
              <p className="text-xs text-ctp-overlay0">Type a message to start a new session.</p>
            </div>
          </div>
        )}

        {messages.map((msg, mi) => (
          <div key={mi} className="mb-6">
            {msg.role === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-ctp-surface0 rounded-2xl rounded-br-md px-4 py-3">
                  <p className="text-sm text-ctp-text whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-ctp-overlay0">{agentName}</span>
                </div>
                {msg.events.map((event, ei) => renderEvent(event, ei))}
              </div>
            )}
          </div>
        ))}

        {isStreaming && messages.length === 0 && (
          <div className="flex items-center gap-2 text-ctp-subtext0 text-sm">
            <span className="w-2 h-2 bg-ctp-yellow rounded-full animate-pulse" />
            Processing...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-ctp-surface1 bg-ctp-mantle">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${agentName}... (Enter to send)`}
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-ctp-surface0 text-ctp-text text-sm px-4 py-2.5 rounded-xl border border-ctp-surface1 focus:border-ctp-blue focus:outline-none resize-none placeholder-ctp-overlay0 disabled:opacity-50 font-mono"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="px-4 py-2.5 bg-ctp-blue text-ctp-crust text-sm font-bold rounded-xl hover:bg-ctp-lavender transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
