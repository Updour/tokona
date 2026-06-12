export interface Permission {
    id: string;
    key: string;
    name: string;
    module: string;
}

export interface Role {
    id: string;
    name: string;
    description: string | null;
    permissions: Permission[];
}
