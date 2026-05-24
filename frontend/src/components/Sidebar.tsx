import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/agents', label: 'Agents' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/terminal', label: 'Terminal' },
  { to: '/mcp', label: 'MCP Monitor' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg font-bold tracking-tight">Hermes Hub</h1>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm ${
                isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
