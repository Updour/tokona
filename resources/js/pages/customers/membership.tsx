import { Head, router, usePage } from '@inertiajs/react';
import { Users, Award, Shield, Search, X, Edit2, Sparkles, Star, Gem, Crown } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import MainLayout from '@/layouts/app/app-main-layout';

export default function Membership({ members, stats, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [tierFilter, setTierFilter] = useState(filters.tier || 'ALL');
    
    // Anggota terpilih untuk visualisasi kartu
    const [activeMember, setActiveMember] = useState(members?.data?.[0] || {
        name: 'Contoh Pelanggan',
        tier: 'member',
        points: 750,
        phone: '08123456789'
    });

    // Modal Edit Tier & Poin
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<any>(null);
    const [newTier, setNewTier] = useState('');
    const [newPoints, setNewPoints] = useState(0);
    const [processing, setProcessing] = useState(false);

    const applyFilters = (s = search, t = tierFilter) => {
        router.get('/membership', {
            search: s || undefined,
            tier: t !== 'ALL' ? t : undefined
        }, { preserveState: true, replace: true });
    };

    const handleSearchChange = (val: string) => {
        setSearch(val);
        const handler = setTimeout(() => {
            applyFilters(val, tierFilter);
        }, 350);

        return () => clearTimeout(handler);
    };

    const handleTierFilterChange = (val: string) => {
        setTierFilter(val);
        applyFilters(search, val);
    };

    const handleReset = () => {
        setSearch('');
        setTierFilter('ALL');
        router.get('/membership', {}, { replace: true });
    };

    const openEdit = (member: any) => {
        setEditingMember(member);
        setNewTier(member.tier);
        setNewPoints(member.points || 0);
        setIsEditOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.put(`/customers/${editingMember.id}`, {
            name: editingMember.name,
            email: editingMember.email,
            phone: editingMember.phone,
            address: editingMember.address,
            is_active: editingMember.is_active === 1 || editingMember.is_active === true,
            tier: newTier,
            points: newPoints
        }, {
            onSuccess: () => {
                setIsEditOpen(false);
                setProcessing(false);
                toast.success('Keanggotaan pelanggan berhasil disesuaikan!');

                // Update kartu jika anggota yang diedit sedang aktif di visualisasi
                if (activeMember.id === editingMember.id) {
                    setActiveMember({
                        ...activeMember,
                        tier: newTier,
                        points: newPoints
                    });
                }
            },
            onError: () => {
                setProcessing(false);
                toast.error('Gagal memperbarui keanggotaan.');
            }
        });
    };

    // Styling kartu berdasarkan tier
    const getCardStyles = (tier: string) => {
        switch (tier) {
            case 'distributor':
                return {
                    bg: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border-purple-500/40 text-purple-100',
                    badge: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
                    icon: Crown,
                    color: 'text-purple-400',
                    cardName: 'ROYAL DISTRIBUTOR'
                };
            case 'wholesale':
                return {
                    bg: 'bg-gradient-to-br from-amber-950 via-stone-900 to-orange-950 border-amber-500/40 text-amber-100',
                    badge: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
                    icon: Gem,
                    color: 'text-amber-400',
                    cardName: 'PREMIUM GROSIR'
                };
            case 'member':
                return {
                    bg: 'bg-gradient-to-br from-emerald-950 via-zinc-900 to-teal-950 border-emerald-500/40 text-emerald-100',
                    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
                    icon: Star,
                    color: 'text-emerald-400',
                    cardName: 'EXCLUSIVE MEMBER'
                };
            default:
                return {
                    bg: 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 border-slate-700 text-slate-100',
                    badge: 'bg-slate-500/20 text-slate-300 border-slate-400/30',
                    icon: Sparkles,
                    color: 'text-slate-400',
                    cardName: 'REGULAR CUSTOMER'
                };
        }
    };

    const activeStyles = getCardStyles(activeMember?.tier || 'regular');
    const CardIcon = activeStyles.icon;

    return (
        <MainLayout>
            <Head title="Tier & Membership Pelanggan" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <Award className="h-6 w-6 text-primary" /> Tier & Membership Pelanggan
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Kelola tingkatan pelanggan, distribusikan reward poin, dan atur keistimewaan tier bisnis Anda.
                    </p>
                </div>

                {/* Visual Premium Mockup Kartu & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Kartu Mockup */}
                    <Card className="lg:col-span-1 border shadow-lg overflow-hidden bg-slate-950 flex flex-col justify-between">
                        <div className={`p-6 flex-1 flex flex-col justify-between min-h-[220px] transition-all duration-500 ${activeStyles.bg} border border-solid rounded-lg m-2 relative`}>
                            <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                            
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-[10px] tracking-widest font-mono opacity-60">TOKONA LOYALTY CARD</p>
                                    <h3 className="font-mono text-sm font-bold tracking-wider">{activeStyles.cardName}</h3>
                                </div>
                                <CardIcon className={`h-8 w-8 ${activeStyles.color} animate-pulse`} />
                            </div>

                            <div className="py-6 space-y-1">
                                <p className="text-xs opacity-50 font-mono">HOLDER NAME</p>
                                <p className="font-mono text-lg font-bold tracking-wide uppercase truncate">
                                    {activeMember?.name || 'PILIH PELANGGAN'}
                                </p>
                            </div>

                            <div className="flex justify-between items-end border-t border-white/10 pt-4 font-mono">
                                <div className="space-y-0.5">
                                    <p className="text-[9px] opacity-40">CONTACT ID</p>
                                    <p className="text-xs font-semibold">{activeMember?.phone || '-'}</p>
                                </div>
                                <div className="text-right space-y-0.5">
                                    <p className="text-[9px] opacity-40">LOYALTY POINTS</p>
                                    <p className={`text-base font-bold ${activeStyles.color}`}>
                                        {(activeMember?.points || 0).toLocaleString('id-ID')} PTS
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Stats Dashboard */}
                    <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Card className="shadow-sm">
                            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Total Anggota</CardTitle>
                                <Users className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold">{(stats.total || 0).toLocaleString('id-ID')}</div>
                                <p className="text-xs text-muted-foreground mt-1">Terdaftar di sistem CRM</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-l-4 border-l-slate-400">
                            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Tier Reguler</CardTitle>
                                <Sparkles className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold">{stats.regular || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">Pelanggan standar</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-l-4 border-l-emerald-500">
                            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Tier Member</CardTitle>
                                <Star className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold">{stats.member || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">Anggota eksklusif</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-l-4 border-l-amber-500">
                            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Tier Grosir</CardTitle>
                                <Gem className="h-4 w-4 text-amber-500" />
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold">{stats.wholesale || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">Mitra harga grosir</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-l-4 border-l-purple-500">
                            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Distributor</CardTitle>
                                <Crown className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold">{stats.distributor || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">Level kemitraan tertinggi</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm bg-primary/5 border-l-4 border-l-primary">
                            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-semibold uppercase text-primary">Reward Poin</CardTitle>
                                <Award className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold text-primary">{(stats.points || 0).toLocaleString('id-ID')}</div>
                                <p className="text-xs text-muted-foreground mt-1">Total poin beredar</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Saringan Filter & Tabel Anggota */}
                <Card className="shadow-sm border">
                    <CardHeader className="pb-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
                        <div>
                            <CardTitle className="text-base font-bold">Daftar Keanggotaan Aktif</CardTitle>
                            <CardDescription>Klik nama pelanggan untuk menampilkan visualisasi kartu loyalitas mereka di atas.</CardDescription>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama atau No HP..."
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-8 h-9 text-sm"
                                />
                                {search && (
                                    <button onClick={() => handleSearchChange('')} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <Select value={tierFilter} onValueChange={handleTierFilterChange}>
                                <SelectTrigger className="w-[140px] h-9 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Semua Tier</SelectItem>
                                    <SelectItem value="regular">Reguler</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="wholesale">Grosir</SelectItem>
                                    <SelectItem value="distributor">Distributor</SelectItem>
                                </SelectContent>
                            </Select>

                            {(search || tierFilter !== 'ALL') && (
                                <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 gap-1 text-muted-foreground">
                                    <X className="h-3.5 w-3.5" /> Reset
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead>Nama Pelanggan</TableHead>
                                    <TableHead>No. HP</TableHead>
                                    <TableHead>Level / Tier</TableHead>
                                    <TableHead>Akumulasi Poin</TableHead>
                                    <TableHead>Status Akun</TableHead>
                                    <TableHead className="text-right">Aksi Cepat</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members?.data?.length ? (
                                    members.data.map((m: any) => {
                                        const isCurrent = activeMember.id === m.id;

                                        return (
                                            <TableRow 
                                                key={m.id} 
                                                className={`cursor-pointer transition-all ${isCurrent ? 'bg-primary/5 hover:bg-primary/5' : 'hover:bg-slate-50'}`}
                                                onClick={() => setActiveMember(m)}
                                            >
                                                <TableCell className="font-semibold text-slate-800">
                                                    {m.name}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">{m.phone || '-'}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                        m.tier === 'distributor' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                        m.tier === 'wholesale' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        m.tier === 'member' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        'bg-slate-50 text-slate-600 border-slate-200'
                                                    }`}>
                                                        {m.tier}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="font-bold font-mono text-sm text-primary">
                                                    {(m.points || 0).toLocaleString('id-ID')} Pts
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={m.is_active ? 'default' : 'secondary'} className="text-[10px] px-2 py-0">
                                                        {m.is_active ? 'Aktif' : 'Mati'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-8 gap-1 border-primary/20 text-primary hover:bg-primary/5"
                                                        onClick={() => openEdit(m)}
                                                    >
                                                        <Edit2 className="h-3 w-3" /> Ubah Tingkat
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                            Tidak ditemukan pelanggan dengan kriteria ini.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {members?.total > members?.per_page && (
                    <div className="flex justify-between items-center py-2">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {members.from} hingga {members.to} dari {members.total} pelanggan
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={!members?.prev_page_url} onClick={() => router.get(members.prev_page_url)}>Prev</Button>
                            <Button variant="outline" size="sm" disabled={!members?.next_page_url} onClick={() => router.get(members.next_page_url)}>Next</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Dialog Edit Cepat Tier & Poin */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" /> Sesuaikan Keanggotaan
                        </DialogTitle>
                        <DialogDescription>
                            Ubah tier tingkatan kemitraan dan sesuaikan alokasi reward poin untuk <strong>{editingMember?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSave} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Tier Kemitraan</Label>
                            <Select value={newTier} onValueChange={setNewTier}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="regular">Reguler (Standar)</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="wholesale">Grosir</SelectItem>
                                    <SelectItem value="distributor">Distributor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Reward Poin</Label>
                            <Input 
                                type="number" 
                                min="0" 
                                value={newPoints} 
                                onChange={(e) => setNewPoints(parseInt(e.target.value) || 0)} 
                            />
                            <p className="text-[10px] text-muted-foreground">Poin loyalitas pelanggan untuk diskon atau ditukarkan merchandise.</p>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}
