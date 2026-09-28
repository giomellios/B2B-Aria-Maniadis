# Backend recipes (Vendure 3.x server side)

Templates follow the official docs (docs.vendure.io, v3.7) and the code that `npx vendure add`
generates. Replace `Quote` / `quote` / `QuotePlugin` with real names. Everything here works on
3.5.3 unless marked **(≥ 3.x)**.

Contents: §1 Plugin skeleton · §2 Entity · §3 Custom fields · §4 Service · §5 GraphQL API ·
§6 Channel-aware data · §7 Permissions · §8 Events, jobs, scheduled tasks · §9 Strategies &
configurable operations · §10 Migrations · §11 E2E tests · §12 Checklist

---

## §1 Plugin skeleton (with init options)

Generate with `npx vendure add -p QuotePlugin`, then make sure it looks like this.

```ts
// src/plugins/quote/constants.ts
export const QUOTE_PLUGIN_OPTIONS = Symbol('QUOTE_PLUGIN_OPTIONS');
export const loggerCtx = 'QuotePlugin';
```

```ts
// src/plugins/quote/types.ts
export interface QuotePluginOptions {
    /** Days a quote stays valid. Passed in from vendure-config.ts, never read from process.env here. */
    validityDays: number;
    erpApiKey?: string;
}
```

```ts
// src/plugins/quote/quote.plugin.ts
import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { adminApiExtensions, shopApiExtensions } from './api/api-extensions';
import { QuoteAdminResolver } from './api/quote-admin.resolver';
import { QuoteShopResolver } from './api/quote-shop.resolver';
import { QUOTE_PLUGIN_OPTIONS } from './constants';
import { Quote } from './entities/quote.entity';
import { quotePermission } from './permissions';
import { QuoteService } from './services/quote.service';
import { QuotePluginOptions } from './types';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [
        { provide: QUOTE_PLUGIN_OPTIONS, useFactory: () => QuotePlugin.options },
        QuoteService,
    ],
    entities: [Quote],
    adminApiExtensions: { schema: adminApiExtensions, resolvers: [QuoteAdminResolver] },
    shopApiExtensions: { schema: shopApiExtensions, resolvers: [QuoteShopResolver] },
    configuration: config => {
        config.authOptions.customPermissions.push(quotePermission);
        // config.customFields.Customer.push({...});   // see §3
        return config;
    },
    dashboard: './dashboard/index.tsx', // added by `npx vendure add -d QuotePlugin`
    compatibility: '^3.0.0',
})
export class QuotePlugin {
    static options: QuotePluginOptions;

    static init(options: QuotePluginOptions): Type<QuotePlugin> {
        this.options = options;
        return QuotePlugin;
    }
}
```

```ts
// src/vendure-config.ts  (only place that reads env vars)
plugins: [
    // ...
    QuotePlugin.init({
        validityDays: 30,
        erpApiKey: process.env.ERP_API_KEY,
    }),
],
```

Injecting the options in a service:

```ts
constructor(@Inject(QUOTE_PLUGIN_OPTIONS) private options: QuotePluginOptions) {}
```

Lifecycle hooks run in **server and worker**. Guard one-off work:

```ts
import { OnApplicationBootstrap } from '@nestjs/common';
import { ProcessContext } from '@vendure/core';

export class QuotePlugin implements OnApplicationBootstrap {
    constructor(private processContext: ProcessContext) {}
    async onApplicationBootstrap() {
        if (this.processContext.isWorker) return;
        // server-only startup work
    }
}
```

---

## §2 Entity

`npx vendure add -e Quote --selected-plugin QuotePlugin --custom-fields` (add `--translatable`
for translated text). Then shape it:

