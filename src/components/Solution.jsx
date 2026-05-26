import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ShieldCheck, Percent, Activity, Lock } from 'lucide-react';

export default function Solution() {
  const [activePillar, setActivePillar] = useState(0);

  const pillars = [
    {
      title: "Visual Code-Free",
      tag: "TradingView Embebido",
      desc: "Haz backtesting profesional con un clic, directamente sobre los gráficos de TradingView que ya conoces, sin escribir una sola línea de código en Pine Script o Python.",
      icon: <Eye className="w-5 h-5" />,
      visualType: "chart"
    },
    {
      title: "Risk Gatekeeper",
      tag: "Filtro Operativo API",
      desc: "Nuestra plataforma no es un diario pasivo. Se conecta vía API a tu bróker (Tradovate, MT5, cTrader, Rithmic) y bloquea físicamente tu botón de compra/venta si violas tus límites de riesgo. No más trading de venganza.",
      icon: <ShieldCheck className="w-5 h-5" />,
      visualType: "gatekeeper"
    },
    {
      title: "Calculador de Drawdown",
      tag: "Compliance de Prop Firms",
      desc: "Visualiza en tiempo real sobre tu gráfico de trading la distancia exacta a tu umbral de liquidación absoluto bajo la regla asimétrica del Intraday Trailing Drawdown.",
      icon: <Percent className="w-5 h-5" />,
      visualType: "drawdown"
    },
    {
      title: "Dashboard de Atleta",
      tag: "Score de Disciplina Real",
      desc: "Automatización inteligente que cruza tus datos técnicos con registros emocionales para darte tu Restricted Profit Factor: lo que realmente ganas cuando sigues tu plan.",
      icon: <Activity className="w-5 h-5" />,
      visualType: "athlete"
    }
  ];

  return (
    <section className="relative w-full py-28 px-6 bg-gradient-to-b from-black-abs via-zinc-950/70 to-black-abs overflow-hidden">
      {/* Glow superior verde esmeralda */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-accent-green/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col gap-16">
        
        {/* Cabecera */}
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent-green/10 border border-accent-green/20 text-xs font-bold text-accent-green uppercase tracking-wider">
            La Solución Todo-en-Uno
          </span>
          <h2 className="font-title font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
            El Ecosistema Unificado que protege tu capital.
          </h2>
          <p className="font-body text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md">
            Unificamos análisis, simulación, riesgo y diario en una sola terminal ejecutiva blindada.
          </p>
        </div>

        {/* LAYOUT DE PILARES INTERACTIVOS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LADO IZQUIERDO: SELECTOR DE PILARES */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {pillars.map((p, idx) => {
              const isActive = activePillar === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActivePillar(idx)}
                  className={`w-full text-left rounded-2xl p-5 border text-zinc-400 transition-all duration-300 flex items-start gap-4 ${isActive ? 'bg-zinc-950/60 border-accent-green/20 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'bg-transparent border-white/5 hover:border-white/10 hover:text-zinc-200'}`}
                >
                  <div className={`p-2.5 rounded-xl border transition-colors duration-300 ${isActive ? 'bg-accent-green/10 border-accent-green/30 text-accent-green' : 'bg-white/5 border-white/10'}`}>
                    {p.icon}
                  </div>
                  <div>
                    <span className={`block text-[9px] font-extrabold uppercase tracking-wider mb-1 ${isActive ? 'text-accent-green' : 'text-zinc-500'}`}>
                      {p.tag}
                    </span>
                    <h3 className="font-title font-bold text-base tracking-tight mb-1">{p.title}</h3>
                    <p className={`font-body text-xs leading-relaxed transition-opacity ${isActive ? 'opacity-100 text-zinc-300' : 'opacity-60'}`}>
                      {p.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* LADO DERECHO: PANTALLA VIRTUAL 3D REACTIVA */}
          <div className="lg:col-span-7 h-[420px] w-full relative" style={{ perspective: 1000 }}>
            <motion.div
              initial={{ rotateX: 10, rotateY: -10, scale: 0.95 }}
              animate={{ rotateX: 12, rotateY: -12, scale: 1 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl shadow-2xl p-6 overflow-hidden flex flex-col justify-between"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Cabecera de la terminal */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-green shadow-[0_0_6px_var(--accent-green)]" />
                  <span className="font-title font-bold text-[10px] uppercase tracking-widest text-zinc-400">
                    Terminal Unificada Activa
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white/10" />
                  <span className="w-2 h-2 rounded-full bg-white/10" />
                  <span className="w-2 h-2 rounded-full bg-white/10" />
                </div>
              </div>

              {/* CONTENIDOS REACTIVOS SEGÚN PILAR SELECCIONADO */}
              <div className="flex-grow flex items-center justify-center p-4 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  
                  {/* PILAR 1: CHART */}
                  {activePillar === 0 && (
                    <motion.div
                      key="p-chart"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full flex flex-col justify-center"
                    >
                      <svg className="w-full h-44 overflow-visible" viewBox="0 0 400 150">
                        <path d="M 10 120 C 80 100, 120 40, 200 30 C 280 20, 320 60, 390 10" fill="none" stroke="var(--accent-green)" strokeWidth="3" style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.5))" }} />
                        <circle cx="200" cy="30" r="4" fill="#000" stroke="var(--accent-green)" strokeWidth="2" />
                        <circle cx="390" cy="10" r="5" fill="var(--accent-green)" />
                      </svg>
                      <div className="text-center mt-3 text-[10px] font-bold text-accent-green uppercase tracking-widest">
                        Backtesting Visual sin Código en Tiempo Real
                      </div>
                    </motion.div>
                  )}

                  {/* PILAR 2: GATEKEEPER */}
                  {activePillar === 1 && (
                    <motion.div
                      key="p-gatekeeper"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="w-full max-w-sm border border-accent-red/20 bg-accent-red/5 rounded-2xl p-5 flex flex-col items-center text-center gap-3"
                    >
                      <div className="p-3 rounded-full bg-accent-red/10 text-accent-red alarm-blink-red">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h4 className="font-title font-extrabold text-sm text-white uppercase tracking-wider">
                        Risk Gatekeeper: Acceso Bloqueado
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-body leading-relaxed max-w-[280px]">
                        Has alcanzado tu límite de pérdida diaria permitida (-$1,000). La API del broker ha desactivado físicamente el botón de compra para prevenir el trading de venganza.
                      </p>
                      <div className="w-full bg-white/5 border border-white/5 py-1 px-3 rounded-lg text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                        Terminal: MT5 / Tradovate Desactivada
                      </div>
                    </motion.div>
                  )}

                  {/* PILAR 3: DRAWDOWN */}
                  {activePillar === 2 && (
                    <motion.div
                      key="p-drawdown"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full flex flex-col justify-center gap-4"
                    >
                      <div className="grid grid-cols-2 gap-3 text-left">
                        <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                          <span className="block text-[8px] font-bold text-zinc-500 uppercase">Equity Peak</span>
                          <span className="block text-lg font-title font-extrabold text-white">$52,400</span>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-3 rounded-xl border-accent-red/25">
                          <span className="block text-[8px] font-bold text-accent-red uppercase">Trailing Drawdown</span>
                          <span className="block text-lg font-title font-extrabold text-accent-red">$50,400</span>
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="block text-[8px] font-bold text-zinc-500 uppercase">Distancia al Umbral</span>
                          <span className="block text-lg font-title font-extrabold text-accent-gold">$1,200</span>
                        </div>
                        <div className="text-[10px] font-bold text-accent-gold uppercase bg-accent-gold/10 px-3 py-1 rounded-full border border-accent-gold/25 alarm-blink-red">
                          Zona de Peligro (Cerca del 10%)
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* PILAR 4: ATHLETE */}
                  {activePillar === 3 && (
                    <motion.div
                      key="p-athlete"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full flex flex-col justify-center gap-3"
                    >
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white/5 border border-white/5 p-2 rounded-lg text-center">
                          <span className="block text-[8px] font-bold text-zinc-500 uppercase">Score Disciplina</span>
                          <span className="block text-sm font-title font-extrabold text-accent-green">94%</span>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-2 rounded-lg text-center">
                          <span className="block text-[8px] font-bold text-zinc-500 uppercase">Restricted PF</span>
                          <span className="block text-sm font-title font-extrabold text-accent-green">1.82</span>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-2 rounded-lg text-center">
                          <span className="block text-[8px] font-bold text-zinc-500 uppercase">Rachas</span>
                          <span className="block text-sm font-title font-extrabold text-accent-green">+5 W</span>
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-3 rounded-lg text-left">
                        <span className="block text-[8px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Diagnóstico Psicotécnico de ReefReplay AI</span>
                        <p className="text-[9px] text-zinc-300 leading-normal">
                          "Mantienes un win rate del 74% cuando completas el checklist pre-trade. Sin embargo, tu emoción 'ANSIA' disminuye tu RR promedio a 1.2R debido a salidas prematuras."
                        </p>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Pie de la terminal */}
              <div className="border-t border-white/5 pt-4 flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-zinc-600">
                <span>Secure local storage • Client-side API</span>
                <span>ReefReplay v2.0 Elite</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
