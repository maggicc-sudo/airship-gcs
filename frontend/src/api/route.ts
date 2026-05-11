import http from './http'

export interface Waypoint {
  lat: number
  lon: number
  alt: number
  name?: string
  action?: 'flyby' | 'loiter' | 'land'
}

export interface Route {
  id: string
  name: string
  waypoints: Waypoint[]
  totalDistance: number
  createdBy?: string
  createdAt: number
  updatedAt: number
}

export interface RouteListResponse {
  data: Route[]
  total: number
}

export interface RouteDetailResponse {
  data: Route
}

/**
 * 获取所有航线
 */
export async function getRoutes(): Promise<Route[]> {
  const res = await http.get<RouteListResponse>('/routes')
  return res.data.data ?? []
}

/**
 * 获取单条航线
 */
export async function getRoute(id: string): Promise<Route | null> {
  const res = await http.get<RouteDetailResponse>(`/routes/${id}`)
  return res.data.data ?? null
}

/**
 * 创建航线
 */
export async function createRoute(route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route> {
  const res = await http.post<RouteDetailResponse>('/routes', route)
  return res.data.data
}

/**
 * 更新航线
 */
export async function updateRoute(id: string, route: Partial<Route>): Promise<Route> {
  const res = await http.put<RouteDetailResponse>(`/routes/${id}`, route)
  return res.data.data
}

/**
 * 删除航线
 */
export async function deleteRoute(id: string): Promise<void> {
  await http.delete(`/routes/${id}`)
}
