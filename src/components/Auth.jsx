import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Key, User, Shield, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';

export default function Auth({ onLogin, onBackToLanding }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Iniciar con datos del admin de prueba
    onLogin({
      name: name || (isRegister ? 'Trader Elite' : 'Admin ReefReplay'),
      email: email || 'admin@reefreplay.com',
      balance: 50000,
      propFirm: 'Topstep Elite $50K XAUUSD',
      disciplineScore: 92
    });
  };

  const handleInstantAdmin = () => {
    onLogin({
      name: 'Admin ReefReplay',
      email: 'admin@reefreplay.com',
      balance: 50000,
      propFirm: 'Apex Premium XAUUSD $50k',
      disciplineScore: 95
    });
  };

  return (
    <div className="min-h-screen w-full bg-black-abs flex flex-col justify-center items-center px-4 relative overflow-hidden">
      
      {/* Decorative Orbs of Light (Futuristic glow effect) */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-accent-blue/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-accent-purple/10 rounded-full blur-[120px] pointer-events-none pulse-glow-purple" />

      {/* Button to go back to Landing */}
      <button 
        onClick={onBackToLanding}
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-title font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Volver a la web
      </button>

      {/* Auth Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative max-w-md w-full bg-zinc-950/40 border border-white/5 p-8 rounded-3xl backdrop-blur-2xl shadow-3d-neon-purple/5 flex flex-col gap-6"
        style={{
          background: "linear-gradient(180deg, rgba(10, 12, 20, 0.6) 0%, rgba(3, 4, 8, 0.6) 100%)"
        }}
      >
        {/* Glow Superior */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-accent-purple to-transparent blur-sm" />

        {/* Card Header */}
        <div className="text-center flex flex-col items-center gap-3">
          {/* Logo brand */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center font-title font-extrabold text-white text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            RR
          </div>
          <h2 className="font-title font-extrabold text-2xl text-white tracking-tight mt-2">
            {isRegister ? 'Cerrar la Brecha' : 'Iniciar Sesión'}
          </h2>
          <p className="font-body text-zinc-400 text-xs leading-relaxed max-w-[280px]">
            {isRegister 
              ? 'Crea tu cuenta de simulación unificada y blinda tu operativa hoy mismo.' 
              : 'Accede a tu estación ejecutiva ReefReplay Elite y agiliza tus backtests.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Field: Name (Only on Register) */}
          {isRegister && (
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Nombre del Trader</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Ej. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/60 border border-white/5 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-accent-purple/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all font-body"
                  required
                />
              </div>
            </div>
          )}

          {/* Field: Email */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Email Corporativo / Personal</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                placeholder="ejemplo@reefreplay.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/60 border border-white/5 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-accent-purple/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all font-body"
                required
              />
            </div>
          </div>

          {/* Field: Password */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Contraseña de Acceso</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/60 border border-white/5 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-accent-purple/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all font-body"
                required
              />
            </div>
          </div>

          {/* Submit CTA button */}
          <button
            type="submit"
            className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-title font-bold text-xs uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(168,85,247,0.25)] flex items-center justify-center gap-2 group"
          >
            <span>{isRegister ? 'Crear mi Cuenta' : 'Entrar a Consola'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="h-[1px] bg-white/5 flex-grow" />
          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">O ACCESO RÁPIDO</span>
          <div className="h-[1px] bg-white/5 flex-grow" />
        </div>

        {/* Premium Instant Admin Button */}
        <button
          onClick={handleInstantAdmin}
          className="w-full py-3.5 rounded-xl bg-white text-black font-title font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Shield className="w-4 h-4 text-black alarm-blink-red" />
          <span>Simular Acceso Administrador</span>
        </button>

        {/* Toggle Register / Login */}
        <div className="text-center mt-2 text-xs font-body text-zinc-500">
          {isRegister ? (
            <p>
              ¿Ya tienes una cuenta?{' '}
              <button 
                onClick={() => setIsRegister(false)}
                className="text-accent-purple font-semibold hover:underline"
              >
                Inicia Sesión
              </button>
            </p>
          ) : (
            <p>
              ¿Aún no tienes cuenta?{' '}
              <button 
                onClick={() => setIsRegister(true)}
                className="text-accent-purple font-semibold hover:underline"
              >
                Regístrate Gratis
              </button>
            </p>
          )}
        </div>

      </motion.div>
    </div>
  );
}
