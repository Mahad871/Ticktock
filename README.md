# Ticktock (Next.js 15)

Starter with Next.js 15 + TypeScript, TailwindCSS, shadcn/ui, and NextAuth.

## Stack

- Next.js 15 App Router + React 19
- TailwindCSS 3 + shadcn/ui primitives (`components/ui/*`)
- NextAuth credentials provider (password is `password`)
- Internal API route example at `/api/ping`
- Inter font from Google Fonts (applied globally)

## Getting started

```bash
npm install
npm run dev
```

Environment variables (create `.env.local`):

```
AUTH_SECRET=change-me
NEXTAUTH_URL=http://localhost:3000
```

## Auth

- Sign in with any email and the password `password`.
- Protected route: `/dashboard` is guarded by NextAuth middleware.

## shadcn/ui

Config lives in `components.json`. Generate new components with:

```bash
npx shadcn@latest add button
```

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm start` — run built app
- `npm run lint` — lint the project
