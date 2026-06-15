# User Manual — Inventory Leveling & Procurement Intelligence Agent

A practical guide to using the agent. It reads your open orders, bills of material, stock, and
purchase orders, then tells you **what's short, what to buy, and exactly when to order it** so
production never stops and capital isn't tied up early.

> In this demo the data comes from a CSV. In production it reads live from **Microsoft Dynamics
> 365** — every screen and number stays the same.

---

## 1. Getting started

- **Live demo:** open the URL you were sent — nothing to install.
- **Run locally:**
  ```bash
  npm install
  npm run dev      # http://localhost:5173
  ```

There is no login. All numbers are computed instantly from the loaded data.

---

## 2. Getting around

The app is a dashboard with a **left menu** (six views) and a **top bar** showing the current
view, the data source, and the planning date.

| Menu item | What it answers |
|---|---|
| **Overview** | What needs my attention right now? |
| **Inventory Health** | What's the status of every component? |
| **Reorder** | What do I buy, and by when? |
| **Procurement** | When does each order have to go in? |
| **Leveling** | How do I schedule a production run so I don't tie up cash? |
| **Cost Impact** | What is all this worth in money? |

On a phone or tablet the menu becomes a row of tabs across the top.

---

## 3. The views

### Overview
Your home screen. At a glance:
- **Alert bar** — how many components are below the line that keeps production running.
- **KPI cards** — Critical components, items Below minimum, Revenue at risk, Capital in overstock.
- **Health tiles** — counts of Critical / Low / Optimal / Overstocked.
- **Top priorities** — the most urgent purchase orders, soonest order-by first.
- **Capital leveling** — a one-click jump to the planner, showing the cash it can defer.

Every card is clickable and jumps to the relevant view.

### Inventory Health
Every component, classified.
- **Status tiles** — click one to **filter** the table to that status. Click again to clear.
- **Search box** — filter by SKU, name, or category.
- **Sortable table** — click any column header to sort (click again to reverse).
- **BOM ↗** — opens a drill-down showing which orders drive that component's demand and the full
  netting math.

### Reorder
The shopping list. For each short component: recommended **order quantity**, **estimated cost**,
**supplier lead time**, the **order-by date**, and a **priority**. Rows already past their order-by
date are flagged overdue.

### Procurement
The open-order schedule as a **Gantt**. Each bar runs from the day a component must be ordered to
the day it's needed; bars crossing the **TODAY** line are overdue. See *Reading the Gantt* below.

### Leveling — plan a production run
The core planning tool. See §4 for the full workflow.

### Cost Impact
The money view: **Revenue at risk** (orders exposed to shortages), **Capital in overstock** (cash
sitting idle), and **Holding cost freed** per year.

---

## 4. Plan a production run (Leveling)

This is where you schedule the purchases for one build so parts arrive **just-in-time**.

1. **Set the order quantity** — how many finished units you're building.
2. **Set the production / required-by date** — when everything must be on hand. The runway (days
   from today) shows underneath.
3. **Load the BOM** — use the built-in sample, or **Upload BOM (CSV)** with your own parts
   (format below).
4. **Read the result** — the agent back-schedules every part: `order-by = build date − lead time`.

What you get:

- **"What leveling is worth"** — a side-by-side comparison:
  - *Order everything today* — the full cash committed now, with part of it sitting idle.
  - *Leveled schedule* — only what must be committed now, with the rest **deferred** until needed.
  - The middle figure is the **working capital freed up front**.
- **Stat cards** — Order value, parts that **must be pre-stocked** (lead time longer than the
  runway), the **critical path** (longest lead), and **carrying cost avoided**.
- **The Gantt** — every purchase staggered by lead time, all converging on the build date.
- **Component table** — per part: lead time, required qty, on hand, shortage, order-by date, and the
  action (Covered / Order on schedule / Pre-stock).

Change the date or quantity and everything re-levels instantly.

### Upload your own BOM (CSV)
Click **↓ Template** for a starter file. The columns are:

| Column | Meaning |
|---|---|
| `name` | Component name |
| `qtyPerUnit` | How many are used in one finished unit |
| `leadTimeDays` | Supplier lead time, in days |
| `onHand` | Current stock |
| `unitCost` | Cost per unit |

Save as `.csv`, click **⤴ Upload BOM (CSV)**, and the planner re-runs on your parts. Invalid rows are
skipped and reported; the rest still load.

---

## 5. Reading the Gantt

| Element | Meaning |
|---|---|
| **Bar length** | The supplier lead time |
| **Bar start** | The latest date you can place the PO (order-by) |
| **Diamond (◆)** | When the part arrives / is needed |
| **TODAY line** | The planning date |
| **Build marker** | The production / required-by date (Leveling view) |
| 🔴 **Red bar / LATE** | Order is overdue — act now, or pre-stock it |
| 🟡 **Amber bar** | Order soon |
| 🔵 **Blue bar** | Comfortable runway |

Long-lead parts sit on the left (order first); short-lead parts on the right (order last).

---

## 6. The numbers, defined

**Inventory Health**

| Term | Definition |
|---|---|
| **On hand** | Current stock |
| **Min level** | Stock you must hold to stay safe = demand + safety stock − incoming PO |
| **Net** | Cover after stock + open POs − demand. **Negative = shortfall** |
| **Lead (d)** | Supplier lead time in days |

**Status**

| Status | Meaning |
|---|---|
| 🔴 **Critical** | On hand + incoming PO can't cover demand → production stops |
| 🟡 **Low** | Covers demand but eats into the safety buffer |
| 🟢 **Optimal** | Covered, with buffer intact |
| 🔵 **Overstocked** | Far more on hand than needed — idle capital |

**Reorder priority**

| Priority | Meaning |
|---|---|
| **Critical** | True shortage and the order-by date has arrived/passed |
| **Normal** | Shortage, but lead-time runway remains |
| **Monitor** | Only the safety buffer is eroding |

**Leveling**

| Term | Definition |
|---|---|
| **Order value** | Total cost of all shortages for the run |
| **Commit now** | Spend that can't wait (order-by date reached or part must be pre-stocked) |
| **Capital deferred** | Spend the schedule pushes to later — *not* tied up today |
| **Carrying cost avoided** | Yearly holding cost saved by not ordering early (25%/yr basis) |
| **Critical path** | The longest single lead time — your binding constraint |
| **Must pre-stock** | Parts whose lead time is longer than the runway — order/forecast immediately |

---

## 7. Connecting to Dynamics 365

This demo runs the full logic on mock data so the agent can be seen end-to-end today. In production
the only thing that changes is the data source: instead of a CSV, the agent reads your live **D365**
— Sales Orders, Bills of Material, Inventory on-hand, and open Purchase Orders — through the standard
API. Every calculation here stays exactly the same. Connecting D365 is the deployment step, not a
rebuild.

---

*Upcore Technologies · Inventory Leveling & Procurement Intelligence Agent*
