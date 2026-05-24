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
    <div className="bg-gray-900 min-h-screen p-6">
      <h1 className="text-xl font-bold text-white mb-6">MCP Server Monitor</h1>
      <div className="grid grid-cols-2 gap-4">
        {servers.map(s => (
          <div key={s.name} className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-3 h-3 rounded-full ${s.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-white font-semibold text-lg">{s.name}</span>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-gray-400">Status</dt>
              <dd className="text-white">{s.status}</dd>
              <dt className="text-gray-400">Response Time</dt>
              <dd className="text-white">{s.responseTime}ms</dd>
              <dt className="text-gray-400">Error Rate</dt>
              <dd className="text-white">{(s.errorRate * 100).toFixed(1)}%</dd>
              <dt className="text-gray-400">Requests</dt>
              <dd className="text-white">{s.requestCount}</dd>
            </dl>
          </div>
        ))}
      </div>
    </div>
  )
}
