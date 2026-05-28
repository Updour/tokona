import * as React from 'react';
import { useEffect, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { useBranchStore } from '@/pages/branches/stores/useBranchStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, MapPin, Sparkles } from 'lucide-react';
import { store as branchesStore, update as branchesUpdate } from '@/routes/branches';
import { toast } from 'sonner';

// Import komponen Leaflet & GeoSearch
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

// Fix ikon default Leaflet yang sering hilang di bundling React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Sub-komponen untuk fitur Search Bar di dalam Peta
function SearchField({ onLocationSelected }: { onLocationSelected: (lat: number, lng: number, addressData: any) => void }) {
    const map = useMap();

    useEffect(() => {
        const provider = new OpenStreetMapProvider({
            params: {
                'accept-language': 'id', // Prioritaskan bahasa Indonesia
                addressdetails: 1,       // Minta detail kota/provinsi terpisah
            },
        });

        const searchControl = GeoSearchControl({
            provider: provider,
            style: 'bar',
            showMarker: false,
            showPopup: false,
            autoClose: true,
            retainZoomLevel: false,
            animateZoom: true,
            keepResult: true,
            searchLabel: 'Cari lokasi / nama jalan...',
        });

        map.addControl(searchControl);

        // Event ketika user memilih lokasi dari hasil pencarian ketik
        map.on('geosearch/showlocation', (result: any) => {
            const { x: lng, y: lat, raw } = result.location;
            const address = raw.address || {};

            onLocationSelected(lat, lng, {
                city: address.city || address.town || address.city_district || address.municipality || '',
                province: address.state || '',
                road: raw.display_name || ''
            });
        });

        return () => {
            map.removeControl(searchControl);
        };
    }, [map]);

    return null;
}

// Sub-komponen untuk menangani klik langsung di area Peta
function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export function BranchFormDialog() {
    const { isFormOpen, selectedBranch, closeForm } = useBranchStore();
    const { props } = usePage<any>();
    const { auth } = props;

    // Default koordinat tengah Indonesia (Jakarta jika tidak ada data awal)
    const [mapCenter, setMapCenter] = useState<[number, number]>([-6.2000, 106.8166]);
    const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<any>({
        tenant_id: auth?.user?.tenant_id || '',
        name: '',
        code: '',
        phone: '',
        address: '',
        latitude: '',
        longitude: '',
        is_main: false,
        pos_settings: {
            taxEnabled: true,
            taxRate: 11,
            activeMethods: {
                cash: true,
                transfer: true,
                debt: true
            }
        }
    });

    useEffect(() => {
        if (selectedBranch) {
            const lat = selectedBranch.latitude ? parseFloat(selectedBranch.latitude) : -6.2000;
            const lng = selectedBranch.longitude ? parseFloat(selectedBranch.longitude) : 106.8166;

            setData({
                tenant_id: selectedBranch.tenant_id ?? (auth?.user?.tenant_id || ''),
                name: selectedBranch.name ?? '',
                code: selectedBranch.code ?? '',
                phone: selectedBranch.phone ?? '',
                address: selectedBranch.address ?? '',
                latitude: selectedBranch.latitude ?? '',
                longitude: selectedBranch.longitude ?? '',
                is_main: selectedBranch.is_main ?? false,
                pos_settings: (selectedBranch as any).pos_settings ?? {
                    taxEnabled: true,
                    taxRate: 11,
                    activeMethods: {
                        cash: true,
                        transfer: true,
                        debt: true
                    }
                }
            });

            if (selectedBranch.latitude && selectedBranch.longitude) {
                setMarkerPos([lat, lng]);
                setMapCenter([lat, lng]);
            } else {
                setMarkerPos(null);
            }
        } else {
            reset();
            setMarkerPos(null);
        }
        clearErrors();
    }, [selectedBranch, isFormOpen]);

    const fetchAddressDetails = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=id`);
            const result = await res.json();
            if (result && result.address) {
                setData((prev: any) => ({
                    ...prev,
                    latitude: lat.toString(),
                    longitude: lng.toString(),
                    address: result.display_name || prev.address // Overwrite address if found, or keep existing
                }));
            }
        } catch (error) {
            console.error("Gagal memuat detail alamat otomatis", error);
        }
    };

    // Handler saat peta diklik manual
    const handleMapClick = (lat: number, lng: number) => {
        setMarkerPos([lat, lng]);
        fetchAddressDetails(lat, lng);
    };

    // Handler saat user mengetik di kotak pencarian peta
    const handleLocationSearchSelected = (lat: number, lng: number, addressData: any) => {
        setMarkerPos([lat, lng]);
        setMapCenter([lat, lng]); // Pindahkan fokus tengah peta ke area yang dicari
        setData((prev: any) => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString(),
            address: addressData.road
        }));
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedBranch) {
            put(branchesUpdate(selectedBranch.id).url, { onSuccess: () => closeForm() });
        } else {
            post(branchesStore().url, { onSuccess: () => closeForm() });
        }
    };

    return (
        <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
            <DialogContent className="sm:max-w-[850px] p-6 gap-4 max-h-[90vh] overflow-y-auto">
                <form onSubmit={onSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            {selectedBranch ? 'Ubah Pengaturan Cabang' : 'Daftarkan Cabang Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Tentukan informasi detail cabang beserta lokasinya di peta.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Layout Split: Kiri Form Utama, Kanan Peta Pencari */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">

                        {/* Kolom Kiri: Input Form Data */}
                        <div className="space-y-3.5">
                            {props.tenants && props.tenants.length > 0 && (
                                <div className="grid gap-1.5 pb-1">
                                    <Label htmlFor="b-tenant" className="text-xs font-bold uppercase text-muted-foreground">Pilih Toko / Tenant <span className="text-destructive">*</span></Label>
                                    <Select value={data.tenant_id} onValueChange={(val: any) => setData('tenant_id', val)}>
                                        <SelectTrigger id="b-tenant" className="w-full">
                                            <SelectValue placeholder="Pilih toko/tenant..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {props.tenants.map((t: any) => (
                                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.tenant_id && <span className="text-xs text-destructive">{errors.tenant_id}</span>}
                                </div>
                            )}

                            <div className="grid gap-1.5">
                                <Label htmlFor="b-name" className="text-xs font-bold uppercase text-muted-foreground">Nama Cabang <span className="text-destructive">*</span></Label>
                                <Input id="b-name" value={data.name.toUpperCase()} onChange={(e) => setData('name', e.target.value.toUpperCase())} placeholder="Contoh: Cabang Sudirman" required />
                                {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="b-code" className="text-xs font-bold uppercase text-muted-foreground">Kode Cabang <span className="text-destructive">*</span></Label>
                                    <div className="flex gap-1.5">
                                        <Input id="b-code" className="uppercase font-mono font-bold" value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder="Contoh: CBG01" required />
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                if (!data.name) {
                                                    toast.error('Silakan isi Nama Cabang terlebih dahulu untuk membuat kode!');
                                                    return;
                                                }

                                                // 1. Pastikan nama cabang dalam format UPPERCASE dan bersih dari spasi ujung
                                                const branchNameUpper = data.name.toUpperCase().trim();

                                                // 2. Ambil Nama Tenant/Toko & buat singkatannya (Contoh: TOKONAN Group -> TG)
                                                const tenantObj = props.tenants?.find((t: any) => t.id === data.tenant_id);
                                                const tenantName = tenantObj ? tenantObj.name : 'TOKONAN Group';
                                                const tenantAbbr = tenantName
                                                    .split(' ')
                                                    .map((word: string) => word.charAt(0))
                                                    .join('')
                                                    .toUpperCase()
                                                    .slice(0, 3);

                                                // 3. Rumus Simpel: Ambil Huruf Awal, Tengah, dan Akhir
                                                const cleanName = branchNameUpper.replace(/\s+/g, ''); // gabung jika ada spasi
                                                const len = cleanName.length;
                                                let branchAbbr = '';

                                                if (len >= 3) {
                                                    const firstChar = cleanName[0];
                                                    const middleChar = cleanName[Math.floor(len / 2)];
                                                    const lastChar = cleanName[len - 1];
                                                    branchAbbr = `${firstChar}${middleChar}${lastChar}`;
                                                } else {
                                                    branchAbbr = cleanName.padEnd(3, 'X'); // jika nama terlalu pendek (misal: "Up")
                                                }

                                                // 4. Angka Acak 3-digit (Format: 001 - 999)
                                                const randomNum = String(Math.floor(1 + Math.random() * 999)).padStart(3, '0');

                                                // 5. Gabungkan menjadi Kode Cabang (Contoh: TG-MLG-001)
                                                const generatedCode = `${tenantAbbr}-${branchAbbr}-${randomNum}`;

                                                // Update data state (Nama otomatis jadi UPPERCASE)
                                                setData((prev: any) => ({
                                                    ...prev,
                                                    name: branchNameUpper,
                                                    code: generatedCode
                                                }));

                                                toast.success(`Kode otomatis dibuat: ${generatedCode}`);
                                            }}
                                            className="px-3 bg-slate-900 hover:bg-slate-950 text-white transition-all active:scale-[0.97] flex items-center justify-center shrink-0"
                                            title="Buat Kode Cabang Otomatis"
                                        >
                                            <Sparkles className="h-3.5 w-3.5" />
                                        </Button>



                                    </div>
                                    {errors.code && <span className="text-xs text-destructive">{errors.code}</span>}
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="b-phone" className="text-xs font-bold uppercase text-muted-foreground">No. Telepon</Label>
                                    <Input id="b-phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="+6285..." />
                                    {errors.phone && <span className="text-xs text-destructive">{errors.phone}</span>}
                                </div>
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="b-address" className="text-xs font-bold uppercase text-muted-foreground">Alamat Lengkap</Label>
                                <Textarea id="b-address" className="h-16" value={data.address} onChange={(e) => setData('address', e.target.value)} placeholder="Nama jalan, nomor gedung, patokan..." />
                                {errors.address && <span className="text-xs text-destructive">{errors.address}</span>}
                            </div>

                            <div className="flex items-center space-x-2 pt-1">
                                <Checkbox
                                    id="b-main"
                                    checked={data.is_main}
                                    onCheckedChange={(checked) => setData('is_main', !!checked)}
                                />
                                <Label htmlFor="b-main" className="text-xs font-bold text-slate-700 cursor-pointer">
                                    Atur sebagai Cabang Utama (Pusat)
                                </Label>
                            </div>

                            {/* Pengaturan Kasir POS Cabang */}
                            <div className="border-t pt-3 mt-3 space-y-3">
                                <Label className="text-xs font-bold uppercase text-slate-700 tracking-wider block">Pengaturan Kasir POS Cabang</Label>

                                <div className="flex items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-lg border">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-800">Aktifkan Pajak (PPN)</span>
                                        <span className="text-[10px] text-slate-500">Hitung PPN otomatis pada checkout</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={data.pos_settings?.taxEnabled}
                                        onChange={(e) => {
                                            const updated = { ...data.pos_settings, taxEnabled: e.target.checked };
                                            setData('pos_settings', updated);
                                        }}
                                        className="h-4 w-4 rounded border-slate-350 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                    />
                                </div>

                                {data.pos_settings?.taxEnabled && (
                                    <div className="flex items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-lg border">
                                        <span className="text-xs font-bold text-slate-800">Tarif Pajak PPN (%)</span>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="h-8 w-20 text-xs font-mono font-bold text-center border-slate-200 focus-visible:ring-slate-900 bg-white"
                                            value={data.pos_settings?.taxRate}
                                            onChange={(e) => {
                                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                                const updated = { ...data.pos_settings, taxRate: val };
                                                setData('pos_settings', updated);
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2 bg-slate-50 p-2.5 rounded-lg border">
                                    <span className="text-xs font-bold text-slate-800 block">Metode Pembayaran Aktif</span>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { key: 'cash', label: 'Tunai' },
                                            { key: 'transfer', label: 'Transfer/QR' },
                                            { key: 'debt', label: 'Piutang' }
                                        ].map((m) => (
                                            <label key={m.key} className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 bg-white p-1.5 rounded border">
                                                <input
                                                    type="checkbox"
                                                    checked={data.pos_settings?.activeMethods?.[m.key]}
                                                    onChange={(e) => {
                                                        const updatedMethods = { ...data.pos_settings.activeMethods, [m.key]: e.target.checked };
                                                        if (Object.values(updatedMethods).filter(Boolean).length === 0) {
                                                            toast.error('Minimal harus ada 1 metode pembayaran aktif!');
                                                            return;
                                                        }
                                                        const updated = { ...data.pos_settings, activeMethods: updatedMethods };
                                                        setData('pos_settings', updated);
                                                    }}
                                                    className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                                />
                                                <span>{m.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Pembulatan Tunai (Cash Rounding) */}
                                <div className="space-y-2 bg-slate-50 p-2.5 rounded-lg border">
                                    <span className="text-xs font-bold text-slate-800 block">Pembulatan Tunai (Cash Rounding)</span>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-slate-500 block">Kelipatan</span>
                                            <Select
                                                value={(data.pos_settings?.roundingNearest || 100).toString()}
                                                onValueChange={(val) => {
                                                    const updated = { ...data.pos_settings, roundingNearest: parseInt(val) };
                                                    setData('pos_settings', updated);
                                                }}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                                                    <SelectValue placeholder="Pilih Kelipatan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">Tidak Ada</SelectItem>
                                                    <SelectItem value="100">Rp 100</SelectItem>
                                                    <SelectItem value="500">Rp 500</SelectItem>
                                                    <SelectItem value="1000">Rp 1.000</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-slate-500 block">Metode</span>
                                            <Select
                                                value={data.pos_settings?.roundingMethod || 'floor'}
                                                onValueChange={(val) => {
                                                    const updated = { ...data.pos_settings, roundingMethod: val };
                                                    setData('pos_settings', updated);
                                                }}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                                                    <SelectValue placeholder="Pilih Metode" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="round">Terdekat (Round)</SelectItem>
                                                    <SelectItem value="floor">Ke Bawah (Floor)</SelectItem>
                                                    <SelectItem value="ceil">Ke Atas (Ceil)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kolom Kanan: Peta Interaktif Terintegrasi */}
                        <div className="flex flex-col gap-2 border rounded-lg p-2 bg-muted/30">
                            <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-primary" /> Lokasi Koordinat Cabang
                            </Label>

                            <div className="h-[280px] w-full rounded-md overflow-hidden relative border z-10">
                                <MapContainer center={mapCenter} zoom={11} className="h-full w-full">
                                    <TileLayer
                                        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <SearchField onLocationSelected={handleLocationSearchSelected} />
                                    <MapEvents onMapClick={handleMapClick} />
                                    {markerPos && <Marker position={markerPos} />}
                                </MapContainer>
                            </div>

                            {/* Info koordinat readonly */}
                            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
                                <div>Lat: <span className="font-mono text-foreground">{data.latitude || '-'}</span></div>
                                <div>Lng: <span className="font-mono text-foreground">{data.longitude || '-'}</span></div>
                            </div>
                        </div>

                    </div>

                    <DialogFooter className="border-t pt-4">
                        <Button variant="outline" type="button" onClick={closeForm} disabled={processing}>Batal</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : selectedBranch ? 'Simpan Perubahan' : 'Buat Cabang Baru'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
