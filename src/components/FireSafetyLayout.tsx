import React, { useState } from 'react';
import { Eye, EyeOff, Layers, ShieldCheck, Zap, Activity } from 'lucide-react';

export type DeviceType = 'smoke' | 'heat' | 'manual' | 'sounder' | 'exit_sign' | 'panel';

export interface FireDevice {
  id: string;
  type: DeviceType;
  x: number;
  y: number;
  radius?: number; // радиус зоны контроля в координатах чертежа
  label: string;
  roomName: string;
  loopId: string;
  power?: string;
  dbLevel?: number;
}

export interface CableRoute {
  id: string;
  system: 'aps' | 'soue';
  points: { x: number; y: number }[];
  color: string;
  strokeDash: string;
  label: string;
}

interface FireSafetyLayoutProps {
  showRadiuses?: boolean;
  showCables?: boolean;
  showLabels?: boolean;
  activeSystem?: 'all' | 'aps' | 'soue';
  onDeviceSelect?: (device: FireDevice) => void;
  selectedDeviceId?: string | null;
}

// Реактивный массив оборудования с физической привязкой к координатам плана (viewBox 0 0 1190 841)
export const initialDevices: FireDevice[] = [
  // Прибор приемно-контрольный пожарный (ППКП) в помещении охраны/серверной
  { id: 'ppkp-1', type: 'panel', x: 255, y: 325, label: 'ППКП Сириус', roomName: 'Пост охраны / Коридор', loopId: 'Шлейф 1/2' },

  // ДЫМОВЫЕ ИЗВЕЩАТЕЛИ (ИП 212-141) В КАБИНЕТАХ ВЕРХНЕГО РЯДА (R=75px ~ 7.5м)
  { id: 'det-1', type: 'smoke', x: 300, y: 235, radius: 75, label: 'ИП 212 #1.1', roomName: 'Пом. 101 (Кабинет директора)', loopId: 'ШС 1' },
  // ТЕПЛОВОЙ ИЗВЕЩАТЕЛЬ В СЕРВЕРНОЙ (Пом. 102, R=52px ~ 5.0м по нормам В2)
  { id: 'det-2', type: 'heat', x: 420, y: 235, radius: 54, label: 'ИП 101 #1.2', roomName: 'Пом. 102 (Серверная / ИТ)', loopId: 'ШС 1' },
  { id: 'det-3', type: 'smoke', x: 540, y: 235, radius: 75, label: 'ИП 212 #1.3', roomName: 'Пом. 103 (Отдел кадров)', loopId: 'ШС 1' },
  { id: 'det-4', type: 'smoke', x: 660, y: 235, radius: 75, label: 'ИП 212 #1.4', roomName: 'Пом. 104 (Бухгалтерия)', loopId: 'ШС 1' },
  { id: 'det-5', type: 'smoke', x: 780, y: 235, radius: 75, label: 'ИП 212 #1.5', roomName: 'Пом. 105 (Юристы)', loopId: 'ШС 1' },

  // ДЫМОВЫЕ ИЗВЕЩАТЕЛИ В ЦЕНТРАЛЬНОМ КОРИДОРЕ (Пом. 100)
  { id: 'det-c1', type: 'smoke', x: 360, y: 330, radius: 75, label: 'ИП 212 #1.6', roomName: 'Пом. 100 (Коридор Запад)', loopId: 'ШС 1' },
  { id: 'det-c2', type: 'smoke', x: 480, y: 330, radius: 75, label: 'ИП 212 #1.7', roomName: 'Пом. 100 (Коридор Центр-1)', loopId: 'ШС 1' },
  { id: 'det-c3', type: 'smoke', x: 600, y: 330, radius: 75, label: 'ИП 212 #1.8', roomName: 'Пом. 100 (Коридор Центр-2)', loopId: 'ШС 1' },
  { id: 'det-c4', type: 'smoke', x: 720, y: 330, radius: 75, label: 'ИП 212 #1.9', roomName: 'Пом. 100 (Коридор Восток)', loopId: 'ШС 1' },

  // ДЫМОВЫЕ ИЗВЕЩАТЕЛИ В КАБИНЕТАХ НИЖНЕГО РЯДА
  { id: 'det-6', type: 'smoke', x: 300, y: 420, radius: 75, label: 'ИП 212 #1.10', roomName: 'Пом. 106 (Переговорная)', loopId: 'ШС 1' },
  { id: 'det-7a', type: 'smoke', x: 440, y: 420, radius: 75, label: 'ИП 212 #1.11', roomName: 'Пом. 107 (OpenSpace Зона 1)', loopId: 'ШС 1' },
  { id: 'det-7b', type: 'smoke', x: 520, y: 420, radius: 75, label: 'ИП 212 #1.12', roomName: 'Пом. 107 (OpenSpace Зона 2)', loopId: 'ШС 1' },
  { id: 'det-8', type: 'smoke', x: 660, y: 420, radius: 75, label: 'ИП 212 #1.13', roomName: 'Пом. 108 (Архив)', loopId: 'ШС 1' },
  { id: 'det-9', type: 'smoke', x: 780, y: 420, radius: 75, label: 'ИП 212 #1.14', roomName: 'Пом. 109 (Конференц-зал)', loopId: 'ШС 1' },

  // РУЧНЫЕ ПОЖАРНЫЕ ИЗВЕЩАТЕЛИ (ИПР 513) У ЭВАКУАЦИОННЫХ ВЫХОДОВ НА СТЕНАХ (h=1.5м)
  { id: 'ipr-1', type: 'manual', x: 248, y: 312, label: 'ИПР-1 (Выход 1)', roomName: 'Эвакуационный выход 1', loopId: 'ШС 1' },
  { id: 'ipr-2', type: 'manual', x: 832, y: 312, label: 'ИПР-2 (Выход 2)', roomName: 'Эвакуационный выход 2', loopId: 'ШС 1' },

  // ЗВУКОВЫЕ / РЕЧЕВЫЕ ОПОВЕЩАТЕЛИ СОУЭ (ОПОП / Громкоговорители на стенах коридора и залов)
  { id: 'spk-1', type: 'sounder', x: 390, y: 312, label: 'СОУЭ-ГР1', roomName: 'Коридор Запад (88 дБ)', loopId: 'ЛС-1', dbLevel: 88 },
  { id: 'spk-2', type: 'sounder', x: 690, y: 312, label: 'СОУЭ-ГР2', roomName: 'Коридор Восток (88 дБ)', loopId: 'ЛС-1', dbLevel: 88 },
  { id: 'spk-3', type: 'sounder', x: 480, y: 352, label: 'СОУЭ-ГР3', roomName: 'OpenSpace (85 дБ)', loopId: 'ЛС-1', dbLevel: 85 },

  // СВЕТОВЫЕ ТАБЛО "ВЫХОД" НАД ПРОЕМАМИ ЭВАКУАЦИОННЫХ ВЫХОДОВ
  { id: 'exit-1', type: 'exit_sign', x: 236, y: 330, label: 'Табло ВЫХОД-1', roomName: 'Над выходом в блок А', loopId: 'ЛС-2' },
  { id: 'exit-2', type: 'exit_sign', x: 844, y: 330, label: 'Табло ВЫХОД-2', roomName: 'Над выходом на лестницу', loopId: 'ЛС-2' },
];

