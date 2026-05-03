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
    await addPoints(taskId)
    showFeedback(title, 1)
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

  const balance = profile?.balance ?? 0
  const name = profile?.name ?? '宝贝'

  return (
    <div className="min-h-dvh flex flex-col px-4 pt-4 pb-6 relative overflow-hidden">
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
                : 'bg-orange-500 text-white'
            }`}>
              {feedback.points >= 0 ? '+' : ''}{feedback.points} {feedback.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top: score */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-amber-800">{name}的积分</div>
          <Link href="/parent" className="text-xs text-amber-400">管理 →</Link>
        </div>
        <div className="flex items-end gap-2 mt-1">
          <div className="text-5xl font-black text-amber-500 leading-none tabular-nums">
            <AnimatedNumber value={balance} />
          </div>
          <div className="text-lg text-amber-600 font-medium pb-1">分</div>
        </div>
      </div>

      {/* Task cards */}
      <div className="mt-4">
        <div className="text-sm font-medium text-amber-700 mb-2">加分</div>
        <div className="grid grid-cols-3 gap-2.5">
          {tasks?.map((task) => (
            <motion.div key={task.id} whileTap={{ scale: 0.93 }}>
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow active:bg-amber-50"
                onClick={() => handleAddPoints(task.id!, task.title)}
              >
                <CardContent className="flex flex-col items-center py-4 gap-1 min-h-[80px] justify-center">
                  <span className="text-2xl">{task.icon}</span>
                  <span className="font-medium text-xs leading-tight text-center">{task.title}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Manual add */}
      <div className="mt-4">
        <div className="text-sm font-medium text-amber-700 mb-2">自定义加分</div>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const form = new FormData(e.currentTarget)
            const reason = (form.get('reason') as string)?.trim()
            if (!reason) return
            await manualAdjust(1, reason, 'manual')
            showFeedback(reason, 1)
            ;(e.target as HTMLFormElement).reset()
            ;(document.activeElement as HTMLElement)?.blur()
          }}
          className="flex gap-2"
        >
          <input
            name="reason"
            placeholder="输入做了什么..."
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <Button type="submit" size="sm" className="px-4 shrink-0 bg-green-500 hover:bg-green-600">
            +1
          </Button>
        </form>
      </div>

      {/* Manual deduct */}
      <div className="mt-4">
        <div className="text-sm font-medium text-orange-700 mb-2">自定义扣分</div>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const form = new FormData(e.currentTarget)
            const reason = (form.get('reason') as string)?.trim()
            if (!reason) return
            await manualAdjust(1, reason, 'deduct')
            showFeedback(reason, -1)
            ;(e.target as HTMLFormElement).reset()
            ;(document.activeElement as HTMLElement)?.blur()
          }}
          className="flex gap-2"
        >
          <input
            name="reason"
            placeholder="输入扣分原因..."
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <Button type="submit" size="sm" className="px-4 shrink-0 bg-orange-500 hover:bg-orange-600">
            -1
          </Button>
        </form>
      </div>

      {/* Rewards */}
      <div className="mt-4 flex-1">
        <div className="text-sm font-medium text-amber-700 mb-2">兑换</div>
        <div className="space-y-2">
          {rewards?.filter(r => r.enabled).map((reward) => {
            const canRedeem = balance >= reward.cost
            return (
              <motion.div key={reward.id} whileTap={canRedeem ? { scale: 0.97 } : undefined}>
                <Card className={canRedeem ? 'cursor-pointer' : 'opacity-60'}>
                  <CardContent className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{reward.icon}</span>
                      <span className="text-sm font-medium">{reward.title}</span>
                    </div>
                    <Button
                      size="sm"
                      disabled={!canRedeem}
                      onClick={() => handleRedeem(reward.id!, reward.title, reward.cost)}
                    >
                      {canRedeem ? `${reward.cost}分` : '不足'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
          {(!rewards || rewards.filter(r => r.enabled).length === 0) && (
            <div className="text-center text-sm text-muted-foreground py-4">
              暂无奖励，在管理页添加
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
