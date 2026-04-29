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

## Dictionary & I18n (lang-manager)
- **Read-Only Dictionaries**: **NEVER** edit files inside `apps/web/dictionaries/` directly. They are for reference only.
- **CLI Management**: Always use the provided script for any dictionary changes:
  - `npm run lang:create "path.to.key"`: Create new keys.
  - `npm run lang:create "path.to.key" -- --table`: Template for data tables.
  - `npm run lang:create "path.to.key" -- --notifications`: Template for page-specific notifications.
  - `npm run lang:update "path.to.key"`: Update existing translations across all locales.
  - `npm run lang:delete "path.to.key"`: Remove keys from all locale files.
  - `npm run lang:add "code"`: Add a new language to the system (e.g., `es`, `fr`).
- **Standardization**: Before creating a new key, check if it belongs in the `common` section.
  - Use `dict.common.actions` for generic buttons (save, discard, edit).
  - Use `dict.common.table` for pagination, search, and status labels.
- **Consistency**: Reuse common labels to maintain a unified user experience. Avoid variations like "Save", "Update", "Confirm" for the same primary action; default to `common.actions.save`.

### Tutorial: Dictionary Management
1. **Adding a Table Page**: 
   `npm run lang:create "my_page" -- --table`
   *This automatically populates columns and basic form structure.*
2. **Adding Notifications**:
   `npm run lang:create "notifications.my_page" -- --notifications`
   *Populates success, error, and common HTTP status overrides.*
3. **Adding a New Language**:
   `npm run lang:add "es"`
   *Creates es.json with "..." values and registers it in dictionaries.ts.*
4. **Nesting Objects**: When the script asks for variables, use `form{}` to create a nested object.
5. **Updating Values**: Target specific leaf keys for updates:
   `npm run lang:update "common.actions.save"`
6. **Usage in Components**:
   - Extract the required section in the Page: `dict.screens_page`
   - Map it to the form dictionary interface: `ScreenFormDict`
   - Always include the `common` section: `dictDataTable={{ common: dict.common }}`

## References
- Refer to the [nextjs skill](file:///c:/Users/Arthur%20Corr%C3%AAa/Desktop/PROJETO/project-system/.agents/skills/nextjs/SKILL.md) for architecture and async patterns.
- Refer to the [shadcn skill](file:///c:/Users/Arthur%20Corr%C3%AAa/Desktop/PROJETO/project-system/.agents/skills/shadcn/SKILL.md) for component usage and styling principles.
