<template>
  <div class="control-page">
    <div class="toolbar">
      <select class="form-control" style="width:200px" :value="store.selectedAirshipId" @change="store.selectAirship(($event.target as HTMLSelectElement).value)">
        <option v-for="s in store.airships" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
      <span class="status-badge" :class="store.selectedAirship?.status">{{ statusText(store.selectedAirship?.status||'offline') }}</span>
      <span v-if="!canControl" class="badge badge-danger">飞艇离线，无法下发指令</span>
    </div>

    <div class="control-grid">
      <div class="panel"><div class="panel-header">姿态控制</div>
        <div class="ctrl-body">
          <div class="ctrl-group"><span class="ctl-label">俯仰角</span><input type="range" v-model.number="pitchCmd" min="-15" max="15" step="0.5"><span class="ctl-val">{{ pitchCmd }}°</span></div>
          <div class="ctrl-group"><span class="ctl-label">偏航角</span><input type="range" v-model.number="yawCmd" min="-180" max="180" step="1"><span class="ctl-val">{{ yawCmd }}°</span></div>
          <div class="ctrl-group"><span class="ctl-label">翻滚角</span><input type="range" v-model.number="rollCmd" min="-10" max="10" step="0.5"><span class="ctl-val">{{ rollCmd }}°</span></div>
          <button class="btn btn-primary btn-block" :disabled="!canControl" @click="sendCommand('attitude')">发送姿态指令</button>
        </div>
      </div>

      <div class="panel"><div class="panel-header">速度 & 高度</div>
        <div class="ctrl-body">
          <div class="ctrl-group"><span class="ctl-label">目标速度</span><input type="range" v-model.number="speedCmd" min="0" max="30" step="0.5"><span class="ctl-val">{{ speedCmd }} m/s</span></div>
          <div class="ctrl-group"><span class="ctl-label">目标高度</span><input type="number" class="form-control form-sm" style="width:120px" v-model.number="altitudeCmd" min="18000" max="25000" step="100"><span class="ctl-unit">m</span></div>
          <div class="ctrl-group"><span class="ctl-label">爬升率</span><input type="range" v-model.number="climbRate" min="-5" max="5" step="0.1"><span class="ctl-val">{{ climbRate }} m/s</span></div>
          <button class="btn btn-primary btn-block" :disabled="!canControl" @click="sendCommand('speed_alt')">发送速度/高度指令</button>
        </div>
      </div>

      <div class="panel"><div class="panel-header">飞行模式</div>
        <div class="ctrl-body">
          <div class="radio-group">
            <button class="radio-btn" :class="{active:flightModeCmd==='manual'}" @click="flightModeCmd='manual'">手动操控</button>
            <button class="radio-btn" :class="{active:flightModeCmd==='auto_cruise'}" @click="flightModeCmd='auto_cruise'">自动巡航</button>
            <button class="radio-btn" :class="{active:flightModeCmd==='station_keep'}" @click="flightModeCmd='station_keep'">驻留保持</button>
          </div>
          <button class="btn btn-warning btn-block" :disabled="!canControl" @click="confirmModeSwitch">切换飞行模式</button>
        </div>
      </div>

      <div class="panel emergency-panel"><div class="panel-header">紧急指令 <span class="warn-text">⚠️ 双重确认</span></div>
        <div class="ctrl-body" style="gap:10px">
          <button class="btn btn-danger btn-lg btn-block" :disabled="!canControl" @click="promptConfirm('return')">🚨 紧急返航</button>
          <button class="btn btn-danger btn-lg btn-block" :disabled="!canControl" @click="promptConfirm('halt')">⛔ 紧急急停</button>
          <button class="btn btn-danger btn-lg btn-block btn-ghost" :disabled="!canControl" @click="promptConfirm('ballast')">⚡ 抛弃压舱</button>
        </div>
      </div>

      <div class="panel"><div class="panel-header">指令历史</div>
        <div class="cmd-history">
          <div v-for="(cmd,i) in commandHistory" :key="i" class="cmd-item" :class="cmd.type">
            <span class="cmd-time">{{ cmd.time }}</span><span class="cmd-name">{{ cmd.name }}</span><span class="badge" :class="cmd.status==='done'?'badge-success':'badge-info'">{{ cmd.status==='done'?'已确认':'已发送' }}</span>
          </div>
          <div v-if="!commandHistory.length" class="no-history">暂无指令记录</div>
        </div>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <div v-if="confirmVisible" class="confirm-overlay" @click.self="confirmVisible=false">
      <div class="confirm-box">
        <div class="confirm-msg">{{ confirmMsg }}</div>
        <div class="confirm-actions">
          <button class="btn" @click="confirmVisible=false">取消</button>
          <button class="btn btn-danger" @click="doConfirm">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAirshipStore } from '@/stores/airship'
