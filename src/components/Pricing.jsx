import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Shield, Sparkles } from 'lucide-react';

export default function Pricing({ onCta }) {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "para siempre",
      desc: "Ideal para traders principiantes que quieren registrar su bitácora técnica básica sin costes.",
      features: [
        { text: "Diario técnico básico ilimitado", checked: true },
        { text: "Límite de 50 trades mensuales", checked: true },
        { text: "Gráficos SVG sencillos", checked: true },
        { text: "Planificador de sesión restrictivo", checked: false },
        { text: "Fricción y spreads variables", checked: false },
        { text: "Prop Firm Guardian (Trailing DD)", checked: false },
        { text: "Diagnóstico Reef Coach AI", checked: false }
      ],
      popular: false,
      btnText: "Iniciar Gratis",
      btnClass: "bg-white/5 hover:bg-white/10 text-white border-white/10"
    },
    {
      name: "Pro",
      price: "$49",
      period: "/mes",
      desc: "Desbloquea la potencia analítica de backtesting, simulador de spreads y conexión a broker.",
      features: [
        { text: "Trades y diario ILIMITADOS", checked: true },
        { text: "Planificador pre-sesión completo", checked: true },
        { text: "Terminal & Broker (MT5/cTrader)", checked: true },
        { text: "Simulador de Spreads y Slippages", checked: true },
        { text: "Datos históricos de alta calidad", checked: true },
        { text: "Prop Firm Guardian (Trailing DD)", checked: false },
        { text: "Diagnóstico Reef Coach AI", checked: false }
      ],
      popular: true,
      btnText: "Obtener Pro",
      btnClass: "bg-gradient-to-r from-accent-blue to-accent-purple text-white border-transparent shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105"
    },
    {
      name: "Elite",
      price: "$99",
      period: "/mes",
      desc: "La estación ejecutiva definitiva. Auditorías psicológicas y blindaje completo de Prop Firms.",
      features: [
        { text: "Todos los features Pro incluidos", checked: true },
        { text: "Prop Firm Trailing DD Guardian", checked: true },
        { text: "Disyuntor de Emergencia (API lock)", checked: true },
        { text: "Reef Coach AI ilimitado en vivo", checked: true },
        { text: "Análisis psicológico y de fugas", checked: true },
        { text: "Conexión Prop Firm (Rithmic)", checked: true },
        { text: "Soporte cuantitativo 24/7", checked: true }
      ],
      popular: false,
      btnText: "Obtener Elite",
      btnClass: "bg-white text-black border-transparent hover:bg-zinc-200"
    }
  ];

  return (
    <section className="relative w-full bg-black-abs py-24 px-6 overflow-hidden border-t border-white/5">
      {/* Glow de fondo */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-accent-purple/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col gap-16">
        
        {/* Cabecera */}
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Suscripción SaaS Simple
          </span>
          <h2 className="font-title font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
            Consolida tus herramientas. Ahorra capital.
          </h2>
          <p className="font-body text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md">
            Al consolidar tus suscripciones aisladas en ReefReplay, ahorras más de $115 mensuales y blindas tus cuentas de fondeo.
          </p>
        </div>

        {/* REJILLA DE PRECIOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {tiers.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className={`relative rounded-3xl border p-8 bg-zinc-950/20 backdrop-blur-xl flex flex-col justify-between gap-8 transition-colors duration-500 hover:border-white/10 shadow-3d ${t.popular ? 'border-accent-purple/40 shadow-3d-neon-purple/5' : 'border-white/5'}`}
            >
              {t.popular && (
                <div className="absolute top-0 right-8 -translate-y-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple text-[9px] font-extrabold uppercase tracking-widest text-white shadow-lg">
                  <Sparkles className="w-2.5 h-2.5" />
                  Más popular
                </div>
              )}

              <div className="flex flex-col gap-4">
                <span className="font-title font-black text-sm uppercase tracking-widest text-zinc-500">
                  {t.name}
                </span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="font-title font-extrabold text-4xl text-white">{t.price}</span>
                  <span className="text-zinc-500 font-medium text-xs uppercase tracking-widest">{t.period}</span>
                </div>
                <p className="text-zinc-400 text-xs font-body leading-relaxed mt-2">
                  {t.desc}
                </p>

                {/* Separador */}
                <div className="h-[1px] bg-white/5 my-2" />

                {/* Lista de Features */}
                <ul className="flex flex-col gap-3 text-xs font-body">
                  {t.features.map((f, fIdx) => (
                    <li key={fIdx} className={`flex items-center gap-2.5 ${f.checked ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      {f.checked ? (
                        <Check className="w-4 h-4 text-accent-green flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-zinc-700 flex-shrink-0" />
                      )}
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botón de Acción */}
              <button 
                onClick={onCta}
                className={`w-full py-3.5 px-6 rounded-2xl border font-title font-bold text-xs tracking-wider uppercase transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 ${t.btnClass}`}
              >
                {t.popular && <Shield className="w-4 h-4 text-white" />}
                {t.btnText}
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
