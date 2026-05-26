import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SimulationEngine, getSpec, calculateLotSize, ASSET_SPECS } from '../utils/SimulationEngine';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Tv, 
  History,
  Trophy,
  ShieldAlert, 
  LogOut,  
  User, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sliders, 
  Terminal, 
  Zap, 
  Lock, 
  AlertTriangle,
  Star,
  Activity,
  DollarSign,
  ChevronDown,
  Check,
  ShieldCheck,
  Play,
  Pause,
  ChevronRight,
  RotateCcw,
  Volume2
} from 'lucide-react';

// Importación de las dependencias locales y bases de datos históricas (2015-2026)
import WorkstationChart from './WorkstationChart';
import audjpyData from '../data/audjpy_historical.json';
import audusdData from '../data/audusd_historical.json';
import chfjpyData from '../data/chfjpy_historical.json';
import eurcadData from '../data/eurcad_historical.json';
import eurgbpData from '../data/eurgbp_historical.json';
import eurjpyData from '../data/eurjpy_historical.json';
import eurusdData from '../data/eurusd_historical.json';
import gbpchfData from '../data/gbpchf_historical.json';
import gbpjpyData from '../data/gbpjpy_historical.json';
import gbpusdData from '../data/gbpusd_historical.json';
import nzdjpyData from '../data/nzdjpy_historical.json';
import nzdusdData from '../data/nzdusd_historical.json';
import usdcadData from '../data/usdcad_historical.json';
import usdchfData from '../data/usdchf_historical.json';
import usdjpyData from '../data/usdjpy_historical.json';
import xagusdData from '../data/xagusd_historical.json';
import xauusdData from '../data/xauusd_historical.json';

// Keep old mock datasets for complete backwards compatibility
import btcusdData from '../data/btcusd_historical.json';
import nas100Data from '../data/nas100_historical.json';
import us30Data from '../data/us30_historical.json';

// Base de datos local unificada para los 20 pares en memoria
const assetDatabase = {
  AUDJPY: audjpyData,
  AUDUSD: audusdData,
  CHFJPY: chfjpyData,
  EURCAD: eurcadData,
  EURGBP: eurgbpData,
  EURJPY: eurjpyData,
  EURUSD: eurusdData,
  GBPCHF: gbpchfData,
  GBPJPY: gbpjpyData,
  GBPUSD: gbpusdData,
  NZDJPY: nzdjpyData,
  NZDUSD: nzdusdData,
  USDCAD: usdcadData,
  USDCHF: usdchfData,
  USDJPY: usdjpyData,
  XAGUSD: xagusdData,
  XAUUSD: xauusdData,
  
  BTCUSD: btcusdData,
  NAS100: nas100Data,
  US30: us30Data
};

// Función de agregación de velas de alta precisión para multi-temporalidad (M15 a M30, H1, D1)
function aggregateCandles(candles, timeframe) {
  if (!candles || candles.length === 0) return [];
  let groupSize = 1;
  if (timeframe === 'M30') groupSize = 2;
  else if (timeframe === 'H1') groupSize = 4;
  else if (timeframe === 'D1') groupSize = 96;
  
  if (groupSize === 1) return candles;
  
  const aggregated = [];
  for (let i = 0; i < candles.length; i += groupSize) {
    const chunk = candles.slice(i, i + groupSize);
    if (chunk.length === 0) continue;
    
    const open = chunk[0].open;
    const close = chunk[chunk.length - 1].close;
    const high = Math.max(...chunk.map(c => c.high));
    const low = Math.min(...chunk.map(c => c.low));
    const volume = chunk.reduce((sum, c) => sum + (c.volume || 100), 0);
    const time = chunk[0].time;
    
    aggregated.push({ time, open, high, low, close, volume });
  }
  return aggregated;
}

// Refined Vercel-style Odometer (Count-Up Animation)
function Odometer({ value, duration = 1.0, suffix = "", prefix = "" }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    const end = parseFloat(value);
    if (isNaN(end)) return;

    const startTime = performance.now();

    const updateCount = (now) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + easeProgress * (end - start);
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(updateCount);
  }, [value, duration]);

  return (
    <span className="-webkit-font-smoothing-antialiased font-mono font-extrabold tracking-tight">
      {prefix}
      {displayValue.toLocaleString(undefined, {
        minimumFractionDigits: value.toString().includes('.') ? 2 : 0,
        maximumFractionDigits: value.toString().includes('.') ? 2 : 0
      })}
      {suffix}
    </span>
  );
}

