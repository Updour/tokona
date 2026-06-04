import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaginationProps {
    data: {
        from: number | null;
        to: number | null;
        total: number;
        per_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        links?: Array<{ url: string | null; label: string; active: boolean }>;
    };
    itemName?: string;
    filters?: Record<string, any>;
    baseUrl?: string; // Optional, can be derived from the current URL
}

export function DataTablePagination({ data, itemName = 'data', filters = {} }: PaginationProps) {
    const handlePerPageChange = (val: string) => {
        const url = new URL(window.location.href);

        // Preserve all existing query parameters (search, sort, etc.)
        const currentParams = Object.fromEntries(url.searchParams.entries());

        // Update per_page and reset to page 1
        const newParams: Record<string, any> = {
            ...currentParams,
            per_page: val,
            page: '1'
        };

        // Remove undefined/empty values if any
        Object.keys(newParams).forEach(key => {
            if (newParams[key] === undefined || newParams[key] === null) {
                delete newParams[key];
            }
        });

        router.get(window.location.pathname, newParams, { preserveState: true, replace: true });
    };

    const handleNavigate = (url: string) => {
        // We use preserveState: true to avoid losing UI state (like modals)
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 gap-4 text-xs text-muted-foreground w-full bg-slate-50/80 border-t border-slate-200 rounded-b-md">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-500">Tampilkan</span>
                    <Select
                        value={data?.per_page?.toString() || '15'}
                        onValueChange={handlePerPageChange}
                    >
                        <SelectTrigger className="h-7 w-[70px] text-xs font-bold border-slate-200 bg-white">
                            <SelectValue placeholder="15" />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 15, 20, 25, 50, 100, 200, 500].map((size) => (
                                <SelectItem key={size} value={size.toString()} className="text-xs">
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <span className="hidden sm:inline-block border-l pl-4 border-slate-200">
                    {data?.from && data?.to
                        ? `Menampilkan ${data.from}–${data.to} dari ${data.total.toLocaleString('id-ID')} ${itemName}`
                        : `${data?.total || 0} ${itemName}`}
                </span>
            </div>

            <div className="flex gap-1.5 items-center flex-wrap">
                {/* Previous Button */}
                <Button
                    variant="outline" size="sm"
                    disabled={!data?.prev_page_url}
                    onClick={() => data?.prev_page_url && handleNavigate(data.prev_page_url)}
                    className="h-7 px-3 text-xs bg-white"
                >
                    Sebelumnya
                </Button>

                {/* Numbered Links (If provided by Laravel paginator) */}
                {data?.links && data.links.length > 3 && (
                    <div className="hidden md:flex gap-1">
                        {data.links.slice(1, -1).map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && handleNavigate(link.url)}
                                className={`h-7 w-7 p-0 text-xs font-semibold ${link.active ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

                {/* Next Button */}
                <Button
                    variant="outline" size="sm"
                    disabled={!data?.next_page_url}
                    onClick={() => data?.next_page_url && handleNavigate(data.next_page_url)}
                    className="h-7 px-3 text-xs bg-white"
                >
                    Berikutnya
                </Button>
            </div>
        </div>
    );
}
