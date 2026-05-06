# Family Points MVP Design Spec

## Scope

Single-profile offline PWA for home use. The app is optimized for fast local interactions, with parents managing points and rewards while the child-facing page stays simple and readable.

## Tech Stack

- Next.js 14 (App Router, static export)
- Dexie.js (IndexedDB)
- Tailwind CSS
- Framer Motion
- next-pwa

## Routes

### `/`

- Large point total
- Quick task-based point adding
- Manual add / deduct forms
- Reward redemption
- Today log display

### `/parent`

- Task management
- Reward management
- Stats and trend view
- Operation log view and deletion

### `/settings`

- Update child name
- Export JSON backup
- Import JSON backup
- Reset all local data

## Database Schema

```ts
interface Profile {
  id?: number
  name: string
  balance: number
}

interface Task {
  id?: number
  title: string
  points: number
  icon: string
  sortOrder: number
}

interface Log {
  id?: number
  profileId: number
  amount: number
  reason: string
  type: 'earn' | 'redeem' | 'manual' | 'deduct'
  timestamp: number
}

interface Reward {
  id?: number
  title: string
  cost: number
  icon: string
  enabled: boolean
}
```

## Notes

- The current app uses one local profile only.
- Data is stored entirely in IndexedDB.
- No remote sync or account system is included in the MVP.
