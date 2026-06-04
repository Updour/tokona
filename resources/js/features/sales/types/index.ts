export interface SalesPerson {
    id: string;
    tenant_id: string;
    branch_id: string;
    name: string;
    phone: string | null;
    email: string | null;
    commission_type: 'percent' | 'fixed';
    commission_value: number;
    is_active: boolean;
    visits_count?: number;
    orders_count?: number;
    branch?: {
        id: string;
        name: string;
    };
}

export interface SalesVisit {
    id: string;
    tenant_id: string;
    sales_id: string;
    branch_id: string;
    customer_id: string | null;
    visited_at: string;
    latitude: number | null;
    longitude: number | null;
    address_text: string | null;
    photo_url: string | null;
    notes: string | null;
    status: 'visited' | 'ordered' | 'rejected';
    sales_person?: SalesPerson;
    customer?: {
        id: string;
        name: string;
    };
}

export interface CustomerLocation {
    id: string;
    name: string;
    address: string | null;
    latitude: number;
    longitude: number;
}
