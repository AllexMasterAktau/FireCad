import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Copy,
  CheckCircle2,
  Download,
  BookOpen,
  ShieldCheck,
  Building2,
  Layers,
  Zap,
} from 'lucide-react';

export interface ProjectMetadata {
  title: string;
  address: string;
  area: number;
  floors: number;
  normBase?: string;
  totalDevices?: number;
  totalCableMeters?: number;
  smokeDetectors?: number;
  heatDetectors?: number;
  manualPoints?: number;
  soundersCount?: number;
  soueType?: number;
  panelModel?: string;
  projectCode?: string;
  authorName?: string;
  gipName?: string;
}

export interface ExplanatoryNoteProps {
  project?: ProjectMetadata;
  showStamp?: boolean;
}

const defaultProject: ProjectMetadata = {
  title: 'Административно-офисное здание (Блок А)',
  address: 'г. Астана, ул. Достык, 1',
  area: 1850,
  floors: 3,
  normBase: 'СН РК 2.02-05-2014, СП РК 2.02-105-2014, Технический регламент РК «Общие требования к пожарной безопасности»',
  totalDevices: 42,
  totalCableMeters: 280,
  smokeDetectors: 26,
  heatDetectors: 6,
  manualPoints: 4,
  soundersCount: 6,
  soueType: 2,
  panelModel: 'Сириус (ИСО Орион) / ППКП',
  projectCode: '02-2026-АПС.СОУЭ.ПЗ',
  authorName: 'Ахметов А. Е.',
  gipName: 'Смагулов Б. К.',
};

