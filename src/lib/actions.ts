import { db } from './db'

export async function addPoints(taskId: number) {
  const task = await db.tasks.get(taskId)
  if (!task) return

  await db.transaction('rw', [db.profiles, db.logs], async () => {
    const profile = await db.profiles.toCollection().first()
    if (!profile?.id) return
    await db.profiles.update(profile.id, { balance: profile.balance + task.points })
    await db.logs.add({
      profileId: profile.id,
      amount: task.points,
      reason: task.title,
      type: 'earn',
      timestamp: Date.now(),
    })
  })
}

export async function manualAdjust(amount: number, reason: string, type: 'manual' | 'deduct') {
  const finalAmount = type === 'deduct' ? -Math.abs(amount) : amount

  await db.transaction('rw', [db.profiles, db.logs], async () => {
    const profile = await db.profiles.toCollection().first()
    if (!profile?.id) return
    await db.profiles.update(profile.id, { balance: profile.balance + finalAmount })
    await db.logs.add({
      profileId: profile.id,
      amount: finalAmount,
      reason,
      type,
      timestamp: Date.now(),
    })
  })
}

export async function redeemReward(rewardId: number) {
  const reward = await db.rewards.get(rewardId)
  if (!reward) return false

  return db.transaction('rw', [db.profiles, db.logs], async () => {
    const profile = await db.profiles.toCollection().first()
    if (!profile?.id || profile.balance < reward.cost) return false
    await db.profiles.update(profile.id, { balance: profile.balance - reward.cost })
    await db.logs.add({
      profileId: profile.id,
      amount: -reward.cost,
      reason: `兑换: ${reward.title}`,
      type: 'redeem',
      timestamp: Date.now(),
    })
    return true
  })
}

export async function updateProfile(data: Partial<{
  name: string
  balance: number
}>) {
  const profile = await db.profiles.toCollection().first()
  if (!profile?.id) return
  await db.profiles.update(profile.id, data)
}

export async function updateTask(id: number, data: Partial<{ title: string; points: number; icon: string; sortOrder: number }>) {
  await db.tasks.update(id, data)
}

export async function addTask(data: Omit<{ title: string; points: number; icon: string; sortOrder: number }, 'id'>) {
  return db.tasks.add(data)
}

export async function deleteTask(id: number) {
  await db.tasks.delete(id)
}

export async function addReward(data: Omit<{ title: string; cost: number; icon: string; enabled: boolean }, 'id'>) {
  return db.rewards.add(data)
}

export async function deleteReward(id: number) {
  await db.rewards.delete(id)
}

export async function deleteLog(id: number) {
  const log = await db.logs.get(id)
  if (!log) return

  await db.transaction('rw', [db.profiles, db.logs], async () => {
    const profile = await db.profiles.toCollection().first()
    if (!profile?.id) return

    // 删除记录时，积分要反向调整
    // 如果是加分记录（amount > 0），删除后需要减掉这些积分
    // 如果是扣分记录（amount < 0），删除后需要加回这些积分
    const balanceAdjustment = -log.amount
    await db.profiles.update(profile.id, { balance: profile.balance + balanceAdjustment })
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
