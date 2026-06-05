/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Globe, 
  AlertTriangle, 
  Thermometer, 
  Radio, 
  ArrowRight, 
  ShieldCheck, 
  Wind, 
  Layers, 
  Activity, 
  Zap, 
  Flame, 
  Waves,
  RefreshCw,
  Info,
  Sliders,
  Compass
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ReferenceLine,
  Label
} from "recharts";

interface RegionInfo {
  id: string;
  name: string;
  engName: string;
  zone: 'polar' | 'temperate' | 'tropical';
  latitude: string; // e.g., "75°N"
  ampFactor: number; // Amplification factor relative to global anomaly
  coords: { x: string; y: string }; // Position in % on the flat widescreen map
  desc: string;
  impact: string;
  baseline1850: number; // Historical anomaly
  baseline2026: number; // Modern anomaly
}

const generateRegionalHistory = (region: RegionInfo, projected2100Val: number) => {
  const b1850 = region.baseline1850;
  const b2026 = region.baseline2026;
  const proj2100 = projected2100Val;

  return [
    { year: "1850", anomaly: b1850, risk: 2, label: "工業革命初期" },
    { year: "1900", anomaly: Number((b1850 + (b2026 - b1850) * 0.12).toFixed(2)), risk: 8, label: "煤炭工業擴張" },
    { year: "1950", anomaly: Number((b1850 + (b2026 - b1850) * 0.28).toFixed(2)), risk: 18, label: "戰後重建與重工業重啟" },
    { year: "1990", anomaly: Number((b1850 + (b2026 - b1850) * 0.58).toFixed(2)), risk: 42, label: "首個 IPCC 報告發布" },
    { year: "2010", anomaly: Number((b1850 + (b2026 - b1850) * 0.82).toFixed(2)), risk: 65, label: "極限極端天氣頻發" },
    { year: "2026", anomaly: b2026, risk: 82, label: "現代實際衛星觀測期" },
    { year: "2050", anomaly: Number((b2026 + (proj2100 - b2026) * 0.38).toFixed(2)), risk: Math.max(100, Math.round(82 + (proj2100 > b2026 ? 12 : -15))), label: "亞太極地減碳關鍵年" },
    { year: "2075", anomaly: Number((b2026 + (proj2100 - b2026) * 0.75).toFixed(2)), risk: Math.max(100, Math.round(82 + (proj2100 > b2026 ? 24 : -28))), label: "本世紀後半葉暖化關鍵期" },
    { year: "2100", anomaly: proj2100, risk: Math.min(100, Math.round(82 + (proj2100 > b2026 ? 35 : -40))), label: "聯合國 IPCC 增溫大限" },
  ];
};

// Coordinate mappings optimized for the flat Mercator/Equirectangular widescreen world map (0% - 100% dimensions)
const REGIONS_DATA: RegionInfo[] = [
  {
    id: "arctic",
    name: "北極極地放大區",
    engName: "Arctic Amplification Zone",
    zone: "polar",
    latitude: "80°N",
    ampFactor: 2.6,
    coords: { x: "47%", y: "15%" }, // Greenland/Svalbard area
    desc: "北極圈暖化速度高居全球之冠，即「極地放大效應」。隨著反照率極高的海冰消融，深色海洋大量吸收太陽輻射，使增溫形成自我強化的正反饋循環。",
    impact: "引發夏季北極無冰、釋放海底天然氣水合物、使北極渦旋不穩定並引致中緯度極端極寒與熱浪天候。",
    baseline1850: 0.1,
    baseline2026: 2.9
  },
  {
    id: "siberia",
    name: "西伯利亞與北亞陸塊",
    engName: "Siberia & North Asia",
    zone: "temperate",
    latitude: "60°N",
    ampFactor: 1.5,
    coords: { x: "74%", y: "24%" }, // Siberia region
    desc: "高緯度超大內陸版塊。陸地升溫速率約為海洋的兩倍，在此處因永凍土地表阻絕效應，導致地表與對流層下層累積異常熱能。",
    impact: "導致極古老永凍土層加速解凍，釋放巨量被封存的二氧化碳與二次甲烷（CH₄），引爆失控的高強度暖化回饋路徑。",
    baseline1850: 0.05,
    baseline2026: 1.85
  },
  {
    id: "europe",
    name: "歐洲與地中海表層",
    engName: "Europe & Mediterranean",
    zone: "temperate",
    latitude: "45°N",
    ampFactor: 1.4,
    coords: { x: "53%", y: "32%" }, // Mediterranean area
    desc: "歐洲暖化和熱浪強度比全球陸面高出近 40%。北大西洋暖流變異與副熱帶高壓向北擴張雙重擠壓，令歐陸地盤極乾旱缺水。",
    impact: "地中海沿岸森林野火常態化、雪線急遽退縮、阿爾卑斯冰川崩落，以及關鍵精緻農業與夏季水資源供水赤字。",
    baseline1850: 0.08,
    baseline2026: 1.62
  },
  {
    id: "northamerica",
    name: "北美陸表極端區",
    engName: "North American Continental",
    zone: "temperate",
    latitude: "40°N",
    ampFactor: 1.2,
    coords: { x: "22%", y: "30%" }, // Central North America
    desc: "北美版塊深受北極冷渦南下與墨西哥灣暖低壓交織影響。大氣急流（Jet Stream）蛇行化頻繁觸發致命的暖氣流阻斷（高壓熱穹）。",
    impact: "加拿大與美國西海岸長周期山林特大野火、密西西比/科羅拉多河歷史級乾涸、以及頻繁突發的超強陸地對流風暴。",
    baseline1850: -0.02,
    baseline2026: 1.4
  },
  {
    id: "amazon",
    name: "亞馬遜與南美版塊",
    engName: "Amazon Basin & South America",
    zone: "tropical",
    latitude: "3°S",
    ampFactor: 1.3,
    coords: { x: "32%", y: "67%" }, // Amazon Basin
    desc: "地球最大綠肺與全球陸地最主力的二氧化碳吸收碳匯。然而，大氣增溫和森林砍伐雙重脅迫削弱了熱帶雨林的天然自我蒸騰水氣循環機制。",
    impact: "雨林枯死臨界點逼近，森林儲碳生態結構瓦解，促使亞馬遜盆地部分區域由吸碳「碳匯」退化轉變為排碳「碳源」。",
    baseline1850: 0.01,
    baseline2026: 1.35
  },
  {
    id: "sahel",
    name: "薩赫爾與中非地带",
    engName: "Sahel & Central Africa",
    zone: "tropical",
    latitude: "15°N",
    ampFactor: 1.1,
    coords: { x: "50%", y: "52%" }, // Central Africa
    desc: "處於荒漠與雨林邊界，為極敏感的氣候過渡帶。低緯度高空下沉哈德里環流擴大，造成薩赫爾長年高溫且降雨時序重度混亂。",
    impact: "土地高度荒漠化與沙塵暴侵襲、淡水湖查德湖等水體乾涸收縮，加劇熱帶流行病擴散及大規模環境生存壓力。",
    baseline1850: -0.05,
    baseline2026: 1.2
  },
  {
    id: "australia",
    name: "澳洲與海洋礁岩區",
    engName: "Australia & Reef Shelf",
    zone: "tropical",
    latitude: "25°S",
    ampFactor: 1.5,
    coords: { x: "83%", y: "74%" }, // Australian continent
    desc: "受印太暖池（Indo-Pacific Warm Pool）和聖嬰現象高度調製。陸表高度荒漠化，且近岸海洋吸收大氣過剩熱量引發超強海洋熱浪。",
    impact: "大堡礁珊瑚歷史性大面積白化死亡、陸地毁灭性野火野獸威脅、以及周邊海洋酸鹼度（pH）跌破生態底線。",
    baseline1850: 0.04,
    baseline2026: 1.55
  },
  {
    id: "antarctica",
    name: "南極棚冰與西南極",
    engName: "Antarctic Ice Shelves",
    zone: "polar",
    latitude: "82°S",
    ampFactor: 1.6,
    coords: { x: "47%", y: "91%" }, // Antarctica peninsula / ice sheet
    desc: "雖然東南極尚厚實，但西南極冰架受到深層暖洋流（CDW）自下而上侵蝕沖刷。冰架前緣變薄，導致陸地冰川向海滑行阻力大幅減小。",
    impact: "西斯韋茨冰川（末日冰川）崩塌威脅上升，一旦冰棚崩塌，將在短時間內貢獻全球數十公分乃至數公尺的海平面上升量。",
    baseline1850: -0.1,
    baseline2026: 1.15
  }
];

