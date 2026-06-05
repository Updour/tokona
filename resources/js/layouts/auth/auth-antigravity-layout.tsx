import { Head, Link } from '@inertiajs/react';
import type { Engine, ISourceOptions } from '@tsparticles/engine';
import { Particles, ParticlesProvider } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import React, { useCallback, useEffect, useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';

// ── Konfigurasi Partikel berdasarkan mode ──────────────────────────────────
function buildParticleOptions(isDark: boolean): ISourceOptions {
    return {
        fullScreen: { enable: false },
        background: { color: { value: 'transparent' } },
        fpsLimit: 60,
        interactivity: {
            events: {
                onHover: { enable: true, mode: ['grab', 'bubble'] },
            },
            modes: {
                grab: { distance: 180, links: { opacity: isDark ? 0.6 : 0.4 } },
                bubble: { distance: 120, size: 6, opacity: 0.9, duration: 0.4 },
            },
        },
        particles: {
            color: {
                value: isDark
                    ? ['#818cf8', '#6366f1', '#a78bfa', '#34d399']
                    : ['#4f46e5', '#7c3aed', '#0ea5e9', '#059669'],
            },
            links: {
                enable: true,
                color: isDark ? '#6366f1' : '#4f46e5',
                distance: 140,
                opacity: isDark ? 0.15 : 0.2,
                width: 1,
            },
            move: {
                enable: true,
                speed: 0.5,
                direction: 'none',
                random: true,
                straight: false,
                outModes: { default: 'out' },
            },
            number: { value: 70, density: { enable: true } },
            opacity: {
                value: isDark ? { min: 0.2, max: 0.6 } : { min: 0.3, max: 0.7 },
                animation: { enable: true, speed: 0.8, sync: false },
            },
            shape: { type: 'circle' },
            size: { value: { min: 1, max: 3 } },
        },
        detectRetina: true,
    };
}

// ── Komponen konten utama ──────────────────────────────────────────────────
function AuthContent({
    title,
    description,
    isDark,
    children,
}: {
    title?: string;
    description?: string;
    isDark: boolean;
    children: React.ReactNode;
}) {
    // Warna token berdasar mode
    const bg         = isDark ? 'bg-[#07091a]'     : 'bg-slate-100';
    const textColor  = isDark ? 'text-slate-100'   : 'text-slate-900';
    const headingCls = isDark ? 'text-white'        : 'text-slate-900';
    const descCls    = isDark ? 'text-slate-400'    : 'text-slate-500';
    const footerCls  = isDark ? 'text-slate-600'    : 'text-slate-400';
    const cardBg     = isDark ? 'bg-white/5'        : 'bg-white/70';
    const cardBorder = isDark ? 'border-white/10'   : 'border-slate-200/80';
    const shimmer    = isDark
        ? 'from-transparent via-indigo-400/70 to-transparent'
        : 'from-transparent via-indigo-300/80 to-transparent';
    const logoText   = isDark ? 'text-white'        : 'text-slate-800';
    const orb1       = isDark ? 'bg-indigo-700/30'  : 'bg-indigo-400/20';
    const orb2       = isDark ? 'bg-violet-600/25'  : 'bg-violet-400/20';
    const orb3       = isDark ? 'bg-emerald-500/12' : 'bg-sky-400/15';

    return (
        <div className={`relative min-h-screen w-full overflow-hidden ${bg} ${textColor} font-sans transition-colors duration-500`}>

            {/* ── Ambient Glow Orbs ── */}
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className={`absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full ${orb1} blur-[160px]`} />
                <div className={`absolute -bottom-48 -right-32 h-[700px] w-[700px] rounded-full ${orb2} blur-[180px]`} />
                <div className={`absolute left-[40%] top-[25%] h-72 w-72 rounded-full ${orb3} blur-[120px]`} />
            </div>

            {/* ── tsParticles ── */}
            <Particles
                id="auth-particles"
                key={isDark ? 'dark' : 'light'}
                className="absolute inset-0 z-0"
                style={{ width: '100%', height: '100%' }}
                options={buildParticleOptions(isDark)}
            />

            {/* ── Main Content ── */}
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">

                    {/* Logo */}
                    <div className="mb-8 flex flex-col items-center gap-3">
                        <Link href="/" className="group flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/40 transition-all duration-300 group-hover:scale-110 group-hover:shadow-indigo-500/60">
                                <AppLogoIcon className="h-7 w-7 fill-current text-white" />
                            </div>
                            <span className={`text-2xl font-bold tracking-tight drop-shadow-sm ${logoText}`}>
                                Tokona
                            </span>
                        </Link>
                        <div className="h-px w-20 bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
                    </div>

                    {/* Glass Card */}
                    <div className={`relative overflow-hidden rounded-2xl border ${cardBorder} ${cardBg} shadow-2xl backdrop-blur-2xl`}>
                        <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${shimmer}`} />

                        <div className="p-8">
                            {(title || description) && (
                                <div className="mb-7 text-center">
                                    {title && (
                                        <h1 className={`text-2xl font-bold tracking-tight ${headingCls}`}>
                                            {title}
                                        </h1>
                                    )}
                                    {description && (
                                        <p className={`mt-2 text-sm leading-relaxed ${descCls}`}>
                                            {description}
                                        </p>
                                    )}
                                </div>
                            )}
                            {children}
                        </div>
                    </div>

                    <p className={`mt-8 text-center text-xs ${footerCls}`}>
                        &copy; {new Date().getFullYear()} Tokona Platform &mdash; All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── Layout utama ───────────────────────────────────────────────────────────
export default function AuthAntigravityLayout({
    title,
    description,
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    // Deteksi preferensi sistem
    const getPreference = () =>
        typeof window !== 'undefined'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
            : true;

    const [isDark, setIsDark] = useState<boolean>(getPreference);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);

        mq.addEventListener('change', handler);

        return () => mq.removeEventListener('change', handler);
    }, []);

    // Sinkronisasi class dark ke <html> agar Tailwind ikut
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    const initParticles = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    return (
        <ParticlesProvider init={initParticles}>
            <Head title={title} />
            <AuthContent title={title} description={description} isDark={isDark}>
                {children}
            </AuthContent>
        </ParticlesProvider>
    );
}
