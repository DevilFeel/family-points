import Dexie, { type EntityTable } from 'dexie'

export interface Profile {
  id?: number
  name: string
  balance: number
}

export interface Task {
  id?: number
  title: string
  points: number
  icon: string
  sortOrder: number
}

export interface Log {
  id?: number
  profileId: number
  amount: number
  reason: string
  type: 'earn' | 'redeem' | 'manual' | 'deduct'
  timestamp: number
}

export interface Reward {
  id?: number
  title: string
  cost: number
  icon: string
  enabled: boolean
}

const db = new Dexie('FamilyPointsDB') as Dexie & {
  profiles: EntityTable<Profile, 'id'>
  tasks: EntityTable<Task, 'id'>
  logs: EntityTable<Log, 'id'>
  rewards: EntityTable<Reward, 'id'>
}

db.version(1).stores({
  profiles: '++id',
  tasks: '++id, sortOrder',
  logs: '++id, profileId, timestamp',
  rewards: '++id',
})

export { db }
