# Inventory Leveling & Procurement Intelligence Agent

A client-facing demo for **Upcore Technologies**. It proves the *agent logic* for inventory
leveling and procurement planning on a realistic mock dataset — no real ERP connection, no
backend, no database.

## What it does

Given a set of open sales orders, their bills of material, current stock, and open purchase
orders, the agent:

1. **Explodes every order through its BOM** into a consolidated gross requirement per component,
   keeping a per-order trace.
2. **Nets demand against supply** — `net = gross − on-hand − incoming PO` — and classifies each SKU
   **Critical / Low / Optimal / Overstocked**.
3. **Computes the minimum stock level** each component must hold to keep production running
   (`min = gross + safety stock − incoming PO`) — the client's core question.
4. **Recommends what to buy and by when** — order quantity to restore the minimum, and the last
   safe PO date (`required ship date − supplier lead time`), prioritised.
5. **Quantifies the money** — working capital trapped in overstock, annual holding cost that frees
   up, and the order revenue exposed by shortages.

The headline insight built into the data: a few cheap components (an M8 bolt, a ball bearing) are
shared across multiple BOMs, so their demand **compounds** and quietly threatens the earliest
order's ship date. The agent surfaces exactly that.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm test         # reconciliation tests — proves the math ties out exactly
npm run build    # type-check + production build into dist/
```

No environment variables, no secrets. Requires Node 18+.

## How it's built

- **Vite + React + TypeScript**, **Tailwind CSS** for styling. Dark-navy, cyan-accent, Poppins.
- All mock data lives in typed files under [`src/data`](src/data) (`skus`, `orders`, `boms`).
- All leveling logic lives in pure, unit-tested functions under [`src/lib`](src/lib) —
  `explodeBOM`, `netRequirements`, `minimumStockLevel`, `procurementSchedule`, `alerts`,
  `costImpact`. The dashboard is a thin view over these.
- A fixed planning date (`TODAY` in [`src/data/index.ts`](src/data/index.ts)) keeps the demo and
  the tests deterministic.

The tests in [`src/lib/__tests__`](src/lib/__tests__) assert the numbers reconcile — gross equals
the sum of its per-order contributions, `belowMinBy = net + safety stock` for every SKU, the four
status buckets partition all 20 SKUs, recommended order quantities restore stock exactly to the
minimum, and the cost figures match an independent recomputation.

## Deploying a live URL

This is a standard Vite SPA. To put it online as a **separate** Vercel project (the main Upcore
site is untouched):

1. Import this repo in Vercel as a new project.
2. Set **Root Directory** to `inventory-agent`.
3. Framework preset **Vite** (build `npm run build`, output `dist`). The included `vercel.json`
   adds the SPA rewrite.

Or from this folder: `npx vercel --prod`.

## A note for the client — D365 is the deployment step

> This demo runs the full leveling and procurement logic on mock data so we can see the agent
> *think* end-to-end today. In your environment, the only thing that changes is the data source:
> instead of the files in `src/data`, the agent reads your live **Microsoft Dynamics 365** —
> Sales Orders, Bills of Material, Inventory on-hand, and open Purchase Orders — through the
> standard D365 API. Every calculation you see here, the minimum-stock math, the reorder dates,
> the cost impact, stays exactly as it is. Connecting D365 is the deployment step, not a rebuild.
