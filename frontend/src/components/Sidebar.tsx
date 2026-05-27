import { useEffect, useState } from 'react'
import { getAgents, type Agent } from '../api/client'

const TABS = [
  { id: 'dashboard', label: 'Chat', icon: '⚡' },
  { id: 'agents', label: 'Agents', icon: '◫' },
  { id: 'tasks', label: 'Tasks', icon: '☰' },
  { id: 'terminal', label: 'Terminal', icon: '>' },
  { id: 'mcp', label: 'MCP', icon: '⬡' },
]

interface Props {
  activeTab: string
  onTabChange: (tab: string) => void
  onChatAgentSelect: (id: string, name: string) => void
}

export default function Sidebar({ activeTab, onTabChange, onChatAgentSelect }: Props) {
  const [agents, setAgents] = useState<Agent[]>([])

  useEffect(() => {
    getAgents().then(setAgents).catch(() => {})
  }, [])

  const agentColor = (type: string) => {
    switch (type) {
      case 'HERMES': return 'text-ctp-green'
      case 'OPENCLAW': return 'text-ctp-blue'
      default: return 'text-ctp-lavender'
    }
  }

  const agentIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'dk-mab': return '⚡'
      case 'dk': return '🔧'
      case 'claude': return '🧠'
      case 'gemini': return '💎'
      default: return '🤖'
    }
  }

  return (
    <div className="w-[260px] h-screen bg-ctp-mantle border-r border-ctp-surface0 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-ctp-surface1">
        <h1 className="text-lg font-bold text-ctp-text tracking-tight">
          Hermes Hub
        </h1>
        <p className="text-xs text-ctp-overlay0 mt-0.5">Agent Control Center</p>
      </div>

      {/* Navigation */}
      <div className="p-3 border-b border-ctp-surface1">
        <h3 className="text-xs font-semibold text-ctp-subtext0 mb-2 uppercase tracking-wider">
          Navigation
        </h3>
        <div className="space-y-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                tab.id === activeTab
                  ? 'bg-ctp-surface0 text-ctp-text border border-ctp-surface1'
                  : 'text-ctp-subtext1 hover:bg-ctp-surface0 hover:text-ctp-text border border-transparent'
              }`}
            >
              <span className="text-base w-5 text-center">{tab.icon}</span>
              <span className="flex-1 text-left">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Agents */}
      <div className="p-3 border-b border-ctp-surface1">
        <h3 className="text-xs font-semibold text-ctp-subtext0 mb-2 uppercase tracking-wider">
          Agents
        </h3>
        <div className="space-y-0.5">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onChatAgentSelect(agent.id, agent.name)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-ctp-subtext1 hover:bg-ctp-surface0 hover:text-ctp-text border border-transparent transition-colors"
            >
              <span className="text-base">{agentIcon(agent.name)}</span>
              <span className="flex-1 text-left truncate">{agent.name}</span>
              <span className={`text-[10px] ${agentColor(agent.type)}`}>
                {agent.type?.toLowerCase()}
              </span>
              <span className={`inline-block w-2 h-2 rounded-full ${
                agent.status === 'ONLINE' ? 'bg-ctp-green' :
                agent.status === 'RUNNING' ? 'bg-ctp-yellow animate-pulse' :
                'bg-ctp-overlay0'
              }`} />
            </button>
          ))}
          {agents.length === 0 && (
            <div className="text-xs text-ctp-overlay0 italic px-2 py-2">
              No agents connected
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto p-3 border-t border-ctp-surface1">
        <div className="text-[10px] text-ctp-overlay0 text-center">
          Hermes Hub v0.0.1
        </div>
      </div>
    </div>
  )
}
