import React, { useState } from 'react';
import Hero from './components/Hero';
import Stats from './components/Stats';
import PainMap from './components/PainMap';
import Solution from './components/Solution';
import Pricing from './components/Pricing';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { ArrowUpRight } from 'lucide-react';

export default function App() {
  const [viewState, setViewState] = useState('landing'); // landing, auth, dashboard
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setViewState('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setViewState('landing');
  };

  // RENDER SECCIÓN: AUTHENTICATION
  if (viewState === 'auth') {
    return <Auth onLogin={handleLogin} onBackToLanding={() => setViewState('landing')} />;
  }

  // RENDER SECCIÓN: DASHBOARD INTERNO
  if (viewState === 'dashboard') {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // RENDER SECCIÓN: LANDING PAGE DE MARKETING
  return (
    <div className="relative min-h-screen w-full bg-black-abs text-slate-100 flex flex-col justify-between selection:bg-accent-purple/30 selection:text-white">
      
      {/* HEADER / NAVIGATION BAR */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black-abs/45 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setViewState('landing')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center font-title font-extrabold text-white text-base shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-transform duration-300 group-hover:rotate-6">
              RR
            </div>
            <span className="font-title font-extrabold text-lg text-white tracking-tight">
              Reef<span className="bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-fill-transparent text-transparent">Replay</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green alarm-blink-red" />
          </div>

          {/* Desktop Navigation Link Toggles */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-title font-bold uppercase tracking-widest text-zinc-500">
            <a href="#hero" className="hover:text-white transition-colors">El Héroe</a>
            <a href="#dolores" className="hover:text-white transition-colors">Mapa del Sufrimiento</a>
            <a href="#solucion" className="hover:text-white transition-colors">Solución</a>
            <a href="#precios" className="hover:text-white transition-colors">Precios SaaS</a>
          </nav>

          {/* CTA Premium Trigger Button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setViewState('auth')}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-title font-bold uppercase tracking-widest text-accent-blue hover:text-white transition-colors"
            >
              Iniciar Consola
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setViewState('auth')}
              className="px-4 py-2 rounded-xl bg-white text-black font-title font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors shadow-lg active:scale-95"
            >
              Cerrar Brecha
            </button>
          </div>

        </div>
      </header>

      {/* SECCIONES DE LA LANDING PAGE */}
      <main className="w-full flex-grow pt-16">
        
        {/* Hero - El Despertar Brutal */}
        <div id="hero">
          <Hero onCta={() => setViewState('auth')} />
        </div>

        {/* Social Proof - Contadores */}
        <Stats />

        {/* Mapa de Dolores - Bento Grid & PainCardLiveGap */}
        <div id="dolores">
          <PainMap />
        </div>

        {/* Solución - Integración Verde Esmeralda & Terminal Mockup */}
        <div id="solucion">
          <Solution />
        </div>

        {/* Modelo de Negocio - SaaS Tiers */}
        <div id="precios">
          <Pricing onCta={() => setViewState('auth')} />
        </div>

      </main>

      {/* FOOTER CYBER-MINIMALIST APPLE/STRIPE */}
      <footer className="w-full bg-black-abs border-t border-white/5 py-12 px-6 text-zinc-600 text-xs font-body">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="font-title font-extrabold text-sm text-zinc-400">
              Reef<span className="text-zinc-600">Replay</span> Elite
            </span>
            <span className="w-[1px] h-3 bg-white/10" />
            <span>© 2026 ReefReplay Inc. Todos los derechos reservados de propiedad.</span>
          </div>

          <div className="flex gap-6 uppercase tracking-widest font-title font-bold text-[10px] text-zinc-500">
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Términos de Uso</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Acuerdo de Licencia</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
