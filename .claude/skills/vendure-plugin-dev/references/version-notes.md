# Version notes: what exists in our installed 3.7.3 (and what came in 3.6 / 3.7), and the upgrade runbook

The docs at docs.vendure.io track the **latest** release. This project runs **3.7.3**
(upgraded from 3.5.3 in Sept 2026) — the "3.5.3" column below is kept for reference and for
reading older code. Confirm the installed versions with (in `backend/`):

```bash
npm ls @vendure/core @vendure/dashboard typeorm
```

**Confirmed in this repo's installed `@vendure/dashboard@3.7.3`:** `Button` is Base UI with a
`render` prop (`src/lib/components/ui/button.tsx`); `ActionBarItem` exists
(`framework/layout-engine/action-bar-item-wrapper.tsx`) and `PageActionBarRight` is still
exported; `z`/`zodResolver` are re-exported; Vite 7. (Before the upgrade, 3.5.3 had Radix
`asChild`, no `ActionBarItem`, no zod re-export, Vite 6.4.1.)

When unsure whether something exists, search the installed code, e.g.
`grep -rn "export .*ActionBarItem" node_modules/@vendure/dashboard/src/lib | head` or
`grep -rn "asChild\|render=" node_modules/@vendure/dashboard/src/lib/components/ui/button.tsx`.

## 1. Version gate table

| Feature / API | Available from | On 3.5.3 do this instead |
|---|---|---|
| React Dashboard as default, `npx vendure schema`, dashboard extension localization | 3.5.0 | ✓ available |
| `ListPage` column `meta.disabled` | 3.5.3 | ✓ available |
| Custom field option `dashboard: { visible: false }` | 3.5.6 | use `internal: true` or `requiresPermission` |
| Dashboard on **Base UI** (`@vendure-io/ui`): composition via **`render` prop** | 3.6.0 | Radix/shadcn style: **`asChild`** (e.g. `<Button asChild><Link …/></Button>`) |
| `ActionBarItem` component & `actionBarItems[].position` | 3.6.0 | `PageActionBarRight` / `PageActionBarLeft`; custom items are placed left of built-ins |
| `toolbarItems` extension point | 3.6.0 | not available |
| `navSections` as a function (move/rename/remove built-ins) | 3.6.0 | only add sections/items |
| Component-based alert actions | 3.6.0 | callback-based actions |
| API keys (auth + Dashboard UI), `EntityAccessControlStrategy` (preview), `OrderTaxCalculationStrategy`, shared/channel-aware ProductOptionGroups, translatable Assets, `BootstrappedEvent`, `onBeforeAppListen`, per-queue job concurrency | 3.6.0 | not available |
| `productOptionGroups` query returns a paginated list | 3.6.0 | returns a flat array (`filterTerm` arg) |
| `z` / `zodResolver` re-exported from `@vendure/dashboard` (Zod v3 & v4) | 3.6.1 | import from `zod` and `@hookform/resolvers/zod` |
| Widget `requiresPermissions` | 3.6.1 | check permission inside the widget |
| Form component `metadata.isFullWidth` honoured | 3.6.3 | ignored |
| CLI `vendure dev` / `build` / `start` / `doctor`; CLI fails fast instead of prompting in non-interactive envs | 3.7.0 | package.json scripts + `npx vite`; always pass all CLI flags |
| AGENTS.md in new projects; official agent skills (`npx skills add vendurehq/vendure`) | 3.7.0 | n/a (skills can still be installed) |
| Custom React providers, `theme.additionalStylesheets`, DataTable column defaults via extension API, `tanstackRouterPluginOptions`, `useExperimentalBundle` | 3.7.0 | not available |
| `CustomerChannelAssignmentStrategy`, `OrderLineDiscountDistributionStrategy`, `CouponRemovedDuringCheckoutError` | 3.7.0 | not available |
| `apiOptions.csrfPrevention` | 3.7.3 | not available |

If you are unsure whether an API predates 3.5.3, look for "since" / "Version Introduced" /
`@since` notes in the docs or `.d.ts` files, or search the installed package.

## 2. Writing Dashboard code that survives the upgrade

- Import everything from `@vendure/dashboard` (never Radix/Base UI/TanStack directly). The
  3.6 migration from Radix to Base UI broke only extensions that imported the primitives directly.
- Keep 3.5-only constructs (`asChild`, `PageActionBarRight`, `zod` imports) few and obvious so
  the codemod (below) can rewrite them.
- Don't depend on internal paths (`@/vdb/*`) unless unavoidable.

## 3. Upgrade runbook (used for 3.5.3 → 3.7.3; reuse the pattern for future upgrades)

Only run this when the user asks. It is a moderate job: most effort is the **database
migration of 3.6** and checking custom Dashboard code. A direct jump to 3.7.3 is fine (one
generated migration covers everything; no 3.7-specific schema change is announced), but read
both release notes: <https://github.com/vendurehq/vendure/releases/tag/v3.6.0> and
<https://github.com/vendurehq/vendure/releases/tag/v3.7.0>.

### 3.0 Prepare
1. Create a git branch. Make sure the working tree is clean.
2. **Back up every database** that will be migrated (dev copy first, then staging, then prod).
3. Note all `@vendure/*` packages in `package.json` and any community plugins in use.

### 3.1 Bump packages (all together, same version)
- Set every `@vendure/*` dependency to `3.7.3` (core, common, dashboard, cli, testing,
  email-plugin, asset-server-plugin, graphiql-plugin, job-queue-plugin, admin-ui-plugin,
  ui-devkit, harden-plugin, telemetry-plugin — whichever are present).
