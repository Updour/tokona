import { usePage } from '@inertiajs/react';

export function usePermission() {
    const { props } = usePage<any>();
    const user = props.auth?.user;
    const permissions: string[] = user?.permissions || [];
    const isSuperAdmin = !!user?.is_super_admin;

    const hasPermission = (key: string) => {
        if (isSuperAdmin) {
return true;
}

        return permissions.includes(key);
    };

    return {
        hasPermission,
        isSuperAdmin,
        permissions,
        user,
    };
}
