import { Link } from '@inertiajs/react';
import { Clock, ChevronRight } from 'lucide-react';

export function CanvasOngoingVisit({ ongoingVisit }: { ongoingVisit: any }) {
    if (!ongoingVisit) {
return null;
}

    return (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-sm flex items-start justify-between gap-3 animate-pulse">
            <div>
                <p className="text-[10px] font-black uppercase text-amber-600 mb-0.5">Sedang Berlangsung</p>
                <h3 className="font-bold text-slate-800 text-sm">{ongoingVisit.customer?.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" /> Masuk sejak {new Date(ongoingVisit.visited_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
            <Link 
                href={`/canvas/pos?visit_id=${ongoingVisit.id}`}
                className="bg-amber-500 text-white text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0"
            >
                Buat Order <ChevronRight className="h-3.5 w-3.5" />
            </Link>
        </div>
    );
}
