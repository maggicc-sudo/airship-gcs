import http from './http'
import type { Airship } from '@/mock/telemetry'

export interface AirshipListResponse {
  data: Airship[]
  total: number
}

export interface AirshipDetailResponse {
  data: Airship
}

/**
 * 获取所有飞艇列表
 */
export async function getAirships(): Promise<Airship[]> {
  const res = await http.get<AirshipListResponse>('/airships')
  return res.data.data ?? []
}

/**
 * 获取单个飞艇详情
 */
export async function getAirship(id: string): Promise<Airship | null> {
  const res = await http.get<AirshipDetailResponse>(`/airships/${id}`)
  return res.data.data ?? null
}
