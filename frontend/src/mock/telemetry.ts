export interface Airship {
  id: string
  name: string
  type: string
  status: 'online' | 'offline' | 'maintenance'
  flightMode: 'manual' | 'auto_cruise' | 'station_keep' | 'emergency_return'
  maxAltitude: number
  maxSpeed: number
  length: number
  volume: number
}

export interface Telemetry {
  ts: number
  airshipId: string
  longitude: number
  latitude: number
  altitude: number
  pitch: number
  yaw: number
  roll: number
  groundSpeed: number
  airSpeed: number
  verticalSpeed: number
  heading: number
  envelopePressureDiff: number
  heliumTemp: number
  solarPower: number
  batterySoc: number
  powerConsumption: number
  motorSpeed: number[]
  linkRssi: number
}

export interface Alarm {
  id: string
  airshipId: string
  ruleId: string
  name: string
  level: 'info' | 'warning' | 'severe' | 'emergency'
  message: string
  triggeredAt: number
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: number
}

export interface Mission {
  id: string
  name: string
  type: 'area_loiter' | 'cruise_recon' | 'comm_relay' | 'emergency'
  airshipIds: string[]
  routeId?: string
  plannedStart: number
  plannedEnd: number
  priority: number
  status: 'draft' | 'ready' | 'executing' | 'completed' | 'aborted'
  progress: number
}

// ============================================================
// Mock Airships
// ============================================================
export function getMockAirships(): Airship[] {
  return [
    {
      id: 'AS-001',
      name: '探索者-01',
      type: 'LTA-2000',
      status: 'online',
      flightMode: 'auto_cruise',
      maxAltitude: 25000,
      maxSpeed: 25,
      length: 120,
      volume: 18000,
    },
    {
      id: 'AS-002',
      name: '探索者-02',
      type: 'LTA-2000',
      status: 'online',
      flightMode: 'station_keep',
      maxAltitude: 25000,
      maxSpeed: 25,
      length: 120,
      volume: 18000,
    },
    {
      id: 'AS-003',
      name: '探索者-03',
      type: 'LTA-1500',
      status: 'offline',
      flightMode: 'station_keep',
      maxAltitude: 22000,
      maxSpeed: 22,
      length: 95,
      volume: 12000,
    },
  ]
}

// ============================================================
// Mock Telemetry Generator
// ============================================================
const basePosition: Record<string, { lat: number; lon: number; alt: number }> = {
  'AS-001': { lat: 40.05, lon: 116.35, alt: 20000 },
  'AS-002': { lat: 39.85, lon: 115.95, alt: 22000 },
  'AS-003': { lat: 40.15, lon: 116.55, alt: 0 },
}

let tick = 0
export function generateMockTelemetry(airship: Airship): Telemetry {
  tick++
  const bp = basePosition[airship.id] || { lat: 40, lon: 116, alt: 20000 }

  // Simulate slow movement
  const lat = bp.lat + Math.sin(tick * 0.001 + airship.id.charCodeAt(4) * 0.1) * 0.02
  const lon = bp.lon + Math.cos(tick * 0.0012 + airship.id.charCodeAt(4) * 0.1) * 0.03
  const alt = bp.alt + Math.sin(tick * 0.0005) * 500

  const groundSpeed = 12 + Math.sin(tick * 0.01) * 5
  const airSpeed = groundSpeed + (Math.random() - 0.5) * 4
  const heading = (tick * 0.3 + (airship.id.charCodeAt(4) - 48) * 30) % 360

  return {
    ts: Date.now(),
    airshipId: airship.id,
    longitude: lon,
    latitude: lat,
    altitude: airship.status === 'offline' ? 0 : alt,
    pitch: Math.sin(tick * 0.005) * 2,
    yaw: heading,
    roll: Math.cos(tick * 0.006) * 1.5,
    groundSpeed: airship.status === 'offline' ? 0 : groundSpeed,
    airSpeed: airship.status === 'offline' ? 0 : airSpeed,
    verticalSpeed: Math.cos(tick * 0.003) * 2,
    heading,
    envelopePressureDiff: 240 + Math.sin(tick * 0.002) * 15,
    heliumTemp: -48 + Math.sin(tick * 0.001) * 10,
    solarPower: 2200 + Math.sin(tick * 0.0008) * 800,
    batterySoc: 78 + Math.sin(tick * 0.0003) * 12,
    powerConsumption: 1800 + Math.sin(tick * 0.002) * 300,
    motorSpeed: [3200, 3150, 3180, 3220].map(s => s + Math.random() * 200 - 100),
    linkRssi: -62 + Math.random() * 5,
  }
}

// ============================================================
// Mock Alarms
// ============================================================
export function getMockAlarms(): Alarm[] {
  const now = Date.now()
  return [
    {
      id: 'ALM-001',
      airshipId: 'AS-002',
      ruleId: 'ALM-005',
      name: '强风预警',
      level: 'warning',
      message: 'AS-002 当前位置风速达22m/s，超过抗风能力80%',
      triggeredAt: now - 300000,
      acknowledged: false,
    },
    {
      id: 'ALM-002',
      airshipId: 'AS-001',
      ruleId: 'ALM-001',
      name: '电池低电量',
      level: 'severe',
      message: 'AS-001 电池SOC降至18%，启动节能预案',
      triggeredAt: now - 600000,
      acknowledged: true,
      acknowledgedBy: '操控员-张',
      acknowledgedAt: now - 550000,
    },
    {
      id: 'ALM-003',
      airshipId: 'AS-003',
      ruleId: 'ALM-001',
      name: '链路中断',
      level: 'emergency',
      message: 'AS-003 遥测数据中断超过120s',
      triggeredAt: now - 120000,
      acknowledged: false,
    },
    {
      id: 'ALM-004',
      airshipId: 'AS-001',
      ruleId: 'ALM-003',
      name: '囊体压差异常',
      level: 'info',
      message: 'AS-001 囊体压差波动增大，建议关注',
      triggeredAt: now - 1800000,
      acknowledged: false,
    },
  ]
}

// ============================================================
// Mock Missions
// ============================================================
export function getMockMissions(): Mission[] {
  const now = Date.now()
  return [
    {
      id: 'MIS-001',
      name: '北京区域驻留监视',
      type: 'area_loiter',
      airshipIds: ['AS-001'],
      routeId: 'RTE-001',
      plannedStart: now - 7200000,
      plannedEnd: now + 172800000,
      priority: 1,
      status: 'executing',
      progress: 45,
    },
    {
      id: 'MIS-002',
      name: '通信中继保障',
      type: 'comm_relay',
      airshipIds: ['AS-002'],
      plannedStart: now - 3600000,
      plannedEnd: now + 86400000,
      priority: 2,
      status: 'executing',
      progress: 72,
    },
    {
      id: 'MIS-003',
      name: '应急气象侦察',
      type: 'emergency',
      airshipIds: ['AS-001', 'AS-002'],
      plannedStart: now + 3600000,
      plannedEnd: now + 43200000,
      priority: 1,
      status: 'ready',
      progress: 0,
    },
    {
      id: 'MIS-004',
      name: '常规巡航侦察-B区',
      type: 'cruise_recon',
      airshipIds: ['AS-003'],
      routeId: 'RTE-002',
      plannedStart: now + 86400000,
      plannedEnd: now + 172800000,
      priority: 3,
      status: 'draft',
      progress: 0,
    },
  ]
}
