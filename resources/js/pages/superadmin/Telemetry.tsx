import { Head } from '@inertiajs/react';
import { Activity, ShieldAlert, Monitor, Terminal, MapPin, Search } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/layouts/app/app-main-layout';

interface TelemetryProps {
  logs: {
    data: Array<{
      id: number;
      type: string;
      ip: string;
      os: string;
      mac_address: string;
      server_ip: string;
      user_agent: string;
      created_at: string;
    }>;
    links: any[];
    current_page: number;
    last_page: number;
  };
}

export default function Telemetry({ logs }: TelemetryProps) {
  return (
    <MainLayout>
      <Head title="Telemetry & Installations" />
      
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-indigo-600" />
            Telemetry & Installations Log
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitoring instalasi aplikasi di berbagai server/klien dan riwayat *Phone Home*.
          </p>
        </div>

        <Card className="border-indigo-100 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              Recent Pings
            </CardTitle>
            <CardDescription>
              Aktivitas terbaru dari aplikasi yang di-clone.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">IP / Location (Est)</th>
                    <th className="px-6 py-4 font-medium">MAC / Server IP</th>
                    <th className="px-6 py-4 font-medium">OS & Browser</th>
                    <th className="px-6 py-4 font-medium">Detected At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        <Monitor className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <p>No telemetry logs received yet.</p>
                      </td>
                    </tr>
                  ) : logs.data.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Badge variant={log.type === 'install_migration' ? 'default' : 'secondary'} className={log.type === 'install_migration' ? 'bg-indigo-500' : ''}>
                          {log.type === 'install_migration' ? (
                            <><Terminal className="h-3 w-3 mr-1" /> Migration</>
                          ) : (
                            <><Monitor className="h-3 w-3 mr-1" /> Web Visit</>
                          )}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-slate-900">{log.ip || 'Unknown IP'}</span>
                          {log.ip && (
                            <a 
                              href={`https://ipinfo.io/${log.ip}`} 
                              target="_blank" 
                              className="text-[10px] text-blue-500 hover:underline flex items-center"
                            >
                              <MapPin className="h-3 w-3 mr-1" /> Trace IP
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        <div className="flex flex-col">
                          <span className="text-slate-600 font-semibold" title="MAC Address">{log.mac_address || 'N/A'}</span>
                          <span className="text-slate-400" title="Server IP">{log.server_ip || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-[200px] truncate text-xs text-slate-600" title={log.os}>
                          {log.os || 'Unknown OS'}
                        </div>
                        <div className="max-w-[200px] truncate text-[10px] text-slate-400 mt-1" title={log.user_agent}>
                          {log.user_agent || 'Unknown Browser'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {new Date(log.created_at).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
