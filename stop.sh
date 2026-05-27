#!/bin/bash
# ============================================
# Hermes Hub — 一键停止
# ============================================

echo "🛑 停止 Hermes Hub..."

lsof -ti :8080 2>/dev/null | xargs kill -9 2>/dev/null && echo "   → 后端 :8080 已停止" || echo "   → 后端未运行"
lsof -ti :5173 2>/dev/null | xargs kill -9 2>/dev/null && echo "   → 前端 :5173 已停止" || echo "   → 前端未运行"

echo "✅ 完成"
