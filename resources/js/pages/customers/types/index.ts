export interface Customer {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    tier: 'regular' | 'member' | 'wholesale' | 'distributor' | string;
    is_active: boolean;
    points?: number;
    debt_balance?: number | string;
    max_debt_limit?: number | string;
    last_transaction_at?: string | null;
    created_at?: string;
    notes?: string | null;
}