- **Moved plugins** (3.6): replace
  `@vendure/payments-plugin` → `@vendure-community/stripe-plugin` / `braintree-plugin` / `mollie-plugin`,
  `@vendure/elasticsearch-plugin` → `@vendure-community/elasticsearch-plugin` (requires
  Elasticsearch **9.1** + `@elastic/elasticsearch@9.1.0` + full reindex — one-way upgrade),
  `@vendure/sentry-plugin` → `@vendure-community/sentry-plugin`,
  `@vendure/stellate-plugin` → `@vendure-community/stellate-plugin`,
  PubSub job queue (`@vendure/job-queue-plugin` pub-sub) → `@vendure-community/pub-sub-plugin`.
  Update every import (e.g. `@vendure/payments-plugin/package/stripe` → `@vendure-community/stripe-plugin`).
  BullMQ stays in `@vendure/job-queue-plugin`.
- The Dashboard uses **Vite 7** since 3.6 — make the project's `vite` devDependency match what
  `@vendure/dashboard` expects.
- Install with the project's package manager; if `bcrypt` errors, `npm rebuild bcrypt`.

### 3.2 Database migration (the critical step)
1. `npx vendure migrate -g v36-v37-upgrade`
2. Open the generated file. **Before running it**, insert the two data helpers from `@vendure/core`:
   ```ts
   import { migrateAssetTranslationData, migrateProductOptionGroupData } from '@vendure/core';
   // ...inside up(), after the CREATE TABLE statements for the new join/translation tables:
   await migrateProductOptionGroupData(queryRunner);   // immediately BEFORE: DROP COLUMN "productId" on product_option_group
   await queryRunner.query(`ALTER TABLE "product_option_group" DROP COLUMN "productId"`);
   await migrateAssetTranslationData(queryRunner);     // immediately BEFORE: DROP COLUMN "name" on asset
   await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "name"`);
   ```
   Skipping this **permanently deletes** asset names and option-group ↔ product links.
   SQLite uses a temp-table copy pattern instead of `DROP COLUMN` — insert the helpers before the
   copy that omits the column. Helpers are idempotent.
3. Run on a copy of real data first: `npx vendure migrate -r`. Spot-check assets and product
   options in the Dashboard.

### 3.3 Code changes
- **Dashboard extensions**: run the codemod only on plugin folders (never the repo root if a
  storefront lives in the same repo):
  `npx vendure codemod dashboard-base-ui src/plugins/`
  then `npx tsc --noEmit` (+ dashboard tsconfig) and fix leftovers by hand (Radix→Base UI prop
  differences, e.g. `asChild` → `render`). The official skill `radix-to-base-ui-migration`
  (`npx skills add vendurehq/vendure`) can help.
- GraphQL: `productOptionGroups` is now paginated (`options: { filter: { name: { contains } } }` →
  `items`/`totalItems`). Asset has `translations`. Regenerate any storefront codegen.
- `OrderMergeStrategy.merge()` may be async — `await` it if called directly.
- **3.7 breaking**: coupon codes compared case-insensitively; production refuses to start with
  the default superadmin password (set `authOptions.superadminCredentials` from env vars); custom
  `AuthenticationStrategy` must return `verified: true` for provider-verified emails to link
  existing accounts; email plugin now uses `mjml` 5 and `nodemailer` 9 (re-test email templates
  and custom transports); add `@nestjs/terminus` yourself if custom health checks used it.
- **3.7.3 behaviour changes** (security): stricter channel scoping on several admin mutations
  and `administrators` queries; asset server serves SVG/HTML/XML as downloads; renamed MIME
  types if you list them in `assetOptions.permittedFileTypes`; new opt-in
  `apiOptions.csrfPrevention`. After upgrading: purge settled job data and consider
  invalidating admin sessions (session tokens were exposed in job data before 3.7.3), and set
  an explicit CORS origin allowlist.
- Anonymous telemetry is on by default since 3.6 — set `VENDURE_DISABLE_TELEMETRY=true` if the
  client wants it off.

### 3.3b This repo specifically (B2B-Aria-Maniadis)
- `backend/patches/@vendure+dashboard+3.5.3.patch` will no longer apply (file name is
  version-bound, and the Dashboard UI was rebuilt in 3.6). Delete it, check whether the
  "Explore Enterprise Edition" menu link still exists in 3.7, and if needed hide it via a
  supported extension instead, or regenerate the patch with `npx patch-package @vendure/dashboard`.
- `scripts/setup-greek-translations.js` copies `lingui.config.js` + `el.po` into
  `node_modules/@vendure/dashboard` — verify the destination paths still exist and the Greek
  UI still works; merge any new msgids into `el.po`.
- `search/b2b-search-strategy.ts` re-implements a private method of the internal
  `PostgresSearchStrategy` — diff it against the 3.7.3 source
  (`node_modules/@vendure/core/dist/plugin/default-search-plugin/search-strategy/postgres-search-strategy.js`)
  and re-test SKU fragment search. (3.6.2 also changed Postgres tsquery sanitising there.)
- Run the codemod on `backend/apps/server/src/plugins/` only — **never on `backend/`**, which
  would rewrite the Next.js storefront's `sonner`/Radix imports.
- `synchronize: true` is used in dev: generate the upgrade migration against a copy of the
  **production** database (or a DB restored from a prod dump), never against the synced dev DB.
- Custom fields have non-null defaults (`vatNumber`, `company`) — check the generated SQL keeps them.
- Update the server `Dockerfile` base image if the new version needs a newer Node.

### 3.4 Verify
1. `npx tsc --noEmit`, `npx vite build`, run e2e tests.
2. `npx vendure doctor` (and `npx vendure doctor --profile production` for prod config).
3. Boot server + worker, click through Dashboard: products with options, assets, orders,
   customers, every custom page/block.
4. Update `CLAUDE.md` §1 (version) and remove 3.5-only notes; update this file's header.
