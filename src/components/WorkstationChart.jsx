import React, { useEffect, useRef, useState } from 'react';
import { createChart, LineStyle, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';

// Helper function to calculate Exponential Moving Average (EMA)
function calculateEMA(data, period) {
  if (data.length < period) return [];
  const emaData = [];
  
  // Calculate initial SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let prevEma = sum / period;
  emaData.push({ time: data[period - 1].time, value: prevEma });
  
  const k = 2 / (period + 1);
  for (let i = period; i < data.length; i++) {
    const emaValue = data[i].close * k + prevEma * (1 - k);
    emaData.push({ time: data[i].time, value: emaValue });
    prevEma = emaValue;
  }
  return emaData;
}

export default function WorkstationChart({ 
  data, 
  activeTrade, 
  activeDrawingTool, 
  indicators = { ema50: false, ema200: false, volume: true },
  logToConsole = () => {},
  operationMode = 'live', // 'live' or 'replay'
  activeAsset = 'XAUUSD'
}) {
  const chartContainerRef = useRef(null);
  const widgetContainerRef = useRef(null);
  const svgRef = useRef(null);
  
  // Lightweight Charts Refs
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const ema50SeriesRef = useRef(null);
  const ema200SeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const trendlineSeriesRef = useRef(null);
  
  const priceLinesRef = useRef([]);
  const fibLinesRef = useRef([]);
  const lastCrosshairPoint = useRef({ time: null, price: null });

  // State to track if the TradingView tv.js script is loaded
  const [tvScriptLoaded, setTvScriptLoaded] = useState(false);

  // State for interactive SVG drawing canvas
  const [drawings, setDrawings] = useState([]);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tick, setTick] = useState(0);

  // 1. Clear drawings when activeDrawingTool is 'clear' or activeAsset changes
  useEffect(() => {
    if (activeDrawingTool === 'clear') {
      setDrawings([]);
      setCurrentDrawing(null);
      setIsDrawing(false);
    }
  }, [activeDrawingTool]);

  useEffect(() => {
    setDrawings([]);
    setCurrentDrawing(null);
    setIsDrawing(false);
  }, [activeAsset]);

  // 2. Disable chart scroll/scale when drawing to allow smooth click-and-drag
  useEffect(() => {
    if (!chartRef.current) return;
    if (activeDrawingTool === 'cursor') {
      chartRef.current.applyOptions({
        handleScroll: { mouseWheel: true, pressedMouseMove: true },
        handleScale: { mouseWheel: true, pinch: true }
      });
    } else {
      chartRef.current.applyOptions({
        handleScroll: false,
        handleScale: false
      });
    }
  }, [activeDrawingTool]);

  // 3. Dynamic Script Loader for Official TradingView tv.js Widget
  useEffect(() => {
    if (operationMode !== 'live') return;

    const existingScript = document.getElementById('tradingview-widget-script');
    if (existingScript) {
      setTvScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'tradingview-widget-script';
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
      setTvScriptLoaded(true);
      logToConsole('Librería nativa de TradingView Widgets cargada desde CDN', 'success');
    };
    script.onerror = () => {
      logToConsole('Error al cargar la librería externa de TradingView', 'error');
    };
    document.head.appendChild(script);
  }, [operationMode]);

  // 4. Initialize Official TradingView Widget (Live Mode)
  useEffect(() => {
    if (operationMode !== 'live' || !tvScriptLoaded) return;

    // Map symbol to official feeds for all 17 pairs
    const symbolMap = {
      XAUUSD: 'FX_IDC:XAUUSD',
      EURUSD: 'FX:EURUSD',
      GBPUSD: 'FX:GBPUSD',
      USDCAD: 'FX:USDCAD',
      USDJPY: 'FX:USDJPY',
      USDCHF: 'FX:USDCHF',
      XAGUSD: 'FX_IDC:XAGUSD',
      AUDJPY: 'FX:AUDJPY',
      AUDUSD: 'FX:AUDUSD',
      CHFJPY: 'FX:CHFJPY',
      EURCAD: 'FX:EURCAD',
      EURGBP: 'FX:EURGBP',
      EURJPY: 'FX:EURJPY',
      GBPCHF: 'FX:GBPCHF',
      GBPJPY: 'FX:GBPJPY',
      NZDJPY: 'FX:NZDJPY',
      NZDUSD: 'FX:NZDUSD'
    };

    const targetSymbol = symbolMap[activeAsset] || 'FX_IDC:XAUUSD';

    // Instanciar el Widget oficial de TradingView Advanced Charts (Core tv.js)
    try {
      new window.TradingView.widget({
        width: '100%',
        height: '100%',
        symbol: targetSymbol,
        interval: '15',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'es',
        toolbar_bg: '#000000',
        enable_publishing: false,
        hide_side_toolbar: false, // REQUERIDO: Habilitar barra de herramientas izquierda nativa
        allow_symbol_change: true,
        container_id: 'tv_chart_container_div',
        studies: [
          'MASimple@tv-basicstudies',
          'RSI@tv-basicstudies'
        ],
        enabled_features: ["left_toolbar", "header_widget", "study_templates"], // Forzar herramientas nativas
        disabled_features: [],
        library_path: '/charting_library/', // Path blueprint para la integración cerrada
        autosize: true
      });
      logToConsole(`Widget oficial TradingView instanciado para ${activeAsset}`, 'success');
    } catch (error) {
      console.error('Error initializing TradingView widget:', error);
    }
  }, [operationMode, tvScriptLoaded, activeAsset]);

  // 5. Initialize ReefReplay Engine (Lightweight Charts Mode)
  useEffect(() => {
    if (operationMode !== 'replay' || !chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#000000' },
        textColor: '#a1a1aa',
        fontSize: 11,
        fontFamily: 'JetBrains Mono, Geist, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.02)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.02)' },
      },
      crosshair: {
        mode: 0,
        vertLine: {
          color: 'rgba(168, 85, 247, 0.4)',
          width: 1,
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: 'rgba(168, 85, 247, 0.4)',
          width: 1,
          style: LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        visible: true,
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      }
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderUpColor: '#10b981',
      borderDownColor: '#f43f5e',
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
      priceFormat: {
        type: 'price',
        precision: 4,
        minMove: 0.0001,
      },
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    const ema50Series = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 1.5,
      title: 'EMA 50',
    });

    const ema200Series = chart.addSeries(LineSeries, {
      color: '#a855f7',
      lineWidth: 1.5,
      title: 'EMA 200',
    });

    const trendlineSeries = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
      title: 'Trendline',
    });

    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;
    ema50SeriesRef.current = ema50Series;
    ema200SeriesRef.current = ema200Series;
    trendlineSeriesRef.current = trendlineSeries;
    chartRef.current = chart;

    // RECOPILAR COORDENADAS DINÁMICAS EN TIEMPO REAL DESDE LA CRUZ (CROSSHAIR)
    chart.subscribeCrosshairMove((param) => {
      if (param.point && param.time) {
        const price = candlestickSeries.coordinateToPrice(param.point.y);
        lastCrosshairPoint.current = { time: param.time, price };
      }
    });

    // SUSCRIPCIÓN PARA REDIBUJAR CAPA SVG EN SCROLL Y ZOOM
    chart.timeScale().subscribeVisibleTimeRangeChange(() => {
      setTick(t => t + 1);
    });

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !chartRef.current || !chartContainerRef.current) return;
      const { width, height } = entries[0].contentRect;
      const safeWidth = width || chartContainerRef.current.clientWidth || 600;
      const safeHeight = height || chartContainerRef.current.clientHeight || 380;
      chartRef.current.resize(safeWidth, safeHeight);
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [operationMode]);

  // Update replay chart candles & EMAs
  useEffect(() => {
    if (operationMode !== 'replay') return;
    const candleSeries = candlestickSeriesRef.current;
    const volSeries = volumeSeriesRef.current;
    const ema50Series = ema50SeriesRef.current;
    const ema200Series = ema200SeriesRef.current;
    const chart = chartRef.current;

    if (!candleSeries || !data || data.length === 0) return;

    candleSeries.setData(data);

    // Dynamic precision scaling by asset type
    const isJpy = activeAsset.endsWith('JPY');
    const isGold = activeAsset === 'XAUUSD';
    const isSilver = activeAsset === 'XAGUSD';
    
    if (isGold) {
      candleSeries.applyOptions({ priceFormat: { precision: 2, minMove: 0.01 } });
    } else if (isSilver) {
      candleSeries.applyOptions({ priceFormat: { precision: 3, minMove: 0.001 } });
    } else if (isJpy) {
      candleSeries.applyOptions({ priceFormat: { precision: 3, minMove: 0.001 } });
    } else if (activeAsset === 'BTCUSD') {
      candleSeries.applyOptions({ priceFormat: { precision: 2, minMove: 0.01 } });
    } else {
      // standard forex pairs
      candleSeries.applyOptions({ priceFormat: { precision: 5, minMove: 0.00001 } });
    }

    if (indicators.volume && volSeries) {
      const volumeData = data.map(c => ({
        time: c.time,
        value: Math.floor(Math.abs(c.close - c.open) * 5000 + 1000),
        color: c.close >= c.open ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'
      }));
      volSeries.setData(volumeData);
    } else if (volSeries) {
      volSeries.setData([]);
    }

    if (indicators.ema50 && ema50Series) {
      const ema50Data = calculateEMA(data, 50);
      ema50Series.setData(ema50Data);
    } else if (ema50Series) {
      ema50Series.setData([]);
    }

    if (indicators.ema200 && ema200Series) {
      const ema200Data = calculateEMA(data, 200);
      ema200Series.setData(ema200Data);
    } else if (ema200Series) {
      ema200Series.setData([]);
    }

    chart.timeScale().fitContent();
  }, [data, indicators, operationMode]);

  // Handle active trade lines in replay mode
  useEffect(() => {
    if (operationMode !== 'replay') return;
    const series = candlestickSeriesRef.current;
    if (!series) return;

    priceLinesRef.current.forEach(line => {
      try {
        series.removePriceLine(line);
      } catch (e) {}
    });
    priceLinesRef.current = [];

    if (activeTrade && (activeTrade.status === 'PENDING' || activeTrade.status === 'ACTIVE')) {
      const entryColor = '#38bdf8';
      const slColor = '#f43f5e';
      const tpColor = '#34d399';
      const decimals = activeTrade.price < 2 ? 5 : 2;

      const entryLine = series.createPriceLine({
        price: activeTrade.price,
        color: entryColor,
        lineWidth: 1.5,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: `REEF ${activeTrade.type} ENTRY: $${activeTrade.price.toFixed(decimals)}`,
      });

      const slLine = series.createPriceLine({
        price: activeTrade.sl,
        color: slColor,
        lineWidth: 1.5,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `SL: $${activeTrade.sl.toFixed(decimals)}`,
      });

      const tpLine = series.createPriceLine({
        price: activeTrade.tp,
        color: tpColor,
        lineWidth: 1.5,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `TP: $${activeTrade.tp.toFixed(decimals)}`,
      });

      priceLinesRef.current = [entryLine, slLine, tpLine];
    }
  }, [activeTrade, data, operationMode]);

  // ----------------------------------------------------
  // INTERACTIVE SVG COORDINATE TRANSLATORS & HANDLERS
  // ----------------------------------------------------
  const timeToX = (time) => {
    if (!chartRef.current) return null;
    return chartRef.current.timeScale().timeToCoordinate(time);
  };

  const priceToY = (price) => {
    if (!candlestickSeriesRef.current) return null;
    return candlestickSeriesRef.current.priceToCoordinate(price);
  };

  const handleMouseDown = (e) => {
    if (activeDrawingTool === 'cursor' || activeDrawingTool === 'clear') return;
    const { time, price } = lastCrosshairPoint.current;
    if (time === null || price === null) return;
    
    if (activeDrawingTool === 'text') {
      const text = prompt("Introduce tu anotación de trading:");
      if (text) {
        const newDrawing = {
          id: Date.now(),
          type: 'text',
          start: { time, price },
          end: { time, price },
          text
        };
        setDrawings(prev => [...prev, newDrawing]);
      }
      return;
    }
    
    const startPoint = { time, price };
    const newDrawing = {
      id: Date.now(),
      type: activeDrawingTool,
      start: startPoint,
      end: startPoint
    };
    
    setCurrentDrawing(newDrawing);
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !currentDrawing) return;
    const { time, price } = lastCrosshairPoint.current;
    if (time === null || price === null) return;
    
    setCurrentDrawing(prev => ({
      ...prev,
      end: { time, price }
    }));
  };

  const handleMouseUp = (e) => {
    if (!isDrawing) return;
    const { time, price } = lastCrosshairPoint.current;
    
    let finalDrawing = currentDrawing;
    if (time !== null && price !== null) {
      finalDrawing = {
        ...currentDrawing,
        end: { time, price }
      };
    }
    
    setDrawings(prev => [...prev, finalDrawing]);
    setCurrentDrawing(null);
    setIsDrawing(false);
  };

  const renderDrawing = (drawing) => {
    const x1 = timeToX(drawing.start.time);
    const y1 = priceToY(drawing.start.price);
    const x2 = timeToX(drawing.end.time);
    const y2 = priceToY(drawing.end.price);

    if (x1 === null || y1 === null || x2 === null || y2 === null) return null;

    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const right = Math.max(x1, x2);
    const bottom = Math.max(y1, y2);

    const isJpy = activeAsset.endsWith('JPY');
    const decimals = activeAsset === 'XAUUSD' ? 2 : activeAsset === 'XAGUSD' ? 3 : isJpy ? 3 : 5;
    
    const getPips = (priceDiff) => {
      if (activeAsset.endsWith('JPY')) return priceDiff * 100;
      if (activeAsset === 'XAUUSD') return priceDiff * 10;
      if (activeAsset === 'XAGUSD') return priceDiff * 100;
      return priceDiff * 10000;
    };

    switch (drawing.type) {
      case 'trendline':
        return (
          <line
            key={drawing.id}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#a855f7"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );

      case 'fibonacci': {
        const diff = y2 - y1;
        const priceDiff = drawing.end.price - drawing.start.price;
        const ratios = [
          { val: 1.0, color: '#ef4444', label: '1.000 (100.0%)' },
          { val: 0.786, color: '#a855f7', label: '0.786 (78.6%)' },
          { val: 0.618, color: '#eab308', label: '0.618 (61.8%)' },
          { val: 0.5, color: '#22c55e', label: '0.500 (50.0%)' },
          { val: 0.382, color: '#3b82f6', label: '0.382 (38.2%)' },
          { val: 0.236, color: '#ec4899', label: '0.236 (23.6%)' },
          { val: 0.0, color: '#ef4444', label: '0.000 (0.0%)' }
        ];

        return (
          <g key={drawing.id}>
            {ratios.slice(0, -1).map((ratio, index) => {
              const nextRatio = ratios[index + 1];
              const yr1 = y2 - diff * ratio.val;
              const yr2 = y2 - diff * nextRatio.val;
              return (
                <rect
                  key={`fib-bg-${index}`}
                  x={Math.min(x1, x2)}
                  y={Math.min(yr1, yr2)}
                  width={width}
                  height={Math.abs(yr2 - yr1)}
                  fill={ratio.color}
                  fillOpacity="0.07"
                />
              );
            })}
            
            {ratios.map((lvl) => {
              const y = y2 - diff * lvl.val;
              const price = drawing.end.price - priceDiff * lvl.val;
              return (
                <g key={`fib-lvl-${lvl.val}`}>
                  <line
                    x1={Math.min(x1, x2)}
                    y1={y}
                    x2={Math.max(x1, x2)}
                    y2={y}
                    stroke={lvl.color}
                    strokeWidth="1.2"
                    strokeDasharray={lvl.val === 0.0 || lvl.val === 1.0 ? '0' : '3 3'}
                  />
                  <text
                    x={Math.min(x1, x2) + 8}
                    y={y - 4}
                    fill={lvl.color}
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {lvl.label}: ${price.toFixed(decimals)}
                  </text>
                </g>
              );
            })}
          </g>
        );
      }

      case 'rectangle': {
        const y_mid = (y1 + y2) / 2;
        return (
          <g key={drawing.id}>
            <rect
              x={left}
              y={top}
              width={width}
              height={height}
              fill="rgba(168, 85, 247, 0.14)"
              stroke="rgba(168, 85, 247, 0.6)"
              strokeWidth="1.8"
            />
            <line
              x1={left}
              y1={y_mid}
              x2={right}
              y2={y_mid}
              stroke="rgba(168, 85, 247, 0.6)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text x={right + 6} y={top + 4} fill="rgba(255,255,255,0.4)" fontSize="8.5" fontFamily="monospace">1.0</text>
            <text x={right + 6} y={y_mid + 3} fill="rgba(255,255,255,0.4)" fontSize="8.5" fontFamily="monospace">0.5</text>
            <text x={right + 6} y={bottom + 3} fill="rgba(255,255,255,0.4)" fontSize="8.5" fontFamily="monospace">0.0</text>
          </g>
        );
      }

      case 'long':
      case 'short': {
        const isLong = drawing.type === 'long';
        const priceDiff = drawing.end.price - drawing.start.price;
        const targetDiff = Math.abs(priceDiff);
        const stopDiff = targetDiff / 2;
        
        const targetPrice = isLong ? drawing.start.price + targetDiff : drawing.start.price - targetDiff;
        const stopPrice = isLong ? drawing.start.price - stopDiff : drawing.start.price + stopDiff;
        
        const y_target = priceToY(targetPrice);
        const y_stop = priceToY(stopPrice);
        
        if (y_target === null || y_stop === null) return null;

        const targetPips = getPips(targetDiff);
        const stopPips = getPips(stopDiff);
        const pillX = left + width / 2;

        return (
          <g key={drawing.id}>
            <rect
              x={left}
              y={Math.min(y1, y_target)}
              width={width}
              height={Math.abs(y_target - y1)}
              fill="rgba(16, 185, 129, 0.16)"
              stroke="rgba(16, 185, 129, 0.4)"
              strokeWidth="1"
            />
            <rect
              x={left}
              y={Math.min(y1, y_stop)}
              width={width}
              height={Math.abs(y_stop - y1)}
              fill="rgba(244, 63, 94, 0.16)"
              stroke="rgba(244, 63, 94, 0.4)"
              strokeWidth="1"
            />
            <line x1={left} y1={y1} x2={right} y2={y1} stroke="#ffffff" strokeWidth="1.5" />
            
            <rect
              x={pillX - 45}
              y={y1 - 10}
              width="90"
              height="20"
              rx="4"
              fill="#1e1b4b"
              stroke="#4f46e5"
              strokeWidth="1"
            />
            <text
              x={pillX}
              y={y1 + 3}
              fill="#c7d2fe"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              R:R Ratio: 2.00
            </text>

            <text
              x={pillX}
              y={isLong ? y_target + 14 : y_target - 6}
              fill="#34d399"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              TP: +{targetPips.toFixed(1)} Pips
            </text>
            <text
              x={pillX}
              y={isLong ? y_stop - 6 : y_stop + 14}
              fill="#f87171"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              SL: -{stopPips.toFixed(1)} Pips
            </text>
          </g>
        );
      }

      case 'ruler': {
        const diffPrice = drawing.end.price - drawing.start.price;
        const pct = (diffPrice / drawing.start.price) * 100;
        const pips = getPips(diffPrice);
        
        const candleRange = data.filter(c => c.time >= Math.min(drawing.start.time, drawing.end.time) && c.time <= Math.max(drawing.start.time, drawing.end.time));
        const candlesCount = candleRange.length;
        const hours = (candlesCount * 15) / 60;
        const days = Math.floor(hours / 24);
        const remHours = hours % 24;
        const durationStr = days > 0 ? `${days}d ${remHours}h` : `${hours}h`;

        const pillX = left + width / 2;
        const pillY = top + height / 2;

        return (
          <g key={drawing.id}>
            <rect
              x={left}
              y={top}
              width={width}
              height={height}
              fill="rgba(59, 130, 246, 0.05)"
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(59, 130, 246, 0.7)" strokeWidth="1.5" />
            <rect
              x={pillX - 60}
              y={pillY - 22}
              width="120"
              height="44"
              rx="8"
              fill="rgba(9, 9, 11, 0.9)"
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth="1"
            />
            <text
              x={pillX}
              y={pillY - 6}
              fill="#60a5fa"
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {pips >= 0 ? '+' : ''}{pips.toFixed(1)} Pips
            </text>
            <text
              x={pillX}
              y={pillY + 6}
              fill="#ffffff"
              fontSize="8"
              fontFamily="sans-serif"
              textAnchor="middle"
            >
              {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
            </text>
            <text
              x={pillX}
              y={pillY + 16}
              fill="#a1a1aa"
              fontSize="7"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {candlesCount} Velas ({durationStr})
            </text>
          </g>
        );
      }

      case 'text':
        return (
          <g key={drawing.id}>
            <circle cx={x1} cy={y1} r="3" fill="#eab308" />
            <rect
              x={x1 + 6}
              y={y1 - 10}
              width={drawing.text.length * 5.8 + 14}
              height="20"
              rx="4"
              fill="rgba(24, 24, 27, 0.85)"
              stroke="rgba(234, 179, 8, 0.4)"
              strokeWidth="1"
            />
            <text x={x1 + 13} y={y1 + 3} fill="#fef08a" fontSize="9" fontFamily="sans-serif">
              {drawing.text}
            </text>
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full relative bg-black overflow-hidden flex items-center justify-center min-h-[380px]">
      
      {/* 1. CONTAINER FOR THE OFFICIAL LIVE TRADINGVIEW WIDGET */}
      {operationMode === 'live' && (
        <div className="w-full h-full min-h-[380px] bg-black" id="tv_chart_container">
          <div id="tv_chart_container_div" className="w-full h-full min-h-[380px]" />
        </div>
      )}

      {/* 2. CONTAINER FOR THE REEFREPLAY ENGINE (Lightweight Charts with Interactive Canvas) */}
      {operationMode === 'replay' && (
        <div 
          className="relative w-full h-full min-h-[380px]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div ref={chartContainerRef} className="w-full h-full min-h-[380px]" />
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 10 }}
          >
            {/* Render completed drawings */}
            {drawings.map(renderDrawing)}
            {/* Render drawing in progress */}
            {currentDrawing && renderDrawing(currentDrawing)}
          </svg>
        </div>
      )}

    </div>
  );
}
