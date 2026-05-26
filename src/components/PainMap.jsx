import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Database, HeartPulse, Calendar, Target, Code2, AlertCircle } from 'lucide-react';
import PainCardLiveGap from './PainCardLiveGap';

export default function PainMap() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section className="relative w-full bg-black-abs py-24 px-6 overflow-hidden">
      {/* Glows laterales */}
      <div className="absolute top-1/3 left-0 w-80 h-96 bg-accent-red/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 w-80 h-96 bg-accent-red/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col items-center gap-16 relative z-10">
        
        {/* Cabecera de la Sección */}
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent-red/10 border border-accent-red/20 text-xs font-bold text-accent-red uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5 alarm-blink-red" />
            El Mapa del Sufrimiento
          </span>
          <h2 className="font-title font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
            Los 7 dolores que destruyen tus cuentas minoristas.
          </h2>
          <p className="font-body text-zinc-400 text-xs sm:text-sm max-w-lg leading-relaxed">
            Hacer scroll ilumina la cruda realidad operativa en 2026. Haz hover en las tarjetas para desenmascarar el mito.
          </p>
        </div>

        {/* BENTO GRID DE DOLORES */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          
          {/* DOLOR #1: FRAGMENTACIÓN */}
          <motion.div
            variants={cardVariants}
            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/20 p-6 backdrop-blur-xl flex flex-col justify-between gap-8 shadow-3d-neon-red/5 hover:border-accent-red/35 transition-all duration-500"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-title font-black text-4xl text-white/10 group-hover:text-accent-red/20 transition-colors duration-500">01</span>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 group-hover:text-accent-red group-hover:border-accent-red/20 transition-all duration-500">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-title font-extrabold text-lg text-white group-hover:text-accent-red transition-colors">
                Fragmentación Tecnológica
              </h3>
              <p className="text-zinc-400 font-body text-xs leading-relaxed mt-2">
                Analizas en TradingView, ejecutas en tu terminal bróker, anotas a mano en Excel y llevas tu psicología en Notion.
              </p>
            </div>
            
            {/* Visualización Dinámica de Datos Perdiéndose */}
            <div className="h-28 w-full bg-black/60 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-around px-4">
                <div className="text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded border border-white/5">TV</div>
                <div className="text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded border border-white/5">MetaTrader</div>
                <div className="text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded border border-white/5">Excel</div>
              </div>
              {/* Partículas SVG de datos goteando */}
              <svg className="absolute inset-0 w-full h-full">
                <motion.circle cx="80" cy="50" r="3" fill="#ef4444" animate={{ y: [0, 60], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} />
                <motion.circle cx="170" cy="50" r="3" fill="#ef4444" animate={{ y: [0, 60], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 0.5 }} />
              </svg>
              <div className="absolute bottom-2 text-[8px] font-bold text-accent-red uppercase tracking-widest">Fricción Intersistemas</div>
            </div>

            <div className="border-t border-white/5 pt-3 mt-2 text-[10px] font-body">
              <span className="block text-zinc-500 uppercase font-bold text-[8px] tracking-wider mb-0.5">Mito en papel</span>
              <p className="text-zinc-300">"Tengo todo bajo control en mis pestañas"</p>
              <span className="block text-accent-red uppercase font-bold text-[8px] tracking-wider mt-2 mb-0.5">Realidad en vivo</span>
              <p className="text-zinc-300">Operar con 4 mapas diferentes y sin brújula.</p>
            </div>
          </motion.div>

          {/* DOLOR #2: EL BACKTEST-TO-LIVE GAP (TARJETA ESTRELLA) */}
          <div className="lg:col-span-2">
            <PainCardLiveGap />
          </div>

          {/* DOLOR #3: DATOS DE MIERDA */}
          <motion.div
            variants={cardVariants}
            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/20 p-6 backdrop-blur-xl flex flex-col justify-between gap-8 hover:border-accent-red/35 transition-all duration-500"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-title font-black text-4xl text-white/10 group-hover:text-accent-red/20 transition-colors duration-500">03</span>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 group-hover:text-accent-red group-hover:border-accent-red/20 transition-all duration-500">
                  <Database className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-title font-extrabold text-lg text-white group-hover:text-accent-red transition-colors">
                Datos Basura de Brokers
              </h3>
              <p className="text-zinc-400 font-body text-xs leading-relaxed mt-2">
                Los datos gratuitos M1 de los brókeres son inexactos. Si tus datos históricos tienen un 90% de modelado, tus resultados son 100% ficticios.
              </p>
            </div>

            {/* Velas 3D Comparativas */}
            <div className="h-28 w-full bg-black/60 rounded-xl border border-white/5 relative flex items-center justify-around p-3">
              <div className="flex flex-col items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                <span className="text-[8px] text-zinc-500 uppercase tracking-wider font-bold">Datos M1</span>
                {/* Vela pixelada borrosa */}
                <div className="w-5 h-10 border border-dashed border-accent-red/50 bg-accent-red/10 flex items-center justify-center rounded">
                  <div className="w-1 h-14 bg-accent-red/50" />
                </div>
                <span className="text-[8px] text-accent-red font-bold">90% Falso</span>
              </div>
              <div className="w-[1px] h-12 bg-white/5" />
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[8px] text-accent-green uppercase tracking-wider font-bold">Tick Data 99%</span>
                {/* Vela ultra-nítida con destello */}
                <div className="w-5 h-10 border border-accent-green bg-accent-green/20 flex items-center justify-center rounded shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                  <div className="w-0.5 h-14 bg-accent-green" />
                </div>
                <span className="text-[8px] text-accent-green font-bold">99% Real</span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3 mt-2 text-[10px] font-body">
              <span className="block text-zinc-500 uppercase font-bold text-[8px] tracking-wider mb-0.5">Mito en papel</span>
              <p className="text-zinc-300">"Mi broker me da datos gratis para testear"</p>
              <span className="block text-accent-red uppercase font-bold text-[8px] tracking-wider mt-2 mb-0.5">Realidad en vivo</span>
              <p className="text-zinc-300">Decisiones reales tomadas con información del pasado alterada.</p>
            </div>
          </motion.div>

          {/* DOLOR #4: FACTOR PSICOLÓGICO */}
          <motion.div
            variants={cardVariants}
            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/20 p-6 backdrop-blur-xl flex flex-col justify-between gap-8 hover:border-accent-red/35 transition-all duration-500"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-title font-black text-4xl text-white/10 group-hover:text-accent-red/20 transition-colors duration-500">04</span>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 group-hover:text-accent-red group-hover:border-accent-red/20 transition-all duration-500">
                  <HeartPulse className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-title font-extrabold text-lg text-white group-hover:text-accent-red transition-colors">
                El Colapso Mental
              </h3>
              <p className="text-zinc-400 font-body text-xs leading-relaxed mt-2">
                En el backtest asumes que eres un robot. En vivo, el miedo a perder las ganancias acumuladas te fuerza a cerrar operaciones ganadoras antes de tiempo.
              </p>
            </div>

            {/* Cerebro 3D Palpitante SVG */}
            <div className="h-28 w-full bg-black/60 rounded-xl border border-white/5 relative flex items-center justify-center overflow-hidden">
              <svg className="w-16 h-16 text-accent-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <motion.path 
                  d="M9.5 2a3.5 3.5 0 0 1 3.5 3.5v.5h-7a3.5 3.5 0 0 1 3.5-3.5z M14.5 2a3.5 3.5 0 0 1 3.5 3.5v.5h-7a3.5 3.5 0 0 1 3.5-3.5z M4.5 8h15a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z M9 18a3 3 0 1 0-6 0c0 1.66 1.34 3 3 3h3v-3z M15 18a3 3 0 1 0 6 0c0 1.66-1.34 3-3 3h-3v-3z" 
                  animate={{ scale: [1, 1.12, 1], filter: ["drop-shadow(0 0 3px rgba(244,63,94,0.3))", "drop-shadow(0 0 10px rgba(244,63,94,0.7))", "drop-shadow(0 0 3px rgba(244,63,94,0.3))"] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                />
              </svg>
              <div className="absolute bottom-2 text-[8px] font-bold text-accent-red uppercase tracking-widest">Fuga Psicológica Activa (-2.5R)</div>
            </div>

            <div className="border-t border-white/5 pt-3 mt-2 text-[10px] font-body">
              <span className="block text-zinc-500 uppercase font-bold text-[8px] tracking-wider mb-0.5">Mito en papel</span>
              <p className="text-zinc-300">"Cumpliré mis reglas al 100% en vivo"</p>
              <span className="block text-accent-red uppercase font-bold text-[8px] tracking-wider mt-2 mb-0.5">Realidad en vivo</span>
              <p className="text-zinc-300">El miedo liquida tu cuenta antes que el precio.</p>
            </div>
          </motion.div>

          {/* DOLOR #5: CAOS PLANIFICACIÓN */}
          <motion.div
            variants={cardVariants}
            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/20 p-6 backdrop-blur-xl flex flex-col justify-between gap-8 hover:border-accent-red/35 transition-all duration-500"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-title font-black text-4xl text-white/10 group-hover:text-accent-red/20 transition-colors duration-500">05</span>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 group-hover:text-accent-red group-hover:border-accent-red/20 transition-all duration-500">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-title font-extrabold text-lg text-white group-hover:text-accent-red transition-colors">
                Improvisación Diaria
              </h3>
              <p className="text-zinc-400 font-body text-xs leading-relaxed mt-2">
                Sin un plan de sesión comprometido y enlazado a tu terminal, terminas tomando entradas al azar por aburrimiento o cayendo en venganza.
              </p>
            </div>

            {/* Agenda Destruyéndose SVG */}
            <div className="h-28 w-full bg-black/60 rounded-xl border border-white/5 relative flex items-center justify-center overflow-hidden">
              <svg className="w-14 h-14 text-accent-red/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" />
                <motion.path 
                  d="M12 19.253C13.168 18.477 14.754 18 16.5 18c1.747 0 3.332.477 4.5 1.253" 
                  animate={{ x: [0, 8, 0], opacity: [1, 0.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </svg>
              <div className="absolute bottom-2 text-[8px] font-bold text-accent-red uppercase tracking-widest">Sin Agenda Restrictiva</div>
            </div>

            <div className="border-t border-white/5 pt-3 mt-2 text-[10px] font-body">
              <span className="block text-zinc-500 uppercase font-bold text-[8px] tracking-wider mb-0.5">Mito en papel</span>
              <p className="text-zinc-300">"Tengo mis reglas anotadas en un PDF"</p>
              <span className="block text-accent-red uppercase font-bold text-[8px] tracking-wider mt-2 mb-0.5">Realidad en vivo</span>
              <p className="text-zinc-300">Al primer Stop Loss, rompes todas tus reglas.</p>
            </div>
          </motion.div>

          {/* DOLOR #6: TRAMPA DEL TRAILING DRAWDOWN */}
          <motion.div
            variants={cardVariants}
            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/20 p-6 backdrop-blur-xl flex flex-col justify-between gap-8 hover:border-accent-red/35 transition-all duration-500"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-title font-black text-4xl text-white/10 group-hover:text-accent-red/20 transition-colors duration-500">06</span>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 group-hover:text-accent-red group-hover:border-accent-red/20 transition-all duration-500">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-title font-extrabold text-lg text-white group-hover:text-accent-red transition-colors">
                El Drawdown Traidor
              </h3>
              <p className="text-zinc-400 font-body text-xs leading-relaxed mt-2">
                Las firmas de fondeo (Apex/Topstep) calculan tu pérdida máxima sobre tus ganancias flotantes, estrangulando tu margen en un retroceso menor.
              </p>
            </div>

            {/* Gráfico de Equidad Persiguiendo pico */}
            <div className="h-28 w-full bg-black/60 rounded-xl border border-white/5 relative flex items-center justify-center p-2">
              <svg className="w-full h-full overflow-hidden" viewBox="0 0 200 100">
                {/* Línea Peak (Equidad) */}
                <path d="M 10 70 Q 60 40 100 20 T 180 80" fill="none" stroke="var(--accent-blue)" strokeWidth="2" />
                {/* Línea Trailing Drawdown persiguiendo en paralelo de color rojo */}
                <path d="M 10 90 Q 60 60 100 40 T 180 100" fill="none" stroke="var(--accent-red)" strokeWidth="1.5" strokeDasharray="3,3" />
                <circle cx="140" cy="45" r="3" fill="var(--accent-red)" className="alarm-blink-red" />
              </svg>
              <div className="absolute bottom-2 text-[8px] font-bold text-accent-red uppercase tracking-widest">Liquidación sobre flotante</div>
            </div>

            <div className="border-t border-white/5 pt-3 mt-2 text-[10px] font-body">
              <span className="block text-zinc-500 uppercase font-bold text-[8px] tracking-wider mb-0.5">Mito en papel</span>
              <p className="text-zinc-300">"Tengo $2,000 de colchón de pérdidas"</p>
              <span className="block text-accent-red uppercase font-bold text-[8px] tracking-wider mt-2 mb-0.5">Realidad en vivo</span>
              <p className="text-zinc-300">El margen dinámico te liquida mientras duermes.</p>
            </div>
          </motion.div>

          {/* DOLOR #7: BARRERA DEL CÓDIGO */}
          <motion.div
            variants={cardVariants}
            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/20 p-6 backdrop-blur-xl flex flex-col justify-between gap-8 hover:border-accent-red/35 transition-all duration-500"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-title font-black text-4xl text-white/10 group-hover:text-accent-red/20 transition-colors duration-500">07</span>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 group-hover:text-accent-red group-hover:border-accent-red/20 transition-all duration-500">
                  <Code2 className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-title font-extrabold text-lg text-white group-hover:text-accent-red transition-colors">
                Muro del Código
              </h3>
              <p className="text-zinc-400 font-body text-xs leading-relaxed mt-2">
                QuantConnect exige Python o C#. MetaTrader exige MQL4. Si no sabes programar, quedas completamente excluido del backtesting cuantitativo serio.
              </p>
            </div>

            {/* Código transformándose en Muro de Piedra SVG */}
            <div className="h-28 w-full bg-black/60 rounded-xl border border-white/5 relative flex items-center justify-center overflow-hidden font-mono text-[6px] text-zinc-500 p-2">
              <div className="absolute top-2 left-2 text-left opacity-35 group-hover:opacity-10 transition-opacity">
                {`def backtest(data):\n  for tick in data:\n    if signal():\n      execute_order()`}
              </div>
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-1 p-2 bg-gradient-to-t from-zinc-950 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-90 transition-all duration-500">
                <div className="border border-white/10 bg-zinc-900/60 rounded flex items-center justify-center font-bold text-[8px] uppercase tracking-wider text-accent-red shadow-[0_0_8px_rgba(244,63,94,0.15)] col-span-2">Pine Script</div>
                <div className="border border-white/10 bg-zinc-900/60 rounded flex items-center justify-center font-bold text-[8px] uppercase tracking-wider text-accent-red shadow-[0_0_8px_rgba(244,63,94,0.15)] col-span-2">Python</div>
              </div>
              <div className="absolute bottom-2 text-[8px] font-bold text-accent-red uppercase tracking-widest">Exclusión por Código</div>
            </div>

            <div className="border-t border-white/5 pt-3 mt-2 text-[10px] font-body">
              <span className="block text-zinc-500 uppercase font-bold text-[8px] tracking-wider mb-0.5">Mito en papel</span>
              <p className="text-zinc-300">"Aprenderé a programar el próximo mes"</p>
              <span className="block text-accent-red uppercase font-bold text-[8px] tracking-wider mt-2 mb-0.5">Realidad en vivo</span>
              <p className="text-zinc-300">Operas por intuición ciega y quemas tu cuenta.</p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
