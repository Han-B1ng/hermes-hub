import { useEffect, useState } from 'react'

interface MCPServer {
  name: string
  status: 'online' | 'error'
  responseTime: number
  errorRate: number
  requestCount: number
}

export default function MCPMonitor() {
  const [servers, setServers] = useState<MCPServer[]>([])

  useEffect(() => {
    let active = true

    const load = () => {
      fetch('/api/mcp')
        .then(res => res.json())
        .then((data: MCPServer[]) => { if (active) setServers(data) })
        .catch(() => {})
    }

    load()
    const id = setInterval(load, 10000)
    return () => { active = false; clearInterval(id) }
  }, [])

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ctp-text">MCP Server Monitor</h2>
        <span className="text-[10px] text-ctp-overlay0">{servers.length} servers</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {servers.map(s => (
          <div key={s.name} className="bg-ctp-mantle rounded-lg p-5 border border-ctp-surface1">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-3 h-3 rounded-full ${
                s.status === 'online' ? 'bg-ctp-green' : 'bg-ctp-red'
              }`} />
              <span className="text-ctp-text font-semibold">{s.name}</span>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-ctp-overlay0 text-xs">Status</dt>
              <dd className={`text-xs ${s.status === 'online' ? 'text-ctp-green' : 'text-ctp-red'}`}>
                {s.status}
              </dd>
              <dt className="text-ctp-overlay0 text-xs">Response</dt>
              <dd className="text-ctp-text text-xs">{s.responseTime}ms</dd>
              <dt className="text-ctp-overlay0 text-xs">Error Rate</dt>
              <dd className={`text-xs ${s.errorRate > 0.1 ? 'text-ctp-red' : 'text-ctp-text'}`}>
                {(s.errorRate * 100).toFixed(1)}%
              </dd>
              <dt className="text-ctp-overlay0 text-xs">Requests</dt>
              <dd className="text-ctp-text text-xs">{s.requestCount.toLocaleString()}</dd>
            </dl>
          </div>
        ))}
        {servers.length === 0 && (
          <div className="col-span-2 py-8 text-center text-xs text-ctp-overlay0 italic">
            No MCP servers connected
          </div>
        )}
      </div>
    </div>
  )
}
