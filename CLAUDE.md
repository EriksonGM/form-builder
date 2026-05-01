# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager: **pnpm** (required — `better-sqlite3` is a native addon compiled on install). Node 20+.

- `pnpm install` — install deps; runs `nuxt prepare` via `postinstall`.
- `pnpm dev` — dev server at `http://localhost:3000`. SQLite file is created lazily at `data/kayla-flow.sqlite` on first request.
- `pnpm build` / `pnpm preview` — production build / local preview.
- `pnpm generate` — static generation.

No test, lint, or typecheck scripts are configured.

## Architecture

Nuxt 4 app (Vue 3.5 + Nuxt UI 4 + Tailwind 4) with a Nitro server backed by SQLite. The product is a dynamic form builder: schemas are authored in the UI, persisted as JSON, and rendered/validated at fill time.

### Schema model is the contract

`FormField` / `FormSchema` in [app/types/index.d.ts](app/types/index.d.ts) is the shared contract between the editor, renderer, validator, and DB. Any new field type or property must be threaded through **all** of:

1. [app/composables/useFieldTypes.ts](app/composables/useFieldTypes.ts) — type catalog.
2. [app/composables/useFormValidation.ts](app/composables/useFormValidation.ts) — recursive validator (required / min / max / pattern, with errors propagated from sub-fields up to the parent `object`/`array`).
3. [app/components/form-builder/FieldEditor.vue](app/components/form-builder/FieldEditor.vue) — schema editing UI (recursive).
4. [app/components/form-builder/FieldRenderer.vue](app/components/form-builder/FieldRenderer.vue) — fill-time rendering (recursive).

`object` and `array` fields are recursive and may nest any other type, including more `object`/`array`.

### Modal-with-draft pattern for nested fields

`object` and `array` fields are **always edited via modal**. The modal holds a local draft; changes only persist to the parent on `Save`, and `Cancel` discards. When touching `FieldEditor.vue` / `FieldRenderer.vue` for nested types, preserve this — committing partial drafts to the parent is a regression.

### Server: Nitro auto-imports

Server utilities in [server/utils/db.ts](server/utils/db.ts) (`useDb()`, `rowToForm()`, `rowToSubmission()`) are consumed via Nitro auto-imports — referenced without `import` from `server/api/**`. Don't add explicit imports for these.

DB schema (created on first `useDb()` call): `forms(id, title, description, schema JSON, created_at, updated_at)` and `submissions(id, form_id, data JSON, created_at)` with `ON DELETE CASCADE`. Schemas and submission payloads are stored as serialized JSON strings — `rowToForm` / `rowToSubmission` are the only sanctioned deserializers.

### File fields

`file` field values are stored as **base64 inside the submission JSON** (no separate blob storage). `min`/`max` bound count, `pattern` validates filename/extension.

### i18n

Strategy `no_prefix` (no locale in URL) with browser detection + `i18n_redirected` cookie. Default locale is `pt`. Locales: pt/en/es/fr in [i18n/locales/](i18n/locales/) — keep all four in sync when adding keys.

### Routing

Pages under [app/pages/forms/](app/pages/forms/): `index` (list), `new`, `[id]/index` (view + JSON), `[id]/edit`, `[id]/fill`. API mirrors this under [server/api/forms/](server/api/forms/) plus `/api/stats` for dashboard counters.
