/**
 * ReefReplay - Custom JS Datafeed Blueprint for TradingView Advanced Charts (Charting Library)
 * 
 * Este módulo sirve como puente entre el motor gráfico de TradingView Advanced Charts
 * y nuestra base de datos local / servidor de backtesting. 
 * Implementa el protocolo IBasicDatafeed para soporte de replay multi-par y cutoff_timestamp.
 */

export class CustomDatafeed {
  constructor(options = {}) {
    this.cutoffTimestamp = options.cutoffTimestamp || Math.floor(Date.now() / 1000);
    this.symbolDatabase = options.symbolDatabase || {};
    this.activeSubscriptions = new Map();
  }

  /**
   * Actualiza el cutoff_timestamp en tiempo real para ocultar/revelar el futuro.
   * @param {number} newCutoff - UNIX timestamp en segundos.
   */
  setCutoffTimestamp(newCutoff) {
    this.cutoffTimestamp = newCutoff;
    // Notificar a las suscripciones activas para forzar re-dibujado
    this.activeSubscriptions.forEach((sub, listenerGuid) => {
      this.refreshSubscription(listenerGuid);
    });
  }

  /**
   * Inicializa la configuración de la librería
   */
  onReady(callback) {
    setTimeout(() => {
      callback({
        supports_search: true,
        supports_group_request: false,
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
        exchanges: [
          { value: 'REEFREPLAY', name: 'ReefReplay Liquidity Provider', desc: 'ReefReplay Server' }
        ],
        symbols_types: [
          { name: 'Forex', value: 'forex' },
          { name: 'Crypto', value: 'crypto' },
          { name: 'Metals', value: 'bitcoin' },
          { name: 'Indices', value: 'stock' }
        ],
        supported_resolutions: ['1', '5', '15', '60', 'D']
      });
    }, 0);
  }

  /**
   * Resuelve el símbolo solicitado y devuelve sus especificaciones
   */
  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    const cleanName = symbolName.split(':').pop().toUpperCase();
    
    // Configuración por defecto para los pares del simulador
    const symbolSpecs = {
      name: cleanName,
      ticker: cleanName,
      description: `ReefReplay ${cleanName} Spot Realtime Backtest`,
      type: cleanName === 'EURUSD' ? 'forex' : cleanName === 'BTCUSD' ? 'crypto' : cleanName === 'XAUUSD' ? 'bitcoin' : 'stock',
      session: '24x7',
      timezone: 'Etc/UTC',
      exchange: 'REEFREPLAY',
      minmov: 1,
      pricescale: cleanName === 'EURUSD' ? 100000 : cleanName === 'BTCUSD' ? 100 : 100,
      has_intraday: true,
      has_no_volume: false,
      supported_resolutions: ['1', '5', '15', '60', 'D'],
      volume_precision: 2,
      data_status: 'streaming'
    };

    setTimeout(() => {
      onSymbolResolvedCallback(symbolSpecs);
    }, 0);
  }

  /**
   * Recupera las velas históricas aplicando el filtro de Cutoff_Timestamp (Bar Replay).
   * El futuro posterior a cutoffTimestamp queda estrictamente oculto.
   */
  getBars(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) {
    const { from, to, firstDataRequest } = periodParams;
    const symbol = symbolInfo.name;
    
    // Obtener los datos del activo desde nuestra base de datos local
    const fullHistory = this.symbolDatabase[symbol] || [];
    
    // 1. Filtrar datos por rango temporal solicitado por TradingView
    // 2. APLICAR LÓGICA DE CORTE (Cutoff_Timestamp): ocultar todo lo que sea mayor a cutoffTimestamp
    const filteredBars = fullHistory
      .map(bar => ({
        time: typeof bar.time === 'string' ? Math.floor(Date.parse(bar.time) / 1000) : bar.time,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume || 100
      }))
      .filter(bar => {
        // Estrictamente menor o igual al cutoff para ocultar el futuro
        const isBeforeCutoff = bar.time <= this.cutoffTimestamp;
        
        if (firstDataRequest) {
          return isBeforeCutoff;
        } else {
          return isBeforeCutoff && bar.time >= from && bar.time <= to;
        }
      });

    // Ordenar de forma cronológica ascendente
    filteredBars.sort((a, b) => a.time - b.time);

    setTimeout(() => {
      if (filteredBars.length === 0) {
        onHistoryCallback([], { noData: true });
      } else {
        onHistoryCallback(filteredBars, { noData: false });
      }
    }, 0);
  }

  /**
   * Suscribe a actualizaciones en tiempo real (+1 Vela e inyección dinámica)
   */
  subscribeBars(symbolInfo, resolution, onRealtimeCallback, listenerGuid, onResetCacheNeededCallback) {
    this.activeSubscriptions.set(listenerGuid, {
      symbolInfo,
      resolution,
      onRealtimeCallback,
      onResetCacheNeededCallback
    });
  }

  /**
   * Cancela suscripciones de actualización
   */
  unsubscribeBars(listenerGuid) {
    this.activeSubscriptions.delete(listenerGuid);
  }

  /**
   * Inyecta una nueva vela de forma manual en tiempo real (Replay Streamer)
   * @param {string} listenerGuid - ID de la suscripción
   * @param {object} bar - Estructura { time, open, high, low, close, volume }
   */
  injectRealtimeBar(listenerGuid, bar) {
    const sub = this.activeSubscriptions.get(listenerGuid);
    if (sub && sub.onRealtimeCallback) {
      sub.onRealtimeCallback({
        time: bar.time * 1000, // TradingView requiere milisegundos en tiempo real
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume || 100
      });
    }
  }
}
