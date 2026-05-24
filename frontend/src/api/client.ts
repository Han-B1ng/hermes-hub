const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  if (res.status === 204) return undefined as T
  return res.json()
}

export type AgentStatus = 'ONLINE' | 'OFFLINE' | 'IDLE' | 'RUNNING' | 'ERROR'

export interface Agent {
  id: string
  name: string
  type: string
  status: AgentStatus
  currentTaskId: string | null
  startedAt: string | null
  createdAt: string
  updatedAt: string
}

export type EventType =
  | 'TASK_CREATED' | 'TASK_STARTED' | 'TASK_COMPLETED' | 'TASK_FAILED'
  | 'AGENT_ONLINE' | 'AGENT_OFFLINE' | 'AGENT_RUNNING'
  | 'TOOL_START' | 'TOOL_END'
  | 'MCP_REQUEST' | 'MCP_RESPONSE'
  | 'ERROR' | 'WARNING' | 'INFO'

export interface TaskEvent {
  id: number
  taskId: string
  agentId: string
  eventType: EventType
  eventData: string
  seq: number
  createdAt: string
}

export type TaskStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export interface Task {
  id: string
  agentId: string | null
  title: string
  status: TaskStatus
  startedAt: string | null
  endedAt: string | null
  durationMs: number | null
  createdAt: string
}

export interface TraceNode {
  eventType: EventType
  toolName: string | null
  durationMs: number | null
  timestamp: string
  children: TraceNode[]
}

export interface TraceResult {
  task: Task
  nodes: TraceNode[]
}

export const getAgents = () => request<Agent[]>('/agents')

export const getAgent = (id: string) => request<Agent>(`/agents/${id}`)

export const registerAgent = (agent: Partial<Agent>) =>
  request<Agent>('/agents', { method: 'POST', body: JSON.stringify(agent) })

export const updateAgentStatus = (id: string, status: AgentStatus) =>
  request<void>(`/agents/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })

export const getEventsByTaskId = (taskId: string) =>
  request<TaskEvent[]>(`/events/task/${taskId}`)

export const getLatestEvents = (limit = 20) =>
  request<TaskEvent[]>(`/events/latest?limit=${limit}`)

export const getTasks = () => request<Task[]>('/tasks')

export const getTask = (id: string) => request<Task>(`/tasks/${id}`)

export const createTask = (task: Partial<Task>) =>
  request<Task>('/tasks', { method: 'POST', body: JSON.stringify(task) })

export const getTrace = (id: string) =>
  request<TraceResult>(`/tasks/${id}/trace`)

export const getReplay = (id: string) =>
  request<TaskEvent[]>(`/tasks/${id}/replay`)
