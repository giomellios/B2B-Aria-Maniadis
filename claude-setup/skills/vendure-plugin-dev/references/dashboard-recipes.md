# Dashboard recipes (React admin Dashboard, `@vendure/dashboard`)

Source: docs.vendure.io → "Extending the Dashboard" (v3.7). Items marked **(≥ 3.6)** /
**(≥ 3.7)** don't exist on 3.5.3 — see `version-notes.md` for the 3.5 equivalent.

Contents: §0 How it works · §1 Plugin wiring & entry file · §2 List page · §3 Detail page ·
§4 Page blocks · §5 Customize existing detail pages · §6 Customize existing tables ·
§7 Action bar · §8 Custom form inputs · §9 Navigation · §10 Widgets, alerts, toolbar, providers ·
§11 Data fetching · §12 Imports cheat-sheet · §13 Dev loop, build, deploy

---

## §0 How the Dashboard is extended (read once)

- `@vendure/dashboard` is a package you **never modify**. It's compiled inside this project by
  the `vendureDashboardPlugin` in `vite.config.mts`, which:
  1. loads `src/vendure-config.ts` and finds every plugin with a `dashboard` metadata property,
  2. bundles each plugin's `dashboard/index.tsx` into the app,
  3. introspects the Admin API (the **server must be running**) and writes gql.tada types to
     `src/gql/` (used via `import { graphql } from '@/gql'`).
- Each extension file calls `defineDashboardExtension({...})` with any of: `routes`,
  `pageBlocks`, `navSections`, `actionBarItems`, `alerts`, `widgets`, `customFormComponents`,
  `dataTables`, `detailForms`, `login`, `historyEntries`, `toolbarItems` (≥3.6),
  providers (≥3.7).
- Everything on screen has IDs (`pageId`, `blockId`, `itemId`, nav `id`) — find them with **Dev
  Mode** (user menu, bottom-left → toggle; hover elements) or in `extension-targets.md`.
- Styling: Tailwind utility classes + the design tokens (`text-muted-foreground`,
  `text-destructive`, …). Use the Dashboard's components so extensions look native.

## §1 Plugin wiring & entry file

```bash
npx vendure add -d QuotePlugin
```

This sets `dashboard: './dashboard/index.tsx'` in `@VendurePlugin({...})` and creates the file.
Keep `index.tsx` as a thin registry; put each page/component in its own file:

```tsx
// src/plugins/quote/dashboard/index.tsx
import { defineDashboardExtension } from '@vendure/dashboard';

import { quoteDetail } from './quote-detail';
import { quoteList } from './quote-list';

defineDashboardExtension({
    routes: [quoteList, quoteDetail],
    // pageBlocks: [], actionBarItems: [], dataTables: [], detailForms: [],
    // navSections: [], customFormComponents: {}, widgets: [], alerts: [],
});
```

Project prerequisites (already present in projects created with `@vendure/create` ≥ 3.5):
`vite.config.mts` with `vendureDashboardPlugin({ vendureConfigPath, api, gqlOutputPath: './src/gql' })`
and alias `'@/gql' → ./src/gql/graphql.ts`; `tsconfig.json` excluding
`src/plugins/**/dashboard/*`, `src/gql/*`, `vite.*.*ts` and referencing
`tsconfig.dashboard.json` (jsx `react-jsx`, paths `@/gql` and `@/vdb/*`); and
`DashboardPlugin.init({ route: 'dashboard', appDir })` in `vendure-config.ts`. If any is
missing, follow `/current/core/extending-the-dashboard/getting-started.md`.

## §2 List page (for a `PaginatedList` admin query)

```tsx
// src/plugins/quote/dashboard/quote-list.tsx
import { ActionBarItem, Button, DashboardRouteDefinition, DetailPageButton, Link, ListPage } from '@vendure/dashboard';
// 3.5.x: import PageActionBarRight instead of ActionBarItem (see comment in the JSX below)
import { PlusIcon } from 'lucide-react';

import { graphql } from '@/gql';

// Selected fields become the table's columns automatically.
const quoteListDocument = graphql(`
    query GetQuotes($options: QuoteListOptions) {
        quotes(options: $options) {
            items {
                id
                createdAt
                updatedAt
                code
                state
                total
                customFields
            }
            totalItems
        }
    }
