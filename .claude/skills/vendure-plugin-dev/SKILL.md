---
name: vendure-plugin-dev
description: Step-by-step procedures for building features in this Vendure 3.x B2B project — creating or changing plugins (entities, services, Admin/Shop GraphQL API, custom fields, permissions, channel-aware data, events, job queues, migrations, e2e tests) and extending the React admin Dashboard (new pages, list/detail views, page blocks, action bar buttons, navigation, custom form inputs, table columns, widgets). Use for any task touching src/plugins, vendure-config.ts, migrations, the GraphQL schema, or anything visible in the admin Dashboard.
---

# Vendure plugin & Dashboard development

This skill is the playbook for changing this Vendure project. `CLAUDE.md` holds the rules;
this skill holds the **procedures and code templates**. Read the reference file for the part
you are working on — don't work from memory, Vendure's APIs are specific.

| Reference | Read it when |
|---|---|
| `references/version-notes.md` | **Always first.** Version gate table (which APIs exist in our installed 3.7.3, and which were added in 3.6/3.7), Dashboard API changes since 3.5, and the upgrade runbook for the next upgrade. |
| `references/backend-recipes.md` | Plugins, entities, custom fields, services, GraphQL, permissions, channels, events, job queue, strategies, migrations, tests. |
| `references/dashboard-recipes.md` | Anything the admin sees: routes/pages, list & detail pages, page blocks, action bar, nav, forms, tables, widgets, data fetching, build & deploy. |
| `references/extension-targets.md` | Built-in `pageId` / `blockId` / action-bar `itemId` / nav section IDs to hook into. |

## Step 0 — Orient (every task)

In this repo, Vendure lives in **`backend/apps/server/`** — every `src/…` path below is
relative to it, and `npx vendure …` must run there. npm workspaces root is `backend/`.

1. Check the installed versions:
   ```bash
   cd backend && npm ls @vendure/core @vendure/dashboard
   ```
