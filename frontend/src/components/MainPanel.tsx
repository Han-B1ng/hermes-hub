import Dashboard from '../pages/Dashboard'
import AgentCenter from '../pages/AgentCenter'
import TaskCenter from '../pages/TaskCenter'
import TerminalPage from '../pages/TerminalPage'
import MCPMonitor from '../pages/MCPMonitor'

interface Props {
  activeTab: string
}

export default function MainPanel({ activeTab }: Props) {
  return (
    <main className="flex-1 flex flex-col bg-ctp-base min-w-0 overflow-hidden">
      {/* Tab Header */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-ctp-surface1 bg-ctp-mantle">
        <span className="text-xs text-ctp-overlay0 uppercase tracking-wider mr-2">
          {activeTab}
        </span>
        <span className="text-ctp-surface1 text-xs">/</span>
        <span className="text-xs text-ctp-subtext1 ml-1">
          {activeTab === 'dashboard' && 'Overview'}
          {activeTab === 'agents' && 'Agent Management'}
          {activeTab === 'tasks' && 'Task Queue'}
          {activeTab === 'terminal' && 'Interactive Shell'}
          {activeTab === 'mcp' && 'MCP Server Status'}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'agents' && <AgentCenter />}
        {activeTab === 'tasks' && <TaskCenter />}
        {activeTab === 'terminal' && <TerminalPage />}
        {activeTab === 'mcp' && <MCPMonitor />}
      </div>
    </main>
  )
}
