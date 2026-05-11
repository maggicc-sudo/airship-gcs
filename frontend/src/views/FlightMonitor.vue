<template>
  <div class="monitor-page">
    <div class="toolbar">
      <select class="form-control" style="width:200px" :value="store.selectedAirshipId" @change="store.selectAirship(($event.target as HTMLSelectElement).value)">
        <option v-for="s in store.airships" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
      <span class="connection-status" :class="store.selectedAirship?.status"><i class="dot"></i>{{ statusText(store.selectedAirship?.status||'') }}</span>
      <span class="flight-mode">{{ modeText(store.selectedAirship?.flightMode||'') }}</span>
      <div class="toolbar-spacer"></div>
      <span class="badge badge-info" v-if="telemetry">更新 {{ refreshCount }} 次</span>
    </div>

    <div class="telemetry-grid">
      <div class="stat-card"><div class="stat-label">高度 AGL</div><div class="stat-value">{{ telemetry?.altitude.toFixed(0)??'--' }}</div><div class="stat-unit">m</div><div class="stat-trend" :class="vSpeedTrend">VS {{ telemetry?.verticalSpeed.toFixed(1)??'--' }} m/s</div></div>
      <div class="stat-card"><div class="stat-label">地面速度</div><div class="stat-value">{{ telemetry?.groundSpeed.toFixed(1)??'--' }}</div><div class="stat-unit">m/s</div></div>
      <div class="stat-card"><div class="stat-label">空速</div><div class="stat-value">{{ telemetry?.airSpeed.toFixed(1)??'--' }}</div><div class="stat-unit">m/s</div></div>
      <div class="stat-card"><div class="stat-label">航向</div><div class="stat-value">{{ telemetry?.heading.toFixed(1)??'--' }}</div><div class="stat-unit">°</div></div>
      <div class="stat-card"><div class="stat-label">囊体压差</div><div class="stat-value" :class="pressureClass">{{ telemetry?.envelopePressureDiff.toFixed(1)??'--' }}</div><div class="stat-unit">Pa</div></div>
      <div class="stat-card"><div class="stat-label">氦气温度</div><div class="stat-value">{{ telemetry?.heliumTemp.toFixed(1)??'--' }}</div><div class="stat-unit">°C</div></div>
      <div class="stat-card"><div class="stat-label">电池 SOC</div><div class="stat-value" :class="socClass">{{ telemetry?.batterySoc.toFixed(1)??'--' }}</div><div class="stat-unit">%</div></div>
      <div class="stat-card"><div class="stat-label">太阳能功率</div><div class="stat-value">{{ ((telemetry?.solarPower??0)/1000).toFixed(2) }}</div><div class="stat-unit">kW</div></div>
    </div>

    <div class="content-grid">
      <div class="panel map-panel"><div class="panel-header">地图视图</div>
        <div class="map-placeholder">
          <div class="map-icon">🗺️</div><p>二维态势地图</p>
          <div class="map-info" v-if="telemetry"><div>📍 {{ telemetry.latitude.toFixed(4) }}, {{ telemetry.longitude.toFixed(4) }}</div><div>📏 高度 {{ telemetry.altitude.toFixed(0) }}m</div></div>
        </div>
      </div>
      <div class="panel"><div class="panel-header">飞艇姿态</div>
        <div class="attitude-display" v-if="telemetry">
          <div class="att-rows">
            <div class="att-row"><span class="alabel">俯仰</span><div class="progress-bar h-10"><div class="progress-fill" :style="{width:(Math.abs(telemetry.pitch)/15*50)+'%'}"></div></div><span class="avalue">{{ telemetry.pitch.toFixed(1) }}°</span></div>
            <div class="att-row"><span class="alabel">偏航</span><div class="progress-bar h-10"><div class="progress-fill fill-green" :style="{width:((telemetry.yaw%360)/360*100)+'%'}"></div></div><span class="avalue">{{ (telemetry.yaw%360).toFixed(1) }}°</span></div>
            <div class="att-row"><span class="alabel">翻滚</span><div class="progress-bar h-10"><div class="progress-fill" :style="{width:(Math.abs(telemetry.roll)/10*50)+'%'}"></div></div><span class="avalue">{{ telemetry.roll.toFixed(1) }}°</span></div>
          </div>
          <div class="attitude-visual"><div class="airship-icon" :style="{transform:`rotate(${telemetry.yaw}deg) rotateX(${telemetry.pitch}deg) rotateZ(${telemetry.roll}deg)`}">🛸</div></div>
        </div>
      </div>
      <div class="panel"><div class="panel-header">推进系统</div>
        <div class="motor-list" v-if="telemetry">
          <div v-for="(rpm,i) in telemetry.motorSpeed" :key="i" class="motor-item">
            <span class="motor-label">螺旋桨 #{{ i+1 }}</span>
            <div class="motor-bar-wrap"><div class="motor-bar" :style="{width:(rpm/4000*100)+'%'}"></div></div>
            <span class="motor-val">{{ rpm.toFixed(0) }}rpm</span>
          </div>
        </div>
      </div>
      <div class="panel"><div class="panel-header">遥测趋势</div>
        <div class="chart-placeholder">
          <div class="chart-icon">📈</div><p>ECharts 遥测曲线</p>
          <div class="mini-chart" v-if="history.length>0">
            <div class="trend-row"><span>高度趋势</span><span class="trend-val">{{ telemetry?.altitude.toFixed(0)??'--' }}m</span></div>
            <div class="trend-row"><span>SOC趋势</span><span class="trend-val">{{ telemetry?.batterySoc.toFixed(1)??'--' }}%</span><span class="trend-delta" :class="socDelta>0?'up':'down'">{{ socDelta>0?'↑':'↓' }} {{ Math.abs(socDelta).toFixed(2) }}%/min</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAirshipStore } from '@/stores/airship'
