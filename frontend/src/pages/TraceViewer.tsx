import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTrace, type TraceResult } from '../api/client'
import TraceNodeComponent from '../components/TraceNode'

export default function TraceViewer() {
  const { id } = useParams<{ id: string }>()
  const [trace, setTrace] = useState<TraceResult | null>(null)

  useEffect(() => {
    if (!id) return
    getTrace(id).then(setTrace)
  }, [id])

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/tasks" className="text-gray-400 hover:text-gray-200 text-sm">&larr; Tasks</Link>
        <h1 className="text-xl font-bold">Trace</h1>
        {trace && <span className="text-sm text-gray-400">{trace.task.title}</span>}
      </div>
      {!trace ? (
        <p className="text-gray-500">Loading trace...</p>
      ) : trace.nodes.length === 0 ? (
        <p className="text-gray-500">No trace data available.</p>
      ) : (
        <div className="max-w-3xl bg-gray-800 rounded-lg border border-gray-700 p-4">
          {trace.nodes.map((node, i) => (
            <TraceNodeComponent key={i} node={node} />
          ))}
        </div>
      )}
    </div>
  )
}
