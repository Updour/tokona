import { divIcon } from 'leaflet';
import {
    Building2, Phone, MapPin, Calendar, Clock, X, Map, Settings, CheckCircle2, XCircle, Navigation, Box
} from 'lucide-react';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogClose
} from '@/components/ui/dialog';
import { formatDateTime, formatTimeAgo } from '@/lib/helpers/date';
import { useBranchStore } from '@/pages/branches/stores/useBranchStore';

// IMPOR UNTUK LEAFLET MAP
import 'leaflet/dist/leaflet.css';

export function BranchViewDialog() {
    const { isViewOpen, selectedBranch, closeView } = useBranchStore();

    if (!selectedBranch) {
return null;
}

    const lat = selectedBranch.latitude ? parseFloat(selectedBranch.latitude) : null;
    const lon = selectedBranch.longitude ? parseFloat(selectedBranch.longitude) : null;
    const hasCoordinates = lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon);

    // Mengubah Ikon Lucide MapPin menjadi marker kustom untuk Leaflet
    const customIcon = divIcon({
        html: renderToString(<MapPin className="text-red-500 fill-red-100" size={32} />),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        className: 'bg-transparent border-0',
    });

    return (
        <Dialog open={isViewOpen} onOpenChange={(open) => !open && closeView()}>
            <DialogContent className="sm:max-w-2xl w-full p-0 overflow-hidden gap-0">
                <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50 bg-white/10 text-white hover:bg-white/20 p-1 rounded-full">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </DialogClose>
                <DialogHeader className="sr-only">
                    <DialogTitle>{selectedBranch.name}</DialogTitle>
                    <DialogDescription>
                        Detail profil cabang {selectedBranch.name}.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-white/20 shadow-sm">
                        <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                            {selectedBranch.code.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl font-bold tracking-tight text-white m-0 truncate">
                                {selectedBranch.name}
                            </h2>
                            <Badge className="capitalize text-xs font-semibold" variant={selectedBranch.is_main ? 'default' : 'secondary'}>
                                {selectedBranch.is_main ? 'Main Branch' : 'Sub Branch'}
                            </Badge>
                        </div>
                        <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                            <Building2 className="h-3.5 w-3.5" />
                            <span>Branch Code: {selectedBranch.code}</span>
                        </p>
                    </div>
                </div>

                <div className="p-6 grid gap-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 border-b pb-1.5">
                            Contact & Location
                        </h3>
                        <div className="grid gap-3.5">
                            <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone Number" value={selectedBranch.phone ?? "-"} />
                            <DetailRow icon={<MapPin className="h-4 w-4" />} label="Address" value={selectedBranch.address ?? "-"} />
                            {selectedBranch.tenant && (
                                <DetailRow icon={<Building2 className="h-4 w-4" />} label="Tenant (Toko)" value={selectedBranch.tenant.name} />
                            )}

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
                                        <Marker
                                            position={[lat, lon]}
                                            icon={customIcon}
                                            eventHandlers={{
                                                click: (e) => {
                                                    const targetUrl = "https://google.com/maps/search/?api=1&query=" + e.latlng.lat + "," + e.latlng.lng;
                                                    window.open(targetUrl, '_blank', 'noopener,noreferrer');
                                                }
                                            }}
                                        />
                                    </MapContainer>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Pengaturan Modul & POS */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 border-b pb-1.5 flex items-center gap-2">
                            <Settings className="h-4 w-4 text-indigo-500" /> Pengaturan POS & Modul
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Konfigurasi Pajak & Fitur POS */}
                            <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-dashed text-sm">
                                <h4 className="font-bold text-slate-800 text-xs uppercase mb-2">Konfigurasi Kasir</h4>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground font-medium">Wajib Buka Shift</span>
                                    {selectedBranch.pos_settings?.require_shift !== false ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-slate-300" />
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground font-medium">Pajak (PPN)</span>
                                    {selectedBranch.pos_settings?.taxEnabled ? (
                                        <Badge variant="default" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 shadow-none border-0 text-[10px]">{selectedBranch.pos_settings.taxRate}%</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground text-[10px]">Non-Aktif</Badge>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground font-medium">Metode Pembulatan</span>
                                    <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded uppercase">
                                        {selectedBranch.pos_settings?.roundingMethod === 'round' ? 'Terdekat' : 
                                         selectedBranch.pos_settings?.roundingMethod === 'ceil' ? 'Ke Atas' : 'Ke Bawah'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1.5 pt-2 border-t border-dashed">
                                    <span className="text-muted-foreground font-medium text-[11px]">Metode Pembayaran:</span>
                                    <div className="flex gap-1 flex-wrap">
                                        {selectedBranch.pos_settings?.activeMethods?.cash && <Badge variant="secondary" className="text-[10px]">Tunai</Badge>}
                                        {selectedBranch.pos_settings?.activeMethods?.transfer && <Badge variant="secondary" className="text-[10px]">Transfer/QR</Badge>}
                                        {selectedBranch.pos_settings?.activeMethods?.debt && <Badge variant="secondary" className="text-[10px]">Piutang</Badge>}
                                    </div>
                                </div>
                            </div>

                            {/* Modul Ekstra */}
                            <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-dashed text-sm">
                                <h4 className="font-bold text-slate-800 text-xs uppercase mb-2">Modul Ekstra Cabang</h4>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-1.5 text-muted-foreground font-medium text-xs"><Navigation className="h-3.5 w-3.5" /> Canvas Sales</span>
                                    {selectedBranch.pos_settings?.enable_canvas ? (
                                        <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shadow-none border-0 text-[10px]">Aktif</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground text-[10px]">Mati</Badge>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-1.5 text-muted-foreground font-medium text-xs"><Box className="h-3.5 w-3.5" /> Konsinyasi</span>
                                    {selectedBranch.pos_settings?.enable_consignment ? (
                                        <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shadow-none border-0 text-[10px]">Aktif</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground text-[10px]">Mati</Badge>
                                    )}
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="flex items-center gap-1.5 text-muted-foreground font-medium text-xs"><Calendar className="h-3.5 w-3.5" /> Absensi Harian</span>
                                    {selectedBranch.pos_settings?.enable_attendance ? (
                                        <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shadow-none border-0 text-[10px]">Aktif</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground text-[10px]">Mati</Badge>
                                    )}
                                </div>
                            </div>
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
                                    <p className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Created On</p>
                                    <p className="font-semibold text-foreground mt-0.5">
                                        {formatDateTime(selectedBranch.created_at)}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground/80 italic mt-0.5">
                                        {formatTimeAgo(selectedBranch.created_at)}
                                    </p>
                                </div>
                            </div>

                            {/* Terakhir Update */}
                            <div className="flex items-start gap-2.5 border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-4">
                                <Clock className="h-4 w-4 text-amber-600/70 mt-0.5" />
                                <div>
                                    <p className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Last Update</p>
                                    <p className="font-semibold text-foreground mt-0.5">
                                        {formatDateTime(selectedBranch.updated_at)}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground/80 italic mt-0.5">
                                        {formatTimeAgo(selectedBranch.updated_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
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
