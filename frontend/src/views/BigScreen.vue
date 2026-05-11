<template>
  <div class="big-screen">
    <header class="top-bar">
      <div class="title-left"><span class="system-title">临近空间飞艇智能飞行决策系统</span></div>
      <div class="title-center"><span class="time">{{ currentTime }}</span></div>
      <div class="title-right">
        <span class="weather-info">🌡️ -48°C | 💨 18m/s WNW | ☀️ 650W/m²</span>
        <span class="sys-status" :class="{ healthy: !hasEmergency, emergency: hasEmergency }">
          <i class="dot"></i> {{ hasEmergency ? '告警中' : '系统正常' }}
        </span>
      </div>
    </header>

    <div class="screen-grid">
      <!-- ============================== LEFT COLUMN ============================== -->
      <div class="left-column">
        <div class="panel"><div class="panel-header">飞艇状态</div>
          <div class="airship-list">
            <div v-for="ship in store.airships" :key="ship.id" class="airship-item"
                 :class="{ active: ship.id === store.selectedAirshipId }" @click="store.selectAirship(ship.id)">
              <div class="ship-header">
                <span class="ship-status-dot" :class="ship.status"></span>
                <span class="ship-name">{{ ship.name }}</span>
                <span class="badge" :class="'badge-' + statusColor(ship.status)">{{ statusText(ship.status) }}</span>
              </div>
              <div class="ship-mode">
                <span>{{ modeText(ship.flightMode) }}</span>
                <span class="ship-soc" v-if="store.telemetryMap[ship.id]">SOC {{ store.telemetryMap[ship.id].batterySoc.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel flex-1"><div class="panel-header">任务进度</div>
          <div class="mission-list">
            <div v-for="m in activeMissions" :key="m.id" class="mission-item">
              <div class="mission-top">
                <span class="badge" :class="'badge-' + msnColor(m.type)">{{ msnText(m.type) }}</span>
                <span class="mission-name">{{ m.name }}</span>
              </div>
              <div class="progress-bar h-4"><div class="progress-fill fill-success" :style="{width: m.progress+'%'}"></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================== CENTER COLUMN ============================== -->
      <div class="center-column">
        <!-- Map area -->
        <div class="map-area">
          <div ref="mapContainer" class="map-container"></div>

          <!-- Overlay: Telemetry card -->
          <div class="globe-overlay-top" v-if="store.selectedTelemetry">
            <div class="stat-card">
              <div class="stat-label">{{ store.selectedAirship?.name }} 实时数据</div>
              <div class="stat-row"><span>高度</span><span class="val">{{ store.selectedTelemetry.altitude.toFixed(0) }}<small>m</small></span></div>
              <div class="stat-row"><span>地速</span><span class="val">{{ store.selectedTelemetry.groundSpeed.toFixed(1) }}<small>m/s</small></span></div>
              <div class="stat-row"><span>航向</span><span class="val">{{ store.selectedTelemetry.heading.toFixed(1) }}<small>°</small></span></div>
              <div class="stat-row"><span>压差</span><span class="val">{{ store.selectedTelemetry.envelopePressureDiff.toFixed(1) }}<small>Pa</small></span></div>
              <div class="stat-row"><span>电池</span><span class="val" :class="socColor(store.selectedTelemetry.batterySoc)">{{ store.selectedTelemetry.batterySoc.toFixed(1) }}<small>%</small></span></div>
            </div>
          </div>

          <!-- Overlay: Energy bar -->
          <div class="globe-overlay-bottom" v-if="store.selectedTelemetry">
            <div class="energy-bar">
              <div class="energy-item"><span class="elabel">太阳能</span><span class="evalue">{{ (store.selectedTelemetry.solarPower/1000).toFixed(2) }}kW</span></div>
              <div class="energy-item"><span class="elabel">功耗</span><span class="evalue">{{ (store.selectedTelemetry.powerConsumption/1000).toFixed(2) }}kW</span></div>
              <div class="energy-item"><span class="elabel">净功率</span><span class="evalue" :class="netPower>0?'positive':'negative'">{{ netPower>0?'+':'' }}{{ netPower.toFixed(2) }}kW</span></div>
              <div class="energy-item"><span class="elabel">信号</span><span class="evalue">{{ store.selectedTelemetry.linkRssi.toFixed(0) }}dBm</span></div>
            </div>
          </div>
        </div>

        <!-- Chart area -->
        <div class="charts-area">
          <div class="chart-panel">
            <div class="chart-header">电池 SOC 趋势 (%)</div>
            <div ref="socChartEl" class="chart-body"></div>
          </div>
          <div class="chart-panel">
            <div class="chart-header">高度趋势 (m)</div>
            <div ref="altChartEl" class="chart-body"></div>
          </div>
          <div class="chart-panel">
            <div class="chart-header">速度趋势 (m/s)</div>
            <div ref="speedChartEl" class="chart-body"></div>
          </div>
        </div>
      </div>

      <!-- ============================== RIGHT COLUMN ============================== -->
      <div class="right-column">
        <div class="panel"><div class="panel-header">实时告警<span class="alarm-count" :class="{emergency:hasEmergency}">{{ alarms.length }}</span></div>
          <div class="alarm-list">
            <div v-for="a in alarms" :key="a.id" class="alarm-item" :class="'level-'+a.level">
              <span class="alarm-icon">{{ aicon(a.level) }}</span>
              <div class="alarm-body"><div class="alarm-msg">{{ a.message }}</div><div class="alarm-time">{{ ftime(a.triggeredAt) }}</div></div>
            </div>
            <div v-if="!alarms.length" class="no-alarms">✅ 无活跃告警</div>
          </div>
        </div>

        <div class="panel flex-1"><div class="panel-header">环境概览</div>
          <div class="env-grid">
            <div class="stat-card"><div class="stat-label">高空风速</div><div class="stat-value">18.2</div><div class="stat-unit">m/s</div></div>
            <div class="stat-card"><div class="stat-label">高空温度</div><div class="stat-value">-48</div><div class="stat-unit">°C</div></div>
            <div class="stat-card"><div class="stat-label">大气密度</div><div class="stat-value">0.088</div><div class="stat-unit">kg/m³</div></div>
            <div class="stat-card"><div class="stat-label">太阳辐照</div><div class="stat-value">652</div><div class="stat-unit">W/m²</div></div>
          </div>
          <div class="balance-list">
            <div class="balance-item"><span>温压平衡</span><div class="progress-bar"><div class="progress-fill fill-green" style="width:85%"></div></div></div>
            <div class="balance-item"><span>推阻平衡</span><div class="progress-bar"><div class="progress-fill" style="width:72%"></div></div></div>
            <div class="balance-item"><span>浮重平衡</span><div class="progress-bar"><div class="progress-fill fill-green" style="width:90%"></div></div></div>
            <div class="balance-item"><span>能源平衡</span><div class="progress-bar"><div class="progress-fill fill-warning" style="width:65%"></div></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useAirshipStore } from '@/stores/airship'
import { getMockAlarms, getMockMissions, type Alarm, type Mission } from '@/mock/telemetry'

const store = useAirshipStore()
const alarms = ref<Alarm[]>(getMockAlarms())
const missions = ref<Mission[]>(getMockMissions())
const activeMissions = computed(() => missions.value.filter(m => m.status === 'executing'))
const hasEmergency = computed(() => alarms.value.some(a => a.level === 'emergency'))
const netPower = computed(() => {
  if (!store.selectedTelemetry) return 0
  return (store.selectedTelemetry.solarPower - store.selectedTelemetry.powerConsumption) / 1000
})

// ── Clock ───────────────────────────────────────────────────
const currentTime = ref('')
let clockTimer: number

// ── Leaflet Map ──────────────────────────────────────────────
const mapContainer = ref<HTMLElement>()
let mapInstance: any = null
let markersLayer: any = null

async function initMap() {
  if (!mapContainer.value) return
  try {
    const L = (await import('leaflet')).default
    // Inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    mapInstance = L.map(mapContainer.value, {
      center: [40.0, 116.2],
      zoom: 7,
      zoomControl: false,
      attributionControl: false,
    })

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(mapInstance)

    markersLayer = L.layerGroup().addTo(mapInstance)

    // Invalidate size after layout
    setTimeout(() => mapInstance?.invalidateSize(), 200)
  } catch {
    // Leaflet unavailable – show placeholder
    if (mapContainer.value) {
      mapContainer.value.innerHTML = '<div class="globe-placeholder"><div class="globe-icon">🗺️</div><p>地图加载失败</p><p class="hint">Leaflet 未安装</p></div>'
    }
  }
}

