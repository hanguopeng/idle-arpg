# AETHERFORGE // 暗黑挂机刷宝机制沙盒 (Vue 3 + TypeScript + Pinia + Tailwind CSS v4)

## 快速启动指南

```bash
# 1. 解压进入项目目录
cd aetherforge-idle-arpg

# 2. 安装依赖 (推荐使用 pnpm 或 npm)
npm install

# 3. 启动本地热更新开发服务器 (自动打开 http://localhost:5173)
npm run dev
```

## 内置核心特性
- **完整实装 15 件改变规则的传奇暗金** (`src/config/gameData.ts`)
- **三阶段属性转化结算管线** (`src/engine/statPipeline.ts`)：支持属性互转、跨乘区加成与硬性锁定
- **0.1s Tick 级 Gambit AI 挂机战斗引擎** (`src/stores/useCombatStore.ts`)
- **4 套一键验证流派预设**：暴击耗蓝永动机、1血护盾自残荆棘流、极限叠层毒爆流、死灵自爆连携流
