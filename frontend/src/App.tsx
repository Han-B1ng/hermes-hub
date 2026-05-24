import { Routes, Route, Navigate } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AgentCenter from './pages/AgentCenter';
import TaskCenter from './pages/TaskCenter';
import TimelineViewer from './pages/TimelineViewer';
import TraceViewer from './pages/TraceViewer';
import ReplayViewer from './pages/ReplayViewer';
import TerminalPage from './pages/TerminalPage';
import MCPMonitor from './pages/MCPMonitor';

function App() {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agents" element={<AgentCenter />} />
          <Route path="/tasks" element={<TaskCenter />} />
          <Route path="/tasks/:id" element={<TimelineViewer />} />
          <Route path="/tasks/:id/trace" element={<TraceViewer />} />
          <Route path="/tasks/:id/replay" element={<ReplayViewer />} />
          <Route path="/terminal" element={<TerminalPage />} />
          <Route path="/mcp" element={<MCPMonitor />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
