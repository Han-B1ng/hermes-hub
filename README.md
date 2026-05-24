# Hermes Hub V1

> Agent Runtime Observatory Platform — 统一 Agent 运行时观测平台

实时追踪、可视化和回放 Agent（Claude Code / OpenClaw / 自定义）的执行过程。

## 技术栈

| 层 | 技术 |
|---|------|
| 后端 | Spring Boot 3.2 + Java 17 |
| ORM | MyBatis 3.0.3 |
| 数据库 | PostgreSQL |
| 消息 | NATS (jnats 2.17.6) |
| 认证 | JWT (jjwt 0.12.5 + Spring Security) |
| 前端 | React 19 + TypeScript + Vite 8 |
| 样式 | Tailwind CSS 4 (深色主题) |
| 路由 | React Router 7 |

## 项目结构

```
hermes-hub/
├── src/main/java/com/hermes/hub/
│   ├── adapter/          # Agent 适配器 (ClaudeCode/OpenClaw)
│   ├── config/           # Spring Security + JWT + NATS 配置
│   ├── controller/       # REST API (Agent/Event/Task/Auth/MCP)
│   ├── entity/           # 数据模型 (Agent/Task/TaskEvent/User)
│   ├── mapper/           # MyBatis Mapper 接口
│   └── service/          # 业务逻辑 (Registry/Trace/Replay/NATS/JWT)
├── src/main/resources/
│   ├── application.yml   # 应用配置
│   ├── schema.sql        # 数据库建表 (4张表)
│   └── mapper/*.xml      # MyBatis SQL 映射
└── frontend/
    └── src/
        ├── api/          # REST 客户端
        ├── components/   # 共享组件 (Sidebar/StatCard/Timeline/TraceNode)
        └── pages/        # 7 个页面
```

## API 概览

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/events` | POST | 接收事件 |
| `/api/events/task/{taskId}` | GET | 查任务事件 |
| `/api/events/latest` | GET | 最近事件 |
| `/api/agents` | GET/POST | Agent 列表/注册 |
| `/api/agents/{id}` | GET | Agent 详情 |
| `/api/agents/{id}/status` | PUT | 更新状态 |
| `/api/tasks` | GET/POST | 任务列表/创建 |
| `/api/tasks/{id}` | GET | 任务详情 |
| `/api/tasks/{id}/trace` | GET | 调用链 |
| `/api/tasks/{id}/replay` | GET | 回放事件 |
| `/api/tasks/{id}/replay/range` | GET | 按范围切片 |
| `/api/auth/register` | POST | 注册 |
| `/api/auth/login` | POST | 登录 (返回 JWT) |
| `/api/mcp` | GET | MCP 状态 |

## 前端页面

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | Dashboard | 统计概览 + 最近事件 |
| `/agents` | Agent Center | Agent 列表 + 展开详情 |
| `/tasks` | Task Center | 任务列表 + Trace/Replay 入口 |
| `/tasks/:id` | Timeline | 垂直时间线 |
| `/tasks/:id/trace` | Trace | 调用链路树 |
| `/tasks/:id/replay` | Replay | 事件回放 (播放控件) |
| `/terminal` | Terminal | 实时事件日志 |
| `/mcp` | MCP Monitor | MCP 服务状态面板 |

## 快速开始

### 前提

```bash
brew install openjdk@17
# PostgreSQL 需要先安装并启动
```

### 数据库

```bash
brew install postgresql@16
brew services start postgresql@16
psql -U postgres -c "CREATE DATABASE hermes_hub;"
psql -U postgres -c "CREATE USER hermes WITH PASSWORD 'hermes123';"
psql -U postgres -c "GRANT ALL ON DATABASE hermes_hub TO hermes;"
psql -U hermes -d hermes_hub -f src/main/resources/schema.sql
```

### 启动

```bash
# 后端 (端口 8080)
./mvnw spring-boot:run

# 前端 (端口 3000，代理 /api → 8080)
cd frontend && npm run dev
```

## 架构

```
Agent (Claude Code / OpenClaw)
        │
        ▼ 事件流
  ┌─────────────┐
  │  NATS       │
  │  hermes.*.> │
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │  Backend    │  ← Trace Engine / Replay Engine
  │  (Spring)   │  ← Agent Registry / Status Manager
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │  PostgreSQL │  task_events / agents / tasks / users
  └─────────────┘
         │
  ┌──────▼──────┐
  │  React UI   │  Dashboard / Timeline / Trace / Replay
  └─────────────┘
```

## 许可证

MIT
