'use client'

import { useState, useEffect, useCallback } from 'react'
import { useProfile, useTasks, useAllRewards, useLogs, useTodayStats } from '@/lib/hooks'
import { seedDatabase } from '@/lib/seed'
import { manualAdjust, redeemReward, addTask, updateTask, deleteTask, addReward, deleteReward } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { EmojiPicker } from '@/components/EmojiPicker'
import Link from 'next/link'

export default function ParentPage() {
  const [mounted, setMounted] = useState(false)
  const [feedback, setFeedback] = useState<{ text: string; points: number } | null>(null)
  const [editingTask, setEditingTask] = useState<{ id: number; title: string; points: number; icon: string } | null>(null)
  const [editingIcon, setEditingIcon] = useState('⭐')

  useEffect(() => {
    seedDatabase().then(() => setMounted(true))
  }, [])

  const profile = useProfile()
  const tasks = useTasks()
  const rewards = useAllRewards()
  const logs = useLogs()
  const todayStats = useTodayStats()

  const showFeedback = useCallback((text: string, points: number) => {
    setFeedback({ text, points })
  }, [])

  useEffect(() => {
    if (!feedback) return
    const t = setTimeout(() => setFeedback(null), 1200)
    return () => clearTimeout(t)
  }, [feedback])

  const handleManualAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const amount = Number(form.get('amount'))
    const reason = form.get('reason') as string
    if (!amount || !reason) return
    await manualAdjust(Math.abs(amount), reason, amount >= 0 ? 'manual' : 'deduct')
    ;(e.target as HTMLFormElement).reset()
    showFeedback(reason, amount)
  }

  const handleRedeem = async (rewardId: number, title: string, cost: number) => {
    const ok = await redeemReward(rewardId)
    if (ok) {
      showFeedback(`兑换: ${title}`, -cost)
    }
  }

  if (!mounted) {
    return <div className="min-h-dvh flex items-center justify-center text-amber-600">加载中...</div>
  }

  return (
    <div className="min-h-dvh pb-6">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl">←</Link>
            <div>
              <div className="font-bold text-amber-800">家长管理</div>
              <div className="text-sm text-muted-foreground">
                {profile?.name}: {profile?.balance ?? 0} 分
              </div>
            </div>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="sm">设置</Button>
          </Link>
        </div>
      </div>

      {/* Feedback animation */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 1.2 }}
            className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className={`text-3xl font-bold px-6 py-3 rounded-2xl shadow-lg ${
              feedback.points >= 0
                ? 'bg-green-500 text-white'
                : 'bg-orange-500 text-white'
            }`}>
              {feedback.points >= 0 ? '+' : ''}{feedback.points} {feedback.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit task modal */}
      <AnimatePresence>
        {editingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setEditingTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="font-bold text-lg">编辑任务</div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const form = new FormData(e.currentTarget)
                  await updateTask(editingTask.id, {
                    title: form.get('title') as string,
                    points: 1,
                    icon: editingIcon,
                  })
                  setEditingTask(null)
                }}
                className="space-y-3"
              >
                <div>
                  <Label>任务名称</Label>
                  <Input name="title" defaultValue={editingTask.title} required />
                </div>
                <EmojiPicker value={editingIcon} onChange={setEditingIcon} />
                <div className="flex gap-2">
                  <Button type="button" variant="destructive" className="flex-1"
                    onClick={async () => {
                      await deleteTask(editingTask.id)
                      setEditingTask(null)
                    }}
                  >
                    删除
                  </Button>
                  <Button type="submit" className="flex-1">保存</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 mt-4">
        <Tabs defaultValue="tasks">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="tasks">任务管理</TabsTrigger>
            <TabsTrigger value="manual">调整</TabsTrigger>
            <TabsTrigger value="rewards">奖励</TabsTrigger>
            <TabsTrigger value="log">记录</TabsTrigger>
          </TabsList>

          {/* Task management list */}
          <TabsContent value="tasks" className="mt-4">
            <div className="space-y-2">
              {tasks?.map((task) => (
                <Card key={task.id}>
                  <CardContent className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{task.icon}</span>
                      <div>
                        <div className="font-medium">{task.title}</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingIcon(task.icon)
                        setEditingTask({ id: task.id!, title: task.title, points: task.points, icon: task.icon })
                      }}
                    >
                      编辑
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <TaskFormDialog onAdd={addTask} count={tasks?.length ?? 0} />
          </TabsContent>

          {/* Manual adjust */}
          <TabsContent value="manual" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleManualAdd} className="space-y-4">
                  <div>
                    <Label>分值（正数加分，负数扣分）</Label>
                    <Input type="number" name="amount" placeholder="输入分值" required />
                  </div>
                  <div>
                    <Label>原因</Label>
                    <Input name="reason" placeholder="备注原因" required />
                  </div>
                  <Button type="submit" className="w-full">确认</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardContent className="pt-6 space-y-3">
                <div className="font-medium">快速扣分</div>
                {[-1, -3, -5].map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    className="w-full justify-between"
                    onClick={async () => {
                      await manualAdjust(Math.abs(amt), '扣分', 'deduct')
                      showFeedback('扣分', amt)
                    }}
                  >
                    <span>{amt}分</span>
                    <span className="text-red-500">扣分</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards */}
          <TabsContent value="rewards" className="mt-4">
            <div className="space-y-3">
              {rewards?.map((reward) => (
                <Card key={reward.id}>
                  <CardContent className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{reward.icon}</span>
                      <div>
                        <div className="font-medium">{reward.title}</div>
                        <div className="text-sm text-muted-foreground">{reward.cost}分</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteReward(reward.id!)}
                      >
                        删除
                      </Button>
                      <Button
                        size="sm"
                        disabled={(profile?.balance ?? 0) < reward.cost}
                        onClick={() => handleRedeem(reward.id!, reward.title, reward.cost)}
                      >
                        {(profile?.balance ?? 0) < reward.cost ? '积分不足' : '兑换'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <RewardFormDialog onAdd={addReward} />
          </TabsContent>

          {/* Activity log */}
          <TabsContent value="log" className="mt-4">
            {todayStats && (
              <Card className="mb-3">
                <CardContent className="flex items-center justify-around py-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">+{todayStats.earn}</div>
                    <div className="text-xs text-muted-foreground">今日获得</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">-{todayStats.spend}</div>
                    <div className="text-xs text-muted-foreground">今日消耗</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-amber-600">{todayStats.count}</div>
                    <div className="text-xs text-muted-foreground">操作次数</div>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="space-y-2">
              {logs?.map((log) => (
                <Card key={log.id}>
                  <CardContent className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm font-medium">{log.reason}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString('zh-CN')}
                      </div>
                    </div>
                    <Badge variant={log.amount >= 0 ? 'default' : 'destructive'}>
                      {log.amount >= 0 ? '+' : ''}{log.amount}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
              {(!logs || logs.length === 0) && (
                <div className="text-center text-muted-foreground py-8">暂无记录</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function TaskFormDialog({ onAdd, count }: { onAdd: (data: { title: string; points: number; icon: string; sortOrder: number }) => Promise<number | undefined>, count: number }) {
  const [open, setOpen] = useState(false)
  const [icon, setIcon] = useState('⭐')

  return (
    <>
      <Button variant="outline" className="w-full mt-4" onClick={() => { setIcon('⭐'); setOpen(true) }}>
        + 添加任务
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="font-bold text-lg mb-4">添加任务</div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const form = new FormData(e.currentTarget)
                  await onAdd({
                    title: form.get('title') as string,
                    points: 1,
                    icon,
                    sortOrder: count,
                  })
                  setOpen(false)
                }}
                className="space-y-3"
              >
                <div>
                  <Label>任务名称</Label>
                  <Input name="title" required />
                </div>
                <EmojiPicker value={icon} onChange={setIcon} />
                <Button type="submit" className="w-full">添加</Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function RewardFormDialog({ onAdd }: { onAdd: (data: { title: string; cost: number; icon: string; enabled: boolean }) => Promise<number | undefined> }) {
  const [open, setOpen] = useState(false)
  const [icon, setIcon] = useState('🎁')

  return (
    <>
      <Button variant="outline" className="w-full mt-4" onClick={() => { setIcon('🎁'); setOpen(true) }}>
        + 添加奖励
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="font-bold text-lg mb-4">添加奖励</div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const form = new FormData(e.currentTarget)
                  await onAdd({
                    title: form.get('title') as string,
                    cost: Number(form.get('cost')) || 10,
                    icon,
                    enabled: true,
                  })
                  setOpen(false)
                }}
                className="space-y-3"
              >
                <div>
                  <Label>奖励名称</Label>
                  <Input name="title" required />
                </div>
                <div>
                  <Label>所需积分</Label>
                  <Input type="number" name="cost" defaultValue={10} min={1} required />
                </div>
                <EmojiPicker value={icon} onChange={setIcon} />
                <Button type="submit" className="w-full">添加</Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
