import React, { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { TrendingUp, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export default function Hero({ onCta }) {
  const [isBroken, setIsBroken] = useState(false);
  const controls = useAnimation();

  // Curva verde impecable teórica del backtest
  const pathPlanned = "M 20 180 Q 150 140 250 80 T 480 30";
  
  // Curva quebrada roja del colapso del mercado real
  const pathReal = "M 20 180 Q 150 140 250 80 L 290 150 L 330 110 L 370 210 L 410 170 L 480 230";

  useEffect(() => {
    // Animación de auto-corte de realidad a los 1.5 segundos de cargar la página
    const timer = setTimeout(async () => {
      // 1. Efecto vibración tridimensional (shake)
      await controls.start({
        x: [0, -8, 8, -6, 6, -4, 4, 0],
        y: [0, 4, -4, 3, -3, 2, -2, 0],
        transition: { duration: 0.5, ease: "easeInOut" }
      });
      // 2. Quebrar la curva a rojo
      setIsBroken(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, [controls]);

  return (
    <section className="relative w-full min-h-screen bg-black-abs overflow-hidden flex flex-col justify-center items-center px-6 py-20 text-center">
      {/* Glows decorativos de fondo */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-accent-blue/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-accent-purple/5 rounded-full blur-[140px] pointer-events-none" />

      {/* CONTENEDOR HERO TEXT */}
      <div className="relative z-10 max-w-4xl flex flex-col items-center gap-6">
        
        {/* Badge premium superior */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-inner text-xs font-bold text-zinc-400 tracking-wide uppercase"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
          Plataforma de Trading Unificada • Edición 2026
        </motion.div>

        {/* Título principal estilo Apple/Stripe */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="font-title font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-white leading-[1.1] max-w-3xl"
        >
          La brecha entre <span className="bg-gradient-to-r from-accent-blue via-accent-purple to-accent-gold bg-clip-text text-fill-transparent text-transparent">"esto se ve bien"</span> y <span className="bg-gradient-to-r from-accent-red to-rose-400 bg-clip-text text-fill-transparent text-transparent">"esto funciona"</span> drena tu dinero.
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          className="font-body text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed"
        >
          Hacer backtesting en 2026 ya no es un problema de encontrar señales; es un problema de fragmentación administrativa, datos de baja calidad y colapso psicológico en vivo. Deja de operar a ciegas.
        </motion.p>

        {/* CTA Premium Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-4"
        >
          <button 
            onClick={onCta}
            className="relative group overflow-hidden px-8 py-4 rounded-2xl font-title font-bold text-sm tracking-wide uppercase transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(168,85,247,0.25)] border border-accent-purple/30 bg-black text-white"
          >
            {/* Brillo de fondo con gradiente */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent-blue to-accent-purple opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {/* Brillo interno sutil de vidrio */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            
            <span className="relative z-10 flex items-center gap-2">
              Cerrar la Brecha Gratis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </motion.div>
      </div>

      {/* VISUAL 3D / SVG DUAL DE EQUIDAD CON PERSPECTIVA */}
      <motion.div
        animate={controls}
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="relative mt-20 w-full max-w-3xl aspect-[2/1] rounded-3xl border border-white/5 bg-zinc-950/20 backdrop-blur-xl shadow-2xl overflow-hidden p-6 cursor-pointer"
        style={{
          transform: "perspective(1000px) rotateX(15deg) rotateY(-5deg) rotateZ(0deg)",
          transformStyle: "preserve-3d"
        }}
      >
        {/* Rejilla futurista de fondo */}
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-[0.03]">
          {Array.from({ length: 72 }).map((_, i) => (
            <div key={i} className="border-t border-l border-white" />
          ))}
        </div>

        {/* Indicador de estado neón superior */}
        <div className="flex justify-between items-center relative z-10 border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isBroken ? 'bg-accent-red alarm-blink-red' : 'bg-accent-green'} transition-colors duration-500`} />
            <span className="font-title font-bold text-xs uppercase tracking-widest text-zinc-400">
              {isBroken ? 'Simulación en Vivo Degradada' : 'Simulación de Backtest Teórica'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-extrabold text-zinc-600 uppercase tracking-widest">
              XAUUSD 15M
            </span>
          </div>
        </div>

        {/* El Gráfico SVG de la curva de equidad con transición de color y forma */}
        <div className="w-full h-[75%] relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 250">
            <defs>
              <linearGradient id="glow-planned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="glow-broken" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Relleno inferior */}
            <motion.path
              d={isBroken ? `${pathReal} L 480 250 L 20 250 Z` : `${pathPlanned} L 480 250 L 20 250 Z`}
              animate={{ d: isBroken ? `${pathReal} L 480 250 L 20 250 Z` : `${pathPlanned} L 480 250 L 20 250 Z` }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              fill={isBroken ? "url(#glow-broken)" : "url(#glow-planned)"}
            />

            {/* Línea de Curva Principal */}
            <motion.path
              d={isBroken ? pathReal : pathPlanned}
              animate={{ d: isBroken ? pathReal : pathPlanned }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              stroke={isBroken ? "#f43f5e" : "#10b981"}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              style={{
                filter: isBroken 
                  ? "drop-shadow(0 0 10px rgba(244,63,94,0.6))" 
                  : "drop-shadow(0 0 10px rgba(16,185,129,0.6))"
              }}
            />

            {/* Puntos de colapso en el gráfico */}
            {isBroken && (
              <>
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  cx="250" cy="80" r="6"
                  fill="#fff" stroke="#f43f5e" strokeWidth="2.5"
                />
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  cx="370" cy="210" r="5"
                  fill="#000" stroke="#f43f5e" strokeWidth="2"
                />
              </>
            )}
          </svg>

          {/* Carteles flotantes en el colapso real */}
          <AnimatePresence>
            {isBroken && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute top-1/3 right-1/4 bg-zinc-950/90 border border-accent-red/30 rounded-2xl px-4 py-2.5 backdrop-blur-md shadow-[0_0_20px_rgba(244,63,94,0.2)] flex items-center gap-2"
              >
                <div className="p-1 rounded bg-accent-red/10 text-accent-red">
                  <ShieldAlert className="w-4 h-4 alarm-blink-red" />
                </div>
                <div className="text-left">
                  <span className="block text-[9px] font-extrabold uppercase text-zinc-500 tracking-wider">Brecha Detectada</span>
                  <span className="block text-xs font-bold text-white">FOMO + revenge trading (-3.5R)</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Leyenda inferior */}
        <div className="absolute bottom-5 left-6 flex gap-4 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-0.5 bg-accent-green" />
            <span>Mito (Teórico)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-0.5 bg-accent-red" />
            <span>Realidad (Ejecutado)</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