`);

const deleteQuoteDocument = graphql(`
    mutation DeleteQuote($id: ID!) {
        deleteQuote(id: $id) {
            result
            message
        }
    }
`);

export const quoteList: DashboardRouteDefinition = {
    path: '/quotes',
    loader: () => ({ breadcrumb: 'Quotes' }),
    navMenuItem: {
        sectionId: 'sales',   // see extension-targets.md for section IDs
        id: 'quotes',
        url: '/quotes',
        title: 'Quotes',
        // requiresPermission: ['ReadQuote'],
    },
    component: route => (
        <ListPage
            pageId="quote-list"
            title="Quotes"
            listQuery={quoteListDocument}
            deleteMutation={deleteQuoteDocument}
            route={route}
            customizeColumns={{
                code: {
                    header: 'Quote',
                    cell: ({ row }) => <DetailPageButton id={row.original.id} label={row.original.code} />,
                },
                // hide a fetched field from the table but keep it in the query:
                // customFields: { meta: { disabled: true } },
            }}
        >
            {/* ≥ 3.6 (Base UI): */}
            <ActionBarItem itemId="create-button" requires={['CreateQuote']}>
                <Button render={<Link to="./new" />}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    New quote
                </Button>
            </ActionBarItem>
            {/* 3.5.x (Radix) equivalent — verify names in node_modules first:
            <PageActionBarRight>
                <Button asChild>
                    <Link to="./new"><PlusIcon className="mr-2 h-4 w-4" />New quote</Link>
                </Button>
            </PageActionBarRight>
            */}
        </ListPage>
    ),
};
```

(The permission prop on `ActionBarItem` is `requires` in the docs' detail-page example —
confirm against the installed `ActionBarItem` type before relying on it.)

`ListPage` also supports default visible columns / column order, bulk actions, and
`customizeColumns[x].meta.dependencies` (fetch extra fields a custom cell needs). Reference:
`/current/core/reference/dashboard/list-views/list-page.md`.

## §3 Detail page (create + edit)

**Quick version — auto-generated form:**

```tsx
// src/plugins/quote/dashboard/quote-detail.tsx
import { DashboardRouteDefinition, DetailPage, detailPageRouteLoader } from '@vendure/dashboard';

import { graphql } from '@/gql';

const quoteDetailDocument = graphql(`
    query GetQuoteDetail($id: ID!) {
        quote(id: $id) {
            id
            createdAt
            updatedAt
            code
            state
            total
            validUntil
            customerId
            customFields
        }
    }
`);

const createQuoteDocument = graphql(`
    mutation CreateQuote($input: CreateQuoteInput!) {
        createQuote(input: $input) { id }
    }
`);

const updateQuoteDocument = graphql(`
    mutation UpdateQuote($input: UpdateQuoteInput!) {
        updateQuote(input: $input) { id }
    }
`);

export const quoteDetail: DashboardRouteDefinition = {
    path: '/quotes/$id',          // "$id" === "new" when creating
    loader: detailPageRouteLoader({
        queryDocument: quoteDetailDocument,
        breadcrumb: (isNew, entity) => [
            { path: '/quotes', label: 'Quotes' },
            isNew ? 'New quote' : entity?.code,
        ],
    }),
    component: route => (
        <DetailPage
            pageId="quote-detail"
            queryDocument={quoteDetailDocument}
            createDocument={createQuoteDocument}
            updateDocument={updateQuoteDocument}
            route={route}
            title={quote => quote?.code ?? 'New quote'}
            setValuesForUpdate={quote => ({
                id: quote?.id ?? '',
                total: quote?.total ?? 0,
                validUntil: quote?.validUntil,
                state: quote?.state ?? 'Draft',
            })}
        />
    ),
};
```

**Full control version — `useDetailPage` + layout components:**

