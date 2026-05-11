<template>
  <div class="alarm-page">
    <div class="toolbar"><span class="page-title">告警中心</span><div class="spacer"></div>
      <select class="form-control form-sm" style="width:120px" v-model="filterLevel"><option value="all">全部级别</option><option value="emergency">紧急</option><option value="severe">严重</option><option value="warning">警告</option><option value="info">提示</option></select>
      <select class="form-control form-sm" style="width:140px" v-model="filterAirship"><option value="all">全部飞艇</option><option v-for="s in store.airships" :key="s.id" :value="s.id">{{ s.name }}</option></select>
    </div>
    <div class="alarm-grid">
      <div class="summary-row">
        <div class="scard emergency"><span class="count">{{ counts.emergency }}</span><span class="label">紧急</span></div>
        <div class="scard severe"><span class="count">{{ counts.severe }}</span><span class="label">严重</span></div>
        <div class="scard warning"><span class="count">{{ counts.warning }}</span><span class="label">警告</span></div>
        <div class="scard info"><span class="count">{{ counts.info }}</span><span class="label">提示</span></div>
        <div class="scard total"><span class="count">{{ filteredAlarms.length }}</span><span class="label">合计</span></div>
      </div>
      <div class="panel"><div class="panel-header">告警列表<div class="ha"><button class="btn btn-sm btn-text" @click="ackAll">全部确认</button></div></div>
        <table class="data-table">
          <thead><tr><th style="width:40px"></th><th style="width:90px">时间</th><th style="width:100px">飞艇</th><th style="width:100px">名称</th><th>内容</th><th style="width:70px">级别</th><th style="width:70px">状态</th><th style="width:70px">操作</th></tr></thead>
          <tbody>
            <tr v-for="row in filteredAlarms" :key="row.id" @click="showDetail(row)">
              <td><span class="lvl-icon">{{ licon(row.level) }}</span></td>
              <td>{{ new Date(row.triggeredAt).toLocaleTimeString('zh-CN') }}</td>
              <td>{{ row.airshipId }}</td>
              <td>{{ row.name }}</td>
              <td class="msg-cell">{{ row.message }}</td>
              <td><span class="badge" :class="'badge-'+ltag(row.level)">{{ ltxt(row.level) }}</span></td>
              <td><span class="badge" :class="row.acknowledged?'badge-success':'badge-danger'">{{ row.acknowledged?'已确认':'未确认' }}</span></td>
              <td><button v-if="!row.acknowledged" class="btn btn-sm btn-link" @click.stop="ackAlarm(row)">确认</button><span v-else class="ack-info">{{ row.acknowledgedBy }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="panel rules-panel"><div class="panel-header">内置告警规则</div>
        <div class="rules-list">
          <div v-for="r in alarmRules" :key="r.id" class="rule-item">
            <div class="rule-hdr"><span class="rid">{{ r.id }}</span><span class="badge" :class="'badge-'+ltag(r.defaultLevel)">{{ ltxt(r.defaultLevel) }}</span></div>
            <div class="rname">{{ r.name }}</div><div class="rcond">{{ r.condition }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAirshipStore } from '@/stores/airship'
import { getMockAlarms } from '@/mock/telemetry'
import { showToast } from '@/utils/toast'
const store = useAirshipStore()
interface AR { id:string;airshipId:string;ruleId:string;name:string;level:string;message:string;triggeredAt:number;acknowledged:boolean;acknowledgedBy?:string;acknowledgedAt?:number }
const alarms=ref<AR[]>(getMockAlarms()), filterLevel=ref('all'), filterAirship=ref('all')
const filteredAlarms=computed(()=>alarms.value.filter(a=>(filterLevel.value==='all'||a.level===filterLevel.value)&&(filterAirship.value==='all'||a.airshipId===filterAirship.value)))
const counts=computed(()=>{const c:Record<string,number>={emergency:0,severe:0,warning:0,info:0};alarms.value.forEach(a=>{if(c[a.level]!==undefined)c[a.level]++});return c})
const alarmRules=[{id:'ALM-001',name:'链路中断',condition:'遥测数据中断>10s',defaultLevel:'emergency'},{id:'ALM-002',name:'电池低电量',condition:'SOC<20%',defaultLevel:'severe'},{id:'ALM-003',name:'囊体压差异常',condition:'压差超出安全范围[150,400]Pa',defaultLevel:'severe'},{id:'ALM-004',name:'氦气过温',condition:'氦温>-30°C',defaultLevel:'warning'},{id:'ALM-005',name:'强风预警',condition:'风速>抗风能力80%',defaultLevel:'warning'},{id:'ALM-006',name:'偏离航线',condition:'偏航距>阈值',defaultLevel:'warning'},{id:'ALM-007',name:'GPS丢失',condition:'GPS精度下降或丢失',defaultLevel:'severe'},{id:'ALM-008',name:'能源负平衡',condition:'发电<消耗持续超阈值',defaultLevel:'info'}]
function licon(l:string){const m:Record<string,string>={emergency:'🔴',severe:'🟠',warning:'🟡',info:'🔵'};return m[l]||'⚪'}
function ltag(l:string){const m:Record<string,string>={emergency:'danger',severe:'warning',warning:'yellow',info:'info'};return m[l]||'info'}
function ltxt(l:string){const m:Record<string,string>={emergency:'紧急',severe:'严重',warning:'警告',info:'提示'};return m[l]||l}
function ackAlarm(row:AR){row.acknowledged=true;row.acknowledgedBy='当前操作员';row.acknowledgedAt=Date.now();showToast(`告警${row.id}已确认`,'success')}
function ackAll(){alarms.value.forEach(a=>{if(!a.acknowledged){a.acknowledged=true;a.acknowledgedBy='当前操作员';a.acknowledgedAt=Date.now()}});showToast('全部告警已确认','success')}
function showDetail(row:AR){showToast(row.message,'info')}
</script>

<style scoped lang="scss">
.alarm-page{height:100%;display:flex;flex-direction:column;padding:12px;gap:12px}
.toolbar{display:flex;align-items:center;gap:12px;flex-shrink:0;.page-title{font-size:16px;font-weight:600;color:var(--color-primary)}.spacer{flex:1}}
.alarm-grid{flex:1;display:grid;grid-template-columns:1fr 260px;grid-template-rows:auto 1fr;gap:8px;overflow:hidden}
.summary-row{grid-column:1/-1;display:flex;gap:8px}
.scard{flex:1;padding:10px;border-radius:4px;text-align:center;border:1px solid var(--border-color);.count{font-size:28px;font-weight:700;font-family:'Courier New',monospace;display:block}.label{font-size:11px;color:var(--text-dim)}&.emergency{background:rgba(255,51,51,0.1);border-color:rgba(255,51,51,0.3);.count{color:var(--color-danger)}}&.severe{background:rgba(255,140,0,0.1);border-color:rgba(255,140,0,0.3);.count{color:var(--color-severe)}}&.warning{background:rgba(255,215,0,0.1);border-color:rgba(255,215,0,0.3);.count{color:var(--color-warning)}}&.info{background:rgba(68,136,255,0.1);.count{color:var(--color-info)}}&.total{background:rgba(0,220,255,0.05);.count{color:var(--color-primary)}}}
.panel{background:var(--bg-panel);border:1px solid var(--border-color);border-radius:4px;display:flex;flex-direction:column;overflow:hidden}
.ha{margin-left:auto}
.msg-cell{max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lvl-icon{font-size:14px}
.ack-info{font-size:12px;color:var(--text-dim)}
.rules-panel{grid-row:1/3}
.rules-list{flex:1;overflow-y:auto;padding:8px}
.rule-item{padding:8px 10px;border-bottom:1px solid var(--border-color);.rule-hdr{display:flex;align-items:center;gap:6px;margin-bottom:3px}.rid{font-size:11px;color:var(--text-dim);font-family:'Courier New',monospace}.rname{font-size:13px;font-weight:600;margin-bottom:2px}.rcond{font-size:11px;color:var(--text-dim)}}
</style>
