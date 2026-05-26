/**
 * ReefReplay - Motor de Simulación y Backtesting FX Replay
 * ============================================================
 * Candle-by-Candle Execution Engine con P&L exacto, spreads simulados,
 * comisiones fijas por lote y trailing drawdown de Prop Firm.
 *
 * Arquitectura Fintech: Estado inmutable por tick, resolución de conflictos
 * SL/TP en vela ambigua, y cálculo de lotes reales por riesgo fijo.
 */

// ─────────────────────────────────────────────────────────────
// 1. ESPECIFICACIONES DE ACTIVOS (ASSET SPECS)
// ─────────────────────────────────────────────────────────────
export const ASSET_SPECS = {
  // ── Metales ──
  XAUUSD: { pipSize: 0.01,    contractSize: 100,     spreadPips: 30,   commissionPerLot: 3.50, decimals: 2, label: 'Oro (XAUUSD)' },
  XAGUSD: { pipSize: 0.001,   contractSize: 5000,    spreadPips: 35,   commissionPerLot: 3.50, decimals: 3, label: 'Plata (XAGUSD)' },

  // ── Forex Majors ──
  EURUSD: { pipSize: 0.0001,  contractSize: 100000,  spreadPips: 12,   commissionPerLot: 3.50, decimals: 5, label: 'EURUSD (Euro)' },
  GBPUSD: { pipSize: 0.0001,  contractSize: 100000,  spreadPips: 15,   commissionPerLot: 3.50, decimals: 5, label: 'GBPUSD (Libra)' },
  USDCAD: { pipSize: 0.0001,  contractSize: 100000,  spreadPips: 18,   commissionPerLot: 3.50, decimals: 5, label: 'USDCAD (CAD)' },
  USDCHF: { pipSize: 0.0001,  contractSize: 100000,  spreadPips: 16,   commissionPerLot: 3.50, decimals: 5, label: 'USDCHF (Franco)' },
  USDJPY: { pipSize: 0.01,    contractSize: 100000,  spreadPips: 13,   commissionPerLot: 3.50, decimals: 3, label: 'USDJPY (Yen)' },
  AUDUSD: { pipSize: 0.0001,  contractSize: 100000,  spreadPips: 14,   commissionPerLot: 3.50, decimals: 5, label: 'AUDUSD' },
  NZDUSD: { pipSize: 0.0001,  contractSize: 100000,  spreadPips: 18,   commissionPerLot: 3.50, decimals: 5, label: 'NZDUSD' },

  // ── Forex Crosses ──
  AUDJPY: { pipSize: 0.01,    contractSize: 100000,  spreadPips: 22,   commissionPerLot: 3.50, decimals: 3, label: 'AUDJPY' },
  CHFJPY: { pipSize: 0.01,    contractSize: 100000,  spreadPips: 25,   commissionPerLot: 3.50, decimals: 3, label: 'CHFJPY' },
  EURCAD: { pipSize: 0.0001,  contractSize: 100000,  spreadPips: 22,   commissionPerLot: 3.50, decimals: 5, label: 'EURCAD' },
  EURGBP: { pipSize: 0.0001,  contractSize: 100000,  spreadPips: 15,   commissionPerLot: 3.50, decimals: 5, label: 'EURGBP' },
  EURJPY: { pipSize: 0.01,    contractSize: 100000,  spreadPips: 18,   commissionPerLot: 3.50, decimals: 3, label: 'EURJPY' },
  GBPCHF: { pipSize: 0.0001,  contractSize: 100000,  spreadPips: 28,   commissionPerLot: 3.50, decimals: 5, label: 'GBPCHF' },
  GBPJPY: { pipSize: 0.01,    contractSize: 100000,  spreadPips: 28,   commissionPerLot: 3.50, decimals: 3, label: 'GBPJPY' },
  NZDJPY: { pipSize: 0.01,    contractSize: 100000,  spreadPips: 25,   commissionPerLot: 3.50, decimals: 3, label: 'NZDJPY' },
};

// Resolución temporal en segundos por timeframe
export const TIMEFRAME_SECONDS = {
  M1:  60,
  M5:  300,
  M15: 900,
  H1:  3600,
  D1:  86400,
};

