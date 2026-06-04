export interface Shift {
    id: string;
    tenant_id: string;
    branch_id: string;
    user_id: string;
    opened_at: string;
    closed_at: string | null;
    opening_balance: number;
    closing_balance: number | null;
    expected_balance: number | null;
    notes: string | null;
    status: 'open' | 'closed';
    transactions_count?: number;
    user?: { id: string; name: string };
    branch?: { id: string; name: string };
}

export interface ShiftSummary {
    shift: Shift;
    total_sales: number;
    cash_sales: number;
    non_cash_sales: number;
    tx_count: number;
    expected_balance: number;
    difference: number | null;
}
