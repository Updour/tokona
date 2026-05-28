import * as React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { useTenantStore } from '@/pages/tenants/stores/useTenantStore';
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
import { Building2, MapPin } from 'lucide-react';
import { store as tenantsStore, update as tenantsUpdate } from '@/routes/tenants';
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

export function TenantFormDialog() {
    const { isFormOpen, selectedTenant, closeForm } = useTenantStore();

    // Default koordinat tengah Indonesia (Jakarta jika tidak ada data awal)
    const [mapCenter, setMapCenter] = useState<[number, number]>([-6.2000, 106.8166]);
    const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        phone: '',
        address_text: '',
        city: '',
        province: '',
        latitude: '',
        longitude: '',
        status: 'active' as 'active' | 'suspended' | 'trial',
        plan: 'free' as 'free' | 'pro' | 'enterprise',
        expires_at: '',
    });

    useEffect(() => {
        if (selectedTenant) {
            const loc = (selectedTenant.location || {}) as any;

            const lat = loc.latitude ? parseFloat(loc.latitude) : -6.2000;
            const lng = loc.longitude ? parseFloat(loc.longitude) : 106.8166;

            setData({
                name: selectedTenant.name,
                email: selectedTenant.email ?? '',
                phone: selectedTenant.phone ?? '',
                status: selectedTenant.status,
                plan: selectedTenant.plan,
                city: loc.city ?? '',
                province: loc.province ?? '',
                address_text: loc.address_text ?? '',
                latitude: loc.latitude ?? '',
                longitude: loc.longitude ?? '',
                expires_at: selectedTenant.expires_at ? selectedTenant.expires_at.split(' ')[0].split('T')[0] : '',
            });

            if (loc.latitude && loc.longitude) {
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
    }, [selectedTenant, isFormOpen]);

    // DI SINI PERBAIKAN UTAMANYA: Menggunakan URL Nominatim & Backtick ( ` ) yang benar
    const fetchAddressDetails = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://openstreetmap.org{lat}&lon=${lng}&addressdetails=1&accept-language=id`);

            const result = await res.json();
            if (result && result.address) {
                const addr = result.address;

                // Ambil nama kota dari properti yang paling mungkin terisi
                const cityName = addr.city || addr.town || addr.city_district || addr.municipality || addr.suburb || '';

                setData(prev => ({
                    ...prev,
                    latitude: lat.toString(),
                    longitude: lng.toString(),
                    city: cityName,
                    province: addr.state || '',
                    address_text: result.display_name || ''
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
        setData(prev => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString(),
            city: addressData.city,
            province: addressData.province,
            address_text: addressData.road
        }));
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedTenant) {
            put(tenantsUpdate(selectedTenant.id).url, { onSuccess: () => closeForm() });
        } else {
            post(tenantsStore().url, { onSuccess: () => closeForm() });
        }
    };


    return (
        <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
            {/* Responsif Lebar Dialog diperbesar agar peta terlihat nyaman */}
            <DialogContent className="sm:max-w-[850px] p-6 gap-4 max-h-[90vh] overflow-y-auto">
                <form onSubmit={onSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            {selectedTenant ? 'Modify Tenant Settings' : 'Register New Tenant Group'}
                        </DialogTitle>
                        <DialogDescription>
                            Tentukan credential bisnis beserta titik maps operasional unit tenant Anda.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Layout Split: Kiri Form Utama, Kanan Peta Pencari */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">

                        {/* Kolom Kiri: Input Form Data */}
                        <div className="space-y-3.5">
                            <div className="grid gap-1.5">
                                <Label htmlFor="t-name" className="text-xs font-bold uppercase text-muted-foreground">Tenant Name <span className="text-destructive">*</span></Label>
                                <Input id="t-name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Makmur Jaya Corp" required />
                                {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="t-email" className="text-xs font-bold uppercase text-muted-foreground">Email</Label>
                                    <Input id="t-email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="billing@corp.com" />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="t-phone" className="text-xs font-bold uppercase text-muted-foreground">Phone</Label>
                                    <Input id="t-phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="+6285..." />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="t-status" className="text-xs font-bold uppercase text-muted-foreground">Status</Label>
                                    <Select value={data.status} onValueChange={(val: any) => setData('status', val)}>
                                        <SelectTrigger id="t-status" className='w-full'><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="trial">Trial</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="t-plan" className="text-xs font-bold uppercase text-muted-foreground">Subscription Plan</Label>
                                    <Select value={data.plan} onValueChange={(val: any) => setData('plan', val)}>
                                        <SelectTrigger id="t-plan" className='w-full'><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="free">Free</SelectItem>
                                            <SelectItem value="pro">Pro</SelectItem>
                                            <SelectItem value="enterprise">Enterprise</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="t-city" className="text-xs font-bold uppercase text-muted-foreground">City</Label>
                                    <Input id="t-city" value={data.city} onChange={(e) => setData('city', e.target.value)} placeholder="Terisi otomatis dari peta" />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="t-province" className="text-xs font-bold uppercase text-muted-foreground">Province</Label>
                                    <Input id="t-province" value={data.province} onChange={(e) => setData('province', e.target.value)} placeholder="Terisi otomatis dari peta" />
                                </div>
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="t-expires-at" className="text-xs font-bold uppercase text-muted-foreground">Masa Aktif (Trial / Subscription End)</Label>
                                <Input id="t-expires-at" type="date" value={data.expires_at} onChange={(e) => setData('expires_at', e.target.value)} />
                                {errors.expires_at && <span className="text-xs text-destructive">{errors.expires_at}</span>}
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="t-address" className="text-xs font-bold uppercase text-muted-foreground">Detail Address Description</Label>
                                <Textarea id="t-address" className="h-20" value={data.address_text} onChange={(e) => setData('address_text', e.target.value)} placeholder="Nama jalan, nomor gedung, patokan..." />
                            </div>
                        </div>

                        {/* Kolom Kanan: Peta Interaktif Terintegrasi */}
                        <div className="flex flex-col gap-2 border rounded-lg p-2 bg-muted/30">
                            <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-primary" /> Pinpoint Location Locator
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
                        <Button variant="outline" type="button" onClick={closeForm} disabled={processing}>Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : selectedTenant ? 'Update Tenant' : 'Create Tenant'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
