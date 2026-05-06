'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Log } from '@/lib/db'

export function LogList({
  logs,
  canLoadMore,
  onLoadMore,
  onDelete,
}: {
  logs: Log[] | undefined
  canLoadMore: boolean
  onLoadMore: () => void
  onDelete: (log: Log) => Promise<void>
}) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = loadMoreRef.current
    if (!element || !canLoadMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [canLoadMore, onLoadMore])

  if (!logs || logs.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">暂无记录</div>
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => {
        const isEarn = log.amount >= 0
        return (
          <Card key={log.id} className={isEarn ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
            <CardContent className="flex items-center justify-between py-2">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{log.reason}</div>
                <div className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString('zh-CN')}</div>
              </div>
              <div className="ml-2 flex shrink-0 items-center gap-2">
                <span className={`text-sm font-bold tabular-nums ${isEarn ? 'text-green-600' : 'text-red-500'}`}>
                  {isEarn ? '+' : ''}
                  {log.amount}分
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  onClick={() => onDelete(log)}
                >
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
      {canLoadMore && (
        <div ref={loadMoreRef} className="py-3 text-center text-xs text-muted-foreground">
          加载中...
        </div>
      )}
    </div>
  )
}