interface ClimateEvent {
  id: string;
  name: string;
  desc: string;
  deltaArctic: number;
  deltaTemperate: number;
  deltaTropical: number;
  co2Bump: number;
  statusMsg: string;
}

const SIMULATED_EVENTS: ClimateEvent[] = [
  {
    id: "none",
    name: "常規調和狀態",
    desc: "無突發強反饋事件，行星系統依序依照大氣二氧化碳保溫係數自然對流。",
    deltaArctic: 0,
    deltaTemperate: 0,
    deltaTropical: 0,
    co2Bump: 0,
    statusMsg: "行星平衡中"
  },
  {
    id: "vortex_split",
    name: "🌀 北極暖丘平流層渦旋分裂",
    desc: "極地放大溫差降低使急流減弱，高空暖空氣入侵北極圈致使極地冷渦（Polar Vortex）四散南下裂解。",
    deltaArctic: 1.35,
    deltaTemperate: 0.60,
    deltaTropical: 0.10,
    co2Bump: 8,
    statusMsg: "極地冷氣團失穩、中緯度熱穹阻斷"
  },
  {
    id: "super_elnino",
    name: "🌡️ 世紀強烈聖嬰暖波堆疊",
    desc: "赤道太平洋東風急遽衰退，深海溫熱海水源源不絕向東漫延，向大氣釋放巨量熱容量，疊加劇特大熱浪。",
    deltaArctic: 0.20,
    deltaTemperate: 0.40,
    deltaTropical: 0.95,
    co2Bump: 12,
    statusMsg: "印太暖池位移、熱帶雨林自燃高發期"
  },
  {
    id: "amoc_slowdown",
    name: "🌊 西大西洋暖鹽經向環流崩解",
    desc: "格陵蘭與北極圈大量冰川淡水匯入北大西洋，使表層海水鹽度與密度崩潰暴跌，中斷了南方暖流輸送帶。",
    deltaArctic: 1.85,
    deltaTemperate: -0.45,
    deltaTropical: 0.50,
    co2Bump: 15,
    statusMsg: "高緯度熱屏障失效、南北海溫梯度扭曲"
  }
];

interface GlobeHeatmapProps {
  tempIn2100: number; // 2100 Projected temperature anomaly
}

