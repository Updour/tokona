import { router, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { useAttendanceStore } from '../stores/useAttendanceStore';

export function useAttendance() {
    const store = useAttendanceStore();

    const formIn = useForm({
        latitude: null as number | null,
        longitude: null as number | null,
        notes: '',
        type: 'present',
        branch_id: '',
    });

    const formOut = useForm({
        latitude: null as number | null,
        longitude: null as number | null,
    });

    const getGPSLocation = (): Promise<{ latitude: number; longitude: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation tidak didukung oleh browser Anda.'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    let msg = 'Gagal mendapatkan lokasi GPS.';
                    if (error.code === error.PERMISSION_DENIED) {
                        msg = 'Akses lokasi ditolak. Harap izinkan akses GPS untuk melakukan absensi.';
                    }
                    reject(new Error(msg));
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    };

    const handleClockIn = async () => {
        formIn.clearErrors();
        try {
            toast.loading('Mendapatkan koordinat GPS...', { id: 'gps-load' });
            const loc = await getGPSLocation();
            toast.dismiss('gps-load');

            formIn.setData((prev) => ({
                ...prev,
                latitude: loc.latitude,
                longitude: loc.longitude,
            }));

            router.post('/attendances/clock-in', {
                latitude: loc.latitude,
                longitude: loc.longitude,
                notes: formIn.data.notes,
                type: formIn.data.type,
                branch_id: formIn.data.branch_id || undefined,
            }, {
                onSuccess: (page) => {
                    const hasError = page.props.flash?.error;
                    if (!hasError) {
                        store.closeClockIn();
                        formIn.reset();
                    }
                },
                onError: (err) => {
                    // Global handler will catch this if we don't do anything, but let's just close modal on success
                }
            });
        } catch (error: any) {
            toast.dismiss('gps-load');
            toast.error(error.message || 'Gagal mendeteksi lokasi.');
        }
    };

    const handleClockOut = async () => {
        try {
            toast.loading('Mendapatkan koordinat GPS...', { id: 'gps-load' });
            const loc = await getGPSLocation();
            toast.dismiss('gps-load');

            router.post('/attendances/clock-out', {
                latitude: loc.latitude,
                longitude: loc.longitude,
            }, {
                onSuccess: (page) => {
                    const hasError = page.props.flash?.error;
                    if (!hasError) {
                        store.closeClockOut();
                    }
                },
                onError: (err) => {
                }
            });
        } catch (error: any) {
            toast.dismiss('gps-load');
            toast.error(error.message || 'Gagal mendeteksi lokasi.');
        }
    };

    return {
        formIn,
        formOut,
        handleClockIn,
        handleClockOut,
        store,
    };
}
