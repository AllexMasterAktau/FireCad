import React, { useMemo, useState } from 'react';
import {
  Printer,
  Download,
  FileSpreadsheet,
  FileText,
  Calculator,
  CheckCircle2,
  Table,
} from 'lucide-react';

export interface DeviceItem {
  id?: string | number;
  type: string; // 'smoke' | 'heat' | 'manual' | 'sounder' | 'exit_sign' | 'panel' etc.
  [key: string]: any;
}

export interface SpecificationRow {
  position: number;
  name: string;
  code: string;
  unit: string;
  quantity: number | string;
  manufacturer?: string;
  note: string;
}

export interface EquipmentSpecificationProps {
  devices?: DeviceItem[];
  projectName?: string;
  objectAddress?: string;
  showStamp?: boolean;
}

// Словарь-справочник номенклатуры оборудования АПС и СОУЭ
const NOMENCLATURE_DICT: Record<
  string,
  {
    name: string;
    code: string;
    unit: string;
    manufacturer: string;
    note: string;
  }
> = {
  smoke: {
    name: 'Извещатель пожарный дымовой оптико-электронный точечный',
    code: 'ИП 212-45 (Рубеж)',
    unit: 'шт.',
    manufacturer: 'ГК Рубеж',
    note: 'Монтаж на потолок, потолочная розетка в комплекте',
  },
  heat: {
    name: 'Извещатель пожарный тепловой максимальный',
    code: 'ИП 101-1А-А1',
    unit: 'шт.',
    manufacturer: 'ЗАО Риэлта',
    note: 'Для серверных и ИТ-узлов (категория В2)',
  },
  manual: {
    name: 'Извещатель пожарный ручной адресный с фиксацией',
    code: 'ИПР-513-10',
    unit: 'шт.',
    manufacturer: 'НВП Болид',
    note: 'Монтаж у эвакуационных выходов h=1.5м',
  },
  sounder: {
    name: 'Оповещатель звуковой пожарный настенный (СОУЭ)',
    code: 'Маяк-12-З',
    unit: 'шт.',
    manufacturer: 'Электротехника и Автоматика',
    note: 'Уровень звука не менее 85 дБА на расстоянии 1м',
  },
  exit_sign: {
    name: 'Оповещатель пожарный световой (Табло "ВЫХОД")',
    code: 'Молния-12 (РИП)',
    unit: 'шт.',
    manufacturer: 'Арсенал Безопасности',
    note: 'Над эвакуационными дверными проемами',
  },
  panel: {
    name: 'Прибор приемно-контрольный и управления пожарный (ППКПиУ)',
    code: 'Сириус (ИСО Орион)',
    unit: 'компл.',
    manufacturer: 'ЗАО НВП Болид',
    note: 'Пост охраны / серверная, с АКБ 12В 17Ач',
  },
};

// Дефолтный массив устройств для автономного рендера
const defaultMockDevices: DeviceItem[] = [
  { id: 1, type: 'smoke' },
  { id: 2, type: 'smoke' },
  { id: 3, type: 'smoke' },
  { id: 4, type: 'smoke' },
  { id: 5, type: 'smoke' },
  { id: 6, type: 'smoke' },
  { id: 7, type: 'smoke' },
  { id: 8, type: 'smoke' },
  { id: 9, type: 'heat' },
  { id: 10, type: 'heat' },
  { id: 11, type: 'manual' },
  { id: 12, type: 'manual' },
  { id: 13, type: 'sounder' },
  { id: 14, type: 'sounder' },
  { id: 15, type: 'exit_sign' },
  { id: 16, type: 'exit_sign' },
  { id: 17, type: 'panel' },
];