function updateMarkers() {
  if (!mapInstance || !markersLayer) return
  markersLayer.clearLayers()
  const L = (window as any).L
  if (!L) return

  const selectedId = store.selectedAirshipId
  store.airships.forEach(ship => {
    const tm = store.telemetryMap[ship.id]
    if (!tm || ship.status === 'offline') return
    const isSelected = ship.id === selectedId
    const color = isSelected ? '#00DCFF' : '#FF6B35'

    // Circle for position
    const circle = L.circleMarker([tm.latitude, tm.longitude], {
      radius: isSelected ? 7 : 5,
      fillColor: color,
      color: '#fff',
      weight: 1,
      fillOpacity: 0.9,
    })

    // Arrow for heading
    const arrowIcon = L.divIcon({
      className: 'airship-arrow-icon',
      html: `<div style="
        width:0;height:0;
        border-left:5px solid transparent;
        border-right:5px solid transparent;
        border-bottom:12px solid ${color};
        transform:rotate(${tm.heading}deg);
        filter:drop-shadow(0 0 4px ${color});
      "></div>`,
      iconSize: [12, 14],
      iconAnchor: [6, 14],
    })

    const arrow = L.marker([tm.latitude, tm.longitude], { icon: arrowIcon })

    // Popup info
    circle.bindPopup(`
      <div style="font-family:sans-serif;font-size:12px;color:#c8d6e5;background:#0a1628;padding:4px 6px;border-radius:2px;">
        <b style="color:#00dcff">${ship.name}</b><br/>
        高度 ${tm.altitude.toFixed(0)}m<br/>
        速度 ${tm.groundSpeed.toFixed(1)}m/s<br/>
        航向 ${tm.heading.toFixed(1)}°<br/>
        SOC ${tm.batterySoc.toFixed(1)}%
      </div>
    `)

    markersLayer.addLayer(circle)
    markersLayer.addLayer(arrow)
  })
}

