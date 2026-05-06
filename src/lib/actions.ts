import { db, type Log, type Profile, type Reward, type Task } from './db'

async function getCurrentProfile() {
  return db.profiles.toCollection().first()
}

async function requireCurrentProfile() {
  const profile = await getCurrentProfile()
  if (!profile?.id) {
    throw new Error('未找到当前孩子资料')
  }

  return profile
}

async function writeBalanceAndLog(profile: Profile, log: Omit<Log, 'id' | 'profileId' | 'timestamp'>) {
  await db.profiles.update(profile.id!, { balance: profile.balance + log.amount })
  await db.logs.add({
    profileId: profile.id!,
    amount: log.amount,
    reason: log.reason,
    type: log.type,
    timestamp: Date.now(),
  })
}

export async function addPoints(taskId: number) {
  const task = await db.tasks.get(taskId)
  if (!task) return

  await db.transaction('rw', [db.profiles, db.logs], async () => {
    const profile = await requireCurrentProfile()
    await writeBalanceAndLog(profile, {
      amount: task.points,
      reason: task.title,
      type: 'earn',
    })
  })
}

export async function manualAdjust(amount: number, reason: string, type: 'manual' | 'deduct') {
  const finalAmount = type === 'deduct' ? -Math.abs(amount) : Math.abs(amount)

  await db.transaction('rw', [db.profiles, db.logs], async () => {
    const profile = await requireCurrentProfile()
    await writeBalanceAndLog(profile, {
      amount: finalAmount,
      reason,
      type,
    })
  })
}

export async function redeemReward(rewardId: number, allowNegative = false) {
  const reward = await db.rewards.get(rewardId)
  if (!reward) return false

  return db.transaction('rw', [db.profiles, db.logs], async () => {
    const profile = await requireCurrentProfile()
    if (!allowNegative && profile.balance < reward.cost) return false

    await writeBalanceAndLog(profile, {
      amount: -reward.cost,
      reason: `兑换：${reward.title}`,
      type: 'redeem',
    })

    return true
  })
}

export async function updateProfile(data: Partial<Pick<Profile, 'name' | 'balance'>>) {
  const profile = await getCurrentProfile()
  if (!profile?.id) return
  await db.profiles.update(profile.id, data)
}

export async function updateTask(id: number, data: Partial<Pick<Task, 'title' | 'points' | 'icon' | 'sortOrder'>>) {
  await db.tasks.update(id, data)
}

export async function addTask(data: Omit<Task, 'id'>) {
  return db.tasks.add(data)
}

export async function deleteTask(id: number) {
  await db.tasks.delete(id)
}

export async function addReward(data: Omit<Reward, 'id'>) {
  return db.rewards.add(data)
}

export async function deleteReward(id: number) {
  await db.rewards.delete(id)
}

export async function deleteLog(id: number) {
  const log = await db.logs.get(id)
  if (!log) return

  await db.transaction('rw', [db.profiles, db.logs], async () => {
    const profile = await requireCurrentProfile()
    await db.profiles.update(profile.id!, { balance: profile.balance - log.amount })
    await db.logs.delete(id)
  })
}

export async function exportDatabase() {
  const data = {
    profiles: await db.profiles.toArray(),
    tasks: await db.tasks.toArray(),
    logs: await db.logs.toArray(),
    rewards: await db.rewards.toArray(),
    exportedAt: new Date().toISOString(),
    version: 1,
  }

  return JSON.stringify(data, null, 2)
}

export async function importDatabase(json: string) {
  const data = JSON.parse(json)
  if (!data.version || !Array.isArray(data.profiles)) {
    throw new Error('无效的备份文件')
  }

  await db.transaction('rw', [db.profiles, db.tasks, db.logs, db.rewards], async () => {
    await db.profiles.clear()
    await db.tasks.clear()
    await db.logs.clear()
    await db.rewards.clear()

    if (data.profiles?.length) await db.profiles.bulkAdd(data.profiles)
    if (data.tasks?.length) await db.tasks.bulkAdd(data.tasks)
    if (data.logs?.length) await db.logs.bulkAdd(data.logs)
    if (data.rewards?.length) await db.rewards.bulkAdd(data.rewards)
  })
}

export async function resetDatabase() {
  await db.transaction('rw', [db.profiles, db.tasks, db.logs, db.rewards], async () => {
    await db.profiles.clear()
    await db.tasks.clear()
    await db.logs.clear()
    await db.rewards.clear()
  })
}
