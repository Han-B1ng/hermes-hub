#!/bin/bash
# ============================================
# Hermes Hub — 一键启动
# 后端 :8080 | 前端 :5173
# ============================================
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home

echo "╔════════════════════════════════╗"
echo "║   Hermes Hub 一键启动          ║"
echo "╚════════════════════════════════╝"

# ── 清理旧进程 ──
echo ""
echo "🧹 清理旧进程..."
lsof -ti :8080 2>/dev/null | xargs kill -9 2>/dev/null && echo "   → :8080 已释放" || true
lsof -ti :5173 2>/dev/null | xargs kill -9 2>/dev/null && echo "   → :5173 已释放" || true
sleep 1

# ── 启动后端 ──
echo ""
echo "🔧 启动后端 (Spring Boot :8080)..."
cd "$PROJECT_DIR"
./mvnw spring-boot:run > /tmp/hermes-hub-backend.log 2>&1 &
BACKEND_PID=$!
echo "   PID: $BACKEND_PID"

# ── 等后端就绪 ──
echo "   等待后端就绪..."
for i in $(seq 1 30); do
    if curl -s http://localhost:8080/api/mcp > /dev/null 2>&1; then
        echo "   ✅ 后端已就绪 (${i}s)"
        break
    fi
    sleep 1
done

# ── 启动前端 ──
echo ""
echo "🎨 启动前端 (Vite :5173)..."
cd "$PROJECT_DIR/frontend"
./node_modules/.bin/vite --host > /tmp/hermes-hub-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"

# ── 等前端就绪 ──
echo "   等待前端就绪..."
for i in $(seq 1 15); do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo "   ✅ 前端已就绪 (${i}s)"
        break
    fi
    sleep 1
done

# ── 完成 ──
echo ""
echo "╔════════════════════════════════╗"
echo "║  🟢 Hermes Hub 已启动          ║"
echo "║                                ║"
echo "║  前端  http://localhost:5173   ║"
echo "║  后端  http://localhost:8080   ║"
echo "║                                ║"
echo "║  停止: ./stop.sh               ║"
echo "╚════════════════════════════════╝"
