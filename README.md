# Family Points

一个面向家庭场景的离线积分小应用，适合家长给孩子记录日常任务、加分扣分和奖励兑换。

## 当前功能

- 首页 `/`
  - 展示当前积分
  - 快捷任务加分
  - 自定义加分 / 扣分
  - 奖励兑换
  - 今日记录查看
- 家长页 `/parent`
  - 管理任务
  - 管理奖励
  - 查看积分统计和操作记录
- 设置页 `/settings`
  - 修改孩子名称
  - 导出 / 导入本地备份
  - 清空本地数据

## 技术栈

- Next.js 14 App Router
- TypeScript
- Dexie + IndexedDB
- Tailwind CSS
- Framer Motion
- next-pwa

## 数据模型

当前应用基于单个孩子档案运行，主要表如下：

- `profiles`: `id`, `name`, `balance`
- `tasks`: `id`, `title`, `points`, `icon`, `sortOrder`
- `logs`: `id`, `profileId`, `amount`, `reason`, `type`, `timestamp`
- `rewards`: `id`, `title`, `cost`, `icon`, `enabled`

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 构建

```bash
npm run build
```

项目使用静态导出，并带有 PWA 支持。
