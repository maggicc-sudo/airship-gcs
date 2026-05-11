import http from './http'
import type { Telemetry } from '@/mock/telemetry'

export interface TelemetryLatestResponse {
  data: Telemetry
}

export interface TelemetryHistoryResponse {
  data: Telemetry[]
  total: number
}

/**
 * 获取飞艇最新遥测数据
 */
export async function getLatestTelemetry(airshipId: string): Promise<Telemetry | null> {
  const res = await http.get<TelemetryLatestResponse>(`/airships/${airshipId}/telemetry/latest`)
  return res.data.data ?? null
}

/**
 * 获取遥测历史数据
 * @param airshipId 飞艇ID
 * @param durationSeconds 时间范围（秒），默认 3600（1小时）
 * @param limit 最大数据点数
 */
export async function getTelemetryHistory(
  airshipId: string,
  durationSeconds: number = 3600,
  limit: number = 120
): Promise<Telemetry[]> {
  const res = await http.get<TelemetryHistoryResponse>(`/airships/${airshipId}/telemetry`, {
    params: { duration: durationSeconds, limit },
  })
  return res.data.data ?? []
}
