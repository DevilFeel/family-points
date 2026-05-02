import { db, type Profile, type Task, type Reward } from './db'

const DEFAULT_TASKS: Omit<Task, 'id'>[] = [
  { title: '早起', points: 1, icon: '☀️', sortOrder: 0 },
  { title: '阅读', points: 1, icon: '📖', sortOrder: 1 },
  { title: '收拾房间', points: 1, icon: '🧹', sortOrder: 2 },
  { title: '帮忙做家务', points: 1, icon: '🏠', sortOrder: 3 },
  { title: '认真吃饭', points: 1, icon: '🍚', sortOrder: 4 },
  { title: '按时睡觉', points: 1, icon: '🌙', sortOrder: 5 },
  { title: '画画/手工', points: 1, icon: '🎨', sortOrder: 6 },
  { title: '运动锻炼', points: 1, icon: '⚽', sortOrder: 7 },
]

const DEFAULT_REWARDS: Omit<Reward, 'id'>[] = [
  { title: '看一集动画片', cost: 20, icon: '📺', enabled: true },
  { title: '吃零食', cost: 15, icon: '🍪', enabled: true },
  { title: '去公园玩', cost: 50, icon: '🌳', enabled: true },
  { title: '买新玩具', cost: 100, icon: '🧸', enabled: true },
  { title: '看电影', cost: 80, icon: '🎬', enabled: true },
]

const DEFAULT_PROFILE: Omit<Profile, 'id'> = {
  name: '宝贝',
  balance: 0,
}

export async function seedDatabase() {
  const profileCount = await db.profiles.count()
  if (profileCount === 0) {
    await db.profiles.add(DEFAULT_PROFILE)
  }

  const taskCount = await db.tasks.count()
  if (taskCount === 0) {
    await db.tasks.bulkAdd(DEFAULT_TASKS)
  }

  const rewardCount = await db.rewards.count()
  if (rewardCount === 0) {
    await db.rewards.bulkAdd(DEFAULT_REWARDS)
  }
}