// ── ECharts ──────────────────────────────────────────────────
const socChartEl = ref<HTMLElement>()
const altChartEl = ref<HTMLElement>()
const speedChartEl = ref<HTMLElement>()
let socChart: any = null
let altChart: any = null
let speedChart: any = null

const chartTheme = {
  textStyle: { color: '#8899BB' },
  backgroundColor: 'transparent',
}

async function initCharts() {
  if (!socChartEl.value) return
  try {
    const echarts = (await import('echarts')).default
    const makeOpt = (title: string, color: string, unit: string, data: number[]) => ({
      grid: { top: 8, right: 16, bottom: 8, left: 8 },
      xAxis: { show: false, data: data.map((_, i) => i) },
      yAxis: { show: false, min: (v: any) => Math.floor(v.min * 0.95), max: (v: any) => Math.ceil(v.max * 1.05) },
      series: [{
        type: 'line', data,
        smooth: true, symbol: 'none',
        lineStyle: { color, width: 1.5 },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: color + '40' },
          { offset: 1, color: 'transparent' },
        ])},
        markLine: { silent: true, symbol: 'none', lineStyle: { color: '#ffffff22', type: 'dashed' }, data: [{ type: 'average', label: { show: false } }] },
      }],
    })

    socChart = echarts.init(socChartEl.value, chartTheme)
    altChart = echarts.init(altChartEl.value, chartTheme)
    speedChart = echarts.init(speedChartEl.value, chartTheme)

    socChart.setOption(makeOpt('', '#00FF88', '%', []))
    altChart.setOption(makeOpt('', '#00DCFF', 'm', []))
    speedChart.setOption(makeOpt('', '#FF6B35', 'm/s', []))
  } catch {
    // ECharts unavailable – leave empty
  }
}