// Custom Premium Dropdown Selector Component
function CustomSelect({ label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="flex flex-col gap-1 text-left relative" ref={dropdownRef}>
      <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">{label}</label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-black/60 border border-white/5 hover:border-white/10 py-2.5 px-4 rounded-xl text-xs text-white focus:outline-none transition-all duration-300 backdrop-blur-md"
      >
        <span className="font-semibold">{selectedOption.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 left-0 w-full mt-16 bg-zinc-950/95 border border-white/10 rounded-xl p-1.5 shadow-2xl backdrop-blur-xl max-h-48 overflow-y-auto"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left ${opt.value === value ? 'bg-white/5 text-white font-bold' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
              >
                <span>{opt.label}</span>
                {opt.value === value && <Check className="w-3.5 h-3.5 text-accent-purple" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Centralized helper for dynamic fraction precision scaling
export function getAssetDecimals(assetName) {
  if (!assetName) return 2;
  if (assetName.endsWith('JPY')) return 3;
  if (assetName === 'XAGUSD') return 3;
  if (assetName === 'XAUUSD' || assetName === 'BTCUSD' || assetName === 'NAS100' || assetName === 'US30') return 2;
  return 5; // standard forex
}

// Centralized helper for dynamic trade resets
export function getAssetTickDist(assetName) {
  if (assetName === 'XAUUSD') return 15.0;
  if (assetName === 'XAGUSD') return 0.50;
  if (assetName === 'BTCUSD') return 1000.0;
  if (assetName.endsWith('JPY')) return 0.50;
  return 0.0050; // 50 pips default
}

// Desafíos de Fondeo (Apex, Topstep, FTMO, etc.) estructurados para simulación offline
const PROP_CHALLENGES = {
  futures: [
    {
      id: 'apex_50k',
      firm: 'Apex Trader Funding',
      size: '$50K Account',
      initialBalance: 50000,
      target: 3000,
      maxDrawdown: 2500,
      drawdownType: 'Trailing',
      dailyLimit: 0,
      contracts: '10 Minis / 100 Micros',
      fee: '$147 (Reembolsable)'
    },
    {
      id: 'topstep_50k',
      firm: 'Topstep Combine',
      size: '$50K Combine',
      initialBalance: 50000,
      target: 3000,
      maxDrawdown: 2000,
      drawdownType: 'Trailing',
      dailyLimit: 1000,
      contracts: '5 Minis / 50 Micros',
      fee: '$49/mes'
    },
    {
      id: 'topstep_100k',
      firm: 'Topstep Combine',
      size: '$100K Combine',
      initialBalance: 100000,
      target: 6000,
      maxDrawdown: 3000,
      drawdownType: 'Trailing',
      dailyLimit: 2000,
      contracts: '10 Minis / 100 Micros',
      fee: '$99/mes'
    },
    {
      id: 'mffu_50k',
      firm: 'MyFundedFutures',
      size: '$50K Starter',
      initialBalance: 50000,
      target: 3000,
      maxDrawdown: 2000,
      drawdownType: 'End-of-Day',
      dailyLimit: 1100,
      contracts: '5 Minis / 50 Micros',
      fee: '$50 (Reembolsable)'
    },
    {
      id: 'takeprof_50k',
      firm: 'Take Profit Trader',
      size: '$50K Account',
      initialBalance: 50000,
      target: 3000,
      maxDrawdown: 2000,
      drawdownType: 'End-of-Day',
      dailyLimit: 1100,
      contracts: '5 Minis / 50 Micros',
      fee: '$150 (Reembolsable)'
    }
  ],
  forex: [
    {
      id: 'ftmo_50k',
      firm: 'FTMO Challenge',
      size: '$50K Standard',
      initialBalance: 50000,
      target: 5000,
      maxDrawdown: 5000,
      drawdownType: 'Fixed Max Loss',
      dailyLimit: 2500,
      leverage: '1:100',
      fee: '€345 (Reembolsable)'
    },
    {
      id: 'ftmo_100k',
      firm: 'FTMO Challenge',
      size: '$100K Standard',
      initialBalance: 100000,
      target: 10000,
      maxDrawdown: 10000,
      drawdownType: 'Fixed Max Loss',
      dailyLimit: 5000,
      leverage: '1:100',
      fee: '€540 (Reembolsable)'
    },
    {
      id: 'fundingpips_100k',
      firm: 'Funding Pips',
      size: '$100K Evaluation',
      initialBalance: 100000,
      target: 8000,
      maxDrawdown: 10000,
      drawdownType: 'Fixed Max Loss',
      dailyLimit: 5000,
      leverage: '1:100',
      fee: '$399'
    },
    {
      id: 'myfundedfx_50k',
      firm: 'MyFundedFX 2-Step',
      size: '$50K Evaluation',
      initialBalance: 50000,
      target: 4000,
      maxDrawdown: 4000,
      drawdownType: 'Fixed Max Loss',
      dailyLimit: 2500,
      leverage: '1:100',
      fee: '$299'
    },
    {
      id: 'the5ers_100k',
      firm: 'The 5%ers Bootcamp',
      size: '$100K Bootcamp',
      initialBalance: 100000,
      target: 6000,
      maxDrawdown: 5000,
      drawdownType: 'Fixed Max Loss',
      dailyLimit: 5000,
      leverage: '1:30',
      fee: '€95'
    }
  ]
};

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('agenda'); // agenda, workstation, webhook, compliance, retos
  const [balance, setBalance] = useState(user.balance || 50000);
  const [peakBalance, setPeakBalance] = useState(user.balance || 50000);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [selectedPropCategory, setSelectedPropCategory] = useState('futures');
  
  // Multi-Pair and Replay active configurations
  const [activeAsset, setActiveAsset] = useState('XAUUSD');
  const [timeframe, setTimeframe] = useState('M15');
  const [activeDrawingTool, setActiveDrawingTool] = useState('cursor');
  const [indicators, setIndicators] = useState({ ema50: false, ema200: false, volume: true });
  const [cutoffDate, setCutoffDate] = useState('2024-05-01');
  const [operationMode, setOperationMode] = useState('live'); // 'live' (TradingView Widget) or 'replay' (ReefReplay Simulator)

  // ═══════════════════════════════════════════════════════════
  // MOTOR DE SIMULACIÓN FINTECH (SimulationEngine Instance)
  // ═══════════════════════════════════════════════════════════
  const engineRef = useRef(null);
  const [engineSnapshot, setEngineSnapshot] = useState(null);
  
  // Lazy init: create engine on first render
  if (!engineRef.current) {
    engineRef.current = new SimulationEngine({
      initialBalance: user.balance || 50000,
      maxDrawdownAmount: 2500,
      timeframe: 'M15',
      onLog: () => {},  // placeholder, will be patched below
    });
  }

  // Compute active history dynamically based on selected pair
  const activeHistory = React.useMemo(() => {
    const rawData = assetDatabase[activeAsset] || assetDatabase.XAUUSD;
    return rawData.map(c => ({
      ...c,
      time: typeof c.time === 'number' ? c.time : Math.floor(Date.parse(c.time) / 1000)
    }));
  }, [activeAsset]);

  // Trades Iniciales de Altísima Calidad
  const [trades, setTrades] = useState([
    {
      id: 1,
      asset: 'XAUUSD',
      type: 'BUY',
      price: 2330.00,
      sl: 2320.00,
      tp: 2355.00,
      risk: 500,
      session: 'New York',
      emotion: 'Calma',
      confluence: 5,
      checklist: true,
      status: 'PENDING',
      rr: 2.5,
      netProfit: 0,
      timestamp: 'Agendado'
    },
    {
      id: 2,
      asset: 'EURUSD',
      type: 'SELL',
      price: 1.08500,
      sl: 1.08750,
      tp: 1.08000,
      risk: 300,
      session: 'London',
      emotion: 'Ansia',
      confluence: 3,
      checklist: false,
      status: 'LOSS',
      rr: 2.0,
      netProfit: -300,
      timestamp: 'Hace 5 horas'
    }
  ]);

  // Selección de trade activo en el gráfico
  const [selectedTradeId, setSelectedTradeId] = useState(1);

  // Playback states para el backtester real
  const [currentCandleIndex, setCurrentCandleIndex] = useState(20); // Iniciamos con las primeras 20 velas dibujadas
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // 1000ms por vela

  // Form states (Agenda form)
  const [newAsset, setNewAsset] = useState('XAUUSD');
  const [newType, setNewType] = useState('BUY'); // BUY or SELL
  const [newPrice, setNewPrice] = useState('2340.00');
  const [newSl, setNewSl] = useState('2330.00');
  const [newTp, setNewTp] = useState('2365.00');
  const [newRisk, setNewRisk] = useState('500');
  const [newSession, setNewSession] = useState('New York');
  const [newEmotion, setNewEmotion] = useState('Calma');
  const [newConfluence, setNewConfluence] = useState(5);
  const [newChecklist, setNewChecklist] = useState(true);

  // Quick trade execution console states
  const [quickType, setQuickType] = useState('BUY');
  const [quickRisk, setQuickRisk] = useState('500');
  const [quickSlPrice, setQuickSlPrice] = useState('2320.00');
  const [quickTpPrice, setQuickTpPrice] = useState('2355.00');
  const [quickRR, setQuickRR] = useState('3.0');

  const currentPrice = activeHistory[currentCandleIndex]?.close || 0;

  // Auto-calculate suggested SL & TP when price, asset, direction, or R:R ratio changes
  useEffect(() => {
    if (!currentPrice) return;
    const isJpyPair = activeAsset.endsWith('JPY');
    const isGold = activeAsset === 'XAUUSD';
    const isSilver = activeAsset === 'XAGUSD';
    
    let decimals = getAssetDecimals(activeAsset);
    let pipsFactor = 0.0001;
    let slDistance = 25; // default 25 pips (standard forex)

    if (isJpyPair) {
      pipsFactor = 0.01;
      slDistance = 30; // 30 JPY pips
    } else if (isGold) {
      pipsFactor = 0.1;
      slDistance = 100; // $10.00 SL
    } else if (isSilver) {
      pipsFactor = 0.01;
      slDistance = 50; // $0.50 SL
    } else if (activeAsset === 'BTCUSD') {
      pipsFactor = 1.0;
      slDistance = 1500; // $1500 SL
    } else if (activeAsset === 'NAS100' || activeAsset === 'US30') {
      pipsFactor = 1.0;
      slDistance = 150; // 150 points
    }
    
    const slDelta = slDistance * pipsFactor;
    const tpDelta = slDelta * parseFloat(quickRR || 3.0);
    
    const targetSL = quickType === 'BUY' ? currentPrice - slDelta : currentPrice + slDelta;
    const targetTP = quickType === 'BUY' ? currentPrice + tpDelta : currentPrice - tpDelta;
    
    setQuickSlPrice(targetSL.toFixed(decimals));
    setQuickTpPrice(targetTP.toFixed(decimals));
  }, [currentPrice, quickType, activeAsset, quickRR]);

  // Vercel Terminal Logs (Audit Console)
  const [webhookLogs, setWebhookLogs] = useState([
    { id: 1, time: '11:00:02', text: 'Canal de auditoría del motor ReefReplay inicializado correctamente', type: 'info' },
    { id: 2, time: '11:00:03', text: 'Servidor local de simulación cargado con éxito en memoria', type: 'success' },
    { id: 3, time: '11:00:05', text: 'Motor de análisis de drawdown restrictivo (Reef Defender) listo y activo', type: 'info' }
  ]);
  const [isSimulatingTV, setIsSimulatingTV] = useState(false);

  // Consola Log Helper
  const logToConsole = (text, type = 'info') => {
    const timeNow = new Date().toTimeString().split(' ')[0];
    setWebhookLogs(prev => [
      ...prev,
      { id: Date.now() + Math.random(), time: timeNow, text, type }
    ]);
  };

  // Auto-sync when changing assets
  useEffect(() => {
    setCurrentCandleIndex(Math.min(20, activeHistory.length - 1));
    setIsPlaying(false);
    logToConsole(`Activo seleccionado: ${activeAsset} M15 (${activeHistory.length} velas históricas cargadas)`, 'info');
  }, [activeAsset]);

  // Patch engine onLog callback to use logToConsole (must be done after logToConsole is defined)
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.onLog = logToConsole;
    }
  }, []);

  // Drawdown Compliance Calculation — derived from engine state for accuracy
  const trailingDrawdownLimit = peakBalance - 2500; // Apex/Topstep $2.5k trailing drawdown
  const cushion = balance - trailingDrawdownLimit;
  const cushionPercent = Math.max(0, Math.min(100, (cushion / 2500) * 100));
  const isCircuitBreakerTripped = cushion <= 0;

  // Rastrear el trade seleccionado para enviárselo al gráfico
  const activeTradeForChart = trades.find(t => t.id === selectedTradeId) || trades.find(t => t.status === 'PENDING' || t.status === 'ACTIVE');

  // Actualización del Peak Balance
  useEffect(() => {
    if (balance > peakBalance) {
      setPeakBalance(balance);
    }
  }, [balance, peakBalance]);

  // Sync engine snapshot for stats display
  const syncEngineSnapshot = useCallback(() => {
    if (engineRef.current) {
      const candle = activeHistory[currentCandleIndex] || null;
      setEngineSnapshot(engineRef.current.getSnapshot(candle, activeAsset));
    }
  }, [activeHistory, currentCandleIndex, activeAsset]);

  // ═══════════════════════════════════════════════════════════
  // MOTOR DEL SIMULADOR FINTECH: Delegación al SimulationEngine
  // ═══════════════════════════════════════════════════════════
  const runSimulatorTick = (newCandle) => {
    const engine = engineRef.current;
    if (!engine) return;

    // Step 1: Activate PENDING trades from the agenda that meet entry conditions
    setTrades(prevTrades =>
      prevTrades.map(trade => {
        if (trade.asset !== activeAsset) return trade;
        if (trade.status === 'PENDING') {
          const touchedEntry = newCandle.high >= trade.price && newCandle.low <= trade.price;
          if (touchedEntry) {
            // Register this trade inside the engine as an active position
            engine.openPosition({
              symbol: trade.asset,
              tipo: trade.type,
              precioEntrada: trade.price,
              stopLoss: trade.sl,
              takeProfit: trade.tp,
              riskAmount: trade.risk,
              session: trade.session,
              emotion: trade.emotion,
              confluence: trade.confluence,
            });
            return { ...trade, status: 'ACTIVE' };
          }
        }
        return trade;
      })
    );

    // Step 2: Run the engine tick — evaluates SL/TP on all active positions
    const result = engine.processTick(newCandle, activeAsset);

    // Step 3: Sync closed trades back to the React trade list for display
    if (result.closedPositions.length > 0) {
      setTrades(prevTrades => {
        let updated = [...prevTrades];
        for (const closed of result.closedPositions) {
          // Match by the engine's position entry price + type to the React trade
          const idx = updated.findIndex(
            t => t.status === 'ACTIVE' && t.asset === activeAsset &&
              t.type === closed.tipo && Math.abs(t.price - closed.precioEntrada) < 0.001
          );
          if (idx !== -1) {
            updated[idx] = {
              ...updated[idx],
              status: closed.status, // 'WIN' or 'LOSS'
              netProfit: closed.netProfit,
              exitPrice: closed.precioSalida,
              grossPnl: closed.grossPnl,
              spreadCost: closed.spreadCost,
              commission: closed.commission,
              lotSize: closed.lote,
            };
          }
        }
        return updated;
      });
    }

    // Step 4: Sync engine balance to React state
    if (result.balanceDelta !== 0) {
      setBalance(engine.balanceActual);
      setPeakBalance(engine.peakBalance);
    }

    // Paso 4.5: Si hay un reto prop activo, auditar las reglas
    if (activeChallenge && activeChallenge.status === 'RUNNING') {
      const currentBal = engine.balanceActual;
      const targetProfit = activeChallenge.target;
      const initialBal = activeChallenge.initialBalance;
      const dailyLimit = activeChallenge.dailyLimit;
      
      // Calculate current closed session PnL
      const sessionPnl = engine.stats.totalPnl;
      
      // Pass Condition
      if (currentBal >= initialBal + targetProfit) {
        setActiveChallenge(prev => ({ ...prev, status: 'PASSED' }));
        logToConsole(`🎉 ¡RETO COMPLETO Y SUPERADO! Has superado el desafío de ${activeChallenge.firm} ${activeChallenge.size} con un balance final de $${currentBal.toLocaleString()}.`, 'success');
      } 
      // Fail Condition (Trailing Drawdown cushion <= 0 OR Daily Loss Limit breached)
      else if (engine.cushion <= 0 || (dailyLimit > 0 && sessionPnl <= -dailyLimit)) {
        setActiveChallenge(prev => ({ ...prev, status: 'FAILED' }));
        logToConsole(`❌ RETO FALLIDO: Has violado las reglas de gestión de riesgo de ${activeChallenge.firm}. Tu cuenta simulada ha sido liquidada.`, 'error');
      }
    }

    // Step 5: Update engine snapshot for stats panels
    syncEngineSnapshot();
  };

  // Reproductor automático de velas (Playback Interval Engine)
  useEffect(() => {
    let intervalId = null;

    if (isPlaying && !isCircuitBreakerTripped) {
      intervalId = setInterval(() => {
        if (currentCandleIndex < activeHistory.length - 1) {
          const nextIndex = currentCandleIndex + 1;
          setCurrentCandleIndex(nextIndex);
          runSimulatorTick(activeHistory[nextIndex]);
        } else {
          setIsPlaying(false);
          logToConsole(`Fin de los datos históricos de ${activeAsset} cargados en la sesión`, 'info');
        }
      }, playbackSpeed);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, currentCandleIndex, playbackSpeed, isCircuitBreakerTripped, activeHistory, activeAsset]);

  // Avanzar una sola vela de forma manual
  const handleStepNextCandle = () => {
    if (isCircuitBreakerTripped) return;
    if (currentCandleIndex < activeHistory.length - 1) {
      const nextIndex = currentCandleIndex + 1;
      setCurrentCandleIndex(nextIndex);
      runSimulatorTick(activeHistory[nextIndex]);
    } else {
      logToConsole(`Fin de los datos históricos de ${activeAsset} cargados en la sesión`, 'info');
    }
  };

  // Resetear el simulador
  const handleResetSimulator = (customBal, customDrawdown) => {
    const engine = engineRef.current;
    setCurrentCandleIndex(20);
    setIsPlaying(false);
    
    const initBal = typeof customBal === 'number' ? customBal : (user.balance || 50000);
    setBalance(initBal);
    setPeakBalance(initBal);
    
    // Reset the SimulationEngine with the drawdown amount
    if (engine) {
      if (typeof customDrawdown === 'number') {
        engine.maxDrawdownAmount = customDrawdown;
      } else {
        engine.maxDrawdownAmount = 2500;
      }
      engine.resetSession(initBal);
    }
    
    // Resetear a un trade pendiente inicial adecuado al activo seleccionado
    const resetPrice = activeHistory[20]?.close || 2000;
    const tickDist = getAssetTickDist(activeAsset);
    
    setTrades([
      {
        id: Date.now(),
        asset: activeAsset,
        type: 'BUY',
        price: resetPrice,
        sl: resetPrice - tickDist,
        tp: resetPrice + tickDist * 2.5,
        risk: 500,
        session: 'New York',
        emotion: 'Calma',
        confluence: 5,
        checklist: true,
        status: 'PENDING',
        rr: 2.5,
        netProfit: 0,
        timestamp: 'Simulado'
      }
    ]);
    
    syncEngineSnapshot();
  };

  // Manejo de inicio de un reto prop
  const handleStartChallenge = (challenge) => {
    setActiveChallenge({
      ...challenge,
      status: 'RUNNING'
    });
    handleResetSimulator(challenge.initialBalance, challenge.maxDrawdown);
    logToConsole(`🏆 ¡Reto Prop de ${challenge.firm} activado con éxito! Objetivo: +$${challenge.target} | Drawdown: -$${challenge.maxDrawdown}`, 'success');
    setActiveTab('retos');
  };

  // Manejo de abandonar un reto prop
  const handleAbandonChallenge = () => {
    setActiveChallenge(null);
    handleResetSimulator(user.balance || 50000, 2500);
    logToConsole(`Reto Prop abandonado. Has regresado al modo libre de backtesting.`, 'info');
  };

  // Manejo de adición de un trade agendado
  const handleScheduleTrade = (e) => {
    e.preventDefault();
    if (isCircuitBreakerTripped) return;

    const priceNum = parseFloat(newPrice) || 2340;
    const slNum = parseFloat(newSl) || 2330;
    const tpNum = parseFloat(newTp) || 2365;
    const riskNum = parseFloat(newRisk) || 500;

    const targetDistance = Math.abs(tpNum - priceNum);
    const riskDistance = Math.abs(priceNum - slNum);
    const calcRR = riskDistance > 0 ? (targetDistance / riskDistance).toFixed(1) : 2.5;

    const id = Date.now();
    const createdTrade = {
      id,
      asset: newAsset,
      type: newType,
      price: priceNum,
      sl: slNum,
      tp: tpNum,
      risk: riskNum,
      session: newSession,
      emotion: newEmotion,
      confluence: newConfluence,
      checklist: newChecklist,
      status: 'PENDING',
      rr: parseFloat(calcRR),
      netProfit: 0,
      timestamp: 'Agendado ahora'
    };

    setTrades([createdTrade, ...trades]);
    setSelectedTradeId(id);
    
    logToConsole(`Trade agendado en Agenda de Operaciones: ${newType} ${newAsset} a $${priceNum.toFixed(2)} (Riesgo: $${riskNum})`, 'info');
  };

  // ═══════════════════════════════════════════════════════════
  // RAPID TRADE EXECUTION (Engine-Backed Quick Trade)
  // ═══════════════════════════════════════════════════════════
  const handleQuickExecuteTrade = (type) => {
    const engine = engineRef.current;
    if (!engine || isCircuitBreakerTripped) return;
    
    const entryNum = currentPrice;
    const slNum = parseFloat(quickSlPrice) || (type === 'BUY' ? entryNum * 0.99 : entryNum * 1.01);
    const tpNum = parseFloat(quickTpPrice) || (type === 'BUY' ? entryNum * 1.03 : entryNum * 0.97);
    const riskNum = parseFloat(quickRisk) || 500;
    
    // Calculate R:R and lot size via engine utilities
    const targetDistance = Math.abs(tpNum - entryNum);
    const riskDistance = Math.abs(entryNum - slNum);
    const calcRR = riskDistance > 0 ? (targetDistance / riskDistance).toFixed(1) : 3.0;
    const lotSize = calculateLotSize(activeAsset, riskNum, entryNum, slNum);
    const spec = getSpec(activeAsset);

    // Register in engine as active position immediately (market execution)
    const pos = engine.openPosition({
      symbol: activeAsset,
      tipo: type,
      precioEntrada: entryNum,
      stopLoss: slNum,
      takeProfit: tpNum,
      riskAmount: riskNum,
    });

    if (!pos) return; // Engine rejected (validation failure or circuit breaker)

    const id = Date.now();
    const quickTrade = {
      id,
      asset: activeAsset,
      type: type,
      price: entryNum,
      sl: slNum,
      tp: tpNum,
      risk: riskNum,
      lotSize: lotSize,
      session: 'Replay Sim',
      emotion: 'Calma',
      confluence: 5,
      checklist: true,
      status: 'ACTIVE', // Immediate market execution
      rr: parseFloat(calcRR),
      netProfit: 0,
      timestamp: 'Ejecución Rápida'
    };

    setTrades(prev => [quickTrade, ...prev]);
    setSelectedTradeId(id);
    syncEngineSnapshot();
  };

  // Exportar el historial de trades de la sesión en CSV compatible con Excel
  const exportToCSV = () => {
    if (trades.length === 0) {
      alert("No hay operaciones registradas en esta sesión para exportar.");
      return;
    }
    
    const headers = ["ID", "Direccion", "Activo", "Precio Entrada", "SL", "TP", "Estado", "Sesion", "Emocion", "Confluencias", "R:R"];
    
    const rows = trades.map(t => [
      t.id,
      t.type,
      t.asset,
      t.price,
      t.sl,
      t.tp,
      t.status,
      t.session,
      t.emotion,
      t.confluence,
      t.rr + " R"
    ]);
    
    // Convert array to CSV string with UTF-8 BOM for Excel compatibility
    const csvRows = [headers.join(",")];
    for (const row of rows) {
      csvRows.push(row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","));
    }
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reefreplay_backtest_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    logToConsole('Historial del diario exportado con éxito en formato CSV.', 'success');
  };

  // Simulación de inyectar operación de prueba de backtest
  const triggerTVSimulation = () => {
    if (isSimulatingTV || isCircuitBreakerTripped) return;
    setIsSimulatingTV(true);

    const logSteps = [
      { text: 'Iniciando simulación de orden en vivo en el motor ReefReplay...', type: 'info' },
      { text: 'Activo seleccionado para el backtest de prueba: XAUUSD (Oro)', type: 'info' },
      { text: 'Verificando parámetros del Reef Defender... OK (Cuenta Activa)', type: 'success' },
      { text: 'Operación simulada registrada con éxito en el diario: BUY a $2335.00', type: 'success' }
    ];

    let delay = 0;
    logSteps.forEach((step, index) => {
      delay += 600;
      setTimeout(() => {
        logToConsole(step.text, step.type);

        if (index === logSteps.length - 1) {
          setIsSimulatingTV(false);
          const simulatedTrade = {
            id: Date.now(),
            asset: 'XAUUSD',
            type: 'BUY',
            price: 2335.00,
            sl: 2325.00,
            tp: 2355.00,
            risk: 500,
            session: 'New York (Sim)',
            emotion: 'Automatizado',
            confluence: 5,
            checklist: true,
            status: 'PENDING',
            rr: 2.0,
            netProfit: 0,
            timestamp: 'Prueba Sim'
          };
          setTrades(prev => [simulatedTrade, ...prev]);
          setSelectedTradeId(simulatedTrade.id);
        }
      }, delay);
    });
  };

  // Dropdown list options mapping
  const assetOptions = [
    { value: 'XAUUSD', label: 'Oro (XAUUSD)' },
    { value: 'EURUSD', label: 'EURUSD (Euro)' },
    { value: 'GBPUSD', label: 'GBPUSD (Libra)' },
    { value: 'USDCAD', label: 'USDCAD (Dólar Canadiense)' },
    { value: 'USDJPY', label: 'USDJPY (Yen)' },
    { value: 'USDCHF', label: 'USDCHF (Franco Suizo)' },
    { value: 'XAGUSD', label: 'Plata (XAGUSD)' },
    { value: 'AUDJPY', label: 'AUDJPY' },
    { value: 'AUDUSD', label: 'AUDUSD' },
    { value: 'CHFJPY', label: 'CHFJPY' },
    { value: 'EURCAD', label: 'EURCAD' },
    { value: 'EURGBP', label: 'EURGBP' },
    { value: 'EURJPY', label: 'EURJPY' },
    { value: 'GBPCHF', label: 'GBPCHF' },
    { value: 'GBPJPY', label: 'GBPJPY' },
    { value: 'NZDJPY', label: 'NZDJPY' },
    { value: 'NZDUSD', label: 'NZDUSD' }
  ];

  const riskOptions = [
    { value: '150', label: '$150 (Conservador)' },
    { value: '300', label: '$300 (Moderado)' },
    { value: '500', label: '$500 (Apex Std)' },
    { value: '1000', label: '$1,000 (Agresivo)' }
  ];

  const sessionOptions = [
    { value: 'New York', label: 'New York (NY)' },
    { value: 'London', label: 'London (LDN)' },
    { value: 'Tokyo', label: 'Tokyo (TYO)' }
  ];

  const emotionOptions = [
    { value: 'Calma', label: 'Paciencia / Calma profunda (Óptimo)' },
    { value: 'Ansia', label: 'Ansia por entrar (Ejecución apresurada)' },
    { value: 'FOMO', label: 'FOMO (Temor a quedarse fuera)' },
    { value: 'Venganza', label: 'Revenge Trading (Tras stop loss)' }
  ];

  // Determine Cushion color dynamically
  const getCushionColor = (pct) => {
    if (pct > 60) return { bar: 'bg-accent-green shadow-[0_0_12px_rgba(16,185,129,0.4)]', text: 'text-accent-green', border: 'border-accent-green/20 bg-accent-green/5' };
    if (pct > 30) return { bar: 'bg-accent-gold shadow-[0_0_12px_rgba(245,158,11,0.4)]', text: 'text-accent-gold', border: 'border-accent-gold/20 bg-accent-gold/5' };
    return { bar: 'bg-accent-red alarm-blink-red shadow-[0_0_12px_rgba(244,63,94,0.4)]', text: 'text-accent-red alarm-blink-red', border: 'border-accent-red/20 bg-accent-red/5' };
  };

  const currentCushionTheme = getCushionColor(cushionPercent);

  // Recortar la base de datos histórica para mostrar solo hasta el índice actual (playback)
  // Recortar y agregar la base de datos histórica según la temporalidad seleccionada (playback)
  const visibleChartData = React.useMemo(() => {
    const sliced = activeHistory.slice(0, currentCandleIndex + 1);
    return aggregateCandles(sliced, timeframe);
  }, [activeHistory, currentCandleIndex, timeframe]);

  return (
    <div className="min-h-screen w-full bg-black-abs text-zinc-100 flex font-body overflow-hidden -webkit-font-smoothing-antialiased">
      
      {/* 1. COMPLIANCE CIRCUIT BREAKER OVERLAY */}
      <AnimatePresence>
        {isCircuitBreakerTripped && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-accent-red/10 backdrop-blur-md z-[100] flex flex-col items-center justify-center pointer-events-auto p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-zinc-950 border border-accent-red rounded-3xl p-8 text-center flex flex-col items-center gap-5 shadow-[0_0_50px_rgba(244,63,94,0.3)]"
            >
              <div className="p-4 rounded-full bg-accent-red/10 text-accent-red alarm-blink-red">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="font-title font-extrabold text-2xl text-white uppercase tracking-wider">Disyuntor Activado</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-body">
                Has violado la regla operativa restrictiva de tu <strong className="text-accent-red font-bold font-mono">Intraday Trailing Drawdown</strong>. Tu balance actual (<strong className="text-white font-bold font-mono">${balance.toLocaleString()}</strong>) ha cruzado el límite absoluto permitido de <strong className="text-accent-red font-bold font-mono">${trailingDrawdownLimit.toLocaleString()}</strong>.
              </p>
              <div className="w-full bg-accent-red/5 border border-accent-red/25 rounded-xl p-3 text-[10px] font-mono text-accent-red uppercase tracking-wider">
                Acceso a Broker API: Bloqueado Físicamente
              </div>
              <button 
                onClick={handleResetSimulator} 
                className="mt-2 px-6 py-3.5 rounded-xl bg-white text-black font-title font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-lg active:scale-95"
              >
                Resetear Cuenta Simulada
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. SIDEBAR DE NAVEGACIÓN EJECUTIVA */}
      <aside className="w-64 border-r border-white/5 bg-zinc-950/20 backdrop-blur-2xl flex flex-col justify-between p-6 flex-shrink-0 relative">
        <div className="absolute inset-0 bg-radial-gradient from-accent-purple/3 to-transparent pointer-events-none" />

        <div className="flex flex-col gap-8 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center font-title font-extrabold text-white text-xs shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              RR
            </div>
            <span className="font-title font-extrabold text-md text-white tracking-tight">
              Reef<span className="bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-fill-transparent text-transparent">Replay</span>
            </span>
          </div>

          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('agenda')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-title font-bold uppercase tracking-wider transition-all duration-200 ${activeTab === 'agenda' ? 'bg-white/5 border border-white/10 text-white shadow-inner shadow-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Calendar className={`w-4 h-4 ${activeTab === 'agenda' ? 'text-accent-purple' : 'text-zinc-500'}`} />
              Agendar Operación
            </button>

            <button
              onClick={() => setActiveTab('workstation')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-title font-bold uppercase tracking-wider transition-all duration-200 ${activeTab === 'workstation' ? 'bg-white/5 border border-white/10 text-white shadow-inner shadow-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Activity className={`w-4 h-4 ${activeTab === 'workstation' ? 'text-accent-blue' : 'text-zinc-500'}`} />
              Estación de Trabajo
            </button>

            <button
              onClick={() => setActiveTab('webhook')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-title font-bold uppercase tracking-wider transition-all duration-200 ${activeTab === 'webhook' ? 'bg-white/5 border border-white/10 text-white shadow-inner shadow-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <History className={`w-4 h-4 ${activeTab === 'webhook' ? 'text-accent-gold' : 'text-zinc-500'}`} />
              Diario de Backtest
            </button>

            <button
              onClick={() => setActiveTab('compliance')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-title font-bold uppercase tracking-wider transition-all duration-200 ${activeTab === 'compliance' ? 'bg-white/5 border border-white/10 text-white shadow-inner shadow-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <ShieldAlert className={`w-4 h-4 ${activeTab === 'compliance' ? 'text-accent-green' : 'text-zinc-500'}`} />
              Auditoría de Riesgo
            </button>

            <button
              onClick={() => setActiveTab('retos')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-title font-bold uppercase tracking-wider transition-all duration-200 ${activeTab === 'retos' ? 'bg-white/5 border border-white/10 text-white shadow-inner shadow-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Trophy className={`w-4 h-4 ${activeTab === 'retos' ? 'text-accent-purple' : 'text-zinc-500'}`} />
              Retos Prop
            </button>
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/5 pt-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-zinc-300">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left overflow-hidden">
              <span className="block text-xs font-bold text-white truncate">{user.name}</span>
              <span className="block text-[8px] font-semibold text-accent-green uppercase tracking-widest truncate">API: CONECTADO</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-3 rounded-xl border border-white/5 bg-white/5 text-zinc-400 font-title font-bold text-[10px] uppercase tracking-wider hover:bg-accent-red/10 hover:text-accent-red hover:border-accent-red/20 transition-all flex items-center justify-center gap-2 group"
          >
            <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Salir de la Consola
          </button>
        </div>
      </aside>

      {/* 3. MAIN WORKSPACE */}
      <main className="flex-grow flex flex-col overflow-hidden bg-black">
        
        <header className="border-b border-white/5 bg-zinc-950/15 p-6 flex justify-between items-center flex-shrink-0 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-32 bg-accent-green/3 rounded-full blur-[60px] pointer-events-none" />

          <div className="text-left relative z-10">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">CUENTA DE FONDEO SIMULADA</span>
            <h1 className="text-lg font-title font-extrabold text-white tracking-tight mt-0.5">{user.propFirm}</h1>
          </div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="text-right">
              <span className="block text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider mb-0.5 font-mono">BALANCE ACTUAL</span>
              <span className="block text-xl text-white font-mono leading-none">
                <Odometer value={balance} prefix="$" />
              </span>
            </div>
            <div className="h-8 w-[1px] bg-white/5" />
            <div className="text-right">
              <span className="block text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider mb-0.5 font-mono">DISTANCIA AL ABISMO (CUSHION)</span>
              <span className={`block text-xl leading-none font-mono ${currentCushionTheme.text}`}>
                <Odometer value={cushion} prefix="$" />
              </span>
            </div>
          </div>
        </header>

        {/* 4. TABS CONTENT */}
        <div className="flex-grow overflow-y-auto p-6 relative">
          
          <AnimatePresence mode="wait">
            
            {/* TAB: AGENDA DE OPERACIONES */}
            {activeTab === 'agenda' && (
              <motion.div
                key="agenda"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                
                {/* LADO IZQUIERDO: FORMULARIO */}
                <div className="lg:col-span-4 bg-zinc-950/20 border border-white/5 rounded-3xl p-5 flex flex-col gap-4 text-left backdrop-blur-xl">
                  <h3 className="font-title font-bold text-md text-white tracking-tight flex items-center gap-2 border-b border-white/5 pb-3">
                    <Calendar className="w-4 h-4 text-accent-purple" />
                    Agendar Nueva Operación
                  </h3>

                  <form onSubmit={handleScheduleTrade} className="flex flex-col gap-3.5">
                    <div className="grid grid-cols-2 gap-3.5">
                      <CustomSelect 
                        label="Activo" 
                        value={newAsset} 
                        options={assetOptions} 
                        onChange={setNewAsset} 
                      />

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">Dirección</label>
                        <div className="relative bg-black/60 border border-white/5 p-1 rounded-xl flex items-center h-10 mt-0.5">
                          <motion.div 
                            layout
                            className={`absolute w-[47%] h-[80%] rounded-lg ${newType === 'BUY' ? 'bg-accent-green/20 border border-accent-green/30' : 'bg-accent-red/20 border border-accent-red/30'}`}
                            style={{ left: newType === 'BUY' ? '4px' : 'calc(50% + 2px)' }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                          <button
                            type="button"
                            onClick={() => setNewType('BUY')}
                            className={`relative z-10 w-1/2 text-center text-[10px] font-title font-extrabold uppercase transition-colors duration-300 ${newType === 'BUY' ? 'text-accent-green' : 'text-zinc-500'}`}
                          >
                            Buy
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewType('SELL')}
                            className={`relative z-10 w-1/2 text-center text-[10px] font-title font-extrabold uppercase transition-colors duration-300 ${newType === 'SELL' ? 'text-accent-red' : 'text-zinc-500'}`}
                          >
                            Sell
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">Entrada ($)</label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="bg-black/60 border border-white/5 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-accent-purple/50 font-mono text-center backdrop-blur-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">Stop Loss ($)</label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={newSl}
                          onChange={(e) => setNewSl(e.target.value)}
                          className="bg-black/60 border border-white/5 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-accent-purple/50 font-mono text-center backdrop-blur-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">Take Profit ($)</label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={newTp}
                          onChange={(e) => setNewTp(e.target.value)}
                          className="bg-black/60 border border-white/5 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-accent-purple/50 font-mono text-center backdrop-blur-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <CustomSelect 
                        label="Riesgo" 
                        value={newRisk} 
                        options={riskOptions} 
                        onChange={setNewRisk} 
                      />
                      <CustomSelect 
                        label="Sesión Operativa" 
                        value={newSession} 
                        options={sessionOptions} 
                        onChange={setNewSession} 
                      />
                    </div>

                    <div className="h-[1px] bg-white/5 my-1" />

                    <CustomSelect 
                      label="Estado Emocional Pre-Trade" 
                      value={newEmotion} 
                      options={emotionOptions} 
                      onChange={setNewEmotion} 
                    />

                    <div className="grid grid-cols-2 gap-3 items-center mt-1">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">Calidad del Setup</label>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setNewConfluence(star)}
                              className={`transition-colors duration-150 transform hover:scale-110 active:scale-95 ${star <= newConfluence ? 'text-accent-gold' : 'text-zinc-700 hover:text-zinc-500'}`}
                            >
                              <Star className="w-4 h-4 fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          id="chk-rules"
                          checked={newChecklist}
                          onChange={(e) => setNewChecklist(e.target.checked)}
                          className="w-4 h-4 accent-accent-purple bg-black border border-white/10 rounded cursor-pointer"
                        />
                        <label htmlFor="chk-rules" className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest cursor-pointer select-none">Seguí mis reglas</label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="relative overflow-hidden font-title font-bold text-xs uppercase tracking-widest text-white shadow-xl hover:opacity-95 active:scale-[0.98] transition-all w-full py-4 mt-3 rounded-xl animate-shimmer flex items-center justify-center gap-2"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                      <Plus className="w-4 h-4" />
                      <span>Agendar en Bitácora</span>
                    </button>
                  </form>
                </div>

                {/* LADO DERECHO: BITÁCORA */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  <div className="bg-zinc-950/20 border border-white/5 rounded-3xl p-5 flex flex-col gap-4 backdrop-blur-xl">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3.5">
                      <h3 className="font-title font-bold text-md text-white tracking-tight flex items-center gap-2">
                        <Activity className="w-4 h-4 text-accent-blue" />
                        Plan de Operaciones y Bitácora Activa
                      </h3>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                        TOTAL AGENDADO: {trades.length}
                      </span>
                    </div>

                    <div className="overflow-x-auto w-full">
                      <table className="w-full border-collapse text-left text-xs font-body">
                        <thead>
                          <tr className="border-b border-white/5 text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">
                            <th className="pb-3.5 pr-2">Dirección</th>
                            <th className="pb-3.5 px-3">Activo</th>
                            <th className="pb-3.5 px-3">Entrada</th>
                            <th className="pb-3.5 px-3">R:R</th>
                            <th className="pb-3.5 px-3">Sesión</th>
                            <th className="pb-3.5 px-3">Fuga Emocional</th>
                            <th className="pb-3.5 px-3">Calidad</th>
                            <th className="pb-3.5 px-3 text-right">Resultado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {trades.map((trade) => {
                            const isWin = trade.status === 'WIN';
                            const isLoss = trade.status === 'LOSS';
                            const isPending = trade.status === 'PENDING';
                            const isActiveTrade = trade.status === 'ACTIVE';
                            const isSelected = selectedTradeId === trade.id;

                            return (
                              <tr 
                                key={trade.id} 
                                onClick={() => setSelectedTradeId(trade.id)}
                                className={`group hover:bg-white/5 transition-colors cursor-pointer ${isSelected ? 'bg-white/5 border-l-2 border-accent-purple' : ''}`}
                              >
                                <td className="py-3.5 pr-2 font-bold flex items-center gap-1.5 pl-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${trade.type === 'BUY' ? 'bg-accent-green shadow-[0_0_8px_var(--accent-green)]' : 'bg-accent-red shadow-[0_0_8px_var(--accent-red)]'}`} />
                                  <span className={trade.type === 'BUY' ? 'text-accent-green font-bold' : 'text-accent-red font-bold'}>{trade.type}</span>
                                </td>
                                <td className="py-3.5 px-3 font-title font-extrabold text-white">{trade.asset}</td>
                                <td className="py-3.5 px-3 font-mono text-zinc-300 font-bold">${trade.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="py-3.5 px-3 font-mono text-zinc-400 font-bold">{trade.rr} R</td>
                                <td className="py-3.5 px-3 text-zinc-500">{trade.session}</td>
                                <td className="py-3.5 px-3">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${trade.emotion === 'Calma' || trade.emotion === 'Automatizado' ? 'bg-accent-green/5 border-accent-green/20 text-accent-green font-bold' : 'bg-accent-red/5 border-accent-red/20 text-accent-red font-bold'}`}>
                                    {trade.emotion}
                                  </span>
                                </td>
                                <td className="py-3.5 px-3 text-accent-gold">
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: trade.confluence }).map((_, i) => (
                                      <Star key={i} className="w-3 h-3 fill-current" />
                                    ))}
                                  </div>
                                </td>
                                <td className="py-3.5 px-3 text-right">
                                  {isPending ? (
                                    <span className="text-[10px] font-bold text-accent-gold uppercase font-mono tracking-widest bg-accent-gold/10 px-2 py-0.5 border border-accent-gold/20 rounded-lg">PENDING</span>
                                  ) : isActiveTrade ? (
                                    <span className="text-[10px] font-bold text-accent-blue uppercase font-mono tracking-widest bg-accent-blue/10 px-2 py-0.5 border border-accent-blue/20 rounded-lg animate-pulse">ACTIVE</span>
                                  ) : (
                                    <div className="text-right font-mono font-bold">
                                      <span className={isWin ? 'text-accent-green font-bold text-sm' : 'text-accent-red font-bold text-sm'}>
                                        {isWin ? '+' : ''}${trade.netProfit.toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB: WORKSTATION / REAL TRADINGVIEW ADVANCED CHARTS EMULATOR */}
            {activeTab === 'workstation' && (
              <motion.div
                key="workstation"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full text-left"
              >
                {/* TRADINGVIEW ADVANCED WRAPPER */}
                <div className="lg:col-span-9 bg-zinc-950/20 border border-white/5 rounded-3xl p-5 flex flex-col gap-4 backdrop-blur-xl relative overflow-hidden">
                  
                  {/* WORKSTATION MODE SWITCHER */}
                  <div className="flex bg-black/60 border border-white/5 p-1 rounded-2xl w-full max-w-lg mx-auto relative z-10 text-[10px] font-mono font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setOperationMode('live');
                        logToConsole('Cambiado a Modo Análisis Pro (Widget TradingView Real)', 'info');
                      }}
                      className={`flex-1 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${operationMode === 'live' ? 'bg-accent-purple text-white shadow-lg shadow-purple-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span>Análisis Pro (TradingView Real)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOperationMode('replay');
                        logToConsole('Cambiado a Modo Entrenamiento Replay (Simulador Z3D)', 'info');
                      }}
                      className={`flex-1 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${operationMode === 'replay' ? 'bg-accent-blue text-white shadow-lg shadow-blue-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Entrenamiento Replay (Simulador Z3D)</span>
                    </button>
                  </div>

                  {/* TRADINGVIEW TOP BAR CONTROLS */}
                  <div className="flex flex-wrap justify-between items-center border-b border-white/5 pb-3.5 gap-3 relative z-10">
                    <div className="flex flex-wrap items-center gap-2">
                      
                      {/* Asset Dropdown Selector — All 17 real FX pairs */}
                      <div className="relative">
                        <select
                          value={activeAsset}
                          onChange={(e) => setActiveAsset(e.target.value)}
                          className="bg-black border border-white/10 text-white rounded-lg px-3 py-1.5 text-xs font-mono font-bold hover:border-accent-purple/50 focus:outline-none transition-colors"
                        >
                          <optgroup label="── Metales ──">
                            <option value="XAUUSD">XAUUSD (Oro)</option>
                            <option value="XAGUSD">XAGUSD (Plata)</option>
                          </optgroup>
                          <optgroup label="── Majors ──">
                            <option value="EURUSD">EURUSD</option>
                            <option value="GBPUSD">GBPUSD</option>
                            <option value="USDJPY">USDJPY</option>
                            <option value="USDCAD">USDCAD</option>
                            <option value="USDCHF">USDCHF</option>
                            <option value="AUDUSD">AUDUSD</option>
                            <option value="NZDUSD">NZDUSD</option>
                          </optgroup>
                          <optgroup label="── Crosses ──">
                            <option value="AUDJPY">AUDJPY</option>
                            <option value="CHFJPY">CHFJPY</option>
                            <option value="EURCAD">EURCAD</option>
                            <option value="EURGBP">EURGBP</option>
                            <option value="EURJPY">EURJPY</option>
                            <option value="GBPCHF">GBPCHF</option>
                            <option value="GBPJPY">GBPJPY</option>
                            <option value="NZDJPY">NZDJPY</option>
                          </optgroup>
                        </select>
                      </div>

                      <div className="h-5 w-[1px] bg-white/10" />

                      {operationMode === 'replay' ? (
                        <>
                          {/* Timeframe selector */}
                          <div className="flex bg-black border border-white/10 rounded-lg p-0.5 text-[10px] font-mono font-bold">
                            {['M5', 'M15', 'H1', 'D1'].map((tf) => (
                              <button
                                key={tf}
                                type="button"
                                onClick={() => {
                                  setTimeframe(tf);
                                  logToConsole(`Temporalidad del gráfico cambiada a ${tf}`, 'info');
                                }}
                                className={`px-2.5 py-1 rounded-md transition-colors ${timeframe === tf ? 'bg-accent-purple text-white' : 'text-zinc-500 hover:text-white'}`}
                              >
                                {tf}
                              </button>
                            ))}
                          </div>

                          <div className="h-5 w-[1px] bg-white/10" />

                          {/* Indicator Switchers */}
                          <div className="flex items-center gap-2 text-[10px] font-mono font-bold">
                            <button
                              type="button"
                              onClick={() => setIndicators(prev => ({ ...prev, ema50: !prev.ema50 }))}
                              className={`px-2 py-1 border rounded-lg transition-colors ${indicators.ema50 ? 'bg-blue-500/10 border-blue-500/40 text-blue-400' : 'bg-black border-white/10 text-zinc-500 hover:text-zinc-300'}`}
                            >
                              EMA 50
                            </button>
                            <button
                              type="button"
                              onClick={() => setIndicators(prev => ({ ...prev, ema200: !prev.ema200 }))}
                              className={`px-2 py-1 border rounded-lg transition-colors ${indicators.ema200 ? 'bg-purple-500/10 border-purple-500/40 text-purple-400' : 'bg-black border-white/10 text-zinc-500 hover:text-zinc-300'}`}
                            >
                              EMA 200
                            </button>
                            <button
                              type="button"
                              onClick={() => setIndicators(prev => ({ ...prev, volume: !prev.volume }))}
                              className={`px-2 py-1 border rounded-lg transition-colors ${indicators.volume ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-black border-white/10 text-zinc-500 hover:text-zinc-300'}`}
                            >
                              Volumen
                            </button>
                          </div>
                        </>
                      ) : (
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono pl-2">
                          💡 Herramientas, indicadores y temporalidades controlados nativamente por el Widget.
                        </span>
                      )}

                    </div>

                    {/* Active Ingress Tracking Notification HUD */}
                    {activeTradeForChart ? (
                      <div className="flex items-center gap-2 bg-accent-blue/10 border border-accent-blue/20 px-3 py-1 rounded-xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
                        <span className="text-[9px] font-bold text-accent-blue font-mono uppercase tracking-widest font-body">
                          TRACKING {activeTradeForChart.type} {activeTradeForChart.asset}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] font-extrabold text-zinc-600 uppercase tracking-widest font-mono">
                        {operationMode === 'live' ? 'NATIVE CHART WIDGET' : 'TV ADVANCED CHARTS CORE V5'}
                      </span>
                    )}
                  </div>

                  {/* MAIN CHART CONTAINER WITH CONDITIONAL SIDEBAR */}
                  <div className="flex-grow w-full min-h-[380px] h-[380px] relative bg-black rounded-2xl overflow-hidden border border-white/5 flex">
                    
                    {/* TRADINGVIEW LEFT DRAWING TOOLBAR - Render only in Replay mode */}
                    {operationMode === 'replay' && (
                      <div className="w-12 bg-zinc-950/80 border-r border-white/5 py-4 flex flex-col gap-3 items-center flex-shrink-0 select-none">
                        {[
                          { id: 'cursor', icon: 'Cursor', tooltip: 'Cursor de Selección' },
                          { id: 'trendline', icon: 'Trendline', tooltip: 'Línea de Tendencia (Fib)' },
                          { id: 'fibonacci', icon: 'Fibonacci', tooltip: 'Retroceso de Fibonacci' },
                          { id: 'long', icon: 'Long', tooltip: 'Posición Larga' },
                          { id: 'short', icon: 'Short', tooltip: 'Posición Corta' },
                          { id: 'text', icon: 'Text', tooltip: 'Caja de Texto' },
                          { id: 'ruler', icon: 'Ruler', tooltip: 'Medición de Rango (Ruler)' },
                          { id: 'clear', icon: 'Clear', tooltip: 'Borrar Dibujos' }
                        ].map((tool) => {
                          const isActive = activeDrawingTool === tool.id;
                          
                          return (
                            <button
                              key={tool.id}
                              type="button"
                              onClick={() => {
                                if (tool.id === 'clear') {
                                  setActiveDrawingTool('cursor');
                                  logToConsole('Dibujos y herramientas analíticas borrados del lienzo', 'info');
                                } else {
                                  setActiveDrawingTool(tool.id);
                                  logToConsole(`Herramienta activada: ${tool.tooltip}`, 'info');
                                }
                              }}
                              title={tool.tooltip}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isActive ? 'bg-accent-purple/20 border border-accent-purple text-accent-purple shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                            >
                              {tool.icon === 'Cursor' && <User className="w-4 h-4" />}
                              {tool.icon === 'Trendline' && <Activity className="w-4 h-4" />}
                              {tool.icon === 'Fibonacci' && <Sliders className="w-4 h-4" />}
                              {tool.icon === 'Long' && <TrendingUp className="w-4 h-4" />}
                              {tool.icon === 'Short' && <TrendingDown className="w-4 h-4" />}
                              {tool.icon === 'Text' && <Calendar className="w-4 h-4" />}
                              {tool.icon === 'Ruler' && <Zap className="w-4 h-4" />}
                              {tool.icon === 'Clear' && <XCircle className="w-4 h-4" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Canvas / Widget Wrapper */}
                    <div className="flex-grow h-full relative">
                      <WorkstationChart 
                        data={visibleChartData} 
                        activeTrade={activeTradeForChart} 
                        activeDrawingTool={activeDrawingTool}
                        indicators={indicators}
                        logToConsole={logToConsole}
                        operationMode={operationMode}
                        activeAsset={activeAsset}
                      />
                    </div>

                  </div>

                  {/* BOTTOM HUD: QUICK TRADE EXECUTION TERMINAL */}
                  <div className="bg-black/60 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-left backdrop-blur-md">
                    
                    {/* Execution Buttons Area */}
                    <div className="flex gap-3 w-full md:w-auto">
                      <button
                        type="button"
                        onClick={() => handleQuickExecuteTrade('BUY')}
                        className="flex-1 md:flex-none px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-title font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-[0.97]"
                      >
                        COMPRA RÁPIDA (BUY)
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleQuickExecuteTrade('SELL')}
                        className="flex-1 md:flex-none px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400 text-white font-title font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(244,63,94,0.2)] hover:shadow-[0_0_30px_rgba(244,63,94,0.4)] active:scale-[0.97]"
                      >
                        VENTA RÁPIDA (SELL)
                      </button>
                    </div>

                    {/* Trade Parameters Fields HUD */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto flex-grow md:justify-end text-xs font-mono font-bold">
                      
                      <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase tracking-widest mb-1">Precio Ejecución</span>
                        <span className="text-white text-sm bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5">
                          ${currentPrice > 0 ? currentPrice.toLocaleString(undefined, {minimumFractionDigits: getAssetDecimals(activeAsset)}) : 'Live Price'}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase tracking-widest mb-1">Riesgo a Perder</span>
                        <select
                          value={quickRisk}
                          onChange={(e) => setQuickRisk(e.target.value)}
                          className="bg-black/40 text-white px-2 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-accent-purple/50 text-xs"
                        >
                          <option value="150">$150 (0.3%)</option>
                          <option value="300">$300 (0.6%)</option>
                          <option value="500">$500 (1.0%)</option>
                          <option value="1000">$1000 (2.0%)</option>
                        </select>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase tracking-widest mb-1">Stop Loss sugerido</span>
                        <input
                          type="number"
                          step="any"
                          value={quickSlPrice}
                          onChange={(e) => setQuickSlPrice(e.target.value)}
                          className="bg-black/40 text-white px-2 py-1 rounded-lg border border-white/5 focus:outline-none focus:border-accent-purple/50 text-xs text-center w-24 font-mono"
                        />
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase tracking-widest mb-1">Ratio R:R objetivo</span>
                        <select
                          value={quickRR}
                          onChange={(e) => setQuickRR(e.target.value)}
                          className="bg-black/40 text-emerald-400 px-2 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-accent-purple/50 text-xs"
                        >
                          <option value="1.5">1:1.5 RR</option>
                          <option value="2.0">1:2.0 RR</option>
                          <option value="3.0">1:3.0 RR</option>
                          <option value="4.0">1:4.0 RR</option>
                        </select>
                      </div>

                    </div>

                  </div>

                </div>

                {/* BACKTEST PLAYBACK CONTROLLERS */}
                <div className="lg:col-span-3 flex flex-col gap-5 text-left h-full justify-between">
                  
                  {/* PLAYBACK PANEL */}
                  <div className="bg-zinc-950/30 border border-white/5 rounded-3xl p-5 flex flex-col gap-4">
                    
                    <h4 className="font-title font-bold text-xs text-white uppercase tracking-wider border-b border-white/5 pb-3">
                      Línea de Tiempo & Replay
                    </h4>
                    
                    <p className="text-[11px] text-zinc-400 font-body leading-relaxed">
                      Utiliza el Bar Replay para retroceder en el tiempo, planificar tu estrategia con el futuro oculto y reproducir el flujo vela por vela.
                    </p>

                    {/* Progress details */}
                    <div className="bg-black/60 border border-white/5 p-3.5 rounded-2xl flex flex-col gap-2 font-mono text-[10px]">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-bold uppercase">Par Activo:</span>
                        <span className="text-white font-bold">{activeAsset}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-bold uppercase">Progreso:</span>
                        <span className="text-white font-bold">{currentCandleIndex + 1} / {activeHistory.length} Velas</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-bold uppercase">Fecha Vela:</span>
                        <span className="text-accent-purple font-bold">
                          {activeHistory[currentCandleIndex] ? new Date(activeHistory[currentCandleIndex].time * 1000).toISOString().replace('T', ' ').slice(0, 19) : 'Cargando...'}
                        </span>
                      </div>
                    </div>

                    {/* Date Cutoff Selector (Bar Replay Cutoff) */}
                    <div className="flex flex-col gap-1.5 mt-1 text-left">
                      <label className="text-[8px] font-extrabold text-zinc-500 uppercase tracking-widest font-mono">Aplicar Corte Temporal</label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={cutoffDate}
                          onChange={(e) => setCutoffDate(e.target.value)}
                          className="bg-black border border-white/10 text-white rounded-lg px-2 py-1.5 text-[10px] font-mono flex-grow focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            // Buscar la fecha y cortar el gráfico
                            const targetTime = Math.floor(Date.parse(cutoffDate) / 1000);
                            if (isNaN(targetTime)) {
                              logToConsole(`Fecha cutoff inválida: ${cutoffDate}`, 'error');
                              return;
                            }
                            // Encontrar el índice de vela coincidente
                            let index = 20;
                            for (let i = 0; i < activeHistory.length; i++) {
                              if (activeHistory[i].time >= targetTime) {
                                index = i;
                                break;
                              }
                            }
                            setCurrentCandleIndex(index);
                            setIsPlaying(false);
                            logToConsole(`Corte Temporal aplicado a ${cutoffDate}. Futuro bloqueado para backtesting.`, 'success');
                          }}
                          className="bg-accent-purple hover:bg-purple-600 text-white text-[9px] font-bold uppercase px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Ir
                        </button>
                      </div>
                    </div>

                    {/* Playback speed switcher */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8px] font-extrabold text-zinc-500 uppercase tracking-widest font-mono">Velocidad del Flujo</label>
                      <div className="grid grid-cols-3 gap-1 bg-black/60 border border-white/5 p-1 rounded-xl text-center">
                        {[[1500, '1x'], [600, '2x'], [250, '4x']].map(([speed, label]) => (
                          <button 
                            key={speed}
                            type="button" 
                            onClick={() => setPlaybackSpeed(speed)}
                            className={`py-1 rounded-lg text-[9px] font-mono font-bold uppercase transition-all ${playbackSpeed === speed ? 'bg-white/10 text-white shadow-inner' : 'text-zinc-600 hover:text-zinc-400'}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-[1px] bg-white/5 my-1" />

                    {/* Playback action buttons */}
                    <div className="flex flex-col gap-2.5">
                      
                      {/* Play/Pause Button */}
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-full py-3.5 rounded-xl font-title font-extrabold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${isPlaying ? 'bg-accent-gold/10 border border-accent-gold/30 text-accent-gold shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'bg-white text-black hover:bg-zinc-200'}`}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-4 h-4 animate-pulse" />
                            <span>Pausar Replay</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>Iniciar Replay</span>
                          </>
                        )}
                      </button>

                      {/* Step next candle and Reset buttons */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          onClick={handleStepNextCandle}
                          disabled={isPlaying}
                          className="py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white font-title font-extrabold text-[10px] uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                          <span>+1 Vela</span>
                        </button>
                        
                        <button
                          onClick={handleResetSimulator}
                          className="py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white font-title font-extrabold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset</span>
                        </button>
                      </div>

                    </div>

                  </div>

                  {/* SCENARIOS LIST HUD + ENGINE STATS */}
                  <div className="bg-zinc-950/30 border border-white/5 rounded-3xl p-5 flex flex-col gap-3 flex-grow">
                    <span className="text-[8px] font-extrabold text-zinc-500 uppercase tracking-widest font-mono">Escenarios Históricos (17 Pares)</span>
                    
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                      {[
                        { label: 'Récords Históricos Oro (2026)', asset: 'XAUUSD', date: '2026-05-01' },
                        { label: 'Plata Rally (2025)', asset: 'XAGUSD', date: '2025-01-01' },
                        { label: 'EUR/USD Volatilidad (2024)', asset: 'EURUSD', date: '2024-05-01' },
                        { label: 'GBP/USD Brexit Eco (2023)', asset: 'GBPUSD', date: '2023-06-01' },
                        { label: 'USD/JPY Carry Trade (2024)', asset: 'USDJPY', date: '2024-03-01' },
                        { label: 'GBP/JPY Flash (2022)', asset: 'GBPJPY', date: '2022-09-01' },
                        { label: 'EUR/JPY Divergencia (2024)', asset: 'EURJPY', date: '2024-01-01' },
                        { label: 'AUD/USD Comodidades (2023)', asset: 'AUDUSD', date: '2023-08-01' },
                      ].map((scen) => (
                        <button
                          key={scen.label}
                          type="button"
                          onClick={() => {
                            setActiveAsset(scen.asset);
                            setCutoffDate(scen.date);
                            const rawData = assetDatabase[scen.asset] || assetDatabase.XAUUSD;
                            const targetTime = Math.floor(Date.parse(scen.date) / 1000);
                            let idx = 20;
                            for (let i = 0; i < rawData.length; i++) {
                              const t = typeof rawData[i].time === 'number' ? rawData[i].time : Math.floor(Date.parse(rawData[i].time) / 1000);
                              if (t >= targetTime) {
                                idx = i;
                                break;
                              }
                            }
                            setCurrentCandleIndex(idx);
                            setIsPlaying(false);
                            logToConsole(`Escenario Activado: ${scen.label}. Gráfico movido a ${scen.date}.`, 'success');
                          }}
                          className="w-full flex justify-between items-center bg-black/40 border border-white/5 hover:border-white/10 p-2.5 rounded-xl text-[10px] font-mono text-zinc-400 hover:text-white transition-all text-left"
                        >
                          <span className="font-bold truncate">{scen.label}</span>
                          <span className="text-[9px] text-accent-purple font-extrabold flex-shrink-0 ml-2">{scen.asset}</span>
                        </button>
                      ))}
                    </div>

                    {/* ENGINE STATS READOUT */}
                    {engineSnapshot && (
                      <div className="border-t border-white/5 pt-3 flex flex-col gap-1.5 font-mono text-[9px]">
                        <span className="text-[8px] font-extrabold text-zinc-500 uppercase tracking-widest mb-1">Motor Fintech (Stats)</span>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <div className="flex justify-between"><span className="text-zinc-500">Trades:</span><span className="text-white font-bold">{engineSnapshot.stats.totalTrades}</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">Win Rate:</span><span className={`font-bold ${engineSnapshot.winRate >= 50 ? 'text-accent-green' : 'text-accent-red'}`}>{engineSnapshot.winRate}%</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">P&L Neto:</span><span className={`font-bold ${engineSnapshot.stats.totalPnl >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>${engineSnapshot.stats.totalPnl.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">Profit Factor:</span><span className="text-white font-bold">{engineSnapshot.profitFactor === Infinity ? '∞' : engineSnapshot.profitFactor}</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">Spread Pagado:</span><span className="text-accent-red font-bold">-${engineSnapshot.stats.totalSpreadPaid.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">Comisiones:</span><span className="text-accent-red font-bold">-${engineSnapshot.stats.totalCommissionPaid.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">Mayor Win:</span><span className="text-accent-green font-bold">+${engineSnapshot.stats.largestWin.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">Mayor Loss:</span><span className="text-accent-red font-bold">${engineSnapshot.stats.largestLoss.toFixed(2)}</span></div>
                        </div>
                        {engineSnapshot.activePositions.length > 0 && (
                          <div className="mt-1.5 p-2 bg-accent-blue/5 border border-accent-blue/20 rounded-lg">
                            <span className="text-accent-blue font-bold">P&L Flotante: ${engineSnapshot.floatingPnL.toFixed(2)}</span>
                            <span className="text-zinc-500 ml-2">({engineSnapshot.activePositions.length} pos abiertas)</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>

              </motion.div>
            )}

            {/* TAB: BITÁCORA Y CONSOLA DE AUDITORÍA */}
            {activeTab === 'webhook' && (
              <motion.div
                key="webhook"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left"
              >
                
                {/* LADO IZQUIERDO: GESTOR DE BITÁCORA */}
                <div className="lg:col-span-5 bg-zinc-950/20 border border-white/5 rounded-3xl p-6 flex flex-col gap-6 backdrop-blur-xl">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/20 text-[9px] font-extrabold text-accent-gold uppercase tracking-widest">
                      BACKTEST AUDITOR SYSTEM
                    </span>
                    <h3 className="font-title font-extrabold text-lg text-white mt-3.5 tracking-tight">
                      Diario de Backtesting y Datos
                    </h3>
                    <p className="text-zinc-400 text-xs mt-1.5 font-body leading-relaxed">
                      Supervisa, audita y gestiona el historial de tu sesión de replay actual. Puedes descargar todos tus trades simulados en un archivo CSV profesional para analizarlos en Excel, o vaciar el registro para empezar de cero.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button
                      onClick={exportToCSV}
                      className="relative overflow-hidden font-title font-bold text-xs uppercase tracking-widest text-white bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
                    >
                      <History className="w-4 h-4 text-accent-purple" />
                      <span>Exportar Diario a CSV</span>
                    </button>

                    <button
                      onClick={handleResetSimulator}
                      className="relative overflow-hidden font-title font-bold text-xs uppercase tracking-widest text-zinc-400 bg-black/40 border border-white/5 hover:border-accent-red/20 hover:text-white active:scale-[0.98] transition-all w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4 text-accent-red" />
                      <span>Reiniciar Sesión de Replay</span>
                    </button>
                  </div>

                  <div className="h-[1px] bg-white/5 my-1" />

                  <button
                    onClick={triggerTVSimulation}
                    disabled={isSimulatingTV}
                    className={`relative overflow-hidden font-title font-bold text-xs uppercase tracking-widest text-white shadow-xl active:scale-[0.98] transition-all w-full py-4 rounded-xl flex items-center justify-center gap-2 ${isSimulatingTV ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed animate-none' : 'animate-shimmer'}`}
                  >
                    <Zap className={`w-4 h-4 ${isSimulatingTV ? 'text-zinc-500' : 'text-accent-gold alarm-blink-red'}`} />
                    <span>{isSimulatingTV ? 'SIMULANDO EJECUCIÓN...' : 'Inyectar Operación de Prueba'}</span>
                  </button>
                </div>

                {/* LADO DERECHO: VERCEL STYLE TERMINAL */}
                <div className="lg:col-span-7 bg-zinc-950/20 border border-white/5 rounded-3xl p-5 flex flex-col gap-4 backdrop-blur-xl">
                  
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h3 className="font-title font-bold text-sm text-white tracking-tight flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-accent-gold" />
                      Consola de Auditoría del Motor de Replay
                    </h3>
                    <button 
                      onClick={() => setWebhookLogs([{ id: 1, time: '11:00:02', text: 'Canal webhook inicializado correctamente', type: 'info' }])}
                      className="text-[9px] font-extrabold text-zinc-500 hover:text-white uppercase tracking-widest font-mono"
                    >
                      Limpiar
                    </button>
                  </div>

                  <div className="flex-grow h-72 vercel-terminal rounded-2xl p-5 text-[10px] overflow-y-auto flex flex-col gap-2.5 shadow-inner">
                    {webhookLogs.map((log) => {
                      let tagColor = 'text-accent-blue';
                      if (log.type === 'success') tagColor = 'text-accent-green';
                      if (log.type === 'pending') tagColor = 'text-accent-purple';
                      if (log.type === 'error') tagColor = 'text-accent-red';
                      
                      return (
                        <div key={log.id} className="flex gap-3 items-start leading-normal">
                          <span className="text-zinc-600 flex-shrink-0 font-bold font-mono">[{log.time}]</span>
                          <span className={`font-extrabold flex-shrink-0 font-mono tracking-wider ${tagColor}`}>
                            {log.type.toUpperCase()}:
                          </span>
                          <span className="text-zinc-300 font-medium font-mono text-left">{log.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB: AUDITORÍA DE RIESGO E INTRODUCCIÓN DEL TRAILING DRAWDOWN */}
            {activeTab === 'compliance' && (
              <motion.div
                key="compliance"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left"
              >
                
                {/* LADO IZQUIERDO: DETALLES DE AUDITORÍA */}
                <div className="lg:col-span-6 bg-zinc-950/20 border border-white/5 rounded-3xl p-6 flex flex-col gap-6 backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial-gradient from-accent-purple/3 to-transparent pointer-events-none" />
 
                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-green/10 border border-accent-green/20 text-[9px] font-extrabold text-accent-green uppercase tracking-widest">
                      SIMULACIÓN DE REGLAS PROP FIRMS
                    </span>
                    <h3 className="font-title font-extrabold text-lg text-white mt-3.5 tracking-tight">
                      Simulador de Drawdown Dinámico (Replay)
                    </h3>
                    <p className="text-zinc-400 text-xs mt-1.5 font-body leading-relaxed">
                      El <strong className="text-white font-extrabold">Intraday Trailing Drawdown</strong> es la regla de liquidación más severa en firmas como Apex y Topstep. Se calcula persiguiendo el punto más alto que haya alcanzado tu equidad flotante en tiempo real. En ReefReplay, nuestro motor offline simula este límite para que entrenes tu estrategia en las condiciones exactas de las cuentas de fondeo antes de comprar una cuenta real.
                    </p>
                  </div>
 
                  <div className="flex flex-col gap-4 border-t border-white/5 pt-5 relative z-10">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-bold uppercase tracking-wider font-mono">Máximo Saldo Alcanzado (Peak)</span>
                      <span className="text-white font-mono font-extrabold text-sm">${peakBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-bold uppercase tracking-wider font-mono">Umbral de Liquidación Restrictivo</span>
                      <span className="text-accent-red font-mono font-extrabold text-sm">${trailingDrawdownLimit.toLocaleString()}</span>
                    </div>
                    <div className="h-[1px] bg-white/5 my-1" />
                    
                    {/* Visual Cushion Meter Indicator */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400 font-extrabold uppercase tracking-wider mb-0.5 font-mono">Colchón Disponible (Cushion)</span>
                        <span className={`font-mono font-extrabold text-sm ${currentCushionTheme.text}`}>
                          ${cushion.toLocaleString()}
                        </span>
                      </div>
                      
                      {/* Dynamic Color-Shifting Progress Bar */}
                      <div className="w-full bg-zinc-900/60 border border-white/5 rounded-full h-3 overflow-hidden p-0.5 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${cushionPercent}%` }}
                          transition={{ type: "spring", stiffness: 200, damping: 25 }}
                          className={`h-full rounded-full transition-all duration-500 ${currentCushionTheme.bar}`}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                        <span>ABISMO ($0)</span>
                        <span>ACTIVO ({cushionPercent.toFixed(0)}%)</span>
                        <span>MÁXIMO ($2,500)</span>
                      </div>
                    </div>
                  </div>
                </div>
 
                {/* LADO DERECHO: INTERFACE DE CÁLCULO DE FRICCIÓN */}
                <div className="lg:col-span-6 bg-zinc-950/20 border border-white/5 rounded-3xl p-6 flex flex-col gap-5 justify-between backdrop-blur-xl">
                  <div className="flex flex-col gap-4">
                    <h4 className="font-title font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-accent-gold" />
                      Impacto del Desgaste y la Fricción Real
                    </h4>
                    <p className="text-[11px] text-zinc-400 font-body leading-relaxed">
                      El backtesting tradicional peca de ser "perfecto". En la realidad, el spread variable y la comisión round-trip reducen tus ganancias. ReefReplay calcula esta fricción en cada trade simulado para darte estadísticas 100% reales en tu diario de backtest.
                    </p>
 
                    <div className="bg-black/60 border border-white/5 rounded-2xl p-4.5 flex flex-col gap-3 font-mono text-[10px]">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Pérdida Teórica de la Agenda:</span>
                        <span className="text-white font-bold font-mono">-$500.00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Spread Total Pagado (Sesión):</span>
                        <span className="text-accent-red font-bold font-mono">-${engineSnapshot ? engineSnapshot.stats.totalSpreadPaid.toFixed(2) : '0.00'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Comisiones Round-Trip (Sesión):</span>
                        <span className="text-accent-red font-bold font-mono">-${engineSnapshot ? engineSnapshot.stats.totalCommissionPaid.toFixed(2) : '0.00'}</span>
                      </div>
                      <div className="h-[1px] bg-white/10 my-1" />
                      <div className="flex justify-between items-center font-bold text-sm">
                        <span className="text-zinc-400 font-bold">P&L Neto Real de la Sesión:</span>
                        <span className={`font-bold font-mono ${engineSnapshot && engineSnapshot.stats.totalPnl >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                          {engineSnapshot ? (engineSnapshot.stats.totalPnl >= 0 ? '+' : '') + '$' + engineSnapshot.stats.totalPnl.toFixed(2) : '$0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
 
                  <div className={`border rounded-2xl p-4 flex items-center gap-3.5 transition-all duration-500 ${currentCushionTheme.border}`}>
                    <div className={`p-2.5 rounded-xl flex-shrink-0 bg-white/5 text-zinc-400 ${currentCushionTheme.text}`}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="text-left text-[11px] leading-normal font-body text-zinc-300">
                      <span className="text-accent-green font-bold">Reef Defender</span> está operando. Tu bitácora de agenda calcula en tiempo real la fricción de tu broker y re-ajusta tu lotaje pre-trade para impedir que violes el drawdown.
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB: RETOS DE FONDEO (PROP FIRM SIMULATOR) */}
            {activeTab === 'retos' && (
              <motion.div
                key="retos"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col gap-6 text-left"
              >
                
                {/* BANNER DE INICIO */}
                <div className="relative w-full rounded-3xl border border-white/5 bg-zinc-950/20 p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 backdrop-blur-xl overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-radial-gradient from-accent-purple/5 to-transparent pointer-events-none" />
                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-[9px] font-extrabold text-accent-purple uppercase tracking-widest">
                      PROP CHALLENGES GAMIFIED
                    </span>
                    <h3 className="font-title font-black text-xl text-white mt-3 tracking-tight">
                      Desafíos de Fondeo en Replay
                    </h3>
                    <p className="text-zinc-400 text-xs mt-1.5 font-body leading-relaxed max-w-xl">
                      Entrena bajo las reglas exactas de las firmas de fondeo de Forex y Futuros más grandes del mundo. Testea tu disciplina vela a vela en un entorno real de replay sin arriesgar miles de dólares en evaluaciones fallidas.
                    </p>
                  </div>
                  
                  {/* CATEGORY SWITCHER */}
                  <div className="relative z-10 flex bg-black/60 border border-white/5 p-1 rounded-xl backdrop-blur-sm self-start sm:self-center">
                    <button
                      onClick={() => setSelectedPropCategory('futures')}
                      className={`px-4 py-2 rounded-lg text-xs font-title font-bold uppercase tracking-wider transition-all duration-200 ${selectedPropCategory === 'futures' ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Futuros (Futures)
                    </button>
                    <button
                      onClick={() => setSelectedPropCategory('forex')}
                      className={`px-4 py-2 rounded-lg text-xs font-title font-bold uppercase tracking-wider transition-all duration-200 ${selectedPropCategory === 'forex' ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      CFD / Forex
                    </button>
                  </div>
                </div>

                {/* ACTIVE CHALLENGE HUD CONTROL */}
                {activeChallenge && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`relative w-full rounded-3xl border p-6 flex flex-col gap-6 backdrop-blur-xl overflow-hidden shadow-3d ${activeChallenge.status === 'PASSED' ? 'border-accent-green/30 bg-accent-green/5 shadow-3d-neon-green/5' : activeChallenge.status === 'FAILED' ? 'border-accent-red/30 bg-accent-red/5 shadow-3d-neon-red/5' : 'border-accent-blue/20 bg-zinc-950/40 shadow-inner'}`}
                  >
                    <div className="absolute inset-0 bg-radial-gradient from-accent-blue/3 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full alarm-blink-red ${activeChallenge.status === 'PASSED' ? 'bg-accent-green' : activeChallenge.status === 'FAILED' ? 'bg-accent-red' : 'bg-accent-blue'}`} />
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Desafío en Curso Activo</span>
                        </div>
                        <h4 className="font-title font-black text-lg text-white mt-1">
                          {activeChallenge.firm} — <span className="bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-fill-transparent text-transparent">{activeChallenge.size}</span>
                        </h4>
                      </div>

                      <div className="flex gap-3">
                        {activeChallenge.status !== 'RUNNING' ? (
                          <button
                            onClick={handleAbandonChallenge}
                            className="px-5 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 font-title font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                          >
                            Volver al Modo Libre
                          </button>
                        ) : (
                          <button
                            onClick={handleAbandonChallenge}
                            className="px-5 py-2.5 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red hover:bg-accent-red/20 font-title font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                          >
                            Abandonar Desafío
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/5 pt-5">
                      <div className="bg-black/40 border border-white/5 p-3 rounded-2xl">
                        <span className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Balance de Cuenta</span>
                        <span className="block text-base font-mono font-black text-white mt-1">${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>

                      <div className="bg-black/40 border border-white/5 p-3 rounded-2xl">
                        <span className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Objetivo de Ganancia</span>
                        <span className="block text-base font-mono font-black text-accent-green mt-1">+${activeChallenge.target.toLocaleString()}</span>
                      </div>

                      <div className="bg-black/40 border border-white/5 p-3 rounded-2xl">
                        <span className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Colchón de Drawdown</span>
                        <span className={`block text-base font-mono font-black mt-1 ${engineSnapshot && engineSnapshot.cushion <= 0 ? 'text-accent-red alarm-blink-red' : 'text-accent-blue'}`}>
                          ${engineSnapshot ? engineSnapshot.cushion.toLocaleString(undefined, {minimumFractionDigits: 2}) : '$0.00'}
                        </span>
                      </div>

                      <div className="bg-black/40 border border-white/5 p-3 rounded-2xl">
                        <span className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Límite Diario</span>
                        <span className="block text-base font-mono font-black text-zinc-400 mt-1">
                          {activeChallenge.dailyLimit > 0 ? `-$${activeChallenge.dailyLimit.toLocaleString()}` : 'Sin límite'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar target */}
                    {activeChallenge.status === 'RUNNING' && (
                      <div className="relative z-10 flex flex-col gap-2 border-t border-white/5 pt-5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider font-mono">
                          <span className="text-zinc-500">Progreso del Desafío</span>
                          <span className="text-accent-green">
                            ${Math.max(0, balance - activeChallenge.initialBalance).toLocaleString(undefined, {maximumFractionDigits: 2})} / ${activeChallenge.target.toLocaleString()} ({Math.min(100, Math.max(0, (balance - activeChallenge.initialBalance) / activeChallenge.target * 100)).toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-zinc-900/60 border border-white/5 rounded-full h-3 overflow-hidden p-0.5 shadow-inner">
                          <div 
                            style={{ width: `${Math.min(100, Math.max(0, (balance - activeChallenge.initialBalance) / activeChallenge.target * 100))}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-green transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Banner Status */}
                    {activeChallenge.status === 'PASSED' && (
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative z-10 border border-accent-green/20 bg-accent-green/10 p-4.5 rounded-2xl flex items-center gap-3.5"
                      >
                        <Trophy className="w-8 h-8 text-accent-green flex-shrink-0 alarm-blink-red" />
                        <div className="text-left">
                          <span className="block text-xs font-black text-white uppercase tracking-wider">¡DESAFÍO SUPERADO CON ÉXITO! 🎉</span>
                          <span className="block text-[10px] text-zinc-300 font-body leading-relaxed mt-0.5">
                            Has alcanzado el objetivo de beneficio de +${activeChallenge.target.toLocaleString()} respetando al pie de la letra las reglas del drawdown y los límites de la cuenta. ¡Tu bitácora demuestra una consistencia de nivel profesional!
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {activeChallenge.status === 'FAILED' && (
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative z-10 border border-accent-red/20 bg-accent-red/10 p-4.5 rounded-2xl flex items-center gap-3.5"
                      >
                        <AlertTriangle className="w-8 h-8 text-accent-red flex-shrink-0 alarm-blink-red" />
                        <div className="text-left">
                          <span className="block text-xs font-black text-white uppercase tracking-wider">DESAFÍO FALLIDO (CUENTA LIQUIDADA) ❌</span>
                          <span className="block text-[10px] text-zinc-300 font-body leading-relaxed mt-0.5">
                            Has violado el límite de Drawdown Dinámico o la pérdida máxima diaria permitida por la empresa de fondeo. Haz clic en "Volver al Modo Libre" o reinicia la sesión para volver a intentarlo y entrenar tu disciplina.
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* CHALLENGES CARDS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {PROP_CHALLENGES[selectedPropCategory].map((challenge) => {
                    const isCurrentChallenge = activeChallenge && activeChallenge.id === challenge.id;
                    const isDisabled = activeChallenge && activeChallenge.status === 'RUNNING';
                    
                    return (
                      <div 
                        key={challenge.id}
                        className={`relative rounded-3xl border bg-zinc-950/20 backdrop-blur-xl p-5 flex flex-col justify-between gap-5 transition-all duration-300 shadow-3d hover:border-white/10 ${isCurrentChallenge ? 'border-accent-purple/40 shadow-3d-neon-purple/5' : 'border-white/5'}`}
                      >
                        {isCurrentChallenge && (
                          <div className="absolute top-0 right-6 -translate-y-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple text-[8px] font-extrabold uppercase tracking-widest text-white shadow-lg alarm-blink-red">
                            <Trophy className="w-2.5 h-2.5" />
                            Reto Activo
                          </div>
                        )}

                        <div className="flex flex-col gap-3">
                          <div className="text-left">
                            <span className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{challenge.firm}</span>
                            <h4 className="font-title font-black text-base text-white mt-0.5">{challenge.size}</h4>
                          </div>

                          <div className="h-[1px] bg-white/5" />

                          {/* Challenge Specs Table */}
                          <div className="flex flex-col gap-2 text-[10px] font-mono">
                            <div className="flex justify-between text-zinc-500">
                              <span>Objetivo:</span>
                              <span className="text-accent-green font-bold">+${challenge.target.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-zinc-500">
                              <span>Drawdown Máx:</span>
                              <span className="text-accent-red font-bold">-${challenge.maxDrawdown.toLocaleString()} ({challenge.drawdownType})</span>
                            </div>
                            <div className="flex justify-between text-zinc-500">
                              <span>Pérdida Diaria:</span>
                              <span className="text-zinc-300 font-bold">{challenge.dailyLimit > 0 ? `-$${challenge.dailyLimit.toLocaleString()}` : 'Sin límite'}</span>
                            </div>
                            {challenge.leverage ? (
                              <div className="flex justify-between text-zinc-500">
                                <span>Apalancamiento:</span>
                                <span className="text-accent-blue font-bold">{challenge.leverage}</span>
                              </div>
                            ) : (
                              <div className="flex justify-between text-zinc-500">
                                <span>Contratos Máx:</span>
                                <span className="text-accent-blue font-bold">{challenge.contracts}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-zinc-500 border-t border-white/5 pt-2 mt-1">
                              <span>Costo de Acceso:</span>
                              <span className="text-zinc-400 font-bold">{challenge.fee}</span>
                            </div>
                          </div>
                        </div>

                        {isCurrentChallenge ? (
                          <button
                            onClick={handleAbandonChallenge}
                            className="w-full py-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red font-title font-bold text-xs uppercase tracking-widest hover:bg-accent-red/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Terminar Desafío</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartChallenge(challenge)}
                            disabled={isDisabled}
                            className={`w-full py-3 rounded-xl font-title font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-95 ${isDisabled ? 'bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/5 border-transparent'}`}
                          >
                            <Trophy className="w-4 h-4 text-accent-gold alarm-blink-red" />
                            <span>Iniciar Desafío</span>
                          </button>
                        )}

                      </div>
                    );
                  })}
                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </main>

    </div>
  );
}