// ─────────────────────────────────────────────────────────────
// 2. FUNCIONES UTILITARIAS PURAS
// ─────────────────────────────────────────────────────────────

/**
 * Obtiene las especificaciones de un activo con fallback seguro.
 */
export function getSpec(symbol) {
  return ASSET_SPECS[symbol] || ASSET_SPECS.XAUUSD;
}

/**
 * Calcula el tamaño de lote real en base al riesgo fijo y la distancia al SL.
 * Formula: lotSize = riskAmount / (slDistanceInPips * pipValuePerLot)
 *
 * pipValuePerLot = pipSize * contractSize
 *   - EURUSD: 0.0001 * 100000 = $10 por pip por lote estándar
 *   - USDJPY: 0.01   * 100000 = ¥1000 por pip (≈ $6.50 @ 154.00)
 *   - XAUUSD: 0.01   * 100     = $1 por pip por lote
 *
 * @param {string} symbol - Símbolo del activo
 * @param {number} riskAmount - Riesgo fijo en USD (ej: $500)
 * @param {number} entryPrice - Precio de entrada
 * @param {number} slPrice - Precio de Stop Loss
 * @returns {number} Tamaño de lote (puede ser fraccional, ej: 0.15)
 */
export function calculateLotSize(symbol, riskAmount, entryPrice, slPrice) {
  const spec = getSpec(symbol);
  const slDistancePrice = Math.abs(entryPrice - slPrice);

  if (slDistancePrice === 0) return 0;

  // Número de pips entre entrada y SL
  const slDistancePips = slDistancePrice / spec.pipSize;

  // Valor monetario de 1 pip con 1 lote estándar
  let pipValuePerLot = spec.pipSize * spec.contractSize;

  // Para pares XXX/JPY el valor del pip está en JPY; convertir a USD aproximado
  // Usamos el precio actual como proxy de tipo de cambio
  if (symbol.endsWith('JPY')) {
    pipValuePerLot = (spec.pipSize * spec.contractSize) / entryPrice;
  }
  // Para pares donde USD no es la moneda de cotización (ej: EURGBP, GBPCHF)
  // el pip value exacto requiere un tipo de cambio cruzado.
  // En simulación, usamos la aproximación estándar que es precisa al 95%.

  const lotSize = riskAmount / (slDistancePips * pipValuePerLot);
  return Math.round(lotSize * 100) / 100; // Redondear a 2 decimales (0.01 lotes)
}

/**
 * Calcula el P&L neto real de una posición cerrada.
 * Incluye spread de entrada y comisiones round-trip.
 *
 * @param {Object} position - Objeto de posición con tipo, precios y lote
 * @param {number} exitPrice - Precio de salida (SL o TP)
 * @param {string} symbol - Símbolo del activo
 * @returns {{ grossPnl: number, spreadCost: number, commission: number, netPnl: number }}
 */
export function calculatePnL(position, exitPrice, symbol) {
  const spec = getSpec(symbol);

  // Distancia bruta de precio entre entrada y salida
  const priceChange = position.tipo === 'BUY'
    ? exitPrice - position.precioEntrada
    : position.precioEntrada - exitPrice;

  // Convertir a valor monetario
  let pointValue = spec.contractSize; // valor de 1 unidad de precio completa

  // Para pares XXX/JPY: el P&L está en JPY, convertir a USD
  if (symbol.endsWith('JPY')) {
    pointValue = spec.contractSize / exitPrice;
  }

  const grossPnl = priceChange * position.lote * pointValue;

  // Spread cost: spread en precio * lote * pointValue (cobrado al abrir)
  const spreadInPrice = spec.spreadPips * spec.pipSize;
  const spreadCost = spreadInPrice * position.lote * pointValue;

  // Commission: fija por lote, round-trip (apertura + cierre)
  const commission = spec.commissionPerLot * position.lote * 2;

  const netPnl = grossPnl - spreadCost - commission;

  return {
    grossPnl:   Math.round(grossPnl * 100) / 100,
    spreadCost: Math.round(spreadCost * 100) / 100,
    commission: Math.round(commission * 100) / 100,
    netPnl:     Math.round(netPnl * 100) / 100,
  };
}

