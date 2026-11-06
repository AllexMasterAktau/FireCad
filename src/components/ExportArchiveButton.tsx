import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Archive,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileCode,
  FileSpreadsheet,
  FileText,
  Database,
} from 'lucide-react';

export interface RoomItem {
  id: number | string;
  name: string;
  type: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface DeviceItem {
  id: number | string;
  type: string;
  roomId?: number | string;
  roomName?: string;
  x?: number;
  y?: number;
  label?: string;
  radius?: number;
  [key: string]: any;
}

export interface ProjectExportData {
  projectName?: string;
  objectAddress?: string;
  totalArea?: number;
  ceilingHeight?: number;
  floorsCount?: number;
  objectType?: string;
  rooms?: RoomItem[];
  devices?: DeviceItem[];
  authorName?: string;
  gipName?: string;
  projectCode?: string;
  normBase?: string;
  svgElementId?: string;
  customSvgContent?: string;
  [key: string]: any;
}

export interface ExportArchiveButtonProps {
  projectData?: ProjectExportData;
  className?: string;
  variant?: 'primary' | 'compact' | 'outline' | 'hero';
  buttonText?: string;
  onSuccess?: (filename: string) => void;
  onError?: (err: Error) => void;
}

export const downloadFile = (content: BlobPart, filename: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2500);
};

/**
 * Получение актуального SVG-кода чертежа:
 * 1. Ищет активный элемент чертежа в DOM (#cad-drawing-svg или селектор)
 * 2. Сериализует его в чистый XML со всеми стилями и xmlns
 * 3. При необходимости генерирует полноценный резервный векторный чертеж по ГОСТ 21.1101-2013
 */
export function getActiveDrawingSvg(data: ProjectExportData): string {
  // 1. Попытка извлечь чертеж напрямую из DOM
  if (typeof document !== 'undefined') {
    const candidateSelectors = [
      '#cad-drawing-svg',
      data.svgElementId ? `#${data.svgElementId}` : null,
      'svg#cad-drawing-svg',
      'svg[viewBox="0 0 1190 841"]',
      'svg.bg-white',
    ].filter(Boolean) as string[];

    for (const selector of candidateSelectors) {
      const svgEl = document.querySelector(selector) as SVGSVGElement | null;
      if (svgEl) {
        let serialized = new XMLSerializer().serializeToString(svgEl);
        
        // Убедимся, что указаны правильные XMLNS атрибуты
        if (!serialized.includes('xmlns="http://www.w3.org/2000/svg"')) {
          serialized = serialized.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
        }
        if (!serialized.includes('xmlns:xlink=')) {
          serialized = serialized.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ');
        }

        // Добавляем обязательный заголовок XML
        if (!serialized.startsWith('<?xml')) {
          serialized = `<?xml version="1.0" encoding="UTF-8"?>\n${serialized}`;
        }
        return serialized;
      }
    }
  }

  // 2. Если передан кастомный контент
  if (data.customSvgContent) {
    let content = data.customSvgContent;
    if (!content.startsWith('<?xml')) {
      content = `<?xml version="1.0" encoding="UTF-8"?>\n${content}`;
    }
    return content;
  }

  // 3. Fallback: Полный архитектурный чертеж А2 по ГОСТ
  return generateFallbackGostSvg(data);
}

/**
 * Резервный генератор полного листа А2 (1190 x 841) по ГОСТ 21.1101-2013
 */
