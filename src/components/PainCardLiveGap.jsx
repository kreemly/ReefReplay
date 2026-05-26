import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

export default function PainCardLiveGap() {
  const [isHovered, setIsHovered] = useState(false);

  // SVG Paths
  // Curva teórica alcista impecable
  const pathPlanned = "M 30 200 C 120 180, 180 120, 280 90 C 350 70, 420 45, 470 30";
  
  // Curva de realidad destructiva (sigue igual al inicio y luego se quiebra de forma temblorosa)
  const pathReal = "M 30 200 C 120 180, 180 120, 280 90 L 310 140 L 330 115 L 360 185 L 385 160 L 420 215 L 445 190 L 470 230";

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full max-w-lg mx-auto overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/40 p-6 backdrop-blur-xl shadow-3d-neon-blue transition-colors duration-500 hover:border-accent-red/20 group"
      style={{
        background: "linear-gradient(180deg, rgba(15, 20, 32, 0.4) 0%, rgba(5, 7, 12, 0.4) 100%)"
      }}
    >
      {/* Glow superior sutil */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent ${isHovered ? 'via-accent-red' : 'via-accent-green'} to-transparent blur-md transition-colors duration-500`} />

      <div className="flex justify-between items-start mb-6">
        <div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors duration-500 ${isHovered ? 'bg-accent-red/10 border-accent-red/25 text-accent-red' : 'bg-accent-green/10 border-accent-green/25 text-accent-green'}`}>
            {isHovered ? (
              <>
                <TrendingDown className="w-3.5 h-3.5" />
                Realidad Live
              </>
            ) : (
              <>
                <TrendingUp className="w-3.5 h-3.5" />
                Mito en Papel
              </>
            )}
          </span>
          <h3 className="font-title font-extrabold text-xl mt-3 text-white tracking-tight">
            El "Backtest-to-Live" Gap
          </h3>
          <p className="text-zinc-400 text-xs mt-1 font-body leading-relaxed max-w-sm">
            Pasa el mouse para contrastar la simulación teórica contra la dura realidad del spread y el slippage real.
          </p>
        </div>
        
        <div className={`p-2.5 rounded-xl border transition-all duration-500 ${isHovered ? 'bg-accent-red/10 border-accent-red/20 text-accent-red shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'bg-white/5 border-white/10 text-zinc-400'}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      {/* VISOR DE GRÁFICA VECTORIAL INTERACTIVA */}
      <div className="relative h-60 w-full bg-black/60 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center p-2 shadow-inner">
        {/* Rejilla de Fondo */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-5">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="border-t border-l border-white" />
          ))}
        </div>

        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 250">
          <defs>
            <linearGradient id="green-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="red-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Relleno inferior con gradiente animado */}
          <motion.path
            d={isHovered ? `${pathReal} L 470 250 L 30 250 Z` : `${pathPlanned} L 470 250 L 30 250 Z`}
            animate={{ d: isHovered ? `${pathReal} L 470 250 L 30 250 Z` : `${pathPlanned} L 470 250 L 30 250 Z` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            fill={isHovered ? "url(#red-glow)" : "url(#green-glow)"}
            className="opacity-75"
          />

          {/* Trazado de la curva principal (Interpolación fluida SVG) */}
          <motion.path
            d={isHovered ? pathReal : pathPlanned}
            animate={{ d: isHovered ? pathReal : pathPlanned }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            stroke={isHovered ? "#f43f5e" : "#10b981"}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            style={{
              filter: isHovered 
                ? "drop-shadow(0 0 8px rgba(244,63,94,0.5))" 
                : "drop-shadow(0 0 8px rgba(16,185,129,0.5))"
            }}
          />

          {/* Nodos en Y de quiebre (Solo visibles en hover) */}
          <AnimatePresence>
            {isHovered && (
              <>
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  cx="280" cy="90" r="5"
                  fill="#000" stroke="#f43f5e" strokeWidth="2"
                />
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  cx="360" cy="185" r="5"
                  fill="#000" stroke="#f43f5e" strokeWidth="2"
                />
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  cx="470" cy="230" r="6"
                  fill="#f43f5e"
                  style={{ filter: "drop-shadow(0 0 5px #f43f5e)" }}
                />
              </>
            )}
          </AnimatePresence>
        </svg>

        {/* CARTELITOS FLOTANTES DE ALERTA (DOLOR #2) */}
        <AnimatePresence>
          {isHovered && (
            <>
              {/* Popup 1: Slippage */}
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.9 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="absolute top-16 right-20 bg-zinc-950/80 border border-accent-red/30 rounded-xl px-3 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(244,63,94,0.15)] flex items-center gap-1.5 text-[10px] font-bold text-accent-red uppercase tracking-wider"
              >
                <span className="w-2 h-2 rounded-full bg-accent-red alarm-blink-red" />
                Slippage detectado (-45%)
              </motion.div>

              {/* Popup 2: Spreads */}
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.9 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                className="absolute bottom-16 right-4 bg-zinc-950/80 border border-accent-red/30 rounded-xl px-3 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(244,63,94,0.15)] flex items-center gap-1.5 text-[10px] font-bold text-accent-red uppercase tracking-wider"
              >
                <span className="w-2 h-2 rounded-full bg-accent-red alarm-blink-red" />
                Spreads Variables drenando capital
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Leyenda interna flotante */}
        <div className="absolute bottom-3 left-4 flex gap-3 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-accent-green" />
            <span>Teórico</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-accent-red" />
            <span>Real</span>
          </div>
        </div>
      </div>

      {/* TEXTO COMPARATIVO MITO VS REALIDAD */}
      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/5 pt-4 text-xs font-body leading-relaxed">
        <div>
          <span className="block text-[9px] font-extrabold uppercase text-zinc-500 tracking-wider mb-1">Mito en Papel</span>
          <p className="text-zinc-300 font-medium">
            Tu backtesting te muestra una curva de equidad limpia y ganancias perfectas.
          </p>
        </div>
        <div className="border-l border-white/5 pl-4">
          <span className="block text-[9px] font-extrabold uppercase text-accent-red tracking-wider mb-1">Realidad en Vivo</span>
          <p className="text-zinc-300 font-medium">
            Slippages severos, spreads y comisiones acumuladas erosionan tus márgenes reales.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