```tsx
import {
    ActionBarItem, Button, CustomFieldsPageBlock, DashboardRouteDefinition, DetailFormGrid, detailPageRouteLoader,
    FormFieldWrapper, Input, MoneyInput, Page, PageActionBar, PageBlock, PageLayout, PageTitle,
    PermissionGuard, toast, useDetailPage, useNavigate,
} from '@vendure/dashboard';
// ≥3.6: ActionBarItem + `render` prop.  3.5.x: PageActionBarRight + PermissionGuard + `asChild`.
import type { AnyRoute } from '@vendure/dashboard';

function QuoteDetailPage({ route }: { route: AnyRoute }) {
    const params = route.useParams();
    const navigate = useNavigate();
    const isNew = params.id === 'new';

    const { form, submitHandler, entity, isPending, resetForm } = useDetailPage({
        pageId: 'quote-detail', // lets detailForms.extendDetailDocument registrations apply
        queryDocument: quoteDetailDocument,
        createDocument: createQuoteDocument,
        updateDocument: updateQuoteDocument,
        setValuesForUpdate: q => ({ id: q?.id ?? '', total: q?.total ?? 0, state: q?.state ?? 'Draft' }),
        params: { id: params.id },
        onSuccess: async data => {
            toast('Quote saved');
            resetForm();
            if (isNew) await navigate({ to: '../$id', params: { id: data.id } });
        },
        onError: err => toast('Failed to save quote', { description: err instanceof Error ? err.message : 'Unknown error' }),
    });

    return (
        <Page pageId="quote-detail" form={form} submitHandler={submitHandler}>
            <PageTitle>{isNew ? 'New quote' : entity?.code}</PageTitle>
            <PageActionBar>
                {/* ≥3.6 */}
                <ActionBarItem itemId="save-button" requires={['UpdateQuote']}>
                    <Button type="submit" disabled={!form.formState.isDirty || !form.formState.isValid || isPending}>
                        Save
                    </Button>
                </ActionBarItem>
            </PageActionBar>
            <PageLayout>
                <PageBlock column="main" blockId="main-form">
                    <DetailFormGrid>
                        <FormFieldWrapper control={form.control} name="state" label="State"
                            render={({ field }) => <Input {...field} />} />
                        <FormFieldWrapper control={form.control} name="total" label="Total"
                            render={({ field }) => <MoneyInput {...field} />} />
                    </DetailFormGrid>
                </PageBlock>
                <CustomFieldsPageBlock column="main" entityType="Quote" control={form.control} />
            </PageLayout>
        </Page>
    );
}
// route: component: route => <QuoteDetailPage route={route} />
```

Check `MoneyInput`'s props (currency code etc.) in the installed type before using it.
Pages with several tabs: see `/current/core/extending-the-dashboard/creating-pages/tabbed-pages.md`.

## §4 Page blocks (add / replace content on ANY page, incl. built-in ones)

```tsx
defineDashboardExtension({
    pageBlocks: [
        {
            id: 'customer-open-quotes',
            title: 'Open quotes',
            location: {
                pageId: 'customer-detail',
                column: 'side',                       // 'main' | 'side' | 'full'
                position: { blockId: 'groups', order: 'after' }, // 'before' | 'after' | 'replace'
            },
            component: ({ context }) => <OpenQuotes customerId={context.entity?.id} />,
            shouldRender: context => !!context.entity?.id, // hooks allowed here
            // permission gating: check DashboardPageBlockDefinition in the installed types,
            // or wrap the component's content in <PermissionGuard requires={['ReadQuote']}>
        },
    ],
});
```

