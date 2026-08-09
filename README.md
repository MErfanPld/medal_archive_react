# Medal Archive Pro (Frontend)

آرشیو حرفه‌ای مدال و سکه — پلتفرم مدیریت مجموعه و تجربه موزه‌ای دیجیتال.

**Frontend:** Next.js + TypeScript + Tailwind CSS (RTL / Persian-first)

**Backend API:** [medal_archive_api](https://github.com/MErfanPld/medal_archive_api)

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- TanStack Query
- Zustand
- React Hook Form + Zod
- Lucide React
- Vazirmatn font

## Getting Started

```bash
git clone git@github.com:MErfanPld/medal_archive_react.git
cd medal_archive_react
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL
npm run dev
```

## Architecture

- `(auth)` — Login / Invite
- `(museum)` — Authenticated museum experience
- `admin/` — Management panel

API client under `src/lib/api/`. Types from OpenAPI. JWT auth via Zustand.
