'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { useProfile, useTasks, useAllRewards } from '@/lib/hooks'
import { seedDatabase } from '@/lib/seed'
import { addPoints, redeemReward, manualAdjust } from '@/lib/actions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 })
  const display = useTransform(spring, (v) => Math.round(v))

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  const [text, setText] = useState('0')
  const unsubscribeRef = useRef<() => void>()

  useEffect(() => {
    unsubscribeRef.current = display.on('change', (v) => {
      setText(String(v))
    })
    return () => unsubscribeRef.current?.()
  }, [display])

  return <span>{text}</span>
}

export default function ChildDashboard() {
  const [mounted, setMounted] = useState(false)
  const [feedback, setFeedback] = useState<{ text: string; points: number } | null>(null)
  const [rewardExpanded, setRewardExpanded] = useState(false)
  const profile = useProfile()
  const tasks = useTasks()
  const rewards = useAllRewards()

  useEffect(() => {
    seedDatabase().then(() => setMounted(true))
  }, [])

  const showFeedback = useCallback((text: string, points: number) => {
    setFeedback({ text, points })
  }, [])

  useEffect(() => {
    if (!feedback) return
    const t = setTimeout(() => setFeedback(null), 1200)
    return () => clearTimeout(t)
  }, [feedback])

  const handleAddPoints = async (taskId: number, title: string) => {
    if (!confirm(`确认加分：${title} +1分？`)) return
    await addPoints(taskId)
    showFeedback(title, 1)
  }

  const handleRedeem = async (rewardId: number, title: string, cost: number) => {
    const currentBalance = profile?.balance ?? 0
    if (currentBalance >= cost) {
      if (!confirm('确认兑换: ' + title + ' -' + cost + '分?')) return
    } else {
      const diff = cost - currentBalance
      if (!confirm('当前 ' + currentBalance + ' 分, 兑换 ' + title + ' 需要 ' + cost + ' 分\n将欠 ' + diff + ' 分(积分变负, 后续加分补回)\n\n确认兑换?')) return
    }
    const ok = await redeemReward(rewardId, true)
    if (ok) {
      showFeedback('兑换: ' + title, -cost)
    }
  }

  if (!mounted) {
    return <div className="min-h-dvh flex items-center justify-center text-blue-600">加载中...</div>
  }

  const balance = profile?.balance ?? 0
  const name = profile?.name ?? '宝贝'
  const enabledRewards = rewards?.filter(r => r.enabled) ?? []

  return (
    <div className="min-h-dvh flex flex-col px-4 pt-4 pb-20 relative overflow-y-auto bg-white">
      {/* Feedback animation */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 1.2 }}
            className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className={`text-2xl font-bold px-5 py-2 rounded-2xl shadow-lg ${
              feedback.points >= 0
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {feedback.points >= 0 ? '+' : ''}{feedback.points} {feedback.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top: score - blue hero area */}
      <div className={`flex-shrink-0 rounded-2xl px-5 py-5 text-white -mx-4 px-4 mb-4 ${balance < 0 ? 'bg-red-500' : 'bg-blue-500'}`}>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">{name}的积分</div>
          <Link
            href="/parent"
            className="text-sm text-blue-200 hover:text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
          >
            管理 →
          </Link>
        </div>
        <div className="flex items-end gap-2 mt-2">
          <div className="text-5xl font-black leading-none tabular-nums">
            <AnimatedNumber value={balance} />
          </div>
          <div className="text-lg font-medium pb-1 opacity-80">分</div>
        </div>
      </div>

      {/* Task cards - 4 columns */}
      <div className="mt-2">
        <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
          <span className="w-1 h-4 bg-green-500 rounded-full inline-block"></span>
          加分
        </div>
        <div className="grid grid-cols-4 gap-2">
          {tasks?.map((task) => (
            <motion.div key={task.id} whileTap={{ scale: 0.93 }}>
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow hover:border-green-300 h-[76px]"
                onClick={() => handleAddPoints(task.id!, task.title)}
              >
                <CardContent className="flex flex-col items-center justify-center h-full py-0 gap-0.5">
                  <span className="text-xl">{task.icon}</span>
                  <span className="font-medium text-[11px] leading-tight text-center line-clamp-2 text-gray-700">{task.title}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Manual add */}
      <div className="mt-4">
        <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
          <span className="w-1 h-4 bg-green-500 rounded-full inline-block"></span>
          自定义加分
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const form = new FormData(e.currentTarget)
            const reason = (form.get('reason') as string)?.trim()
            const amount = Number(form.get('amount')) || 1
            if (!reason) return
            await manualAdjust(amount, reason, 'manual')
            showFeedback(reason, amount)
            ;(e.target as HTMLFormElement).reset()
            ;(document.activeElement as HTMLElement)?.blur()
          }}
          className="flex gap-2"
        >
          <input
            name="reason"
            placeholder="输入做了什么..."
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <select
            name="amount"
            className="rounded-lg border border-gray-200 px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="1">+1</option>
            <option value="2">+2</option>
            <option value="3">+3</option>
            <option value="5">+5</option>
            <option value="10">+10</option>
          </select>
          <Button type="submit" size="sm" className="px-4 shrink-0 bg-green-500 hover:bg-green-600 text-white">
            加分
          </Button>
        </form>
      </div>

      {/* Manual deduct */}
      <div className="mt-4">
        <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
          <span className="w-1 h-4 bg-red-500 rounded-full inline-block"></span>
          自定义扣分
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const form = new FormData(e.currentTarget)
            const reason = (form.get('reason') as string)?.trim()
            const amount = Number(form.get('amount')) || 1
            if (!reason) return
            await manualAdjust(amount, reason, 'deduct')
            showFeedback(reason, -amount)
            ;(e.target as HTMLFormElement).reset()
            ;(document.activeElement as HTMLElement)?.blur()
          }}
          className="flex gap-2"
        >
          <input
            name="reason"
            placeholder="输入扣分原因..."
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <select
            name="amount"
            className="rounded-lg border border-gray-200 px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="1">-1</option>
            <option value="2">-2</option>
            <option value="3">-3</option>
            <option value="5">-5</option>
            <option value="10">-10</option>
          </select>
          <Button type="submit" size="sm" className="px-4 shrink-0 bg-red-500 hover:bg-red-600 text-white">
            扣分
          </Button>
        </form>
      </div>

      {/* Rewards - collapsible with visual distinction */}
      <div className="mt-5">
        <button
          onClick={() => setRewardExpanded(!rewardExpanded)}
          className="w-full flex items-center justify-between text-sm font-semibold text-purple-700 mb-2 bg-purple-50 rounded-lg px-3 py-2.5 border border-purple-200"
        >
          <span>🎁 兑换奖励 ({enabledRewards.length})</span>
          <span className="text-purple-400">{rewardExpanded ? '收起 ▲' : '展开 ▼'}</span>
        </button>
        <AnimatePresence>
          {rewardExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-2"
            >
              {enabledRewards.map((reward) => {
                const canRedeem = balance >= reward.cost
                return (
                  <motion.div key={reward.id} whileTap={{ scale: 0.97 }}>
                    <Card className="cursor-pointer border-purple-200 bg-purple-50/30">
                      <CardContent className="flex items-center justify-between py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{reward.icon}</span>
                          <div>
                            <span className="text-sm font-medium">{reward.title}</span>
                            <span className="text-xs text-purple-500 ml-1.5">{reward.cost}分</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className={canRedeem ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'bg-orange-400 hover:bg-orange-500 text-white'}
                          onClick={() => handleRedeem(reward.id!, reward.title, reward.cost)}
                        >
                          {canRedeem ? `${reward.cost}分` : `欠${reward.cost - balance}分`}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
              {enabledRewards.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-4">
                  暂无奖励，在管理页添加
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