```ts
// src/plugins/quote/entities/quote.entity.ts
import {
    Channel, ChannelAware, Customer, DeepPartial, EntityId, HasCustomFields, ID, Money, VendureEntity,
} from '@vendure/core';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

export class QuoteCustomFields {}

@Entity()
export class Quote extends VendureEntity implements ChannelAware, HasCustomFields {
    constructor(input?: DeepPartial<Quote>) {
        super(input);
    }

    @Column()
    code: string;

    @Column({ default: 'Draft' })
    state: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

    @Money() // integer, minor units — never a float
    total: number;

    @Column({ type: Date, nullable: true }) // `type: Date` is how Vendure core declares dates (DB-agnostic)
    validUntil: Date | null;

    @ManyToOne(type => Customer, { onDelete: 'CASCADE' })
    customer: Customer;

    @EntityId()
    customerId: ID;

    @ManyToMany(type => Channel)
    @JoinTable()
    channels: Channel[];

    @Column(type => QuoteCustomFields)
    customFields: QuoteCustomFields;
}
```

Notes
- Always extend `VendureEntity` (gives `id`, `createdAt`, `updatedAt`).
- Use `@EntityId()` for foreign-key ID columns so they respect the configured ID strategy.
- Use `@Money()` for monetary columns.
- For nullable dates use `@Column({ type: Date, nullable: true })` (TypeScript unions like
  `Date | null` can't be inferred by TypeORM).
- Register in plugin `entities: [...]`, then generate a migration (§10).

---

## §3 Custom fields on existing entities

Add them in the plugin that owns the feature (not in `vendure-config.ts` directly, unless the
project already does that):

```ts
import { LanguageCode, Permission } from '@vendure/core';

configuration: config => {
    config.customFields.Customer.push(
        {
            name: 'vatNumber',
            type: 'string',
            label: [{ languageCode: LanguageCode.en, value: 'VAT number' }],
            pattern: '^[A-Z]{2}[A-Z0-9]{2,12}$',
            ui: { tab: 'B2B' },
        },
        {
            name: 'creditLimit',
            type: 'int',                  // money in minor units
            public: false,                // hidden from Shop API
            requiresPermission: [Permission.SuperAdmin, Permission.UpdateCustomer], // Admin API
            ui: { component: 'currency-form-input', tab: 'B2B' },
            defaultValue: 0,
            nullable: false,
        },
    );
    config.customFields.Order.push({
        name: 'purchaseOrderNumber',
        type: 'string',
        label: [{ languageCode: LanguageCode.en, value: 'PO number' }],
    });
    return config;
},
```

Types: `string`, `localeString`, `text`, `localeText`, `int`, `float`, `boolean`, `datetime`,
`struct` (≥3.1), `relation` (needs `entity`, optional `eager`, `graphQLType`, `inverseSide`).

Common options: `list`, `label`, `description`, `public` (Shop API visibility, default true),
`readonly` (not settable via API), `internal` (not in GraphQL at all), `defaultValue`,
`nullable` (if false → give `defaultValue`), `unique`, `validate(value, injector, ctx)`,
`requiresPermission` (Admin API only), `deprecated`, `ui: { component, tab, ... }`.
String: `pattern`, `options`, `length`. Number: `min`, `max`, `step`. **(≥ 3.5.6)**
`dashboard: { visible: false }` hides a field from the Dashboard only.

Built-in UI components (`ui.component`): `text-form-input`, `password-form-input`,
`select-form-input`, `textarea-form-input`, `rich-text-form-input`, `json-editor-form-input`,
`html-editor-form-input`, `number-form-input`, `currency-form-input`, `boolean-form-input`,
`date-form-input`, `relation-form-input`, `customer-group-form-input`, `facet-value-form-input`,
`product-selector-form-input`, `product-multi-form-input`. Custom components → dashboard §8.

Relation custom fields: input names become `<name>Id` / `<name>Ids`; relations are **not**
loaded by default — load with `relations: { customFields: { avatar: true } }` or `EntityHydrator`.

Special cases: `OrderLine` custom fields add a `customFields` argument to `addItemToOrder` and
`adjustOrderLine`; `Customer` custom fields appear on `registerCustomerAccount` input;
`Order` custom fields appear on `modifyOrder` input.

**TypeScript typings** (put in the plugin's `types.ts`, import it from the plugin file):

```ts
import { CustomCustomerFields, CustomOrderFields } from '@vendure/core/dist/entity/custom-entity-fields';

declare module '@vendure/core/dist/entity/custom-entity-fields' {
    interface CustomCustomerFields {
        vatNumber: string;
        creditLimit: number;
    }
    interface CustomOrderFields {
        purchaseOrderNumber: string;
    }
}
```

(Use the deep import path exactly as above; order of imports matters.) Every custom field
change → migration (§10).

---

## §4 Service (channel-aware CRUD)

`npx vendure add -s QuoteService --selected-plugin QuotePlugin --type entity`, then align with:

```ts
// src/plugins/quote/services/quote.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { DeletionResponse, DeletionResult } from '@vendure/common/lib/generated-types';
import {
    assertFound, ChannelService, CustomFieldRelationService, ID, ListQueryBuilder, ListQueryOptions,
    PaginatedList, patchEntity, RelationPaths, RequestContext, TransactionalConnection, UserInputError,
} from '@vendure/core';

import { QUOTE_PLUGIN_OPTIONS } from '../constants';
import { Quote } from '../entities/quote.entity';
import { QuotePluginOptions } from '../types';

@Injectable()
export class QuoteService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
        private channelService: ChannelService,
        private customFieldRelationService: CustomFieldRelationService,
        @Inject(QUOTE_PLUGIN_OPTIONS) private options: QuotePluginOptions,
    ) {}

    findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<Quote>,
        relations?: RelationPaths<Quote>,
    ): Promise<PaginatedList<Quote>> {
        return this.listQueryBuilder
            .build(Quote, options, { ctx, relations: relations ?? [], channelId: ctx.channelId })
            .getManyAndCount()
            .then(([items, totalItems]) => ({ items, totalItems }));
    }

    findOne(ctx: RequestContext, id: ID, relations?: RelationPaths<Quote>): Promise<Quote | null> {
        return this.connection.findOneInChannel(ctx, Quote, id, ctx.channelId, { relations });
    }

    async create(ctx: RequestContext, input: CreateQuoteInput): Promise<Quote> {
        const quote = new Quote({ ...input, state: 'Draft' });
        await this.channelService.assignToCurrentChannel(quote, ctx); // current + default channel
        const saved = await this.connection.getRepository(ctx, Quote).save(quote);
        await this.customFieldRelationService.updateRelations(ctx, Quote, input, saved);
        return assertFound(this.findOne(ctx, saved.id));
    }

    async update(ctx: RequestContext, input: UpdateQuoteInput): Promise<Quote> {
        const entity = await this.connection.getEntityOrThrow(ctx, Quote, input.id, {
            channelId: ctx.channelId,
        });
        if (entity.state === 'Approved') {
            throw new UserInputError('Approved quotes cannot be edited');
        }
        const updated = patchEntity(entity, input);
        await this.connection.getRepository(ctx, Quote).save(updated, { reload: false });
        await this.customFieldRelationService.updateRelations(ctx, Quote, input, updated);
        return assertFound(this.findOne(ctx, updated.id));
    }

    async delete(ctx: RequestContext, id: ID): Promise<DeletionResponse> {
        const entity = await this.connection.getEntityOrThrow(ctx, Quote, id, { channelId: ctx.channelId });
        try {
            await this.connection.getRepository(ctx, Quote).remove(entity);
            return { result: DeletionResult.DELETED };
        } catch (e: any) {
            return { result: DeletionResult.NOT_DELETED, message: e.toString() };
        }
    }
}
```

Rules: `ctx` first on every method; `connection.getRepository(ctx, X)` (so the request's
transaction is used); call other Vendure services (`CustomerService`, `OrderService`,
`ProductVariantService`, …) rather than writing to their tables directly; throw
`UserInputError` / `ForbiddenError` / `EntityNotFoundError` from `@vendure/core` for
unexpected errors, and use **ErrorResult unions** (§5) for expected business errors.

Input types (`CreateQuoteInput`, …) — either hand-write TS interfaces matching the SDL, or run
`npx vendure add -c QuotePlugin` to set up GraphQL codegen for the plugin and import generated types.

---

## §5 GraphQL API

```ts
// src/plugins/quote/api/api-extensions.ts
import gql from 'graphql-tag';

// Types shared by both APIs must be declared in EACH schema that uses them.
const commonTypes = gql`
    type Quote implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        code: String!
        state: String!
        total: Money!
        validUntil: DateTime
        customer: Customer!
        customerId: ID!
        customFields: JSON
    }
`;

export const adminApiExtensions = gql`
    ${commonTypes}

    type QuoteList implements PaginatedList {
        items: [Quote!]!
        totalItems: Int!
    }

    # Filled in automatically by Vendure (filter/sort/pagination) — leave the body empty
    input QuoteListOptions

    input CreateQuoteInput {
        customerId: ID!
        total: Money!
        validUntil: DateTime
        customFields: JSON
    }

    input UpdateQuoteInput {
        id: ID!
        total: Money
        validUntil: DateTime
        state: String
        customFields: JSON
    }

    extend type Query {
        quotes(options: QuoteListOptions): QuoteList!
        quote(id: ID!): Quote
    }

    extend type Mutation {
        createQuote(input: CreateQuoteInput!): Quote!
        updateQuote(input: UpdateQuoteInput!): Quote!
        deleteQuote(id: ID!): DeletionResponse!
    }
`;

export const shopApiExtensions = gql`
    ${commonTypes}

    extend type Query {
        myQuotes: [Quote!]!
    }

    extend type Mutation {
        requestQuote(note: String): Quote!
    }
`;
```

The `PaginatedList` shape + empty `input XListOptions` is what makes the Dashboard `ListPage`
work automatically (sorting, filtering, pagination) — always follow it for admin list queries.

```ts
// src/plugins/quote/api/quote-admin.resolver.ts
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DeletionResponse } from '@vendure/common/lib/generated-types';
import { Allow, Ctx, ID, ListQueryOptions, PaginatedList, RelationPaths, Relations, RequestContext, Transaction } from '@vendure/core';

import { Quote } from '../entities/quote.entity';
import { quotePermission } from '../permissions';
import { QuoteService } from '../services/quote.service';

@Resolver()
export class QuoteAdminResolver {
    constructor(private quoteService: QuoteService) {}

    @Query()
    @Allow(quotePermission.Read)
    quotes(
        @Ctx() ctx: RequestContext,
        @Args() args: { options: ListQueryOptions<Quote> },
        @Relations(Quote) relations: RelationPaths<Quote>,
    ): Promise<PaginatedList<Quote>> {
        return this.quoteService.findAll(ctx, args.options || undefined, relations);
    }

    @Query()
    @Allow(quotePermission.Read)
    quote(@Ctx() ctx: RequestContext, @Args() args: { id: ID }, @Relations(Quote) relations: RelationPaths<Quote>) {
        return this.quoteService.findOne(ctx, args.id, relations);
    }

    @Mutation()
    @Transaction()
    @Allow(quotePermission.Create)
    createQuote(@Ctx() ctx: RequestContext, @Args() args: { input: CreateQuoteInput }) {
        return this.quoteService.create(ctx, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(quotePermission.Update)
    updateQuote(@Ctx() ctx: RequestContext, @Args() args: { input: UpdateQuoteInput }) {
        return this.quoteService.update(ctx, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(quotePermission.Delete)
    deleteQuote(@Ctx() ctx: RequestContext, @Args() args: { id: ID }): Promise<DeletionResponse> {
        return this.quoteService.delete(ctx, args.id);
    }
}
```

Shop API resolvers act for the logged-in customer: use `@Allow(Permission.Owner)` and resolve
the customer from `ctx.activeUserId` (e.g. `customerService.findOneByUserId(ctx, ctx.activeUserId)`).
Never accept a `customerId` argument from the storefront.

**Add a field to an existing type** (e.g. show quotes on Customer in the Admin API):

```ts
// schema:  extend type Customer { quotes: [Quote!]! }
@Resolver('Customer')
export class CustomerQuotesFieldResolver {
    constructor(private quoteService: QuoteService) {}

    @ResolveField()
    quotes(@Ctx() ctx: RequestContext, @Parent() customer: Customer) {
        return this.quoteService.findByCustomer(ctx, customer.id);
    }
}
```

**Expected business errors → ErrorResult union** (the Vendure convention instead of throwing):

```graphql
type QuoteExpiredError implements ErrorResult {
    errorCode: ErrorCode!
    message: String!
}
union AcceptQuoteResult = Order | QuoteExpiredError
extend type Mutation { acceptQuote(id: ID!): AcceptQuoteResult! }
```

```ts
@Resolver('AcceptQuoteResult')
export class AcceptQuoteResultResolver {
    @ResolveField()
    __resolveType(value: any): string {
        return value.hasOwnProperty('id') ? 'Order' : 'QuoteExpiredError';
    }
}
// register this resolver in the same *ApiExtensions.resolvers array;
// resolver/service return type: Promise<ErrorResultUnion<AcceptQuoteResult, Order>>
```

Other decorators: `@Api()` (which API is calling), `@Relations()` (auto-join requested
relations). Custom scalars: `scalars: { Foo: FooScalar }` in the `*ApiExtensions` object.
Overriding a built-in resolver: define a resolver method with the same name (use sparingly;
prefer strategies).

---

## §6 Channel-aware data (multi-tenant safety)

For any entity whose rows belong to a tenant/channel:

1. `implements ChannelAware` + `@ManyToMany(() => Channel) @JoinTable() channels: Channel[]` (§2).
2. On create: `await this.channelService.assignToCurrentChannel(entity, ctx)` **before** `save`.
   For translatable entities do it in `TranslatableSaver`'s `beforeSave`.
3. On read: `connection.findOneInChannel(ctx, E, id, ctx.channelId, {...})` and
   `listQueryBuilder.build(E, options, { ctx, channelId: ctx.channelId })`.
4. On update/delete: `connection.getEntityOrThrow(ctx, E, id, { channelId: ctx.channelId })`.
5. Moving between channels: `channelService.assignToChannels(ctx, E, id, channelIds)` /
   `removeFromChannels(...)` — check the admin has permission in the target channels.

For per-customer data in the **Shop API**, additionally filter by the active customer
(`customerId = activeCustomer.id`) — channel scoping alone does not stop customer A from
reading customer B's data within the same channel.

---

## §7 Permissions

```ts
// src/plugins/quote/permissions.ts
import { CrudPermissionDefinition, PermissionDefinition } from '@vendure/core';

export const quotePermission = new CrudPermissionDefinition('Quote');
// → quotePermission.Create / .Read / .Update / .Delete  (CreateQuote, ReadQuote, …)

export const approveQuotePermission = new PermissionDefinition({
    name: 'ApproveQuote',
    description: 'Allows approving B2B quotes',
});
```

Register in the plugin `configuration`: `config.authOptions.customPermissions.push(quotePermission, approveQuotePermission);`
They then appear in **Settings → Roles** in the Dashboard; tell the user to assign them.
Use on custom fields via `requiresPermission`, in the Dashboard via `requiresPermission` on nav
items/routes and `<PermissionGuard requires={['ReadQuote']}>`.

---

## §8 Events, job queue, scheduled tasks

**Subscribe to events** (in a service or the plugin class):

```ts
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventBus, OrderStateTransitionEvent } from '@vendure/core';
import { filter } from 'rxjs/operators';

@Injectable()
export class ErpSyncService implements OnApplicationBootstrap {
    constructor(private eventBus: EventBus) {}

    onApplicationBootstrap() {
        this.eventBus
            .ofType(OrderStateTransitionEvent)
            .pipe(filter(e => e.toState === 'PaymentSettled'))
            .subscribe(event => {
                // keep handlers light: enqueue a job for anything slow or external
                void this.queue.add({ orderId: event.order.id, ctx: event.ctx.serialize() }, { retries: 5 });
            });
    }
}
```

Event classes live in the "Event Types" reference (`OrderPlacedEvent`, `AccountRegistrationEvent`,
`CustomerEvent`, `ProductEvent`, …). Custom events: extend `VendureEvent` and `eventBus.publish(new MyEvent(...))`.

**Job queue** (scaffold: `npx vendure add -j QuotePlugin --name sync-quotes --selected-service QuoteService`):

```ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { JobQueue, JobQueueService, RequestContext, SerializedRequestContext } from '@vendure/core';

@Injectable()
export class ErpSyncService implements OnModuleInit {
    private queue: JobQueue<{ orderId: string; ctx: SerializedRequestContext }>;

    constructor(private jobQueueService: JobQueueService) {}

    async onModuleInit() {
        this.queue = await this.jobQueueService.createQueue({
            name: 'erp-order-sync',
            process: async job => {
                const ctx = RequestContext.deserialize(job.data.ctx);
                // call external API, update entities with ctx …
                return { synced: true };
            },
        });
    }
}
```

Create queues in `onModuleInit` (not `onApplicationBootstrap`). Never put a raw `RequestContext`
in job data. Jobs run on the **worker** — make sure the worker is running in dev and prod.

**Scheduled tasks** (≥ 3.3):

```ts
import { ScheduledTask } from '@vendure/core';

export const expireQuotesTask = new ScheduledTask({
    id: 'expire-quotes',
    description: 'Marks quotes past validUntil as expired',
    schedule: cron => cron.everyDayAt(0, 0),
    async execute({ injector }) {
        const quoteService = injector.get(QuoteService);
        // build a RequestContext if services need one (see "Stand-alone scripts" docs)
    },
});
// in plugin configuration:  config.schedulerOptions.tasks.push(expireQuotesTask);
// requires DefaultSchedulerPlugin.init() in vendure-config.ts plugins
```

---

## §9 Strategies & configurable operations

Most "change how Vendure behaves" requirements are solved by swapping a strategy in
`vendure-config.ts` (or from a plugin `configuration`) — not by overriding resolvers. Look up
the interface in the TypeScript API reference first (`search_docs` with the strategy name).
Useful ones for B2B: `ProductVariantPriceCalculationStrategy`, `OrderItemPriceCalculationStrategy`,
`OrderPlacedStrategy`, `OrderCodeStrategy`, `GuestCheckoutStrategy`, `TaxZoneStrategy`,
`StockAllocationStrategy`, `ActiveOrderStrategy`, `OrderMergeStrategy`, **(≥3.6)**
`OrderTaxCalculationStrategy`, `EntityAccessControlStrategy` (dev preview),
**(≥3.7)** `CustomerChannelAssignmentStrategy`, `OrderLineDiscountDistributionStrategy`.
Strategies can implement `init(injector)` / `destroy()` to get services.

**Invoice / payment-terms payment method** (admins then create a Payment Method using it):

```ts
import { LanguageCode, PaymentMethodHandler } from '@vendure/core';

export const invoicePaymentHandler = new PaymentMethodHandler({
    code: 'invoice',
    description: [{ languageCode: LanguageCode.en, value: 'Pay by invoice' }],
    args: {
        termsDays: { type: 'int', defaultValue: 30, label: [{ languageCode: LanguageCode.en, value: 'Payment terms (days)' }] },
    },
    createPayment: async (ctx, order, amount, args, metadata) => ({
        amount,
        state: 'Authorized', // settled later when the invoice is paid
        metadata: { public: { termsDays: args.termsDays } },
    }),
    settlePayment: async () => ({ success: true }),
});
// configuration: config.paymentOptions.paymentMethodHandlers.push(invoicePaymentHandler);
```

Restrict who may use it with a `PaymentMethodEligibilityChecker` (e.g. only customers in the
"Approved B2B" CustomerGroup).

**Custom order state** (e.g. approval before payment):

```ts
import { OrderProcess } from '@vendure/core';

declare module '@vendure/core' {
    interface CustomOrderStates {
        PendingApproval: never;
    }
}

export const approvalProcess: OrderProcess<'PendingApproval'> = {
    transitions: {
        ArrangingPayment: { to: ['PendingApproval'], mergeStrategy: 'merge' },
        PendingApproval: { to: ['ArrangingPayment', 'Cancelled'] },
    },
    async onTransitionStart(fromState, toState, data) {
        // return a string to block the transition with that error message
    },
};
// vendure-config.ts: orderOptions: { process: [defaultOrderProcess, approvalProcess] }
```

Verify transition names against the default order process docs before shipping; state changes
affect payments/fulfillment — discuss with the user.

Configurable operations (`ShippingCalculator`, `ShippingEligibilityChecker`,
`PromotionCondition`, `PromotionItemAction`/`PromotionOrderAction`, `CollectionFilter`,
`PaymentMethodHandler`) all use `args` with `ui: { component }` — custom arg inputs are built
like custom field components (dashboard §8).

---

## §10 Migrations

1. Change entity / custom field.
2. `npx vendure migrate -g <kebab-name>` → new file in `src/migrations/`.
3. **Read it.** Expect `CREATE TABLE` / `ADD COLUMN` / indexes. Stop and ask the user if you see
   `DROP COLUMN`, `DROP TABLE`, or a column type change on a table with data — you may need
   a hand-written data copy (see the 3.6 upgrade in `version-notes.md` for an example).
4. Run: `npx vendure migrate -r`, or start the server (`src/index.ts` calls `runMigrations`).
5. Revert (only with user approval): `npx vendure migrate --revert`.

Never `synchronize: true` on shared DBs. MySQL/MariaDB don't roll back failed migrations —
back up first. Migration files are code: commit them with the feature.

---

## §11 E2E tests (`@vendure/testing` + Vitest)

One-time setup (if the repo has none): `npm i -D @vendure/testing vitest graphql-tag @swc/core unplugin-swc`,
plus `vitest.config.mts` and `tsconfig.e2e.json` exactly as in the Testing docs page
(`/current/core/developer-guide/testing.md`) — SWC with `useDefineForClassFields: false`.

```ts
// src/plugins/quote/e2e/quote.e2e-spec.ts
import { mergeConfig } from '@vendure/core';
import { createTestEnvironment, registerInitializer, SqljsInitializer, testConfig } from '@vendure/testing';
import gql from 'graphql-tag';
import path from 'path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { QuotePlugin } from '../quote.plugin';
import { initialData } from './fixtures/initial-data';

registerInitializer('sqljs', new SqljsInitializer(path.join(__dirname, '__data__')));

describe('QuotePlugin', () => {
    const { server, adminClient, shopClient } = createTestEnvironment(
        mergeConfig(testConfig, {
            apiOptions: { port: 3061 }, // unique port per spec file (tests run in parallel)
            plugins: [QuotePlugin.init({ validityDays: 30 })],
        }),
    );

    beforeAll(async () => {
        await server.init({
            productsCsvPath: path.join(__dirname, 'fixtures/e2e-products.csv'),
            initialData,
            customerCount: 2,
        });
        await adminClient.asSuperAdmin();
    }, 60000);

    afterAll(async () => {
        await server.destroy();
    });

    it('creates a quote', async () => {
        const result = await adminClient.query(gql`
            mutation { createQuote(input: { customerId: "1", total: 10000 }) { id state } }
        `);
        expect(result.createQuote.state).toBe('Draft');
    });

    it('customer cannot see another customer’s quotes', async () => {
        // log in as customer 2 with shopClient.asUserWithCredentials(...) and assert empty
    });
});
```

Fixtures: copy `e2e-initial-data.ts` and `e2e-products.csv` from the Vendure repo (links in the
Testing docs). Always include a **cross-customer / cross-channel isolation test** for B2B data.

---

## §12 Backend checklist

- [ ] Plugin registered in `vendure-config.ts` (with `.init({...})` if it has options)
- [ ] Entities in `entities: []`; services in `providers: []`; resolvers in the right `*ApiExtensions.resolvers`
- [ ] Custom permissions registered and used in every `@Allow`
- [ ] `@Transaction()` on every mutation
- [ ] Channel scoping + customer ownership checks on tenant data
- [ ] Custom field typings in `types.ts`
- [ ] Migration generated, reviewed, run
- [ ] E2E test incl. isolation test
- [ ] No `process.env` in plugin code; no `RequestContext` in job data