// Ортогональные кабельные трассы (шлейфы) под прямыми углами
export const cableRoutes: CableRoute[] = [
  // Магистральный шлейф сигнализации АПС (ШС 1): ППКП -> ИПР-1 -> ИП212 -> ... -> ИПР-2
  {
    id: 'cable-aps-main',
    system: 'aps',
    color: '#dc2626', // Красный цвет
    strokeDash: '5,3',
    label: 'Шлейф АПС №1 (КПСнг(А)-FRLS 1х2х0.75)',
    points: [
      { x: 255, y: 325 }, // ППКП
      { x: 248, y: 312 }, // ИПР-1
      { x: 360, y: 312 },
      { x: 360, y: 330 }, // Извещатель в коридоре 1.6
      { x: 360, y: 235 },
      { x: 300, y: 235 }, // Кабинет 101
      { x: 360, y: 235 },
      { x: 420, y: 235 }, // Серверная (ИП 101)
      { x: 480, y: 235 },
      { x: 480, y: 330 }, // Извещатель в коридоре 1.7
      { x: 480, y: 235 },
      { x: 540, y: 235 }, // Кабинет 103
      { x: 600, y: 235 },
      { x: 600, y: 330 }, // Извещатель в коридоре 1.8
      { x: 600, y: 235 },
      { x: 660, y: 235 }, // Кабинет 104
      { x: 720, y: 235 },
      { x: 720, y: 330 }, // Извещатель в коридоре 1.9
      { x: 720, y: 235 },
      { x: 780, y: 235 }, // Кабинет 105
      { x: 780, y: 312 },
      { x: 832, y: 312 }, // ИПР-2
    ],
  },
  // Нижняя ветвь шлейфа АПС (Кабинеты 106, 107, 108, 109)
  {
    id: 'cable-aps-branch-south',
    system: 'aps',
    color: '#dc2626',
    strokeDash: '5,3',
    label: 'Шлейф АПС №1 Отвод Юг',
    points: [
      { x: 360, y: 330 },
      { x: 360, y: 420 },
      { x: 300, y: 420 }, // Кабинет 106
      { x: 360, y: 420 },
      { x: 440, y: 420 }, // OpenSpace 1
      { x: 520, y: 420 }, // OpenSpace 2
      { x: 600, y: 420 },
      { x: 660, y: 420 }, // Архив
      { x: 720, y: 420 },
      { x: 780, y: 420 }, // Конференц-зал
      { x: 780, y: 330 },
    ],
  },
  // Линия оповещения СОУЭ (ЛС-1): ППКП -> ГР1 -> ГР3 -> ГР2 -> Табло ВЫХОД
  {
    id: 'cable-soue-main',
    system: 'soue',
    color: '#2563eb', // Синий пунктир
    strokeDash: '6,3',
    label: 'Линия СОУЭ (КПСнг(А)-FRLS 2х1.0)',
    points: [
      { x: 255, y: 325 }, // ППКП
      { x: 236, y: 330 }, // Табло ВЫХОД-1
      { x: 255, y: 312 },
      { x: 390, y: 312 }, // Громкоговоритель 1
      { x: 480, y: 312 },
      { x: 480, y: 352 }, // Громкоговоритель 3 (OpenSpace)
      { x: 600, y: 352 },
      { x: 600, y: 312 },
      { x: 690, y: 312 }, // Громкоговоритель 2
      { x: 844, y: 312 },
      { x: 844, y: 330 }, // Табло ВЫХОД-2
    ],
  },
];

