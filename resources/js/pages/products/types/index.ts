export interface ProductCategory {
    id: string;
    name: string;
}

export interface ProductType {
    id: string;
    name: string;
}

export interface ProductBranch {
    id: string;
    tenant_id?: string;
    name: string;
    code: string | null;
}

export interface ProductTenant {
    id: string;
    name: string;
}

export interface ProductImage {
    id: string;
    product_id: string;
    url: string;
    path: string | null;
    is_primary: boolean;
    sort_order: number;
}

export interface Product {
    id: string;
    tenant_id: string;
    branch_id: string;
    category_id: string | null;
    type_id: string | null;
    supplier_id: string | null;
    name: string;
    sku: string | null;
    barcode: string | null;
    description: string | null;
    base_cost: number;
    sell_price: number;
    min_sell_price: number | null;
    track_stock: boolean;
    allow_negative_stock: boolean;
    source: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Relasi eager-loaded
    category: ProductCategory | null;
    type: ProductType | null;
    branch: ProductBranch | null;
    images: ProductImage[];
    // Computed dari stock_movements (subquery)
    current_stock: number;
}
