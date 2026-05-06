'use client'

const EMOJI_GROUPS = [
  { label: '常用', emojis: ['⭐', '🎯', '✅', '👏', '🎉', '🎄', '❇️', '👍'] },
  { label: '日常', emojis: ['☀️', '🌙', '🍚', '🚿', '🧹', '🧺', '📝', '✏️'] },
  { label: '运动', emojis: ['⚽', '🏀', '🏊', '🚴', '🏃', '🤸', '🎾', '🎈'] },
  { label: '艺术', emojis: ['🎨', '🎭', '🎵', '🧩', '📷', '🎁', '✂️', '📒'] },
  { label: '学习', emojis: ['📖', '🔬', '🔘', '🔣', '📕', '🔩', '📚', '🧮'] },
  { label: '奖励', emojis: ['🏆', '🥇', '🎪', '👐', '💵', '🍟', '🍷', '🧸'] },
  { label: '娱乐', emojis: ['📺', '🎬', '🎃', '🎾', '🎮', '🎵', '🎤', '🕹️'] },
  { label: '自然', emojis: ['🌳', '🌭', '🌰', '🌲', '🐗', '🐐', '🐏', '🐣'] },
]

export function EmojiPicker({ value, onChange }: { value: string; onChange: (emoji: string) => void }) {
  return (
    <div className="space-y-2">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">已选</span>
        <span className="text-2xl">{value}</span>
      </div>
      {EMOJI_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="mb-1 text-xs text-muted-foreground">{group.label}</div>
          <div className="flex flex-wrap gap-1">
            {group.emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`h-11 w-11 rounded-lg text-xl transition-all ${
                  value === emoji ? 'scale-110 bg-amber-200 shadow-sm' : 'active:scale-95 hover:bg-gray-100'
                }`}
                onClick={() => onChange(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