const store = useAirshipStore()
const refreshCount = ref(0)
let timer: number
onMounted(() => { store.updateTelemetry(); timer = window.setInterval(() => { store.updateTelemetry(); refreshCount.value++ }, 1000) })
onUnmounted(() => clearInterval(timer))
const telemetry = computed(() => store.selectedTelemetry)
const history = computed(() => store.telemetryHistory[store.selectedAirshipId] || [])
const vSpeedTrend = computed(() => telemetry.value ? (telemetry.value.verticalSpeed>0.5?'up':telemetry.value.verticalSpeed<-0.5?'down':'stable') : '')
const pressureClass = computed(() => { if(!telemetry.value) return ''; const p=telemetry.value.envelopePressureDiff; return p>380||p<160?'danger':p>350||p<180?'warning':'' })
const socClass = computed(() => { if(!telemetry.value) return ''; const s=telemetry.value.batterySoc; return s<20?'danger':s<40?'warning':'' })
const socDelta = computed(() => { const h=history.value; if(h.length<10) return 0; return (h[h.length-1].batterySoc - h[h.length-10].batterySoc)/10 })
function statusText(s:string){ const m:Record<string,string>={online:'在线',maintenance:'维护中',offline:'离线'}; return m[s]||s }
function modeText(m:string){ const mp:Record<string,string>={manual:'手动操控',auto_cruise:'自动巡航',station_keep:'驻留保持',emergency_return:'应急返航'}; return mp[m]||m }
</script>

<style scoped lang="scss">
.monitor-page { height:100%;display:flex;flex-direction:column;padding:12px;gap:12px; }
.toolbar { display:flex;align-items:center;gap:12px;flex-shrink:0; .connection-status{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary);.dot{width:6px;height:6px;border-radius:50%;background:var(--text-dim)}&.online .dot{background:var(--color-success)}&.offline .dot{background:var(--color-danger)} } .flight-mode{font-size:12px;color:var(--color-primary);padding:2px 8px;border:1px solid var(--border-active);border-radius:2px} .toolbar-spacer{flex:1} }
.telemetry-grid { display:grid;grid-template-columns:repeat(8,1fr);gap:8px;flex-shrink:0; }
.content-grid { flex:1;display:grid;grid-template-columns:1fr 300px;grid-template-rows:1fr 1fr;gap:8px;overflow:hidden; }
.panel { background:var(--bg-panel);border:1px solid var(--border-color);border-radius:4px;overflow:hidden;display:flex;flex-direction:column; }
.map-panel { grid-row:1/3; }
.map-placeholder,.chart-placeholder { flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--text-dim); .map-icon,.chart-icon{font-size:48px;margin-bottom:8px} p{font-size:14px;color:var(--text-secondary)} }
.map-info { margin-top:12px;font-size:12px;text-align:center;line-height:1.8;color:var(--text-secondary); }
.attitude-display { flex:1;display:flex;gap:16px;padding:12px;overflow:hidden; }
.att-rows { flex:1;display:flex;flex-direction:column;justify-content:center;gap:12px; }
.att-row { display:flex;align-items:center;gap:8px; .alabel{width:36px;font-size:12px;color:var(--text-secondary);text-align:right} .avalue{width:48px;font-size:12px;color:var(--text-primary);font-weight:600} }
.attitude-visual { width:120px;display:flex;align-items:center;justify-content:center; .airship-icon{font-size:64px;transition:transform 0.3s ease} }
.motor-list { padding:12px;display:flex;flex-direction:column;gap:10px; }
.motor-item { display:flex;align-items:center;gap:8px; .motor-label{width:80px;font-size:12px;color:var(--text-secondary)} .motor-bar-wrap{flex:1;height:8px;background:rgba(0,220,255,0.1);border-radius:4px;overflow:hidden} .motor-bar{height:100%;background:linear-gradient(90deg,var(--color-primary),var(--color-success));border-radius:4px;transition:width 0.3s} .motor-val{width:60px;font-size:12px;color:var(--text-primary);font-family:'Courier New',monospace} }
.mini-chart { margin-top:12px;width:100%;padding:0 20px; }
.trend-row { display:flex;justify-content:space-between;align-items:center;font-size:12px;padding:4px 0;color:var(--text-secondary); .trend-val{color:var(--text-primary);font-weight:600;font-family:'Courier New',monospace} .trend-delta{font-size:10px;&.up{color:var(--color-success)}&.down{color:var(--color-danger)}} }
.danger { color:var(--color-danger)!important; }
.warning { color:var(--color-warning)!important; }
</style>
