export interface Attendance {
    id: string;
    tenant_id: string;
    branch_id: string;
    user_id: string;
    date: string;
    check_in_time: string | null;
    check_out_time: string | null;
    status: 'present' | 'late' | 'sick' | 'leave' | 'absent';
    notes: string | null;
    lat_in: number | null;
    lng_in: number | null;
    lat_out: number | null;
    lng_out: number | null;
    photo_in: string | null;
    photo_out: string | null;
    created_at: string;
    updated_at: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    branch?: {
        id: string;
        name: string;
        code: string;
    };
}

export interface AttendanceStats {
    total_present: number;
    total_late: number;
    total_sick: number;
    total_leave: number;
    total_absent: number;
}

export interface AttendanceFilters {
    search?: string;
    branch_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
}