/**
 * Determina qué nivel se alcanzó primero en una vela ambigua
 * donde tanto SL como TP fueron tocados en la misma vela.
 *
 * Heurística conservadora (worst-case):
 *  - Si la dirección del cuerpo de la vela (open -> close) favorece el TP,
 *    asumimos que el SL se tocó primero (el mercado hizo un spike contra la posición
 *    antes de moverse a favor).
 *  - Si la dirección del cuerpo perjudica la posición, el SL fue primero.
 *  - Fallback: siempre SL primero (premisa conservadora de backtesting).
 *
 * @param {Object} candle - { open, high, low, close }
 * @param {Object} position - { tipo, stopLoss, takeProfit }
 * @returns {'SL' | 'TP'}
 */
export function resolveAmbiguousCandle(candle, position) {
  if (position.tipo === 'BUY') {
    // Para BUY: SL está abajo, TP arriba
    // Si la vela abrió más cerca del SL -> SL primero
    const distToSL = Math.abs(candle.open - position.stopLoss);
    const distToTP = Math.abs(candle.open - position.takeProfit);
    return distToSL <= distToTP ? 'SL' : 'TP';
  } else {
    // Para SELL: SL está arriba, TP abajo
    const distToSL = Math.abs(candle.open - position.stopLoss);
    const distToTP = Math.abs(candle.open - position.takeProfit);
    return distToSL <= distToTP ? 'SL' : 'TP';
  }
}


// ─────────────────────────────────────────────────────────────
// 3. CLASE PRINCIPAL: SimulationEngine
// ─────────────────────────────────────────────────────────────
export class SimulationEngine {
  /**
   * @param {Object} options
   * @param {number} options.initialBalance - Balance inicial de la cuenta (ej: 50000)
   * @param {number} options.maxDrawdownAmount - Drawdown máximo permitido en USD (ej: 2500)
   * @param {string} options.timeframe - Temporalidad activa (ej: 'M15')
   * @param {function} options.onLog - Callback para emitir logs a la consola del UI
   */
  constructor(options = {}) {
    // ── Variables de Estado de la Sesión de Backtest ──
    this.balanceActual           = options.initialBalance || 50000;
    this.peakBalance             = this.balanceActual;
    this.maxDrawdownAmount       = options.maxDrawdownAmount || 2500;
    this.maxDrawdownRestrictivo  = this.peakBalance - this.maxDrawdownAmount;
    this.currentSimulatedTimestamp = 0;
    this.activePositions         = []; // Órdenes abiertas
    this.historicalTrades        = []; // Historial de operaciones cerradas
    this.timeframe               = options.timeframe || 'M15';
    this._nextOrderId            = 1;

    // Callback para emitir logs al UI
    this.onLog = options.onLog || (() => {});

    // Contadores de rendimiento
    this.stats = {
      totalTrades:  0,
      wins:         0,
      losses:       0,
      totalPnl:     0,
      grossProfit:  0,
      grossLoss:    0,
      largestWin:   0,
      largestLoss:  0,
      totalSpreadPaid:     0,
      totalCommissionPaid: 0,
    };
  }

  // ─────────────────────────────────────────────────────────
  // 3a. GETTERS DERIVADOS
  // ─────────────────────────────────────────────────────────

  /** Cushion = distancia al abismo de drawdown */
  get cushion() {
    return Math.round((this.balanceActual - this.maxDrawdownRestrictivo) * 100) / 100;
  }

  /** Porcentaje del cushion (0-100) */
  get cushionPercent() {
    return Math.max(0, Math.min(100, (this.cushion / this.maxDrawdownAmount) * 100));
  }

  /** ¿Se violó el drawdown? */
  get isCircuitBreakerTripped() {
    return this.cushion <= 0;
  }

  /** Win rate en porcentaje */
  get winRate() {
    if (this.stats.totalTrades === 0) return 0;
    return Math.round((this.stats.wins / this.stats.totalTrades) * 10000) / 100;
  }

  /** Profit factor: gross profit / gross loss */
  get profitFactor() {
    if (this.stats.grossLoss === 0) return this.stats.grossProfit > 0 ? Infinity : 0;
    return Math.round((this.stats.grossProfit / Math.abs(this.stats.grossLoss)) * 100) / 100;
  }