function updateCharts() {
  if (!socChart) return
  const id = store.selectedAirshipId
  const history = store.telemetryHistory[id]
  if (!history || history.length < 2) return
  const recent = history.slice(-60)
  const socs = recent.map(t => t.batterySoc)
  const alts = recent.map(t => t.altitude)
  const spds = recent.map(t => t.groundSpeed)
  socChart.setOption({ series: [{ data: socs }] })
  altChart.setOption({ series: [{ data: alts }] })
  speedChart.setOption({ series: [{ data: spds }] })
}

// ── Resize handler ───────────────────────────────────────────
function handleResize() {
  mapInstance?.invalidateSize()
  socChart?.resize()
  altChart?.resize()
  speedChart?.resize()
}

// ── Lifecycle ────────────────────────────────────────────────
let telemetryTimer: number
onMounted(async () => {
  updateClock()
  clockTimer = window.setInterval(updateClock, 1000)

  await nextTick()
  await initMap()
  await initCharts()

  // Fetch data
  store.fetchAirships()
  store.fetchAlarms()
  store.fetchMissions()

  // Periodic telemetry
  store.fetchLatestTelemetry()
  telemetryTimer = window.setInterval(() => store.fetchLatestTelemetry(), 1000)

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  clearInterval(clockTimer)
  clearInterval(telemetryTimer)
  window.removeEventListener('resize', handleResize)
  mapInstance?.remove()
  socChart?.dispose()
  altChart?.dispose()
  speedChart?.dispose()
})

// Watch telemetry for marker/chart updates
watch(() => store.telemetryMap, () => {
  updateMarkers()
  updateCharts()
}, { deep: true })

