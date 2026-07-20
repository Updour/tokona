import { PageProps } from '@inertiajs/core';
import { usePage } from '@inertiajs/react';
import { Coffee, ShieldAlert } from 'lucide-react';

export default function SystemAlert() {
  const { props } = usePage<PageProps & { sys_health_degraded?: boolean }>();

  if (!props.sys_health_degraded) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-card border border-border shadow-2xl rounded-2xl p-8 flex flex-col items-center space-y-6">
        <div className="h-20 w-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-2">
          <ShieldAlert className="h-10 w-10" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight">Sistem Terkunci</h1>
        
        <p className="text-muted-foreground text-sm leading-relaxed">
          Masa percobaan gratis untuk aplikasi ini telah habis. Aplikasi tidak dapat digunakan sementara waktu.
        </p>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 w-full text-left space-y-4">
          <div className="flex items-center space-x-3 text-primary mb-2">
            <Coffee className="h-5 w-5" />
            <h3 className="font-semibold">Traktir Saya Kopi</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Transfer ke Rekening:</span><br/><strong className="text-foreground">Bank BCA</strong></p>
            <p><span className="text-muted-foreground">Nomor Rekening:</span><br/><strong className="text-foreground text-lg tracking-wider">315-188-1015</strong></p>
            <p><span className="text-muted-foreground">Atas Nama (a.n.):</span><br/><strong className="text-foreground">Abdur Rohman</strong></p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Mohon konfirmasi dan kirimkan bukti transfer kepada pengembang setelah pembayaran selesai ya. Terima kasih! 🙏
        </p>
      </div>
    </div>
  );
}
