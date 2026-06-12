export type TenantStatus = 'active' | 'suspended' | 'trial';
export type TenantPlan = 'free' | 'pro' | 'enterprise';

// 1. Tambahkan interface baru untuk TenantLocation
export interface TenantLocation {
    id: string;
    tenant_id: string;
    latitude: string | null;
    longitude: string | null;
    address_text: string | null;
    city: string | null;
    province: string | null;
    maps_link: string | null;
    created_at: string;
    updated_at: string;
}

export interface TenantMedia {
    id: string;
    tenant_id: string;
    type: string;
    file_url: string;
    full_file_url: string; // Mengambil hasil dari append model Laravel
    description: string | null;
}

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    logo: string | null;
    logo_url?: string;
    address: string | null;
    status: TenantStatus;
    plan: TenantPlan;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
    location?: TenantLocation | null; // 2. Daftarkan relasi lokasi di sini
    media?: TenantMedia[]; // 4. Daftarkan relasi media
}

export interface CreateTenantInput {
    name: string;
    slug: string;
    email?: string | null;
    phone?: string | null;
    logo?: string | null;
    address?: string | null;
    status?: TenantStatus;
    plan?: TenantPlan;
    // 3. Tambahkan field lokasi untuk form input jika diperlukan nanti
    latitude?: string | null;
    longitude?: string | null;
    address_text?: string | null;
    city?: string | null;
    province?: string | null;
    maps_link?: string | null;
}

export interface TenantFilters {
    search?: string;
    status?: TenantStatus;
    plan?: TenantPlan;
}
