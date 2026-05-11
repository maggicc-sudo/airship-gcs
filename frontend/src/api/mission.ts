import http from './http'
import type { Mission } from '@/mock/telemetry'

export interface MissionListResponse {
  data: Mission[]
  total: number
}

export interface MissionDetailResponse {
  data: Mission
}

/**
 * 获取所有任务
 */
export async function getMissions(params?: {
  status?: string
  airshipId?: string
}): Promise<Mission[]> {
  const res = await http.get<MissionListResponse>('/missions', { params })
  return res.data.data ?? []
}

/**
 * 获取单个任务
 */
export async function getMission(id: string): Promise<Mission | null> {
  const res = await http.get<MissionDetailResponse>(`/missions/${id}`)
  return res.data.data ?? null
}

/**
 * 创建任务
 */
export async function createMission(mission: Omit<Mission, 'id'>): Promise<Mission> {
  const res = await http.post<MissionDetailResponse>('/missions', mission)
  return res.data.data
}

/**
 * 更新任务
 */
export async function updateMission(id: string, mission: Partial<Mission>): Promise<Mission> {
  const res = await http.put<MissionDetailResponse>(`/missions/${id}`, mission)
  return res.data.data
}

/**
 * 删除任务
 */
export async function deleteMission(id: string): Promise<void> {
  await http.delete(`/missions/${id}`)
}

/**
 * 启动任务
 */
export async function startMission(id: string): Promise<Mission> {
  const res = await http.post<MissionDetailResponse>(`/missions/${id}/start`)
  return res.data.data
}

/**
 * 中止任务
 */
export async function abortMission(id: string): Promise<Mission> {
  const res = await http.post<MissionDetailResponse>(`/missions/${id}/abort`)
  return res.data.data
}
