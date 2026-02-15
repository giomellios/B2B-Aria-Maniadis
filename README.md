# B2B-Aria-Maniadis

## 📋 Project Overview

This is a **full-stack B2B e-commerce application** built with [Vendure](https://www.vendure.io/) (headless commerce backend) and [Next.js](https://nextjs.org/) (modern React framework for the storefront). The project uses a monorepo structure with workspaces to manage both the backend API server and the customer-facing storefront application.

**Tech Stack:**
- **Backend:** Vendure 3.5.3 (Node.js/TypeScript GraphQL API)
- **Frontend:** Next.js 16 with React 19
- **Database:** PostgreSQL 15
- **Search:** Meilisearch v1.6
- **Styling:** Tailwind CSS 4 + Radix UI components
- **Type Safety:** TypeScript with gql.tada for GraphQL

---

## 🏗️ Project Structure

```
B2B-Aria-Maniadis/
├── docker-compose.yml          # Docker services (PostgreSQL, Meilisearch)
├── LICENSE
├── README.md                   # This file
└── backend/                    # Monorepo workspace root
    ├── package.json            # Workspace orchestration scripts
    └── apps/
        ├── server/             # Vendure backend API
        └── storefront/         # Next.js customer storefront
```

---

## 📦 Components Deep Dive

### 1. **Root Level** (`/`)

#### `docker-compose.yml`
Defines containerized services required for local development:
- **PostgreSQL** (port 5432): Primary database for Vendure
  - Database: `vendure-b2b`
  - User: `vendure` | Password: `password`
- **Meilisearch** (port 7700): Fast search engine for products
  - Master key: `masterKey123`

**Purpose:** Provides infrastructure dependencies without requiring manual installation.

---

### 2. **Backend Workspace** (`/backend`)

This is the monorepo root managing multiple applications using npm workspaces.

#### `package.json`
**Key Scripts:**
- `npm run dev` - Starts both server and storefront concurrently
- `npm run dev:server` - Starts only the Vendure backend
- `npm run dev:storefront` - Starts only the Next.js storefront
- `npm run build` - Builds both applications for production
- `npm run start` - Runs production builds

**Purpose:** Orchestrates the entire application with unified commands.

---

### 3. **Server Application** (`/backend/apps/server`)

The Vendure headless commerce backend providing GraphQL APIs.

#### Directory Structure:
```
server/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── index-worker.ts       # Background worker process
│   ├── vendure-config.ts     # Vendure configuration
│   ├── gql/                  # GraphQL schema & types
│   └── plugins/              # Custom Vendure plugins (empty - ready for extensions)
├── static/
│   ├── assets/cache/         # Uploaded product images
│   └── email/templates/      # Handlebars email templates
├── .env                      # Environment variables
├── tsconfig.json             # TypeScript config
└── package.json              # Server dependencies
```

#### Key Configuration Files:

**`.env`**
```env
APP_ENV=dev
PORT=3000
DB_HOST=localhost
DB_NAME=vendure-b2b
SUPERADMIN_USERNAME=superadmin
SUPERADMIN_PASSWORD=superadmin
```

**`vendure-config.ts`**
Configures the Vendure server with:
- **API Endpoints:**
  - Admin API: `http://localhost:3000/admin-api` (authenticated admin GraphQL)
  - Shop API: `http://localhost:3000/shop-api` (public customer GraphQL)
  - Dashboard: `http://localhost:3000/dashboard` (admin UI)
  - GraphiQL: `http://localhost:3000/graphiql` (GraphQL playground)
  
- **Plugins:**
  - `AssetServerPlugin` - Handles image/file uploads
  - `EmailPlugin` - Email templating & sending
  - `DashboardPlugin` - Admin UI
  - `GraphiqlPlugin` - API explorer
  - `DefaultSearchPlugin` - Product search
  - `DefaultJobQueuePlugin` - Background job processing
  - `DefaultSchedulerPlugin` - Cron jobs

**Development Flow:**
1. Server process handles HTTP requests
2. Worker process handles background jobs (emails, search indexing)
3. Dashboard provides admin interface for managing catalog, orders, customers

**Purpose:** Complete headless commerce engine with GraphQL APIs for all e-commerce operations.

---

### 4. **Storefront Application** (`/backend/apps/storefront`)

Modern Next.js 16 customer-facing e-commerce storefront.

#### Directory Structure:
```
storefront/
├── src/
│   ├── app/                       # Next.js App Router pages
│   │   ├── layout.tsx             # Root layout with navbar/footer
│   │   ├── page.tsx               # Homepage with hero & featured products
│   │   ├── account/               # Customer account pages
│   │   │   ├── profile/           # Edit profile
│   │   │   ├── orders/            # Order history
│   │   │   ├── addresses/         # Saved addresses
│   │   │   └── verify-email/      # Email verification
│   │   ├── cart/                  # Shopping cart
│   │   │   ├── page.tsx           # Cart view
│   │   │   ├── cart-items.tsx     # Line items display
│   │   │   └── actions.ts         # Server actions (add/remove items)
│   │   ├── checkout/              # Multi-step checkout
│   │   │   ├── page.tsx           # Checkout page
│   │   │   ├── checkout-flow.tsx  # Step orchestration
│   │   │   ├── checkout-provider.tsx # Context for checkout state
│   │   │   ├── steps/             # Individual checkout steps
│   │   │   └── actions.ts         # Server actions (submit order)
│   │   ├── product/[slug]/        # Product detail pages
│   │   ├── collection/[slug]/     # Category/collection pages
│   │   ├── search/                # Search results
│   │   ├── sign-in/               # Authentication
│   │   ├── register/              # User registration
│   │   ├── forgot-password/       # Password reset request
│   │   ├── reset-password/        # Password reset form
│   │   ├── order-confirmation/[code]/ # Post-order confirmation
│   │   └── api/revalidate/        # Cache revalidation webhook
│   ├── components/
│   │   ├── commerce/              # E-commerce specific (product cards, etc.)
│   │   ├── layout/                # Header, footer, navigation
│   │   ├── shared/                # Reusable components
│   │   ├── providers/             # React context providers
│   │   └── ui/                    # Radix UI design system components
│   ├── contexts/
│   │   └── auth-context.tsx       # Authentication state management
│   ├── hooks/
│   │   └── use-mobile.ts          # Responsive breakpoint hook
│   └── lib/
│       ├── vendure/               # Vendure API client & queries
│       │   ├── api.ts             # Base GraphQL client
│       │   ├── queries.ts         # Read queries
│       │   ├── mutations.ts       # Write mutations
│       │   ├── cached.ts          # Cached data fetching
│       │   ├── actions.ts         # Server actions
│       │   └── fragments.ts       # GraphQL fragments
│       ├── auth.ts                # Authentication helpers
│       ├── format.ts              # Price/date formatting
│       ├── metadata.ts            # SEO helpers
│       └── utils.ts               # General utilities
├── public/                        # Static assets
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS setup
├── components.json                # Shadcn UI config
└── package.json                   # Frontend dependencies
```

#### Key Features:

**Routing & Pages:**
- Server-side rendering (SSR) for SEO
- Dynamic routes for products and collections
- Protected account routes with authentication
- API routes for webhooks and revalidation

**UI Components:**
- Complete Radix UI component library (shadcn/ui style)
- Responsive design with mobile-first approach
- Dark mode support via `next-themes`
- Toast notifications via Sonner
- Form validation with `react-hook-form` + Zod

**Data Fetching:**
- Type-safe GraphQL with `gql.tada` (auto-generated types)
- Server components for initial data
- Client components for interactivity
- Server actions for mutations (add to cart, checkout, etc.)
- Cached queries with Next.js cache

**E-commerce Flows:**
1. **Browse**: Homepage → Collections → Product Detail
2. **Purchase**: Add to Cart → Checkout (shipping, payment) → Order Confirmation
3. **Account**: Register → Verify Email → Manage Profile/Orders/Addresses
4. **Search**: Full-text search with filters

**Purpose:** Feature-complete B2B storefront with modern UX and DX.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 20+ and npm
- **Docker** and Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   cd /Users/georgemellios/Dev/B2B-Aria-Maniadis
   ```

2. **Start Docker services**
   ```bash
   docker compose up -d
   ```
   This starts PostgreSQL and Meilisearch containers.

3. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```
   This installs dependencies for both server and storefront (workspaces).

4. **Start development servers**
   ```bash
   npm run dev
   ```
   This runs:
   - Vendure server: http://localhost:3000
   - Vendure admin: http://localhost:3000/dashboard
   - Storefront: http://localhost:3001

### First Time Setup

When you first run the server, Vendure will:
1. Create database schema automatically (`synchronize: true`)
2. Prompt you to create an admin user (uses credentials from `.env`)
3. Allow you to populate initial data

**Access Points:**
- **Admin Dashboard**: http://localhost:3000/dashboard
  - Username: `superadmin`
  - Password: `superadmin`
- **GraphiQL Playground**: http://localhost:3000/graphiql
- **Storefront**: http://localhost:3001

---

## 📝 Development Workflow

### Making Changes

**Backend (Vendure):**
- Add custom plugins in `backend/apps/server/src/plugins/`
- Modify configuration in `vendure-config.ts`
- Extend GraphQL schema via plugins
- Add custom resolvers and services

**Frontend (Next.js):**
- Add pages in `src/app/`
- Create components in `src/components/`
- Add GraphQL operations in `src/lib/vendure/`
- Extend UI components in `src/components/ui/`

### 🔌 Adding New Endpoints (GraphQL Resolvers)

New API endpoints are added through **Vendure Plugins**. Here's how:

#### Location
📁 **File:** `backend/apps/server/src/plugins/your-plugin-name/`

#### Creating a New Plugin

1. **Create plugin directory structure:**
```
backend/apps/server/src/plugins/
└── my-custom-plugin/
    ├── my-custom.plugin.ts
    ├── api/
    │   └── my-custom.resolver.ts
    └── services/
        └── my-custom.service.ts
```

2. **Define your plugin** (`my-custom.plugin.ts`):
```typescript
import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { MyCustomResolver } from './api/my-custom.resolver';
import { MyCustomService } from './services/my-custom.service';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [MyCustomService],
    shopApiExtensions: {
        resolvers: [MyCustomResolver],
        schema: `
            extend type Query {
                myCustomQuery(id: ID!): String!
            }
            
            extend type Mutation {
                myCustomMutation(input: String!): Boolean!
            }
        `,
    },
    // For admin-only endpoints, use adminApiExtensions instead
    adminApiExtensions: {
        resolvers: [MyCustomResolver],
        schema: `
            extend type Query {
                adminOnlyQuery: String!
            }
        `,
    },
})
export class MyCustomPlugin {}
```

3. **Create resolver** (`api/my-custom.resolver.ts`):
```typescript
import { Query, Resolver, Args, Mutation } from '@nestjs/graphql';
import { Ctx, RequestContext } from '@vendure/core';
import { MyCustomService } from '../services/my-custom.service';

@Resolver()
export class MyCustomResolver {
    constructor(private myCustomService: MyCustomService) {}

    @Query()
    async myCustomQuery(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: string }
    ): Promise<string> {
        return this.myCustomService.doSomething(ctx, args.id);
    }

    @Mutation()
    async myCustomMutation(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: string }
    ): Promise<boolean> {
        return this.myCustomService.mutateData(ctx, args.input);
    }
}
```

4. **Create service** (`services/my-custom.service.ts`):
```typescript
import { Injectable } from '@nestjs/common';
import { RequestContext, TransactionalConnection } from '@vendure/core';

@Injectable()
export class MyCustomService {
    constructor(private connection: TransactionalConnection) {}

    async doSomething(ctx: RequestContext, id: string): Promise<string> {
        // Your business logic here
        // Access database via this.connection
        return `Processed ${id}`;
    }

    async mutateData(ctx: RequestContext, input: string): Promise<boolean> {
        // Your mutation logic here
        return true;
    }
}
```

5. **Register plugin in vendure-config.ts:**
```typescript
import { MyCustomPlugin } from './plugins/my-custom-plugin/my-custom.plugin';

export const config: VendureConfig = {
    // ... existing config
    plugins: [
        // ... existing plugins
        MyCustomPlugin,
    ],
};
```

#### Types of Endpoints You Can Add:

**GraphQL Queries** (Read operations):
- `shopApiExtensions` - Public endpoints for customers
- `adminApiExtensions` - Protected endpoints for admins

**GraphQL Mutations** (Write operations):
- Add to schema and implement in resolver as shown above

**REST Endpoints** (if needed):
```typescript
@VendurePlugin({
    controllers: [MyCustomController],  // Add REST controllers here
})
```

#### Testing Your New Endpoints

1. Start the dev server: `npm run dev`
2. Open GraphiQL: http://localhost:3000/graphiql
3. Test your query:
```graphql
query {
  myCustomQuery(id: "123")
}
```

#### Best Practices

✅ **Keep plugins focused** - One plugin per feature domain  
✅ **Use services** - Separate business logic from resolvers  
✅ **Use RequestContext** - Always pass `ctx` for multi-tenancy support  
✅ **Type safety** - Define proper TypeScript types  
✅ **Transactions** - Use `TransactionalConnection` for database operations  
✅ **Authorization** - Use `@Allow()` decorator to restrict access  

#### Example: Adding Permission-Based Endpoint

```typescript
import { Allow, Permission } from '@vendure/core';

@Resolver()
export class MyCustomResolver {
    @Query()
    @Allow(Permission.Authenticated)  // Only logged-in users
    async protectedQuery(@Ctx() ctx: RequestContext): Promise<string> {
        return 'Secret data';
    }

    @Mutation()
    @Allow(Permission.SuperAdmin)  // Only super admins
    async adminOnlyMutation(@Ctx() ctx: RequestContext): Promise<boolean> {
        return true;
    }
}
```

#### Documentation
- 📖 **Plugin Guide**: https://docs.vendure.io/guides/developer-guide/plugins/
- 📖 **Extending GraphQL**: https://docs.vendure.io/guides/developer-guide/extend-graphql-api/
- 📖 **Custom Resolvers**: https://docs.vendure.io/reference/typescript-api/request/resolver-decorator/

### Building for Production

```bash
cd backend
npm run build
```

Builds both applications. Deploy outputs:
- Server: `backend/apps/server/dist/`
- Storefront: `backend/apps/storefront/.next/`

---

## 🎯 Should You Keep This Structure or Start From Scratch?

### ✅ **KEEP IT** - This is an Excellent Starting Point If:

1. **You're building a B2B e-commerce platform**
   - Vendure is production-ready and powers major e-commerce sites
   - All core features are implemented (cart, checkout, accounts, search)
   - Professional, modern UI with shadcn/ui components

2. **You value developer experience**
   - TypeScript everywhere with excellent type safety
   - Hot reload for both frontend and backend
   - Well-organized monorepo structure
   - Modern tooling (Next.js 16, React 19, Tailwind 4)

3. **You need flexibility**
   - Headless architecture separates concerns
   - Empty `plugins/` folder ready for custom business logic
   - GraphQL APIs allow multiple frontends (mobile app, admin tools)
   - Easy to extend without hacking core code

4. **You want production features out-of-the-box**
   - User authentication & authorization
   - Email templates for transactional emails
   - Image handling and optimization
   - Admin dashboard for content management
   - Search with Meilisearch
   - Job queue for background processing

### ❌ **START FROM SCRATCH** - Only If:

1. **You're not building e-commerce**
   - This is specifically designed for online stores
   - Overhead might be unnecessary for non-commerce apps

2. **You need extreme simplicity**
   - Learning curve for Vendure and its concepts
   - Requires understanding of GraphQL

3. **You have very specific requirements**
   - Existing legacy systems to integrate
   - Completely different architecture needs

---

## 🏆 Recommendation

**KEEP THIS STRUCTURE!** Here's why:

### What's Already Built:
✅ Complete backend API with 200+ GraphQL operations  
✅ Professional storefront with 20+ pages  
✅ Authentication & authorization system  
✅ Shopping cart & multi-step checkout  
✅ Product catalog with collections  
✅ Search functionality  
✅ Email system with templates  
✅ Admin dashboard for managing everything  
✅ Docker setup for local development  
✅ TypeScript with full type safety  
✅ Modern UI component library  
✅ Responsive design with dark mode  
✅ SEO optimization  

### What You'd Need to Build From Scratch:
This would take **3-6 months** of full-time development to replicate.

### Next Steps to Customize:

1. **Branding**
   - Update colors in `tailwind.config.ts`
   - Replace logo and assets
   - Modify email templates in `static/email/templates/`

2. **Business Logic**
   - Add custom plugins in `src/plugins/` for specific B2B rules
   - Extend the data model with custom fields
   - Implement pricing tiers, bulk discounts, etc.

3. **Content**
   - Populate product catalog via admin dashboard
   - Configure shipping methods
   - Set up payment processors (replace `dummyPaymentHandler`)

4. **Polish**
   - Customize homepage sections
   - Add your content pages (About, Contact, Terms)
   - Fine-tune checkout flow for your use case

---

## 📚 Resources

- **Vendure Documentation**: https://www.vendure.io/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Vendure Discord**: https://www.vendure.io/community
- **Shadcn UI Components**: https://ui.shadcn.com

---

## 🔧 Common Commands

```bash
# Start everything
cd backend && npm run dev

# Start only backend
cd backend && npm run dev:server

# Start only frontend
cd backend && npm run dev:storefront

# Reset database
docker exec b2b-aria-maniadis-postgres-1 psql -U vendure -d postgres \
  -c "DROP DATABASE IF EXISTS \"vendure-b2b\";" \
  -c "CREATE DATABASE \"vendure-b2b\";"

# View logs
docker compose logs -f

# Stop containers
docker compose down
```

---

## 📄 License

See LICENSE file for details.

---

**Built with ❤️ using Vendure and Next.js**