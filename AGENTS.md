# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js frontend using the App Router. Route entries live under `app/`, such as `app/page.tsx`, `app/books/page.tsx`, and nested routes like `app/books/[id]/page.tsx`. Shared layout is in `app/layout.tsx`, with global styles in `app/globals.css`; `styles/globals.css` is also present and should only be used if the app imports it explicitly.

Reusable UI belongs in `components/`. The `components/ui/` directory contains shadcn/Radix-style primitives, while app-specific components such as `header.tsx` and `footer.tsx` sit directly under `components/`. Hooks live in `hooks/`, utilities in `lib/`, and static files in `public/`.

## Build, Test, and Development Commands

Use pnpm, as this repository includes `pnpm-lock.yaml` and `pnpm-workspace.yaml`.

- `pnpm install`: install dependencies.
- `pnpm dev`: start the local Next.js development server.
- `pnpm build`: create a production build and run Next.js compile checks.
- `pnpm start`: serve the production build after `pnpm build`.
- `pnpm lint`: run ESLint across the repository.

## Coding Style & Naming Conventions

Write TypeScript/TSX and keep `strict` TypeScript compatibility. Use the `@/*` path alias for root imports, for example `@/components/ui/button` or `@/lib/utils`. Keep React components in PascalCase, hooks in `use-name.ts` or `use-name.tsx`, and route files named according to Next.js conventions (`page.tsx`, `layout.tsx`).

Follow the existing shadcn style: compose UI from `components/ui`, use Tailwind utility classes, `cn()` from `lib/utils.ts` for conditional classes, Radix primitives where already available, and lucide icons for iconography.

## Testing Guidelines

No test framework or test script is currently configured. For changes today, run `pnpm lint` and `pnpm build` before handoff. If adding tests, prefer colocated files named `*.test.ts` or `*.test.tsx` and add a `test` script to `package.json` in the same change.

## Commit & Pull Request Guidelines

This checkout does not include Git history, so repository-specific commit conventions are not available. Use concise, imperative commit subjects such as `Add book detail route` or `Fix login form validation`.

Pull requests should include a short summary, linked issue when applicable, testing notes with exact commands run, and screenshots for visible UI changes. Keep PRs scoped to one feature or fix.

## Security & Configuration Tips

Do not commit secrets or environment-specific credentials. Store runtime configuration in local environment files and document required variable names without values. Keep generated folders such as `.next/` and `node_modules/` out of commits.