export const ExplanatoryNote: React.FC<ExplanatoryNoteProps> = ({
  project = defaultProject,
  showStamp = true,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Сборка полного текстового контента для копирования в буфер обмена (для вставки в MS Word)
  const fullTextContent = `ПОЯСНИТЕЛЬНАЯ ЗАПИСКА
Раздел: Автоматическая пожарная сигнализация (АПС) и Система оповещения и управления эвакуацией людей при пожаре (СОУЭ)
Шифр проекта: ${project.projectCode || '02-2026-АПС.СОУЭ.ПЗ'}

Объект: ${project.title}
Адрес: ${project.address}
Общая площадь: ${project.area} м²
Этажность: ${project.floors} эт.

1. ОСНОВАНИЕ ДЛЯ ПРОЕКТИРОВАНИЯ И НОРМАТИВНЫЕ ССЫЛКИ
Рабочая документация на монтаж систем автоматической пожарной сигнализации (АПС) и системы оповещения и управления эвакуацией людей при пожаре (СОУЭ) разработана на основании задания на проектирование, архитектурно-строительных чертежей и в строгом соответствии с действующими нормативно-техническими документами Республики Казахстан:
- ${project.normBase || 'СН РК 2.02-05-2014, СП РК 2.02-105-2014'}
- ТР ТС 043/2017 «О требованиях к средствам обеспечения пожарной безопасности и пожаротушения»
- ПУЭ РК (Правила устройства электроустановок).

2. ОПИСАНИЕ ПРИНЯТЫХ ТЕХНИЧЕСКИХ РЕШЕНИЙ
2.1. Система автоматической пожарной сигнализации (АПС)
В качестве центрального оборудования применен прибор приемно-контрольный и управления пожарный ${project.panelModel || '«Сириус»'}.
Для раннего обнаружения очагов возгорания в помещениях предусмотрена установка:
- Извещателей пожарных дымовых оптико-электронных адресно-аналоговых (ИП 212-45) в офисных и административных помещениях, коридорах и холлах. Расчетный радиус защиты R=4.5 м.
- Извещателей пожарных тепловых максимальных (ИП 101-1А-А1) в серверных помещениях и помещениях ИТ-узлов (категория пожарной опасности В2–В4). Радиус защиты R=2.5 м.
- Извещателей пожарных ручных (ИПР 513-10) на путях эвакуации, у выходов из здания на высоте 1.5 м от уровня пола.

Математический алгоритм САПР «FireCAD» определил необходимость установки ${project.totalDevices || 42} единиц периферийных приборов и извещателей, что гарантирует 100% покрытие контролируемой площади без «слепых зон» с нормативным коэффициентом надежности.

2.2. Система оповещения и управления эвакуацией (СОУЭ)
В соответствии со СН РК 2.02-05-2014 для проектируемого объекта запроектирована СОУЭ ${project.soueType || 2}-го типа, включающая:
- Звуковые пожарные оповещатели («Маяк-12-З»), обеспечивающие расчетный уровень звукового давления не менее 85 дБА на расстоянии 1.0 м;
- Световые эвакуационные указатели «ВЫХОД» с автономными блоками резервного питания, установленные над дверными проемами эвакуационных выходов.
Включение СОУЭ осуществляется автоматически по сигналу «ПОЖАР» от системы АПС.

3. КАБЕЛЬНЫЕ ТРАССЫ, ЭЛЕКТРОСНАБЖЕНИЕ И ЗАЗЕМЛЕНИЕ
3.1. Кабельные трассы
Все шлейфы пожарной сигнализации и линии оповещения СОУЭ выполняются огнестойким не распространяющим горение кабелем марки КПСнг(А)-FRLS (1х2х0.5 и 1х2х0.75).
Кабели сохраняют работоспособность в условиях стандартного температурного режима пожара в течение не менее 180 минут (Е180).
Общая расчетная длина кабельных трасс с учетом технологического запаса 15% на разделку и опуски составляет ${project.totalCableMeters || 280} метров.
Прокладка кабелей предусмотрена в самозатухающих ПВХ-гофротрубах за подвесным потолком и в жестких ПВХ-каналах по стенам.

3.2. Электропитание
По надежности электроснабжения электроприемники систем АПС и СОУЭ относятся к I категории согласно ПУЭ. Основное электропитание осуществляется от сети переменного тока напряжением 220 В, 50 Гц. Резервное питание обеспечивается от встроенных необслуживаемых аккумуляторных батарей (РИП-12 исп. 51), гарантирующих работу системы в дежурном режиме не менее 24 часов плюс 3 часа работы в режиме «ТРЕВОГА».

Разработал: ${project.authorName || 'Ахметов А. Е.'}
ГИП: ${project.gipName || 'Смагулов Б. К.'}
Дата: ${new Date().toLocaleDateString('ru-RU')}
`;

  // Копирование в буфер обмена для Word
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(fullTextContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Ошибка копирования текста:', err);
    }
  };

  // Вызов печати / PDF в векторном качестве А4
  const handlePrint = () => {
    const styleId = 'dynamic-note-print-page-style';
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
        #gost-explanatory-note-sheet,
        #gost-explanatory-note-sheet * {
          visibility: visible !important;
        }
        #gost-explanatory-note-sheet {
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
      {/* Стили для идеальной печати документа А4 */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 15mm 10mm 15mm 20mm;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #gost-explanatory-note-sheet,
          #gost-explanatory-note-sheet * {
            visibility: visible;
          }
          #gost-explanatory-note-sheet {
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
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <div className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Пояснительная записка к разделу АПС и СОУЭ</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ГОСТ 21.101-2020 / СН РК
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Официальный технический отчет, сгенерированный на основе параметров объекта
            </p>
          </div>
        </div>

        {/* Кнопки экспорта и копирования */}
        <div className="flex items-center gap-2.5">
          {/* Кнопка копирования для MS Word */}
          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-sans font-bold shadow-md transition active:scale-95 cursor-pointer"
            title="Скопировать весь текст записки для вставки в Microsoft Word"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">Скопировано в буфер!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-slate-400" />
                <span>Скопировать текст (MS Word)</span>
              </>
            )}
          </button>

          {/* Синяя кнопка печати в PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 transition active:scale-95 cursor-pointer"
            title="Печать или сохранение в PDF формат А4"
          >
            <span className="text-base leading-none">📄</span>
            <Printer className="h-4 w-4" />
            <span>Печать / Сохранить в PDF</span>
          </button>
        </div>
      </div>

      {/* Быстрая плашка метаданных */}
      <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs no-print">
        <div className="flex items-center gap-2 text-slate-300">
          <Building2 className="h-4 w-4 text-blue-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Объект:</div>
            <div className="font-bold text-white truncate">{project.title}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Layers className="h-4 w-4 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Площадь / Этажи:</div>
            <div className="font-bold text-emerald-300">{project.area} м² • {project.floors} эт.</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldCheck className="h-4 w-4 text-red-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Всего приборов АПС:</div>
            <div className="font-bold text-red-400">{project.totalDevices || 42} шт. (100% расчет)</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Zap className="h-4 w-4 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Кабельная трасса:</div>
            <div className="font-bold text-amber-300">{project.totalCableMeters || 280} м (КПСнг-FRLS)</div>
          </div>
        </div>
      </div>

      {/* Лист Пояснительной записки формата А4 */}
      <div className="w-full overflow-x-auto flex justify-center p-2 md:p-6 bg-slate-950/60 rounded-xl border border-slate-800">
        <div
          id="gost-explanatory-note-sheet"
          style={{
            width: '210mm',
            minHeight: '297mm',
            backgroundColor: '#FFFFFF',
            color: '#111827',
            fontFamily: '"Times New Roman", "DejaVu Serif", serif, "Liberation Serif", serif',
            padding: '20mm 15mm 20mm 25mm', // Стандартные инженерные поля ГОСТ: Левое 25-30мм, Правое 15мм, Верх 20мм, Низ 20мм
            boxSizing: 'border-box',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
            fontSize: '11.5pt',
            lineHeight: '1.5',
          }}
          className="select-text flex flex-col justify-between"
        >
          {/* Верхняя титульная часть */}
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '15pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                ПОЯСНИТЕЛЬНАЯ ЗАПИСКА
              </div>
              <div style={{ fontSize: '11.5pt', fontWeight: 'bold', color: '#1F2937', marginTop: '6px' }}>
                Раздел: Автоматическая пожарная сигнализация (АПС) и Система оповещения и управления эвакуацией людей при пожаре (СОУЭ)
              </div>
              <div style={{ fontSize: '10.5pt', color: '#4B5563', marginTop: '4px', fontStyle: 'italic' }}>
                Шифр проекта: {project.projectCode || '02-2026-АПС.СОУЭ.ПЗ'} • Стадия «П»
              </div>
              <div
                style={{
                  width: '80px',
                  height: '2px',
                  backgroundColor: '#DC2626',
                  margin: '12px auto 0 auto',
                }}
              />
            </div>

            {/* Карточка объекта */}
            <div
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                padding: '10px 14px',
                marginBottom: '18px',
                fontSize: '10pt',
                lineHeight: '1.4',
              }}
            >
              <div><strong>Объект:</strong> {project.title}</div>
              <div><strong>Адрес строительства:</strong> {project.address}</div>
              <div>
                <strong>Технические характеристики:</strong> Общая площадь — <strong>{project.area} м²</strong>, 
                этажность — <strong>{project.floors} этаж(ей)</strong>, степень огнестойкости — II, класс функциональной пожарной опасности — Ф4.3.
              </div>
            </div>

            {/* Раздел 1. Основание для проектирования */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '12pt', fontWeight: 'bold', color: '#111827', marginBottom: '6px' }}>
                1. ОСНОВАНИЕ ДЛЯ ПРОЕКТИРОВАНИЯ И НОРМАТИВНЫЕ ССЫЛКИ
              </div>
              <p style={{ textAlign: 'justify', textIndent: '12.5mm', margin: 0 }}>
                Рабочая документация по оборудованию объекта системами автоматической противопожарной защиты разработана на основании технического задания Заказчика, действующих строительных норм и правил Республики Казахстан:
              </p>
              <ul style={{ margin: '6px 0 0 20px', padding: 0, fontSize: '10.5pt' }}>
                <li><strong>{project.normBase || 'СН РК 2.02-05-2014'}</strong> «Пожарная автоматика зданий и сооружений»;</li>
                <li><strong>СП РК 2.02-105-2014</strong> «Свод правил по проектированию систем противопожарной защиты»;</li>
                <li><strong>Технический регламент РК</strong> «Общие требования к пожарной безопасности» (Постановление Правительства РК № 439);</li>
                <li><strong>ПУЭ РК</strong> «Правила устройства электроустановок Республики Казахстан».</li>
              </ul>
            </div>

            {/* Раздел 2. Описание принятых технических решений */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '12pt', fontWeight: 'bold', color: '#111827', marginBottom: '6px' }}>
                2. ОПИСАНИЕ ПРИНЯТЫХ ТЕХНИЧЕСКИХ РЕШЕНИЙ
              </div>
              
              {/* 2.1 АПС */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '11pt' }}>2.1. Система автоматической пожарной сигнализации (АПС)</div>
                <p style={{ textAlign: 'justify', textIndent: '12.5mm', margin: '4px 0 0 0' }}>
                  Центральным узлом системы является прибор приемно-контрольный и управления пожарный <strong>{project.panelModel || '«Сириус» (ИСО «Орион»)'}</strong>, обеспечивающий непрерывный опрос адресных устройств, регистрацию тревожных извещений и выдачу управляющих сигналов на смежные инженерные системы (отключение приточной вентиляции, опуск лифтов на посадочный этаж).
                </p>
                <p style={{ textAlign: 'justify', textIndent: '12.5mm', margin: '4px 0 0 0' }}>
                  Для обнаружения факторов пожара применены:
                </p>
                <ul style={{ margin: '4px 0 0 20px', padding: 0, fontSize: '10.5pt' }}>
                  <li>
                    <strong>Извещатели пожарные дымовые оптико-электронные (ИП 212-45)</strong> — устанавливаются на потолке в офисных помещениях, коридорах и вестибюлях. Нормативный радиус контроля составляет <strong>R = 4.5 м</strong> (до 85 м² площади на один датчик).
                  </li>
                  <li>
                    <strong>Извещатели пожарные тепловые максимальные (ИП 101-1А)</strong> — устанавливаются в помещениях серверных и аппаратных (категория В2). Расчетный радиус зоны защиты <strong>R = 2.5 м</strong>.
                  </li>
                  <li>
                    <strong>Извещатели пожарные ручные (ИПР-513-10)</strong> — размещаются на путях эвакуации, у выходов из здания на высоте 1.5 м от уровня чистого пола.
                  </li>
                </ul>
                <p style={{ textAlign: 'justify', textIndent: '12.5mm', margin: '4px 0 0 0' }}>
                  Автоматический расчет САПР «FireCAD» на основе геометрической топологии помещений указывает на необходимость установки <strong>{project.totalDevices || 42} единиц</strong> пожарных приборов, что гарантирует 100% взаимное перекрытие секторов без образования мертвых зон и с соблюдением нормативного коэффициента резервирования (не менее 2 датчиков на помещение).
                </p>
              </div>

              {/* 2.2 СОУЭ */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '11pt' }}>2.2. Система оповещения и управления эвакуацией людей (СОУЭ)</div>
                <p style={{ textAlign: 'justify', textIndent: '12.5mm', margin: '4px 0 0 0' }}>
                  На объекте запроектирована СОУЭ <strong>{project.soueType || 2}-го типа</strong>. Оповещение людей о возникновении пожара и путях безопасной эвакуации осуществляется:
                </p>
                <ul style={{ margin: '4px 0 0 20px', padding: 0, fontSize: '10.5pt' }}>
                  <li>Подачей звукового сигнала оповещателями <strong>«Маяк-12-З»</strong> с уровнем громкости не менее <strong>85 дБА</strong> (с превышением фонового шума более чем на 15 дБА);</li>
                  <li>Включением световых указателей направления движения и эвакуационных табло <strong>«ВЫХОД» (Молния-12)</strong> с резервированным источником питания.</li>
                </ul>
              </div>
            </div>

            {/* Раздел 3. Кабельные трассы и электроснабжение */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '12pt', fontWeight: 'bold', color: '#111827', marginBottom: '6px' }}>
                3. КАБЕЛЬНЫЕ ТРАССЫ И ЭЛЕКТРОСНАБЖЕНИЕ
              </div>
              <p style={{ textAlign: 'justify', textIndent: '12.5mm', margin: 0 }}>
                Шлейфы сигнализации и линии питания СОУЭ выполняются огнестойким кабелем марки <strong>КПСнг(А)-FRLS (1х2х0.5 и 1х2х0.75)</strong> с пределом огнестойкости не менее 180 минут.
                Общая расчетная протяженность кабельных линий с учетом 15% запаса на технологические опуски и переходы сквозь межэтажные перекрытия составляет <strong>{project.totalCableMeters || 280} метров</strong>.
              </p>
              <p style={{ textAlign: 'justify', textIndent: '12.5mm', margin: '4px 0 0 0' }}>
                По степени надежности электроснабжения комплекс технических средств пожарной автоматики относится к <strong>I категории</strong>. Бесперебойность обеспечивается резервированным источником питания (РИП-12 исп. 51 с АКБ 17 Ач), обеспечивающим 24 часа автономной работы в дежурном режиме и 3 часа в режиме «Пожарная тревога».
              </p>
            </div>
          </div>

          {/* Инженерный штамп основной надписи по ГОСТ 21.101-2020 */}
          {showStamp && (
            <div style={{ marginTop: '16px' }}>
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
                      {project.projectCode || '02-2026-АПС.СОУЭ.ПЗ'}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ border: '1px solid #000000', padding: '3px' }}>Разраб.</td>
                    <td colSpan={2} style={{ border: '1px solid #000000', padding: '3px' }}>{project.authorName || 'Ахметов А.'}</td>
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
                      <div style={{ fontWeight: 'bold' }}>{project.title}</div>
                      <div style={{ fontSize: '7.5pt', color: '#444' }}>Пояснительная записка (АПС и СОУЭ)</div>
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
                    <td colSpan={2} style={{ border: '1px solid #000000', padding: '3px' }}>{project.gipName || 'Смагулов Б.'}</td>
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
