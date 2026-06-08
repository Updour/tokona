export interface Branch {
    id: string;
    tenant_id: string;
    name: string;
    code: string;
    address: string | null;
    phone: string | null;
    latitude: string | null;
    longitude: string | null;
    is_main: boolean;
    created_at: string;
    updated_at: string;
    tenant?: any; // To represent the tenant relationship if loaded
    pos_settings?: any;
}

export interface BranchFilters {
    search?: string;
}
