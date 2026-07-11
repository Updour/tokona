export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';

export interface PageProps extends Record<string, unknown> {
    auth: Auth;
    name: string;
    sidebarOpen: boolean;
}
