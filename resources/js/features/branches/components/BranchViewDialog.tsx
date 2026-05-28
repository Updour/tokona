import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogClose
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useBranchStore } from '@/pages/branches/stores/useBranchStore';
import {
    Building2, Phone, MapPin, Calendar, Clock, X, Map
} from 'lucide-react';

import { formatDateTime, formatTimeAgo } from '@/lib/helpers/date';
// IMPOR UNTUK LEAFLET MAP
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { renderToString } from 'react-dom/server';
import 'leaflet/dist/leaflet.css';

export function BranchViewDialog() {
    const { isViewOpen, selectedBranch, closeView } = useBranchStore();

    if (!selectedBranch) return null;

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