`context` = `{ entity, form, route }`. Hide a built-in block: `order: 'replace'` +
`shouldRender: () => false`. Component patterns for forms inside detail pages (react to
submit, mark form dirty) → `customizing-detail-pages.md` in the docs ("Interacting with the
detail page form"). A dialog with its own `<form>` inside a detail page must use
`handleNestedFormSubmit(form, onSubmit)` so it doesn't submit the page form.

## §5 Customize an existing detail page (`detailForms`)

```tsx
defineDashboardExtension({
    detailForms: [
        {
            pageId: 'product-detail',
            // Replace a NATIVE field's input (not for custom fields → §8):
            inputs: [{ blockId: 'main-form', field: 'description', component: MarkdownEditor }],
            // Fetch extra data; same top-level field as the page's query:
            extendDetailDocument: `
                query {
                    product(id: $id) {
                        relatedProducts { id name }
                    }
                }
            `,
        },
    ],
});
```

Extra fields appear on `context.entity` in page blocks for that page.

## §6 Customize an existing table (`dataTables`)

```tsx
defineDashboardExtension({
    dataTables: [
        {
            pageId: 'customer-list',            // blockId defaults to 'list-table'
            extendListDocument: `
                query {
                    customers {
                        items { customFields { vatNumber } }
                    }
                }
            `,
            displayComponents: [
                { column: 'emailAddress', component: ({ value, row }) => <a href={`mailto:${value}`}>{value}</a> },
            ],
            bulkActions: [{ order: 100, component: ExportSelectedBulkAction }],
        },
        {
            pageId: 'product-detail',
            blockId: 'product-variants-table',  // nested tables need their blockId
            displayComponents: [{ column: 'sku', component: ({ value }) => <code>{value}</code> }],
        },
    ],
});
```

Bulk action component:

```tsx
import { DataTableBulkActionItem, toast, usePaginatedList } from '@vendure/dashboard';
import { DownloadIcon } from 'lucide-react';

function ExportSelectedBulkAction({ selection, table }) {
    const { refetchPaginatedList } = usePaginatedList();
    return (
        <DataTableBulkActionItem
            label="Export selected"
            icon={DownloadIcon}
            onClick={async () => {
                // call api.mutate(...) here
                toast.success(`Exported ${selection.length} customers`);
                table.resetRowSelection();
                refetchPaginatedList();
            }}
        />
    );
}
```

Prefer this over rebuilding a built-in list route — you keep pagination, filters, saved views.

## §7 Action bar buttons

```tsx
import { Button, defineDashboardExtension, DropdownMenuItem, PermissionGuard, toast } from '@vendure/dashboard';
import { SendIcon } from 'lucide-react';

defineDashboardExtension({
    actionBarItems: [
        {
            pageId: 'order-detail',
            component: ({ context }) => (
                <PermissionGuard requires={['UpdateOrder']}>
                    <Button variant="outline" onClick={() => sendToErp(context.entity?.id)} disabled={!context.entity}>
                        <SendIcon className="mr-2 h-4 w-4" /> Send to ERP
                    </Button>
                </PermissionGuard>
            ),
            // (≥ 3.6) position: { itemId: 'fulfill-order-button', order: 'before' },
        },
        {
            pageId: 'product-list',
            type: 'dropdown',                 // secondary actions in the "…" menu
            component: () => <DropdownMenuItem>Re-sync catalog</DropdownMenuItem>,
        },
    ],
});
```

Button variants: `default`, `secondary`, `outline`, `ghost`, `destructive`. Show loading
states and toast results. On 3.5.x items are placed left of existing ones (no `position`).

## §8 Custom form inputs

**For a custom field / configurable-operation arg** (registered globally by ID):

```tsx
// dashboard/components/vat-number-input.tsx
import { DashboardFormComponent, Input, useFormContext } from '@vendure/dashboard';

export const VatNumberInput: DashboardFormComponent = ({ value, onChange, onBlur, name, disabled }) => {
    const { getFieldState } = useFormContext();
    const error = getFieldState(name).error;
    return (
        <Input
            value={value ?? ''}
            onChange={e => onChange(e.target.value.toUpperCase())}
            onBlur={onBlur}
            disabled={disabled}
            className={error ? 'border-destructive' : ''}
        />
    );
};
// (≥3.6.3) VatNumberInput.metadata = { isFullWidth: true };
```

```tsx
// dashboard/index.tsx
defineDashboardExtension({
    customFormComponents: {
        customFields: [{ id: 'vat-number-input', component: VatNumberInput }],
    },
});
```

```ts
// plugin configuration (server side)
config.customFields.Customer.push({ name: 'vatNumber', type: 'string', ui: { component: 'vat-number-input' } });
```

Standard validation errors (`pattern`, `min`, `max`, required) are displayed by the Dashboard
automatically. For relation pickers use `SingleRelationInput` / multi variant with
`createRelationSelectorConfig({ listQuery, idKey, labelKey, buildSearchFilter })` —
see `/current/core/extending-the-dashboard/custom-form-components/relation-selectors.md`.

**For a native field on a built-in page** → `detailForms[].inputs` (§5).

## §9 Navigation

- Add to an existing section: `navMenuItem: { sectionId, id, title, url? }` on the route (§2).
- New section:

```tsx
import { FileTextIcon } from 'lucide-react';

defineDashboardExtension({
    navSections: [
        { id: 'b2b', title: 'B2B', icon: FileTextIcon, placement: 'top', order: 350 },
    ],
    routes: [{ path: '/quotes', component: QuotesPage, navMenuItem: { sectionId: 'b2b', id: 'quotes', title: 'Quotes' } }],
});
```

Top area default orders: Insights 100, Catalog 200, Sales 300, Customers 400, Marketing 500.
Bottom area: Settings / System. Use Dev Mode to read exact order values. `insights` is not a
section — don't use it as `sectionId`.
- **(≥ 3.6)** `navSections` can be a function `(config) => newConfig` to move/rename/remove
  built-in entries (return a new object, don't mutate).
- Public (logged-out) route: `authenticated: false` on the route.

## §10 Widgets, alerts, toolbar, providers

- **Insights widgets**: wrap in `DashboardBaseWidget`; get the date range with `useWidgetFilters()`.
  ```tsx
  widgets: [{ id: 'open-quotes', name: 'Open quotes', component: OpenQuotesWidget, defaultSize: { w: 3, h: 3 } }]
  ```
  (≥ 3.6.1) `requiresPermissions` on widgets.
- **Alerts**: `alerts: [...]` — see `/current/core/extending-the-dashboard/alerts.md`
  ((≥ 3.6) component-based alert actions).
- **Toolbar items (≥ 3.6)**: `toolbarItems: [...]` in the app header.
- **Custom React providers (≥ 3.7)**: wrap the app/layout — `/current/core/extending-the-dashboard/custom-providers.md`.
- **History entries**, **login page**, **theming**, **localization**: see the matching docs pages.

## §11 Data fetching inside components

```tsx
import { api, toast, useMutation, useQuery, useQueryClient } from '@vendure/dashboard';
import { graphql } from '@/gql';

const openQuotesDocument = graphql(`
    query OpenQuotes($options: QuoteListOptions) {
        quotes(options: $options) { items { id code total } totalItems }
    }
`);

export function OpenQuotes({ customerId }: { customerId?: string }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['open-quotes', customerId],
        queryFn: () => api.query(openQuotesDocument, {
            options: { filter: { customerId: { eq: customerId }, state: { eq: 'Submitted' } } },
        }),
        enabled: !!customerId,
    });
    if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
    if (error) return <div className="text-sm text-destructive">{error.message}</div>;
    return <ul>{data?.quotes.items.map(q => <li key={q.id}>{q.code}</li>)}</ul>;
}
```

Mutations: `useMutation({ mutationFn: vars => api.mutate(doc, vars), onSuccess: () => queryClient.invalidateQueries({ queryKey: [...] }) })`.
`api` automatically sends auth + channel token. Types come from gql.tada — if a new field has no
type, the server wasn't restarted before Vite introspected: restart server, then Vite.

## §12 Imports cheat-sheet

| Need | Import from |
|---|---|
| UI components, layout (`Page`, `ListPage`, `DetailPage`, `PageBlock`, `Button`, `Dialog`, `Input`, …) | `@vendure/dashboard` |
| Hooks (`useAuth`, `useChannel`, `usePermissions`, `useLocalFormat`, `useDetailPage`, …) | `@vendure/dashboard` |
| TanStack Query / Router / Table types, React Hook Form, `toast`, `cn`, `api` | `@vendure/dashboard` |
| `z`, `zodResolver` | `@vendure/dashboard` on ≥ 3.6.1; on 3.5.x `zod` and `@hookform/resolvers/zod` |
| `graphql` | **`@/gql` only** |
| React hooks | `react` |
| Icons | `lucide-react` |
| i18n macros (`Trans`, `useLingui`) | `@lingui/react/macro` |

Internal (non-public) imports via `@/vdb/*` exist but are unstable — only use one if the
public API truly lacks it, and leave a comment explaining why.

## §13 Dev loop, build, deploy

1. Server running (`npm run dev` or equivalent) — needed for schema introspection.
2. `npx vite` → open `http://localhost:3000/dashboard` (it shows a developer placeholder until the
   Vite dev server is running).
3. After **adding** files in `dashboard/` or changing the GraphQL schema: `q` + Enter, `npx vite`.
4. Production: `npx vite build` → `dist/dashboard`, served by
   `DashboardPlugin.init({ route: 'dashboard', appDir })`. `route` must equal Vite `base`
   without slashes. For same-origin serving the Vite `api` option can be `{ host: 'auto', port: 'auto' }`.
   Build-time env vars are baked into the bundle.
5. (≥ 3.7) `vendure dev` / `vendure build` handle server + worker + dashboard together;
   `useExperimentalBundle: true` on `vendureDashboardPlugin` is opt-in and experimental.
