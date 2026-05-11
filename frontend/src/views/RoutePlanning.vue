<template>
  <div class="route-page">
    <div class="toolbar"><span class="page-title">航迹规划</span><div class="toolbar-spacer"></div><button class="btn btn-primary" @click="showToast('点击地图添加航点','info')">+ 新建航线</button><button class="btn">导入 KML/GPX</button></div>
    <div class="route-grid">
      <div class="panel"><div class="panel-header">航线列表</div>
        <div class="route-list">
          <div v-for="r in routes" :key="r.id" class="route-item" :class="{active:selectedRoute?.id===r.id}" @click="selectedRoute=r">
            <div class="route-name">{{ r.name }}</div>
            <div class="route-meta"><span class="badge" :class="r.status==='active'?'badge-success':'badge-info'">{{ r.statusText }}</span><span>{{ r.waypoints.length }}航点</span><span>{{ r.distance }}km</span></div>
          </div>
        </div>
      </div>
      <div class="panel map-area"><div class="panel-header">{{ selectedRoute?selectedRoute.name:'航迹预览' }}<span class="map-tools" v-if="selectedRoute"><button class="btn btn-sm btn-text">+ 添加航点</button><button class="btn btn-sm btn-text btn-link" style="color:var(--color-danger)">删除</button></span></div>
        <div class="map-placeholder">
          <div class="map-icon">🗺️</div><p v-if="!selectedRoute">选择左侧航线查看详情</p>
          <div v-else class="wp-list">
            <div v-for="(wp,i) in selectedRoute.waypoints" :key="i" class="wp-item">
              <span class="wp-idx">{{ i+1 }}</span><span class="wp-info">{{ wp.lat.toFixed(2) }},{{ wp.lon.toFixed(2) }}</span><span class="wp-alt">{{ wp.alt }}m</span><span class="wp-speed">{{ wp.speed }}m/s</span>
            </div>
          </div>
        </div>
      </div>
      <div class="panel"><div class="panel-header">航线属性</div>
        <div v-if="selectedRoute" class="props-form">
          <div class="form-row"><label>航线名称</label><input class="form-control" v-model="selectedRoute.name"></div>
          <div class="form-row"><label>关联飞艇</label><select class="form-control" v-model="selectedRoute.airshipId"><option value="">无</option><option v-for="s in store.airships" :key="s.id" :value="s.id">{{ s.name }}</option></select></div>
          <div class="form-row"><label>巡航速度 (m/s)</label><input type="number" class="form-control" v-model.number="selectedRoute.defaultSpeed" min="5" max="30"></div>
          <div class="form-row"><label>巡航高度 (m)</label><input type="number" class="form-control" v-model.number="selectedRoute.defaultAlt" min="18000" max="25000" step="100"></div>
          <button class="btn btn-primary btn-block" @click="saveRoute">保存航线</button>
        </div>
        <div v-else class="no-selection">请选择一条航线</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAirshipStore } from '@/stores/airship'
import { showToast } from '@/utils/toast'
const store = useAirshipStore()
interface Wp { lat:number;lon:number;alt:number;speed:number;action:string }
interface Route { id:string;name:string;airshipId:string;status:string;statusText:string;waypoints:Wp[];distance:number;defaultSpeed:number;defaultAlt:number }
const selectedRoute=ref<Route|null>(null)
const routes=ref<Route[]>([
  {id:'RTE-001',name:'北京区域巡航-A线',airshipId:'AS-001',status:'active',statusText:'执行中',distance:120,defaultSpeed:15,defaultAlt:20000,waypoints:[{lat:40.05,lon:116.35,alt:20000,speed:15,action:'巡航'},{lat:40.10,lon:116.45,alt:20500,speed:15,action:'巡航'},{lat:40.08,lon:116.55,alt:20000,speed:15,action:'巡航'},{lat:40.00,lon:116.50,alt:20000,speed:15,action:'巡航'},{lat:39.95,lon:116.40,alt:20000,speed:15,action:'返航'}]},
  {id:'RTE-002',name:'B区侦察航线',airshipId:'AS-003',status:'draft',statusText:'草稿',distance:85,defaultSpeed:12,defaultAlt:22000,waypoints:[{lat:40.20,lon:116.60,alt:22000,speed:12,action:'巡航'},{lat:40.25,lon:116.70,alt:22000,speed:12,action:'侦察'},{lat:40.22,lon:116.80,alt:22000,speed:12,action:'侦察'}]},
])
function saveRoute(){ showToast('航线已保存','success') }
</script>

<style scoped lang="scss">
.route-page{height:100%;display:flex;flex-direction:column;padding:12px;gap:12px}
.toolbar{display:flex;align-items:center;gap:12px;flex-shrink:0;.page-title{font-size:16px;font-weight:600;color:var(--color-primary)}.toolbar-spacer{flex:1}}
.route-grid{flex:1;display:grid;grid-template-columns:240px 1fr 220px;gap:8px;overflow:hidden}
.panel{background:var(--bg-panel);border:1px solid var(--border-color);border-radius:4px;display:flex;flex-direction:column;overflow:hidden}
.route-item{padding:10px 12px;border-bottom:1px solid var(--border-color);cursor:pointer;&:hover{background:rgba(0,220,255,0.05)}&.active{background:rgba(0,220,255,0.1);border-left:2px solid var(--color-primary)}.route-name{font-size:13px;font-weight:600;margin-bottom:4px}.route-meta{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--text-dim)}}
.map-placeholder{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--text-dim);.map-icon{font-size:48px;margin-bottom:8px}p{font-size:14px;color:var(--text-secondary)}}
.wp-list{width:100%;padding:20px;overflow-y:auto}
.wp-item{display:flex;align-items:center;gap:12px;padding:8px;border-bottom:1px solid var(--border-color);font-size:13px;.wp-idx{width:24px;height:24px;display:flex;align-items:center;justify-content:center;background:rgba(0,220,255,0.2);color:var(--color-primary);border-radius:50%;font-size:11px;font-weight:600}.wp-info{flex:1;color:var(--text-primary)}.wp-alt,.wp-speed{color:var(--text-dim);font-size:12px}}
.props-form{padding:12px;flex:1}
.form-row{margin-bottom:12px;label{display:block;font-size:12px;color:var(--text-secondary);margin-bottom:4px}}
.no-selection{flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-dim);font-size:13px}
.map-tools{margin-left:auto;font-weight:400}
</style>
