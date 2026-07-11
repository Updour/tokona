import { Link, usePage } from '@inertiajs/react';
import { Bell, AlertTriangle, Info, Clock } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface Alert {
    id: string;
    type: 'payable' | 'receivable' | 'low_stock';
    title: string;
    message: string;
    action_url: string;
    is_urgent: boolean;
    created_at: string;
    time_text: string;
}

export function NotificationBell() {
    const { alerts } = usePage<any>().props;
    const alertList: Alert[] = alerts || [];
    const unreadCount = alertList.length;

    const getIcon = (type: string, isUrgent: boolean) => {
        if (isUrgent) return <AlertTriangle className="h-5 w-5 text-red-500" />;
        if (type === 'payable' || type === 'receivable') return <Clock className="h-5 w-5 text-amber-500" />;
        if (type === 'low_stock') return <Info className="h-5 w-5 text-blue-500" />;
        return <Bell className="h-5 w-5 text-slate-500" />;
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group h-9 w-9 cursor-pointer rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    <Bell className="h-5 w-5 opacity-80 group-hover:opacity-100 text-slate-600 dark:text-slate-300" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[340px] p-0 shadow-xl border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-semibold text-sm">Notifikasi</h3>
                    {unreadCount > 0 && (
                        <Badge variant="secondary" className="text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                            {unreadCount} Peringatan
                        </Badge>
                    )}
                </div>
                <div className="h-[400px] overflow-y-auto">
                    {alertList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                            <Bell className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                            <p className="text-sm text-slate-500">Belum ada peringatan darurat saat ini.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {alertList.map((alert) => (
                                <Link
                                    key={alert.id}
                                    href={alert.action_url}
                                    className={`flex items-start gap-3 p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${alert.is_urgent ? 'bg-red-50/30 dark:bg-red-950/10' : ''}`}
                                >
                                    <div className="shrink-0 mt-0.5">
                                        {getIcon(alert.type, alert.is_urgent)}
                                    </div>
                                    <div className="flex flex-col gap-1 w-full min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`text-sm font-semibold truncate ${alert.is_urgent ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                                {alert.title}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                            {alert.message}
                                        </p>
                                        <span className={`text-[10px] font-medium mt-1 ${alert.is_urgent ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                            {alert.time_text}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
                {alertList.length > 0 && (
                    <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-900/50">
                        <span className="text-[10px] text-slate-400 italic">Segera proses tagihan yang jatuh tempo.</span>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
