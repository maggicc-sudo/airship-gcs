import http from './http'

export type CommandType =
  | 'takeoff'
  | 'land'
  | 'altitude_change'
  | 'speed_change'
  | 'heading_change'
  | 'mode_change'
  | 'station_keep'
  | 'emergency_return'
  | 'motor_control'

export interface CommandParams {
  value?: number
  mode?: string
  motors?: number[]
  [key: string]: unknown
}

export interface CommandRequest {
  airshipId: string
  commandType: CommandType
  params: CommandParams
}

export interface CommandLogEntry {
  id: string
  airshipId: string
  commandType: string
  params: CommandParams
  status: 'pending' | 'executing' | 'success' | 'failed'
  operator: string
  createdAt: number
  executedAt?: number
  message?: string
}

export interface CommandResponse {
  data: CommandLogEntry
  message: string
}

export interface CommandLogResponse {
  data: CommandLogEntry[]
  total: number
}

/**
 * 向飞艇下发控制指令
 */
export async function sendCommand(
  airshipId: string,
  commandType: CommandType,
  params: CommandParams = {}
): Promise<CommandLogEntry> {
  const res = await http.post<CommandResponse>('/commands', {
    airshipId,
    commandType,
    params,
  })
  return res.data.data
}

/**
 * 获取飞艇指令历史
 */
export async function getCommandLog(
  airshipId: string,
  limit: number = 50
): Promise<CommandLogEntry[]> {
  const res = await http.get<CommandLogResponse>(`/airships/${airshipId}/commands`, {
    params: { limit },
  })
  return res.data.data ?? []
}
