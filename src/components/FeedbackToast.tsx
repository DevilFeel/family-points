'use client'

import { AnimatePresence, motion } from 'framer-motion'

export function FeedbackToast({
  feedback,
  topClassName,
}: {
  feedback: { text: string; points: number } | null
  topClassName: string
}) {
  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, y: -20, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 1.2 }}
          className={`fixed left-1/2 z-50 -translate-x-1/2 pointer-events-none ${topClassName}`}
        >
          <div
            className={`rounded-2xl px-5 py-2 text-2xl font-bold text-white shadow-lg ${
              feedback.points >= 0 ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {feedback.points >= 0 ? '+' : ''}
            {feedback.points} {feedback.text}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
