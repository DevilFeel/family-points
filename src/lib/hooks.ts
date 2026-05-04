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
  return useLiveQuery(() =>
    db.logs.orderBy('timestamp').reverse().limit(limit).toArray()
  )
}

export function useRewards() {
  return useLiveQuery(() => db.rewards.filter(r => r.enabled).toArray())
}

export function useAllRewards() {
  return useLiveQuery(() => db.rewards.toArray())
}

export function useTodayLogs() {
  return useLiveQuery(async () => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    return db.logs
      .where('timestamp')
      .aboveOrEqual(startOfDay.getTime())
      .reverse()
      .sortBy('timestamp')
  })
}

export function useTotalStats() {
  return useLiveQuery(async () => {
    const allLogs = await db.logs.toArray()
    const earn = allLogs.filter(l => l.amount > 0).reduce((s, l) => s + l.amount, 0)
    const spend = allLogs.filter(l => l.amount < 0).reduce((s, l) => s + Math.abs(l.amount), 0)
    const total = allLogs.length
    return { earn, spend, total }
  })
}

export function useTodayStats() {
  return useLiveQuery(async () => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const todayLogs = await db.logs.where('timestamp').aboveOrEqual(startOfDay.getTime()).toArray()
    const earn = todayLogs.filter(l => l.amount > 0).reduce((s, l) => s + l.amount, 0)
    const spend = todayLogs.filter(l => l.amount < 0).reduce((s, l) => s + Math.abs(l.amount), 0)
    return { earn, spend, count: todayLogs.length }
  })
}

export function useWeeklyStats() {
  return useLiveQuery(async () => {
    const days: { label: string; earn: number; spend: number; date: string }[] = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      const dayLogs = await db.logs.where('timestamp').between(d.getTime(), next.getTime()).toArray()
      const earn = dayLogs.filter(l => l.amount > 0).reduce((s, l) => s + l.amount, 0)
      const spend = dayLogs.filter(l => l.amount < 0).reduce((s, l) => s + Math.abs(l.amount), 0)
      days.push({
        label: d.toLocaleDateString('zh-CN', { weekday: 'short' }),
        earn,
        spend,
        date: d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
      })
    }
    return days
  })
}
