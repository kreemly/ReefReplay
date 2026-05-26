import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldX, Cpu, Layers } from 'lucide-react';

function CountingNumber({ value, suffix = "", duration = 1.5 }) {
  const [count, setCount] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
      }
    }, { threshold: 0.1 });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const end = parseFloat(value);
    if (isNaN(end)) return;

    const startTime = performance.now();

    const updateCount = (now) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + easeProgress * (end - start);
      
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(updateCount);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className="font-title font-extrabold tracking-tight">
      {count.toFixed(value.includes('.') ? 1 : 0)}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="relative w-full bg-black-abs py-16 px-6 border-t border-white/5">
      {/* Grid de Métricas */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: 97% CAPITAL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/20 p-8 backdrop-blur-md flex flex-col gap-4 shadow-inner"
        >
          <div className="p-3 w-fit rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red">
            <ShieldX className="w-5 h-5" />
          </div>
          <div className="mt-2">
            <div className="text-4xl sm:text-5xl font-title font-extrabold text-white mb-2">
              <CountingNumber value="97" suffix="%" />
            </div>
            <h4 className="font-title font-bold text-zinc-200 text-sm uppercase tracking-wider mb-2">
              Capital Minorista Destruido
            </h4>
            <p className="text-zinc-400 font-body text-xs leading-relaxed">
              Traders retail que queman sus cuentas en menos de un año debido a una ejecución descuidada, falta de backtests estadísticos y revenge trading.
            </p>
          </div>
        </motion.div>

        {/* CARD 2: 4 a 6 HERRAMIENTAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/20 p-8 backdrop-blur-md flex flex-col gap-4 shadow-inner"
        >
          <div className="p-3 w-fit rounded-xl bg-accent-purple/10 border border-accent-purple/20 text-accent-purple">
            <Layers className="w-5 h-5" />
          </div>
          <div className="mt-2">
            <div className="text-4xl sm:text-5xl font-title font-extrabold text-white mb-2">
              <CountingNumber value="5" suffix=" a 6" />
            </div>
            <h4 className="font-title font-bold text-zinc-200 text-sm uppercase tracking-wider mb-2">
              Herramientas Fragmentadas
            </h4>
            <p className="text-zinc-400 font-body text-xs leading-relaxed">
              Suscripciones desconectadas que el trader promedio coordina a mano semanalmente (TradingView, Excel, cTrader, Notion), perdiendo coherencia y tiempo.
            </p>
          </div>
        </motion.div>

        {/* CARD 3: +30% RENTABILIDAD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/20 p-8 backdrop-blur-md flex flex-col gap-4 shadow-inner"
        >
          <div className="p-3 w-fit rounded-xl bg-accent-green/10 border border-accent-green/20 text-accent-green">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="mt-2">
            <div className="text-4xl sm:text-5xl font-title font-extrabold text-accent-green mb-2">
              +<CountingNumber value="30" suffix="%" />
            </div>
            <h4 className="font-title font-bold text-zinc-200 text-sm uppercase tracking-wider mb-2">
              Aumento de Ventaja (Edge)
            </h4>
            <p className="text-zinc-400 font-body text-xs leading-relaxed">
              Incremento directo en rentabilidad para los traders de 2026 que validan sus estrategias con datos Tick reales del 99% de calidad de modelado.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
