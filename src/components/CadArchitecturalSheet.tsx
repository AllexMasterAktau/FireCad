import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Download, Printer, Layers, Eye, EyeOff, ShieldCheck, Zap, Activity, Info } from 'lucide-react';
import { FireSafetyLayout, FireDevice, initialDevices } from './FireSafetyLayout';

interface CadArchitecturalSheetProps {
  projectName?: string;
  buildingArea?: number;
  ceilingHeight?: number;
  objectType?: string;
  designerName?: string;
  approverName?: string;
}

export const CadArchitecturalSheet: React.FC<CadArchitecturalSheetProps> = ({
  projectName = 'Административно-офисное здание',
  buildingArea = 1850,
  ceilingHeight = 3.2,
  designerName = 'Алиев К.Т.',
  approverName = 'Смагулов Б.Р.',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [paperFormat, setPaperFormat] = useState<'A4' | 'A3' | 'A2' | 'A1'>('A2');
  const [showRadiuses, setShowRadiuses] = useState<boolean>(true);
  const [showCables, setShowCables] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [activeSystem, setActiveSystem] = useState<'all' | 'aps' | 'soue'>('all');
  const [selectedDevice, setSelectedDevice] = useState<FireDevice | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentDate = new Date().toLocaleDateString('ru-RU');

  // Handle Fullscreen toggle with Native API fallback and Esc key support
  const handleToggleMaximize = async () => {
    const nextState = !isMaximized;
    setIsMaximized(nextState);

    if (nextState) {
      try {
        if (containerRef.current && document.fullscreenEnabled) {
          if (containerRef.current.requestFullscreen) {
            await containerRef.current.requestFullscreen();
          }
        }
      } catch {
        // Fallback gracefully to React CSS overlay mode (for iframe preview / restricted environments)
      }
    } else {
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch {
        // Fallback ignore
      }
    }
  };

  // Keyboard shortcut listener for ESC & native fullscreen sync
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMaximized) {
        setIsMaximized(false);
        try {
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen();
          }
        } catch {
          // ignore
        }
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isMaximized) {
        setIsMaximized(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isMaximized]);

  // Печать чертежа в векторном качестве (Vector High-DPI) с динамическим форматом листа
  const handlePrint = () => {
    const styleId = 'dynamic-cad-print-page-style';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.innerHTML = `
      @page {
        size: ${paperFormat} landscape !important;
        margin: 10mm !important;
      }
      @media print {
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #000000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body * {
          visibility: hidden !important;
        }
        #print-drawing-container,
        #print-drawing-container * {
          visibility: visible !important;
        }
        #print-drawing-container {
          position: fixed !important;
          left: 0 !important;
          top: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: #ffffff !important;
          box-shadow: none !important;
          border: none !important;
          transform: none !important;
          z-index: 999999 !important;
        }
        #cad-drawing-svg {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          display: block !important;
          margin: auto !important;
          box-shadow: none !important;
          border: none !important;
          shape-rendering: geometricPrecision !important;
          text-rendering: geometricPrecision !important;
          image-rendering: optimizeQuality !important;
        }
      }
    `;
    window.print();
  };

  return (
    <div
      ref={containerRef}
      className={
        isMaximized
          ? 'fixed inset-0 top-0 left-0 w-screen h-screen z-[9999] bg-slate-950 flex flex-col p-4 md:p-6 overflow-hidden shadow-2xl space-y-3'
          : 'w-full flex flex-col items-center bg-slate-900 rounded-2xl border border-slate-700 p-4 md:p-6 shadow-2xl space-y-4'
      }
    >
      {/* CAD Toolbar */}
      <div className="w-full max-w-7xl flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-white font-bold tracking-wider uppercase bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            AutoCAD PDF Export • Формат {paperFormat} (ГОСТ 21.1101)
          </span>
          <span className="hidden sm:inline-block text-slate-400">
            Стадия: <strong className="text-white">П</strong> | Раздел: <strong className="text-red-400">02-АПС</strong> | Масштаб: <strong className="text-white">1:300</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Селектор динамического формата листа для печати / PDF */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-400 font-mono text-[11px]">Формат:</span>
            <select
              value={paperFormat}
              onChange={(e) => setPaperFormat(e.target.value as 'A4' | 'A3' | 'A2' | 'A1')}
              className="bg-slate-900 border border-slate-700 text-white font-bold rounded px-2 py-0.5 font-mono text-xs focus:outline-none focus:border-red-500 cursor-pointer"
              title="Выбор формата листа для вывода на печать и PDF"
            >
              <option value="A4">А4</option>
              <option value="A3">А3</option>
              <option value="A2">А2 (ГОСТ)</option>
              <option value="A1">А1</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(0.7, Number((prev - 0.15).toFixed(2))))}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95 cursor-pointer"
            title="Уменьшить масштаб"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="px-2 font-mono text-slate-300 font-bold min-w-[50px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(1.8, Number((prev + 0.15).toFixed(2))))}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95 cursor-pointer"
            title="Увеличить масштаб"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95 cursor-pointer"
            title="Сбросить на 100%"
          >
            <span className="font-mono text-xs font-bold px-0.5">100%</span>
          </button>
          <button
            type="button"
            onClick={handleToggleMaximize}
            className={`p-2 rounded-lg transition active:scale-95 border cursor-pointer ${
              isMaximized
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title={isMaximized ? 'Свернуть (Esc)' : 'Развернуть на весь экран'}
          >
            {isMaximized ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-sans font-bold shadow-lg shadow-red-600/30 transition active:scale-95 cursor-pointer"
            title={`Печать листа чертежа в формате ${paperFormat} (Landscape)`}
          >
            <Printer className="h-4 w-4" />
            <span className="hidden md:inline">Печать / PDF</span>
          </button>
        </div>
      </div>

      {/* CAD Layer Control Bar */}
      <div className="w-full max-w-6xl flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-mono flex items-center gap-1.5 mr-1">
            <Layers className="h-3.5 w-3.5 text-red-400" />
            Слои САПР:
          </span>

          <button
            type="button"
            onClick={() => setShowRadiuses(!showRadiuses)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium transition ${
              showRadiuses
                ? 'bg-blue-900/60 text-blue-200 border-blue-600/80 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {showRadiuses ? <Eye className="h-3.5 w-3.5 text-blue-400" /> : <EyeOff className="h-3.5 w-3.5 text-slate-500" />}
            <span>Зоны контроля R=7.5м (Радиусы)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCables(!showCables)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium transition ${
              showCables
                ? 'bg-red-900/60 text-red-200 border-red-600/80 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {showCables ? <Eye className="h-3.5 w-3.5 text-red-400" /> : <EyeOff className="h-3.5 w-3.5 text-slate-500" />}
            <span>Шлейфы АПС & СОУЭ</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLabels(!showLabels)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium transition ${
              showLabels
                ? 'bg-emerald-900/60 text-emerald-200 border-emerald-600/80 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {showLabels ? <Eye className="h-3.5 w-3.5 text-emerald-400" /> : <EyeOff className="h-3.5 w-3.5 text-slate-500" />}
            <span>Маркировка УГО</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-mono text-[11px] mr-1">Фильтр:</span>
          {(['all', 'aps', 'soue'] as const).map((sys) => (
            <button
              key={sys}
              type="button"
              onClick={() => setActiveSystem(sys)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition ${
                activeSystem === sys
                  ? 'bg-red-600 text-white shadow'
                  : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {sys === 'all' && 'Все системы'}
              {sys === 'aps' && 'Только АПС'}
              {sys === 'soue' && 'Только СОУЭ'}
            </button>
          ))}
        </div>
      </div>

      {/* Инспектор выбранного прибора при клике */}
      {selectedDevice && (
        <div className="w-full max-w-6xl flex items-center justify-between p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-xs animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
              <Activity className="h-4 w-4" />
            </span>
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>{selectedDevice.label}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  {selectedDevice.loopId}
                </span>
                <span className="text-emerald-400 font-normal">Нормативный контроль: 100% (СН РК)</span>
              </div>
              <p className="text-slate-400">
                Локация: {selectedDevice.roomName} • {selectedDevice.radius ? `Радиус защиты: ${selectedDevice.radius * 0.1}м` : 'Настенный монтаж'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedDevice(null)}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-mono"
          >
            Закрыть инспектор
          </button>
        </div>
      )}

      {/* SVG Canvas Scroll Viewport */}
      <div
        className={`w-full overflow-auto flex justify-center p-2 rounded-xl bg-slate-950/80 border border-slate-800 transition-all ${
          isMaximized ? 'flex-1 h-[calc(100vh-135px)] max-h-none' : 'max-h-[850px]'
        }`}
      >
        <div
          id="print-drawing-container"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
          }}
          className="shadow-2xl my-2 flex items-center justify-center shrink-0"
        >
          {/* 
            Официальный лист проектной документации AutoCAD (Формат А2/А1/А3/А4)
            Строго монохромный, векторный CAD-стиль по ГОСТ 21.1101-2013 
          */}
          <svg
            id="cad-drawing-svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1190 841"
            width={isMaximized ? '1190' : '1190'}
            height={isMaximized ? '841' : '841'}
            className="bg-white block select-none max-w-none shadow-2xl rounded-sm"
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
            imageRendering="optimizeQuality"
            style={{
              fontFamily: '"Roboto Mono", "Courier New", Courier, monospace',
              shapeRendering: 'geometricPrecision',
              textRendering: 'geometricPrecision',
              imageRendering: 'optimizeQuality',
            }}
          >
            {/* Базовая подложка листа */}
            <rect width="1190" height="841" fill="#FFFFFF" />

            {/* ============================================================ */}
            {/* ГОСТ РАМКА ЛИСТА А2 (Поля: левое 20мм, правое 5мм, верх 5мм, низ 5мм) */}
            {/* ============================================================ */}
            <g className="border-frames">
              {/* Внешняя линия обрезки листа (тонкая) */}
              <rect x="5" y="5" width="1180" height="831" fill="none" stroke="#000000" strokeWidth="0.5" />

              {/* Внутренняя основная рамка чертежа по ГОСТ (20мм слева для брошюровки, 5мм с остальных сторон) */}
              <rect x="20" y="5" width="1165" height="831" fill="none" stroke="#000000" strokeWidth="1.5" />

              {/* Координатная сетка полей (маркировка зоны чертежа: A, B, C, D / 1, 2, 3, 4, 5, 6) */}
              <g stroke="#000000" strokeWidth="0.5" fontSize="7" fill="#000000" textAnchor="middle">
                {/* Горизонтальные зоны */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num, i) => {
                  const x = 20 + i * (1165 / 8) + 1165 / 16;
                  return (
                    <React.Fragment key={`zone-top-${num}`}>
                      <text x={x} y="4">{num}</text>
                      <line x1={20 + (i + 1) * (1165 / 8)} y1="0" x2={20 + (i + 1) * (1165 / 8)} y2="5" />
                    </React.Fragment>
                  );
                })}
                {/* Вертикальные зоны */}
                {['A', 'B', 'C', 'D', 'E', 'F'].map((letter, i) => {
                  const y = 5 + i * (831 / 6) + 831 / 12;
                  return (
                    <React.Fragment key={`zone-left-${letter}`}>
                      <text x="12" y={y}>{letter}</text>
                      <line x1="0" y1={5 + (i + 1) * (831 / 6)} x2="5" y2={5 + (i + 1) * (831 / 6)} />
                    </React.Fragment>
                  );
                })}
              </g>
            </g>

            {/* ============================================================ */}
            {/* ОСНОВНОЙ ЗАГОЛОВОК И МАСШТАБ */}
            {/* ============================================================ */}
            <g className="sheet-headers">
              <text x="595" y="38" fontSize="13" fontWeight="bold" fill="#000000" textAnchor="middle">
                ПЛАН 1-ГО ЭТАЖА НА ОТМ. ±0.000. РАССТАНОВКА И ТРАССИРОВКА СИСТЕМ АПС И СОУЭ
              </text>
              <text x="595" y="52" fontSize="9" fontWeight="normal" fill="#000000" textAnchor="middle">
                Масштаб 1:300 • Категория здания по взрывопожарной опасности: "В" (СН РК 2.02-05-2014)
              </text>
              <line x1="400" y1="58" x2="790" y2="58" stroke="#000000" strokeWidth="0.75" />
            </g>

            {/* ============================================================ */}
            {/* ВЫСОТНЫЕ ОТМЕТКИ УРОВНЕЙ */}
            {/* ============================================================ */}
            <g className="elevation-marks" stroke="#000000" strokeWidth="0.75" fill="#000000" fontSize="8">
              {/* Отметка ±0.000 (Уровень чистого пола 1 этажа) */}
              <g transform="translate(110, 390)">
                <line x1="0" y1="0" x2="35" y2="0" />
                <path d="M 0 0 L 10 -6 L 10 0 Z" fill="#000000" />
                <text x="14" y="-3" fontSize="8" fontWeight="bold" stroke="none">±0.000</text>
                <text x="0" y="11" fontSize="6.5" stroke="none" fill="#333333">Ур. ч. п.</text>
              </g>

              {/* Отметка низа перекрытия (+3.200) */}
              <g transform="translate(110, 195)">
                <line x1="0" y1="0" x2="35" y2="0" />
                <path d="M 0 0 L 10 6 L 10 0 Z" fill="#000000" />
                <text x="14" y="9" fontSize="8" fontWeight="bold" stroke="none">+{ceilingHeight.toFixed(3)}</text>
                <text x="0" y="-4" fontSize="6.5" stroke="none" fill="#333333">Низ балок</text>
              </g>

              {/* Отметка верха парапета (+7.800) */}
              <g transform="translate(110, 110)">
                <line x1="0" y1="0" x2="35" y2="0" />
                <path d="M 0 0 L 10 6 L 10 0 Z" fill="#000000" />
                <text x="14" y="9" fontSize="8" fontWeight="bold" stroke="none">+7.800</text>
                <text x="0" y="-4" fontSize="6.5" stroke="none" fill="#333333">Парапет</text>
              </g>
            </g>

            {/* ============================================================ */}
            {/* ОСИ ЗДАНИЯ (AXES) С ВЫНОСНЫМИ МАРКАМИ */}
            {/* ============================================================ */}
            <g className="axes" stroke="#000000" strokeWidth="0.5">
              {/* Вертикальные координатные оси 1 .. 6 (начинаются в центре верхних кружков и оканчиваются в центре нижних) */}
              {/* Ось 1 (x=240) */}
              <line x1="240" y1="90" x2="240" y2="570" strokeDasharray="14,4,2,4" />
              {/* Ось 2 (x=360) */}
              <line x1="360" y1="90" x2="360" y2="570" strokeDasharray="14,4,2,4" />
              {/* Ось 3 (x=480) */}
              <line x1="480" y1="90" x2="480" y2="570" strokeDasharray="14,4,2,4" />
              {/* Ось 4 (x=600) */}
              <line x1="600" y1="90" x2="600" y2="570" strokeDasharray="14,4,2,4" />
              {/* Ось 5 (x=720) */}
              <line x1="720" y1="90" x2="720" y2="570" strokeDasharray="14,4,2,4" />
              {/* Ось 6 (x=840) */}
              <line x1="840" y1="90" x2="840" y2="570" strokeDasharray="14,4,2,4" />

              {/* Горизонтальные координатные оси А .. Г */}
              {/* Ось А (y=170) */}
              <line x1="160" y1="170" x2="920" y2="170" strokeDasharray="14,4,2,4" />
              {/* Ось Б (y=270) */}
              <line x1="160" y1="270" x2="920" y2="270" strokeDasharray="14,4,2,4" />
              {/* Ось В (y=390) */}
              <line x1="160" y1="390" x2="920" y2="390" strokeDasharray="14,4,2,4" />
              {/* Ось Г (y=490) */}
              <line x1="160" y1="490" x2="920" y2="490" strokeDasharray="14,4,2,4" />

              {/* Марки осей - Кружки с обозначениями */}
              {/* Верхний ряд осей (Цифры 1-6) */}
              {[
                { num: '1', x: 240 },
                { num: '2', x: 360 },
                { num: '3', x: 480 },
                { num: '4', x: 600 },
                { num: '5', x: 720 },
                { num: '6', x: 840 },
              ].map((axis) => (
                <g key={`axis-top-${axis.num}`} transform={`translate(${axis.x}, 90)`}>
                  <circle cx="0" cy="0" r="10" fill="#FFFFFF" stroke="#000000" strokeWidth="0.75" />
                  <text x="0" y="3.5" fontSize="9" fontWeight="bold" textAnchor="middle" stroke="none" fill="#000000">
                    {axis.num}
                  </text>
                </g>
              ))}

              {/* Нижний ряд осей (Цифры 1-6) */}
              {[
                { num: '1', x: 240 },
                { num: '2', x: 360 },
                { num: '3', x: 480 },
                { num: '4', x: 600 },
                { num: '5', x: 720 },
                { num: '6', x: 840 },
              ].map((axis) => (
                <g key={`axis-bot-${axis.num}`} transform={`translate(${axis.x}, 570)`}>
                  <circle cx="0" cy="0" r="10" fill="#FFFFFF" stroke="#000000" strokeWidth="0.75" />
                  <text x="0" y="3.5" fontSize="9" fontWeight="bold" textAnchor="middle" stroke="none" fill="#000000">
                    {axis.num}
                  </text>
                </g>
              ))}

              {/* Левый ряд осей (Буквы А-Г) */}
              {[
                { letter: 'А', y: 170 },
                { letter: 'Б', y: 270 },
                { letter: 'В', y: 390 },
                { letter: 'Г', y: 490 },
              ].map((axis) => (
                <g key={`axis-left-${axis.letter}`} transform={`translate(170, ${axis.y})`}>
                  <circle cx="0" cy="0" r="10" fill="#FFFFFF" stroke="#000000" strokeWidth="0.75" />
                  <text x="0" y="3.5" fontSize="9" fontWeight="bold" textAnchor="middle" stroke="none" fill="#000000">
                    {axis.letter}
                  </text>
                </g>
              ))}

              {/* Правый ряд осей (Буквы А-Г) */}
              {[
                { letter: 'А', y: 170 },
                { letter: 'Б', y: 270 },
                { letter: 'В', y: 390 },
                { letter: 'Г', y: 490 },
              ].map((axis) => (
                <g key={`axis-right-${axis.letter}`} transform={`translate(910, ${axis.y})`}>
                  <circle cx="0" cy="0" r="10" fill="#FFFFFF" stroke="#000000" strokeWidth="0.75" />
                  <text x="0" y="3.5" fontSize="9" fontWeight="bold" textAnchor="middle" stroke="none" fill="#000000">
                    {axis.letter}
                  </text>
                </g>
              ))}
            </g>

            {/* ============================================================ */}
            {/* РАЗМЕРНЫЕ ЦЕПОЧКИ ПО ПЕРИМЕТРУ С АРХИТЕКТУРНЫМИ ЗАСЕЧКАМИ (45°) */}
            {/* ============================================================ */}
            <g className="dimensions" stroke="#000000" strokeWidth="0.5" fontSize="7.5" fill="#000000" textAnchor="middle">
              {/* Функция засечки под 45 градусов: L x-2 y+2, L x+2 y-2 */}
              {/* ВЕРХНЯЯ РАЗМЕРНАЯ ЦЕПОЧКА (По осям 1-2, 2-3, 3-4, 4-5, 5-6) на y=120 */}
              <line x1="240" y1="120" x2="840" y2="120" />
              {[240, 360, 480, 600, 720, 840].map((x) => (
                <line key={`tick-top-step-${x}`} x1={x - 3} y1={120 + 3} x2={x + 3} y2={120 - 3} strokeWidth="1" />
              ))}
              {/* Тексты размеров в мм */}
              <text x="300" y="116" stroke="none">6000</text>
              <text x="420" y="116" stroke="none">6000</text>
              <text x="540" y="116" stroke="none">6000</text>
              <text x="660" y="116" stroke="none">6000</text>
              <text x="780" y="116" stroke="none">6000</text>

              {/* ВЕРХНЯЯ ГАБАРИТНАЯ ЦЕПОЧКА (Общая длина 30000 мм) на y=135 */}
              <line x1="240" y1="135" x2="840" y2="135" />
              <line x1="240 - 4" y1="135 + 4" x2="240 + 4" y2="135 - 4" strokeWidth="1.2" />
              <line x1="840 - 4" y1="135 + 4" x2="840 + 4" y2="135 - 4" strokeWidth="1.2" />
              <text x="540" y="131" fontSize="8.5" fontWeight="bold" stroke="none">30 000</text>

              {/* ЛЕВАЯ РАЗМЕРНАЯ ЦЕПОЧКА (По осям А-Б, Б-В, В-Г) на x=195 */}
              <line x1="195" y1="170" x2="195" y2="490" />
              {[170, 270, 390, 490].map((y) => (
                <line key={`tick-left-step-${y}`} x1={195 - 3} y1={y + 3} x2={195 + 3} y2={y - 3} strokeWidth="1" />
              ))}
              <g transform="rotate(-90 195 220)"><text x="195" y="216" stroke="none">6000</text></g>
              <g transform="rotate(-90 195 330)"><text x="195" y="326" stroke="none">6000</text></g>
              <g transform="rotate(-90 195 440)"><text x="195" y="436" stroke="none">6000</text></g>

              {/* ЛЕВАЯ ГАБАРИТНАЯ ЦЕПОЧКА (Общая ширина 18000 мм) на x=210 */}
              <line x1="210" y1="170" x2="210" y2="490" />
              <line x1="210 - 4" y1="170 + 4" x2="210 + 4" y2="170 - 4" strokeWidth="1.2" />
              <line x1="210 - 4" y1="490 + 4" x2="210 + 4" y2="490 - 4" strokeWidth="1.2" />
              <g transform="rotate(-90 210 330)"><text x="210" y="326" fontSize="8.5" fontWeight="bold" stroke="none">18 000</text></g>
            </g>

            {/* ============================================================ */}
            {/* НЕСУЩИЕ СТЕНЫ (WALLS) - ТОЛЩИНА 3.0px, ПЕРЕГОРОДКИ 1.5px */}
            {/* ============================================================ */}
            <g className="walls" stroke="#000000" fill="none">
              {/* Внешний контур несущих стен (Конструктивная коробка здания 30м x 18м) */}
              <rect x="235" y="165" width="610" height="330" strokeWidth="3" fill="#FDFDFD" />
              {/* Внутренняя грань внешней стены (толщина кирпича 380 мм) */}
              <rect x="242" y="172" width="596" height="316" strokeWidth="1" strokeDasharray="none" />

              {/* ЦЕНТРАЛЬНЫЙ СКВОЗНОЙ КОРИДОР (Ось Б - Ось В, ширина 2.4м) */}
              <line x1="242" y1="310" x2="838" y2="310" strokeWidth="2" />
              <line x1="242" y1="350" x2="838" y2="350" strokeWidth="2" />

              {/* МЕЖКОМНАТНЫЕ ПЕРЕГОРОДКИ (Верхний ряд: Кабинеты 101, 102, 103, 104, 105) */}
              <line x1="360" y1="172" x2="360" y2="310" strokeWidth="1.5" />
              <line x1="480" y1="172" x2="480" y2="310" strokeWidth="1.5" />
              <line x1="600" y1="172" x2="600" y2="310" strokeWidth="1.5" />
              <line x1="720" y1="172" x2="720" y2="310" strokeWidth="1.5" />

              {/* МЕЖКОМНАТНЫЕ ПЕРЕГОРОДКИ (Нижний ряд: Кабинеты 106, 107, 108, 109, 110) */}
              <line x1="360" y1="350" x2="360" y2="488" strokeWidth="1.5" />
              <line x1="480" y1="350" x2="480" y2="488" strokeWidth="1.5" />
              <line x1="600" y1="350" x2="600" y2="488" strokeWidth="1.5" />
              <line x1="720" y1="350" x2="720" y2="488" strokeWidth="1.5" />
            </g>

            {/* ============================================================ */}
            {/* ДВЕРНЫЕ ПРОЕМЫ С ДУГОЙ РАДИУСА ОТКРЫВАНИЯ */}
            {/* ============================================================ */}
            <g className="doors" stroke="#000000" fill="none">
              {/* Главный эвакуационный вход слева (Ось 1, Коридор) */}
              <line x1="235" y1="320" x2="235" y2="340" stroke="#FFFFFF" strokeWidth="4" />
              <line x1="235" y1="320" x2="220" y2="310" strokeWidth="1" stroke="#000000" />
              <path d="M 235 340 A 20 20 0 0 0 220 310" strokeWidth="0.5" strokeDasharray="2,2" stroke="#000000" />

              {/* Второй эвакуационный выход справа (Ось 6, Коридор) */}
              <line x1="845" y1="320" x2="845" y2="340" stroke="#FFFFFF" strokeWidth="4" />
              <line x1="845" y1="320" x2="860" y2="310" strokeWidth="1" stroke="#000000" />
              <path d="M 845 340 A 20 20 0 0 1 860 310" strokeWidth="0.5" strokeDasharray="2,2" stroke="#000000" />

              {/* Двери в верхние кабинеты (101 - 105) с выходом в коридор */}
              {[
                { x: 300, y: 310 },
                { x: 420, y: 310 },
                { x: 540, y: 310 },
                { x: 660, y: 310 },
                { x: 780, y: 310 },
              ].map((door, idx) => (
                <g key={`door-top-${idx}`}>
                  {/* Проем в перегородке */}
                  <line x1={door.x - 10} y1={door.y} x2={door.x + 10} y2={door.y} stroke="#FFFFFF" strokeWidth="3" />
                  {/* Полотно двери под углом */}
                  <line x1={door.x - 10} y1={door.y} x2={door.x - 5} y2={door.y - 14} strokeWidth="1" stroke="#000000" />
                  {/* Дуга хода открывания */}
                  <path d={`M ${door.x + 10} ${door.y} A 15 15 0 0 1 ${door.x - 5} ${door.y - 14}`} strokeWidth="0.5" stroke="#000000" strokeDasharray="1.5,1.5" />
                </g>
              ))}

              {/* Двери в нижние кабинеты (106 - 110) с выходом в коридор */}
              {[
                { x: 300, y: 350 },
                { x: 420, y: 350 },
                { x: 540, y: 350 },
                { x: 660, y: 350 },
                { x: 780, y: 350 },
              ].map((door, idx) => (
                <g key={`door-bot-${idx}`}>
                  <line x1={door.x - 10} y1={door.y} x2={door.x + 10} y2={door.y} stroke="#FFFFFF" strokeWidth="3" />
                  <line x1={door.x - 10} y1={door.y} x2={door.x - 5} y2={door.y + 14} strokeWidth="1" stroke="#000000" />
                  <path d={`M ${door.x + 10} ${door.y} A 15 15 0 0 0 ${door.x - 5} ${door.y + 14}`} strokeWidth="0.5" stroke="#000000" strokeDasharray="1.5,1.5" />
                </g>
              ))}
            </g>

            {/* ============================================================ */}
            {/* ОКОННЫЕ БЛОКИ (WINDOWS) В НЕСУЩИХ СТЕНАХ */}
            {/* ============================================================ */}
            <g className="windows" stroke="#000000" strokeWidth="0.75" fill="#FFFFFF">
              {/* Верхние окна (по 1 окну на каждый кабинет) */}
              {[300, 420, 540, 660, 780].map((x, i) => (
                <g key={`win-top-${i}`}>
                  <rect x={x - 20} y="165" width="40" height="7" strokeWidth="0.5" />
                  <line x1={x - 20} y1="168.5" x2={x + 20} y2="168.5" strokeWidth="0.5" />
                </g>
              ))}

              {/* Нижние окна */}
              {[300, 420, 540, 660, 780].map((x, i) => (
                <g key={`win-bot-${i}`}>
                  <rect x={x - 20} y="488" width="40" height="7" strokeWidth="0.5" />
                  <line x1={x - 20} y1="491.5" x2={x + 20} y2="491.5" strokeWidth="0.5" />
                </g>
              ))}
            </g>

            {/* ============================================================ */}
            {/* ВЫНОСКИ-МАРКИ ПОМЕЩЕНИЙ (НОМЕР, НАЗНАЧЕНИЕ, ПЛОЩАДЬ) - ВЕРХНИЙ ЛЕВЫЙ УГОЛ */}
            {/* ============================================================ */}
            <g className="room-tags" fontSize="6.5" fill="#000000" textAnchor="start">
              {[
                { no: '101', name: 'Каб. директора', area: '38.4', x: 250, y: 180, w: 74 },
                { no: '102', name: 'Серверная (ИТ)', area: '24.0', x: 368, y: 180, w: 72, isServer: true },
                { no: '103', name: 'Отдел кадров', area: '36.8', x: 488, y: 180, w: 70 },
                { no: '104', name: 'Бухгалтерия', area: '36.8', x: 608, y: 180, w: 68 },
                { no: '105', name: 'Юр. отдел', area: '38.4', x: 728, y: 180, w: 64 },
                { no: '106', name: 'Переговорная №1', area: '38.4', x: 250, y: 358, w: 76 },
                { no: '107', name: 'OpenSpace (Офис)', area: '72.0', x: 368, y: 358, w: 78 },
                { no: '108', name: 'Архив документов', area: '36.8', x: 608, y: 358, w: 76 },
                { no: '109', name: 'Конференц-зал', area: '44.5', x: 728, y: 358, w: 72 },
              ].map((room) => (
                <g key={`room-tag-${room.no}`}>
                  {/* Полупрозрачная плашка-подложка в верхнем левом углу */}
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.w}
                    height="20"
                    fill={room.isServer ? '#FEF3C7' : '#FFFFFF'}
                    fillOpacity="0.88"
                    stroke="#CBD5E1"
                    strokeWidth="0.5"
                    rx="3"
                    ry="3"
                  />
                  <line x1={room.x} y1={room.y + 10.5} x2={room.x + room.w} y2={room.y + 10.5} stroke="#E2E8F0" strokeWidth="0.5" />
                  <text x={room.x + 4} y={room.y + 8} fontWeight="bold" fontSize="6.8" fill="#0F172A">
                    {room.no}. {room.name}
                  </text>
                  <text x={room.x + 4} y={room.y + 17.5} fontSize="5.8" fontStyle="italic" fill="#64748B">
                    {room.area} м²
                  </text>
                </g>
              ))}

              {/* Марка коридора в свободном верхнем углу */}
              <g transform="translate(250, 314)">
                <rect x="0" y="0" width="138" height="15" fill="#FFFFFF" fillOpacity="0.88" stroke="#CBD5E1" strokeWidth="0.5" rx="3" ry="3" />
                <text x="5" y="10.5" fontWeight="bold" fontSize="6.5" fill="#0F172A">
                  100. Центральный коридор (86.5 м²)
                </text>
              </g>
            </g>

            {/* ============================================================ */}
            {/* АВТОМАТИЧЕСКАЯ РАССТАНОВКА ОБОРУДОВАНИЯ АПС & СОУЭ (FIRE SAFETY LAYOUT) */}
            {/* ============================================================ */}
            <FireSafetyLayout
              showRadiuses={showRadiuses}
              showCables={showCables}
              showLabels={showLabels}
              activeSystem={activeSystem}
              selectedDeviceId={selectedDevice?.id}
              onDeviceSelect={(device) => setSelectedDevice(device)}
            />

            {/* ============================================================ */}
            {/* ТАБЛИЦА: ЭКСПЛИКАЦИЯ ПОМЕЩЕНИЙ (Слева вверху листа) */}
            {/* ============================================================ */}
            <g className="table-explication" transform="translate(935, 80)" fontSize="6.5" stroke="#000000" strokeWidth="0.5">
              {/* Заголовок таблицы */}
              <rect x="0" y="0" width="230" height="16" fill="#F0F0F0" />
              <text x="115" y="11" fontWeight="bold" fontSize="7.5" stroke="none" fill="#000000" textAnchor="middle">
                ЭКСПЛИКАЦИЯ ПОМЕЩЕНИЙ
              </text>

              {/* Шапка */}
              <rect x="0" y="16" width="230" height="14" fill="#FAFAFA" />
              <line x1="25" y1="16" x2="25" y2="210" />
              <line x1="160" y1="16" x2="160" y2="210" />
              <line x1="195" y1="16" x2="195" y2="210" />

              <text x="12" y="26" fontWeight="bold" stroke="none" fill="#000000" textAnchor="middle">№</text>
              <text x="92" y="26" fontWeight="bold" stroke="none" fill="#000000" textAnchor="middle">Наименование помещения</text>
              <text x="177" y="26" fontWeight="bold" stroke="none" fill="#000000" textAnchor="middle">Площадь</text>
              <text x="212" y="26" fontWeight="bold" stroke="none" fill="#000000" textAnchor="middle">Кат.</text>

              {/* Строки экспликации */}
              {[
                { no: '100', name: 'Центральный коридор', area: '86.5', cat: 'Д' },
                { no: '101', name: 'Кабинет директора', area: '38.4', cat: 'В4' },
                { no: '102', name: 'Серверная (ИТ-узел)', area: '24.0', cat: 'В2' },
                { no: '103', name: 'Отдел кадров', area: '36.8', cat: 'В4' },
                { no: '104', name: 'Бухгалтерия', area: '36.8', cat: 'В4' },
                { no: '105', name: 'Юридический отдел', area: '38.4', cat: 'В4' },
                { no: '106', name: 'Переговорная №1', area: '38.4', cat: 'В4' },
                { no: '107', name: 'OpenSpace (Офис)', area: '72.0', cat: 'В4' },
                { no: '108', name: 'Архив документации', area: '36.8', cat: 'В3' },
                { no: '109', name: 'Конференц-зал', area: '44.5', cat: 'В4' },
              ].map((row, idx) => {
                const y = 30 + idx * 15;
                return (
                  <g key={`exp-row-${row.no}`}>
                    <line x1="0" y1={y} x2="230" y2={y} />
                    <text x="12" y={y + 10} stroke="none" fill="#000000" textAnchor="middle">{row.no}</text>
                    <text x="30" y={y + 10} stroke="none" fill="#000000">{row.name}</text>
                    <text x="177" y={y + 10} stroke="none" fill="#000000" textAnchor="middle">{row.area}</text>
                    <text x="212" y={y + 10} stroke="none" fill="#000000" textAnchor="middle">{row.cat}</text>
                  </g>
                );
              })}

              {/* Итоговая рамка */}
              <line x1="0" y1="180" x2="230" y2="180" />
              <rect x="0" y="180" width="230" height="16" fill="#F0F0F0" />
              <text x="92" y="191" fontWeight="bold" stroke="none" fill="#000000" textAnchor="middle">ИТОГО ПО ЭТАЖУ:</text>
              <text x="177" y="191" fontWeight="bold" stroke="none" fill="#000000" textAnchor="middle">{buildingArea} м²</text>
              <text x="212" y="191" fontWeight="bold" stroke="none" fill="#000000" textAnchor="middle">В</text>
              <rect x="0" y="0" width="230" height="196" fill="none" strokeWidth="1" />
            </g>

            {/* ============================================================ */}
            {/* ТАБЛИЦА: УСЛОВНЫЕ ОБОЗНАЧЕНИЯ (ГОСТ 28130-89) */}
            {/* ============================================================ */}
            <g className="table-legend" transform="translate(935, 290)" fontSize="6.5" stroke="#000000" strokeWidth="0.5">
              <rect x="0" y="0" width="230" height="16" fill="#F0F0F0" />
              <text x="115" y="11" fontWeight="bold" fontSize="7.5" stroke="none" fill="#000000" textAnchor="middle">
                УСЛОВНЫЕ ГРАФИЧЕСКИЕ ОБОЗНАЧЕНИЯ
              </text>

              <line x1="45" y1="16" x2="45" y2="195" />

              {[
                {
                  icon: (
                    <g transform="translate(22, 28)">
                      <circle cx="0" cy="0" r="4.5" fill="#FFFFFF" stroke="#000000" strokeWidth="0.75" />
                      <line x1="-3" y1="0" x2="3" y2="0" />
                      <line x1="0" y1="-3" x2="0" y2="3" />
                    </g>
                  ),
                  label: 'Извещатель пожарный дымовой ИП 212-141',
                },
                {
                  icon: (
                    <g transform="translate(22, 53)">
                      <rect x="-4.5" y="-4.5" width="9" height="9" fill="#FFFFFF" stroke="#000000" strokeWidth="0.75" />
                      <line x1="-4.5" y1="-4.5" x2="4.5" y2="4.5" />
                      <line x1="-4.5" y1="4.5" x2="4.5" y2="-4.5" />
                    </g>
                  ),
                  label: 'Извещатель тепловой ИП 101-1А-А1',
                },
                {
                  icon: (
                    <g transform="translate(22, 78)">
                      <rect x="-4" y="-4" width="8" height="8" fill="#000000" />
                    </g>
                  ),
                  label: 'Извещатель ручной ИПР 513-3АМ (h=1.5м)',
                },
                {
                  icon: (
                    <g transform="translate(22, 103)">
                      <polygon points="-3,-4 4,0 -3,4" fill="#000000" />
                    </g>
                  ),
                  label: 'Оповещатель звуковой/речевой СОУЭ (ОПОП)',
                },
                {
                  icon: (
                    <g transform="translate(22, 128)">
                      <rect x="-8" y="-3" width="16" height="6" fill="#FFFFFF" stroke="#000000" strokeWidth="0.75" />
                      <text x="0" y="1.5" fontSize="3" fontWeight="bold" textAnchor="middle" stroke="none" fill="#000000">ВЫХОД</text>
                    </g>
                  ),
                  label: 'Световое табло "ВЫХОД" (Молния-12)',
                },
                {
                  icon: (
                    <g transform="translate(22, 153)">
                      <line x1="-15" y1="0" x2="15" y2="0" strokeWidth="1" strokeDasharray="4,2" />
                    </g>
                  ),
                  label: 'Кабель огнестойкий КПСнг(А)-FRLS 1х2х0.75',
                },
              ].map((item, i) => {
                const y = 16 + i * 25;
                return (
                  <g key={`leg-${i}`}>
                    <line x1="0" y1={y} x2="230" y2={y} />
                    {item.icon}
                    <text x="50" y={y + 14} stroke="none" fill="#000000" fontSize="6.5">
                      {item.label}
                    </text>
                  </g>
                );
              })}
              <line x1="0" y1="166" x2="230" y2="166" />
              <rect x="0" y="0" width="230" height="166" fill="none" strokeWidth="1" />
            </g>

            {/* ============================================================ */}
            {/* ТЕХНИЧЕСКИЙ ШТАМП ПО ГОСТ 21.1101-2013 (НИЖНИЙ ПРАВЫЙ УГОЛ) */}
            {/* ============================================================ */}
            <g
              className="stamps"
              transform="translate(735, 656)"
              stroke="#000000"
              strokeWidth="0.5"
              fontFamily="Arial, Helvetica, sans-serif"
            >
              {/* Внешний габарит основной надписи (450 x 180 мм в масштабе чертежа) */}
              <rect x="0" y="0" width="450" height="180" fill="#FFFFFF" strokeWidth="1.5" />

              {/* Горизонтальные разделители левого блока подписей (y=0..100) */}
              <line x1="0" y1="20" x2="225" y2="20" strokeWidth="1" />
              <line x1="0" y1="40" x2="225" y2="40" strokeWidth="0.5" />
              <line x1="0" y1="60" x2="225" y2="60" strokeWidth="0.5" />
              <line x1="0" y1="80" x2="225" y2="80" strokeWidth="0.5" />
              <line x1="0" y1="100" x2="450" y2="100" strokeWidth="1" />

              {/* Вертикальные разделители левого блока подписей */}
              <line x1="45" y1="0" x2="45" y2="100" strokeWidth="0.5" />
              <line x1="105" y1="0" x2="105" y2="100" strokeWidth="0.5" />
              <line x1="160" y1="0" x2="160" y2="100" strokeWidth="0.5" />
              <line x1="225" y1="0" x2="225" y2="180" strokeWidth="1.5" />

              {/* Шапка таблицы подписей (y=0..20) */}
              <text x="22.5" y="14" stroke="none" fill="#000000" textAnchor="middle" fontSize="6.5" fontWeight="bold">Изм.</text>
              <text x="75" y="14" stroke="none" fill="#000000" textAnchor="middle" fontSize="6.5" fontWeight="bold">Фамилия</text>
              <text x="132.5" y="14" stroke="none" fill="#000000" textAnchor="middle" fontSize="6.5" fontWeight="bold">Подп.</text>
              <text x="192.5" y="14" stroke="none" fill="#000000" textAnchor="middle" fontSize="6.5" fontWeight="bold">Дата</text>

              {/* Должности, фамилии, подписи и даты (строго выровнены внутри колонок) */}
              {/* Строка 1: Разраб. */}
              <text x="5" y="34" stroke="none" fill="#000000" textAnchor="start" fontSize="6.5" fontWeight="bold">Разраб.</text>
              <text x="50" y="34" stroke="none" fill="#000000" textAnchor="start" fontSize="6.5">{designerName}</text>
              <text x="132.5" y="34" stroke="none" fill="#000000" textAnchor="middle" fontSize="6" fontStyle="italic">Алиев</text>
              <text x="192.5" y="34" stroke="none" fill="#000000" textAnchor="middle" fontSize="6">{currentDate}</text>

              {/* Строка 2: Пров. */}
              <text x="5" y="54" stroke="none" fill="#000000" textAnchor="start" fontSize="6.5" fontWeight="bold">Пров.</text>
              <text x="50" y="54" stroke="none" fill="#000000" textAnchor="start" fontSize="6.5">{approverName}</text>
              <text x="132.5" y="54" stroke="none" fill="#000000" textAnchor="middle" fontSize="6" fontStyle="italic">Смагулов</text>
              <text x="192.5" y="54" stroke="none" fill="#000000" textAnchor="middle" fontSize="6">{currentDate}</text>

              {/* Строка 3: ГИП */}
              <text x="5" y="74" stroke="none" fill="#000000" textAnchor="start" fontSize="6.5" fontWeight="bold">ГИП</text>
              <text x="50" y="74" stroke="none" fill="#000000" textAnchor="start" fontSize="6.5">Касымов Д.А.</text>
              <text x="132.5" y="74" stroke="none" fill="#000000" textAnchor="middle" fontSize="6" fontStyle="italic">Касымов</text>
              <text x="192.5" y="74" stroke="none" fill="#000000" textAnchor="middle" fontSize="6">{currentDate}</text>

              {/* Строка 4: Н.контр. */}
              <text x="5" y="94" stroke="none" fill="#000000" textAnchor="start" fontSize="6.5" fontWeight="bold">Н.контр.</text>
              <text x="50" y="94" stroke="none" fill="#000000" textAnchor="start" fontSize="6.5">Иванов В.И.</text>
              <text x="132.5" y="94" stroke="none" fill="#000000" textAnchor="middle" fontSize="6" fontStyle="italic">Иванов</text>
              <text x="192.5" y="94" stroke="none" fill="#000000" textAnchor="middle" fontSize="6">{currentDate}</text>

              {/* ======================================================== */}
              {/* ПРАВЫЙ БЛОК ШТАМПА (x=225..450) */}
              {/* ======================================================== */}
              
              {/* 1. Шифр проекта (y=0..50) */}
              <rect x="225" y="0" width="225" height="50" fill="#F8FAFC" />
              <text x="337.5" y="32" fontSize="13" fontWeight="bold" stroke="none" fill="#000000" textAnchor="middle" letterSpacing="0.5">
                02-2026-АПС.СОУЭ
              </text>

              {/* 2. Блок наименования объекта (y=50..100) с переносом строк */}
              <line x1="225" y1="50" x2="450" y2="50" strokeWidth="1" />
              <text x="337.5" y="67" fontSize="7.5" fontWeight="bold" stroke="none" fill="#000000" textAnchor="middle">
                <tspan x="337.5" y="67">{projectName}</tspan>
                <tspan x="337.5" dy="14" fontSize="6.5" fontWeight="normal" fill="#334155">
                  Республика Казахстан, г. Астана • S = {buildingArea} м²
                </tspan>
              </text>

              {/* 3. Блок наименования чертежа (y=100..135) с переносом строк */}
              <line x1="225" y1="135" x2="450" y2="135" strokeWidth="1" />
              <text x="337.5" y="115" fontSize="7.5" fontWeight="bold" stroke="none" fill="#000000" textAnchor="middle">
                <tspan x="337.5" y="115">План расстановки оборудования АПС и СОУЭ</tspan>
                <tspan x="337.5" dy="13" fontSize="6.5" fontWeight="normal" fill="#475569">
                  1-й этаж на отм. ±0.000 (Стадия П)
                </tspan>
              </text>

              {/* 4. Нижняя таблица: Стадия, Лист, Листов, Организация (y=135..180) */}
              <line x1="280" y1="135" x2="280" y2="180" strokeWidth="0.5" />
              <line x1="332" y1="135" x2="332" y2="180" strokeWidth="0.5" />
              <line x1="385" y1="135" x2="385" y2="180" strokeWidth="0.5" />
              <line x1="225" y1="155" x2="385" y2="155" strokeWidth="0.5" />

              {/* Заголовки ячеек */}
              <text x="252.5" y="148" stroke="none" fill="#000000" textAnchor="middle" fontSize="6.5" fontWeight="bold">Стадия</text>
              <text x="306" y="148" stroke="none" fill="#000000" textAnchor="middle" fontSize="6.5" fontWeight="bold">Лист</text>
              <text x="358.5" y="148" stroke="none" fill="#000000" textAnchor="middle" fontSize="6.5" fontWeight="bold">Листов</text>

              {/* Значения ячеек */}
              <text x="252.5" y="172" fontSize="11" fontWeight="bold" stroke="none" fill="#000000" textAnchor="middle">П</text>
              <text x="306" y="172" fontSize="10" fontWeight="bold" stroke="none" fill="#000000" textAnchor="middle">1</text>
              <text x="358.5" y="172" fontSize="10" fontWeight="bold" stroke="none" fill="#000000" textAnchor="middle">18</text>

              {/* Организация */}
              <text x="417.5" y="152" fontSize="8.5" fontWeight="bold" stroke="none" fill="#000000" textAnchor="middle">
                ТОО "FireCAD"
              </text>
              <text x="417.5" y="163" fontSize="6" stroke="none" fill="#333333" textAnchor="middle">
                САПР &amp; Инжиниринг
              </text>
              <text x="417.5" y="173" fontSize="5.5" stroke="none" fill="#666666" textAnchor="middle">
                Лицензия ГАСК №1400293
              </text>
            </g>

            {/* ============================================================ */}
            {/* БЛОК «ПРИМЕЧАНИЯ» ПО ГОСТ (РАСПОЛОЖЕН НИЖЕ ОСЕЙ С ПОДЛОЖКОЙ) */}
            {/* ============================================================ */}
            <g id="notes-block" className="notes" transform="translate(180, 625)" fontSize="6.5" fill="#000000">
              {/* Непрозрачный прямоугольник-подложка для защиты текста от пересечения линий */}
              <rect x="-12" y="-12" width="535" height="92" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="0.5" />
              
              <text x="0" y="2" fontWeight="bold" fontSize="7.5" fill="#000000">ПРИМЕЧАНИЯ:</text>
              <text x="0" y="16">1. За отметку ±0.000 принят уровень чистого пола 1-го этажа здания.</text>
              <text x="0" y="28">2. Монтаж извещателей пожарных выполнить в соответствии с требованиями СН РК 2.02-05-2014 и СП РК 2.02-105-2014.</text>
              <text x="0" y="40">3. Шлейфы АПС выполнить огнестойким кабелем КПСнг(А)-FRLS 1х2х0.75 в ПВХ гофротрубе с пределом огнестойкости E30.</text>
              <text x="0" y="52">4. Ручные пожарные извещатели установить на путях эвакуации на высоте 1.5 м от уровня чистого пола.</text>
              <text x="0" y="64">5. Световые оповещатели "ВЫХОД" установить над эвакуационными выходами на высоте не менее 2.0 м.</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};