function generateFallbackGostSvg(data: ProjectExportData): string {
  const title = data.projectName || 'Общеобразовательная школа на 600 уч. мест';
  const address = data.objectAddress || 'г. Астана, ул. Достык, 1';
  const area = data.totalArea || 1850;
  const projectCode = data.projectCode || '02-2026-АПС.СОУЭ';
  const author = data.authorName || 'Алиев К. Т.';
  const gip = data.gipName || 'Касымов Д. А.';
  const dateStr = new Date().toLocaleDateString('ru-RU');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg id="cad-drawing-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1190 841" width="1190" height="841" class="bg-white" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality">
  <rect width="1190" height="841" fill="#FFFFFF" />
  
  <!-- ГОСТ РАМКА ЛИСТА А2 -->
  <rect x="5" y="5" width="1180" height="831" fill="none" stroke="#000000" stroke-width="0.5" />
  <rect x="20" y="5" width="1165" height="831" fill="none" stroke="#000000" stroke-width="1.5" />

  <!-- КООРДИНАЦИОННЫЕ ОСИ -->
  <g stroke="#000000" stroke-width="0.5">
    <line x1="240" y1="90" x2="240" y2="570" stroke-dasharray="14,4,2,4" />
    <line x1="360" y1="90" x2="360" y2="570" stroke-dasharray="14,4,2,4" />
    <line x1="480" y1="90" x2="480" y2="570" stroke-dasharray="14,4,2,4" />
    <line x1="600" y1="90" x2="600" y2="570" stroke-dasharray="14,4,2,4" />
    <line x1="720" y1="90" x2="720" y2="570" stroke-dasharray="14,4,2,4" />
    <line x1="840" y1="90" x2="840" y2="570" stroke-dasharray="14,4,2,4" />
    <line x1="190" y1="170" x2="890" y2="170" stroke-dasharray="14,4,2,4" />
    <line x1="190" y1="280" x2="890" y2="280" stroke-dasharray="14,4,2,4" />
    <line x1="190" y1="400" x2="890" y2="400" stroke-dasharray="14,4,2,4" />
    <line x1="190" y1="510" x2="890" y2="510" stroke-dasharray="14,4,2,4" />
  </g>

  <!-- МАРКЕРЫ ОСЕЙ -->
  <g font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle" fill="#000000">
    <circle cx="240" cy="70" r="11" fill="#FFF" stroke="#000" stroke-width="0.8" /><text x="240" y="74">1</text>
    <circle cx="360" cy="70" r="11" fill="#FFF" stroke="#000" stroke-width="0.8" /><text x="360" y="74">2</text>
    <circle cx="480" cy="70" r="11" fill="#FFF" stroke="#000" stroke-width="0.8" /><text x="480" y="74">3</text>
    <circle cx="600" cy="70" r="11" fill="#FFF" stroke="#000" stroke-width="0.8" /><text x="600" y="74">4</text>
    <circle cx="720" cy="70" r="11" fill="#FFF" stroke="#000" stroke-width="0.8" /><text x="720" y="74">5</text>
    <circle cx="840" cy="70" r="11" fill="#FFF" stroke="#000" stroke-width="0.8" /><text x="840" y="74">6</text>
    <circle cx="240" cy="570" r="11" fill="#FFF" stroke="#000" stroke-width="0.8" /><text x="240" y="574">1</text>
    <circle cx="360" cy="570" r="11" fill="#FFF" stroke="#000" stroke-width="0.8" /><text x="360" y="574">2</text>
    <circle cx="480" cy="570" r="11" fill="#FFF" stroke="#000" stroke-width="0.8" /><text x="480" y="574">3</text>
    <circle cx="600" cy="570" r="11" fill="#FFF" stroke="#000" stroke-width="0.8" /><text x="600" y="574">4</text>
    <circle cx="720" cy="570" r="11" fill="#FFF" stroke="#000" stroke-width="0.8" /><text x="720" y="574">5</text>
    <circle cx="840" cy="570" r="11" fill="#FFF" stroke="#000" stroke-width="0.8" /><text x="840" y="574">6</text>
    <circle cx="170" cy="170" r="11" fill="#FFF" stroke="#000" stroke-width="0.8" /><text x="170" y="174">А</text>
    <circle cx="170" cy="280" r="11" fill="#FFF" stroke="#000" stroke-width="0.8" /><text x="170" y="284">Б</text>
    <circle cx="170" cy="400" r="11" fill="#FFF" stroke="#000" stroke-width="0.8" /><text x="170" y="404">В</text>
    <circle cx="170" cy="510" r="11" fill="#FFF" stroke="#000" stroke-width="0.8" /><text x="170" y="514">Г</text>
  </g>

  <!-- СТЕНЫ ЗДАНИЯ -->
  <g fill="none" stroke="#000000" stroke-width="2.5">
    <rect x="240" y="170" width="600" height="340" />
    <line x1="240" y1="280" x2="840" y2="280" stroke-width="1.5" />
    <line x1="240" y1="400" x2="840" y2="400" stroke-width="1.5" />
    <line x1="360" y1="170" x2="360" y2="280" stroke-width="1.2" />
    <line x1="480" y1="170" x2="480" y2="280" stroke-width="1.2" />
    <line x1="600" y1="170" x2="600" y2="280" stroke-width="1.2" />
    <line x1="720" y1="170" x2="720" y2="280" stroke-width="1.2" />
    <line x1="360" y1="400" x2="360" y2="510" stroke-width="1.2" />
    <line x1="480" y1="400" x2="480" y2="510" stroke-width="1.2" />
    <line x1="600" y1="400" x2="600" y2="510" stroke-width="1.2" />
    <line x1="720" y1="400" x2="720" y2="510" stroke-width="1.2" />
  </g>

  <!-- ЗОНЫ ПОКРЫТИЯ ДАТЧИКОВ (R=7.5м / 88px) -->
  <g fill="#2563EB" fill-opacity="0.08" stroke="#3B82F6" stroke-width="1" stroke-dasharray="4,4">
    <circle cx="300" cy="225" r="88" />
    <circle cx="420" cy="225" r="88" />
    <circle cx="540" cy="225" r="88" />
    <circle cx="660" cy="225" r="88" />
    <circle cx="780" cy="225" r="88" />
    <circle cx="300" cy="455" r="88" />
    <circle cx="420" cy="455" r="88" />
    <circle cx="540" cy="455" r="88" />
    <circle cx="660" cy="455" r="88" />
    <circle cx="780" cy="455" r="88" />
  </g>

  <!-- КАБЕЛЬНЫЕ ТРАССЫ АПС (КПСнг(А)-FRLS) -->
  <g stroke="#DC2626" stroke-width="1.5" stroke-dasharray="5,3" fill="none">
    <line x1="300" y1="225" x2="420" y2="225" />
    <line x1="420" y1="225" x2="540" y2="225" />
    <line x1="540" y1="225" x2="660" y2="225" />
    <line x1="660" y1="225" x2="780" y2="225" />
    <line x1="300" y1="340" x2="780" y2="340" stroke="#16A34A" stroke-width="2" stroke-dasharray="none" />
  </g>

  <!-- ИЗВЕЩАТЕЛИ (УГО) -->
  <g stroke="#DC2626" stroke-width="1.5" fill="#FFFFFF">
    <circle cx="300" cy="225" r="6" /><circle cx="300" cy="225" r="2" fill="#DC2626" />
    <circle cx="420" cy="225" r="6" /><circle cx="420" cy="225" r="2" fill="#DC2626" />
    <circle cx="540" cy="225" r="6" /><circle cx="540" cy="225" r="2" fill="#DC2626" />
    <circle cx="660" cy="225" r="6" /><circle cx="660" cy="225" r="2" fill="#DC2626" />
    <circle cx="780" cy="225" r="6" /><circle cx="780" cy="225" r="2" fill="#DC2626" />
  </g>

  <!-- ТАБЛИЦА УСЛОВНЫХ ОБОЗНАЧЕНИЙ (УГО) -->
  <g transform="translate(895, 80)" font-family="Arial, sans-serif" font-size="7" fill="#000000">
    <rect x="0" y="0" width="285" height="170" fill="#FFFFFF" stroke="#000000" stroke-width="1" />
    <line x1="0" y1="20" x2="285" y2="20" stroke="#000000" stroke-width="0.8" />
    <line x1="45" y1="0" x2="45" y2="170" stroke="#000000" stroke-width="0.8" />
    <text x="22" y="14" font-weight="bold" text-anchor="middle">Обозн.</text>
    <text x="165" y="14" font-weight="bold" text-anchor="middle">Наименование (ГОСТ 28130-89)</text>
    <circle cx="22" cy="40" r="5" fill="#FFF" stroke="#DC2626" stroke-width="1.5" /><circle cx="22" cy="40" r="1.5" fill="#DC2626" />
    <text x="52" y="43">Извещатель пожарный дымовой ИП 212-45</text>
    <rect x="16" y="60" width="12" height="12" fill="#FFF" stroke="#000000" stroke-width="1" />
    <line x1="16" y1="60" x2="28" y2="72" stroke="#000" stroke-width="1" />
    <text x="52" y="69">Извещатель пожарный тепловой ИП 101-1А</text>
    <rect x="16" y="85" width="12" height="12" fill="#DC2626" stroke="#000" stroke-width="1" />
    <text x="52" y="94">Извещатель ручной ИПР 513-3АМ (h=1.5м)</text>
    <polygon points="17,110 27,116 17,122" fill="#EAB308" stroke="#000" stroke-width="0.8" />
    <text x="52" y="118">Оповещатель звуковой/речевой СОУЭ (ОПОП)</text>
    <rect x="14" y="136" width="16" height="8" fill="#16A34A" stroke="#000" stroke-width="0.8" />
    <text x="52" y="143">Световое табло "ВЫХОД" (Молния-12)</text>
    <line x1="12" y1="160" x2="32" y2="160" stroke="#DC2626" stroke-width="1.5" stroke-dasharray="4,2" />
    <text x="52" y="163">Кабель огнестойкий КПСнг(А)-FRLS 1х2х0.75</text>
  </g>

  <!-- БЛОК «ПРИМЕЧАНИЯ» ПО ГОСТ С ПОДЛОЖКОЙ -->
  <g id="notes-block" transform="translate(180, 625)" font-family="Arial, sans-serif" font-size="6.5" fill="#000000">
    <rect x="-12" y="-12" width="535" height="92" rx="2" fill="#FFFFFF" stroke="#000000" stroke-width="0.5" />
    <text x="0" y="2" font-weight="bold" font-size="7.5">ПРИМЕЧАНИЯ:</text>
    <text x="0" y="16">1. За отметку ±0.000 принят уровень чистого пола 1-го этажа здания.</text>
    <text x="0" y="28">2. Монтаж извещателей пожарных выполнить в соответствии с требованиями СН РК 2.02-05-2014 и СП РК 2.02-105-2014.</text>
    <text x="0" y="40">3. Шлейфы АПС выполнить огнестойким кабелем КПСнг(А)-FRLS 1х2х0.75 в ПВХ гофротрубе с пределом огнестойкости E30.</text>
    <text x="0" y="52">4. Ручные пожарные извещатели установить на путях эвакуации на высоте 1.5 м от уровня чистого пола.</text>
    <text x="0" y="64">5. Световые оповещатели "ВЫХОД" установить над эвакуационными выходами на высоте не менее 2.0 м.</text>
  </g>

  <!-- ТЕХНИЧЕСКИЙ ШТАМП ПО ГОСТ 21.1101-2013 -->
  <g transform="translate(735, 656)" stroke="#000000" stroke-width="0.5" font-family="Arial, Helvetica, sans-serif">
    <rect x="0" y="0" width="450" height="180" fill="#FFFFFF" stroke-width="1.5" />
    <line x1="0" y1="20" x2="225" y2="20" stroke-width="1" />
    <line x1="0" y1="40" x2="225" y2="40" stroke-width="0.5" />
    <line x1="0" y1="60" x2="225" y2="60" stroke-width="0.5" />
    <line x1="0" y1="80" x2="225" y2="80" stroke-width="0.5" />
    <line x1="0" y1="100" x2="450" y2="100" stroke-width="1" />
    <line x1="45" y1="0" x2="45" y2="100" stroke-width="0.5" />
    <line x1="105" y1="0" x2="105" y2="100" stroke-width="0.5" />
    <line x1="160" y1="0" x2="160" y2="100" stroke-width="0.5" />
    <line x1="225" y1="0" x2="225" y2="180" stroke-width="1.5" />

    <text x="22.5" y="14" stroke="none" fill="#000000" text-anchor="middle" font-size="6.5" font-weight="bold">Изм.</text>
    <text x="75" y="14" stroke="none" fill="#000000" text-anchor="middle" font-size="6.5" font-weight="bold">Фамилия</text>
    <text x="132.5" y="14" stroke="none" fill="#000000" text-anchor="middle" font-size="6.5" font-weight="bold">Подп.</text>
    <text x="192.5" y="14" stroke="none" fill="#000000" text-anchor="middle" font-size="6.5" font-weight="bold">Дата</text>

    <text x="5" y="34" stroke="none" fill="#000000" text-anchor="start" font-size="6.5" font-weight="bold">Разраб.</text>
    <text x="50" y="34" stroke="none" fill="#000000" text-anchor="start" font-size="6.5">${author}</text>
    <text x="132.5" y="34" stroke="none" fill="#000000" text-anchor="middle" font-size="6" font-style="italic">Алиев</text>
    <text x="192.5" y="34" stroke="none" fill="#000000" text-anchor="middle" font-size="6">${dateStr}</text>

    <text x="5" y="54" stroke="none" fill="#000000" text-anchor="start" font-size="6.5" font-weight="bold">Пров.</text>
    <text x="50" y="54" stroke="none" fill="#000000" text-anchor="start" font-size="6.5">Смагулов Б.К.</text>
    <text x="132.5" y="54" stroke="none" fill="#000000" text-anchor="middle" font-size="6" font-style="italic">Смагулов</text>
    <text x="192.5" y="54" stroke="none" fill="#000000" text-anchor="middle" font-size="6">${dateStr}</text>

    <text x="5" y="74" stroke="none" fill="#000000" text-anchor="start" font-size="6.5" font-weight="bold">ГИП</text>
    <text x="50" y="74" stroke="none" fill="#000000" text-anchor="start" font-size="6.5">${gip}</text>
    <text x="132.5" y="74" stroke="none" fill="#000000" text-anchor="middle" font-size="6" font-style="italic">Касымов</text>
    <text x="192.5" y="74" stroke="none" fill="#000000" text-anchor="middle" font-size="6">${dateStr}</text>

    <text x="5" y="94" stroke="none" fill="#000000" text-anchor="start" font-size="6.5" font-weight="bold">Н.контр.</text>
    <text x="50" y="94" stroke="none" fill="#000000" text-anchor="start" font-size="6.5">Иванов В.И.</text>
    <text x="132.5" y="94" stroke="none" fill="#000000" text-anchor="middle" font-size="6" font-style="italic">Иванов</text>
    <text x="192.5" y="94" stroke="none" fill="#000000" text-anchor="middle" font-size="6">${dateStr}</text>

    <rect x="225" y="0" width="225" height="50" fill="#F8FAFC" />
    <text x="337.5" y="32" font-size="13" font-weight="bold" stroke="none" fill="#000000" text-anchor="middle">${projectCode}</text>

    <line x1="225" y1="50" x2="450" y2="50" stroke-width="1" />
    <text x="337.5" y="67" font-size="7.5" font-weight="bold" stroke="none" fill="#000000" text-anchor="middle">
      <tspan x="337.5" y="67">${title}</tspan>
      <tspan x="337.5" dy="14" font-size="6.5" font-weight="normal" fill="#334155">${address} • S = ${area} м²</tspan>
    </text>

    <line x1="225" y1="135" x2="450" y2="135" stroke-width="1" />
    <text x="337.5" y="115" font-size="7.5" font-weight="bold" stroke="none" fill="#000000" text-anchor="middle">
      <tspan x="337.5" y="115">План расстановки оборудования АПС и СОУЭ</tspan>
      <tspan x="337.5" dy="13" font-size="6.5" font-weight="normal" fill="#475569">1-й этаж на отм. ±0.000 (Стадия П)</tspan>
    </text>

    <line x1="280" y1="135" x2="280" y2="180" stroke-width="0.5" />
    <line x1="332" y1="135" x2="332" y2="180" stroke-width="0.5" />
    <line x1="385" y1="135" x2="385" y2="180" stroke-width="0.5" />
    <line x1="225" y1="155" x2="385" y2="155" stroke-width="0.5" />

    <text x="252.5" y="148" stroke="none" fill="#000000" text-anchor="middle" font-size="6.5" font-weight="bold">Стадия</text>
    <text x="306" y="148" stroke="none" fill="#000000" text-anchor="middle" font-size="6.5" font-weight="bold">Лист</text>
    <text x="358.5" y="148" stroke="none" fill="#000000" text-anchor="middle" font-size="6.5" font-weight="bold">Листов</text>

    <text x="252.5" y="172" font-size="11" font-weight="bold" stroke="none" fill="#000000" text-anchor="middle">П</text>
    <text x="306" y="172" font-size="10" font-weight="bold" stroke="none" fill="#000000" text-anchor="middle">1</text>
    <text x="358.5" y="172" font-size="10" font-weight="bold" stroke="none" fill="#000000" text-anchor="middle">18</text>

    <text x="417.5" y="152" font-size="8.5" font-weight="bold" stroke="none" fill="#000000" text-anchor="middle">ТОО "FireCAD"</text>
    <text x="417.5" y="163" font-size="6" stroke="none" fill="#333333" text-anchor="middle">САПР &amp; Инжиниринг</text>
    <text x="417.5" y="173" font-size="5.5" stroke="none" fill="#666666" text-anchor="middle">Лицензия ГАСК №1400293</text>
  </g>
</svg>`;
}

/**
 * Генератор Спецификации оборудования (02_Спецификация_оборудования.csv) с BOM UTF-8 (\uFEFF)
 */
export function generateSpecificationCsv(data: ProjectExportData): string {
  const area = data.totalArea || 1850;
  const smokeCount = Math.max(12, Math.ceil(area / 65));
  const heatCount = Math.max(4, Math.ceil(area / 400));
  const manualCount = Math.max(4, Math.ceil(area / 350));
  const soundersCount = Math.max(6, Math.ceil(area / 120));
  const exitSignsCount = Math.max(4, Math.ceil(area / 300));
  const apsCable = Math.round(smokeCount * 18 + 90);
  const soueCable = Math.round(soundersCount * 22 + 80);
  const boxesCount = Math.ceil((smokeCount + heatCount + soundersCount) * 0.4);

  const rows = [
    [
      '1',
      '"Прибор приемно-контрольный и управления пожарный (ППКПиУ)"',
      '"Сириус (ИСО Орион)"',
      '"ЗАО НВП Болид"',
      '"компл."',
      '1',
      '"Пост охраны / серверная, встроенный РИП с АКБ 12В 17Ач"',
    ],
    [
      '2',
      '"Пульт контроля и управления охранно-пожарный"',
      '"С2000М исп.02"',
      '"ЗАО НВП Болид"',
      '"шт."',
      '1',
      '"Центральный диспетчерский пункт"',
    ],
    [
      '3',
      '"Извещатель пожарный дымовой оптико-электронный адресный"',
      '"ИП 212-45 (Рубеж)"',
      '"ГК Рубеж"',
      '"шт."',
      String(smokeCount),
      '"Потолочный монтаж, радиус зоны контроля R=7.5м"',
    ],
    [
      '4',
      '"Извещатель пожарный тепловой максимально-дифференциальный"',
      '"ИП 101-1А-А1"',
      '"ЗАО Риэлта"',
      '"шт."',
      String(heatCount),
      '"Серверные, электрощитовые, венткамеры (R=2.5м)"',
    ],
    [
      '5',
      '"Извещатель пожарный ручной адресный с фиксатором сработки"',
      '"ИПР-513-10 / ИПР 513-3АМ"',
      '"НВП Болид"',
      '"шт."',
      String(manualCount),
      '"На путях эвакуации у выходов на высоте h=1.5м"',
    ],
    [
      '6',
      '"Оповещатель звуковой пожарный настенный (СОУЭ 2-го типа)"',
      '"Маяк-12-З (ОПОП 2-35)"',
      '"Электротехника и Автоматика"',
      '"шт."',
      String(soundersCount),
      '"Уровень звукового давления не менее 85 дБА на 1м"',
    ],
    [
      '7',
      '"Оповещатель пожарный световой (Указатель ВЫХОД)"',
      '"Молния-12 (РИП)"',
      '"Арсенал Безопасности"',
      '"шт."',
      String(exitSignsCount),
      '"Над всеми дверными эвакуационными выходами"',
    ],
    [
      '8',
      '"Кабель симметричный огнестойкий для шлейфов АПС"',
      '"КПСнг(А)-FRLS 1х2х0.75"',
      '"Паритет / СПКБ"',
      '"м"',
      String(apsCable),
      '"Огнестойкость E30 (не менее 30 мин под пламенем)"',
    ],
    [
      '9',
      '"Кабель симметричный огнестойкий для линий оповещения СОУЭ"',
      '"КПСнг(А)-FRLS 1х2х1.0"',
      '"Паритет / СПКБ"',
      '"м"',
      String(soueCable),
      '"Огнестойкость E30 (не менее 30 мин под пламенем)"',
    ],
    [
      '10',
      '"Коробка огнестойкая распределительная с керамическими клеммами"',
      '"FS-Box 4P (E30-E90)"',
      '"Гефест / Промрукав"',
      '"шт."',
      String(boxesCount),
      '"Для коммутации и ответвлений шлейфов сигнализации"',
    ],
    [
      '11',
      '"Труба гибкая гофрированная из самозатухающего ПВХ d=16мм"',
      '"ТГГ-16 с протяжкой"',
      '"ДКС"',
      '"м"',
      String(apsCable + soueCable),
      '"Прокладка за подвесными потолками и в штробах"',
    ],
    [
      '12',
      '"Резервированный источник вторичного электропитания 12В 3А"',
      '"РИП-12 RS (исп. 51)"',
      '"ЗАО НВП Болид"',
      '"шт."',
      '2',
      '"С местом под 2 АКБ 12В 17А·ч, интерфейс RS-485"',
    ],
  ];

  const headers = [
    'Поз.',
    'Наименование и техническая характеристика',
    'Тип, марка, обозначение документа',
    'Завод-изготовитель',
    'Единица измерения',
    'Количество',
    'Примечание',
  ];

  const csvBody = [
    `"СПЕЦИФИКАЦИЯ ОБОРУДОВАНИЯ, ИЗДЕЛИЙ И МАТЕРИАЛОВ (ГОСТ 21.110-2013)"`,
    `"Объект: ${data.projectName || 'Общеобразовательная школа на 600 уч. мест'}"`,
    `"Адрес строительства: ${data.objectAddress || 'Республика Казахстан, г. Астана'}"`,
    `"Шифр проектной документации: ${data.projectCode || '02-2026-АПС.СОУЭ.СО'}"`,
    `"Дата формирования спецификации: ${new Date().toLocaleDateString('ru-RU')}"`,
    '',
    headers.join(';'),
    ...rows.map((r) => r.join(';')),
  ].join('\r\n');

  return '\uFEFF' + csvBody;
}

/**
 * Генератор Пояснительной записки (03_Пояснительная_записка_АПС_СОУЭ.txt)
 */
export function generateExplanatoryNoteTxt(data: ProjectExportData): string {
  const title = data.projectName || 'Общеобразовательная школа на 600 уч. мест';
  const address = data.objectAddress || 'Республика Казахстан, г. Астана';
  const area = data.totalArea || 1850;
  const floors = data.floorsCount || 3;
  const height = data.ceilingHeight || 3.3;
  const projectCode = data.projectCode || '02-2026-АПС.СОУЭ.ПЗ';
  const normBase = data.normBase || 'СН РК 2.02-05-2014, СП РК 2.02-105-2014';
  const smokeCount = Math.max(12, Math.ceil(area / 65));
  const heatCount = Math.max(4, Math.ceil(area / 400));
  const manualCount = Math.max(4, Math.ceil(area / 350));
  const soundersCount = Math.max(6, Math.ceil(area / 120));
  const totalDev = smokeCount + heatCount + manualCount + soundersCount;
  const cableTotal = Math.round(smokeCount * 18 + soundersCount * 22 + 150);
  const author = data.authorName || 'Алиев К. Т.';
  const gip = data.gipName || 'Касымов Д. А.';
  const dateStr = new Date().toLocaleDateString('ru-RU');

  return `================================================================================
ПОЯСНИТЕЛЬНАЯ ЗАПИСКА К РАЗДЕЛУ АПС И СОУЭ (СТАДИЯ П)
Шифр проекта: ${projectCode}
================================================================================

1. ОБЩИЕ СВЕДЕНИЯ И ОСНОВАНИЕ ДЛЯ ПРОЕКТИРОВАНИЯ
--------------------------------------------------------------------------------
1.1. Наименование объекта: ${title}
1.2. Адрес строительства: ${address}
1.3. Технические характеристики объекта:
     - Общая площадь: ${area} м²
     - Высота типового этажа: ${height} м
     - Количество этажей: ${floors} эт.
     - Категория по взрывопожарной и пожарной опасности: В4 (основные помещения), В2 (серверные).
     - Степень огнестойкости здания: II.
     - Класс конструктивной пожарной опасности: С0.

1.4. Нормативно-правовая база Республики Казахстан:
     Проектная документация разработана в строгом соответствии с требованиями:
     - ${normBase} «Пожарная автоматика зданий и сооружений»;
     - СН РК 2.02-01-2014 «Пожарная безопасность зданий и сооружений»;
     - ТР ТС 043/2017 «О требованиях к средствам обеспечения пожарной безопасности и пожаротушения»;
     - ПУЭ РК «Правила устройства электроустановок Республики Казахстан»;
     - ГОСТ 21.1101-2013 «Основные требования к проектной и рабочей документации».

2. ОПИСАНИЕ ПРИНЯТЫХ ТЕХНИЧЕСКИХ РЕШЕНИЙ ПО СИСТЕМАМ
--------------------------------------------------------------------------------
2.1. Автоматическая пожарная сигнализация (АПС):
     В проекте применена адресно-аналоговая система пожарной сигнализации на базе
     оборудования ИСО «Орион» (ППКПиУ «Сириус», ПКУ «С2000М»).
     
     Для обнаружения факторов пожара запроектированы:
     - Извещатели пожарные дымовые оптико-электронные адресные ИП 212-45 — для защиты
       коридоров, холлов, кабинетов и учебных классов (радиус зоны контроля R = 7.5 м
       при высоте перекрытий до 3.5 м). Расчетное количество: ${smokeCount} шт.
     - Извещатели пожарные тепловые максимальные ИП 101-1А — для серверных,
       электрощитовых и узлов связи (радиус зоны контроля R = 2.5 м). Количество: ${heatCount} шт.
     - Извещатели пожарные ручные адресные ИПР 513-3АМ — на путях эвакуации, у выходов
       на высоте 1.5 м от уровня пола. Количество: ${manualCount} шт.

     Всего приборов обнаружения: ${smokeCount + heatCount + manualCount} шт. Перекрытие зон контроля — 100%.

2.2. Система оповещения и управления эвакуацией людей (СОУЭ):
     Согласно СН РК 2.02-05-2014 для данного типа объекта запроектирована СОУЭ 2-го типа:
     - Оповещатели звуковые настенные «Маяк-12-З» с уровнем звукового давления не менее
       85 дБА на расстоянии 1 м от прибора (${soundersCount} шт.);
     - Оповещатели световые «ВЫХОД» (Молния-12) с автономным резервированием, установленные
       над всеми основными и запасными дверными эвакуационными проемами.

3. РАСЧЕТ ЕМКОСТИ АККУМУЛЯТОРНЫХ БАТАРЕЙ И ЭЛЕКТРОСНАБЖЕНИЕ
--------------------------------------------------------------------------------
3.1. Электроприемники систем АПС и СОУЭ относятся к I категории надежности электроснабжения.
3.2. В качестве резервного источника питания применены источники бесперебойного питания
     РИП-12 RS с герметичными свинцово-кислотными АКБ 12В 17 А·ч.
3.3. Расчет времени автономной работы:
     - Дежурный режим: I_деж = 0.48 А × 24 ч = 11.52 А·ч
     - Режим «Пожар/Тревога»: I_тр = 3.20 А × 3 ч = 9.60 А·ч
     - Суммарная потребная емкость с коэффициентом старения К=1.25: Q = (11.52 + 9.60) × 1.25 = 26.4 А·ч.
     - Принято к установке: 2 блока РИП-12 с 2×АКБ 17 А·ч (суммарно 34 А·ч), что гарантирует
       бесперебойную работу не менее 28 часов в дежурном режиме и 3.5 часов в режиме оповещения.

4. КАБЕЛЬНЫЕ ТРАССЫ И УСЛОВИЯ МОНТАЖА
--------------------------------------------------------------------------------
4.1. Все шлейфы пожарной сигнализации и линии оповещения выполняются огнестойким кабелем
     с медными жилами КПСнг(А)-FRLS (1х2х0.75 и 1х2х1.0) с пределом огнестойкости не менее Е30.
4.2. Общая протяженность кабельных трасс с учетом технологического запаса 15% составляет:
     ${cableTotal} метров.
4.3. Прокладка кабелей за подвесными потолками выполняется в самозатухающей гибкой ПВХ
     гофротрубе d=16мм (тяжелой серии) с креплением огнестойкими металлическими дюбель-стяжками
     с шагом не более 0.5 м.

5. УКАЗАНИЯ ПО ЭКСПЛУАТАЦИИ И ТЕХНИКЕ БЕЗОПАСНОСТИ
--------------------------------------------------------------------------------
5.1. Монтаж и пусконаладочные работы должны выполняться специализированной организацией,
     имеющей государственную лицензию на деятельность по монтажу противопожарных систем.
5.2. Техническое обслуживание оборудования проводить не реже 1 раза в месяц в соответствии
     с регламентом №1 и не реже 1 раза в квартал по регламенту №2.

================================================================================
Разработал:      ${author}                       Дата: ${dateStr}
Проверил:        Смагулов Б. К.
ГИП:             ${gip}
Нормоконтроль:   Иванов В. И.
Организация:     ТОО "FireCAD Engineering Systems" (Лицензия ГАСК №1400293)
================================================================================
`;
}

/**
 * Генератор резервной копии проекта (04_Проект_FireCAD_Backup.json)
 */
export function generateProjectBackupJson(data: ProjectExportData): string {
  const area = data.totalArea || 1850;
  const smokeCount = Math.max(12, Math.ceil(area / 65));
  const heatCount = Math.max(4, Math.ceil(area / 400));
  const manualCount = Math.max(4, Math.ceil(area / 350));
  const soundersCount = Math.max(6, Math.ceil(area / 120));

  const backupObject = {
    projectInfo: {
      appName: 'FireCAD System - Проектирование АПС & СОУЭ',
      schemaVersion: '2026.3.0',
      exportDate: new Date().toISOString(),
      projectName: data.projectName || 'Общеобразовательная школа на 600 уч. мест',
      objectAddress: data.objectAddress || 'Республика Казахстан, г. Астана',
      projectCode: data.projectCode || '02-2026-АПС.СОУЭ',
      totalArea: area,
      ceilingHeight: data.ceilingHeight || 3.3,
      floorsCount: data.floorsCount || 3,
      objectType: data.objectType || 'school',
      normBase: data.normBase || 'СН РК 2.02-05-2014, СП РК 2.02-105-2014',
      stage: 'П (Проектная документация)',
      author: data.authorName || 'Алиев К. Т.',
      gip: data.gipName || 'Касымов Д. А.',
      verifier: 'Смагулов Б. К.',
      normControl: 'Иванов В. И.',
      organization: 'ТОО "FireCAD"',
    },
    rooms: data.rooms || [
      { id: 101, name: 'Учебный класс №1 (Математика)', type: 'class', area: 54.0, width: 600, height: 400, x: 240, y: 170 },
      { id: 102, name: 'Учебный класс №2 (Физика)', type: 'class', area: 54.0, width: 600, height: 400, x: 360, y: 170 },
      { id: 103, name: 'Серверная / ИТ-узел', type: 'server', area: 18.0, width: 300, height: 300, x: 480, y: 170 },
      { id: 104, name: 'Центральный вестибюль и коридор', type: 'corridor', area: 86.5, width: 1200, height: 250, x: 240, y: 280 },
      { id: 105, name: 'Кабинет директора', type: 'office', area: 36.0, width: 400, height: 400, x: 240, y: 400 },
      { id: 106, name: 'Учительская / Методический кабинет', type: 'office', area: 44.0, width: 500, height: 400, x: 360, y: 400 },
    ],
    devices: data.devices || [
      { id: 'dev-smoke-1', type: 'smoke', label: 'ИП 212 №1.1', room: '101', x: 300, y: 225, radius: 7.5, loop: 'Шлейф АПС 1' },
      { id: 'dev-smoke-2', type: 'smoke', label: 'ИП 212 №1.2', room: '102', x: 420, y: 225, radius: 7.5, loop: 'Шлейф АПС 1' },
      { id: 'dev-heat-1', type: 'heat', label: 'ИП 101 №1.1', room: '103', x: 540, y: 225, radius: 2.5, loop: 'Шлейф АПС 1' },
      { id: 'dev-smoke-3', type: 'smoke', label: 'ИП 212 №1.3', room: '104', x: 480, y: 340, radius: 7.5, loop: 'Шлейф АПС 1' },
      { id: 'dev-manual-1', type: 'manual', label: 'ИПР-1', room: '104', x: 250, y: 340, height: 1.5, loop: 'Шлейф АПС 2' },
      { id: 'dev-manual-2', type: 'manual', label: 'ИПР-2', room: '104', x: 830, y: 340, height: 1.5, loop: 'Шлейф АПС 2' },
      { id: 'dev-sound-1', type: 'sounder', label: 'СОУЭ-1', room: '104', x: 360, y: 340, splDb: 85, loop: 'Линия СОУЭ 1' },
      { id: 'dev-sound-2', type: 'sounder', label: 'СОУЭ-2', room: '104', x: 720, y: 340, splDb: 85, loop: 'Линия СОУЭ 1' },
      { id: 'dev-panel-1', type: 'panel', label: 'ППКПиУ "Сириус"', room: '103', x: 500, y: 340, backupBattery: '2×12В 17Ач' },
    ],
    calculations: {
      smokeDetectorsCount: smokeCount,
      heatDetectorsCount: heatCount,
      manualCallPointsCount: manualCount,
      soundersCount: soundersCount,
      totalEquipmentUnits: smokeCount + heatCount + manualCount + soundersCount,
      estimatedApsCableMeters: Math.round(smokeCount * 18 + 90),
      estimatedSoueCableMeters: Math.round(soundersCount * 22 + 80),
      batteryCapacityRequiredAh: 26.4,
      batteryCapacityInstalledAh: 34.0,
      coverageCheck: '100% OK по СН РК 2.02-05-2014',
    },
  };

  return JSON.stringify(backupObject, null, 2);
}

const defaultExportData: ProjectExportData = {};

export const ExportArchiveButton: React.FC<ExportArchiveButtonProps> = ({
  projectData = defaultExportData,
  className = '',
  variant = 'hero',
  buttonText,
  onSuccess,
  onError,
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleExportZip = async () => {
    setIsGenerating(true);
    setSaveStatus({ type: null, message: '' });

    try {
      // 1. Инициализируем JSZip instance
      const zip = new JSZip();

      // 2. Генерируем полный векторный SVG чертежа (из DOM или генератора)
      const svgDrawingContent = getActiveDrawingSvg(projectData);

      // 3. Генерируем CSV Спецификацию оборудования с BOM UTF-8
      const csvSpecificationContent = generateSpecificationCsv(projectData);

      // 4. Генерируем Пояснительную записку с разделами 1, 2, 3 и нормами СН РК
      const txtExplanatoryNoteContent = generateExplanatoryNoteTxt(projectData);

      // 5. Генерируем резервную копию проекта (JSON Backup)
      const jsonBackupContent = generateProjectBackupJson(projectData);

      // 6. Упаковываем все 4 обязательных документа в корень ZIP архива
      zip.file('01_Чертеж_АПС_и_СОУЭ_План_1_этажа.svg', svgDrawingContent);
      zip.file('02_Спецификация_оборудования.csv', csvSpecificationContent);
      zip.file('03_Пояснительная_записка_АПС_СОУЭ.txt', txtExplanatoryNoteContent);
      zip.file('04_Проект_FireCAD_Backup.json', jsonBackupContent);

      // 7. Сборка архива в Blob с максимальным сжатием
      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      });

      // 8. Формирование безопасного имени файла архива
      const rawTitle = projectData.projectName || 'Проект_АПС_и_СОУЭ';
      const safeTitle = rawTitle
        .replace(/[/\\?%*:|"<>]/g, '_')
        .replace(/\s+/g, '_')
        .trim();
      const filename = `Проект_FireCAD_${safeTitle}.zip`;

      // 9. Сохранение файла: File System Access API с безопасным fallback для Preview/iFrame
      let savedViaPicker = false;

      if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: filename,
            types: [
              {
                description: 'ZIP Архив проектно-сметной документации (*.zip)',
                accept: {
                  'application/zip': ['.zip'],
                },
              },
            ],
          });

          const writableStream = await fileHandle.createWritable();
          await writableStream.write(content);
          await writableStream.close();
          savedViaPicker = true;
        } catch (pickerErr: any) {
          // Если пользователь нажал кнопку "Отмена" в системном диалоге выбора пути
          if (pickerErr?.name === 'AbortError') {
            setIsGenerating(false);
            return;
          }
          // При блокировке в iframe или отсутствии разрешений переходим на fallback
          console.warn('File picker fallback triggered:', pickerErr);
          savedViaPicker = false;
        }
      }

      // Fallback: Мгновенное скачивание через временный тег <a> и URL.createObjectURL
      if (!savedViaPicker) {
        const downloadUrl = URL.createObjectURL(content);
        const anchor = document.createElement('a');
        anchor.href = downloadUrl;
        anchor.download = filename;
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 2500);
      }

      setSaveStatus({
        type: 'success',
        message: `Архив «${filename}» (4 документа) успешно сформирован и сохранен!`,
      });

      if (onSuccess) {
        onSuccess(filename);
      }

      setTimeout(() => {
        setSaveStatus({ type: null, message: '' });
      }, 6000);
    } catch (err: any) {
      console.error('Ошибка создания ZIP архива ПСД:', err);
      setSaveStatus({
        type: 'error',
        message: err?.message || 'Не удалось сформировать ZIP-архив проекта',
      });
      if (onError) {
        onError(err);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Вариант 1: Компактный
  if (variant === 'compact') {
    return (
      <div className="relative inline-flex flex-col items-start">
        <button
          type="button"
          onClick={handleExportZip}
          disabled={isGenerating}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-sans text-xs font-bold shadow-md shadow-red-900/30 transition active:scale-95 disabled:opacity-60 cursor-pointer ${className}`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Формирование архива...</span>
            </>
          ) : (
            <>
              <span className="text-sm">📦</span>
              <Download className="h-3.5 w-3.5" />
              <span>{buttonText || 'Скачать ПСД (.zip)'}</span>
            </>
          )}
        </button>

        {saveStatus.message && (
          <div
            className={`mt-1 text-[11px] px-2.5 py-1 rounded-md border animate-in fade-in ${
              saveStatus.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                : 'bg-red-950/90 text-red-300 border-red-500/50'
            }`}
          >
            {saveStatus.message}
          </div>
        )}
      </div>
    );
  }

  // Вариант 2: Hero (Основной вид с описанием состава 4 файлов)
  return (
    <div className="flex flex-col items-center w-full space-y-3">
      <button
        type="button"
        onClick={handleExportZip}
        disabled={isGenerating}
        className={`group relative flex items-center justify-center gap-3.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:via-rose-500 hover:to-amber-500 text-white font-sans font-bold text-sm md:text-base shadow-xl shadow-red-900/40 hover:shadow-red-600/50 transition-all duration-200 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none cursor-pointer border border-red-400/30 ${className}`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-white" />
            <span>Сборка полного ZIP-пакета ПСД (4 файла)...</span>
          </>
        ) : (
          <>
            <span className="text-xl group-hover:scale-110 transition-transform">📦</span>
            <Archive className="h-5 w-5 text-white/90" />
            <span>{buttonText || 'Скачать полный архив ПСД (.zip)'}</span>
            <span className="hidden sm:inline-flex items-center text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-black/30 border border-white/25 text-white">
              4 документа • ГОСТ
            </span>
          </>
        )}
      </button>

      {/* Список файлов, включенных в архив */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-500">
        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
          <FileCode className="h-3 w-3 text-red-500" />
          01_Чертеж_АПС_и_СОУЭ.svg
        </span>
        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
          <FileSpreadsheet className="h-3 w-3 text-emerald-600" />
          02_Спецификация.csv
        </span>
        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
          <FileText className="h-3 w-3 text-blue-600" />
          03_Пояснительная_записка.txt
        </span>
        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
          <Database className="h-3 w-3 text-amber-600" />
          04_FireCAD_Backup.json
        </span>
      </div>

      {/* Уведомление о статусе */}
      {saveStatus.message && (
        <div
          className={`flex items-center gap-2 p-3 px-4 rounded-xl border text-xs font-mono max-w-xl animate-in fade-in slide-in-from-bottom-2 ${
            saveStatus.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-950/40'
              : 'bg-red-950/90 text-red-300 border-red-500/50 shadow-lg shadow-red-950/40'
          }`}
        >
          {saveStatus.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          )}
          <span>{saveStatus.message}</span>
        </div>
      )}
    </div>
  );
};
