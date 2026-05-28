# Tokona Dashboard Clean Architecture

This project uses a Clean Architecture approach specifically designed to support modular features like **Toko (Store)**, **Kasir (Cashier)**, and **Akuntan (Accountant)**.

## Tech Stack
- **Backend**: Laravel 11 (Controllers, Services, Form Requests, Eloquent UUID)
- **Frontend**: React 19, Inertia.js, Tailwind CSS v4
- **State Management**: Zustand
- **UI Components**: Shadcn UI & Radix UI
- **Data Tables**: `@tanstack/react-table`

---

## Roadmap & Phases

We are developing this SaaS POS + ERP for UMKM in phases.

### Phase 1 (Current Focus)
1. **Dashboard**: Overview, charts, top products, recent activities.
2. **POS (Kasir)**: Direct transactions, pending orders, refunds.
3. **Produk**: Master products, categories, stock & inventory, variations, pricing.
4. **Transaksi**: Transaction lists and history.
5. **Pelanggan**: Customer lists, loyalty, history (Currently mapped to the `/users` CRUD as a starting point).

### Phase 2 & 3 (Future)
- **Keuangan**: Income, expenses, P&L, cash flow, debts.
- **Pembelian**: Suppliers, POs, incoming goods, returns.
- **Laporan**: Comprehensive reporting (sales, products, stocks, finance).
- **Marketing**: Promos, vouchers, campaigns, notifications.
- **Karyawan**: Roles, permissions, shifts.
- **Toko (Multi-Store)**: Branches, warehouse management.
- **Integrasi**: Shopee, Tokopedia, Payment Gateways (Tripay, Midtrans), Hardware integrations.
- **Super Admin**: Tenant monitoring, SaaS subscriptions, billing.

---

## Directory Structure

### 1. Frontend (`resources/js`)

Instead of throwing all components and pages into flat folders, we use a feature-based structure:

```text
resources/js/
├── components/          # Shared, generic UI components (Shadcn buttons, inputs, dialogs, etc.)
├── features/            # Feature-specific components and logic
│   ├── users/           # User feature module
│   │   ├── components/  # Components strictly related to Users (e.g., UserTable, UserFormDialog)
│   │   ├── lib/         # User-specific utility functions
│   │   └── types/       # TypeScript types for User models
│   └── cashier/         # (Future) Cashier feature module
├── pages/               # Inertia page entry points (maps to Laravel routes)
│   ├── users/
│   │   └── Index.tsx    # The main page loaded by Inertia for /users
├── store/               # Zustand global state stores
│   └── useUserStore.ts
├── layouts/             # Dashboard and Auth layouts
└── lib/                 # Global utility functions (e.g., Shadcn `cn`, formatting, export helpers)
```

**Why this structure?**
When the app grows with Cashier and Accountant features, the codebase remains organized. A component specific to the Cashier feature stays in `features/cashier/components/` and doesn't clutter the global `components/` folder.

### 2. Backend (Laravel `app/`)

```text
app/
├── Http/
│   ├── Controllers/     # Entry points for HTTP requests (returns Inertia responses or JSON)
│   │   └── UserController.php
│   ├── Requests/        # Validation logic separated from controllers
│   │   ├── StoreUserRequest.php
│   │   └── UpdateUserRequest.php
├── Models/              # Eloquent models (using UUIDs)
│   └── User.php
```

## State Management with Zustand

We use Zustand for client-side state that doesn't need to persist to the server immediately, or state that spans across multiple components within a page (e.g., managing the state of a Data Table, or a selected user for editing).

**Rule of thumb:**
- If the data needs to be saved to the database -> Use Inertia `useForm` or manual `axios` requests.
- If the data is purely UI state (e.g., "is the edit modal open?", "which rows are selected for export?") -> Use Zustand.