// ── Helpers ──────────────────────────────────────────────────
function updateClock() {
  currentTime.value = new Date().toLocaleString('zh-CN', {
    year:'numeric',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit',second:'2-digit',weekday:'short',
  })
}
function statusText(s: string) { const m: Record<string,string>={online:'在线',maintenance:'维护',offline:'离线'}; return m[s]||s }
function statusColor(s: string) { return s==='online'?'success':s==='maintenance'?'warning':'danger' }
function modeText(m: string) { const mp: Record<string,string>={manual:'手动操控',auto_cruise:'自动巡航',station_keep:'驻留保持',emergency_return:'应急返航'}; return mp[m]||m }
function msnText(t: string) { const m: Record<string,string>={area_loiter:'驻留',cruise_recon:'巡航',comm_relay:'中继',emergency:'应急'}; return m[t]||t }
function msnColor(t: string) { const m: Record<string,string>={area_loiter:'success',cruise_recon:'primary',comm_relay:'warning',emergency:'danger'}; return m[t]||'info' }
function aicon(l: string) { const m: Record<string,string>={emergency:'🔴',severe:'🟠',warning:'🟡',info:'🔵'}; return m[l]||'⚪' }
function socColor(s: number) { return s<20?'danger':s<40?'warning':'' }
function ftime(ts: number) { return new Date(ts).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',second:'2-digit'}) }
</script>

<style scoped lang="scss">
.big-screen { width:100%;height:100%;display:flex;flex-direction:column;background:linear-gradient(135deg,#0A1628 0%,#0D2035 50%,#0A1628 100%); }
.top-bar { display:flex;align-items:center;justify-content:space-between;height:48px;padding:0 20px;background:rgba(10,30,60,0.9);border-bottom:1px solid var(--border-color);flex-shrink:0; }
.system-title { font-size:16px;font-weight:700;color:var(--color-primary);letter-spacing:2px; }
.time { font-size:14px;color:var(--text-secondary);font-family:'Courier New',monospace; }
.title-right { display:flex;align-items:center;gap:16px;font-size:11px;color:var(--text-secondary); }
.sys-status { display:flex;align-items:center;gap:6px; .dot{width:6px;height:6px;border-radius:50%;} &.healthy .dot{background:var(--color-success)} &.emergency .dot{background:var(--color-danger);animation:pulse 1s infinite} &.emergency{color:var(--color-danger)} }
.screen-grid { flex:1;display:grid;grid-template-columns:280px 1fr 300px;gap:8px;padding:8px;overflow:hidden;min-height:0; }
.left-column,.right-column { display:flex;flex-direction:column;gap:8px;overflow:hidden; }
.center-column { display:flex;flex-direction:column;gap:8px;overflow:hidden;min-height:0; }
.panel { background:var(--bg-panel);border:1px solid var(--border-color);border-radius:4px;overflow:hidden;display:flex;flex-direction:column; &.flex-1{flex:1;min-height:0;} }

/* ── Map ── */
.map-area { position:relative;flex:1;min-height:0;background:rgba(5,15,30,0.8);border:1px solid var(--border-color);border-radius:4px;overflow:hidden; }
.map-container { width:100%;height:100%; }
.globe-overlay-top { position:absolute;top:12px;left:12px;z-index:1000; .stat-card{width:180px;background:rgba(10,22,40,0.92);padding:10px 12px; .stat-label{font-size:11px;color:var(--color-primary);margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid var(--border-color)} .stat-row{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--text-secondary);padding:2px 0; .val{color:var(--text-primary);font-weight:600;font-family:'Courier New',monospace;&.danger{color:var(--color-danger)}&.warning{color:var(--color-warning)}small{font-size:10px;color:var(--text-dim);font-weight:400}}} } }
.globe-overlay-bottom { position:absolute;bottom:12px;left:50%;transform:translateX(-50%);z-index:1000; }
.energy-bar { display:flex;gap:16px;background:rgba(10,22,40,0.92);border:1px solid var(--border-color);border-radius:4px;padding:8px 16px; }
.energy-item { display:flex;flex-direction:column;align-items:center;gap:2px; .elabel{font-size:10px;color:var(--text-dim)} .evalue{font-size:13px;font-weight:600;font-family:'Courier New',monospace;color:var(--text-primary);&.positive{color:var(--color-success)}&.negative{color:var(--color-danger)}} }

/* ── Charts ── */
.charts-area { display:flex;gap:8px;height:160px;flex-shrink:0; }
.chart-panel { flex:1;background:var(--bg-panel);border:1px solid var(--border-color);border-radius:4px;display:flex;flex-direction:column;overflow:hidden; }
.chart-header { font-size:11px;color:var(--text-secondary);padding:4px 10px;border-bottom:1px solid var(--border-color);flex-shrink:0; }
.chart-body { flex:1;min-height:0; }

/* ── Airship List ── */
.airship-item { padding:12px 14px;border-bottom:1px solid var(--border-color);cursor:pointer; &:hover{background:rgba(0,220,255,0.05)} &.active{background:rgba(0,220,255,0.1);border-left:2px solid var(--color-primary)} .ship-header{display:flex;align-items:center;gap:8px} .ship-status-dot{width:8px;height:8px;border-radius:50%;&.online{background:var(--color-success)}&.maintenance{background:var(--color-warning)}&.offline{background:var(--text-dim)}} .ship-name{flex:1;font-size:13px;font-weight:600} .ship-mode{display:flex;justify-content:space-between;margin-top:4px;font-size:11px;color:var(--text-secondary)} .ship-soc{color:var(--color-primary)} }
.mission-item { padding:10px 14px;border-bottom:1px solid var(--border-color); .mission-top{display:flex;align-items:center;gap:8px;margin-bottom:6px} .mission-name{font-size:12px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap} }

/* ── Alarms ── */
.alarm-list { overflow-y:auto;font-size:12px; }
.alarm-item { display:flex;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border-color); &.level-emergency{background:rgba(255,51,51,0.1)} &.level-severe{background:rgba(255,140,0,0.08)} &.level-warning{background:rgba(255,215,0,0.05)} .alarm-icon{flex-shrink:0;font-size:12px} .alarm-body{flex:1;.alarm-msg{line-height:1.4;margin-bottom:2px}.alarm-time{font-size:10px;color:var(--text-dim)}} }
.alarm-count { margin-left:auto;background:rgba(255,140,0,0.3);color:var(--color-warning);font-size:11px;padding:1px 8px;border-radius:10px; &.emergency{background:rgba(255,51,51,0.3);color:var(--color-danger);animation:pulse 1s infinite} }
.no-alarms { text-align:center;padding:20px;color:var(--text-dim);font-size:12px; }

/* ── Environment ── */
.env-grid { display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px; }
.balance-list { padding:0 10px 10px; .balance-item{display:flex;align-items:center;gap:10px;margin-bottom:8px;span{font-size:12px;color:var(--text-secondary);width:56px;flex-shrink:0;text-align:right}} }
</style>