2. Open `references/version-notes.md` and note which APIs you may use.
3. Read `src/vendure-config.ts` and list `src/plugins/` so you reuse an existing plugin when the
   feature belongs there (don't create a second plugin for the same capability).
4. If a docs page is needed, use the `vendure-docs` MCP tools (`search_docs`, `get_doc_page`) or
   fetch `https://docs.vendure.io/<path>.md`. Confirm anything version-sensitive against
   `node_modules/@vendure/dashboard/src/lib/` or `node_modules/@vendure/core/dist/`.

## Step 1 — Decide what kind of change it is

| The user wants… | Do this | Recipe |
|---|---|---|
| Extra data on an existing entity (Product, Customer, Order, …) | **Custom field** in a plugin's `configuration` | backend §3 |
| A brand-new kind of record (Quote, CompanyAccount, PriceList…) | **New entity** + service + API + Dashboard pages | backend §2, §4–§6; dashboard §2–§3 |
| New business logic on existing flows (pricing, checkout, shipping, payment, order states) | **Strategy / configurable operation** | backend §9 |
| React to something happening (order placed, customer registered) | **EventBus subscriber** (+ job queue if slow) | backend §8 |
| Background / scheduled work, external sync | **Job queue** / scheduled task | backend §8 |
| A new admin screen | **Dashboard route** (list/detail/custom page) | dashboard §2–§3 |
| Extra info/button/column on an existing admin screen | **pageBlocks / actionBarItems / dataTables / detailForms** | dashboard §4–§7 |
| A custom input for a custom field | **customFormComponents** + `ui.component` | dashboard §8 |
| A new menu section/entry | **navSections / navMenuItem** | dashboard §9 |
| Metrics on the Insights page | **widgets** | dashboard §10 |

## Step 2 — Master procedure: a new feature end-to-end

Example: "B2B customers can request a quote; admins manage quotes in the Dashboard".
Replace `Quote`/`quotes`/`QuotePlugin` with the real names. Use PascalCase for classes,
kebab-case for folders/files.

1. **Create (or pick) the plugin** — non-interactive:
   ```bash
   npx vendure add -p QuotePlugin
   ```
   Result: `src/plugins/quote/quote.plugin.ts` registered in `vendure-config.ts`. Verify the
   registration; if the plugin takes options, change the entry to `QuotePlugin.init({...})`.
2. **Add the entity**:
   ```bash
   npx vendure add -e Quote --selected-plugin QuotePlugin --custom-fields
   ```
   Edit columns/relations (backend §2). If tenant-specific → implement `ChannelAware` (backend §6).
3. **Add the service** (CRUD based on the entity):
   ```bash
   npx vendure add -s QuoteService --selected-plugin QuotePlugin --type entity
   ```
   Then make it channel-aware and add business methods (backend §4).
4. **Add the API extension** — check the flag names first with `npx vendure add --help`
   (docs show both `--queryName` and `--query-name` in different places):
   ```bash
   npx vendure add -a QuotePlugin --queryName quotes --mutationName createQuote
   ```
   Then finish the SDL + resolvers by hand (backend §5): admin API = full CRUD with
   `PaginatedList`; shop API = only what a logged-in customer may do (`Permission.Owner`).
5. **Permissions**: define `CrudPermissionDefinition('Quote')`, register it in `configuration`,
   use it in every `@Allow` (backend §7).
6. **Migration**:
   ```bash
   npx vendure migrate -g add-quote-entity
   ```
   Open the new file in `src/migrations/`, check every statement (no unexpected `DROP`), then
   `npx vendure migrate -r` (or just start the server).
7. **Dashboard**:
   ```bash
   npx vendure add -d QuotePlugin
   ```
   This adds `dashboard: './dashboard/index.tsx'` to the plugin and creates the entry file.
   Replace the test page with a list page + detail page (dashboard §2–§3). Restart Vite.
8. **Test**: e2e spec in `src/plugins/quote/e2e/` (backend §11). Run it.
9. **Verify** against the Definition of done in `CLAUDE.md` §8, then report to the user:
   files changed, migration name, new permissions to assign to roles, manual steps.

If any CLI command prompts for input or fails, stop it and create the files by hand from the
templates in `backend-recipes.md` — the result must look the same (including registration in
`vendure-config.ts` and the plugin metadata).

## Step 3 — Extending an existing Dashboard screen (the "closed package" case)

The Dashboard package itself is never edited. To change a built-in screen:

1. Ask the user (or tell them how) to turn on **Dev Mode** in the Dashboard (user menu, bottom
   left) and hover the area to read its `pageId` / `blockId` / `itemId`. Or look it up in
   `references/extension-targets.md`.
2. Pick the extension point: `pageBlocks` (add/replace a block), `actionBarItems` (buttons),
   `dataTables` (columns, cell renderers, bulk actions, extra list fields), `detailForms`
   (replace a native input, fetch extra fields), `navSections` (menu).
3. Put it in the relevant plugin's `dashboard/index.tsx` inside `defineDashboardExtension({...})`.
   If the plugin has no `dashboard` folder yet: `npx vendure add -d <PluginName>`.
4. If you need data the page doesn't fetch, use `extendDetailDocument` / `extendListDocument`
   (dashboard §5–§6). If the data doesn't exist in the API yet, add a field resolver or custom
   field first (backend §3, §5), restart the server so the schema regenerates, then restart Vite.
5. Restart Vite, reload the page, verify.

## Common failure modes → fix

| Symptom | Likely cause / fix |
|---|---|
| Extension doesn't show up | Plugin missing from `plugins` in `vendure-config.ts`, `dashboard` path wrong, or Vite not restarted after adding files. |
| `graphql()` query has no types / `any` | Imported `graphql` from `@vendure/dashboard` instead of `@/gql`; or server not running when Vite started (schema introspection failed) → start server, restart Vite. |
| Docs example fails to compile | API is newer than our version (see version-notes) — e.g. `render` prop vs `asChild`, `ActionBarItem` vs `PageActionBarRight`, `z` from `@vendure/dashboard`. |
| "Your database schema does not match…" on boot | Missing migration → generate + review + run. |
| Custom field not visible in Dashboard | Migration not run, `internal: true`, `requiresPermission` the admin lacks, or `dashboard: { visible: false }`. |
| Data from another channel shows up | Missing `channelId: ctx.channelId` / `findOneInChannel`; entity not `ChannelAware`. |
| Code runs twice at startup | Lifecycle hook runs in server **and** worker → guard with `ProcessContext.isWorker`. |
| Mutation partially saved after an error | Missing `@Transaction()` on the resolver, or repository used without `ctx`. |
