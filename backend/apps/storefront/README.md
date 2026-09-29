<p align="center">
  <a href="https://vendure.io">
    <img alt="Vendure logo" height="60" width="auto" src="https://a.storyblok.com/f/328257/699x480/8dbb4c7a3c/logo-icon.png/m/0x80">
  </a>
</p>
<h1 align="center">
  Vendure Next.js Storefront Starter
</h1>
<h3 align="center">
    A Next.js 16 storefront starter for Vendure headless commerce
</h3>
<p align="center">
 Use as a foundation to build upon, take inspiration from, or learn the ergonomics of the Vendure Shop API.
</p>
<h4 align="center">
  <a href="https://next.vendure.io">Demo</a> |
  <a href="https://docs.vendure.io">Documentation</a> |
  <a href="https://vendure.io">Website</a>
</h4>

## Features

**Authentication & Accounts**

- Customer registration with email verification
- Login/logout with session management
- Password reset & change password
- Email address updates with verification

**Customer Account**

- Profile management (name, email, password)
- Address management (create, update, delete, set default)
- Order history with pagination & detailed order views

**Product Browsing**

- Collections & featured products
- Product detail pages with variants & galleries
- Full-text search with faceted filtering
- Pagination & sorting

**Shopping Cart**

- Add/remove items, adjust quantities
- Promotion code support
- Real-time cart updates with totals

**Checkout**

- Multi-step flow: shipping address, delivery method, payment, review
- Saved address selection
- Shipping method selection
- Payment integration

**Order Management**

- Order confirmation page
- Order tracking with status
- Detailed order information

## Roadmap

- Multi-currency support (coming soon)
- Multi-language with next-intl (coming soon)

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Architecture

Feature-based: code is grouped by **what it does** (a business capability), not by file type.

```
src/
  app/                    Routing only (Next.js App Router). Pages load data through feature
    (shop)/               loaders and render feature components. Route groups don't change URLs.
    (auth)/               sign-in, register, password reset, verify-pending
    account/              customer account (own layout)
    api/                  route handlers
  features/               one folder per business capability (see "Feature shape")
    auth/  catalog/  cart/  checkout/  account/  home/
  design-system/          generic, brand-styled UI primitives (shadcn/ui + Radix)
    forms/                button, input, label, checkbox, radio-group, select, field, form
    overlays/             dialog, alert-dialog, popover, dropdown-menu, command
    navigation/           navigation-menu, pagination
    feedback/             alert, badge, skeleton, sonner (toaster)
    data-display/         card, table, accordion, carousel, separator
    motion/               reveal-heading
    index.ts              public API: import { Button, Card } from "@/design-system"
  components/
    shared/               commerce building blocks used by several features
                          (price, order totals, pagination, country select)
    layout/               app shell: navbar, footer, search
    providers/            React context providers (theme)
  lib/
    api/                  Shop API client, gql.tada `graphql`, auth-token cookie (server-only)
    queries/              shared cached queries (channel, countries, top collections)
    config/               env.ts (client-safe) and env.server.ts (every other process.env read)
    utils/                cn, asset URLs, formatting, SEO metadata helpers
  types/                  global types (generated graphql-env.d.ts)
```

### Feature shape

Every feature uses the same layout. Folders exist only when the feature needs them.

```
features/<name>/
  components/             React components (server and client)
  hooks/                  React hooks                     e.g. checkout/hooks/use-checkout.ts
  services/               everything that talks to the Shop API
    queries.ts            gql.tada documents (also mutations.ts, fragments.ts)
    <name>.service.ts     data loaders, server-only       e.g. catalog.service.ts
    <name>.actions.ts     "use server" server actions     e.g. cart.actions.ts
  schemas/                zod schemas, <name>.schema.ts   e.g. auth/schemas/login.schema.ts
  utils/                  pure helpers
  types.ts                feature types
  index.ts                public, client-safe API (components, hooks, actions, types)
  server.ts               public, server-only API (loaders, async server components)
```

A feature has **two** entry points because a client component that imports a barrel pulls in
everything that barrel re-exports. If `index.ts` also re-exported a data-fetching server
component, `import "server-only"` would break the client build. So async server components and
loaders go in `server.ts`, and everything that is safe in the browser goes in `index.ts`.

### Rules (enforced by ESLint, see `eslint.boundaries.mjs`)

1. Import with the `@/` alias, never `../`.
2. Outside a feature, import it only through `@/features/<name>` or `@/features/<name>/server`.
   Inside a feature, use direct paths (`@/features/cart/services/cart.service`).
3. Outside `design-system/`, import primitives only from `@/design-system`.
4. `design-system/`, `components/shared/` and `lib/` never import features, routes or the app shell.
   The design system depends only on `lib/` and third-party packages.
5. Nothing imports from `app/`.
6. Pages and components don't call the API client directly; they call a feature's
   `services/*.service.ts` loader or a server action.
7. Modules that touch cookies, secrets or the API client start with `import "server-only"`.

New shadcn components (`npx shadcn add <name>`) land in `src/design-system/`. Move them into the
right category folder and export them from `design-system/index.ts`.

### GraphQL types

gql.tada is typed against **our own Shop API schema** (`schema-shop.graphql`, which is committed),
so custom fields such as `Customer.customFields.vatNumber` are fully typed. After changing the
Shop API on the server (custom fields, plugins), regenerate it:

```bash
npm run schema:shop -w storefront   # from backend/
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
