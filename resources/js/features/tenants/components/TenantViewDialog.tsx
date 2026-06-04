import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTenantStore } from '@/pages/tenants/stores/useTenantStore';
import {
    Building2, Mail, Phone, MapPin, Calendar, Clock, X,
    Globe, ShieldCheck, HardDrive, Map, ExternalLink
} from 'lucide-react';

import { formatDateTime, formatTimeAgo } from '@/lib/helpers/date'
// IMPOR UNTUK LEAFLET MAP
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { renderToString } from 'react-dom/server';
import 'leaflet/dist/leaflet.css'; // Wajib diimpor agar style peta tidak rusak

export function TenantViewDialog() {
    const { isViewOpen, selectedTenant, closeView } = useTenantStore();

    if (!selectedTenant) return null;

    const location = selectedTenant.location;
    const lat = location?.latitude ? parseFloat(location.latitude) : null;
    const lon = location?.longitude ? parseFloat(location.longitude) : null;
    const hasCoordinates = lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon);

    const handleOpenMaps = () => {
        if (!location) return;

        if (location.maps_link) {
            window.open(location.maps_link, '_blank', 'noopener,noreferrer');
        } else if (hasCoordinates) {
            // PERBAIKAN: Menggunakan backtick (``) dan format query parameter Google Maps yang benar
            const safeUrl = `https://google.com{lat},${lon}`;
            window.open(safeUrl, '_blank', 'noopener,noreferrer');
        }
    };


    // Mengubah Ikon Lucide MapPin menjadi marker kustom untuk Leaflet
    const customIcon = divIcon({
        html: renderToString(<MapPin className="text-red-500 fill-red-100" size={32} />),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        className: 'bg-transparent border-0', // Menghapus kotak putih bawaan leaflet
    });

    const hasValidLocation = location && (location.maps_link || hasCoordinates);

    return (
        <Dialog open={isViewOpen} onOpenChange={(open) => !open && closeView()}>
            <DialogContent className="sm:max-w-2xl w-full p-0 overflow-hidden gap-0">
                <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50 bg-white/10 text-white hover:bg-white/20 p-1 rounded-full">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </DialogClose>
                <DialogHeader className="sr-only">
                    <DialogTitle>{selectedTenant.name}</DialogTitle>
                    <DialogDescription>
                        Detail profil informasi bisnis dan status langganan penyewa {selectedTenant.name}.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-white/20 shadow-sm">
                        <AvatarImage src={selectedTenant.logo || ''} alt={selectedTenant.name} />
                        <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                            {selectedTenant.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl font-bold tracking-tight text-white m-0 truncate">
                                {selectedTenant.name}
                            </h2>
                            <Badge className="capitalize text-xs font-semibold" variant={selectedTenant.status === 'active' ? 'default' : 'destructive'}>
                                {selectedTenant.status}
                            </Badge>
                        </div>
                        <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                            <Globe className="h-3.5 w-3.5" />
                            <span>https://tokona.com{selectedTenant.slug}</span>
                        </p>
                    </div>
                </div>

                <div className="p-6 grid gap-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-xl border">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1">
                                <HardDrive className="h-3.5 w-3.5" /> Tier Plan
                            </span>
                            <p className="text-base font-bold text-foreground capitalize">{selectedTenant.plan} Package</p>
                        </div>
                        <div className="space-y-1 border-l pl-4">
                            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5" /> Multi-Tenant ID
                            </span>
                            <p className="text-xs font-mono text-muted-foreground truncate mt-1" title={selectedTenant.id}>
                                {selectedTenant.id}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 border-b pb-1.5">
                            Contact Information
                        </h3>
                        <div className="grid gap-3.5">
                            <DetailRow icon={<Mail className="h-4 w-4" />} label="Official Email Address" value={selectedTenant.email ?? "-"} />
                            <DetailRow icon={<Phone className="h-4 w-4" />} label="Hotline / Phone Number" value={selectedTenant.phone ?? "-"} />
                            <DetailRow icon={<MapPin className="h-4 w-4" />} label="Main Store Address" value={selectedTenant.address ?? "-"} />
                        </div>
                    </div>
                    {/* Metadata Sistem */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 border-b pb-1.5">
                            System Metadata
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground bg-muted/20 p-4 rounded-xl border border-dashed">

                            {/* Tanggal Daftar */}
                            <div className="flex items-start gap-2.5">
                                <Calendar className="h-4 w-4 text-primary/70 mt-0.5" />
                                <div>
                                    <p className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Tanggal Registrasi</p>
                                    <p className="font-semibold text-foreground mt-0.5">
                                        {formatDateTime(selectedTenant.created_at)}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground/80 italic mt-0.5">
                                        {formatTimeAgo(selectedTenant.created_at)}
                                    </p>
                                </div>
                            </div>

                            {/* Terakhir Update */}
                            <div className="flex items-start gap-2.5 border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-4">
                                <Clock className="h-4 w-4 text-amber-600/70 mt-0.5" />
                                <div>
                                    <p className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Perubahan Terakhir</p>
                                    <p className="font-semibold text-foreground mt-0.5">
                                        {formatDateTime(selectedTenant.updated_at)}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground/80 italic mt-0.5">
                                        {formatTimeAgo(selectedTenant.updated_at)}
                                    </p>
                                </div>
                            </div>

                            {/* Masa Aktif */}
                            <div className="flex items-start gap-2.5 col-span-1 sm:col-span-2 border-t pt-3.5 mt-1.5 w-full">
                                <Clock className="h-4 w-4 text-emerald-600 mt-0.5" />
                                <div className="w-full">
                                    <p className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground flex items-center gap-1.5">
                                        Masa Aktif / Subscription Expiry
                                        {selectedTenant.expires_at && new Date(selectedTenant.expires_at) < new Date() && (
                                            <Badge variant="destructive" className="h-4 py-0 text-[8px] font-bold"> EXPIRED</Badge>
                                        )}
                                    </p>
                                    <p className="font-semibold text-foreground mt-0.5">
                                        {selectedTenant.expires_at
                                            ? new Date(selectedTenant.expires_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                            : 'Selamanya'
                                        }
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>


                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 border-b pb-1.5">
                            Geographic Location
                        </h3>
                        <div className="grid gap-3.5">
                            <div className="grid grid-cols-2 gap-4">
                                <DetailRow icon={<Building2 className="h-4 w-4" />} label="City / Regency" value={location?.city ?? "-"} />
                                <DetailRow icon={<Map className="h-4 w-4" />} label="Province" value={location?.province ?? "-"} />
                            </div>

                            <DetailRow icon={<MapPin className="h-4 w-4" />} label="Detailed Location Text" value={location?.address_text ?? "-"} />

                            {/* CONTAINER MAPS LEAFLET */}
                            {hasCoordinates && (
                                <div className="w-full h-[180px] rounded-lg overflow-hidden border shadow-inner relative z-10 mt-2 cursor-pointer" title="Click marker to open Google Maps">
                                    <MapContainer
                                        center={[lat, lon]}
                                        zoom={15}
                                        style={{ height: '100%', width: '100%' }}
                                        zoomControl={false}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; OpenStreetMap contributors'
                                        />
                                        {/* BISA DIKLIK DI SINI */}
                                        <Marker
                                            position={[lat, lon]}
                                            icon={customIcon}
                                            eventHandlers={{
                                                click: (e) => {
                                                    // Menggunakan penggabungan string klasik (+) tanpa tanda kurung kurawal
                                                    const targetUrl = "https://google.com" + e.latlng.lat + "," + e.latlng.lng;
                                                    window.open(targetUrl, '_blank', 'noopener,noreferrer');
                                                }
                                            }}
                                        />


                                    </MapContainer>
                                </div>
                            )}

                            {hasValidLocation && (
                                <div className="flex justify-end mt-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs font-semibold text-blue-600 flex items-center gap-1.5"
                                        onClick={handleOpenMaps}
                                    >
                                        <Map className="h-3.5 w-3.5" />
                                        Open Location in Google Maps
                                        <ExternalLink className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog >
    );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
    return (
        <div className="flex items-start gap-3 text-sm">
            <div className="mt-0.5 text-muted-foreground">{icon}</div>
            <div className="space-y-0.5 min-w-0 flex-1">
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                <p className="text-sm font-medium text-foreground break-words">{value || '-'}</p>
            </div>
        </div>
    );
}
