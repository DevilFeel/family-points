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
