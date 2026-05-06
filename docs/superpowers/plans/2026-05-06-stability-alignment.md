# Family Points Stability Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the repository with the current app behavior by fixing corrupted text, updating docs to match reality, and reducing maintenance risk in the main app pages without adding new product features.

**Architecture:** Keep the current single-profile offline app model intact, but tighten boundaries around copy, docs, and data access. Extract the most repeated business logic and split the most crowded page sections into focused components so future edits stay local and safer.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Dexie, Tailwind CSS, Framer Motion

---

### Task 1: Repair corrupted copy and seed data

**Files:**
- Modify: `src/lib/seed.ts`
- Modify: `src/lib/actions.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/parent/page.tsx`
- Modify: `src/app/settings/page.tsx`
- Modify: `src/components/EmojiPicker.tsx`
- Test: `npm run build`

- [ ] **Step 1: Replace corrupted Chinese copy with readable app text**

Update all visible labels, placeholders, confirm dialogs, seed titles, reward titles, metadata description, and picker group labels so the shipped app text is valid UTF-8 Chinese.

- [ ] **Step 2: Keep behavior unchanged while repairing copy**

Do not introduce new fields or flows. Preserve the current single-child, offline, local-only behavior and existing route structure.

- [ ] **Step 3: Run build to verify repaired text does not break parsing**

Run: `npm run build`
Expected: Next.js production build completes successfully.

- [ ] **Step 4: Commit**

```bash
git add src/lib/seed.ts src/lib/actions.ts src/app/layout.tsx src/app/page.tsx src/app/parent/page.tsx src/app/settings/page.tsx src/components/EmojiPicker.tsx
git commit -m "fix: repair corrupted app copy"
```

### Task 2: Align docs with the current app

**Files:**
- Modify: `README.md`
- Modify: `01-设计文档.md`
- Modify: `docs/02-mvp-design-spec.md`
- Modify: `docs/03-dev-progress.md`
- Test: `npm run build`

- [ ] **Step 1: Rewrite README for the actual product**

Document what the app does today, the main routes, the local-only data model, and how to run/build it.

- [ ] **Step 2: Rewrite product/design docs to match the shipped MVP**

Make the docs describe the current app honestly:
- single profile with `name` and `balance`
- tasks, rewards, logs, settings, import/export, reset
- no target progress schema fields unless implemented

- [ ] **Step 3: Re-read docs against current routes and data model**

Verify that route descriptions and schema text match `src/app/*` and `src/lib/db.ts`.

- [ ] **Step 4: Run build to ensure documentation-only changes did not hide repository issues**

Run: `npm run build`
Expected: Build still passes.

- [ ] **Step 5: Commit**

```bash
git add README.md 01-设计文档.md docs/02-mvp-design-spec.md docs/03-dev-progress.md
git commit -m "docs: align documentation with shipped app"
```

### Task 3: Tighten data access helpers in the actions layer

**Files:**
- Modify: `src/lib/actions.ts`
- Modify: `src/lib/hooks.ts`
- Test: `npm run lint`
- Test: `npm run build`

- [ ] **Step 1: Extract helper for resolving the current profile**

Create a local helper in `src/lib/actions.ts` so all write operations resolve the single active profile the same way.

- [ ] **Step 2: Reuse the helper across point, reward, profile, and log mutations**

Keep behavior identical, but remove repeated `db.profiles.toCollection().first()` lookups from each action body where possible.

- [ ] **Step 3: Make hook naming and reward queries reflect current behavior clearly**

Keep the same returned data, but ensure the hooks read clearly for “enabled rewards” versus “all rewards”.

- [ ] **Step 4: Run lint**

Run: `npm run lint`
Expected: `✔ No ESLint warnings or errors`

- [ ] **Step 5: Run build**

Run: `npm run build`
Expected: Build passes after refactor.

- [ ] **Step 6: Commit**

```bash
git add src/lib/actions.ts src/lib/hooks.ts
git commit -m "refactor: centralize current profile access"
```

### Task 4: Split the most crowded page sections into focused components

**Files:**
- Create: `src/components/FeedbackToast.tsx`
- Create: `src/components/TaskFormDialog.tsx`
- Create: `src/components/RewardFormDialog.tsx`
- Create: `src/components/LogList.tsx`
- Modify: `src/app/parent/page.tsx`
- Modify: `src/app/page.tsx`
- Test: `npm run lint`
- Test: `npm run build`

- [ ] **Step 1: Extract reusable feedback toast rendering**

Move the duplicated temporary feedback UI into `FeedbackToast.tsx` and keep the same animation and props shape.

- [ ] **Step 2: Move parent-page add dialogs into component files**

Extract the inline task and reward add dialogs from `src/app/parent/page.tsx` so the page mainly coordinates state and actions.

- [ ] **Step 3: Extract the log list rendering**

Move the log cards and “load more” sentinel into `LogList.tsx` while preserving current delete behavior and infinite-scroll behavior.

- [ ] **Step 4: Rewire pages to use the new components without changing UX**

Keep route output and flows the same, only reduce file size and responsibility overlap.

- [ ] **Step 5: Run lint**

Run: `npm run lint`
Expected: `✔ No ESLint warnings or errors`

- [ ] **Step 6: Run build**

Run: `npm run build`
Expected: Build passes with extracted components.

- [ ] **Step 7: Commit**

```bash
git add src/components/FeedbackToast.tsx src/components/TaskFormDialog.tsx src/components/RewardFormDialog.tsx src/components/LogList.tsx src/app/parent/page.tsx src/app/page.tsx
git commit -m "refactor: split crowded page sections into components"
```

### Task 5: Final verification

**Files:**
- Test: `npm run lint`
- Test: `npm run build`

- [ ] **Step 1: Run lint one more time**

Run: `npm run lint`
Expected: `✔ No ESLint warnings or errors`

- [ ] **Step 2: Run production build one more time**

Run: `npm run build`
Expected: Build completes successfully and prerenders the current routes.

- [ ] **Step 3: Review changed files against the goal**

Confirm the work only improves text integrity, docs accuracy, data access clarity, and component boundaries, without adding product features.

