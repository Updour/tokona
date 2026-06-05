import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { CanvasCustomerList } from '@/features/canvas/components/CanvasCustomerList';
import { CanvasMobileHeader } from '@/features/canvas/components/CanvasMobileHeader';
import { CanvasOngoingVisit } from '@/features/canvas/components/CanvasOngoingVisit';
import CheckInDialog from '@/features/canvas/components/CheckInDialog';

export default function CanvasIndex({ sales, customers, todayVisits }: any) {
    const [isCheckInOpen, setIsCheckInOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    const handleCheckInClick = (customer: any) => {
        setSelectedCustomer(customer);
        setIsCheckInOpen(true);
    };

    const ongoingVisit = todayVisits?.find((v: any) => v.status === 'visit');

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Head title="Canvas Mobile Sales" />

            <CanvasMobileHeader sales={sales} todayVisitsCount={todayVisits?.length || 0} />

            <div className="p-4 space-y-5 max-w-lg mx-auto">
                <CanvasOngoingVisit ongoingVisit={ongoingVisit} />
                <CanvasCustomerList 
                    customers={customers} 
                    todayVisits={todayVisits} 
                    onCheckInClick={handleCheckInClick} 
                />
            </div>

            <CheckInDialog 
                isOpen={isCheckInOpen} 
                onClose={() => setIsCheckInOpen(false)} 
                customer={selectedCustomer} 
            />
        </div>
    );
}