export const EquipmentSpecification: React.FC<EquipmentSpecificationProps> = ({
  devices = defaultMockDevices,
  projectName = 'Административно-офисное здание (Блок А)',
  objectAddress = 'г. Астана, пр. Мангилик Ел, 55/8',
  showStamp = true,
}) => {
  const [cableSpacingMeters, setCableSpacingMeters] = useState<number>(5.0);
  const [cableReservePercent, setCableReservePercent] = useState<number>(15);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Шаг 2: Алгоритм агрегации и расчета кабеля
  const specificationData = useMemo<SpecificationRow[]>(() => {
    const counts: Record<string, number> = {};

    // 1. Подсчет количества каждого типа оборудования
    devices.forEach((d) => {
      const t = d.type || 'smoke';
      counts[t] = (counts[t] || 0) + 1;
    });

    const rows: SpecificationRow[] = [];
    let pos = 1;

    // Приоритетный порядок вывода по ГОСТ
    const priorityOrder = ['panel', 'smoke', 'heat', 'manual', 'sounder', 'exit_sign'];

    priorityOrder.forEach((typeKey) => {
      if (counts[typeKey]) {
        const info = NOMENCLATURE_DICT[typeKey] || {
          name: `Оборудование системы безопасности (${typeKey})`,
          code: typeKey.toUpperCase(),
          unit: 'шт.',
          manufacturer: 'По проекту',
          note: '-',
        };

        rows.push({
          position: pos++,
          name: info.name,
          code: info.code,
          unit: info.unit,
          quantity: counts[typeKey],
          manufacturer: info.manufacturer,
          note: info.note,
        });
      }
    });

    // Обработка прочих типов, если они есть
    Object.keys(counts).forEach((typeKey) => {
      if (!priorityOrder.includes(typeKey)) {
        rows.push({
          position: pos++,
          name: `Устройство ${typeKey}`,
          code: typeKey.toUpperCase(),
          unit: 'шт.',
          quantity: counts[typeKey],
          manufacturer: 'По проекту',
          note: 'Прочее оборудование',
        });
      }
    });

    // 2. Умный Data-Driven расчет длины кабеля
    // Количество точек подключения (все датчики, оповещатели и ручники)
    const totalFieldDevices = devices.filter((d) => d.type !== 'panel').length;
    const baseLength = Math.max(20, totalFieldDevices * cableSpacingMeters);
    const totalCableLength = Math.ceil(baseLength * (1 + cableReservePercent / 100));

    // Кабель для шлейфов АПС (КПСнг(А)-FRLS 1х2х0.5)
    rows.push({
      position: pos++,
      name: 'Кабель огнестойкий для систем АПС (не распространяющий горение)',
      code: 'КПСнг(А)-FRLS 1х2х0.5',
      unit: 'м',
      quantity: totalCableLength,
      manufacturer: 'Паритет / СПКБ',
      note: `Расчет: ${totalFieldDevices} устр. × ${cableSpacingMeters}м + ${cableReservePercent}% запас`,
    });

    // Кабель для линий оповещения СОУЭ (КПСнг(А)-FRLS 1х2х0.75)
    const sounderCount = (counts['sounder'] || 0) + (counts['exit_sign'] || 0);
    if (sounderCount > 0) {
      const soueCableLength = Math.ceil(
        Math.max(15, sounderCount * (cableSpacingMeters + 3) * (1 + cableReservePercent / 100))
      );
      rows.push({
        position: pos++,
        name: 'Кабель огнестойкий для линий оповещения СОУЭ',
        code: 'КПСнг(А)-FRLS 1х2х0.75',
        unit: 'м',
        quantity: soueCableLength,
        manufacturer: 'Паритет / СПКБ',
        note: `Питание оповещателей и световых табло (${sounderCount} шт.)`,
      });
    }

    // Монтажные материалы: коробки распаечные огнестойкие
    const junctionBoxes = Math.ceil(totalFieldDevices * 0.4);
    rows.push({
      position: pos++,
      name: 'Коробка распределительная огнестойкая с клеммами',
      code: 'КСПВ / FS-Box 4P',
      unit: 'шт.',
      quantity: junctionBoxes,
      manufacturer: 'Гефест / Промрукав',
      note: 'Для ответвлений и соединений шлейфов',
    });

    // Гофротруба ПВХ / ПНД
    rows.push({
      position: pos++,
      name: 'Труба гибкая гофрированная из самозатухающего ПВХ d=16мм',
      code: 'ТГГ-16 с протяжкой',
      unit: 'м',
      quantity: totalCableLength,
      manufacturer: 'ДКС',
      note: 'Прокладка за фальшпотолком и в штробах',
    });

    return rows;
  }, [devices, cableSpacingMeters, cableReservePercent]);

  // Общая статистика
  const summaryStats = useMemo(() => {
    const totalEquipment = devices.length;
    const totalCableMeters = specificationData
      .filter((r) => r.unit === 'м')
      .reduce((acc, r) => acc + (typeof r.quantity === 'number' ? r.quantity : 0), 0);

    return { totalEquipment, totalCableMeters };
  }, [devices, specificationData]);

  /**
   * ШАГ 1: Экспорт в Excel (CSV)
   * Формирует CSV строку с разделителем ';', BOM для корректной кодировки кириллицы UTF-8
   */
  const exportToCSV = () => {
    // Заголовки таблицы ГОСТ
    const headers = [
      'Поз.',
      'Наименование и техническая характеристика',
      'Тип, марка, обозначение документа',
      'Завод-изготовитель',
      'Единица измерения',
      'Количество',
      'Примечание',
    ];

    // Формирование строк данных с экранированием кавычек
    const csvRows = specificationData.map((row) => {
      const escapeField = (field: any) => `"${String(field || '').replace(/"/g, '""')}"`;
      return [
        row.position,
        escapeField(row.name),
        escapeField(row.code),
        escapeField(row.manufacturer || '-'),
        escapeField(row.unit),
        row.quantity,
        escapeField(row.note),
      ].join(';');
    });

    // Добавляем BOM (\uFEFF) в самое начало для корректного открытия кириллицы в Excel
    const csvContent =
      '\uFEFF' +
      [
        `"Спецификация оборудования, изделий и материалов (ГОСТ 21.110-2013)"`,
        `"Объект: ${projectName.replace(/"/g, '""')}"`,
        `"Адрес: ${objectAddress.replace(/"/g, '""')}"`,
        `"Шифр проекта: 02-2026-АПС.СОУЭ.СО"`,
        '',
        headers.join(';'),
        ...csvRows,
      ].join('\r\n');

    // Создаем Blob и вызываем программное скачивание
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Спецификация_FireCAD.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  /**
   * ШАГ 2: Экспорт в PDF / Печать листа спецификации по ГОСТ (А4 Книжная)
   */
  const handlePrint = () => {
    const styleId = 'dynamic-spec-print-page-style';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.innerHTML = `
      @page {
        size: A4 portrait !important;
        margin: 15mm 10mm 15mm 20mm !important;
      }
      @media print {
        html, body {
          background: #ffffff !important;
          color: #000000 !important;
          margin: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body * {
          visibility: hidden !important;
        }
        #gost-specification-sheet,
        #gost-specification-sheet * {
          visibility: visible !important;
        }
        #gost-specification-sheet {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          min-height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
          border: none !important;
          background: #ffffff !important;
          color: #000000 !important;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    window.print();
  };

  return (
    <div className="w-full flex flex-col items-center bg-slate-900 rounded-2xl border border-slate-700 p-4 md:p-6 shadow-2xl space-y-4">
      {/* Стили для идеальной печати A4 (@media print) */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 15mm 10mm 15mm 20mm;
        }
        @media print {
          /* Скрываем все лишние элементы интерфейса дашборда при печати */
          body * {
            visibility: hidden;
          }
          /* Показываем только лист спецификации ГОСТ */
          #gost-specification-sheet,
          #gost-specification-sheet * {
            visibility: visible;
          }
          #gost-specification-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Верхний CAD Тулбар управления */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs font-mono text-slate-300 no-print">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <div className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Спецификация оборудования, изделий и материалов</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                ГОСТ 21.110-2013 (Форма 1)
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Автоматическая Data-Driven агрегация из {devices.length} приборов схемы
            </p>
          </div>
        </div>

        {/* Панель кнопок экспорта: Excel (CSV) и PDF / Печать */}
        <div className="flex items-center gap-2.5">
          {/* Зеленая кнопка экспорта в Excel (CSV) */}
          <button
            type="button"
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 transition active:scale-95 cursor-pointer"
            title="Экспорт в Microsoft Excel с поддержкой кириллицы UTF-8 BOM"
          >
            <span className="text-base leading-none">📊</span>
            <FileSpreadsheet className="h-4 w-4" />
            <span>Скачать в Excel (CSV)</span>
          </button>

          {/* Синяя кнопка экспорта в PDF / Печать */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 transition active:scale-95 cursor-pointer"
            title="Печать листа формата А4 или сохранение в PDF"
          >
            <span className="text-base leading-none">📄</span>
            <Printer className="h-4 w-4" />
            <span>Сохранить в PDF / Печать</span>
          </button>
        </div>
      </div>

      {/* Уведомление об успешном скачивании */}
      {copiedSuccess && (
        <div className="w-full max-w-5xl flex items-center justify-between p-2.5 px-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono animate-fadeIn no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Файл <strong>«Спецификация_FireCAD.csv»</strong> успешно сформирован и скачан! (Кодировка UTF-8 с BOM для Excel)</span>
          </div>
        </div>
      )}

      {/* Параметры эвристического расчета кабеля */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs no-print">
        <div className="flex items-center gap-2 text-slate-300 font-mono">
          <Calculator className="h-4 w-4 text-amber-400" />
          <span className="font-bold text-white">Параметры Data-Driven кабельного запаса:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Шаг между точками:</span>
            <select
              value={cableSpacingMeters}
              onChange={(e) => setCableSpacingMeters(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 font-mono"
            >
              <option value={3.5}>3.5 м (Компактный)</option>
              <option value={5.0}>5.0 м (Стандартный офис)</option>
              <option value={7.5}>7.5 м (Большие пролеты)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Технологический запас:</span>
            <select
              value={cableReservePercent}
              onChange={(e) => setCableReservePercent(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 font-mono"
            >
              <option value={10}>+10% (Минимум)</option>
              <option value={15}>+15% (Норма ГОСТ)</option>
              <option value={20}>+20% (Сложные трассы)</option>
            </select>
          </div>

          <div className="text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
            Итого кабеля: {summaryStats.totalCableMeters} м
          </div>
        </div>
      </div>

      {/* Лист спецификации по форме ГОСТ 21.110-2013 (А4 Книжная ориентация) */}
      <div className="w-full overflow-x-auto flex justify-center p-2 md:p-6 bg-slate-950/60 rounded-xl border border-slate-800">
        <div
          id="gost-specification-sheet"
          style={{
            width: '210mm',
            minHeight: '297mm',
            backgroundColor: '#FFFFFF',
            color: '#000000',
            fontFamily: '"Times New Roman", "DejaVu Serif", serif, "Roboto Mono"',
            padding: '15mm 10mm 15mm 20mm', // Поля по ГОСТ: Левое 20мм, Правое 10мм, Верх 15мм, Низ 15мм
            boxSizing: 'border-box',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            fontSize: '11pt',
            lineHeight: 1.2,
          }}
          className="select-text"
        >
          {/* Шапка документа */}
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Спецификация оборудования, изделий и материалов
            </div>
            <div style={{ fontSize: '10pt', color: '#333333', marginTop: '3px' }}>
              Раздел: 02-2026-АПС.СОУЭ.СО • Стадия «П»
            </div>
            <div style={{ fontSize: '9pt', color: '#555555', marginTop: '2px' }}>
              Объект: {projectName} ({objectAddress})
            </div>
          </div>

          {/* Строгая инженерная таблица по форме ГОСТ (Черные тонкие границы 1px, collapse) */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1.5px solid #000000',
              fontSize: '9.5pt',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#F8F9FA' }}>
                <th
                  style={{
                    border: '1px solid #000000',
                    padding: '6px 4px',
                    width: '32px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  Поз.
                </th>
                <th
                  style={{
                    border: '1px solid #000000',
                    padding: '6px 6px',
                    fontWeight: 'bold',
                  }}
                >
                  Наименование и техническая характеристика
                </th>
                <th
                  style={{
                    border: '1px solid #000000',
                    padding: '6px 6px',
                    width: '140px',
                    fontWeight: 'bold',
                  }}
                >
                  Тип, марка, обозначение документа
                </th>
                <th
                  style={{
                    border: '1px solid #000000',
                    padding: '6px 4px',
                    width: '45px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  Ед. изм.
                </th>
                <th
                  style={{
                    border: '1px solid #000000',
                    padding: '6px 4px',
                    width: '55px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  Кол-во
                </th>
                <th
                  style={{
                    border: '1px solid #000000',
                    padding: '6px 6px',
                    width: '140px',
                    fontWeight: 'bold',
                  }}
                >
                  Примечание
                </th>
              </tr>
              {/* Нумерация колонок по ГОСТ 21.110 */}
              <tr style={{ backgroundColor: '#EEEEEE', textAlign: 'center', fontSize: '8pt' }}>
                <th style={{ border: '1px solid #000000', padding: '2px' }}>1</th>
                <th style={{ border: '1px solid #000000', padding: '2px' }}>2</th>
                <th style={{ border: '1px solid #000000', padding: '2px' }}>3</th>
                <th style={{ border: '1px solid #000000', padding: '2px' }}>4</th>
                <th style={{ border: '1px solid #000000', padding: '2px' }}>5</th>
                <th style={{ border: '1px solid #000000', padding: '2px' }}>6</th>
              </tr>
            </thead>
            <tbody>
              {specificationData.map((row) => (
                <tr key={`spec-row-${row.position}`} style={{ verticalAlign: 'top' }}>
                  <td
                    style={{
                      border: '1px solid #000000',
                      padding: '5px 4px',
                      textAlign: 'center',
                      fontFamily: 'monospace',
                    }}
                  >
                    {row.position}
                  </td>
                  <td style={{ border: '1px solid #000000', padding: '5px 6px' }}>
                    <div style={{ fontWeight: '500' }}>{row.name}</div>
                    {row.manufacturer && (
                      <div style={{ fontSize: '8pt', color: '#555555', marginTop: '2px' }}>
                        Завод-изготовитель: {row.manufacturer}
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      border: '1px solid #000000',
                      padding: '5px 6px',
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      fontSize: '9pt',
                    }}
                  >
                    {row.code}
                  </td>
                  <td
                    style={{
                      border: '1px solid #000000',
                      padding: '5px 4px',
                      textAlign: 'center',
                    }}
                  >
                    {row.unit}
                  </td>
                  <td
                    style={{
                      border: '1px solid #000000',
                      padding: '5px 4px',
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      fontSize: '10pt',
                    }}
                  >
                    {row.quantity}
                  </td>
                  <td
                    style={{
                      border: '1px solid #000000',
                      padding: '5px 6px',
                      fontSize: '8.5pt',
                      color: '#222222',
                    }}
                  >
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Технический штамп основной надписи по ГОСТ 21.1101-2013 (Форма 5 для текстовых документов) */}
          {showStamp && (
            <div style={{ marginTop: '24px' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1.5px solid #000000',
                  fontSize: '8pt',
                  fontFamily: '"Roboto Mono", monospace',
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #000000', width: '25px', padding: '3px', textAlign: 'center' }}>Изм.</td>
                    <td style={{ border: '1px solid #000000', width: '30px', padding: '3px', textAlign: 'center' }}>Кол.уч</td>
                    <td style={{ border: '1px solid #000000', width: '30px', padding: '3px', textAlign: 'center' }}>Лист</td>
                    <td style={{ border: '1px solid #000000', width: '40px', padding: '3px', textAlign: 'center' }}>№ док.</td>
                    <td style={{ border: '1px solid #000000', width: '45px', padding: '3px', textAlign: 'center' }}>Подп.</td>
                    <td style={{ border: '1px solid #000000', width: '40px', padding: '3px', textAlign: 'center' }}>Дата</td>
                    <td
                      colSpan={3}
                      style={{
                        border: '1px solid #000000',
                        padding: '4px 8px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '9.5pt',
                      }}
                    >
                      02-2026-АПС.СОУЭ.СО
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ border: '1px solid #000000', padding: '3px' }}>Разраб.</td>
                    <td colSpan={2} style={{ border: '1px solid #000000', padding: '3px' }}>Ахметов А.</td>
                    <td style={{ border: '1px solid #000000', padding: '3px' }}></td>
                    <td style={{ border: '1px solid #000000', padding: '3px' }}>{new Date().toLocaleDateString('ru-RU')}</td>
                    <td
                      rowSpan={3}
                      style={{
                        border: '1px solid #000000',
                        padding: '4px',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>{projectName}</div>
                      <div style={{ fontSize: '7.5pt', color: '#444' }}>{objectAddress}</div>
                    </td>
                    <td style={{ border: '1px solid #000000', width: '40px', padding: '2px', textAlign: 'center' }}>Стадия</td>
                    <td style={{ border: '1px solid #000000', width: '40px', padding: '2px', textAlign: 'center' }}>Лист</td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ border: '1px solid #000000', padding: '3px' }}>Пров.</td>
                    <td colSpan={2} style={{ border: '1px solid #000000', padding: '3px' }}>Иванов И.</td>
                    <td style={{ border: '1px solid #000000', padding: '3px' }}></td>
                    <td style={{ border: '1px solid #000000', padding: '3px' }}>{new Date().toLocaleDateString('ru-RU')}</td>
                    <td style={{ border: '1px solid #000000', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>П</td>
                    <td style={{ border: '1px solid #000000', padding: '2px', textAlign: 'center' }}>1</td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ border: '1px solid #000000', padding: '3px' }}>ГИП</td>
                    <td colSpan={2} style={{ border: '1px solid #000000', padding: '3px' }}>Смагулов</td>
                    <td style={{ border: '1px solid #000000', padding: '3px' }}></td>
                    <td style={{ border: '1px solid #000000', padding: '3px' }}>{new Date().toLocaleDateString('ru-RU')}</td>
                    <td colSpan={2} style={{ border: '1px solid #000000', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>
                      FireCAD Systems
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
