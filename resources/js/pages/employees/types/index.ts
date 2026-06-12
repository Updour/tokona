// @/features/users/types/index.ts

export interface Role {
    id: string;
    name: string;
    tenant_id: string | null;
    description?: string;
}

export interface Employee {
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
    nip?: string | null;
    position?: string | null;
    department?: string | null;
    join_date?: string | null;
    employment_status?: string | null;
    basic_salary?: number | string;
    employee_salary?: {
        basic_salary: number | string;
    } | null;
    last_login_at?: string | null;
    created_at: string;
}

export interface EmployeeFilters {
    search?: string;
    status?: string;
}
