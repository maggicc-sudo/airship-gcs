# 临近空间飞艇智能飞行决策系统 (Airship GCS)

B/S 架构的临近空间飞艇智能飞行决策系统 —— Web化飞艇飞行控制与监控平台。

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus + ECharts + Cesium.js |
| 后端 | Spring Boot 3.3 + Java 17 + PostgreSQL + TDengine + Redis |
| 通信 | MQTT (EMQX) + WebSocket + RabbitMQ |
| 部署 | Docker Compose + Nginx |

## 快速启动

### 开发模式

```bash
# 前端 (独立运行，mock数据)
cd frontend
npm install
npm run dev
# → http://localhost:5173

# 基础设施 (按需)
docker compose up -d postgres redis emqx
```

### Docker 全栈

```bash
docker compose up -d
# 前端: http://localhost:5173
# 后端: http://localhost:8080
# EMQX Dashboard: http://localhost:18083 (admin/public)
```

## 项目结构

```
airship-gcs/
├── frontend/                # Vue3 前端
│   ├── src/
│   │   ├── views/           # 页面组件
│   │   │   ├── BigScreen.vue        # 指挥大屏
│   │   │   ├── FlightMonitor.vue    # 飞行监控
│   │   │   ├── FlightControl.vue    # 飞行控制
│   │   │   ├── RoutePlanning.vue    # 航迹规划
│   │   │   ├── MissionScheduling.vue # 任务调度
│   │   │   └── AlarmCenter.vue      # 告警中心
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── mock/            # Mock 数据
│   │   ├── router/          # 路由配置
│   │   └── styles/          # 全局样式 (军事/航天深色主题)
│   └── vite.config.ts
├── backend/                 # Spring Boot 后端
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/airship/gcs/
│       └── resources/application.yml
├── database/
│   └── init-pg.sql          # PostgreSQL 建表脚本
├── nginx/
│   └── nginx.conf
└── docker-compose.yml       # 全栈编排
```

## 功能模块

- **指挥大屏**: 3D态势 + 飞艇状态 + 实时告警 + 环境概览
- **飞行监控**: 遥测数据实时展示 + 姿态 + 推进系统 + 趋势图
- **飞行控制**: 姿态/速度/高度控制 + 飞行模式切换 + 紧急指令
- **航迹规划**: 航线编辑 + 航点管理 + 属性配置
- **任务调度**: 任务CRUD + 甘特图 + 进度跟踪
- **告警中心**: 多级告警 + 确认流转 + 规则管理

## 设计文档

- [总体设计文档](DOC_临近空间飞艇智能飞行决策系统_总体设计文档.md)
- [智能飞行决策引擎技术方案](DOC_智能飞行决策引擎_技术方案.md)
- [智能体架构 V2.1](DOC_智能飞行决策_智能体架构V2.1.md)

## License

Proprietary. All rights reserved.
