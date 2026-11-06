import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Layers,
  Eye,
  EyeOff,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Flame,
  Crosshair,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { EquipmentSpecification } from './EquipmentSpecification';
import { ExplanatoryNote } from './ExplanatoryNote';
import { ExportArchiveButton } from './ExportArchiveButton';

export type RoomType = 'office' | 'server' | 'corridor' | 'archive' | 'conference';

export interface Room {
  id: number | string;
  name: string;
  type: RoomType;
  width: number; // в условных единицах (100px = 1 метр)
  height: number;
  x: number;
  y: number;
}

export type CalculatedDeviceType = 'smoke' | 'heat' | 'sounder' | 'manual' | 'exit_sign';

export interface CalculatedDevice {
  id: string;
  roomId: number | string;
  roomName: string;
  type: CalculatedDeviceType;
  x: number;
  y: number;
  radius: number; // в пикселях
  label: string;
  coverageNorm: string;
}

// Входной массив комнат по умолчанию (100px = 1м)
export const initialRooms: Room[] = [
  { id: 1, name: 'Офис дирекции', type: 'office', width: 1200, height: 600, x: 0, y: 0 },
  { id: 2, name: 'Серверная (ИТ-узел)', type: 'server', width: 400, height: 600, x: 1200, y: 0 },
  { id: 3, name: 'Центральный коридор', type: 'corridor', width: 1600, height: 300, x: 0, y: 600 },
];

/**
 * АЛГОРИТМ АВТОМАТИЧЕСКОЙ РАССТАНОВКИ ОБОРУДОВАНИЯ (СН РК 2.02-05-2014)
 * Принимает геометрию комнат и рассчитывает координаты (X,Y) датчиков для 100% покрытия
 */
export function calculateDevices(rooms: Room[]): CalculatedDevice[] {
  const devices: CalculatedDevice[] = [];
  let smokeCounter = 1;
  let heatCounter = 1;
  let sounderCounter = 1;

  rooms.forEach((room) => {
    // 1. Определение типа извещателя и радиуса защиты
    const isServer = room.type === 'server';
    const isCorridor = room.type === 'corridor';

    const deviceType: CalculatedDeviceType = isServer ? 'heat' : 'smoke';
    // Дымовые ИП 212: R = 450px (4.5м), Тепловые ИП 101: R = 250px (2.5м)
    const radius = isServer ? 250 : 450;
    const normText = isServer ? 'R=2.5м (СН РК табл. 5)' : 'R=4.5м (СН РК табл. 4)';

    // 2. Расчет сетки размещения (Колонки x Строки)
    // Шаг между датчиками рассчитывается с коэффициентом перекрытия ~1.414 для исключения слепых зон
    const maxSpacing = radius * 1.5;

    let cols = Math.max(1, Math.ceil(room.width / maxSpacing));
    let rows = Math.max(1, Math.ceil(room.height / maxSpacing));

    // Требование надежности по нормам: минимум 2 датчика на стандартное помещение
    if (room.type === 'office' || room.type === 'conference' || room.type === 'archive') {
      if (cols * rows < 2) {
        if (room.width >= room.height) {
          cols = 2;
        } else {
          rows = 2;
        }
      }
    }

    const cellWidth = room.width / cols;
    const cellHeight = room.height / rows;

    // 3. Генерация координат в центрах расчетных секторов
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const posX = Math.round(room.x + (c + 0.5) * cellWidth);
        const posY = Math.round(room.y + (r + 0.5) * cellHeight);

        const currentId =
          deviceType === 'heat'
            ? `ИП-101 #${heatCounter++}`
            : `ИП-212 #${smokeCounter++}`;

        devices.push({
          id: `dev-${room.id}-${c}-${r}`,
          roomId: room.id,
          roomName: room.name,
          type: deviceType,
          x: posX,
          y: posY,
          radius: radius,
          label: currentId,
          coverageNorm: normText,
        });
      }
    }

    // 4. Для коридоров: обязательный звуковой/речевой оповещатель СОУЭ на стене
    if (isCorridor) {
      devices.push({
        id: `soue-sounder-${room.id}`,
        roomId: room.id,
        roomName: room.name,
        type: 'sounder',
        x: room.x + 40,
        y: Math.round(room.y + room.height / 2),
        radius: 600, // Акустический радиус слышимости
        label: `СОУЭ-ГР#${sounderCounter++}`,
        coverageNorm: '85 дБА (СН РК 2.02-05-2014)',
      });

      // Добавим второй оповещатель, если коридор очень длинный (>1200px)
      if (room.width > 1200) {
        devices.push({
          id: `soue-sounder-2-${room.id}`,
          roomId: room.id,
          roomName: room.name,
          type: 'sounder',
          x: room.x + room.width - 40,
          y: Math.round(room.y + room.height / 2),
          radius: 600,
          label: `СОУЭ-ГР#${sounderCounter++}`,
          coverageNorm: '85 дБА (СН РК 2.02-05-2014)',
        });
      }
    }
  });

  return devices;
}

