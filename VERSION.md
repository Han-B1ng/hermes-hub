---
version: 1.0.0
created: 2026-05-24
tags: [project, hermes-hub, release]
author: Dk-mab
status: released
---

# Hermes Hub V1.0.0 — 版本说明

> 全 Phase 代码生成完成，等待 JDK 17 安装后编译验证。

## 生成方式

通过 **大杀器流水线** (Claude Code + GLM 5.1 via Z.AI) 自动生成，Dk-mab 编排每个 Milestone 喂入 CC 执行。

- CC 模型: GLM 5.1 (api.z.ai, provider: zai)
- CC 总调用: ~10 次
- CC 总费用: ~$2
- 总文件: 79 files, 6,610 insertions

## 包含内容

### Phase 0 — 基础层 (M0.1-M0.4)
- Spring Boot 3.2 + MyBatis + PostgreSQL + NATS 项目骨架
- TaskEvent 数据模型 + 4张表 schema.sql
- NATS 发布/订阅通道
- Event API (GET/POST)

### Phase 1 — 运行层 (M1.1-M1.3)
- Agent 模型 (5种状态: ONLINE/OFFLINE/IDLE/RUNNING/ERROR)
- Agent Registry (CRUD + 状态更新)
- Status Manager (状态流转逻辑)

### Phase 2 — 适配层 (M2.1-M2.3)
- AgentAdapter 接口
- AdapterRegistry (自动注册)
- ClaudeCodeAdapter (subprocess CLI)
- OpenClawAdapter (SSH 远程)

### Phase 3 — 处理层 (M3.1-M3.3)
- TraceEngine (seq 序列构建调用链树)
- ReplayEngine (seq 范围切片回放)
- Task 模型 + TaskController

### Phase 4 — 仪表盘 (M4.1-M4.4)
- React + Vite + Tailwind 前端
- Dashboard (4 统计卡片 + MiniTimeline)
- AgentCenter (表格 + 展开详情)
- TaskCenter (表格 + Trace/Replay 入口)

### Phase 5 — 深度视图 (M5.1-M5.3)
- TimelineViewer + TimelineItem (彩色时间线)
- TraceViewer + TraceNode (递归树)
- ReplayViewer + ReplayControls (播放/暂停/倍速)

### Phase 6 — 收尾 (M6.1-M6.4)
- JWT 认证 (SecurityConfig + JwtService + AuthController)
- TerminalPage (实时事件日志)
- MCPMonitor (MCP 服务状态面板)
- 前端路由完善 + Sidebar 导航

## 待验证

- [ ] JDK 17 安装 (`brew install openjdk@17`)
- [ ] PostgreSQL 建库
- [ ] `./mvnw compile` 编译通过
- [ ] `./mvnw spring-boot:run` 启动成功
- [ ] `npm install && npm run dev` 前端启动
- [ ] 注册/登录 → Dashboard 可见
