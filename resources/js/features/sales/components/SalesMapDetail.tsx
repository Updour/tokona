import { divIcon } from 'leaflet';
import { renderToString } from 'react-dom/server';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Navigation, Compass, Store, UserCheck, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CustomerLocation, SalesVisit } from '../types';

import 'leaflet/dist/leaflet.css';

interface SalesMapDetailProps {
    locations: CustomerLocation[];
    activeVisits: SalesVisit[];
}

export function SalesMapDetail({ locations = [], activeVisits = [] }: SalesMapDetailProps) {
    // Tentukan titik tengah peta (default ke Jakarta Pusat jika tidak ada lokasi toko)
    const mapCenter: [number, number] = locations.length > 0 && locations[0].latitude && locations[0].longitude
        ? [Number(locations[0].latitude), Number(locations[0].longitude)]
        : [-6.2088, 106.8456];

    // Buat ikon penunjuk kustom (Marker Merah)
    const customIcon = divIcon({
        html: renderToString(<MapPin className="text-red-500 fill-red-100" size={32} />),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
        className: 'bg-transparent border-0',
    });

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6 flex-1 min-h-[500px]">
            {/* Map Area */}
            <div className="xl:col-span-8 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative shadow-sm flex flex-col h-[500px] xl:h-auto min-h-[450px]">
                <div className="absolute top-4 left-4 z-50">
                    <div className="bg-white/90 backdrop-blur border px-3 py-1.5 rounded-full text-xs font-black text-slate-800 shadow-sm flex items-center gap-1.5">
                        <Compass className="h-3.5 w-3.5 text-indigo-650 animate-spin-slow" />
                        Peta Lapangan Aktif (Jakarta Pusat)
                    </div>
                </div>

                {/* CONTAINER REAL LEAFLET MAP */}
                <div className="w-full h-full relative z-10 flex-1">
                    <MapContainer
                        center={mapCenter}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />
                        {locations.map((loc) => {
                            const lat = Number(loc.latitude);
                            const lng = Number(loc.longitude);
                            if (isNaN(lat) || isNaN(lng)) return null;

                            return (
                                <Marker
                                    key={loc.id}
                                    position={[lat, lng]}
                                    icon={customIcon}
                                >
                                    <Popup className="rounded-lg overflow-hidden">
                                        <div className="p-1 space-y-1 text-slate-800">
                                            <div className="font-bold text-xs flex items-center gap-1">
                                                <Store className="h-3.5 w-3.5 text-indigo-600" />
                                                {loc.name}
                                            </div>
                                            <p className="text-[10px] text-slate-500 leading-tight">{loc.address}</p>
                                            <div className="flex items-center justify-between gap-2 pt-2 border-t mt-1.5">
                                                <span className="text-[9px] text-slate-400 font-bold">GPS Terverifikasi</span>
                                                <Button
                                                    onClick={() => window.open(`https://google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')}
                                                    size="sm"
                                                    className="h-5 px-1.5 text-[9px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                                >
                                                    Petunjuk Arah
                                                </Button>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>
            </div>

            {/* Sidebar details */}
            <div className="xl:col-span-4 flex flex-col gap-4">
                <Card className="shadow-sm border flex-1 max-h-[300px] xl:max-h-[350px] overflow-hidden flex flex-col">
                    <CardHeader className="shrink-0 pb-2">
                        <CardTitle className="text-sm font-black text-slate-800">Outlet Mitra Terdaftar</CardTitle>
                        <CardDescription className="text-xs">Daftar lokasi toko berkoordinat valid</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 overflow-y-auto flex-1 pb-4">
                        {locations.length > 0 ? (
                            locations.map((loc) => (
                                <div key={loc.id} className="p-3 border rounded-xl hover:bg-slate-50 transition-all flex items-start gap-3 cursor-pointer group">
                                    <div className="h-9 w-9 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center font-bold shrink-0 border border-indigo-200 group-hover:scale-105 transition-transform">
                                        <Store className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-xs text-slate-800 group-hover:text-indigo-650 transition-colors">{loc.name}</div>
                                        <div className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">{loc.address ?? '-'}</div>
                                        <div className="flex items-center gap-2 mt-1.5 text-[9px] text-indigo-600 font-bold">
                                            <Navigation className="h-2.5 w-2.5" /> Lat: {loc.latitude ?? '-'}, Lng: {loc.longitude ?? '-'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-500 text-center py-4 font-semibold">Tidak ada outlet terkoordinat.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm border bg-gradient-to-br from-indigo-900 to-slate-950 text-white shrink-0">
                    <CardHeader>
                        <CardTitle className="text-sm font-black flex items-center gap-1.5">
                            <UserCheck className="h-4 w-4 text-emerald-450" /> Status Kunjungan Sales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-xs font-semibold">
                        {activeVisits.length > 0 ? (
                            activeVisits.map((v) => (
                                <div key={v.id} className="flex justify-between items-center border-b border-indigo-850 pb-2 last:border-b-0 last:pb-0 animate-fade-in">
                                    <div>
                                        <div className="text-white font-bold">{v.sales_person?.name ?? 'Sales'}</div>
                                        <div className="text-[10px] text-indigo-300 font-normal mt-0.5">Ke: {v.customer?.name ?? 'Outlet'}</div>
                                    </div>
                                    <Badge className="bg-emerald-500 hover:bg-emerald-600 border-0 text-white font-extrabold text-[9px]">Check-In</Badge>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-indigo-300 text-center py-2 font-semibold">Belum ada kunjungan aktif.</p>
                        )}
                        <p className="text-[10px] text-indigo-300/80 font-bold leading-normal pt-1 flex items-start gap-1">
                            <Star className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" /> Personel sales lapangan wajib mengaktifkan GPS & melakukan check-in setibanya di toko mitra.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
