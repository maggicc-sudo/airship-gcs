<template>
  <div class="page"><div class="toolbar"><span class="page-title">任务调度</span><div class="spacer"></div><button class="btn btn-primary">+ 新建任务</button></div>
    <div class="grid">
      <div class="panel" style="grid-row:1/3"><div class="panel-header">任务列表</div>
        <div class="list">
          <div v-for="m in missions" :key="m.id" class="item" :class="{active:selected?.id===m.id}" @click="selected=m">
            <div class="m-top"><span class="badge" :class="'badge-'+tc(m.type)">{{ tt(m.type) }}</span><span class="badge" :class="'badge-'+sc(m.status)">{{ st(m.status) }}</span></div>
            <div class="m-name">{{ m.name }}</div>
            <div class="m-meta"><span>飞艇:{{ m.airshipIds.join(',') }}</span><span>优先级:{{ '⭐'.repeat(m.priority) }}</span></div>
            <div class="progress-bar h-4"><div class="progress-fill fill-success" :style="{width:m.progress+'%'}"></div></div>
          </div>
        </div>
      </div>
      <div class="panel"><div class="panel-header">任务详情</div>
        <div v-if="selected" class="form">
          <div class="form-row"><label>任务名称</label><input class="form-control" v-model="selected.name"></div>
          <div class="form-row"><label>任务类型</label><select class="form-control" v-model="selected.type"><option value="area_loiter">区域驻留</option><option value="cruise_recon">巡航侦察</option><option value="comm_relay">通信中继</option><option value="emergency">应急机动</option></select></div>
          <div class="form-row"><label>参与飞艇</label><div class="check-group"><label v-for="s in store.airships" :key="s.id" class="check-item"><input type="checkbox" :value="s.id" v-model="selected.airshipIds">{{ s.name }}</label></div></div>
          <div class="form-row"><label>优先级</label><div class="star-rating"><span v-for="i in 5" :key="i" class="star" :class="{active:i<=selected.priority}" @click="selected.priority=i">⭐</span></div></div>
          <div class="form-row"><label>计划开始</label><input type="datetime-local" class="form-control" v-model="selected.startStr"></div>
          <div class="form-row"><label>计划结束</label><input type="datetime-local" class="form-control" v-model="selected.endStr"></div>
        </div>
        <div v-else class="no-sel">选择任务查看详情</div>
      </div>
      <div class="panel"><div class="panel-header">甘特图</div>
        <div class="gantt">
          <div class="gantt-icon">📊</div><p>任务时间线视图</p>
          <div class="gantt-bars" v-if="missions.length">
            <div v-for="m in missions" :key="m.id" class="gantt-row"><span class="glabel">{{ m.name }}</span><div class="gwrap"><div class="gbar" :class="m.status" :style="{width:Math.max(m.progress,5)+'%'}"></div></div><span class="gpct">{{ m.progress }}%</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAirshipStore } from '@/stores/airship'
const store = useAirshipStore()
interface Mission { id:string;name:string;type:string;airshipIds:string[];priority:number;status:string;progress:number;startStr:string;endStr:string }
const selected=ref<Mission|null>(null)
const missions=ref<Mission[]>([
  {id:'MIS-001',name:'北京区域驻留监视',type:'area_loiter',airshipIds:['AS-001'],priority:1,status:'executing',progress:45,startStr:'2026-05-08T08:00',endStr:'2026-05-10T08:00'},
  {id:'MIS-002',name:'通信中继保障',type:'comm_relay',airshipIds:['AS-002'],priority:2,status:'executing',progress:72,startStr:'2026-05-08T10:00',endStr:'2026-05-09T10:00'},
  {id:'MIS-003',name:'应急气象侦察',type:'emergency',airshipIds:['AS-001','AS-002'],priority:1,status:'ready',progress:0,startStr:'2026-05-09T06:00',endStr:'2026-05-09T18:00'},
])
function tc(t:string){ const m:Record<string,string>={area_loiter:'success',cruise_recon:'primary',comm_relay:'warning',emergency:'danger'}; return m[t]||'info' }
function tt(t:string){ const m:Record<string,string>={area_loiter:'驻留',cruise_recon:'巡航',comm_relay:'中继',emergency:'应急'}; return m[t]||t }
function sc(s:string){ const m:Record<string,string>={executing:'success',ready:'warning',draft:'info',completed:'',aborted:'danger'}; return m[s]||'info' }
function st(s:string){ const m:Record<string,string>={executing:'执行中',ready:'就绪',draft:'草稿',completed:'已完成',aborted:'中止'}; return m[s]||s }
</script>

<style scoped lang="scss">
.page{height:100%;display:flex;flex-direction:column;padding:12px;gap:12px}
.toolbar{display:flex;align-items:center;gap:12px;flex-shrink:0;.page-title{font-size:16px;font-weight:600;color:var(--color-primary)}.spacer{flex:1}}
.grid{flex:1;display:grid;grid-template-columns:280px 1fr;grid-template-rows:1fr 1fr;gap:8px;overflow:hidden}
.panel{background:var(--bg-panel);border:1px solid var(--border-color);border-radius:4px;display:flex;flex-direction:column;overflow:hidden}
.list{flex:1;overflow-y:auto}
.item{padding:10px 12px;border-bottom:1px solid var(--border-color);cursor:pointer;&:hover{background:rgba(0,220,255,0.05)}&.active{background:rgba(0,220,255,0.1);border-left:2px solid var(--color-primary)}.m-top{display:flex;gap:6px;margin-bottom:4px}.m-name{font-size:13px;font-weight:600;margin-bottom:4px}.m-meta{font-size:11px;color:var(--text-dim);display:flex;gap:12px;margin-bottom:6px}}
.form{padding:12px;flex:1;overflow-y:auto}
.form-row{margin-bottom:12px;label{display:block;font-size:12px;color:var(--text-secondary);margin-bottom:4px}}
.check-group{display:flex;flex-direction:column;gap:4px}
.check-item{display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;color:var(--text-primary)}
.no-sel{flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-dim);font-size:13px}
.gantt{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;.gantt-icon{font-size:36px;margin-bottom:8px}p{font-size:14px;color:var(--text-secondary);margin-bottom:16px}}
.gantt-bars{width:100%}
.gantt-row{display:flex;align-items:center;gap:8px;margin-bottom:10px;.glabel{width:120px;font-size:12px;color:var(--text-secondary);text-align:right}.gwrap{flex:1;height:16px;background:rgba(0,220,255,0.1);border-radius:3px;overflow:hidden}.gbar{height:100%;border-radius:3px;&.executing{background:linear-gradient(90deg,var(--color-primary),var(--color-success))}&.ready{background:var(--color-warning)}&.draft{background:var(--text-dim)}}.gpct{width:36px;font-size:11px;color:var(--text-dim)}}
</style>