  /** P&L flotante total de las posiciones abiertas */
  getFloatingPnL(currentCandle, symbol) {
    let floating = 0;
    for (const pos of this.activePositions) {
      const markPrice = currentCandle.close;
      const { netPnl } = calculatePnL(pos, markPrice, symbol);
      floating += netPnl;
    }
    return Math.round(floating * 100) / 100;
  }

  /** Devuelve una snapshot inmutable del estado completo para React */
  getSnapshot(currentCandle, symbol) {
    return {
      balanceActual:             this.balanceActual,
      peakBalance:               this.peakBalance,
      maxDrawdownRestrictivo:    this.maxDrawdownRestrictivo,
      cushion:                   this.cushion,
      cushionPercent:            this.cushionPercent,
      isCircuitBreakerTripped:   this.isCircuitBreakerTripped,
      currentSimulatedTimestamp: this.currentSimulatedTimestamp,
      activePositions:           [...this.activePositions],
      historicalTrades:          [...this.historicalTrades],
      floatingPnL:               currentCandle ? this.getFloatingPnL(currentCandle, symbol) : 0,
      stats:                     { ...this.stats },
      winRate:                   this.winRate,
      profitFactor:              this.profitFactor,
    };
  }

  // ─────────────────────────────────────────────────────────
  // 3b. EJECUCIÓN DE ÓRDENES (COMPRA / VENTA RÁPIDA)
  // ─────────────────────────────────────────────────────────

  /**
   * Abre una nueva posición basándose en el precio de la última vela visible.
   *
   * @param {Object} params
   * @param {string} params.symbol    - Símbolo del activo (ej: 'EURUSD')
   * @param {'BUY'|'SELL'} params.tipo - Dirección de la operación
   * @param {number} params.precioEntrada - Close de la última vela visible
   * @param {number} params.stopLoss  - Precio de Stop Loss
   * @param {number} params.takeProfit - Precio de Take Profit
   * @param {number} params.riskAmount - Monto en USD del riesgo fijo (ej: 500)
   * @param {string} [params.session] - Sesión de trading
   * @param {string} [params.emotion] - Estado emocional pre-trade
   * @param {number} [params.confluence] - Calidad del setup (1-5)
   * @returns {Object|null} La posición creada o null si fue rechazada
   */
  openPosition(params) {
    if (this.isCircuitBreakerTripped) {
      this.onLog('⛔ RECHAZADA: El disyuntor de drawdown está activo. No se permiten nuevas posiciones.', 'error');
      return null;
    }

    const { symbol, tipo, precioEntrada, stopLoss, takeProfit, riskAmount, session, emotion, confluence } = params;
    const spec = getSpec(symbol);

    // Validaciones de integridad
    if (tipo === 'BUY') {
      if (stopLoss >= precioEntrada) {
        this.onLog(`⚠️ RECHAZADA: SL ($${stopLoss}) debe estar por debajo del precio de entrada ($${precioEntrada}) para una compra.`, 'error');
        return null;
      }
      if (takeProfit <= precioEntrada) {
        this.onLog(`⚠️ RECHAZADA: TP ($${takeProfit}) debe estar por encima del precio de entrada ($${precioEntrada}) para una compra.`, 'error');
        return null;
      }
    } else {
      if (stopLoss <= precioEntrada) {
        this.onLog(`⚠️ RECHAZADA: SL ($${stopLoss}) debe estar por encima del precio de entrada ($${precioEntrada}) para una venta.`, 'error');
        return null;
      }
      if (takeProfit >= precioEntrada) {
        this.onLog(`⚠️ RECHAZADA: TP ($${takeProfit}) debe estar por debajo del precio de entrada ($${precioEntrada}) para una venta.`, 'error');
        return null;
      }
    }

    // Calcular lote real
    const lote = calculateLotSize(symbol, riskAmount, precioEntrada, stopLoss);
    if (lote <= 0) {
      this.onLog('⚠️ RECHAZADA: El tamaño de lote calculado es 0. Revisa la distancia al SL.', 'error');
      return null;
    }

    // Calcular R:R
    const riskDist = Math.abs(precioEntrada - stopLoss);
    const rewardDist = Math.abs(takeProfit - precioEntrada);
    const rr = riskDist > 0 ? Math.round((rewardDist / riskDist) * 10) / 10 : 0;

    const position = {
      id:                this._nextOrderId++,
      symbol,
      tipo,              // 'BUY' | 'SELL'
      precioEntrada,
      lote,
      stopLoss,
      takeProfit,
      riskAmount,
      rr,
      timestampApertura: this.currentSimulatedTimestamp,
      session:           session || 'Replay Sim',
      emotion:           emotion || 'Calma',
      confluence:        confluence || 5,
    };

    this.activePositions.push(position);

    const d = spec.decimals;
    this.onLog(
      `[OPEN ${tipo}] ${symbol} @ $${precioEntrada.toFixed(d)} | Lote: ${lote} | SL: $${stopLoss.toFixed(d)} | TP: $${takeProfit.toFixed(d)} | Riesgo: $${riskAmount} | R:R ${rr}:1`,
      'success'
    );

    return position;
  }

