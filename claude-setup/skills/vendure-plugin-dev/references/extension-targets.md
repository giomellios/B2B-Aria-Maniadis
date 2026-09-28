# Dashboard extension target IDs

From docs.vendure.io "Extension Targets" (v3.7). **Dev Mode is the source of truth** (user
menu → Dev Mode, then hover). Some pages exist only on newer versions (e.g. API keys, option
groups, settings store came in 3.6) — if an ID doesn't work on 3.5.3, check in Dev Mode.

## List pages (`dataTables` target the `list-table` block unless noted)

| Page | `pageId` | Main block |
|---|---|---|
| Products | `product-list` | `list-table` |
| Product variants | `product-variant-list` | `list-table` |
| Collections | `collection-list` | `list-table` |
| Facets | `facet-list` | `list-table` |
| Assets | `asset-list` | `asset-gallery` |
| Orders | `order-list` | `list-table` |
| Customers | `customer-list` | `list-table` |
| Customer groups | `customer-group-list` | `list-table` |
| Promotions | `promotion-list` | `list-table` |
| Administrators | `administrator-list` | `list-table` |
| Roles | `role-list` | `list-table` |
| Channels | `channel-list` | `list-table` |
| Sellers | `seller-list` | `list-table` |
| Stock locations | `stock-location-list` | `list-table` |
| Shipping methods | `shipping-method-list` | `list-table` |
| Payment methods | `payment-method-list` | `list-table` |
| Tax categories | `tax-category-list` | `list-table` |
| Tax rates | `tax-rate-list` | `list-table` |
| Countries | `country-list` | `list-table` |
| Zones | `zone-list` | `list-table` |
| Job queue | `job-queue-list` | `list-table` |
| Scheduled tasks | `scheduled-tasks-list` | `list-table` |
| Settings store (≥3.6) | `settings-store-list` | `list-table` |
| API keys (≥3.6) | `api-key-list` | `list-table` |

## Detail pages (most use `main-form` and `custom-fields` blocks)

`product-detail`, `product-variant-detail`, `collection-detail`, `facet-detail`,
`facet-value-detail`, `asset-detail`, `order-detail`, `seller-order-detail`,
`draft-order-detail`, `order-modify`, `customer-detail`, `customer-group-detail`,
`promotion-detail`, `administrator-detail`, `role-detail`, `channel-detail`, `seller-detail`,
`option-group-detail`, `option-group-option-detail`, `manage-product-variants`,
`stock-location-detail`, `shipping-method-detail`, `payment-method-detail`,
`tax-category-detail`, `tax-rate-detail`, `country-detail`, `zone-detail`, `api-key-detail`,
`global-settings`, `profile`

## Block IDs per page

| Page | `blockId` values |
|---|---|
| Standard list pages | `list-table` |
| Insights | `widgets` |
| Asset list | `asset-gallery` |
| Product detail | `enabled-toggle`, `main-form`, `custom-fields`, `product-variants-table`, `generate-variants`, `option-groups`, `facet-values`, `channels`, `assets` |
| Manage product variants | `option-groups`, `product-variants` |
| Product variant detail | `enabled`, `options`, `main-form`, `custom-fields`, `price-and-tax`, `stock`, `facet-values`, `parent-product`, `assets` |
| Collection detail | `privacy`, `main-form`, `custom-fields`, `filters`, `assets`, `contents` |
| Facet detail | `privacy`, `main-form`, `custom-fields`, `facet-values` |
| Facet value detail | `facet-info`, `main-form`, `custom-fields` |
| Option group detail | `main-form`, `custom-fields`, `product-options`, `products`, `channels` |
| Customer detail | `main-form`, `custom-fields`, `addresses`, `orders`, `history`, `status`, `groups` |
| Customer group detail | `main-form`, `custom-fields`, `customers` |
| Order detail | `order-table`, `tax-summary`, `custom-fields`, `payment-details`, `order-history`, `state`, `customer`, `fulfillment-details` |
| Draft order detail | `draft-order-status`, `order-table`, `order-custom-fields`, `customer`, `shipping-address`, `billing-address` |
| Order modification | `order-lines`, `add-surcharge`, `modification-summary`, `customer`, `addresses` |
| Asset detail | `asset-preview`, `custom-fields`, `asset-name`, `asset-properties`, `asset-size`, `asset-tags` |
| Promotion detail | `enabled`, `main-form`, `custom-fields`, `conditions`, `actions` |
| Channel detail | `main-form`, `channel-defaults`, `custom-fields` |
| Administrator detail | `main-form`, `custom-fields`, `roles` |
| Role detail | `main-form`, `channels` |
| Zone detail | `main-form`, `custom-fields`, `countries` |
| Shipping method detail | `main-form`, `custom-fields`, `conditions`, `calculator` |
| Payment method detail | `enabled`, `main-form`, `custom-fields`, `payment-eligibility-checker`, `payment-handler` |
| Profile | `main-form`, `auth-methods`, `custom-fields` |

`dataTables[].blockId` → the table block. `pageBlocks[].location.position.blockId` → the block
to go before/after/replace.

## Action bar item IDs (for `actionBarItems[].position.itemId`, ≥ 3.6)

`create-button` (list pages) · `save-button` (detail pages) · `rebuild-index-button` (product
list) · `create-draft-button` (order list) · `add-payment-button`, `fulfill-order-button`
(order detail) · `rotate-button` (API key detail) · `delete-button`, `complete-draft-button`
(draft order) · `cancel-modification-button` (order modification) · `date-range-picker`,
`edit-layout-button` (Insights) · `auto-refresh-button` (job queue) · `test-shipping-button`
(shipping methods)

## Toolbar item IDs (≥ 3.6)

`dev-mode-indicator`, `alerts`

## Navigation

Sections (usable as `navMenuItem.sectionId`): `catalog`, `sales`, `customers`, `marketing`,
`settings`, `system`. (`insights` is a top-level item, **not** a section.)

Common item IDs: `products`, `product-variants`, `option-groups`, `facets`, `collections`,
`assets`, `orders`, `customers`, `customer-groups`, `promotions`, `sellers`, `channels`,
`stock-locations`, `administrators`, `roles`, `shipping-methods`, `payment-methods`,
`tax-categories`, `tax-rates`, `countries`, `zones`, `global-settings`, `job-queue`,
`scheduled-tasks`, `settings-store`, `api-keys`.
