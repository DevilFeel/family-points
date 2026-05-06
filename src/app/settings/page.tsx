'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { exportDatabase, importDatabase, resetDatabase, updateProfile } from '@/lib/actions'
import { useProfile } from '@/lib/hooks'
import { seedDatabase } from '@/lib/seed'

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [message, setMessage] = useState('')
  const profile = useProfile()
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!message) return
    const timeout = setTimeout(() => setMessage(''), 3000)
    return () => clearTimeout(timeout)
  }, [message])

  useEffect(() => {
    seedDatabase().then(() => setMounted(true))
  }, [])

  if (!mounted) {
    return <div className="flex min-h-dvh items-center justify-center text-blue-600">加载中...</div>
  }

  const handleExport = async () => {
    try {
      const json = await exportDatabase()
      const date = new Date().toISOString().slice(0, 10)
      const filename = `points_backup_${date}.json`
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      setTimeout(() => URL.revokeObjectURL(url), 100)
      setMessage('导出成功')
    } catch (error) {
      setMessage(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const json = await file.text()
      await importDatabase(json)
      setMessage('导入成功')
      setTimeout(() => window.location.reload(), 500)
    } catch (error) {
      setMessage(`导入失败: ${error instanceof Error ? error.message : '文件格式不正确'}`)
    }

    event.target.value = ''
  }

  const handleProfileUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await updateProfile({
      name: form.get('name') as string,
    })
    setMessage('资料已更新')
  }

  const handleReset = async () => {
    if (!window.confirm('确认清空所有数据吗？\n\n所有积分记录、任务和奖励都会被删除，且无法恢复。')) return
    if (!window.confirm('二次确认：真的要清空吗？此操作不可撤销。')) return

    try {
      await resetDatabase()
      setMessage('数据已清空')
      setTimeout(() => window.location.reload(), 500)
    } catch (error) {
      setMessage(`重置失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  return (
    <div className="min-h-dvh bg-white pb-6">
      <div className="sticky top-0 z-40 bg-blue-600 px-4 py-3 text-white shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/parent" className="text-xl font-bold text-white">
            ←
          </Link>
          <div className="text-lg font-bold">设置</div>
        </div>
      </div>

      <div className="mt-4 space-y-4 px-4">
        {message && <div className="rounded-lg bg-green-50 py-2 text-center text-sm text-green-600">{message}</div>}

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleProfileUpdate} className="space-y-3">
              <div className="mb-2 font-medium">孩子资料</div>
              <div>
                <Label>名字</Label>
                <Input name="name" defaultValue={profile?.name} />
              </div>
              <Button type="submit" className="w-full">
                保存
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="mb-2 font-medium">数据管理</div>
            <Button onClick={handleExport} className="w-full" variant="outline">
              导出备份
            </Button>
            <Button onClick={() => fileRef.current?.click()} className="w-full" variant="outline">
              导入备份
            </Button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="space-y-3 pt-6">
            <div className="mb-2 font-medium text-red-600">危险操作</div>
            <p className="text-xs text-muted-foreground">清空所有积分记录、任务和奖励数据，建议先导出备份。</p>
            <Button onClick={handleReset} className="w-full" variant="destructive">
              重置所有数据
            </Button>
          </CardContent>
        </Card>

        <div className="pt-4 text-center">
          <Link href="/" className="text-sm text-blue-600">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