export default function GlobeHeatmap({ tempIn2100 }: GlobeHeatmapProps) {
  const [anomalyMode, setAnomalyMode] = useState<"current" | "projection">("projection");
  const [selectedRegionId, setSelectedRegionId] = useState<string>("arctic");
  const [activeZoneFilter, setActiveZoneFilter] = useState<'all' | 'polar' | 'temperate' | 'tropical'>('all');
  const [activeEventId, setActiveEventId] = useState<string>("none");
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showZoneBelts, setShowZoneBelts] = useState<boolean>(true);

  const currentGlobalAnomaly = 1.48;
  const activeGlobalBase = anomalyMode === "current" ? currentGlobalAnomaly : tempIn2100;

  const activeEvent = SIMULATED_EVENTS.find((e) => e.id === activeEventId) || SIMULATED_EVENTS[0];

  const calculateAnomaly = (region: RegionInfo) => {
    const base = activeGlobalBase * region.ampFactor;
    let eventDelta = 0;
    if (anomalyMode === "projection") {
      if (region.zone === "polar") eventDelta = activeEvent.deltaArctic;
      if (region.zone === "temperate") eventDelta = activeEvent.deltaTemperate;
      if (region.zone === "tropical") eventDelta = activeEvent.deltaTropical;
    }
    return Number((base + eventDelta).toFixed(2));
  };

  const filteredRegions = REGIONS_DATA.filter(
    (r) => activeZoneFilter === 'all' || r.zone === activeZoneFilter
  );

  const activeRegion = REGIONS_DATA.find((r) => r.id === selectedRegionId) || REGIONS_DATA[0];
  const activeRegionAnomaly = calculateAnomaly(activeRegion);

  const getRiskDetails = (value: number) => {
    if (value >= 3.8) {
      return {
        level: "臨界超限危機 / Tipping Point Active",
        textColor: "text-rose-500",
        borderColor: "border-rose-600/40",
        bgColor: "bg-rose-950/15",
        accentBg: "#F43F5E",
        bgBadge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        glowColor: "rgba(244, 63, 94, 0.6)",
        mapFill: "rgba(244, 63, 94, 0.25)"
      };
    } else if (value >= 2.6) {
      return {
        level: "極端威脅 / Critical Risk",
        textColor: "text-red-400",
        borderColor: "border-red-500/30",
        bgColor: "bg-red-950/15",
        accentBg: "#EF4444",
        bgBadge: "bg-red-500/10 text-red-400 border-red-500/20",
        glowColor: "rgba(239, 68, 68, 0.45)",
        mapFill: "rgba(239, 68, 68, 0.18)"
      };
    } else if (value >= 1.6) {
      return {
        level: "顯著衝擊 / High Impact",
        textColor: "text-amber-500",
        borderColor: "border-amber-500/30",
        bgColor: "bg-amber-950/10",
        accentBg: "#F59E0B",
        bgBadge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        glowColor: "rgba(245, 158, 11, 0.35)",
        mapFill: "rgba(245, 158, 11, 0.12)"
      };
    } else {
      return {
        level: "溫和升溫 / Moderate Warming",
        textColor: "text-yellow-400",
        borderColor: "border-slate-800",
        bgColor: "bg-slate-900/40",
        accentBg: "#EAB308",
        bgBadge: "bg-slate-900 text-slate-400 border-slate-800",
        glowColor: "rgba(234, 179, 8, 0.2)",
        mapFill: "rgba(234, 179, 8, 0.08)"
      };
    }
  };

  const risk = getRiskDetails(activeRegionAnomaly);

  return (
    <div id="globe-heatmap-overlay-section" className="bg-[#0A0D14] border border-slate-800 rounded-sm shadow-2xl p-5 sm:p-6 lg:p-7 space-y-6 text-slate-250 relative overflow-hidden">
      
      {/* Structural sci-fi corner highlights */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-slate-700 pointer-events-none" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-slate-700 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-slate-700 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-slate-700 pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-rose-500/10 border border-rose-500/20 rounded-md text-rose-400">
              <Compass className="w-5 h-5 text-rose-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9.5px] font-mono tracking-widest bg-rose-950 text-rose-400 px-2 py-0.5 border border-rose-900/50 rounded font-bold uppercase">
                  PLANETARY RADAR COCKPIT
                </span>
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider font-mono">
                  全球地理真實投影增溫熱圖觀測站
                </h3>
              </div>
              <p className="text-[10.5px] text-slate-400 font-sans mt-1 leading-relaxed">
                採用<b>圓柱等距投影（Equirectangular World Map）</b>高擬真世界陸塊地圖，精確投影陸地、海洋與極地哨所三期熱感差值。
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selector and Controls */}
        <div className="flex flex-wrap items-center gap-2.5 select-none self-start lg:self-center shrink-0">
          <div className="flex bg-[#05070A] p-0.5 border border-slate-800 rounded-sm">
            <button
              onClick={() => {
                setAnomalyMode("current");
                setActiveEventId("none");
              }}
              className={`px-3 py-1.5 text-[10.5px] rounded-xs font-mono font-bold transition-all cursor-pointer ${
                anomalyMode === "current"
                  ? "bg-rose-500/15 text-rose-400 font-extrabold shadow-inner border border-rose-500/15"
                  : "text-slate-500 hover:text-slate-350 bg-transparent"
              }`}
            >
              🛰️ 現代衛星實際觀測 (~1.48°C)
            </button>
            <button
              onClick={() => setAnomalyMode("projection")}
              className={`px-3 py-1.5 text-[10.5px] rounded-xs font-mono font-bold transition-all cursor-pointer ${
                anomalyMode === "projection"
                  ? "bg-amber-500/15 text-amber-400 font-extrabold shadow-inner border border-amber-500/15"
                  : "text-slate-500 hover:text-slate-350 bg-transparent"
              }`}
            >
              🔮 2100 決策路徑預估 (+{tempIn2100.toFixed(2)}°C)
            </button>
          </div>

          <div className="flex gap-1.5 bg-[#05070A] p-1 rounded-sm border border-slate-850">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2 py-1 text-[9px] font-mono rounded cursor-pointer transition-all ${
                showGrid ? "bg-slate-800 text-slate-200" : "text-slate-600 hover:text-slate-400"
              }`}
              title="切換經緯格網"
            >
              格網
            </button>
            <button
              onClick={() => setShowZoneBelts(!showZoneBelts)}
              className={`px-2 py-1 text-[9px] font-mono rounded cursor-pointer transition-all ${
                showZoneBelts ? "bg-slate-800 text-slate-200" : "text-slate-600 hover:text-slate-400"
              }`}
              title="切換氣候帶熱流暈"
            >
              氣候帶
            </button>
          </div>
        </div>
      </div>

      {/* MIDDLE: THE DYNAMIC CLIMATE TRIGGER EVENTS CONTROL BAR */}
      {anomalyMode === "projection" && (
        <div className="bg-[#07090E] border border-slate-800 p-3.5 rounded-sm space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-[10.5px] font-mono font-bold text-slate-300">
                ⚡ 大氣環流與行星反饋突發事件模擬器 (PLANETARY SYSTEM RESPONSES)
              </span>
            </div>
            <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 border border-emerald-900/40 rounded font-bold">
              模式：{activeEvent.statusMsg}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
            {SIMULATED_EVENTS.map((evt) => (
              <button
                key={evt.id}
                onClick={() => setActiveEventId(evt.id)}
                className={`p-2 rounded text-left border cursor-pointer transition-all ${
                  activeEventId === evt.id
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                    : "bg-[#040507] border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-300"
                }`}
              >
                <div className="text-[10.5px] font-bold truncate">{evt.name}</div>
                <div className="text-[9px] text-slate-500 mt-1 line-clamp-1 leading-normal font-sans">
                  {evt.desc}
                </div>
              </button>
            ))}
          </div>

          {activeEventId !== "none" && (
            <div className="p-2.5 bg-amber-950/20 border border-amber-900/30 rounded text-[10px] text-amber-300 font-mono flex items-start gap-2">
              <Info className="w-3.5 h-3.5 mt-0.5 text-amber-400 shrink-0" />
              <div>
                <b>熱能傳導位移：</b>分區溫差额外偏移：
                極北/寒帶 <span className="text-rose-400 font-bold ml-1">+{activeEvent.deltaArctic}°C</span>、
                中溫帶 <span className="text-amber-450 text-amber-400 font-bold ml-1">+{activeEvent.deltaTemperate}°C</span>、
                赤道及熱帶 <span className="text-yellow-450 text-yellow-400 font-bold ml-1">+{activeEvent.deltaTropical}°C</span>。
                行星大氣微擾回報已併網核算。
              </div>
            </div>
          )}
        </div>
      )}

      {/* TWO COLUMN INTERACTION PANEL (WIDESCREEN MAP ON LEFT, TELEMETRY ON RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: GORGEOUS FLAT REALISTIC WORLD MAP (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-4 bg-[#05070B] border border-slate-800 rounded relative overflow-visible min-h-[380px]">
          
          {/* Top HUD markers */}
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 pb-2 border-b border-slate-850 select-none">
            <span>🔴 RADAR FEED: LIVE WORLD GRID MAP</span>
            <span>PROJECTION: EQUIRECTANGULAR WIDESCREEN</span>
          </div>

          {/* Core Latitudinal Zone Filter Switch */}
          <div className="z-30 w-full my-2 select-none">
            <div className="flex bg-[#030406] border border-slate-850 p-0.5 rounded-sm">
              {([
                { id: 'all', lbl: '全部監測站 (All)' },
                { id: 'polar', lbl: '寒帶圈 (Polar)' },
                { id: 'temperate', lbl: '中緯度 (Temperate)' },
                { id: 'tropical', lbl: '赤道圈 (Tropical)' }
              ] as const).map((z) => (
                <button
                  key={z.id}
                  onClick={() => setActiveZoneFilter(z.id)}
                  className={`px-2 py-1 text-[9.5px] font-semibold flex-1 rounded-xs transition-all cursor-pointer ${
                    activeZoneFilter === z.id
                      ? "bg-slate-800 text-slate-100 border border-slate-700/50 font-bold"
                      : "text-slate-500 hover:text-slate-350 bg-transparent"
                  }`}
                >
                  {z.lbl}
                </button>
              ))}
            </div>
          </div>

          {/* HIGH-FIDELITY REAL WORLD MAP SVG CANVAS */}
          <div className="relative w-full h-[250px] sm:h-[280px] md:h-[300px] border border-slate-900 bg-[#06080D] rounded overflow-visible flex items-center justify-center">
            
            {/* Ambient dynamic ocean heatmap gradient backing */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.6)_0%,rgba(6,8,13,0.95)_100%)] pointer-events-none" />

            {/* HIGH-ACCURACY WORLD COASTLINES AND CONTINENTS SVG PATHS (1000 x 500 Viewbox) */}
            <svg 
              className="w-full h-full text-slate-800 transition-colors duration-300" 
              viewBox="0 0 1000 500" 
              fill="none" 
              stroke="none"
            >
              {/* Climate zone glowing overlay background belts */}
              {showZoneBelts && (
                <g className="opacity-15 pointer-events-none">
                  {/* Northern Polar Zone (Above 66.5°N -> Y in 0 to 115) */}
                  <rect x="0" y="0" width="1000" height="115" fill="url(#polarHeatGrad)" />
                  {/* Temperate Northern Zone (23.5°N to 66.5°N -> Y in 115 to 215) */}
                  <rect x="0" y="115" width="1000" height="100" fill="url(#temperateHeatGrad)" />
                  {/* Tropical Central Zone (23.5°S to 23.5°N -> Y in 215 to 335) */}
                  <rect x="0" y="215" width="1000" height="120" fill="url(#tropicalHeatGrad)" />
                  {/* Temperate Southern Zone (23.5°S to 66.5°S -> Y in 335 to 435) */}
                  <rect x="0" y="335" width="1000" height="100" fill="url(#temperateHeatGrad)" />
                  {/* Southern Polar Zone (Below 66.5°S -> Y in 435 to 500) */}
                  <rect x="0" y="435" width="1000" height="65" fill="url(#polarHeatGrad)" />
                </g>
              )}

              {/* Grid Lat/Long mesh lines */}
              {showGrid && (
                <g stroke="rgba(51, 65, 85, 0.25)" strokeWidth="0.8" strokeDasharray="3 4">
                  {/* Longitudes */}
                  <line x1="100" y1="0" x2="100" y2="500" />
                  <line x1="200" y1="0" x2="200" y2="500" />
                  <line x1="300" y1="0" x2="300" y2="500" />
                  <line x1="400" y1="0" x2="400" y2="500" />
                  <line x1="500" y1="0" x2="500" y2="500" /> {/* Meridian */}
                  <line x1="600" y1="0" x2="600" y2="500" />
                  <line x1="700" y1="0" x2="700" y2="500" />
                  <line x1="800" y1="0" x2="800" y2="500" />
                  <line x1="900" y1="0" x2="900" y2="500" />

                  {/* Latitudes */}
                  <line x1="0" y1="80" x2="1000" y2="80" /> {/* Arctic Circle */}
                  <line x1="0" y1="160" x2="1000" y2="160" /> {/* Tropic of Cancer */}
                  <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(244, 63, 94, 0.3)" strokeWidth="1" strokeDasharray="0" /> {/* Equator */}
                  <line x1="0" y1="340" x2="1000" y2="340" /> {/* Tropic of Capricorn */}
                  <line x1="0" y1="420" x2="1000" y2="420" /> {/* Antarctic Circle */}
                </g>
              )}

              {/* DEFINED GRADIENT DEFS */}
              <defs>
                <linearGradient id="polarHeatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F43F5E" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="temperateHeatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="tropicalHeatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0" />
                  <stop offset="50%" stopColor="#EAB308" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* WORLD MAP LANDMASES - GRAPHICALLY RENDERED REAL GEOGRAPHIES */}
              <g fill="#161F30" stroke="#1F2E45" strokeWidth="0.8" className="transition-all">
                
                {/* 1. GREENLAND (Greenland is placed in top mid-left) */}
                <path d="M 430,40 L 450,25 L 485,38 L 490,65 L 475,90 L 450,85 L 435,65 Z" />

                {/* 2. NORTH AMERICA (Widespread across top-left) */}
                <ellipse cx="65" cy="115" rx="20" ry="12" /> {/* Alaska */}
                <path d="M 80,105 L 120,68 L 180,60 L 220,65 L 250,75 L 290,92 L 285,120 L 260,150 L 245,180 L 225,210 L 200,230 L 180,245 M 180,245 L 165,220 L 150,185 L 120,170 L 95,155 L 75,135 Z" fill="#161F30" />
                <path d="M 180,245 L 205,230 L 210,210 L 175,190 L 155,205 Z" /> {/* Central America narrow strip */}
                <ellipse cx="230" cy="175" rx="9" ry="5" /> {/* Cuba & Caribbean */}

                {/* 3. SOUTH AMERICA (Runs down left-hand side) */}
                <path d="M 210,248 C 240,248 290,270 320,295 C 345,315 365,340 355,370 C 345,400 320,430 300,455 C 285,475 270,490 268,495 M 268,495 C 265,490 260,450 252,420 C 245,390 230,340 215,310 C 205,290 200,265 210,248 Z" fill="#161F30" />

                {/* 4. AFRICA (Centered in middle-left) */}
                <path d="M 425,230 C 445,210 495,210 520,212 C 545,215 570,225 582,245 C 595,265 615,290 610,315 C 595,345 565,385 555,420 C 550,440 545,445 540,442 M 540,442 C 532,440 500,400 485,375 C 470,350 445,320 425,290 C 410,270 415,245 425,230 Z" fill="#161F30" />
                <ellipse cx="585" cy="385" rx="7" ry="16" transform="rotate(15, 585, 385)" /> {/* Madagascar */}

                {/* 5. EUROPE & ASIA (Gigantic landmass spanning top right and center) */}
                {/* Europe */}
                <path d="M 430,220 C 420,200 415,170 422,145 C 430,120 455,100 480,95 C 495,100 520,120 535,140 C 545,155 570,165 575,185 M 575,185 L 530,215 L 490,218 Z" fill="#161F30" />
                <ellipse cx="445" cy="115" rx="8" ry="12" /> {/* Scandinavia / UK split */}
                
                {/* Asia Mainland */}
                <path d="M 533,142 C 550,110 600,90 650,85 C 700,80 780,72 840,88 C 880,100 930,110 945,135 C 960,160 955,190 920,215 C 895,230 890,250 875,280 M 875,280 C 850,300 840,325 810,335 C 785,340 760,345 745,320 L 730,285 L 680,270 L 610,258 Z" fill="#161F30" />
                
                {/* India Subcontinent */}
                <path d="M 680,270 L 705,315 L 725,280 Z" />
                {/* Indochina peninsula */}
                <path d="M 770,290 L 785,335 L 805,310 Z" />

                {/* Island Arcs */}
                <ellipse cx="880" cy="180" rx="4" ry="12" transform="rotate(25, 880, 180)" /> {/* Japan */}
                <ellipse cx="800" cy="355" rx="14" ry="4" /> {/* Sumatra / Java */}
                <ellipse cx="850" cy="340" rx="10" ry="8" /> {/* Borneo & Philippines */}

                {/* 6. AUSTRALIA (Placed on bottom-right) */}
                <path d="M 780,395 C 805,390 840,385 870,398 C 895,410 910,430 890,455 C 870,470 835,465 810,460 C 790,455 770,430 780,395 Z" fill="#161F30" />
                <ellipse cx="915" cy="460" rx="4" ry="10" /> {/* New Zealand */}

                {/* 7. ANTARCTICA (Spans the bottom of the flat map projection) */}
                <path d="M 50,475 L 120,470 L 220,465 L 320,470 L 450,460 C 470,475 490,490 495,495 M 495,495 C 500,495 520,440 500,435 M 500,435 L 620,465 L 740,468 L 860,470 L 950,475 L 940,495 L 60,495 Z" fill="#1A2536" stroke="#25354F" />

              </g>

              {/* Decorative dynamic scan line traveling down */}
              <line x1="0" y1="120" x2="1000" y2="120" className="opacity-10 stroke-emerald-500 stroke-2" />
            </svg>

            {/* INTERACTIVE MARKER PLACEMENT OVERLAY */}
            {REGIONS_DATA.map((region) => {
              const anomalyVal = calculateAnomaly(region);
              const isSelected = selectedRegionId === region.id;
              const isFilteredOut = activeZoneFilter !== 'all' && region.zone !== activeZoneFilter;
              const spotRisk = getRiskDetails(anomalyVal);

              if (isFilteredOut) return null;

              return (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegionId(region.id)}
                  style={{ left: region.coords.x, top: region.coords.y }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/btn focus:outline-none cursor-pointer"
                >
                  {/* Outer pulsating echo heatwave ring */}
                  <motion.div
                    animate={{ scale: isSelected ? [1, 2.3, 1] : [1, 1.6, 1], opacity: isSelected ? [0.85, 0, 0.85] : [0.4, 0, 0.4] }}
                    transition={{ repeat: Infinity, duration: isSelected ? 1.5 : 2.5, ease: "easeInOut" }}
                    style={{ backgroundColor: spotRisk.accentBg }}
                    className="absolute inset-0 rounded-full w-8 h-8 -left-2 -top-2 opacity-60 filter blur-[1px]"
                  />

                  {/* Central solid indicator dot */}
                  <div 
                    style={{ boxShadow: `0 0 14px ${spotRisk.glowColor}` }}
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 relative border-2 ${
                      isSelected ? "border-white bg-white scale-125 shadow-lg" : `border-${spotRisk.textColor.split(' ')[0]} bg-slate-950`
                    }`}
                  >
                    <span 
                      style={{ backgroundColor: spotRisk.accentBg }}
                      className={`w-1.5 h-1.5 rounded-full ${isSelected ? "animate-ping" : ""}`} 
                    />
                  </div>

                  {/* Highly detailed responsive hover card tooltip with real-time anomaly and historical timeline summaries */}
                  <div 
                    className={`pointer-events-none absolute ${
                      region.id === "arctic" || region.id === "siberia" || region.id === "europe" || region.id === "northamerica"
                        ? "top-7"
                        : "bottom-7"
                    } ${
                      region.id === "northamerica" || region.id === "amazon"
                        ? "left-0 translate-x-0"
                        : region.id === "australia" || region.id === "siberia"
                        ? "right-0 translate-x-0"
                        : "left-1/2 -translate-x-1/2"
                    } w-72 sm:w-80 p-4 bg-slate-950/98 backdrop-blur-md border border-slate-800/80 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.85)] opacity-0 scale-95 group-hover/btn:opacity-100 group-hover/btn:scale-100 transition-all duration-200 z-50 text-left`}
                    style={{ borderLeft: `4px solid ${spotRisk.accentBg}` }}
                  >
                    {/* Header: Title, Subtitle & Zone Badge */}
                    <div className="flex justify-between items-start border-b border-slate-800/60 pb-2 mb-2">
                      <div>
                        <h4 className="text-xs font-black text-slate-100 font-sans tracking-wide flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {region.name}
                        </h4>
                        <span className="text-[9px] text-slate-400 font-mono block">
                          {region.engName}
                        </span>
                      </div>
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${spotRisk.bgBadge}`}>
                        {region.latitude} • {region.zone === 'polar' ? '寒帶極地' : region.zone === 'temperate' ? '中緯溫帶' : '赤道熱帶'}
                      </span>
                    </div>

                    {/* Current State Indicator */}
                    <div className="grid grid-cols-2 gap-2 bg-[#090D15] p-2 rounded border border-slate-900/60 mb-2">
                      <div>
                        <span className="text-[8px] text-slate-500 font-mono block">當前氣候偏差</span>
                        <span className={`text-sm font-black font-mono block mt-0.5 ${spotRisk.textColor}`}>
                          {anomalyVal > 0 ? `+${anomalyVal}` : anomalyVal}°C
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 font-mono block">熱放大敏感度</span>
                        <span className="text-xs font-bold text-slate-300 font-mono block mt-0.5">
                          {region.ampFactor}x 敏感度
                        </span>
                      </div>
                    </div>

                    {/* Risk Status Badging */}
                    <div className="text-[9.5px] font-mono flex items-center gap-1.5 mb-2.5 pb-2 border-b border-slate-900/40">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: spotRisk.accentBg }} />
                      <span className="font-bold text-slate-400 uppercase text-[8.5px]">風險評估分級：</span>
                      <span className={`font-black uppercase text-[8.5px] ${spotRisk.textColor}`}>
                        {spotRisk.level.split(' / ')[0]}
                      </span>
                    </div>

                    {/* Real-time Dynamic Interactive Modeling Metrics */}
                    <div className="space-y-2 mb-3 pb-2 border-b border-slate-900/40">
                      <span className="text-[8.5px] uppercase font-mono tracking-wider font-bold text-slate-500 block">
                        ⚙️ 實時反饋指標 / REAL-TIME IMPACT PARAMETERS
                      </span>
                      
                      {(() => {
                        const ecosystemStress = Math.min(100, Math.round(region.ampFactor * 25 * (tempIn2100 / 2.0)));
                        const albedoSinking = region.zone === "polar" 
                          ? Math.min(100, Math.round(60 + (tempIn2100 - 1.2) * 20))
                          : region.zone === "tropical"
                          ? Math.min(100, Math.round(30 + (tempIn2100 - 1.2) * 12))
                          : Math.min(100, Math.round(40 + (tempIn2100 - 1.2) * 15));
                        const tippingRisk = Math.min(100, Math.round(35 + region.ampFactor * 16 * (tempIn2100 / 1.6)));

                        return (
                          <div className="space-y-2">
                            {/* Metric 1 */}
                            <div className="space-y-0.5">
                              <div className="flex justify-between text-[8px] font-mono text-slate-400">
                                <span className="flex items-center gap-1"><Activity className="w-2 h-2 text-rose-400" /> 生態自組織壓力</span>
                                <span className="font-bold text-rose-400">{ecosystemStress}%</span>
                              </div>
                              <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden border border-slate-950">
                                <div 
                                  className="bg-gradient-to-r from-red-500 to-rose-400 h-full transition-all duration-300"
                                  style={{ width: `${ecosystemStress}%` }}
                                />
                              </div>
                            </div>

                            {/* Metric 2 */}
                            <div className="space-y-0.5">
                              <div className="flex justify-between text-[8px] font-mono text-slate-400">
                                <span className="flex items-center gap-1"><Layers className="w-2 h-2 text-cyan-400" /> 反照率(Albedo)衰減率</span>
                                <span className="font-bold text-cyan-400">{albedoSinking}%</span>
                              </div>
                              <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden border border-slate-950">
                                <div 
                                  className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full transition-all duration-300"
                                  style={{ width: `${albedoSinking}%` }}
                                />
                              </div>
                            </div>

                            {/* Metric 3 */}
                            <div className="space-y-0.5">
                              <div className="flex justify-between text-[8px] font-mono text-slate-400">
                                <span className="flex items-center gap-1"><Zap className="w-2 h-2 text-amber-400" /> 突發臨界重置機率</span>
                                <span className="font-bold text-amber-400">{tippingRisk}%</span>
                              </div>
                              <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden border border-slate-950">
                                <div 
                                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-300"
                                  style={{ width: `${tippingRisk}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Historical & Future Trend summary */}
                    <div className="space-y-1 text-[9.5px] font-sans text-slate-400 mb-2.5">
                      <span className="text-[8.5px] uppercase font-mono tracking-wider font-bold text-slate-500 block">
                        📈 歷史起源與本世紀增溫時序
                      </span>
                      <div className="flex items-center justify-between font-mono bg-[#05070B] px-2 py-1 rounded shadow-inner border border-slate-900/60 text-[9px]">
                        <div className="text-center">
                          <span className="text-slate-500 block text-[7px] leading-tight select-none">1850工業前</span>
                          <span className="font-bold text-teal-400 mt-0.5 block">
                            {region.baseline1850 > 0 ? `+${region.baseline1850}` : region.baseline1850}°C
                          </span>
                        </div>
                        <span className="text-slate-600 block text-[9px] select-none">→</span>
                        <div className="text-center">
                          <span className="text-slate-500 block text-[7px] leading-tight select-none">2026現代實際</span>
                          <span className="font-bold text-amber-400 mt-0.5 block">
                            +{region.baseline2026}°C
                          </span>
                        </div>
                        <span className="text-slate-600 block text-[9px] select-none">→</span>
                        <div className="text-center">
                          <span className="text-slate-500 block text-[7px] leading-tight select-none">{anomalyMode === 'current' ? '2050預估' : '2100上限'}</span>
                          <span className="font-bold text-rose-500 mt-0.5 block">
                            {anomalyVal > 0 ? `+${anomalyVal}` : anomalyVal}°C
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-[8.5px] text-slate-400 leading-[1.35] font-sans mt-1">
                        自工業革命至今累計已變暖 <b className="text-slate-200">{((region.baseline2026 ?? 0) - (region.baseline1850 ?? 0)).toFixed(2)}°C</b>。依據當前模擬，本階段該區增溫敏感度為全球均值的 <b className="text-slate-200">{region.ampFactor}倍</b>。
                      </p>
                    </div>

                    {/* Real-time Dynamic Status/Impact Snippet */}
                    <div className="p-2 bg-slate-900/40 rounded border border-slate-900/80 text-[9px] text-slate-400 leading-normal">
                      <span className="text-[8px] font-mono text-slate-500 tracking-wide uppercase block mb-0.5 select-none">
                        ⚠️ 當前生態與地理重大威脅特徵
                      </span>
                      <p className="leading-[1.35] text-[8.5px] text-slate-300 font-sans">{region.impact}</p>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Latitude degree sidebar strip coordinates (Left border overlay) */}
            <div className="absolute left-1.5 inset-y-0 flex flex-col justify-between py-5 text-[8px] font-mono text-slate-650 text-slate-500 pointer-events-none select-none">
              <span>90°N</span>
              <span>60°N</span>
              <span>30°N</span>
              <span>0°(EQ)</span>
              <span>30°S</span>
              <span>60°S</span>
              <span>90°S</span>
            </div>
          </div>

          {/* Map bottom bar information legend line */}
          <div className="w-full text-center border-t border-slate-850/60 pt-2.5 mt-2 flex flex-col sm:flex-row items-center justify-between text-right sm:text-left gap-1.5">
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 bg-rose-500 rounded-full shrink-0 animate-ping" />
              <span>觀測網址連結：已自動校準至<b>麥卡托地心經緯基線座標</b></span>
            </span>
            <div className="flex gap-2.5 text-[9px] font-mono text-slate-500 italic">
              <span>🔵 寒帶 (Polar)</span>
              <span>🟢 溫帶 (Temperate)</span>
              <span>🟡 熱帶 (Tropical)</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ADVANCED SCIENTIFIC TELEMETRY REPORT BREAKDOWNS (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          {/* Active selection info container with dynamic risk themes */}
          <div 
            style={{ 
              boxShadow: `inset 0 0 24px ${risk.glowColor}05`,
              backgroundColor: risk.bgColor
            }}
            className={`p-4 md:p-5 rounded border transition-all duration-300 flex-1 flex flex-col justify-between ${risk.borderColor}`}
          >
            <div className="space-y-4 font-sans">
              
              {/* Title zone group */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 border-b border-slate-800/40 pb-2.5">
                <div>
                  <div className="flex items-center gap-1 text-[9px] font-mono tracking-widest font-bold text-slate-500">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>分區監控哨 / ACTIVE STATION</span>
                    <span className="text-slate-400 bg-slate-950 px-1 py-0.5 rounded font-normal">緯度: {activeRegion.latitude}</span>
                  </div>
                  <h4 className="text-[14.5px] font-black text-slate-100 flex items-center space-x-1.5 mt-1">
                    <span>{activeRegion.name}</span>
                  </h4>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border self-start sm:self-auto ${risk.bgBadge}`}>
                  {risk.level}
                </span>
              </div>

              {/* 3-period comparison boxes */}
              <div className="bg-slate-950/80 p-3.5 rounded border border-slate-850 space-y-2.5">
                <span className="text-[9.5px] font-mono font-bold text-slate-400 block border-b border-slate-850 pb-1">
                  📈 世紀三期觀測對比 (TEMPERATURE ANOMALY TIMELINE)
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#07090C] p-2 rounded border border-slate-900/65 flex flex-col justify-between">
                    <span className="text-[8.5px] text-slate-500 block">工業革命起點 (1850)</span>
                    <span className="text-xs font-mono text-slate-400 font-bold mt-1">
                      {activeRegion.baseline1850 > 0 ? `+${activeRegion.baseline1850}` : activeRegion.baseline1850} °C
                    </span>
                    <span className="text-[8px] text-slate-600 mt-0.5 leading-tight">基本起點</span>
                  </div>

                  <div className="bg-[#07090C] p-2 rounded border border-slate-900/65 flex flex-col justify-between">
                    <span className="text-[8.5px] text-slate-500 block">現代實測 (2026)</span>
                    <span className="text-xs font-mono text-amber-500 font-bold mt-1">
                      +{activeRegion.baseline2026} °C
                    </span>
                    <span className="text-[8px] text-amber-600/70 mt-0.5 leading-tight">人類增溫大氣臨界</span>
                  </div>

                  <div className="bg-slate-900 p-2 rounded border border-slate-850 flex flex-col justify-between">
                    <span className="text-[8.5px] text-slate-400 block font-bold">預估投影 (2100)</span>
                    <span className={`text-xs font-mono font-extrabold ${risk.textColor} mt-1`}>
                      +{activeRegionAnomaly} °C
                    </span>
                    <span className="text-[8px] text-emerald-400 mt-0.5 leading-tight font-bold">目前情境下</span>
                  </div>
                </div>

                {/* Progress bar visual indicator */}
                <div className="pt-1 text-[9px] text-slate-400 font-mono space-y-1">
                  <div className="flex justify-between">
                    <span>1850起升溫幅度 (1850 - 2100 Delta)</span>
                    <span className="font-bold text-slate-200">+{((activeRegionAnomaly) - (activeRegion.baseline1850)).toFixed(2)} °C</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      style={{ 
                        width: `${Math.min(100, (((activeRegionAnomaly - activeRegion.baseline1850) / 6.5) * 100))}%`,
                        backgroundColor: risk.accentBg
                      }} 
                      className="h-full rounded-full" 
                    />
                  </div>
                </div>
              </div>

              {/* ADVANCED THERMODYNAMIC & ECOLOGICAL INDICATORS GRID */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Metric 1: Atmosphere Moisture Capacity Change */}
                <div id="metric-cc-vapor" className="bg-slate-950/90 p-3 rounded border border-slate-850/65 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold font-mono">大氣持水飽和極限</span>
                    <Waves className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="my-2.5">
                    <span className="text-lg font-mono font-extrabold text-blue-400">
                      +{Math.round(activeRegionAnomaly * 7)}%
                    </span>
                    <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">Clausius-Clapeyron 蒸汽壓增幅</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(100, activeRegionAnomaly * 7)}%` }} 
                      className="h-full bg-blue-400 rounded-full" 
                    />
                  </div>
                </div>

                {/* Metric 2: Extreme Heatwave Frequency Multiplier */}
                <div id="metric-heat-wave" className="bg-slate-950/90 p-3 rounded border border-slate-850/65 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold font-mono">致命熱浪重現期倍率</span>
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <div className="my-2.5">
                    <span className="text-lg font-mono font-extrabold text-orange-400">
                      {Math.pow(1.5, activeRegionAnomaly).toFixed(1)}x
                    </span>
                    <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">高溫異常事件發生頻率</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(100, (Math.pow(1.5, activeRegionAnomaly) / 5) * 100)}%` }} 
                      className="h-full bg-orange-400 rounded-full" 
                    />
                  </div>
                </div>

                {/* Metric 3: Sea level rise or Forest Dieback Index */}
                <div id="metric-zone-special" className="bg-slate-950/90 p-3 rounded border border-slate-850/65 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold font-mono">
                      {activeRegion.zone === 'polar' ? '極地融冰溢注率' : activeRegion.id === 'amazon' ? '雨林植被枯死率' : '海洋熱膨脹貢獻'}
                    </span>
                    <Wind className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <div className="my-2.5">
                    <span className="text-lg font-mono font-extrabold text-teal-400">
                      {activeRegion.zone === 'polar' 
                        ? `+${(activeRegionAnomaly * 1.55).toFixed(2)}` 
                        : activeRegion.id === 'amazon' 
                        ? `${Math.min(95, Math.round(activeRegionAnomaly * 18))}%`
                        : `+${(activeRegionAnomaly * 0.85).toFixed(2)}`}
                      <span className="text-[9px] font-normal ml-0.5">{activeRegion.zone === 'polar' || activeRegion.id !== 'amazon' ? 'mm/yr' : ''}</span>
                    </span>
                    <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">
                      {activeRegion.zone === 'polar' 
                        ? '海平面上升年均溢注當量' 
                        : activeRegion.id === 'amazon' 
                        ? '林冠自蒸騰衰減觸發機率' 
                        : '海水熱含量膨脹速率'}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      style={{ 
                        width: `${activeRegion.zone === 'polar' 
                          ? Math.min(100, (activeRegionAnomaly * 1.55 / 8) * 100) 
                          : activeRegion.id === 'amazon' 
                          ? Math.min(100, activeRegionAnomaly * 18) 
                          : Math.min(100, (activeRegionAnomaly * 0.85 / 5) * 100)}%` 
                      }} 
                      className="h-full bg-teal-400 rounded-full" 
                    />
                  </div>
                </div>

                {/* Metric 4: Ecological Critical Index */}
                <div id="metric-tipping-index" className="bg-slate-950/90 p-3 rounded border border-slate-850/65 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold font-mono">生態系統抗逆極限</span>
                    <Zap className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div className="my-2.5">
                    <span className="text-lg font-mono font-extrabold text-rose-400 animate-pulse">
                      {Math.min(100, Math.round((activeRegionAnomaly / 4.5) * 100))}%
                    </span>
                    <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">承受增溫臨界值枯竭度</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(100, (activeRegionAnomaly / 4.5) * 100)}%` }} 
                      className="h-full bg-rose-500 rounded-full" 
                    />
                  </div>
                </div>
              </div>

              {/* Physical narrative details wrapper */}
              <div className="text-xs text-slate-300 leading-relaxed bg-[#050608]/90 p-3 rounded border border-slate-850/60 font-sans">
                <p className="font-bold text-slate-400 mb-1">對流升溫物理常規：</p>
                <p className="text-slate-350">{activeRegion.desc}</p>
              </div>

              {/* Climate feedback cascade danger block */}
              <div className="text-xs text-slate-300 leading-relaxed bg-red-950/15 p-3 rounded border border-red-950/20 font-sans">
                <p className="font-mono font-bold text-red-400 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>分區臨界浩劫與連鎖反饋價值：</span>
                </p>
                <p className="text-slate-250 font-sans">{activeRegion.impact}</p>
              </div>

            </div>

            {/* Shield baseline reference block */}
            <div className="text-[9.5px] text-slate-500 font-mono border-t border-slate-850/60 pt-2.5 mt-3 flex items-center justify-between">
              <span className="flex items-center space-x-1 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>數據模型基礎：<b>IPCC AR6、NOAA 與分區物理反饋框架</b></span>
              </span>
            </div>

          </div>

          {/* QUICK CHROME SUB-SELECTION REGIONAL BADGES GRID FOR COMPACT USE */}
          <div className="grid grid-cols-4 gap-1.5">
            {REGIONS_DATA.map((region) => {
              const isSelected = selectedRegionId === region.id;
              const ratVal = calculateAnomaly(region);
              
              return (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegionId(region.id)}
                  className={`p-1.5 rounded transition-all text-left text-[10px] border cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 border-rose-500/30 text-rose-450 shadow-[0_0_8px_rgba(244,63,94,0.05)]"
                      : "bg-[#050608] border-slate-850 text-slate-500 hover:border-slate-800 hover:text-slate-350"
                  }`}
                >
                  <div className="font-sans font-bold truncate max-w-full">
                    {region.name.replace("極地放大區", "極地").replace("與北亞陸塊", "").replace("陸表極端區", "").replace("與南美版塊", "").replace("與中非地带", "").replace("與海洋礁岩區", "").replace("棚冰與西南極", "")}
                  </div>
                  <div className={`font-mono text-[9px] mt-0.5 ${isSelected ? 'text-rose-400 font-bold' : 'text-slate-600'}`}>
                    +{ratVal}°C
                  </div>
                </button>
              );
            })}
          </div>

        </div>

      </div>

      {/* REGIONAL HISTORICAL & FUTURE TRAJECTORY ANALYSIS (地圖熱區互動分析專屬圖表) */}
      <div id="regional-historical-trajectory-panel" className="bg-[#05070B] border border-slate-800 rounded p-4 md:p-5 mt-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-black font-mono tracking-widest text-cyan-400 uppercase">
              📊 歷史與未來分區氣候變遷概軌跡圖表 / REGIONAL CLIMATE TRAJECTORY TRACE
            </span>
          </div>
          <span className="text-[10.5px] text-slate-400 font-sans">
            當前分析熱區：<strong className="text-slate-100">{activeRegion.name}</strong> ({activeRegion.engName})
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-center">
          {/* Detailed explanation left side info (4 cols) */}
          <div className="xl:col-span-4 space-y-3.5 text-xs text-slate-350">
            <div className="bg-[#080B10] p-3.5 rounded border border-[#1e293b]/70 space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">
                🔴 區域熱區歷史增溫趨勢 (Anomaly Trace)
              </span>
              <p className="leading-relaxed font-sans">
                這張圖表顯示了 <b>{activeRegion.name}</b> 自工業革命初期（1850年）至 2100年 的實際觀測與科學模型預估增溫走向。
              </p>
              <p className="leading-relaxed font-sans text-[11px] text-slate-400">
                其增溫放大係數為 <b className="text-rose-400">{activeRegion.ampFactor}倍</b>。此偏高之熱放大敏感度常態直接導致該區承受更重大的臨界事件反饋。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 px-1 select-none">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-xs bg-rose-500/80 shrink-0" />
                <span className="text-[10.5px] font-mono text-slate-400">增溫偏差 (°C)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-xs bg-sky-500/80 shrink-0" />
                <span className="text-[10.5px] font-mono text-slate-400">系統失控率 (%)</span>
              </div>
            </div>
          </div>

          {/* Fully Responsive Area Chart (8 cols) */}
          <div className="xl:col-span-8 bg-[#020304] border border-[#111827] rounded p-4 h-64 md:h-72 select-none relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={generateRegionalHistory(activeRegion, activeRegionAnomaly)} margin={{ top: 10, right: 15, left: -5, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorAnomaly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#111827" />
                <XAxis dataKey="year" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#ef4444" fontSize={11} label={{ value: '增溫異常差 (°C)', angle: -90, position: 'insideLeft', style: { fill: '#ef4444', fontSize: '10px', fontWeight: 'bold' } }} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" fontSize={11} label={{ value: '系統失控率 (%)', angle: 90, position: 'insideRight', style: { fill: '#0ea5e9', fontSize: '10px', fontWeight: 'bold' } }} tickLine={false} />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#0B0F17] border border-slate-800 p-3.5 rounded shadow-2xl space-y-1.5 font-mono text-xs">
                          <p className="text-slate-350 font-sans font-bold text-[13px] border-b border-slate-800 pb-1 flex justify-between items-center gap-10">
                            <span>西元 {data.year} 年</span>
                            <span className="text-[10px] text-cyan-400 bg-cyan-950 px-1 py-0.5 rounded font-normal">{data.label}</span>
                          </p>
                          <p className="text-red-400 font-bold">
                            價差異常🌡️: <span className="font-mono text-[13px]">{data.anomaly > 0 ? `+${data.anomaly}` : data.anomaly} °C</span>
                          </p>
                          <p className="text-sky-400 font-bold">
                            系統臨界⚠️: <span className="font-mono text-[13px]">{data.risk}%</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area yAxisId="left" type="monotone" dataKey="anomaly" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAnomaly)" name="增溫偏差 (°C)" />
                <Area yAxisId="right" type="monotone" dataKey="risk" stroke="#0ea5e9" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRisk)" name="系統失控率 (%)" />
                <ReferenceLine yAxisId="left" y={1.5} stroke="#eab308" strokeDasharray="3 3">
                  <Label value="IPCC 1.5°C 警報底線" position="insideBottomLeft" fill="#eab308" fontSize={9} offset={8} />
                </ReferenceLine>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