import { showToast } from '@/utils/toast'
const store = useAirshipStore()
const canControl = computed(() => store.selectedAirship?.status==='online')
const pitchCmd=ref(0), yawCmd=ref(0), rollCmd=ref(0), speedCmd=ref(15), altitudeCmd=ref(20000), climbRate=ref(0), flightModeCmd=ref('auto_cruise')
interface Cmd { time:string;name:string;type:string;status:string }
const commandHistory=ref<Cmd[]>([])
const confirmVisible=ref(false), confirmMsg=ref(''), confirmAction=ref('')

function addCommand(name:string,type:string){ commandHistory.value.unshift({time:new Date().toLocaleTimeString('zh-CN'),name,type,status:'done'}); if(commandHistory.value.length>50) commandHistory.value.pop() }
function sendCommand(type:string){ if(!canControl.value){showToast('飞艇离线，无法下发指令','warning');return}; const n:Record<string,string>={attitude:`姿态:俯仰${pitchCmd.value}°偏航${yawCmd.value}°翻滚${rollCmd.value}°`,speed_alt:`速度${speedCmd.value}m/s高度${altitudeCmd.value}m爬升率${climbRate.value}m/s`}; addCommand(n[type]||type,'normal'); showToast('指令已下发','success'); pitchCmd.value=yawCmd.value=rollCmd.value=0 }
function promptConfirm(type:string){ const msgs:Record<string,string>={return:'确认下发【紧急返航】指令？',halt:'确认下发【急停】指令？飞艇将停止当前所有任务！',ballast:'确认【抛弃压舱】？这可能导致飞艇快速上升！'}; confirmMsg.value=msgs[type]||''; confirmAction.value=type; confirmVisible.value=true }
function doConfirm(){ const names:Record<string,string>={return:'🚨紧急返航',halt:'⛔紧急急停',ballast:'⚡抛弃压舱'}; addCommand(names[confirmAction.value]||confirmAction.value,'emergency'); showToast('紧急指令已下发','warning'); confirmVisible.value=false }
function confirmModeSwitch(){ if(!canControl.value) return; const names:Record<string,string>={manual:'手动操控',auto_cruise:'自动巡航',station_keep:'驻留保持'}; addCommand(`模式切换→${names[flightModeCmd.value]}`,'mode'); showToast(`已切换到${names[flightModeCmd.value]}模式`,'success') }
function statusText(s:string){ const m:Record<string,string>={online:'在线',maintenance:'维护',offline:'离线'}; return m[s]||s }
</script>

<style scoped lang="scss">
.control-page{height:100%;display:flex;flex-direction:column;padding:12px;gap:12px}
.toolbar{display:flex;align-items:center;gap:12px;flex-shrink:0;.status-badge{font-size:12px;padding:2px 10px;border-radius:2px;&.online{color:var(--color-success);border:1px solid var(--color-success)}&.offline{color:var(--color-danger);border:1px solid var(--color-danger)}}}
.control-grid{flex:1;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:1fr 1fr;gap:8px;overflow:auto}
.panel{background:var(--bg-panel);border:1px solid var(--border-color);border-radius:4px;overflow:hidden;display:flex;flex-direction:column}
.emergency-panel{border-color:rgba(255,51,51,0.3);grid-column:1/3;.warn-text{color:var(--color-danger);font-size:11px;margin-left:auto}}
.ctrl-body{padding:16px;display:flex;flex-direction:column;gap:14px}
.ctrl-group{display:flex;align-items:center;gap:12px;.ctl-label{width:80px;font-size:13px;color:var(--text-secondary);flex-shrink:0}.ctl-unit{font-size:12px;color:var(--text-dim)}.ctl-val{font-size:12px;color:var(--text-primary);font-weight:600;width:60px;text-align:right}}
.cmd-history{flex:1;overflow-y:auto;padding:8px;font-size:12px}
.cmd-item{display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid var(--border-color);&.emergency{background:rgba(255,51,51,0.08)}.cmd-time{color:var(--text-dim);font-family:'Courier New',monospace;width:70px}.cmd-name{flex:1}}
.no-history{text-align:center;padding:20px;color:var(--text-dim)}
</style>