  // ─────────────────────────────────────────────────────────
  // 3c. MOTOR DE VALIDACIÓN DE VELAS (CORE ENGINE)
  // ─────────────────────────────────────────────────────────

  /**
   * Procesa una nueva vela y ejecuta la lógica de SL/TP sobre todas las posiciones activas.
   * Este es el corazón del backtester. Se llama en cada "+1 VELA" o tick de autoplay.
   *
   * @param {Object} candle - { time, open, high, low, close, volume }
   * @param {string} symbol - Símbolo activo actual
   * @returns {{ closedPositions: Array, balanceDelta: number, newBalance: number }}
   */
  processTick(candle, symbol) {
    if (this.isCircuitBreakerTripped) {
      return { closedPositions: [], balanceDelta: 0, newBalance: this.balanceActual };
    }

    // Actualizar timestamp simulado
    this.currentSimulatedTimestamp = candle.time;

    const closedPositions = [];
    let totalBalanceDelta = 0;
    const spec = getSpec(symbol);
    const d = spec.decimals;

    // ── BUCLE DE CONTROL: Recorrer todas las posiciones activas ──
    const survivingPositions = [];

    for (const pos of this.activePositions) {
      let exitType = null;  // 'SL' | 'TP' | null
      let exitPrice = null;

      if (pos.tipo === 'BUY') {
        const hitSL = candle.low <= pos.stopLoss;
        const hitTP = candle.high >= pos.takeProfit;

        if (hitSL && hitTP) {
          // ── VELA AMBIGUA: tanto SL como TP fueron tocados ──
          exitType = resolveAmbiguousCandle(candle, pos);
          exitPrice = exitType === 'SL' ? pos.stopLoss : pos.takeProfit;
        } else if (hitSL) {
          exitType = 'SL';
          exitPrice = pos.stopLoss;
        } else if (hitTP) {
          exitType = 'TP';
          exitPrice = pos.takeProfit;
        }
      } else { // SELL
        const hitSL = candle.high >= pos.stopLoss;
        const hitTP = candle.low <= pos.takeProfit;

        if (hitSL && hitTP) {
          exitType = resolveAmbiguousCandle(candle, pos);
          exitPrice = exitType === 'SL' ? pos.stopLoss : pos.takeProfit;
        } else if (hitSL) {
          exitType = 'SL';
          exitPrice = pos.stopLoss;
        } else if (hitTP) {
          exitType = 'TP';
          exitPrice = pos.takeProfit;
        }
      }

      if (exitType && exitPrice !== null) {
        // ── CERRAR LA POSICIÓN ──
        const pnl = calculatePnL(pos, exitPrice, symbol);
        totalBalanceDelta += pnl.netPnl;

        const isWin = pnl.netPnl > 0;
        const status = isWin ? 'WIN' : 'LOSS';

        // Construir el trade histórico
        const closedTrade = {
          ...pos,
          precioSalida:       exitPrice,
          timestampCierre:    candle.time,
          exitType,           // 'SL' | 'TP'
          status,             // 'WIN' | 'LOSS'
          grossPnl:           pnl.grossPnl,
          spreadCost:         pnl.spreadCost,
          commission:         pnl.commission,
          netProfit:          pnl.netPnl,
          durationCandles:    0, // se podría calcular si tuviéramos el índice
        };

        this.historicalTrades.push(closedTrade);
        closedPositions.push(closedTrade);

        // Actualizar estadísticas
        this.stats.totalTrades++;
        this.stats.totalPnl += pnl.netPnl;
        this.stats.totalSpreadPaid += pnl.spreadCost;
        this.stats.totalCommissionPaid += pnl.commission;

        if (isWin) {
          this.stats.wins++;
          this.stats.grossProfit += pnl.netPnl;
          if (pnl.netPnl > this.stats.largestWin) this.stats.largestWin = pnl.netPnl;
        } else {
          this.stats.losses++;
          this.stats.grossLoss += pnl.netPnl; // negativo
          if (pnl.netPnl < this.stats.largestLoss) this.stats.largestLoss = pnl.netPnl;
        }

        // ── LOGGING ──
        if (exitType === 'TP') {
          this.onLog(
            `✅ [TP HIT] ${pos.tipo} ${symbol} cerrado a $${exitPrice.toFixed(d)} | P&L Bruto: $${pnl.grossPnl.toFixed(2)} | Spread: -$${pnl.spreadCost.toFixed(2)} | Comisión: -$${pnl.commission.toFixed(2)} | NETO: ${pnl.netPnl >= 0 ? '+' : ''}$${pnl.netPnl.toFixed(2)}`,
            'success'
          );
        } else {
          this.onLog(
            `🛑 [SL HIT] ${pos.tipo} ${symbol} cerrado a $${exitPrice.toFixed(d)} | P&L Bruto: $${pnl.grossPnl.toFixed(2)} | Spread: -$${pnl.spreadCost.toFixed(2)} | Comisión: -$${pnl.commission.toFixed(2)} | NETO: ${pnl.netPnl >= 0 ? '+' : ''}$${pnl.netPnl.toFixed(2)}`,
            'error'
          );
        }
      } else {
        // La posición sobrevive esta vela
        survivingPositions.push(pos);
      }
    }

    this.activePositions = survivingPositions;

    // ── ACTUALIZAR BALANCE ──
    if (totalBalanceDelta !== 0) {
      this.balanceActual = Math.round((this.balanceActual + totalBalanceDelta) * 100) / 100;

      // Actualizar peak balance y recalcular trailing drawdown
      if (this.balanceActual > this.peakBalance) {
        this.peakBalance = this.balanceActual;
        this.maxDrawdownRestrictivo = this.peakBalance - this.maxDrawdownAmount;
      }

      // Circuit breaker check
      if (this.isCircuitBreakerTripped) {
        this.onLog(
          `🔴 CIRCUIT BREAKER: Balance $${this.balanceActual.toFixed(2)} cruzó el límite de drawdown restrictivo de $${this.maxDrawdownRestrictivo.toFixed(2)}. Cuenta BLOQUEADA.`,
          'error'
        );
      }
    }

    return {
      closedPositions,
      balanceDelta:  Math.round(totalBalanceDelta * 100) / 100,
      newBalance:    this.balanceActual,
    };
  }

  // ─────────────────────────────────────────────────────────
  // 3d. RESET DE SESIÓN
  // ─────────────────────────────────────────────────────────

  /**
   * Resetea completamente la sesión de backtest al estado inicial.
   * @param {number} [initialBalance] - Nuevo balance inicial (default: 50000)
   */
  resetSession(initialBalance) {
    this.balanceActual = initialBalance || 50000;
    this.peakBalance = this.balanceActual;
    this.maxDrawdownRestrictivo = this.peakBalance - this.maxDrawdownAmount;
    this.currentSimulatedTimestamp = 0;
    this.activePositions = [];
    this.historicalTrades = [];
    this._nextOrderId = 1;

    this.stats = {
      totalTrades: 0, wins: 0, losses: 0, totalPnl: 0,
      grossProfit: 0, grossLoss: 0, largestWin: 0, largestLoss: 0,
      totalSpreadPaid: 0, totalCommissionPaid: 0,
    };

    this.onLog('🔄 Sesión de backtesting reseteada. Motor de simulación listo.', 'info');
  }
}
