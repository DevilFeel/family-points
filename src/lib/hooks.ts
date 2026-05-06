'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'

export function useProfile() {
  return useLiveQuery(() => db.profiles.toCollection().first())
}

export function useTasks() {
  return useLiveQuery(() => db.tasks.orderBy('sortOrder').toArray())
}

export function useLogs(limit = 50) {
  return useLiveQuery(() => db.logs.orderBy('timestamp').reverse().limit(limit).toArray())
}

export function useEnabledRewards() {
  return useLiveQuery(() => db.rewards.filter((reward) => reward.enabled).toArray())
}

export function useAllRewards() {
  return useLiveQuery(() => db.rewards.toArray())
}

export function useTodayLogs() {
  return useLiveQuery(async () => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    return db.logs.where('timestamp').aboveOrEqual(startOfDay.getTime()).reverse().sortBy('timestamp')
  })
}

export function useTotalStats() {
  return useLiveQuery(async () => {
    const allLogs = await db.logs.toArray()
    const earn = allLogs.filter((log) => log.amount > 0).reduce((sum, log) => sum + log.amount, 0)
    const spend = allLogs.filter((log) => log.amount < 0).reduce((sum, log) => sum + Math.abs(log.amount), 0)
    return { earn, spend, total: allLogs.length }
  })
}

export function useTodayStats() {
  return useLiveQuery(async () => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const todayLogs = await db.logs.where('timestamp').aboveOrEqual(startOfDay.getTime()).toArray()
    const earn = todayLogs.filter((log) => log.amount > 0).reduce((sum, log) => sum + log.amount, 0)
    const spend = todayLogs.filter((log) => log.amount < 0).reduce((sum, log) => sum + Math.abs(log.amount), 0)
    return { earn, spend, count: todayLogs.length }
  })
}

export function useWeeklyStats() {
  return useLiveQuery(async () => {
    const days: { label: string; earn: number; spend: number; date: string }[] = []
    const now = new Date()

    for (let i = 6; i >= 0; i -= 1) {
      const dayStart = new Date(now)
      dayStart.setHours(0, 0, 0, 0)
      dayStart.setDate(dayStart.getDate() - i)

      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const dayLogs = await db.logs.where('timestamp').between(dayStart.getTime(), dayEnd.getTime()).toArray()
      const earn = dayLogs.filter((log) => log.amount > 0).reduce((sum, log) => sum + log.amount, 0)
      const spend = dayLogs.filter((log) => log.amount < 0).reduce((sum, log) => sum + Math.abs(log.amount), 0)

      days.push({
        label: dayStart.toLocaleDateString('zh-CN', { weekday: 'short' }),
        earn,
        spend,
        date: dayStart.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
      })
    }

    return days
  })
}
