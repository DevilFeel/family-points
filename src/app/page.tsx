'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useSpring, useTransform } from 'framer-motion'
import { FeedbackToast } from '@/components/FeedbackToast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { addPoints, manualAdjust, redeemReward } from '@/lib/actions'
import { useEnabledRewards, useProfile, useTasks, useTodayLogs } from '@/lib/hooks'
import { seedDatabase } from '@/lib/seed'

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 })
  const display = useTransform(spring, (current) => Math.round(current))
  const [text, setText] = useState('0')
  const unsubscribeRef = useRef<() => void>()

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  useEffect(() => {
    unsubscribeRef.current = display.on('change', (current) => {
      setText(String(current))
    })
    return () => unsubscribeRef.current?.()
  }, [display])

  return <span>{text}</span>
}

export default function ChildDashboard() {
  const [mounted, setMounted] = useState(false)
  const [feedback, setFeedback] = useState<{ text: string; points: number } | null>(null)
  const [rewardExpanded, setRewardExpanded] = useState(false)
  const [customAddAmount, setCustomAddAmount] = useState(false)
  const [customDeductAmount, setCustomDeductAmount] = useState(false)
  const profile = useProfile()
  const tasks = useTasks()
  const rewards = useEnabledRewards()
  const todayLogs = useTodayLogs()

  useEffect(() => {
    seedDatabase().then(() => setMounted(true))
  }, [])

  const showFeedback = useCallback((text: string, points: number) => {
    setFeedback({ text, points })
  }, [])

  useEffect(() => {
    if (!feedback) return
    const timeout = setTimeout(() => setFeedback(null), 1200)
    return () => clearTimeout(timeout)
  }, [feedback])

  const handleAddPoints = async (taskId: number, title: string) => {
    if (!window.confirm(`确认加分：${title} +1 分？`)) return
    await addPoints(taskId)
    showFeedback(title, 1)
  }

  const handleRedeem = async (rewardId: number, title: string, cost: number) => {
    const currentBalance = profile?.balance ?? 0
    if (currentBalance >= cost) {
      if (!window.confirm(`确认兑换：${title} -${cost} 分？`)) return
    } else {
      const diff = cost - currentBalance
      if (
        !window.confirm(
          `当前只有 ${currentBalance} 分，兑换 ${title} 需要 ${cost} 分。\n将先欠 ${diff} 分，后续可继续补回。\n\n确认兑换吗？`,
        )
      ) {
        return
      }
    }

    const ok = await redeemReward(rewardId, true)
    if (ok) {
      showFeedback(`兑换：${title}`, -cost)
    }
  }

  if (!mounted) {
    return <div className="flex min-h-dvh items-center justify-center text-blue-600">加载中...</div>
  }

  const balance = profile?.balance ?? 0
  const name = profile?.name ?? '宝宝'

  return (
    <div className="relative flex min-h-dvh max-w-full flex-col overflow-x-hidden overflow-y-auto bg-white px-4 pb-20 pt-4 box-border">
      <FeedbackToast feedback={feedback} topClassName="top-1/4" />

      <div className={`-mx-4 mb-4 rounded-2xl px-4 py-5 text-white ${balance < 0 ? 'bg-red-500' : 'bg-blue-500'}`}>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">{name}的积分</div>
          <Link
            href="/parent"
            className="rounded-lg px-3 py-1.5 text-sm text-blue-200 transition-colors hover:bg-blue-600 hover:text-white"
          >
            管理 →
          </Link>
        </div>
        <div className="mt-2 flex items-end gap-2">
          <div className="text-5xl font-black leading-none tabular-nums">
            <AnimatedNumber value={balance} />
          </div>
          <div className="pb-1 text-lg font-medium opacity-80">分</div>
        </div>
      </div>

      <div className="mt-2">
        <div className="mb-2 flex items-center gap-1 text-sm font-semibold text-gray-700">
          <span className="inline-block h-4 w-1 rounded-full bg-green-500" />
          加分
        </div>
        <div className="grid grid-cols-4 gap-2">
          {tasks?.map((task) => (
            <motion.div key={task.id} whileTap={{ scale: 0.93 }}>
              <Card
                className="h-[76px] cursor-pointer transition-shadow hover:border-green-300 hover:shadow-md"
                onClick={() => handleAddPoints(task.id!, task.title)}
              >
                <CardContent className="flex h-full flex-col items-center justify-center gap-0.5 py-0">
                  <span className="text-xl">{task.icon}</span>
                  <span className="line-clamp-2 text-center text-[11px] font-medium leading-tight text-gray-700">
                    {task.title}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center gap-1 text-sm font-semibold text-gray-700">
          <span className="inline-block h-4 w-1 rounded-full bg-green-500" />
          自定义加分
        </div>
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={async (event) => {
            event.preventDefault()
            const form = new FormData(event.currentTarget)
            const reason = (form.get('reason') as string)?.trim()
            const selectedAmount = form.get('amount') as string
            const amount = selectedAmount === 'custom' ? Number(form.get('customAmount')) : Number(selectedAmount)
            if (!reason || !amount || amount <= 0) return

            await manualAdjust(amount, reason, 'manual')
            showFeedback(reason, amount)
            event.currentTarget.reset()
            setCustomAddAmount(false)
            ;(document.activeElement as HTMLElement | null)?.blur()
          }}
        >
          <input
            name="reason"
            placeholder="输入做了什么..."
            className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <select
            name="amount"
            className="shrink-0 rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            onChange={(event) => setCustomAddAmount(event.target.value === 'custom')}
          >
            <option value="1">+1</option>
            <option value="2">+2</option>
            <option value="3">+3</option>
            <option value="5">+5</option>
            <option value="10">+10</option>
            <option value="custom">自定义</option>
          </select>
          {customAddAmount && (
            <input
              name="customAmount"
              type="number"
              min="1"
              placeholder="分值"
              className="w-16 shrink-0 rounded-lg border border-gray-200 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          )}
          <Button type="submit" size="sm" className="shrink-0 bg-green-500 px-4 text-white hover:bg-green-600">
            加分
          </Button>
        </form>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center gap-1 text-sm font-semibold text-gray-700">
          <span className="inline-block h-4 w-1 rounded-full bg-red-500" />
          自定义扣分
        </div>
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={async (event) => {
            event.preventDefault()
            const form = new FormData(event.currentTarget)
            const reason = (form.get('reason') as string)?.trim()
            const selectedAmount = form.get('amount') as string
            const amount = selectedAmount === 'custom' ? Number(form.get('customAmount')) : Number(selectedAmount)
            if (!reason || !amount || amount <= 0) return

            await manualAdjust(amount, reason, 'deduct')
            showFeedback(reason, -amount)
            event.currentTarget.reset()
            setCustomDeductAmount(false)
            ;(document.activeElement as HTMLElement | null)?.blur()
          }}
        >
          <input
            name="reason"
            placeholder="输入扣分原因..."
            className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <select
            name="amount"
            className="shrink-0 rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            onChange={(event) => setCustomDeductAmount(event.target.value === 'custom')}
          >
            <option value="1">-1</option>
            <option value="2">-2</option>
            <option value="3">-3</option>
            <option value="5">-5</option>
            <option value="10">-10</option>
            <option value="custom">自定义</option>
          </select>
          {customDeductAmount && (
            <input
              name="customAmount"
              type="number"
              min="1"
              placeholder="分值"
              className="w-16 shrink-0 rounded-lg border border-gray-200 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          )}
          <Button type="submit" size="sm" className="shrink-0 bg-red-500 px-4 text-white hover:bg-red-600">
            扣分
          </Button>
        </form>
      </div>

      <div className="mt-5">
        <button
          onClick={() => setRewardExpanded((current) => !current)}
          className="flex w-full items-center justify-between rounded-lg border border-purple-200 bg-purple-50 px-3 py-2.5 text-sm font-semibold text-purple-700"
        >
          <span>🏆 兑换奖励 ({rewards?.length ?? 0})</span>
          <span className="text-purple-400">{rewardExpanded ? '收起 ▲' : '展开 ▼'}</span>
        </button>
        <AnimatePresence>
          {rewardExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {rewards?.map((reward) => {
                const canRedeem = balance >= reward.cost
                return (
                  <motion.div key={reward.id} whileTap={{ scale: 0.97 }}>
                    <Card className="cursor-pointer border-purple-200 bg-purple-50/30">
                      <CardContent className="flex items-center justify-between py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{reward.icon}</span>
                          <div>
                            <span className="text-sm font-medium">{reward.title}</span>
                            <span className="ml-1.5 text-xs text-purple-500">{reward.cost}分</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className={canRedeem ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-orange-400 text-white hover:bg-orange-500'}
                          onClick={() => handleRedeem(reward.id!, reward.title, reward.cost)}
                        >
                          {canRedeem ? `${reward.cost}分兑` : `欠${reward.cost - balance}分兑`}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
              {(!rewards || rewards.length === 0) && (
                <div className="py-4 text-center text-sm text-muted-foreground">暂无奖励，可在管理页添加</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {todayLogs && todayLogs.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex items-center gap-1 text-sm font-semibold text-gray-700">
            <span className="inline-block h-4 w-1 rounded-full bg-blue-500" />
            今日记录
          </div>
          <div className="space-y-1.5">
            {todayLogs.map((log) => {
              const isEarn = log.amount > 0
              return (
                <div
                  key={log.id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                    isEarn ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'
                  }`}
                >
                  <span className="flex-1 truncate text-gray-700">{log.reason}</span>
                  <span className={`ml-2 shrink-0 font-semibold tabular-nums ${isEarn ? 'text-green-600' : 'text-red-600'}`}>
                    {isEarn ? '+' : ''}
                    {log.amount}分
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
