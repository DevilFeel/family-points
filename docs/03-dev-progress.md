# Family Points 开发进度

## Phase 1: Foundation ✅
- [x] Next.js 14 项目初始化 (App Router + SSG)
- [x] Tailwind CSS v3 + Shadcn UI (default style)
- [x] Dexie.js 数据库层 (4表: profiles, tasks, logs, rewards)
- [x] 种子数据 (8个预设任务 + 5个预设奖励)
- [x] React hooks (useLiveQuery 实时数据)

## Phase 2: Parent Console ✅
- [x] PIN 锁验证 (4位数字, 默认1234)
- [x] 任务卡片网格 (点击加分)
- [x] 手动调整 (加分/扣分 + 备注)
- [x] 快速扣分按钮 (-5, -10, -20)
- [x] 奖励管理 (添加/删除/兑换)
- [x] 活动记录查看
- [x] 操作反馈动画 (Framer Motion)

## Phase 3: Child Dashboard ✅
- [x] 超大积分数字 + 滚动动画
- [x] 目标进度条
- [x] 背景粒子动画
- [x] 目标达成提示

## Phase 4: Settings & PWA ✅
- [x] 孩子资料编辑
- [x] PIN 码修改
- [x] JSON 导出/导入备份
- [x] PWA manifest + 图标
- [x] next-pwa 离线支持
- [x] 静态导出构建通过

## 待优化
- [ ] 任务管理 (编辑/删除/排序)
- [ ] 音效反馈
- [ ] 更丰富的动画效果
- [ ] 多设备适配测试

## 技术栈
- Next.js 14 (App Router, SSG export)
- Tailwind CSS v3 + Shadcn UI
- Dexie.js + dexie-react-hooks
- Framer Motion
- next-pwa

## 使用
```bash
npm run dev     # 开发服务器 http://localhost:3000
npm run build   # 构建到 out/ 目录
```

- 首页 `/` — 孩子展示页 (纯查看)
- `/parent` — 家长管理页 (PIN: 1234)
- `/settings` — 设置页 (从家长页进入)
