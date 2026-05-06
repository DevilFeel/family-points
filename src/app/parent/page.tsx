'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FeedbackToast } from '@/components/FeedbackToast'
import { LogList } from '@/components/LogList'
import { RewardFormDialog } from '@/components/RewardFormDialog'
import { TaskFormDialog } from '@/components/TaskFormDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmojiPicker } from '@/components/EmojiPicker'
import { addReward, addTask, deleteLog, deleteReward, deleteTask, redeemReward, updateTask } from '@/lib/actions'
import { useAllRewards, useLogs, useProfile, useTasks, useTodayStats, useTotalStats, useWeeklyStats } from '@/lib/hooks'
import { seedDatabase } from '@/lib/seed'

export default function ParentPage() {
  const [mounted, setMounted] = useState(false)
  const [feedback, setFeedback] = useState<{ text: string; points: number } | null>(null)
  const [editingTask, setEditingTask] = useState<{ id: number; title: string; points: number; icon: string } | null>(null)
  const [editingIcon, setEditingIcon] = useState('⭐')
  const [logLimit, setLogLimit] = useState(20)

  useEffect(() => {
    seedDatabase().then(() => setMounted(true))
  }, [])

  const profile = useProfile()
  const tasks = useTasks()
  const rewards = useAllRewards()
  const logs = useLogs(logLimit)
  const totalStats = useTotalStats()
  const todayStats = useTodayStats()
  const weeklyStats = useWeeklyStats()

  const showFeedback = useCallback((text: string, points: number) => {
    setFeedback({ text, points })
  }, [])

  useEffect(() => {
    if (!feedback) return
    const timeout = setTimeout(() => setFeedback(null), 1200)
    return () => clearTimeout(timeout)
  }, [feedback])

  const handleRedeem = async (rewardId: number, title: string, cost: number) => {
    const ok = await redeemReward(rewardId)
    if (ok) {
      showFeedback(`兑换：${title}`, -cost)
    }
  }

  if (!mounted) {
    return <div className="flex min-h-dvh items-center justify-center text-blue-600">加载中...</div>
  }

  return (
    <div className="min-h-dvh bg-white pb-6">
      <div className="sticky top-0 z-40 bg-blue-600 px-4 py-3 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold text-white">
              ←
            </Link>
            <div>
              <div className="text-lg font-bold">家长管理</div>
              <div className="text-sm text-blue-200">
                {profile?.name}: {profile?.balance ?? 0} 分
              </div>
            </div>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="text-blue-100 hover:bg-blue-700 hover:text-white">
              设置
            </Button>
          </Link>
        </div>
      </div>

      <FeedbackToast feedback={feedback} topClassName="top-1/3" />

      <AnimatePresence>
        {editingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setEditingTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-xl bg-white p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="text-lg font-bold">编辑任务</div>
              <form
                className="space-y-3"
                onSubmit={async (event) => {
                  event.preventDefault()
                  const form = new FormData(event.currentTarget)
                  await updateTask(editingTask.id, {
                    title: form.get('title') as string,
                    points: 1,
                    icon: editingIcon,
                  })
                  setEditingTask(null)
                }}
              >
                <div>
                  <Label>任务名称</Label>
                  <Input name="title" defaultValue={editingTask.title} required />
                </div>
                <EmojiPicker value={editingIcon} onChange={setEditingIcon} />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    className="flex-1"
                    onClick={async () => {
                      await deleteTask(editingTask.id)
                      setEditingTask(null)
                    }}
                  >
                    删除
                  </Button>
                  <Button type="submit" className="flex-1">
                    保存
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 px-4">
        <Tabs defaultValue="tasks">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="tasks">任务</TabsTrigger>
            <TabsTrigger value="rewards">奖励</TabsTrigger>
            <TabsTrigger value="log">记录</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-4">
            <div className="space-y-2">
              {tasks?.map((task) => (
                <Card key={task.id}>
                  <CardContent className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{task.icon}</span>
                      <div className="font-medium">{task.title}</div>
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
                      <Button size="sm" variant="outline" onClick={() => deleteReward(reward.id!)}>
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

          <TabsContent value="log" className="mt-4">
            {totalStats && (
              <Card className="mb-3">
                <CardContent className="flex items-center justify-around py-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">+{totalStats.earn}</div>
                    <div className="text-xs text-muted-foreground">累计获得</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-500">-{totalStats.spend}</div>
                    <div className="text-xs text-muted-foreground">累计消费</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{totalStats.total}</div>
                    <div className="text-xs text-muted-foreground">操作次数</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {todayStats && (
              <Card className="mb-3">
                <CardContent className="flex items-center justify-around py-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">+{todayStats.earn}</div>
                    <div className="text-xs text-muted-foreground">今日获得</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-500">-{todayStats.spend}</div>
                    <div className="text-xs text-muted-foreground">今日消费</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{todayStats.count}</div>
                    <div className="text-xs text-muted-foreground">操作次数</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {weeklyStats && (
              <Card className="mb-3">
                <CardContent className="pb-3 pt-4">
                  <div className="mb-3 text-sm font-semibold text-gray-700">近 7 天趋势</div>
                  {weeklyStats.some((day) => day.earn > 0 || day.spend > 0) ? (
                    <>
                      <div className="flex h-24 items-end gap-1.5">
                        {weeklyStats.map((day) => {
                          const maxValue = Math.max(...weeklyStats.map((item) => Math.max(item.earn, item.spend)), 1)
                          const earnHeight = Math.max((day.earn / maxValue) * 100, day.earn > 0 ? 12 : 0)
                          const spendHeight = Math.max((day.spend / maxValue) * 100, day.spend > 0 ? 12 : 0)
                          return (
                            <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                              <div className="flex w-full items-end justify-center gap-0.5" style={{ height: '72px' }}>
                                <div
                                  className="w-2.5 rounded-t-sm bg-green-400 transition-all"
                                  style={{ height: `${earnHeight}%`, minHeight: day.earn > 0 ? '8px' : '0' }}
                                  title={`获得 ${day.earn}`}
                                />
                                <div
                                  className="w-2.5 rounded-t-sm bg-red-400 transition-all"
                                  style={{ height: `${spendHeight}%`, minHeight: day.spend > 0 ? '8px' : '0' }}
                                  title={`消费 ${day.spend}`}
                                />
                              </div>
                              <div className="text-[10px] leading-none text-muted-foreground">{day.label}</div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-400" />
                          获得
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-400" />
                          消费
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-center text-sm text-muted-foreground">暂无数据，开始记录后这里会显示趋势图</div>
                  )}
                </CardContent>
              </Card>
            )}

            <LogList
              logs={logs}
              canLoadMore={Boolean(logs && logs.length >= logLimit)}
              onLoadMore={() => setLogLimit((current) => current + 20)}
              onDelete={async (log) => {
                if (window.confirm(`确定删除这条记录吗？\n${log.reason} ${log.amount >= 0 ? '+' : ''}${log.amount}分`)) {
                  await deleteLog(log.id!)
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
