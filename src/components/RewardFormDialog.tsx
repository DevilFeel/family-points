'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { EmojiPicker } from '@/components/EmojiPicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function RewardFormDialog({
  onAdd,
}: {
  onAdd: (data: { title: string; cost: number; icon: string; enabled: boolean }) => Promise<number | undefined>
}) {
  const [open, setOpen] = useState(false)
  const [icon, setIcon] = useState('🏆')

  return (
    <>
      <Button
        variant="outline"
        className="mt-4 w-full"
        onClick={() => {
          setIcon('🏆')
          setOpen(true)
        }}
      >
        + 添加奖励
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-xl bg-white p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 text-lg font-bold">添加奖励</div>
              <form
                className="space-y-3"
                onSubmit={async (event) => {
                  event.preventDefault()
                  const form = new FormData(event.currentTarget)
                  await onAdd({
                    title: form.get('title') as string,
                    cost: Number(form.get('cost')) || 10,
                    icon,
                    enabled: true,
                  })
                  setOpen(false)
                }}
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
                <Button type="submit" className="w-full">
                  添加
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
