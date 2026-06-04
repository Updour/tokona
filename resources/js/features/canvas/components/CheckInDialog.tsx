import { useState } from 'react';
import { router } from '@inertiajs/react';
import { MapPin, Loader2, AlertCircle, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CheckInDialogProps {
    isOpen: boolean;
    onClose: () => void;
    customer: any;
}

export default function CheckInDialog({ isOpen, onClose, customer }: CheckInDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [notes, setNotes] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhoto(e.target.files[0]);
        }
    };

    const handleCheckIn = () => {
        if (!navigator.geolocation) {
            setError('Geolocation tidak didukung oleh browser Anda.');
            return;
        }

        setIsLoading(true);
        setError('');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                router.post('/canvas/check-in', {
                    customer_id: customer.id,
                    latitude,
                    longitude,
                    notes,
                    photo: photo
                }, {
                    onSuccess: () => {
                        setIsLoading(false);
                        setNotes('');
                        setPhoto(null);
                        onClose();
                    },
                    onError: (errors: any) => {
                        setIsLoading(false);
                        setError(errors.message || 'Gagal melakukan check-in.');
                    }
                });
            },
            (error) => {
                setIsLoading(false);
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        setError('Izin akses lokasi ditolak. Mohon aktifkan GPS/Lokasi.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setError('Informasi lokasi tidak tersedia.');
                        break;
                    case error.TIMEOUT:
                        setError('Permintaan lokasi terlalu lama (timeout).');
                        break;
                    default:
                        setError('Terjadi kesalahan yang tidak diketahui.');
                        break;
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    if (!customer) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[90vw] max-w-md rounded-2xl p-0 overflow-hidden">
                <DialogHeader className="p-5 pb-0">
                    <DialogTitle className="text-xl font-black text-slate-800">Mulai Kunjungan</DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 mt-1">
                        Anda akan check-in ke <strong className="text-slate-700">{customer.name}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="p-5 space-y-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-xl text-xs flex gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <p className="font-medium leading-relaxed">
                            Aplikasi akan meminta izin (permission) akses lokasi Anda. Koordinat GPS akan direkam secara otomatis saat menekan tombol Check-In.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs flex gap-2 items-center">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p className="font-bold">{error}</p>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-slate-700 mb-1.5 block">Catatan Kunjungan (Opsional)</label>
                        <Textarea 
                            placeholder="Contoh: Bertemu Bpk Budi, stok rak depan habis..."
                            className="text-xs h-20 bg-slate-50 border-slate-200 resize-none focus:bg-white"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                            <Camera className="h-4 w-4" /> Foto Bukti Kunjungan (Opsional)
                        </label>
                        <div className="flex items-center gap-3">
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="text-xs border-slate-200 relative overflow-hidden flex-1"
                            >
                                {photo ? photo.name : 'Ambil / Unggah Foto'}
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    capture="environment" 
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handlePhotoChange}
                                />
                            </Button>
                            {photo && (
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    className="text-xs text-rose-500 hover:text-rose-600 px-2"
                                    onClick={() => setPhoto(null)}
                                >
                                    Hapus
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-5 pt-0 grid grid-cols-2 gap-3 sm:space-x-0">
                    <Button 
                        variant="outline" 
                        onClick={onClose} 
                        disabled={isLoading}
                        className="w-full text-xs font-black h-11 border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100"
                    >
                        Batal
                    </Button>
                    <Button 
                        onClick={handleCheckIn} 
                        disabled={isLoading}
                        className="w-full text-xs font-black h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                    >
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Merekam...</>
                        ) : (
                            'Check In Sekarang'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
