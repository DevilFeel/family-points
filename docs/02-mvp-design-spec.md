# Family Points MVP Design Spec

## Scope

Single-child offline PWA for parents to incentivize a 3-year-old with points. Child page is view-only.

## Tech Stack

- Next.js 14 (App Router, SSG export)
- Dexie.js (IndexedDB)
- Tailwind CSS + Shadcn UI
- Framer Motion (animations)
- next-pwa (offline support)

## Pages

### / (Child Dashboard)
- Route: `/`
- Huge point number with count-up animation
- Progress bar toward target reward
- No interactive elements, view-only
- Auto-refreshes when data changes (Dexie live query)

### /parent (Parent Console)
- PIN lock on entry (4-digit, stored in localStorage)
- Task card grid: tap to add points, haptic/sound feedback
- Manual adjustment form: amount + note
- Reward list: tap to redeem (deduct points)
- Reward management: add/edit/delete rewards
- Log viewer: recent point changes

### /settings (Settings)
- Export database to JSON file (Web Share API)
- Import JSON backup file
- Storage status display
- PIN change

## Database Schema (Dexie)

```typescript
// profiles — single child
interface Profile {
  id?: number;
  name: string;
  balance: number;
  targetPoints: number;
  targetName: string;
}

// tasks — preset scoring items
interface Task {
  id?: number;
  title: string;
  points: number;
  icon: string;
  sortOrder: number;
}

// logs — all point changes
interface Log {
  id?: number;
  profileId: number;
  amount: number;       // positive = earn, negative = spend/deduct
  reason: string;
  type: 'earn' | 'redeem' | 'manual' | 'deduct';
  timestamp: number;
}

// rewards — redeemable items
interface Reward {
  id?: number;
  title: string;
  cost: number;
  icon: string;
  enabled: boolean;
}
```

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, PWA meta
│   ├── page.tsx            # Child dashboard
│   ├── parent/
│   │   └── page.tsx        # Parent console
│   └── settings/
│       └── page.tsx        # Settings
├── components/
│   ├── ui/                 # Shadcn components
│   ├── PinLock.tsx         # PIN verification
│   ├── TaskCard.tsx        # Scoring task card
│   ├── PointDisplay.tsx    # Animated point number
│   ├── ProgressBar.tsx     # Target progress
│   └── RewardCard.tsx      # Reward item
├── lib/
│   ├── db.ts               # Dexie database setup
│   ├── hooks.ts            # React hooks for DB queries
│   └── utils.ts            # Helpers
└── public/
    ├── icons/              # PWA icons
    └── sounds/             # Feedback sounds
```

## Development Phases

### Phase 1: Foundation
- Project init (Next.js + Tailwind + Shadcn)
- Dexie database + seed data
- Basic layout and routing

### Phase 2: Parent Console
- PIN lock component
- Task card grid with point adding
- Manual adjustment
- Reward management + redemption
- Activity log

### Phase 3: Child Dashboard
- Large point display with animation
- Target progress bar
- Live data sync

### Phase 4: Settings & PWA
- Export/import JSON
- PWA manifest + service worker
- Mobile viewport optimization
