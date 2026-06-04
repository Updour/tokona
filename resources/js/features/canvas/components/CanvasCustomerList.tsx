import { MapPin, CheckCircle2, Clock, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function CanvasCustomerList({ customers, todayVisits, onCheckInClick }: any) {
    return (
        <div>
            <h2 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-1.5">
                <Navigation className="h-4 w-4 text-primary" /> Rute Toko Tersedia
            </h2>
            
            <div className="grid gap-3">
                {customers?.map((customer: any) => {
                    const visitData = todayVisits?.find((v: any) => v.customer_id === customer.id);
                    
                    return (
                        <Card key={customer.id} className={`border-0 shadow-sm overflow-hidden ${visitData ? 'opacity-70 bg-slate-100' : 'bg-white'}`}>
                            <CardContent className="p-4 flex items-center justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{customer.name}</h3>
                                        {visitData?.status === 'ordered' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                        {visitData?.status === 'visit' && <Clock className="h-4 w-4 text-amber-500" />}
                                    </div>
                                    <p className="text-xs text-slate-500 flex items-start gap-1 line-clamp-2">
                                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {customer.address}
                                    </p>
                                </div>

                                {!visitData ? (
                                    <button 
                                        onClick={() => onCheckInClick(customer)}
                                        className="bg-primary/10 text-primary hover:bg-primary/20 text-xs font-black px-4 py-2 rounded-xl border border-primary/20 transition-colors shrink-0"
                                    >
                                        Check In
                                    </button>
                                ) : (
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-md ${
                                        visitData.status === 'ordered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {visitData.status === 'ordered' ? 'Selesai' : 'Sedang Visit'}
                                    </span>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
