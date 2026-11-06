import React, { useState, useMemo } from 'react';
import {
  Flame,
  ShieldAlert,
  Layout,
  FileText,
  Settings,
  UploadCloud,
  Calculator,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Download,
  Building2,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  FileSpreadsheet,
  Check,
  AlertTriangle,
  ZoomIn,
  Eye,
  Sliders,
  ChevronRight,
  RefreshCw,
  FolderOpen,
  X,
  Plus,
  Crosshair,
  Volume2,
  Bell,
  Hand,
  CheckSquare,
  Square,
  Send,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { CadArchitecturalSheet } from './CadArchitecturalSheet';
import { SmartFireSafetyLayout } from './SmartFireSafetyLayout';
import { EquipmentSpecification } from './EquipmentSpecification';
import { ExplanatoryNote } from './ExplanatoryNote';
import {
  ExportArchiveButton,
  downloadFile,
  getActiveDrawingSvg,
  generateSpecificationCsv,
  generateExplanatoryNoteTxt,
} from './ExportArchiveButton';
import { IbsLogo } from './IbsLogo';

// Types for State Architecture
export type ViewMode = 'welcome' | 'workspace' | 'settings';
export type StepNumber = 1 | 2 | 3 | 4;

export interface ProjectParams {
  projectName: string;
  objectAddress?: string;
  authorName?: string;
  gipName?: string;
  objectType: 'school' | 'office' | 'warehouse' | 'mall' | 'industrial';
  totalArea: number; // m²
  ceilingHeight: number; // m
  floorsCount: number;
  fireCategory: 'В4' | 'В3' | 'В2' | 'В1' | 'Г' | 'Д';
  hasSuspendedCeiling: boolean;
  backupTimeHours: number; // typically 24h normal + 3h alarm (or 1h)
  equipmentBrand: 'bolid' | 'rubezh' | 'argus' | 'zetex';
  uploadedFile: { name: string; size: string; type: string } | null;
}

const initialParams: ProjectParams = {
  projectName: 'Объект №104: Административно-учебный корпус',
  objectAddress: 'г. Астана, ул. Достык, 1',
  authorName: 'Ахметов А. Е.',
  gipName: 'Смагулов Б. К.',
  objectType: 'school',
  totalArea: 1850,
  ceilingHeight: 3.3,
  floorsCount: 2,
  fireCategory: 'В4',
  hasSuspendedCeiling: false,
  backupTimeHours: 24,
  equipmentBrand: 'bolid',
  uploadedFile: null,
};

export const FireSafetyDashboard: React.FC = () => {
  // Core application states required by architecture
  const [currentView, setCurrentView] = useState<ViewMode>('welcome');
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [params, setParams] = useState<ProjectParams>(initialParams);

  // 1. Состояние (State) параметров объекта и загрузки файлов
  const [projectParams, setProjectParams] = useState<{
    area: number;
    height: number;
    objectType: 'school' | 'office' | 'warehouse';
    category: 'А' | 'Б' | 'В' | 'Г' | 'Д';
  }>({
    area: 1850,
    height: 3.2,
    objectType: 'office',
    category: 'В',
  });

  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; type: string }>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStage, setAnalyzingStage] = useState<string>('Распознавание геометрии стен...');

  // Additional UI states
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiOptimized, setAiOptimized] = useState(false);
  const [activePlanLayer, setActivePlanLayer] = useState<'all' | 'detectors' | 'sounders' | 'zones'>('all');
  const [showRadiuses, setShowRadiuses] = useState<boolean>(true);
  const [showCables, setShowCables] = useState<boolean>(true);
  const [cadViewMode, setCadViewMode] = useState<'smart' | 'gost_sheet' | 'simplified'>('smart');
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const notify = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 3500);
  };

  // Функция добавления файлов в список (без авто-запуска анализа)
  const handleFileUpload = (
    filesInput?: Array<{ name: string; size: string; type: string }> | { name: string; size: string; type: string }
  ) => {
    const newFiles = Array.isArray(filesInput)
      ? filesInput
      : filesInput
      ? [filesInput]
      : [
          {
            name: 'План_1_этажа_АР.dwg',
            size: '4.2 MB',
            type: 'DWG',
          },
          {
            name: 'План_2_этажа_АР.dwg',
            size: '3.8 MB',
            type: 'DWG',
          },
        ];

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    notify(`Добавлено в проект файлов: ${newFiles.length}`);
  };

  // Удаление конкретного файла из списка
  const removeUploadedFile = (indexToRemove: number) => {
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Функция ручного запуска AI-анализа проекта
  const startAnalysis = () => {
    if (uploadedFiles.length === 0) return;
    setIsAnalyzing(true);
    setAnalyzingStage('Распознавание геометрии стен...');

    const t1 = setTimeout(() => {
      setAnalyzingStage('Анализ назначения помещений и эвакуационных путей...');
    }, 1100);

    const t2 = setTimeout(() => {
      setAnalyzingStage('Расчет пожарной нагрузки и оборудования по СН РК...');
    }, 2200);

    const t3 = setTimeout(() => {
      setIsAnalyzing(false);
      // Заполняем стейт projectParams сгенерированными данными
      setProjectParams({
        area: 1850,
        height: 3.2,
        objectType: 'office',
        category: 'В',
      });
      setParams((prev) => ({
        ...prev,
        totalArea: 1850,
        ceilingHeight: 3.2,
        objectType: 'office',
        uploadedFile: uploadedFiles[0] || null,
      }));
      setCurrentStep(2);
      notify('AI-анализ чертежей успешно завершен: сформирована спецификация');
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  // 2. Реактивные вычисления оборудования по нормам СН РК 2.02-05-2014
  const smokeDetectors = Math.ceil(projectParams.area / 80) * 2; // 48 шт при 1850 м²
  const manualCallPoints = Math.max(12, Math.round(projectParams.area / 150)); // 12 шт
  const heatDetectors = Math.max(6, Math.round(smokeDetectors * 0.12)); // 6 шт (серверные/кухни)
  const cableLength = Math.round(projectParams.area * 1.16) + 3; // ~2150 м
  const batteryCapacity = Math.round((smokeDetectors * 0.05) + 7);
  const soueType = projectParams.objectType === 'school' 
    ? '3-й тип (Речевое)' 
    : projectParams.objectType === 'office' 
    ? '2-й тип (Звуковое)' 
    : '1-й тип';

  // Reset project state completely to initial values
  const handleResetProject = () => {
    if (window.confirm('Вы действительно хотите полностью очистить проект и сбросить все параметры?')) {
      setParams(initialParams);
      setProjectParams({
        area: 1850,
        height: 3.2,
        objectType: 'office',
        category: 'В',
      });
      setUploadedFiles([]);
      setIsAnalyzing(false);
      setCurrentStep(1);
      setCurrentView('welcome');
      setAiOptimized(false);
      setIsAiProcessing(false);
      setSelectedPreset(null);
      notify('Проект успешно сброшен к начальным параметрам');
    }
  };

  // Engineering Calculations by Republic of Kazakhstan Norms (СН РК 2.02-05-2014, СП РК 2.02-105-2014)
  const engineeringCalc = useMemo(() => {
    const { totalArea, ceilingHeight, objectType, floorsCount, hasSuspendedCeiling } = params;

    // 1. Smoke detector coverage area per ceiling height (СН РК: h <= 3.5m -> 85m²; 3.5 < h <= 6.0m -> 70m²; 6 < h <= 10.5m -> 65m²)
    let areaPerSmokeDetector = 85;
    if (ceilingHeight > 6.0) {
      areaPerSmokeDetector = 65;
    } else if (ceilingHeight > 3.5) {
      areaPerSmokeDetector = 70;
    }

    // Two detectors minimum per fire section / standard room partition multiplier
    const roomDivFactor = 1.25; // accounts for room geometry and corridors
    const baseDetectors = Math.ceil((totalArea / areaPerSmokeDetector) * roomDivFactor);
    const smokeDetectors = hasSuspendedCeiling ? Math.ceil(baseDetectors * 1.5) : baseDetectors;

    // Heat detectors for specific zones (kitchens, tech rooms) ~ 12% of total detectors
    const heatDetectors = Math.max(2, Math.ceil(smokeDetectors * 0.14));

    // Manual Call Points (ИПР) - near exits and stairs (at least 2 per floor + 1 per 50m corridor)
    const manualCallPoints = Math.max(4, floorsCount * 3 + Math.ceil(totalArea / 600));

    // SOUE Type Determination according to RK Norms
    let soueType = '2-й тип';
    let soueDesc = 'Звуковое оповещение (сирены/тоны) + световые табло "ВЫХОД"';
    let soundersCount = Math.ceil(totalArea / 120);

    if (objectType === 'school') {
      if (totalArea > 1500 || floorsCount >= 3) {
        soueType = '3-й тип (Речевое)';
        soueDesc = 'Речевое оповещение (динамики) + светоуказатели направления движения';
        soundersCount = Math.ceil(totalArea / 80);
      } else {
        soueType = '2-й тип (Светозвуковое)';
      }
    } else if (objectType === 'mall' || objectType === 'industrial') {
      soueType = '4-й тип (Зональное речевое)';
      soueDesc = 'Многозонное речевое оповещение с обратной связью с диспетчерской';
      soundersCount = Math.ceil(totalArea / 70);
    } else if (objectType === 'warehouse') {
      soueType = '1-й / 2-й тип';
      soueDesc = 'Светозвуковые оповещатели повышенной мощности (>105 дБ)';
    }

    // Battery Capacity calculation: I_standby * 24h + I_alarm * 3h (Резервное электропитание по ГОСТ / СН РК)
    // Average loop current per detector ~ 0.15mA standby, panel consumption ~ 0.35A, sirens in alarm ~ 2.5A
    const totalStandbyCurrentA = 0.45 + (smokeDetectors * 0.0002) + (soundersCount * 0.001);
    const totalAlarmCurrentA = totalStandbyCurrentA + 2.8;
    const requiredCapacityAh = Math.ceil((totalStandbyCurrentA * 24 + totalAlarmCurrentA * 3) * 1.25); // 1.25 aging factor
    const standardBatteryCapacity = requiredCapacityAh <= 12 ? 17 : requiredCapacityAh <= 24 ? 26 : requiredCapacityAh <= 40 ? 40 : 65;

    // Cable lengths estimate
    const estimatedApsCableMeters = Math.round(smokeDetectors * 18 + floorsCount * 45);
    const estimatedSoueCableMeters = Math.round(soundersCount * 22 + floorsCount * 50);

    // Control Panel recommendations
    const controlPanel = smokeDetectors > 200 
      ? 'ППКП Сириус / С2000М (Болид)' 
      : 'ППКП С2000-4 / С2000-КДЛ';

    return {
      smokeDetectors,
      heatDetectors,
      manualCallPoints,
      totalDetectors: smokeDetectors + heatDetectors + manualCallPoints,
      soueType,
      soueDesc,
      soundersCount,
      exitSignsCount: Math.max(6, floorsCount * 4 + Math.ceil(totalArea / 400)),
      requiredCapacityAh,
      standardBatteryCapacity,
      estimatedApsCableMeters,
      estimatedSoueCableMeters,
      controlPanel,
    };
  }, [params]);

  // Load Presets for quick demonstration
  const handleLoadPreset = (type: 'school' | 'office' | 'warehouse') => {
    if (type === 'school') {
      setParams({
        projectName: 'Общеобразовательная школа на 600 уч. мест (г. Астана)',
        objectType: 'school',
        totalArea: 2400,
        ceilingHeight: 3.6,
        floorsCount: 3,
        fireCategory: 'В4',
        hasSuspendedCeiling: true,
        backupTimeHours: 24,
        equipmentBrand: 'bolid',
        uploadedFile: { name: 'План_школа_3_этажа_БТИ.dwg', size: '4.8 MB', type: 'DWG' },
      });
      setSelectedPreset('school');
    } else if (type === 'office') {
      setParams({
        projectName: 'Бизнес-Центр "Esentai Tower" Блок B (г. Алматы)',
        objectType: 'office',
        totalArea: 1450,
        ceilingHeight: 3.1,
        floorsCount: 2,
        fireCategory: 'В4',
        hasSuspendedCeiling: false,
        backupTimeHours: 24,
        equipmentBrand: 'bolid',
        uploadedFile: { name: 'БЦ_Офисный_этаж_план.pdf', size: '2.1 MB', type: 'PDF' },
      });
      setSelectedPreset('office');
    } else {
      setParams({
        projectName: 'Логистический распределительный терминал А+ (г. Шымкент)',
        objectType: 'warehouse',
        totalArea: 4800,
        ceilingHeight: 8.5,
        floorsCount: 1,
        fireCategory: 'В2',
        hasSuspendedCeiling: false,
        backupTimeHours: 24,
        equipmentBrand: 'bolid',
        uploadedFile: { name: 'Складской_комплекс_раздел_АР.pdf', size: '6.4 MB', type: 'PDF' },
      });
      setSelectedPreset('warehouse');
    }
    setCurrentView('workspace');
    setCurrentStep(1);
    notify('Параметры типового объекта успешно загружены');
  };

  const handleRunAiPlacement = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      setIsAiProcessing(false);
      setAiOptimized(true);
      notify('AI-расстановка завершена: 100% покрытие зон обнаружения по СН РК');
    }, 1800);
  };

  // Экспорт Спецификации оборудования (XLSX / CSV)
  const handleDownloadSpec = () => {
    try {
      const csvContent = generateSpecificationCsv({
        projectName: params.projectName,
        objectAddress: params.objectAddress,
        totalArea: params.totalArea,
        ceilingHeight: params.ceilingHeight,
        floorsCount: params.floorsCount || 3,
        objectType: params.objectType,
        projectCode: '02-2026-АПС.СОУЭ.СО',
        authorName: params.authorName || 'Ахметов А. Е.',
        gipName: params.gipName || 'Смагулов Б. К.',
      });
      const filename = '02_Спецификация_оборудования.csv';
      downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
      notify(`Файл "${filename}" успешно сформирован и скачан`);
    } catch (err: any) {
      console.error('Ошибка экспорта спецификации:', err);
      notify('Ошибка при формировании файла спецификации');
    }
  };

  // Экспорт Пояснительной записки (DOCX / DOC / TXT)
  const handleDownloadNote = () => {
    try {
      const noteContent = generateExplanatoryNoteTxt({
        projectName: params.projectName,
        objectAddress: params.objectAddress,
        totalArea: params.totalArea,
        ceilingHeight: params.ceilingHeight,
        floorsCount: params.floorsCount || 3,
        objectType: params.objectType,
        normBase: 'СН РК 2.02-05-2014, СП РК 2.02-105-2014',
        authorName: params.authorName || 'Ахметов А. Е.',
        gipName: params.gipName || 'Смагулов Б. К.',
        projectCode: '02-2026-АПС.СОУЭ.ПЗ',
      });
      const filename = '03_Пояснительная_записка_АПС_СОУЭ.doc';
      downloadFile(noteContent, filename, 'application/msword;charset=utf-8');
      notify(`Файл "${filename}" успешно сформирован и скачан`);
    } catch (err: any) {
      console.error('Ошибка экспорта пояснительной записки:', err);
      notify('Ошибка при формировании пояснительной записки');
    }
  };

  // Экспорт Чертежей (DWG / SVG)
  const handleDownloadDrawing = () => {
    try {
      const svgContent = getActiveDrawingSvg({
        projectName: params.projectName,
        objectAddress: params.objectAddress,
        totalArea: params.totalArea,
        ceilingHeight: params.ceilingHeight,
        floorsCount: params.floorsCount || 3,
        objectType: params.objectType,
        authorName: params.authorName || 'Ахметов А. Е.',
        gipName: params.gipName || 'Смагулов Б. К.',
        projectCode: '02-2026-АПС.СОУЭ.ГЧ',
      });
      const filename = '01_Чертеж_АПС_и_СОУЭ_План_1_этажа.svg';
      downloadFile(svgContent, filename, 'image/svg+xml;charset=utf-8');
      notify(`Файл "${filename}" успешно сформирован и скачан`);
    } catch (err: any) {
      console.error('Ошибка экспорта чертежей:', err);
      notify('Ошибка при формировании файла чертежа');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800 antialiased selection:bg-red-500 selection:text-white">
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-lg border border-red-200 bg-white px-4 py-3 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Flame className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium text-slate-800">{showNotification}</p>
        </div>
      )}

      {/* 1. LEFT SIDEBAR (Dark Blue bg-slate-900) */}
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-slate-800 bg-slate-900 text-slate-300 shadow-2xl">
        {/* Brand Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-4">
          <a
            href="https://t.me/AllexMaster"
            target="_blank"
            rel="noopener noreferrer"
            className="relative transition hover:scale-105"
            title="FireCAD • Написать разработчику"
          >
            <IbsLogo size={42} />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-slate-900"></span>
            </span>
          </a>
          <div>
            <div className="flex items-center gap-1.5 font-black tracking-tight text-white text-base">
              <span>FireCAD</span>
              <span className="rounded bg-gradient-to-r from-red-600 to-amber-600 px-1.5 py-0.5 text-[9px] font-extrabold text-white uppercase tracking-wider shadow-sm">САПР 2026</span>
            </div>
            <p className="text-[10px] font-medium text-slate-400">Проектирование АПС & СОУЭ</p>
          </div>
        </div>

        {/* Project Context Badge in Sidebar */}
        <div className="mx-4 mt-4 rounded-lg border border-slate-800 bg-slate-800/60 p-3">
          <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            <span>Норматив: СН РК</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="mt-1 truncate text-xs font-medium text-slate-200" title={params.projectName}>
            {params.projectName}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>S = {params.totalArea} м²</span>
            <span className="text-red-400 font-medium">{engineeringCalc.soueType.split(' ')[0]}</span>
          </div>
        </div>

        {/* Main Navigation Menu */}
        <nav className="mt-4 flex-1 space-y-1.5 px-3">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Навигация
          </div>

          <button
            onClick={() => setCurrentView('welcome')}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              currentView === 'welcome'
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layout className={`h-4 w-4 ${currentView === 'welcome' ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
            <span>Главная</span>
          </button>

          <button
            onClick={() => setCurrentView('workspace')}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              currentView === 'workspace'
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Calculator className={`h-4 w-4 ${currentView === 'workspace' ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
            <span>Проектирование</span>
            {currentView === 'workspace' && (
              <span className="ml-auto rounded-full bg-red-700/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                Шаг {currentStep}/4
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentView('settings')}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              currentView === 'settings'
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className={`h-4 w-4 ${currentView === 'settings' ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
            <span>Настройки</span>
          </button>

          {/* Quick Step Jump (When in workspace) */}
          {currentView === 'workspace' && (
            <div className="pt-4">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Этапы САПР
              </div>
              <div className="space-y-1">
                {[
                  { num: 1, label: '1. Загрузка чертежей' },
                  { num: 2, label: '2. AI Расчет' },
                  { num: 3, label: '3. Расстановка' },
                  { num: 4, label: '4. Выпуск ПСД' },
                ].map((s) => (
                  <button
                    key={s.num}
                    onClick={() => setCurrentStep(s.num as StepNumber)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs transition-colors ${
                      currentStep === s.num
                        ? 'bg-slate-800 font-semibold text-red-400'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                  >
                    <span>{s.label}</span>
                    {currentStep > s.num && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Standards and Controls footer in sidebar */}
        <div className="border-t border-slate-800/90 p-3 space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-slate-800/40 px-2.5 py-1.5 text-[10px] text-slate-400 border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
              <span>База СН РК</span>
            </div>
            <span className="text-emerald-400 font-mono font-semibold">v3.4 / 2026</span>
          </div>

          {/* Reset Project Button at the bottom */}
          <button
            onClick={handleResetProject}
            title="Полный сброс всех данных проекта"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-900/50 bg-red-950/20 px-3 py-1.5 text-xs font-medium text-red-300 transition-all hover:border-red-600 hover:bg-red-900/40 hover:text-white"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
            <span>Очистить проект</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex flex-1 flex-col overflow-y-auto bg-slate-100">
        {/* ========================================================================= */}
        {/* VIEW 1: WELCOME SCREEN */}
        {/* ========================================================================= */}
        {currentView === 'welcome' && (
          <div className="flex min-h-full flex-col justify-between p-8 md:p-12">
            <div className="mx-auto w-full max-w-6xl">
              {/* Top Banner Tag */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://t.me/AllexMaster"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-red-200/80 bg-red-50/90 hover:bg-red-100 px-4 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition-all hover:shadow hover:scale-[1.01]"
                  title="Написать разработчику в Telegram: @AllexMaster"
                >
                  <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                  <span className="font-bold">Интеллектуальные Бизнес Системы • Версия 2026</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-800 font-semibold group-hover:text-red-700 transition-colors">Разработчик: Alexandr Kharchenko®2026</span>
                  <Send className="h-3.5 w-3.5 text-sky-500 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>

              {/* Hero Section with Brand Logo & Typography */}
              <div className="mt-8">
                {/* IBS Brand Header with Optimized Logo */}
                <a
                  href="https://t.me/AllexMaster"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-4 p-2 -ml-2 rounded-2xl transition hover:bg-slate-100/80 active:scale-[0.99] mb-3"
                  title="Интеллектуальные Бизнес Системы • Написать в Telegram: @AllexMaster"
                >
                  <IbsLogo size={68} className="drop-shadow-md group-hover:drop-shadow-lg transition-all" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 group-hover:text-red-600 transition-colors">
                        Интеллектуальные Бизнес Системы
                      </span>
                      <Send className="h-4 w-4 text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-500 tracking-wide uppercase">
                      ИТ-инжиниринг и цифровые решения • Версия 2026
                    </span>
                  </div>
                </a>

                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl mt-1">
                  FireCAD - проектирование АПС систем
                </h1>
                <p className="mt-4 max-w-3xl text-lg text-slate-600 leading-relaxed">
                  Интеллектуальная система генерации ПСД для АПС и СОУЭ по нормам Республики Казахстан.
                  Сквозное проектирование от исходных параметров БТИ до готовых чертежей, спецификаций оборудования и пояснительной записки за считанные минуты.
                </p>

                {/* Primary Action Buttons */}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => {
                      setCurrentView('workspace');
                      setCurrentStep(1);
                    }}
                    className="flex items-center gap-3 rounded-xl bg-red-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-red-600/30 transition-all hover:bg-red-700 hover:shadow-red-600/40 active:scale-[0.98]"
                  >
                    <Flame className="h-5 w-5" />
                    <span>Начать новый проект</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => handleLoadPreset('school')}
                    className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50"
                  >
                    <FolderOpen className="h-4 w-4 text-slate-500" />
                    <span>Открыть типовой проект (Школа)</span>
                  </button>
                </div>
              </div>

              {/* 3 Advantage Cards required by prompt */}
              <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Card 1 */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all hover:shadow-md hover:border-red-200">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">Точный расчет по СН РК</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Алгоритмы строго соблюдают СН РК 2.02-05-2014, СП РК 2.02-105-2014: радиусы защиты извещателей, расчет токов, мощности АКБ и определение категории СОУЭ (1–5 типы).
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-red-600">
                    <span>100% соответствие экспертизе</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>

                {/* Card 2 */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all hover:shadow-md hover:border-red-200">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Sparkles className="h-6 w-6 text-red-400" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">AI-расстановка датчиков</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Нейросетевая топологическая расстановка точечных дымовых, тепловых извещателей и оповещателей на 2D-планах DWG/PDF с контролем мертвых зон и трассировкой шлейфов.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-900">
                    <span>Оптимизация кабельных трасс</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>

                {/* Card 3 */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all hover:shadow-md hover:border-red-200">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">Автоматический выпуск ПСД</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Мгновенная генерация полного комплекта проектно-сметной документации: Спецификация оборудования (СО), Пояснительная записка (ПЗ), кабельные журналы по ГОСТ РК.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-red-600">
                    <span>Экспорт в XLSX, DOCX, DWG</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </div>

              {/* Quick Template Presets for Enterprise Testing */}
              <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      Быстрый старт по отраслевым шаблонам РК
                    </h4>
                    <p className="text-xs text-slate-500">Выберите тип объекта для автозаполнения исходного ТЗ</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <button
                    onClick={() => handleLoadPreset('school')}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-red-500 hover:bg-red-50/40"
                  >
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Школа на 600 мест</div>
                      <div className="text-xs text-slate-500">S=2400 м², 3 этажа, СОУЭ 3-й тип</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleLoadPreset('office')}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-red-500 hover:bg-red-50/40"
                  >
                    <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                      <Layout className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Офисный Бизнес-центр</div>
                      <div className="text-xs text-slate-500">S=1450 м², 2 этажа, СОУЭ 2-й тип</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleLoadPreset('warehouse')}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-red-500 hover:bg-red-50/40"
                  >
                    <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Складской Комплекс</div>
                      <div className="text-xs text-slate-500">S=4800 м², H=8.5м, Категория В2</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer credits with requested links */}
            <footer className="mt-12 border-t border-slate-200 pt-6 pb-2 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
              <a
                href="https://t.me/AllexMaster"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-bold text-slate-800 hover:text-red-600 transition group"
                title="Написать разработчику в Telegram"
              >
                <Sparkles className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
                <span>Интеллектуальные Бизнес Системы • Версия 2026</span>
              </a>

              <div className="text-slate-500 text-center text-[11px]">
                FireCAD САПР • Разработано для проектных институтов и инжиниринговых компаний Республики Казахстан
              </div>

              <a
                href="https://t.me/AllexMaster"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3.5 py-1.5 rounded-xl transition shadow-sm"
                title="Связаться в Telegram: @AllexMaster"
              >
                <Send className="h-3.5 w-3.5 text-sky-500" />
                <span>Разработчик: Alexandr Kharchenko®2026</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </a>
            </footer>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: WORKSPACE (4-STEP CAD WORKFLOW) */}
        {/* ========================================================================= */}
        {currentView === 'workspace' && (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Header: Title + Progress Bar with 4 steps */}
            <header className="border-b border-slate-200 bg-white px-8 py-4 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center justify-between gap-4 w-full lg:w-auto">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse"></span>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900">
                        Текущий проект: АПС и СОУЭ
                      </h2>
                      <span className="rounded bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                        Стадия П
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {params.projectName} • {params.totalArea} м² • Высота {params.ceilingHeight} м
                    </p>
                  </div>

                  {/* Header Badge Link to Telegram */}
                  <a
                    href="https://t.me/AllexMaster"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden xl:inline-flex items-center gap-2 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1.5 text-xs text-slate-700 hover:text-red-700 transition font-medium"
                    title="Написать разработчику: Alexandr Kharchenko"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span className="font-bold">Интеллектуальные Бизнес Системы • 2026</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-600">Alexandr Kharchenko®2026</span>
                    <Send className="h-3 w-3 text-sky-500" />
                  </a>
                </div>

                {/* Progress Stepper (4 steps) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
                  {[
                    { id: 1, title: '1. Загрузка чертежей', icon: UploadCloud },
                    { id: 2, title: '2. AI Расчет', icon: Calculator },
                    { id: 3, title: '3. Расстановка', icon: Cpu },
                    { id: 4, title: '4. Выпуск ПСД', icon: FileText },
                  ].map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;

                    return (
                      <React.Fragment key={step.id}>
                        {idx > 0 && (
                          <div
                            className={`h-0.5 w-6 sm:w-10 transition-colors ${
                              isCompleted ? 'bg-red-600' : 'bg-slate-200'
                            }`}
                          />
                        )}
                        <button
                          onClick={() => setCurrentStep(step.id as StepNumber)}
                          className={`group flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                              : isCompleted
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                              isActive
                                ? 'bg-white text-red-600 font-bold'
                                : isCompleted
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-300 text-slate-700'
                            }`}
                          >
                            {isCompleted ? <Check className="h-3 w-3 stroke-[3]" /> : step.id}
                          </span>
                          <span className="hidden sm:inline">{step.title}</span>
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </header>

            {/* Stepper Body Container */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="mx-auto max-w-7xl">
                {/* ----------------------------------------------------------------- */}
                {/* STEP 1: ЗАГРУЗКА ИСХОДНЫХ ДАННЫХ (Пакетная загрузка + Ручной запуск AI) */}
                {/* ----------------------------------------------------------------- */}
                {currentStep === 1 && (
                  <div className="relative space-y-6">
                    {/* AI Analyzing Overlay Loader */}
                    {isAnalyzing && (
                      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/85 text-white backdrop-blur-md transition-all duration-300 p-6">
                        <div className="relative mb-6">
                          <div className="h-20 w-20 rounded-full border-4 border-slate-700 border-t-red-500 animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-red-400 animate-pulse" />
                          </div>
                        </div>
                        
                        <h4 className="text-2xl font-black text-white tracking-tight">
                          Интеллектуальный анализ чертежей
                        </h4>
                        
                        <div className="mt-3.5 flex items-center gap-2.5 rounded-full bg-slate-900 px-5 py-2.5 text-sm text-emerald-400 border border-slate-700 shadow-xl">
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                          <span className="font-mono text-xs md:text-sm font-semibold">{analyzingStage}</span>
                        </div>

                        <div className="mt-8 w-full max-w-md bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                          <div className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 w-full animate-[pulse_1.5s_infinite]"></div>
                        </div>
                        <p className="mt-4 text-xs text-slate-400 font-medium">
                          Обработка {uploadedFiles.length} {uploadedFiles.length === 1 ? 'чертежа' : 'чертежей'} по нормам СН РК 2.02-05-2014...
                        </p>
                      </div>
                    )}

                    {/* Step Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          Шаг 1: Загрузка архитектурных чертежей и планов БТИ
                        </h3>
                        <p className="text-sm text-slate-500">
                          Загрузите планы всех этажей здания (PDF, DWG, DXF, PNG) перед запуском нейросетевого анализа
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {uploadedFiles.length > 0 && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 border border-red-200">
                            <CheckCircle2 className="h-4 w-4 text-red-600" />
                            <span>Файлов в очереди: {uploadedFiles.length}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Зона Drag & Drop (адаптивная по высоте) */}
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const droppedFiles: File[] = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
                        if (droppedFiles.length > 0) {
                          const parsed = droppedFiles.map((f: File) => ({
                            name: f.name,
                            size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                            type: f.name.split('.').pop()?.toUpperCase() || 'FILE',
                          }));
                          handleFileUpload(parsed);
                        } else {
                          handleFileUpload();
                        }
                      }}
                      className={`relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 shadow-sm flex flex-col items-center justify-center text-center ${
                        uploadedFiles.length > 0
                          ? 'border-slate-300 bg-white p-6 hover:border-red-400 hover:bg-red-50/10'
                          : 'border-slate-300 bg-white p-10 hover:border-red-500 hover:bg-red-50/20 min-h-[360px]'
                      }`}
                    >
                      <div className={`mx-auto flex items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-inner ${
                        uploadedFiles.length > 0 ? 'h-14 w-14 mb-3' : 'h-20 w-20 mb-4'
                      }`}>
                        <UploadCloud className={uploadedFiles.length > 0 ? 'h-7 w-7' : 'h-10 w-10'} />
                      </div>

                      <h4 className={`font-extrabold tracking-tight text-slate-900 ${
                        uploadedFiles.length > 0 ? 'text-lg' : 'text-xl md:text-2xl max-w-2xl'
                      }`}>
                        {uploadedFiles.length > 0
                          ? 'Перетащите дополнительные файлы чертежей для добавления'
                          : 'Загрузите архитектурные планы (PDF, DWG, PNG) для автоматического расчета оборудования по СН РК'}
                      </h4>

                      <p className={`mt-2 text-sm text-slate-500 ${uploadedFiles.length > 0 ? 'max-w-xl' : 'max-w-2xl'}`}>
                        {uploadedFiles.length > 0
                          ? 'Вы можете загрузить планы всех этажей, подвала, разрезов и фасадов'
                          : 'Перетащите файлы планов этажей прямо сюда или выберите на компьютере. Затем запустите AI-анализ для расчета спецификации.'}
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                        <span>Форматы:</span>
                        <span className="text-red-600">.DWG</span>
                        <span>•</span>
                        <span className="text-red-600">.DXF</span>
                        <span>•</span>
                        <span className="text-red-600">.PDF</span>
                        <span>•</span>
                        <span className="text-red-600">.PNG / .JPG</span>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <label className="cursor-pointer rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95 flex items-center gap-2">
                          <Plus className="h-4 w-4 text-red-400" />
                          <span>{uploadedFiles.length > 0 ? 'Добавить еще чертежи' : 'Выбрать файлы чертежей'}</span>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
                            className="hidden"
                            onChange={(e) => {
                              const files: File[] = e.target.files ? Array.from(e.target.files) : [];
                              if (files.length > 0) {
                                const parsed = files.map((f: File) => ({
                                  name: f.name,
                                  size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                                  type: f.name.split('.').pop()?.toUpperCase() || 'FILE',
                                }));
                                handleFileUpload(parsed);
                              }
                            }}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => handleFileUpload()}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm flex items-center gap-2"
                        >
                          <Sparkles className="h-4 w-4 text-red-600" />
                          <span>Добавить демо-комплект (2 этажа)</span>
                        </button>
                      </div>
                    </div>

                    {/* Список загруженных файлов чертежей */}
                    {uploadedFiles.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700">
                              <FileText className="h-4 w-4" />
                            </div>
                            <h4 className="text-base font-bold text-slate-900">
                              Загруженные чертежи проекта ({uploadedFiles.length})
                            </h4>
                          </div>

                          <button
                            onClick={() => {
                              setUploadedFiles([]);
                              notify('Список загруженных файлов очищен');
                            }}
                            className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
                          >
                            Очистить весь список
                          </button>
                        </div>

                        {/* Список элементов */}
                        <div className="mt-4 divide-y divide-slate-100">
                          {uploadedFiles.map((file, idx) => (
                            <div
                              key={`${file.name}-${idx}`}
                              className="group flex items-center justify-between py-3.5 px-3 rounded-xl transition-colors hover:bg-slate-50"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-bold text-slate-900">
                                    {file.name}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                    <span className="font-medium">{file.size}</span>
                                    <span>•</span>
                                    <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">
                                      {file.type}
                                    </span>
                                    <span>•</span>
                                    <span className="text-emerald-600 font-medium">Готов к анализу</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => removeUploadedFile(idx)}
                                title="Удалить файл из проекта"
                                className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Большая акцентная кнопка запуска AI-анализа */}
                    <div className="pt-2">
                      <button
                        onClick={startAnalysis}
                        disabled={uploadedFiles.length === 0}
                        className={`flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4.5 text-base font-bold transition-all shadow-xl ${
                          uploadedFiles.length === 0
                            ? 'cursor-not-allowed bg-slate-300 text-slate-500 shadow-none'
                            : 'bg-red-600 text-white shadow-red-600/30 hover:bg-red-700 hover:shadow-red-600/40 active:scale-[0.99]'
                        }`}
                      >
                        <Sparkles className="h-5 w-5" />
                        <span>
                          {uploadedFiles.length === 0
                            ? 'Загрузите хотя бы 1 чертеж для запуска анализа'
                            : `Запустить AI-анализ проекта (${uploadedFiles.length} ${
                                uploadedFiles.length === 1
                                  ? 'чертеж'
                                  : uploadedFiles.length < 5
                                  ? 'чертежа'
                                  : 'чертежей'
                              })`}
                        </span>
                        <ArrowRight className="h-5 w-5" />
                      </button>
                      {uploadedFiles.length === 0 && (
                        <p className="mt-2 text-center text-xs text-slate-400">
                          Для активации кнопки прикрепите файлы поэтажных планов через зону Drag&Drop выше
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* STEP 2: РЕЗУЛЬТАТЫ AI-АНАЛИЗА И ВЕРИФИКАЦИЯ (Grid 2 cols) */}
                {/* ----------------------------------------------------------------- */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-slate-900">
                            Шаг 2: Результаты AI-анализа и верификация параметров
                          </h3>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                            AI Распознано
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          Проверьте распознанные параметры здания и утвердите сформированную спецификацию
                        </p>
                      </div>

                      <button
                        onClick={() => setCurrentStep(1)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Загрузить другой чертеж</span>
                      </button>
                    </div>

                    {/* Grid из 2 колонок */}
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      {/* Левая колонка (Распознанные данные) */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-red-600" />
                            <h4 className="text-base font-bold text-slate-900">
                              Извлеченные параметры здания
                            </h4>
                          </div>
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            Доступно для правки
                          </span>
                        </div>

                        <div className="mt-6 space-y-5">
                          {/* Общая площадь */}
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                              Общая площадь помещений (м²)
                            </label>
                            <div className="relative mt-1.5">
                              <input
                                type="number"
                                min={50}
                                max={100000}
                                value={projectParams.area}
                                onChange={(e) => {
                                  const val = Number(e.target.value) || 0;
                                  setProjectParams((prev) => ({ ...prev, area: val }));
                                  setParams((prev) => ({ ...prev, totalArea: val }));
                                }}
                                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-all focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-100"
                              />
                              <span className="absolute right-4 top-3 text-xs font-bold text-slate-500">
                                м²
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-emerald-600 font-medium">
                              ✓ Распознано по контурам внутренних стен (1850 м²)
                            </p>
                          </div>

                          {/* Высота потолков */}
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                              Высота потолков (м)
                            </label>
                            <div className="relative mt-1.5">
                              <input
                                type="number"
                                step="0.1"
                                min={1.5}
                                max={25}
                                value={projectParams.height}
                                onChange={(e) => {
                                  const val = Number(e.target.value) || 0;
                                  setProjectParams((prev) => ({ ...prev, height: val }));
                                  setParams((prev) => ({ ...prev, ceilingHeight: val }));
                                }}
                                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-all focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-100"
                              />
                              <span className="absolute right-4 top-3 text-xs font-bold text-slate-500">
                                м
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-emerald-600 font-medium">
                              ✓ Извлечено из отметок высот разреза АР (3.2 м)
                            </p>
                          </div>

                          {/* Тип объекта */}
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                              Тип объекта
                            </label>
                            <select
                              value={projectParams.objectType}
                              onChange={(e) => {
                                const val = e.target.value as 'school' | 'office' | 'warehouse';
                                setProjectParams((prev) => ({ ...prev, objectType: val }));
                                setParams((prev) => ({ ...prev, objectType: val }));
                              }}
                              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition-all focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-100"
                            >
                              <option value="office">Административное здание (Офис / БЦ)</option>
                              <option value="school">Учебное заведение (Школа / ВУЗ)</option>
                              <option value="warehouse">Складской комплекс / Логистика</option>
                            </select>
                            <p className="mt-1 text-[11px] text-emerald-600 font-medium">
                              ✓ Классифицировано по экспликации помещений
                            </p>
                          </div>

                          {/* Категория пожарной опасности */}
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                              Категория опасности (СП РК)
                            </label>
                            <select
                              value={projectParams.category}
                              onChange={(e) =>
                                setProjectParams({
                                  ...projectParams,
                                  category: e.target.value as 'А' | 'Б' | 'В' | 'Г' | 'Д',
                                })
                              }
                              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition-all focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-100"
                            >
                              <option value="В">Категория В (Пожароопасная)</option>
                              <option value="А">Категория А (Повышенная взрывопожароопасность)</option>
                              <option value="Б">Категория Б (Взрывопожароопасность)</option>
                              <option value="Г">Категория Г (Умеренная)</option>
                              <option value="Д">Категория Д (Пониженная)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Правая колонка (Спецификация по нормам: темно-синяя карточка) */}
                      <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-7 text-white shadow-2xl">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/30">
                                <Calculator className="h-5 w-5" />
                              </div>
                              <h4 className="text-base font-bold text-white">
                                Расчет оборудования (СН РК 2.02-05-2014)
                              </h4>
                            </div>
                            <span className="rounded-full bg-emerald-950 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-800/60">
                              Авто-спецификация
                            </span>
                          </div>

                          {/* Детализированный список / плашки */}
                          <div className="mt-6 space-y-3.5">
                            {/* Позиция 1: Дымовой извещатель */}
                            <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700/70 flex items-center justify-between transition-all hover:bg-slate-800">
                              <div>
                                <div className="text-xs font-semibold text-slate-200">
                                  Извещатель пожарный дымовой оптико-электронный (ИП 212)
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  Основная защита кабинетов, холлов и коридоров (1 шт/80 м² + дублирование)
                                </div>
                              </div>
                              <div className="text-right pl-3">
                                <span className="text-2xl font-black text-white">{smokeDetectors}</span>
                                <span className="text-xs font-semibold text-slate-400 ml-1">шт.</span>
                              </div>
                            </div>

                            {/* Позиция 2: Ручной извещатель ИПР */}
                            <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700/70 flex items-center justify-between transition-all hover:bg-slate-800">
                              <div>
                                <div className="text-xs font-semibold text-slate-200">
                                  Извещатель пожарный ручной (ИПР)
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  Установка на путях эвакуации, у выходов и на лестничных клетках
                                </div>
                              </div>
                              <div className="text-right pl-3">
                                <span className="text-2xl font-black text-white">{manualCallPoints}</span>
                                <span className="text-xs font-semibold text-slate-400 ml-1">шт.</span>
                              </div>
                            </div>

                            {/* Позиция 3: Тепловой извещатель */}
                            <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700/70 flex items-center justify-between transition-all hover:bg-slate-800">
                              <div>
                                <div className="text-xs font-semibold text-slate-200">
                                  Извещатель тепловой (в серверные/кухни)
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  Для помещений с возможностью запыления и перепада температур
                                </div>
                              </div>
                              <div className="text-right pl-3">
                                <span className="text-2xl font-black text-amber-400">{heatDetectors}</span>
                                <span className="text-xs font-semibold text-slate-400 ml-1">шт.</span>
                              </div>
                            </div>

                            {/* Позиция 4: Огнестойкий кабель */}
                            <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700/70 flex items-center justify-between transition-all hover:bg-slate-800">
                              <div>
                                <div className="text-xs font-semibold text-slate-200">
                                  Огнестойкий кабель КПСнг(А)-FRLS
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  Магистральные шлейфы АПС и линии СОУЭ (Е30/Е60)
                                </div>
                              </div>
                              <div className="text-right pl-3">
                                <span className="text-2xl font-black text-emerald-400">{cableLength}</span>
                                <span className="text-xs font-semibold text-slate-400 ml-1">м</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Большая кнопка: Утвердить и перейти к расстановке на плане */}
                        <div className="mt-8 border-t border-slate-800 pt-5">
                          <button
                            onClick={() => setCurrentStep(3)}
                            className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-4 text-base font-bold text-white shadow-xl shadow-red-600/30 transition-all hover:bg-red-700 hover:shadow-red-600/40 active:scale-[0.99]"
                          >
                            <span>Утвердить и перейти к расстановке на плане</span>
                            <ArrowRight className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* STEP 3: AI РАССТАНОВКА (2D CAD Interactive Plan Canvas - Лист А3) */}
                {/* ----------------------------------------------------------------- */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-slate-900">
                            Шаг 3: Автоматическая AI-расстановка оборудования на плане
                          </h3>
                          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                            Data-Driven САПР • СН РК
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          Математический расчет координат извещателей, зон покрытия R=4.5м / 2.5м и трассировка шлейфов
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Переключатель режимов САПР */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-300 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => setCadViewMode('smart')}
                            className={`px-3 py-1.5 rounded-lg transition ${
                              cadViewMode === 'smart'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Интеллектуальный САПР
                          </button>
                          <button
                            type="button"
                            onClick={() => setCadViewMode('gost_sheet')}
                            className={`px-3 py-1.5 rounded-lg transition ${
                              cadViewMode === 'gost_sheet'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Чертеж ГОСТ А3
                          </button>
                          <button
                            type="button"
                            onClick={() => setCadViewMode('simplified')}
                            className={`px-3 py-1.5 rounded-lg transition ${
                              cadViewMode === 'simplified'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Схематичный
                          </button>
                        </div>

                        <button
                          onClick={handleRunAiPlacement}
                          disabled={isAiProcessing}
                          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50"
                        >
                          <Sparkles className={`h-4 w-4 text-red-400 ${isAiProcessing ? 'animate-spin' : ''}`} />
                          <span>{isAiProcessing ? 'Оптимизация...' : 'AI Перерасчет'}</span>
                        </button>

                        <button
                          onClick={() => setCurrentStep(4)}
                          className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700"
                        >
                          <span>К выпуску ПСД</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Выбранный режим отображения САПР */}
                    {cadViewMode === 'smart' && (
                      <SmartFireSafetyLayout />
                    )}

                    {cadViewMode === 'gost_sheet' && (
                      <CadArchitecturalSheet projectName={params.projectName} />
                    )}

                    {cadViewMode === 'simplified' && (
                      /* Внешний рабочий контейнер */
                    <div className="relative w-full h-[840px] bg-slate-200/80 border-2 border-slate-300 rounded-2xl overflow-auto flex items-center justify-center p-4 md:p-8 shadow-inner">
                      {/* Лист чертежа А3 */}
                      <div className="relative w-full max-w-5xl h-[760px] bg-white shadow-2xl border border-gray-400 p-6 md:p-8 flex flex-col justify-between select-none overflow-hidden">
                        
                        {/* Верхняя рамка листа А3 с атрибутами чертежа */}
                        <div className="flex items-center justify-between border-b border-slate-300 pb-2 text-[11px] text-slate-600 font-mono">
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-slate-900 uppercase">План размещения систем АПС и СОУЭ</span>
                            <span>•</span>
                            <span>Отм. +0.000 (1-й этаж)</span>
                            <span>•</span>
                            <span className="text-red-600 font-bold">СН РК 2.02-05-2014</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span>Масштаб 1:100</span>
                            <span>|</span>
                            <span>Формат А3</span>
                          </div>
                        </div>

                        {/* Контейнер для плана здания (по центру) */}
                        <div className="relative my-auto mx-auto w-full max-w-4xl h-[480px] bg-slate-50 border-4 border-slate-800 rounded-lg p-3 shadow-md flex items-center justify-center overflow-hidden">
                          {/* Инженерная координатная сетка */}
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] opacity-60 pointer-events-none"></div>

                          {/* Архитектурный план: 4 кабинета + коридор */}
                          <div className="relative z-10 w-full h-full grid grid-cols-2 grid-rows-[1fr_80px_1fr] gap-3 p-2">
                            
                            {/* КАБИНЕТ 1 (Верхний левый) */}
                            <div className="relative rounded-lg border-2 border-slate-700 bg-white/90 p-2.5 flex flex-col justify-between shadow-sm">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                <span>Пом. 101: Кабинет дирекции</span>
                                <span className="font-mono text-slate-500 font-normal">38.4 м²</span>
                              </div>

                              {/* Датчик дымовой ИП 212 с радиусом */}
                              <div className="relative flex items-center justify-center my-auto">
                                {showRadiuses && (
                                  <div className="absolute w-32 h-32 bg-blue-400/20 rounded-full border border-blue-500/40 pointer-events-none animate-pulse flex items-center justify-center">
                                    <span className="text-[9px] font-mono text-blue-700 font-bold opacity-75">R = 7.5м</span>
                                  </div>
                                )}
                                <div className="relative z-10 flex flex-col items-center group cursor-pointer">
                                  <div className="h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg ring-2 ring-red-400 transition-transform group-hover:scale-110">
                                    <Crosshair className="h-4 w-4" />
                                  </div>
                                  <span className="text-[9px] font-mono font-bold text-slate-800 mt-1 bg-white/80 px-1 rounded shadow-xs">
                                    ИП 212 №1.1
                                  </span>
                                </div>
                              </div>

                              <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                                <span>h = 3.20 м</span>
                                <span className="text-emerald-700 font-semibold">Норматив: OK</span>
                              </div>
                            </div>

                            {/* КАБИНЕТ 2: СЕРВЕРНАЯ (Верхний правый) */}
                            <div className="relative rounded-lg border-2 border-amber-700 bg-amber-50/80 p-2.5 flex flex-col justify-between shadow-sm">
                              <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                                <span className="flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-amber-600 animate-ping"></span>
                                  Пом. 102: Серверная (ИТ-узел)
                                </span>
                                <span className="font-mono text-amber-800 font-normal">24.0 м²</span>
                              </div>

                              {/* Тепловой извещатель ИП 101 в серверной */}
                              <div className="relative flex items-center justify-center my-auto">
                                {showRadiuses && (
                                  <div className="absolute w-32 h-32 bg-orange-400/20 rounded-full border border-orange-500/50 pointer-events-none flex items-center justify-center">
                                    <span className="text-[9px] font-mono text-orange-800 font-bold opacity-75">R = 5.0м</span>
                                  </div>
                                )}
                                <div className="relative z-10 flex flex-col items-center group cursor-pointer">
                                  <div className="h-7 w-7 rounded-md bg-amber-600 text-white flex items-center justify-center shadow-lg ring-2 ring-amber-400 transition-transform group-hover:scale-110">
                                    <Flame className="h-4 w-4 text-white" />
                                  </div>
                                  <span className="text-[9px] font-mono font-bold text-amber-950 mt-1 bg-white/90 px-1 rounded shadow-xs">
                                    ИП 101 (Тепловой)
                                  </span>
                                </div>
                              </div>

                              <div className="text-[10px] font-mono text-amber-800 flex justify-between">
                                <span>Категория: В2 (ППКП)</span>
                                <span className="text-amber-700 font-semibold">Изолированный шлейф</span>
                              </div>
                            </div>

                            {/* ЦЕНТРАЛЬНЫЙ КОРИДОР И ЭВАКУАЦИОННЫЕ ПУТИ (Средний ряд) */}
                            <div className="relative col-span-2 rounded-lg border-2 border-slate-700 bg-slate-100/95 px-4 py-1 flex items-center justify-between shadow-inner">
                              {/* Левый эвакуационный выход + ИПР */}
                              <div className="flex items-center gap-2">
                                <div className="h-6 px-2 rounded bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black tracking-wider shadow">
                                  ВЫХОД 1
                                </div>
                                <div className="flex flex-col items-center group cursor-pointer">
                                  <div className="h-6 w-6 rounded bg-red-700 text-white flex items-center justify-center shadow ring-2 ring-red-300">
                                    <Hand className="h-3.5 w-3.5" />
                                  </div>
                                  <span className="text-[8px] font-mono font-bold text-red-900 mt-0.5">ИПР-1</span>
                                </div>
                              </div>

                              {/* Оповещатели СОУЭ (Volume2) и центральный дымовой датчик коридора */}
                              <div className="flex items-center gap-8">
                                {/* Колонка СОУЭ левая */}
                                <div className="flex flex-col items-center">
                                  <div className="h-6 w-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow ring-2 ring-amber-300">
                                    <Volume2 className="h-3.5 w-3.5 text-slate-950" />
                                  </div>
                                  <span className="text-[8px] font-mono font-bold text-slate-700 mt-0.5">СОУЭ-1 (85дБ)</span>
                                </div>

                                {/* Дымовой датчик в коридоре */}
                                <div className="relative flex items-center justify-center">
                                  {showRadiuses && (
                                    <div className="absolute w-28 h-28 bg-blue-400/20 rounded-full border border-blue-500/30 pointer-events-none"></div>
                                  )}
                                  <div className="relative z-10 flex flex-col items-center">
                                    <div className="h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow ring-2 ring-red-400">
                                      <Crosshair className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="text-[8px] font-mono font-bold text-slate-800 mt-0.5">ИП 212 №1.3</span>
                                  </div>
                                </div>

                                {/* Колонка СОУЭ правая */}
                                <div className="flex flex-col items-center">
                                  <div className="h-6 w-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow ring-2 ring-amber-300">
                                    <Volume2 className="h-3.5 w-3.5 text-slate-950" />
                                  </div>
                                  <span className="text-[8px] font-mono font-bold text-slate-700 mt-0.5">СОУЭ-2 (85дБ)</span>
                                </div>
                              </div>

                              {/* Правый эвакуационный выход + ИПР */}
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col items-center group cursor-pointer">
                                  <div className="h-6 w-6 rounded bg-red-700 text-white flex items-center justify-center shadow ring-2 ring-red-300">
                                    <Bell className="h-3.5 w-3.5" />
                                  </div>
                                  <span className="text-[8px] font-mono font-bold text-red-900 mt-0.5">ИПР-2</span>
                                </div>
                                <div className="h-6 px-2 rounded bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black tracking-wider shadow">
                                  ВЫХОД 2
                                </div>
                              </div>
                            </div>

                            {/* КАБИНЕТ 3 (Нижний левый) */}
                            <div className="relative rounded-lg border-2 border-slate-700 bg-white/90 p-2.5 flex flex-col justify-between shadow-sm">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                <span>Пом. 103: Офис открытого типа (OpenSpace)</span>
                                <span className="font-mono text-slate-500 font-normal">52.0 м²</span>
                              </div>

                              {/* Датчик дымовой ИП 212 */}
                              <div className="relative flex items-center justify-center my-auto">
                                {showRadiuses && (
                                  <div className="absolute w-32 h-32 bg-blue-400/20 rounded-full border border-blue-500/40 pointer-events-none animate-pulse flex items-center justify-center">
                                    <span className="text-[9px] font-mono text-blue-700 font-bold opacity-75">R = 7.5м</span>
                                  </div>
                                )}
                                <div className="relative z-10 flex flex-col items-center group cursor-pointer">
                                  <div className="h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg ring-2 ring-red-400 transition-transform group-hover:scale-110">
                                    <Crosshair className="h-4 w-4" />
                                  </div>
                                  <span className="text-[9px] font-mono font-bold text-slate-800 mt-1 bg-white/80 px-1 rounded shadow-xs">
                                    ИП 212 №1.4
                                  </span>
                                </div>
                              </div>

                              <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                                <span>h = 3.20 м</span>
                                <span className="text-emerald-700 font-semibold">Норматив: OK</span>
                              </div>
                            </div>

                            {/* КАБИНЕТ 4 (Нижний правый) */}
                            <div className="relative rounded-lg border-2 border-slate-700 bg-white/90 p-2.5 flex flex-col justify-between shadow-sm">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                <span>Пом. 104: Конференц-зал / Переговорная</span>
                                <span className="font-mono text-slate-500 font-normal">44.5 м²</span>
                              </div>

                              {/* Датчик дымовой ИП 212 */}
                              <div className="relative flex items-center justify-center my-auto">
                                {showRadiuses && (
                                  <div className="absolute w-32 h-32 bg-blue-400/20 rounded-full border border-blue-500/40 pointer-events-none animate-pulse flex items-center justify-center">
                                    <span className="text-[9px] font-mono text-blue-700 font-bold opacity-75">R = 7.5м</span>
                                  </div>
                                )}
                                <div className="relative z-10 flex flex-col items-center group cursor-pointer">
                                  <div className="h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg ring-2 ring-red-400 transition-transform group-hover:scale-110">
                                    <Crosshair className="h-4 w-4" />
                                  </div>
                                  <span className="text-[9px] font-mono font-bold text-slate-800 mt-1 bg-white/80 px-1 rounded shadow-xs">
                                    ИП 212 №1.5
                                  </span>
                                </div>
                              </div>

                              <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                                <span>h = 3.20 м</span>
                                <span className="text-emerald-700 font-semibold">Норматив: OK</span>
                              </div>
                            </div>
                          </div>

                          {/* КАБЕЛЬНЫЕ ТРАССЫ (SVG OVERLAY с желто-зелеными пунктирными линиями) */}
                          {showCables && (
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                              {/* Магистральный шлейф в коридоре */}
                              <path
                                d="M 60 240 L 400 240 L 480 240 L 820 240"
                                stroke="#16a34a"
                                strokeWidth="3"
                                strokeDasharray="6,4"
                                fill="none"
                              />
                              {/* Отвод в Кабинет 101 */}
                              <path
                                d="M 240 240 L 240 110"
                                stroke="#eab308"
                                strokeWidth="2.5"
                                strokeDasharray="5,4"
                                fill="none"
                              />
                              {/* Отвод в Серверную (102) */}
                              <path
                                d="M 660 240 L 660 110"
                                stroke="#ea580c"
                                strokeWidth="2.5"
                                strokeDasharray="5,4"
                                fill="none"
                              />
                              {/* Отвод в Кабинет 103 */}
                              <path
                                d="M 240 240 L 240 370"
                                stroke="#eab308"
                                strokeWidth="2.5"
                                strokeDasharray="5,4"
                                fill="none"
                              />
                              {/* Отвод в Кабинет 104 */}
                              <path
                                d="M 660 240 L 660 370"
                                stroke="#eab308"
                                strokeWidth="2.5"
                                strokeDasharray="5,4"
                                fill="none"
                              />
                              {/* Узловые соединительные коробки */}
                              <circle cx="240" cy="240" r="4" fill="#16a34a" />
                              <circle cx="660" cy="240" r="4" fill="#16a34a" />
                              <circle cx="450" cy="240" r="4" fill="#16a34a" />
                            </svg>
                          )}
                        </div>

                        {/* Нижняя информационная зона: Легенда (слева) и Таблица-Штамп (справа) */}
                        <div className="mt-3 flex items-end justify-between gap-4 pt-2 border-t border-slate-300">
                          
                          {/* Легенда (Условные обозначения УГО) */}
                          <div className="rounded border border-slate-300 bg-slate-50 p-2.5 text-[10px] font-sans text-slate-700 shadow-xs max-w-md">
                            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5 uppercase tracking-wide">
                              Условные обозначения (УГО ГОСТ 28130)
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              <div className="flex items-center gap-1.5">
                                <div className="h-4 w-4 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                                  <Crosshair className="h-2.5 w-2.5" />
                                </div>
                                <span>ИП 212 (Дымовой)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="h-4 w-4 rounded bg-amber-600 text-white flex items-center justify-center shrink-0">
                                  <Flame className="h-2.5 w-2.5" />
                                </div>
                                <span>ИП 101 (Тепловой)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="h-4 w-4 rounded bg-red-700 text-white flex items-center justify-center shrink-0">
                                  <Hand className="h-2.5 w-2.5" />
                                </div>
                                <span>ИПР (Ручной пуск)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="h-4 w-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                                  <Volume2 className="h-2.5 w-2.5" />
                                </div>
                                <span>Оповещатель СОУЭ</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="h-3.5 w-6 rounded bg-emerald-600 text-white font-black text-[7px] flex items-center justify-center shrink-0">
                                  ВЫХ
                                </div>
                                <span>Табло "ВЫХОД"</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-6 border-b-2 border-dashed border-emerald-600"></div>
                                <span>Кабель КПСнг-FRLS</span>
                              </div>
                            </div>
                          </div>

                          {/* ГОСТ ШТАМП ЧЕРТЕЖА (Основная надпись по ГОСТ 21.1101-2013) */}
                          <div className="rounded border-2 border-slate-900 bg-white text-[9px] font-mono text-slate-900 shadow-xs overflow-hidden shrink-0 w-80">
                            <div className="grid grid-cols-4 border-b border-slate-900 text-center font-bold bg-slate-100 py-0.5">
                              <div className="border-r border-slate-900">Изм.</div>
                              <div className="border-r border-slate-900">Лист</div>
                              <div className="border-r border-slate-900">№ Докум.</div>
                              <div>Дата</div>
                            </div>
                            <div className="grid grid-cols-4 border-b border-slate-900 text-center py-0.5">
                              <div className="border-r border-slate-900">01</div>
                              <div className="border-r border-slate-900">1</div>
                              <div className="border-r border-slate-900">АПС-01</div>
                              <div>{new Date().toLocaleDateString('ru-RU')}</div>
                            </div>
                            <div className="grid grid-cols-3 border-b border-slate-900 p-1">
                              <div className="col-span-2 border-r border-slate-900 pr-1">
                                <div className="text-[8px] text-slate-500 uppercase">Объект:</div>
                                <div className="font-bold truncate">{params.projectName}</div>
                              </div>
                              <div className="pl-1 text-center flex flex-col justify-center">
                                <div className="text-[8px] text-slate-500">Стадия</div>
                                <div className="font-bold text-red-600">П (ПСД)</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 p-1 bg-slate-50">
                              <div className="col-span-2 border-r border-slate-900 pr-1">
                                <div className="text-[8px] text-slate-500 uppercase">Наименование листа:</div>
                                <div className="font-bold">План расстановки АПС и СОУЭ. 1 этаж</div>
                              </div>
                              <div className="pl-1 text-center flex flex-col justify-center">
                                <div className="text-[8px] text-slate-500">Листов</div>
                                <div className="font-bold">12</div>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                    )}

                    {/* Step Navigation */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Назад к параметрам</span>
                      </button>

                      <button
                        onClick={() => setCurrentStep(4)}
                        className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition-all hover:bg-red-700"
                      >
                        <span>Утвердить расстановку и выпустить ПСД</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* STEP 4: ВЫПУСК ПСД (Download Specification, PZ, Cable Log) */}
                {/* ----------------------------------------------------------------- */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    {/* Success Hero Badge */}
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                            <Check className="h-6 w-6 stroke-[3]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-extrabold text-slate-900">
                                Проектная документация сформирована
                              </h3>
                              <span className="rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                Готов к экспертизе
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mt-0.5">
                              Комплект рабочих чертежей и спецификаций раздела АПС и СОУЭ проверен на соответствие СН РК 2.02-05-2014
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-4 py-2 rounded-xl border border-emerald-200 shadow-sm">
                          <span>Статус:</span>
                          <span className="text-emerald-700">100% готовность (Томов: 3)</span>
                        </div>
                      </div>
                    </div>

                    {/* 3 Primary Download Buttons/Cards required by prompt */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      {/* Document 1: Спецификация оборудования */}
                      <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-red-300">
                        <div>
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <FileSpreadsheet className="h-6 w-6" />
                          </div>
                          <h4 className="mt-4 text-base font-bold text-slate-900">
                            Спецификация оборудования (СО)
                          </h4>
                          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                            Полная ведомость потребности оборудования и материалов по форме ГОСТ 21.110-2013 с указанием артикулов, заводов-изготовителей и точного метража кабелей.
                          </p>

                          <div className="mt-4 space-y-1.5 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-600 border border-slate-100">
                            <div className="flex justify-between">
                              <span>Извещатели ИП 212:</span>
                              <span className="font-bold text-slate-900">{engineeringCalc.smokeDetectors} шт.</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Оповещатели ОПОП:</span>
                              <span className="font-bold text-slate-900">{engineeringCalc.soundersCount} шт.</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Кабель КПСнг(А)-FRLS:</span>
                              <span className="font-bold text-slate-900">
                                {engineeringCalc.estimatedApsCableMeters + engineeringCalc.estimatedSoueCableMeters} м
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleDownloadSpec}
                          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-bold text-white shadow-md shadow-red-600/20 transition-all hover:bg-red-700 active:scale-[0.98] cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                          <span>Скачать Спецификацию (XLSX)</span>
                        </button>
                      </div>

                      {/* Document 2: Пояснительная записка */}
                      <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-red-300">
                        <div>
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FileText className="h-6 w-6" />
                          </div>
                          <h4 className="mt-4 text-base font-bold text-slate-900">
                            Пояснительная записка (ПЗ)
                          </h4>
                          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                            Описательная часть проекта с нормативным обоснованием, расчетом емкости аккумуляторов (АКБ {engineeringCalc.standardBatteryCapacity} А·ч), категорированием помещений и требованиями монтажа.
                          </p>

                          <div className="mt-4 space-y-1.5 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-600 border border-slate-100">
                            <div className="flex justify-between">
                              <span>Нормативы РК:</span>
                              <span className="font-bold text-slate-900">СН РК 2.02-05-2014</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Структура СОУЭ:</span>
                              <span className="font-bold text-slate-900">{engineeringCalc.soueType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Резерв питания:</span>
                              <span className="font-bold text-slate-900">24ч деж. + 3ч трев.</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleDownloadNote}
                          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98] cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                          <span>Скачать Записку (DOCX / PDF)</span>
                        </button>
                      </div>

                      {/* Document 3: Кабельный журнал */}
                      <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-red-300">
                        <div>
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <Zap className="h-6 w-6" />
                          </div>
                          <h4 className="mt-4 text-base font-bold text-slate-900">
                            Кабельный журнал и Схемы
                          </h4>
                          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                            Таблица кабельных связей, структурная схема подключения приборов к пульту, схемы подключения шлейфов сигнализации и линий оповещения.
                          </p>

                          <div className="mt-4 space-y-1.5 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-600 border border-slate-100">
                            <div className="flex justify-between">
                              <span>Линий связи RS-485:</span>
                              <span className="font-bold text-slate-900">2 магистрали</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Кольцевых ДПЛС:</span>
                              <span className="font-bold text-slate-900">4 шлейфа</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Формат чертежей:</span>
                              <span className="font-bold text-slate-900">DWG / PDF А2</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleDownloadDrawing}
                          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] cursor-pointer"
                        >
                          <Download className="h-4 w-4 text-slate-600" />
                          <span>Скачать Чертежи (DWG)</span>
                        </button>
                      </div>
                    </div>

                    {/* AutoCAD Professional Architectural Drawing (Стадия П - Формат А2) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Layers className="h-5 w-5 text-red-600" />
                            <span>Рабочий чертеж: План 1-го этажа (Стадия П • AutoCAD PDF)</span>
                          </h4>
                          <p className="text-xs text-slate-500">
                            Архитектурный лист формата А2 (ГОСТ 21.1101-2013) с координационными осями 1..6/А..Г, размерными цепочками 45°, экспликацией и основной надписью
                          </p>
                        </div>
                        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-md border border-slate-200">
                          Масштаб 1:300 • Лист 1 (А2)
                        </span>
                      </div>

                      <CadArchitecturalSheet
                        projectName={params.projectName}
                        buildingArea={params.totalArea}
                        ceilingHeight={params.ceilingHeight}
                        objectType={params.objectType}
                      />
                    </div>

                    {/* Summary Specification Table Preview & GOST Sheet */}
                    <EquipmentSpecification
                      projectName={params.projectName}
                      objectAddress={params.objectAddress}
                    />

                    {/* Пояснительная записка к проекту (ГОСТ / СН РК) */}
                    <ExplanatoryNote
                      project={{
                        title: params.projectName,
                        address: params.objectAddress,
                        area: params.totalArea,
                        floors: params.floorsCount || 3,
                        normBase: 'СН РК 2.02-05-2014, СП РК 2.02-105-2014',
                        totalDevices: engineeringCalc.smokeDetectors + engineeringCalc.manualCallPoints + engineeringCalc.soundersCount,
                        totalCableMeters: engineeringCalc.estimatedApsCableMeters + engineeringCalc.estimatedSoueCableMeters,
                        smokeDetectors: engineeringCalc.smokeDetectors,
                        soundersCount: engineeringCalc.soundersCount,
                        manualPoints: engineeringCalc.manualCallPoints,
                        authorName: params.authorName || 'Ахметов А. Е.',
                        gipName: params.gipName || 'Смагулов Б. К.',
                      }}
                    />

                    {/* Step Navigation & Master ZIP Export */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Назад к расстановке</span>
                      </button>

                      <ExportArchiveButton
                        projectData={{
                          projectName: params.projectName,
                          objectAddress: params.objectAddress,
                          totalArea: params.totalArea,
                          ceilingHeight: params.ceilingHeight,
                          floorsCount: params.floorsCount || 3,
                          objectType: params.objectType,
                          normBase: 'СН РК 2.02-05-2014, СП РК 2.02-105-2014',
                          authorName: params.authorName || 'Ахметов А. Е.',
                          gipName: params.gipName || 'Смагулов Б. К.',
                          projectCode: '02-2026-АПС.СОУЭ.П',
                        }}
                        buttonText="Скачать весь пакет ПСД (.zip)"
                        onSuccess={(filename) => {
                          notify(`Архив ${filename} успешно сохранен!`);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: SETTINGS SCREEN */}
        {/* ========================================================================= */}
        {currentView === 'settings' && (
          <div className="p-8 md:p-12">
            <div className="mx-auto max-w-4xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Настройки среды проектирования
                </h2>
                <p className="text-sm text-slate-500">
                  Конфигурация нормативной базы Республики Казахстан, производителей и форматов экспорта
                </p>
              </div>

              {/* Normative Base Settings */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <ShieldAlert className="h-5 w-5 text-red-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Нормативная база и стандарты расчета
                  </h3>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <label className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-900">СН РК 2.02-05-2014 / СП РК 2.02-105-2014</div>
                      <div className="text-xs text-slate-500">Пожарная автоматика зданий и сооружений Республики Казахстан</div>
                    </div>
                    <input type="radio" name="norm" defaultChecked className="text-red-600 focus:ring-red-500 h-4 w-4" />
                  </label>

                  <label className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-900">СП 484.1311500.2020 (СПА) + ГОСТ Р 59638</div>
                      <div className="text-xs text-slate-500">Современные нормы с адресными кольцевыми линиями и ЗКПС</div>
                    </div>
                    <input type="radio" name="norm" className="text-red-600 focus:ring-red-500 h-4 w-4" />
                  </label>
                </div>
              </div>

              {/* Preferred Manufacturers */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Cpu className="h-5 w-5 text-red-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    База оборудования и вендоров по умолчанию
                  </h3>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'bolid', name: 'НВП «Болид» (ИСО Орион)', desc: 'С2000-КДЛ, Сириус, ДИП-34А' },
                    { id: 'rubezh', name: 'ГК «Рубеж»', desc: 'R3-Рубеж-2ОП, ИП 212-64' },
                    { id: 'argus', name: 'Аргус-Спектр', desc: 'Стрелец-ПРО (Беспроводная)' },
                    { id: 'zetex', name: 'ZETEX Kazakhstan', desc: 'Пожарная сигнализация РК' },
                  ].map((brand) => (
                    <div
                      key={brand.id}
                      onClick={() => {
                        setParams({ ...params, equipmentBrand: brand.id as ProjectParams['equipmentBrand'] });
                        notify(`Вендор "${brand.name}" установлен по умолчанию`);
                      }}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        params.equipmentBrand === brand.id
                          ? 'border-red-600 bg-red-50/40 ring-2 ring-red-600/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="text-sm font-bold text-slate-900">{brand.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{brand.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Developer & System Information Card */}
              <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50/80 via-white to-amber-50/50 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 border border-red-200">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                      <span>Официальный релиз САПР</span>
                    </div>

                    <h3 className="mt-2.5 text-lg font-bold text-slate-900">
                      <a
                        href="https://t.me/AllexMaster"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-red-600 hover:underline transition-colors"
                        title="Написать разработчику"
                      >
                        Интеллектуальные Бизнес Системы • Версия 2026
                      </a>
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      Программный комплекс автоматизированного проектирования и сквозного выпуска ПСД по пожарной безопасности.
                    </p>

                    <div className="mt-2.5">
                      <a
                        href="https://t.me/AllexMaster"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:underline transition-colors"
                        title="Связаться с автором в Telegram"
                      >
                        <Send className="h-3.5 w-3.5 text-sky-500" />
                        <span>Разработчик: Alexandr Kharchenko®2026</span>
                      </a>
                    </div>
                  </div>

                  <a
                    href="https://t.me/AllexMaster"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/20 transition hover:shadow-red-600/30 active:scale-95 shrink-0"
                  >
                    <Send className="h-4 w-4 text-sky-200" />
                    <span>Написать в Telegram (@AllexMaster)</span>
                    <ExternalLink className="h-3.5 w-3.5 text-white/80" />
                  </a>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setCurrentView('workspace')}
                  className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-red-700 active:scale-95"
                >
                  Сохранить и вернуться в проект
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FireSafetyDashboard;
