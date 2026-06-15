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
6. **Levels a production run by lead time** — given one finished good's BOM (quantity + lead time
   per component) and a target build date, it **back-schedules every purchase order** so parts
   arrive just-in-time (`order-by = build date − supplier lead time`). Long-lead items are ordered
   first, short-lead last — so capital isn't tied up early. Components whose lead time exceeds the
   runway are flagged as **forecast / pre-stock**. Rendered as a **Gantt** with a configurable
   build date and order quantity, and you can **upload your own BOM as CSV**.

The headline insight built into the multi-order data: a few cheap components (an M8 bolt, a ball
bearing) are shared across multiple BOMs, so their demand **compounds** and quietly threatens the
earliest order's ship date. The leveling planner adds the time dimension the client asked for —
*when* to place each order so inventory is leveled and working capital is deferred, not lost.

### The two Gantts
- **Procurement Schedule** — every open-order shortage on a timeline, each bar running from its
  order-by date to the date it's first needed. Bars crossing the "today" line are overdue.
- **Inventory Leveling** — plan a single future production run: set the build date + quantity (or
  upload a BOM CSV with `name, qtyPerUnit, leadTimeDays, onHand, unitCost`), and watch the schedule
  re-stagger live. Bars carry **arrival diamonds** that converge on the build-date marker, so you
  can see every part landing just-in-time. A headline **"order everything today vs. leveled
  schedule"** comparison quantifies the working capital freed up front; supporting stats cover order
  value, parts that must be pre-stocked, the critical-path lead time, and carrying cost avoided.

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
- An **app-shell layout**: a left sidebar menu switches between views — **Overview** (KPIs, health
  tiles, top priorities, capital-leveling teaser), **Inventory Health**, **Reorder**, **Procurement**,
  **Leveling**, and **Cost Impact** — with a sticky top bar. Not a single long scroll.
- All mock data lives in typed files under [`src/data`](src/data) (`skus`, `orders`, `boms`, and the
  `sampleBom` production run).
- All leveling logic lives in pure, unit-tested functions under [`src/lib`](src/lib) —
  `explodeBOM`, `netRequirements`, `minimumStockLevel`, `procurementSchedule`, `alerts`,
  `costImpact`, plus `levelProductionRun` / `scheduleToGanttRows` (the lead-time Gantt) and
  `parseBomCsv` (the upload). The dashboard is a thin view over these.
- A fixed planning date (`TODAY` in [`src/data/constants.ts`](src/data/constants.ts)) keeps the demo
  and the tests deterministic.

The 28 tests in [`src/lib/__tests__`](src/lib/__tests__) assert the numbers reconcile — gross equals
the sum of its per-order contributions, `belowMinBy = net + safety stock` for every SKU, the four
status buckets partition all 20 SKUs, recommended order quantities restore stock exactly to the
minimum, the cost figures match an independent recomputation, and for the leveling planner
`order-by = build date − lead time`, feasibility flips at the runway boundary, and a BOM CSV
round-trips without loss.

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
