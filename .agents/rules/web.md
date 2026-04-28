---
trigger: always_on
glob: "apps/web/**"
description: Rules for web application development using Next.js 16 and shadcn/ui.
---

# Web Development Rules

## Framework & Routing (Next.js 16)
- **Middleware Convention**: In this project (Next.js 16), the middleware logic is located in `proxy.ts`. **NEVER** rename this file to `middleware.ts` or change the function name `proxy`. Treat `proxy.ts` as the primary request interceptor.
- **Async APIs**: Always await `params`, `searchParams`, `cookies()`, and `headers()` as per Next.js 16 requirements.
- **RSC First**: Prefer Server Components by default. Use `"use client"` only when necessary for hooks or event listeners.

## UI Components (shadcn/ui)
- **Protect UI Folder**: **NEVER** modify files inside the `components/ui` directory. These are core shadcn components and should remain as installed. 
- **Customization**: To customize a component, either:
  1. Use available `variants` or `props`.
  2. Create a wrapper component in `components/` (outside `ui/`).
  3. Compose existing UI primitives into new features.
- **Composition**: Use `FieldGroup`, `Field`, and `InputGroup` patterns from the `shadcn` skill for all forms.
- **Styling**: Use semantic Tailwind classes (e.g., `bg-primary`, `text-muted-foreground`) and the `cn()` utility. Avoid `space-x-*` or `space-y-*`; use `gap-*` with flex/grid.

## References
- Refer to the [nextjs skill](file:///c:/Users/Arthur%20Corr%C3%AAa/Desktop/PROJETO/project-system/.agents/skills/nextjs/SKILL.md) for architecture and async patterns.
- Refer to the [shadcn skill](file:///c:/Users/Arthur%20Corr%C3%AAa/Desktop/PROJETO/project-system/.agents/skills/shadcn/SKILL.md) for component usage and styling principles.