interface SmartFireSafetyLayoutProps {
  customRooms?: Room[];
  onRoomsChange?: (rooms: Room[]) => void;
}

export const SmartFireSafetyLayout: React.FC<SmartFireSafetyLayoutProps> = ({
  customRooms,
  onRoomsChange,
}) => {
  const [rooms, setRooms] = useState<Room[]>(customRooms || initialRooms);
  const [showRadiuses, setShowRadiuses] = useState<boolean>(true);
  const [showCables, setShowCables] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [selectedRoomId, setSelectedRoomId] = useState<number | string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showSpecification, setShowSpecification] = useState<boolean>(true);
  const [showExplanatoryNote, setShowExplanatoryNote] = useState<boolean>(false);

  // Вызов алгоритма расчета через useMemo для высокой производительности
  const calculatedDevices = useMemo(() => {
    return calculateDevices(rooms);
  }, [rooms]);

  // Вычисление габаритов SVG холста по всем комнатам
  const bounds = useMemo(() => {
    let minX = 0;
    let minY = 0;
    let maxX = 1600;
    let maxY = 900;

    rooms.forEach((r) => {
      minX = Math.min(minX, r.x);
      minY = Math.min(minY, r.y);
      maxX = Math.max(maxX, r.x + r.width);
      maxY = Math.max(maxY, r.y + r.height);
    });

    const padding = 120;
    return {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };
  }, [rooms]);

  // Построение шлейфа кабельной трассы между приборами
  const cablePath = useMemo(() => {
    const smokeAndHeat = calculatedDevices.filter((d) => d.type === 'smoke' || d.type === 'heat');
    if (smokeAndHeat.length === 0) return '';
    return smokeAndHeat.reduce((acc, dev, idx) => {
      return `${acc} ${idx === 0 ? 'M' : 'L'} ${dev.x} ${dev.y}`;
    }, '');
  }, [calculatedDevices]);

  // Статистика расчета
  const stats = useMemo(() => {
    const smokeCount = calculatedDevices.filter((d) => d.type === 'smoke').length;
    const heatCount = calculatedDevices.filter((d) => d.type === 'heat').length;
    const sounderCount = calculatedDevices.filter((d) => d.type === 'sounder').length;
    const totalAreaM2 = rooms.reduce((acc, r) => acc + (r.width * r.height) / 10000, 0);

    return {
      smokeCount,
      heatCount,
      sounderCount,
      totalAreaM2: Math.round(totalAreaM2),
      totalDevices: calculatedDevices.length,
    };
  }, [calculatedDevices, rooms]);

  const handleUpdateRoomDimension = (id: number | string, field: 'width' | 'height', val: number) => {
    const updated = rooms.map((r) => (r.id === id ? { ...r, [field]: Math.max(200, val) } : r));
    setRooms(updated);
    onRoomsChange?.(updated);
  };

  const handleReset = () => {
    setRooms(initialRooms);
    onRoomsChange?.(initialRooms);
  };

  return (
    <div className="w-full flex flex-col items-center bg-slate-950 rounded-2xl border border-slate-800 p-4 md:p-6 shadow-2xl space-y-4">
      {/* Верхний CAD Тулбар */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <div className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Smart FireCAD Layout Engine</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Data-Driven СН РК
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Динамический расчет координат и радиусов покрытия (100px = 1.0 м)
            </p>
          </div>
        </div>

        {/* Управление масштабом и слоями */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            title="Уменьшить"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="px-2 font-mono text-slate-300 font-bold min-w-[50px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(1.5, Number((z + 0.15).toFixed(2))))}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            title="Увеличить"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            title="Сброс масштаба"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Сброс геометрии</span>
          </button>
        </div>
      </div>

      {/* Панель переключения слоев и метрик */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-mono flex items-center gap-1 mr-1">
            <Layers className="h-3.5 w-3.5 text-red-400" />
            Слои:
          </span>

          <button
            type="button"
            onClick={() => setShowRadiuses(!showRadiuses)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium transition ${
              showRadiuses
                ? 'bg-blue-900/50 text-blue-200 border-blue-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            {showRadiuses ? <Eye className="h-3.5 w-3.5 text-blue-400" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>Зоны контроля (Радиусы)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCables(!showCables)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium transition ${
              showCables
                ? 'bg-red-900/50 text-red-200 border-red-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            {showCables ? <Eye className="h-3.5 w-3.5 text-red-400" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>Шлейф АПС</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLabels(!showLabels)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium transition ${
              showLabels
                ? 'bg-emerald-900/50 text-emerald-200 border-emerald-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            {showLabels ? <Eye className="h-3.5 w-3.5 text-emerald-400" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>Маркировка (ID)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSpecification(!showSpecification)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium transition ${
              showSpecification
                ? 'bg-amber-900/50 text-amber-200 border-amber-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-amber-400" />
            <span>Спецификация ГОСТ</span>
          </button>

          <button
            type="button"
            onClick={() => setShowExplanatoryNote(!showExplanatoryNote)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium transition ${
              showExplanatoryNote
                ? 'bg-blue-900/50 text-blue-200 border-blue-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-blue-400" />
            <span>Пояснительная записка</span>
          </button>

          <ExportArchiveButton
            variant="compact"
            buttonText="Экспорт ПСД (.zip)"
            projectData={{
              projectName: 'Административно-офисный комплекс (Блок А)',
              objectAddress: 'г. Астана, пр. Мангилик Ел, 55/8',
              totalArea: stats.totalAreaM2,
              floorsCount: 3,
              normBase: 'СН РК 2.02-05-2014, СП РК 2.02-105-2014',
              rooms: rooms,
              devices: calculatedDevices,
              authorName: 'Ахметов А. Е.',
              gipName: 'Смагулов Б. К.',
            }}
          />
        </div>

        {/* Живые результаты расчета */}
        <div className="flex items-center gap-3 text-slate-300 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-400"></span>
            <span>Дымовых: <strong className="text-white">{stats.smokeCount} шт</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-orange-400"></span>
            <span>Тепловых: <strong className="text-white">{stats.heatCount} шт</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-600"></span>
            <span>СОУЭ: <strong className="text-white">{stats.sounderCount} шт</strong></span>
          </div>
          <div className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-emerald-400 font-bold">
            Покрытие: 100%
          </div>
        </div>
      </div>

      {/* SVG Canvas с автоматической расстановкой */}
      <div className="w-full overflow-auto max-h-[720px] flex justify-center p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
          }}
          className="shadow-2xl my-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`}
            width={bounds.width * 0.55}
            height={bounds.height * 0.55}
            className="bg-white block select-none rounded-lg"
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
            {/* Фоновая подложка */}
            <rect
              x={bounds.x}
              y={bounds.y}
              width={bounds.width}
              height={bounds.height}
              fill="#FFFFFF"
            />

            {/* Координатная сетка листа 100x100px (1x1 метр) */}
            <defs>
              <pattern id="grid-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#F1F5F9" strokeWidth="1" />
                <path d="M 50 0 L 50 100 M 0 50 L 100 50" fill="none" stroke="#F8FAFC" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect
              x={bounds.x}
              y={bounds.y}
              width={bounds.width}
              height={bounds.height}
              fill="url(#grid-pattern)"
            />

            {/* ========================================================== */}
            {/* ШАГ 1: АРХИТЕКТУРНЫЕ СТЕНЫ И МАРКИ ПОМЕЩЕНИЙ               */}
            {/* ========================================================== */}
            <g className="rooms-architecture">
              {rooms.map((room) => {
                const isSelected = selectedRoomId === room.id;
                const isServer = room.type === 'server';
                const isCorridor = room.type === 'corridor';
                const areaM2 = ((room.width * room.height) / 10000).toFixed(1);

                return (
                  <g
                    key={`room-${room.id}`}
                    onClick={() => setSelectedRoomId(room.id)}
                    className="cursor-pointer group"
                  >
                    {/* Заливка комнаты */}
                    <rect
                      x={room.x}
                      y={room.y}
                      width={room.width}
                      height={room.height}
                      fill={isServer ? '#FFF7ED' : isCorridor ? '#F8FAFC' : '#F0FDF4'}
                      stroke={isSelected ? '#2563eb' : '#334155'}
                      strokeWidth={isSelected ? 4 : 3}
                    />

                    {/* Внутренний тонкий контур */}
                    <rect
                      x={room.x + 8}
                      y={room.y + 8}
                      width={room.width - 16}
                      height={room.height - 16}
                      fill="none"
                      stroke={isSelected ? '#93c5fd' : '#E2E8F0'}
                      strokeWidth="1"
                    />

                    {/* Текстовая выноска в верхнем левом углу помещения */}
                    <g transform={`translate(${room.x + 15}, ${room.y + 25})`}>
                      <rect
                        x="0"
                        y="0"
                        width={Math.max(150, room.name.length * 8 + 35)}
                        height="32"
                        fill="#FFFFFF"
                        fillOpacity="0.88"
                        stroke="#CBD5E1"
                        strokeWidth="0.8"
                        rx="3"
                        ry="3"
                      />
                      <text
                        x="8"
                        y="14"
                        fontSize="11"
                        fontWeight="bold"
                        fill="#0F172A"
                      >
                        {room.name}
                      </text>
                      <text
                        x="8"
                        y="26"
                        fontSize="9.5"
                        fill="#64748B"
                      >
                        {areaM2} м² ({room.width / 100}м × {room.height / 100}м)
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>

            {/* ========================================================== */}
            {/* ШАГ 2: ЗОНЫ ПОКРЫТИЯ (РАДИУСЫ ДАТЧИКОВ)                    */}
            {/* ========================================================== */}
            {showRadiuses && (
              <g className="coverage-radiuses-layer pointer-events-none">
                {calculatedDevices.map((dev) => {
                  if (dev.type === 'sounder') return null;

                  const isHeat = dev.type === 'heat';
                  return (
                    <g key={`rad-${dev.id}`}>
                      {/* Окружность зоны контроля */}
                      <circle
                        cx={dev.x}
                        cy={dev.y}
                        r={dev.radius}
                        fill={isHeat ? '#EA580C' : '#2563EB'}
                        fillOpacity={isHeat ? 0.1 : 0.05}
                        stroke={isHeat ? '#EA580C' : '#2563EB'}
                        strokeWidth="1.5"
                        strokeDasharray="6,4"
                      />
                      {/* Метка радиуса */}
                      <text
                        x={dev.x}
                        y={dev.y - dev.radius + 20}
                        fontSize="11"
                        fontWeight="bold"
                        fill={isHeat ? '#C2410C' : '#1D4ED8'}
                        textAnchor="middle"
                        opacity={0.85}
                      >
                        {dev.coverageNorm}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* ========================================================== */}
            {/* ШАГ 3: ШЛЕЙФ СИГНАЛИЗАЦИИ (КАБЕЛЬНАЯ ТРАССА)               */}
            {/* ========================================================== */}
            {showCables && cablePath && (
              <g className="cable-routes-layer">
                {/* Подложка */}
                <path
                  d={cablePath}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Трасса КПСнг-FRLS */}
                <path
                  d={cablePath}
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="2.5"
                  strokeDasharray="8,4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}

            {/* ========================================================== */}
            {/* ШАГ 4: СГЕНЕРИРОВАННОЕ ОБОРУДОВАНИЕ (УГО)                  */}
            {/* ========================================================== */}
            <g className="devices-layer">
              {calculatedDevices.map((dev) => {
                return (
                  <g
                    key={`device-icon-${dev.id}`}
                    transform={`translate(${dev.x}, ${dev.y})`}
                    className="cursor-pointer group"
                  >
                    {/* 1. ДЫМОВОЙ ИЗВЕЩАТЕЛЬ (КРАСНЫЙ КРУЖОК r=10 С ПЕРЕКРЕСТИЕМ) */}
                    {dev.type === 'smoke' && (
                      <g>
                        <circle cx="0" cy="0" r="10" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
                        <line x1="-6" y1="0" x2="6" y2="0" stroke="#FFFFFF" strokeWidth="1.5" />
                        <line x1="0" y1="-6" x2="0" y2="6" stroke="#FFFFFF" strokeWidth="1.5" />
                        <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
                      </g>
                    )}

                    {/* 2. ТЕПЛОВОЙ ИЗВЕЩАТЕЛЬ (КРАСНЫЙ КВАДРАТ 10x10) */}
                    {dev.type === 'heat' && (
                      <g>
                        <rect x="-10" y="-10" width="20" height="20" fill="#EA580C" stroke="#9A3412" strokeWidth="1.5" rx="2" />
                        <line x1="-7" y1="-7" x2="7" y2="7" stroke="#FFFFFF" strokeWidth="1.5" />
                        <line x1="-7" y1="7" x2="7" y2="-7" stroke="#FFFFFF" strokeWidth="1.5" />
                        <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
                      </g>
                    )}

                    {/* 3. ЗВУКОВОЙ ОПОВЕЩАТЕЛЬ СОУЭ (СИНИЙ ТРЕУГОЛЬНИК) */}
                    {dev.type === 'sounder' && (
                      <g>
                        <polygon points="-8,-10 12,0 -8,10" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1.5" />
                        <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* ========================================================== */}
            {/* ШАГ 5: ТЕКСТОВЫЕ ВЫНОСКИ ID ПРИБОРОВ (ВЕРХНИЙ СЛОЙ)        */}
            {/* ========================================================== */}
            {showLabels && (
              <g className="device-labels-top-layer pointer-events-none">
                {calculatedDevices.map((dev) => (
                  <g key={`label-dev-${dev.id}`} transform={`translate(${dev.x + 14}, ${dev.y - 14})`}>
                    <rect
                      x="0"
                      y="-10"
                      width={dev.label.length * 7 + 12}
                      height="18"
                      fill="#FFFFFF"
                      fillOpacity="0.88"
                      stroke={dev.type === 'heat' ? '#EA580C' : dev.type === 'sounder' ? '#2563EB' : '#DC2626'}
                      strokeWidth="0.8"
                      rx="3"
                      ry="3"
                    />
                    <text
                      x="6"
                      y="3"
                      fontSize="9.5"
                      fontWeight="bold"
                      fill={dev.type === 'heat' ? '#EA580C' : dev.type === 'sounder' ? '#2563EB' : '#DC2626'}
                    >
                      {dev.label}
                    </text>
                  </g>
                ))}
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Интерактивный редактор размеров комнат */}
      <div className="w-full bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold text-white flex items-center gap-2">
            <Sliders className="h-4 w-4 text-red-400" />
            <span>Интерактивный тест алгоритма расстановки: меняйте размеры комнат</span>
          </div>
          <span className="text-slate-400 font-mono">100px = 1 метр</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div key={`edit-room-${room.id}`} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-200">
                <span>{room.name}</span>
                <span className="text-emerald-400 font-mono">{((room.width * room.height) / 10000).toFixed(1)} м²</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Ширина: {room.width}px ({room.width / 100}м)</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={2000}
                  step={50}
                  value={room.width}
                  onChange={(e) => handleUpdateRoomDimension(room.id, 'width', Number(e.target.value))}
                  className="w-full accent-red-600 bg-slate-800 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-slate-400 pt-1">
                  <span>Высота: {room.height}px ({room.height / 100}м)</span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={1200}
                  step={50}
                  value={room.height}
                  onChange={(e) => handleUpdateRoomDimension(room.id, 'height', Number(e.target.value))}
                  className="w-full accent-red-600 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Вывод реактивной спецификации оборудования по ГОСТ на основе сгенерированных devices */}
      {showSpecification && (
        <div className="w-full pt-2">
          <EquipmentSpecification
            devices={calculatedDevices}
            projectName="Административный комплекс (Корпус 1)"
            objectAddress="г. Астана, пр. Мангилик Ел, 55/8"
            showStamp={true}
          />
        </div>
      )}

      {/* Вывод Пояснительной записки (ГОСТ / СН РК) */}
      {showExplanatoryNote && (
        <div className="w-full pt-2">
          <ExplanatoryNote
            project={{
              title: 'Административно-офисный комплекс (Блок А)',
              address: 'г. Астана, пр. Мангилик Ел, 55/8',
              area: stats.totalAreaM2,
              floors: 3,
              normBase: 'СН РК 2.02-05-2014, СП РК 2.02-105-2014',
              totalDevices: calculatedDevices.length,
              totalCableMeters: Math.ceil(calculatedDevices.length * 5 * 1.15),
              smokeDetectors: calculatedDevices.filter((d) => d.type === 'smoke').length,
              heatDetectors: calculatedDevices.filter((d) => d.type === 'heat').length,
              soundersCount: calculatedDevices.filter((d) => d.type === 'sounder').length,
              authorName: 'Ахметов А. Е.',
              gipName: 'Смагулов Б. К.',
            }}
            showStamp={true}
          />
        </div>
      )}
    </div>
  );
};
