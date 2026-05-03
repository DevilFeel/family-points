'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProfile } from '@/lib/hooks'
import { seedDatabase } from '@/lib/seed'
import { exportDatabase, importDatabase, updateProfile, resetDatabase } from '@/lib/actions'
import Link from 'next/link'

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  const profile = useProfile()
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(''), 3000)
    return () => clearTimeout(t)
  }, [message])

  useEffect(() => {
    seedDatabase().then(() => setMounted(true))
  }, [])

  if (!mounted) {
    return <div className="min-h-dvh flex items-center justify-center text-blue-600">加载中...</div>
  }

  const handleExport = async () => {
    try {
      const json = await exportDatabase()
      const date = new Date().toISOString().slice(0, 10)
      const filename = `points_backup_${date}.json`
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 100)
      setMessage('导出成功')
    } catch (e) {
      setMessage('导出失败: ' + (e instanceof Error ? e.message : '未知错误'))
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const json = await file.text()
      await importDatabase(json)
      setMessage('导入成功')
      setTimeout(() => window.location.reload(), 500)
    } catch (e) {
      setMessage('导入失败: ' + (e instanceof Error ? e.message : '文件格式不正确'))
    }
    e.target.value = ''
  }

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await updateProfile({
      name: form.get('name') as string,
    })
    setMessage('资料已更新')
  }

  const handleReset = async () => {
    if (!confirm('⚠️ 确定要清空所有数据吗？\n\n所有积分记录、任务、奖励都将被删除，且无法恢复！\n\n建议先导出备份。')) return
    if (!confirm('二次确认：真的要清空吗？此操作不可撤销！')) return
    try {
      await resetDatabase()
      setMessage('数据已清空')
      setTimeout(() => window.location.reload(), 500)
    } catch (e) {
      setMessage('重置失败: ' + (e instanceof Error ? e.message : '未知错误'))
    }
  }

  return (
    <div className="min-h-dvh pb-6 bg-white">
      <div className="sticky top-0 z-40 bg-blue-600 text-white px-4 py-3 shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/parent" className="text-xl text-white font-bold">←</Link>
          <div className="font-bold text-lg">设置</div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {message && (
          <div className="text-center text-sm text-green-600 bg-green-50 rounded-lg py-2">
            {message}
          </div>
        )}

        {/* Profile */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleProfileUpdate} className="space-y-3">
              <div className="font-medium mb-2">孩子资料</div>
              <div>
                <Label>名字</Label>
                <Input name="name" defaultValue={profile?.name} />
              </div>
              <Button type="submit" className="w-full">保存</Button>
            </form>
          </CardContent>
        </Card>

        {/* Data */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="font-medium mb-2">数据管理</div>
            <Button onClick={handleExport} className="w-full" variant="outline">
              导出备份
            </Button>
            <Button onClick={() => fileRef.current?.click()} className="w-full" variant="outline">
              导入备份
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-200">
          <CardContent className="pt-6 space-y-3">
            <div className="font-medium mb-2 text-red-600">危险操作</div>
            <p className="text-xs text-muted-foreground">清空所有积分记录、任务和奖励数据，建议先导出备份。</p>
            <Button onClick={handleReset} className="w-full" variant="destructive">
              重置所有数据
            </Button>
          </CardContent>
        </Card>

        {/* Home link */}
        <div className="text-center pt-4">
          <Link href="/" className="text-sm text-blue-600">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
