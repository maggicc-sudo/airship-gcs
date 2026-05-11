<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo" v-show="!sidebarCollapsed">
          <span class="logo-icon">🛸</span>
          <span class="logo-text">智能飞行决策</span>
        </div>
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          {{ sidebarCollapsed ? '▶' : '◀' }}
        </button>
      </div>
      <nav class="nav-menu">
        <router-link to="/bigscreen" class="nav-item" :class="{ active: currentRoute === '/bigscreen' }">
          <span class="nav-icon">📊</span>
          <span class="nav-label" v-show="!sidebarCollapsed">指挥大屏</span>
        </router-link>
        <router-link to="/monitor" class="nav-item" :class="{ active: currentRoute === '/monitor' }">
          <span class="nav-icon">🖥️</span>
          <span class="nav-label" v-show="!sidebarCollapsed">飞行监控</span>
        </router-link>
        <router-link to="/control" class="nav-item" :class="{ active: currentRoute === '/control' }">
          <span class="nav-icon">🎮</span>
          <span class="nav-label" v-show="!sidebarCollapsed">飞行控制</span>
        </router-link>
        <router-link to="/route-planning" class="nav-item" :class="{ active: currentRoute === '/route-planning' }">
          <span class="nav-icon">🗺️</span>
          <span class="nav-label" v-show="!sidebarCollapsed">航迹规划</span>
        </router-link>
        <router-link to="/missions" class="nav-item" :class="{ active: currentRoute === '/missions' }">
          <span class="nav-icon">📋</span>
          <span class="nav-label" v-show="!sidebarCollapsed">任务调度</span>
        </router-link>
        <router-link to="/alarms" class="nav-item" :class="{ active: currentRoute === '/alarms' }">
          <span class="nav-icon">🔔</span>
          <span class="nav-label" v-show="!sidebarCollapsed">告警中心</span>
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const sidebarCollapsed = ref(false)

const currentRoute = computed(() => {
  const path = route.path
  if (path.startsWith('/bigscreen')) return '/bigscreen'
  if (path.startsWith('/monitor')) return '/monitor'
  if (path.startsWith('/control')) return '/control'
  if (path.startsWith('/route-planning')) return '/route-planning'
  if (path.startsWith('/missions')) return '/missions'
  if (path.startsWith('/alarms')) return '/alarms'
  return '/bigscreen'
})
</script>

<style scoped lang="scss">
.app-layout { display: flex; width: 100%; height: 100%; }
.sidebar {
  width: 220px; min-width: 220px; height: 100%;
  background: rgba(10, 22, 40, 0.95); border-right: 1px solid var(--border-color);
  display: flex; flex-direction: column; transition: width 0.3s;
  &.collapsed { width: 64px; min-width: 64px; }
}
.sidebar-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 12px; border-bottom: 1px solid var(--border-color);
  .logo { display: flex; align-items: center; gap: 8px; white-space: nowrap; }
  .logo-icon { font-size: 22px; }
  .logo-text { font-size: 14px; font-weight: 700; color: var(--color-primary); }
  .collapse-btn {
    background: none; border: none; color: var(--text-secondary); cursor: pointer;
    font-size: 14px; padding: 4px;
    &:hover { color: var(--color-primary); }
  }
}
.nav-menu { flex: 1; padding-top: 8px; display: flex; flex-direction: column; }
.nav-item {
  display: flex; align-items: center; gap: 10px; padding: 12px 16px;
  color: var(--text-secondary); text-decoration: none; font-size: 14px;
  transition: background 0.2s;
  &:hover { background: rgba(0, 220, 255, 0.05); color: var(--color-primary); }
  &.active {
    color: var(--color-primary); background: rgba(0, 220, 255, 0.1);
    border-right: 2px solid var(--color-primary);
  }
  .nav-icon { font-size: 16px; width: 20px; text-align: center; }
}
.main-content { flex: 1; height: 100%; overflow: auto; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
