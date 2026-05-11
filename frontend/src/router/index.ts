import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/bigscreen',
    },
    {
      path: '/bigscreen',
      name: 'BigScreen',
      component: () => import('@/views/BigScreen.vue'),
      meta: { title: '指挥大屏' },
    },
    {
      path: '/monitor',
      name: 'FlightMonitor',
      component: () => import('@/views/FlightMonitor.vue'),
      meta: { title: '飞行监控' },
    },
    {
      path: '/control',
      name: 'FlightControl',
      component: () => import('@/views/FlightControl.vue'),
      meta: { title: '飞行控制' },
    },
    {
      path: '/route-planning',
      name: 'RoutePlanning',
      component: () => import('@/views/RoutePlanning.vue'),
      meta: { title: '航迹规划' },
    },
    {
      path: '/missions',
      name: 'MissionScheduling',
      component: () => import('@/views/MissionScheduling.vue'),
      meta: { title: '任务调度' },
    },
    {
      path: '/alarms',
      name: 'AlarmCenter',
      component: () => import('@/views/AlarmCenter.vue'),
      meta: { title: '告警中心' },
    },
  ],
})

export default router
