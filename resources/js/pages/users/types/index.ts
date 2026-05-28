// @/features/users/types/index.ts

export interface Role {
    id: string;
    name: string;
    tenant_id: string | null;
    description?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    status: 'active' | 'inactive';
    phone: string | null;
    avatar: string | null;
    tenant_id: string | null;
    branch_id: string | null;
    tenant?: {
        id: string;
        name: string;
    } | null;
    branch?: {
        id: string;
        name: string;
    } | null;
    roles?: Role[];
    created_at: string;
}

export interface UserFilters {
    search?: string;
    status?: string;
}
