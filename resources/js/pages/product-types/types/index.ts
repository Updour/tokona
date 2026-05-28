export interface ProductType {
    id: string;
    tenant_id: string;
    name: string;
    description: string | null;
    products_count?: number;
    created_at: string;
    updated_at: string;
}
