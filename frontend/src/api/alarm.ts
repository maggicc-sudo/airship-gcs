import http from './http'
import type { Alarm } from '@/mock/telemetry'

export interface AlarmRule {
  id: string
  name: string
  description: string
  level: Alarm['level']
  field: string
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'change_rate'
  threshold: number
  enabled: boolean
}

export interface AlarmListResponse {
  data: Alarm[]
  total: number
}

export interface AlarmDetailResponse {
  data: Alarm
}

export interface AlarmRulesResponse {
  data: AlarmRule[]
}

export interface AlarmFilters {
  level?: string
  airshipId?: string
  acknowledged?: boolean
  startTime?: number
  endTime?: number
  limit?: number
}

/**
 * 获取告警列表
 */
export async function getAlarms(filters: AlarmFilters = {}): Promise<Alarm[]> {
  const res = await http.get<AlarmListResponse>('/alarms', { params: filters })
  return res.data.data ?? []
}

/**
 * 确认告警
 */
export async function acknowledgeAlarm(alarmId: string, operator: string = '操作员'): Promise<Alarm> {
  const res = await http.post<AlarmDetailResponse>(`/alarms/${alarmId}/acknowledge`, { operator })
  return res.data.data
}

/**
 * 获取告警规则列表
 */
export async function getAlarmRules(): Promise<AlarmRule[]> {
  const res = await http.get<AlarmRulesResponse>('/alarm-rules')
  return res.data.data ?? []
}
