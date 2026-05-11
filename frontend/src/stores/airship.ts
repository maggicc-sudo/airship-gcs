import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  generateMockTelemetry,
  getMockAirships,
  getMockAlarms,
  getMockMissions,
  type Airship,
  type Telemetry,
  type Alarm,
  type Mission,
} from '@/mock/telemetry'
import * as airshipApi from '@/api/airship'
import * as telemetryApi from '@/api/telemetry'
import * as alarmApi from '@/api/alarm'
import * as missionApi from '@/api/mission'

export const useAirshipStore = defineStore('airship', () => {
  // ── Airships ──────────────────────────────────────────────
  const airships = ref<Airship[]>(getMockAirships())
  const selectedAirshipId = ref<string>(airships.value[0]?.id ?? '')
  const airshipsLoaded = ref(false)

  // ── Telemetry ─────────────────────────────────────────────
  const telemetryMap = ref<Record<string, Telemetry>>({})
  const telemetryHistory = ref<Record<string, Telemetry[]>>({})
  const telemetryInitialised = ref(false)

  // ── Alarms ────────────────────────────────────────────────
  const alarms = ref<Alarm[]>(getMockAlarms())
  const alarmsLoaded = ref(false)

  // ── Missions ──────────────────────────────────────────────
  const missions = ref<Mission[]>(getMockMissions())
  const missionsLoaded = ref(false)

  // ── Derived ───────────────────────────────────────────────
  const selectedAirship = computed(() =>
    airships.value.find(a => a.id === selectedAirshipId.value) ?? null
  )

  const selectedTelemetry = computed<Telemetry | null>(() =>
    telemetryMap.value[selectedAirshipId.value] ?? null
  )

  const activeMissions = computed(() =>
    missions.value.filter(m => m.status === 'executing' || m.status === 'ready')
  )

  const hasEmergency = computed(() =>
    alarms.value.some(a => a.level === 'emergency' && !a.acknowledged)
  )

  // ── Actions: Airships ─────────────────────────────────────
  async function fetchAirships() {
    try {
      const data = await airshipApi.getAirships()
      if (data && data.length > 0) {
        airships.value = data
        airshipsLoaded.value = true
        // keep selection if still valid
        if (!airships.value.find(a => a.id === selectedAirshipId.value)) {
          selectedAirshipId.value = airships.value[0].id
        }
      }
    } catch {
      // API unavailable – keep mock data
      console.warn('[Store] fetchAirships failed, using mock data')
    }
  }

  function selectAirship(id: string) {
    if (airships.value.find(a => a.id === id)) {
      selectedAirshipId.value = id
    }
  }

  // ── Actions: Telemetry ────────────────────────────────────
  async function fetchLatestTelemetry(airshipId?: string) {
    const ids = airshipId ? [airshipId] : airships.value.map(a => a.id)
    let anySuccess = false

    for (const id of ids) {
      try {
        const tm = await telemetryApi.getLatestTelemetry(id)
        if (tm) {
          telemetryMap.value[id] = tm
          // Append to history
          if (!telemetryHistory.value[id]) telemetryHistory.value[id] = []
          telemetryHistory.value[id].push(tm)
          if (telemetryHistory.value[id].length > 200) {
            telemetryHistory.value[id].shift()
          }
          anySuccess = true
        }
      } catch {
        // fall through
      }
    }

    if (anySuccess) {
      telemetryInitialised.value = true
    } else {
      // Fallback: generate mock telemetry
      updateTelemetryMock()
    }
  }

  function updateTelemetryMock() {
    airships.value.forEach(airship => {
      if (airship.status === 'offline') return
      const tm = generateMockTelemetry(airship)
      telemetryMap.value[airship.id] = tm
      if (!telemetryHistory.value[airship.id]) telemetryHistory.value[airship.id] = []
      telemetryHistory.value[airship.id].push(tm)
      if (telemetryHistory.value[airship.id].length > 200) {
        telemetryHistory.value[airship.id].shift()
      }
    })
  }

  // ── Actions: Alarms ───────────────────────────────────────
  async function fetchAlarms() {
    try {
      const data = await alarmApi.getAlarms({ limit: 20 })
      if (data && data.length > 0) {
        alarms.value = data
        alarmsLoaded.value = true
      }
    } catch {
      console.warn('[Store] fetchAlarms failed, using mock data')
      alarms.value = getMockAlarms()
    }
  }

  async function acknowledgeAlarm(alarmId: string, operator: string = '操作员') {
    try {
      await alarmApi.acknowledgeAlarm(alarmId, operator)
      const idx = alarms.value.findIndex(a => a.id === alarmId)
      if (idx >= 0) {
        alarms.value[idx].acknowledged = true
        alarms.value[idx].acknowledgedBy = operator
        alarms.value[idx].acknowledgedAt = Date.now()
      }
    } catch {
      // local ack fallback
      const idx = alarms.value.findIndex(a => a.id === alarmId)
      if (idx >= 0) {
        alarms.value[idx].acknowledged = true
      }
    }
  }

  // ── Actions: Missions ─────────────────────────────────────
  async function fetchMissions() {
    try {
      const data = await missionApi.getMissions()
      if (data && data.length > 0) {
        missions.value = data
        missionsLoaded.value = true
      }
    } catch {
      console.warn('[Store] fetchMissions failed, using mock data')
      missions.value = getMockMissions()
    }
  }

  return {
    // state
    airships,
    selectedAirshipId,
    airshipsLoaded,
    telemetryMap,
    telemetryHistory,
    telemetryInitialised,
    alarms,
    alarmsLoaded,
    missions,
    missionsLoaded,
    // computed
    selectedAirship,
    selectedTelemetry,
    activeMissions,
    hasEmergency,
    // actions
    fetchAirships,
    selectAirship,
    fetchLatestTelemetry,
    updateTelemetryMock,
    fetchAlarms,
    acknowledgeAlarm,
    fetchMissions,
  }
})