export const FireSafetyLayout: React.FC<FireSafetyLayoutProps> = ({
  showRadiuses = true,
  showCables = true,
  showLabels = true,
  activeSystem = 'all',
  onDeviceSelect,
  selectedDeviceId,
}) => {
  const [hoveredDeviceId, setHoveredDeviceId] = useState<string | null>(null);

  // Фильтрация устройств по активной системе
  const filteredDevices = initialDevices.filter((dev) => {
    if (activeSystem === 'all') return true;
    if (activeSystem === 'aps') {
      return dev.type === 'smoke' || dev.type === 'heat' || dev.type === 'manual' || dev.type === 'panel';
    }
    if (activeSystem === 'soue') {
      return dev.type === 'sounder' || dev.type === 'exit_sign' || dev.type === 'panel';
    }
    return true;
  });

  // Фильтрация кабелей
  const filteredCables = cableRoutes.filter((cable) => {
    if (activeSystem === 'all') return true;
    return cable.system === activeSystem;
  });

  // Построение SVG path из ортогональных точек
  const buildSvgPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, idx) => {
      return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
    }, '');
  };

  return (
    <g className="fire-safety-cad-overlay" style={{ transition: 'opacity 0.2s ease' }}>
      {/* 
        ========================================================================
        СЛОЙ 1: ЗОНЫ ПОКРЫТИЯ (РАДИУСЫ ДЕЙСТВИЯ ДАТЧИКОВ)
        На самом заднем плане, полупрозрачные, без слепых зон!
        ========================================================================
      */}
      {showRadiuses && (
        <g className="sensor-coverage-radiuses pointer-events-none">
          {filteredDevices.map((device) => {
            if (!device.radius) return null;
            const isHeat = device.type === 'heat';
            const isHovered = hoveredDeviceId === device.id || selectedDeviceId === device.id;

            return (
              <g key={`radius-${device.id}`}>
                {/* Круг зоны действия извещателя */}
                <circle
                  cx={device.x}
                  cy={device.y}
                  r={device.radius}
                  fill={isHeat ? '#f97316' : '#3b82f6'}
                  fillOpacity={isHeat ? (isHovered ? 0.22 : 0.12) : (isHovered ? 0.16 : 0.07)}
                  stroke={isHeat ? '#ea580c' : '#2563eb'}
                  strokeWidth={isHovered ? 1.5 : 0.8}
                  strokeDasharray="4,3"
                  className="transition-all duration-300"
                />
                {/* Подпись радиуса по нормам СН РК */}
                <text
                  x={device.x}
                  y={device.y - device.radius + 10}
                  fontSize="5.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill={isHeat ? '#c2410c' : '#1d4ed8'}
                  textAnchor="middle"
                  opacity={0.8}
                >
                  {isHeat ? 'R=5.0м (В2)' : 'R=7.5м'}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* 
        ========================================================================
        СЛОЙ 2: ОРТОГОНАЛЬНЫЕ КАБЕЛЬНЫЕ ТРАССЫ (ШЛЕЙФЫ АПС И СОУЭ)
        ========================================================================
      */}
      {showCables && (
        <g className="cable-routes">
          {filteredCables.map((cable) => (
            <g key={cable.id}>
              {/* Фоновая линия для четкости */}
              <path
                d={buildSvgPath(cable.points)}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Основной шлейф */}
              <path
                d={buildSvgPath(cable.points)}
                fill="none"
                stroke={cable.color}
                strokeWidth="1.2"
                strokeDasharray={cable.strokeDash}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Узловые распаечные коробки (УК-2П) в точках ветвления */}
              {cable.points
                .filter((_, idx) => idx % 2 === 0 && idx > 0 && idx < cable.points.length - 1)
                .map((pt, idx) => (
                  <circle
                    key={`junction-${cable.id}-${idx}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="2"
                    fill={cable.color}
                    stroke="#FFFFFF"
                    strokeWidth="0.5"
                  />
                ))}
            </g>
          ))}
        </g>
      )}

      {/* 
        ========================================================================
        СЛОЙ 3: ПРИБОРЫ И ДАТЧИКИ (УГО ПО ГОСТ 28130-89)
        ========================================================================
      */}
      <g className="devices-layer">
        {filteredDevices.map((device) => {
          const isSelected = selectedDeviceId === device.id;
          const isHovered = hoveredDeviceId === device.id;

          return (
            <g
              key={`dev-${device.id}`}
              transform={`translate(${device.x}, ${device.y})`}
              className="cursor-pointer group"
              onMouseEnter={() => setHoveredDeviceId(device.id)}
              onMouseLeave={() => setHoveredDeviceId(null)}
              onClick={() => onDeviceSelect?.(device)}
            >
              {/* Индикатор фокуса/выбора прибора */}
              {(isSelected || isHovered) && (
                <circle
                  cx="0"
                  cy="0"
                  r="13"
                  fill="none"
                  stroke={device.type === 'sounder' ? '#2563eb' : '#dc2626'}
                  strokeWidth="1.2"
                  strokeDasharray="2,2"
                  className="animate-spin"
                  style={{ animationDuration: '8s' }}
                />
              )}

              {/* ---------------------------------------------------- */}
              {/* 1. ДЫМОВОЙ ИЗВЕЩАТЕЛЬ (ИП 212-141)                   */}
              {/* ---------------------------------------------------- */}
              {device.type === 'smoke' && (
                <g>
                  {/* Подложка */}
                  <circle cx="0" cy="0" r="6" fill="#FFFFFF" stroke="#dc2626" strokeWidth="1.5" />
                  {/* Перекрестие дымового датчика по ГОСТ */}
                  <line x1="-4" y1="0" x2="4" y2="0" stroke="#dc2626" strokeWidth="1" />
                  <line x1="0" y1="-4" x2="0" y2="4" stroke="#dc2626" strokeWidth="1" />
                  <circle cx="0" cy="0" r="1.5" fill="#dc2626" />
                </g>
              )}

              {/* ---------------------------------------------------- */}
              {/* 2. ТЕПЛОВОЙ ИЗВЕЩАТЕЛЬ (ИП 101-1А-А1 В СЕРВЕРНОЙ)     */}
              {/* ---------------------------------------------------- */}
              {device.type === 'heat' && (
                <g>
                  <rect x="-6" y="-6" width="12" height="12" fill="#FFFFFF" stroke="#ea580c" strokeWidth="1.5" rx="1" />
                  <line x1="-6" y1="-6" x2="6" y2="6" stroke="#ea580c" strokeWidth="0.9" />
                  <line x1="-6" y1="6" x2="6" y2="-6" stroke="#ea580c" strokeWidth="0.9" />
                  <circle cx="0" cy="0" r="2" fill="#ea580c" />
                </g>
              )}

              {/* ---------------------------------------------------- */}
              {/* 3. РУЧНОЙ ПОЖАРНЫЙ ИЗВЕЩАТЕЛЬ (ИПР 513)              */}
              {/* ---------------------------------------------------- */}
              {device.type === 'manual' && (
                <g>
                  <rect x="-5" y="-5" width="10" height="10" fill="#dc2626" stroke="#991b1b" strokeWidth="0.8" rx="1" />
                  <rect x="-2.5" y="-2.5" width="5" height="5" fill="#FFFFFF" />
                  <circle cx="0" cy="0" r="1.2" fill="#dc2626" />
                </g>
              )}

              {/* ---------------------------------------------------- */}
              {/* 4. ЗВУКОВОЙ / РЕЧЕВОЙ ОПОВЕЩАТЕЛЬ СОУЭ                */}
              {/* ---------------------------------------------------- */}
              {device.type === 'sounder' && (
                <g>
                  <circle cx="0" cy="0" r="6" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
                  {/* Иконка рупора/громкоговорителя */}
                  <polygon points="-2,-3 3,0 -2,3" fill="#FFFFFF" />
                  <path d="M 3 -2.5 A 3 3 0 0 1 3 2.5" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
                </g>
              )}

              {/* ---------------------------------------------------- */}
              {/* 5. СВЕТОВОЕ ТАБЛО "ВЫХОД"                            */}
              {/* ---------------------------------------------------- */}
              {device.type === 'exit_sign' && (
                <g>
                  <rect x="-10" y="-4.5" width="20" height="9" fill="#16a34a" stroke="#14532d" strokeWidth="0.8" rx="1" />
                  <text
                    x="0"
                    y="2"
                    fontSize="4"
                    fontWeight="bold"
                    fontFamily="monospace"
                    fill="#FFFFFF"
                    textAnchor="middle"
                  >
                    ВЫХОД
                  </text>
                </g>
              )}

              {/* ---------------------------------------------------- */}
              {/* 6. ПРИБОР ПРИЕМНО-КОНТРОЛЬНЫЙ (ППКП)                 */}
              {/* ---------------------------------------------------- */}
              {device.type === 'panel' && (
                <g>
                  <rect x="-8" y="-8" width="16" height="16" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" rx="2" />
                  <rect x="-5" y="-5" width="10" height="4" fill="#38bdf8" opacity="0.8" />
                  <circle cx="-3" cy="3" r="1" fill="#22c55e" />
                  <circle cx="0" cy="3" r="1" fill="#eab308" />
                  <circle cx="3" cy="3" r="1" fill="#ef4444" />
                </g>
              )}
            </g>
          );
        })}
      </g>

      {/* 
        ========================================================================
        СЛОЙ 4: МАРКИРОВКИ И ВЫНОСКИ ОБОРУДОВАНИЯ (САМЫЙ ВЕРХНИЙ СЛОЙ)
        Смещены вправо-вверх (dx=10, dy=-12), чтобы никогда не перекрывать иконку
        ========================================================================
      */}
      {showLabels && (
        <g className="device-labels-top-layer pointer-events-none">
          {filteredDevices.map((device) => {
            const badgeWidth = device.label.length * 4.6 + 6;
            return (
              <g
                key={`label-${device.id}`}
                transform={`translate(${device.x + 10}, ${device.y - 12})`}
              >
                {/* Полупрозрачная подложка выноски */}
                <rect
                  x="0"
                  y="0"
                  width={badgeWidth}
                  height="11"
                  fill="#FFFFFF"
                  fillOpacity="0.88"
                  stroke="#CBD5E1"
                  strokeWidth="0.5"
                  rx="3"
                  ry="3"
                />
                <text
                  x="3"
                  y="8"
                  fontSize="5.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill={
                    device.type === 'sounder'
                      ? '#1e40af'
                      : device.type === 'heat'
                      ? '#c2410c'
                      : device.type === 'exit_sign'
                      ? '#15803d'
                      : '#991b1b'
                  }
                >
                  {device.label}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};
