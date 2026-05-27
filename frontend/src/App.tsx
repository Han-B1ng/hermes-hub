import { useState } from 'react'
import Sidebar from './components/Sidebar'
import MainPanel from './components/MainPanel'
import ChatPanel from './components/ChatPanel'
import TimelinePanel from './components/TimelinePanel'

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard')
  const [timelineVisible, setTimelineVisible] = useState(true)
  const [chatAgentId, setChatAgentId] = useState('agent-001')
  const [chatAgentName, setChatAgentName] = useState('Dk-mab')

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ctp-crust">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onChatAgentSelect={(id, name) => { setChatAgentId(id); setChatAgentName(name); setActiveTab('dashboard') }}
      />
      {activeTab === 'dashboard' ? (
        <ChatPanel agentId={chatAgentId} agentName={chatAgentName} />
      ) : (
        <MainPanel activeTab={activeTab} />
      )}
      <TimelinePanel visible={timelineVisible} onToggle={() => setTimelineVisible(!timelineVisible)} />
    </div>
  )
}
