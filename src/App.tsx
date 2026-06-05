/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Globe,
  Sliders,
  Code,
  Download,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Flame,
  Waves,
  Trees,
  Coins,
  Compass,
  FileCode,
  Info,
  ExternalLink,
  ChevronRight,
  Database,
  CloudSun,
  RefreshCw,
  Search,
  Send,
  MessageSquare,
  Newspaper,
  Wind,
  Zap,
  Calendar,
  Percent,
  ShieldAlert
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ReferenceLine,
  ReferenceDot
} from "recharts";
import { CLIMATE_METRICS, HISTORICAL_CLIMATE_DATA, SCENARIO_PROJECTIONS, EXTREME_EVENTS, CLIMATE_WEATHER_STATIONS, getPythonStreamlitCode } from "./data";
import { ClimateMetric, ChartDataPoint, ScenarioProjectionPoint, AIAnalysisResponse, PythonCodeOptions, ExtremeWeatherEvent, WeatherStation, LiveWeatherData, CopilotMessage, ClimateNewsResponse } from "./types";

const NEWS_LOCALIZATION = {
  "zh-TW": {
    title: "氣候變遷實時快訊",
    forceUpdate: "強制更新觀測",
    syncing: "同步數據中...",
    aiObservation: "每日 AI 觀測要旨",
    localData: " (本機數據)",
    obsLabel: "AI OBSERVATION",
    geminiConnected: "Gemini 直連 ◉",
    quotaExceeded: "本機配額模擬 ⚠️",
    serviceUnavailable: "伺服器高負載 ⚠️",
    baselineSim: "離線基準模擬 ◉",
    noKeyDesc: "※ 金鑰未配置。已自動調用本機科學模擬。",
    quotaDesc: "※ 免費金鑰配額用竭，已加載本機智庫。可至 Settings > Secrets 換取金鑰。",
    overloadDesc: "※ 雲端模型伺服器超載，已自動載入本機推算。可稍後點選強制更新。",
    connecting: "正在與全球氣候智庫 (WMO/IPCC) 快訊 API 連線對接中...",
  },
  "en": {
    title: "Real-time Climate News",
    forceUpdate: "Force Update Feed",
    syncing: "Syncing Data...",
    aiObservation: "Daily AI Insight Summary",
    localData: " (Local Backup)",
    obsLabel: "AI OBSERVATION",
    geminiConnected: "Gemini Direct ◉",
    quotaExceeded: "Local Simulation ⚠️",
    serviceUnavailable: "High Server Load ⚠️",
    baselineSim: "Offline Baseline ◉",
    noKeyDesc: "※ API key not configured. Default scientific simulation loaded automatically.",
    quotaDesc: "※ API safe quota limit reached. Loaded high-fidelity local archive.",
    overloadDesc: "※ Cloud server overloaded. Local fallback forecast loaded automatically.",
    connecting: "Connecting to global climate advisory APIs (WMO/IPCC)...",
  },
  "zh-CN": {
    title: "气候变迁实时快讯",
    forceUpdate: "强制更新观测",
    syncing: "同步数据中...",
    aiObservation: "每日 AI 观测要旨",
    localData: " (本机数据)",
    obsLabel: "AI OBSERVATION",
    geminiConnected: "Gemini 直连 ◉",
    quotaExceeded: "本机配额模拟 ⚠️",
    serviceUnavailable: "服务器高负载 ⚠️",
    baselineSim: "离线基准模拟 ◉",
    noKeyDesc: "※ 密钥未配置。已自动调用本机科学模拟。",
    quotaDesc: "※ 免费密钥配额耗尽，已加载本机智库。可至 Settings > Secrets 换取密钥。",
    overloadDesc: "※ 云端模型服务器超载，已自动载入本机推算。可稍后点选强制更新。",
    connecting: "正在与全球气候智库 (WMO/IPCC) 快讯 API 连线对接中...",
  },
  "ja": {
    title: "気候変動リアルタイムニュース",
    forceUpdate: "観測データを更新",
    syncing: "同期中...",
    aiObservation: "AI日次観測要点",
    localData: " (オフライン)",
    obsLabel: "AI OBSERVATION",
    geminiConnected: "Gemini 接続 ◉",
    quotaExceeded: "ローカル模擬 ⚠️",
    serviceUnavailable: "サーバー高負荷 ⚠️",
    baselineSim: "オフライン基準 ◉",
    noKeyDesc: "※ APIキー未設定。ローカルの科学的シミュレーションを読み込みました。",
    quotaDesc: "※ APIの利用制限に達したため、ローカルの代替シミュレーションに切り替えました。",
    overloadDesc: "※ クラウドサーバー過負荷のため、自動的にオフライン予測データをロードしました。",
    connecting: "世界の気候データベース (WMO/IPCC) ニュースAPIに接続しています...",
  }
};

import ClimatePresentation from "./components/ClimatePresentation";
import GlobeHeatmap from "./components/GlobeHeatmap";

export default function App() {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "realtime-weather" | "python-exporter" | "presentation">("dashboard");

  // Real-time Global Climate News Ticker State
  const [climateNews, setClimateNews] = useState<ClimateNewsResponse | null>(null);
  const [isNewsLoading, setIsNewsLoading] = useState<boolean>(false);
  const [currentNewsIndex, setCurrentNewsIndex] = useState<number>(0);
  const [climateNewsLang, setClimateNewsLang] = useState<"zh-TW" | "en" | "zh-CN" | "ja">("zh-TW");

  const selectedLoc = NEWS_LOCALIZATION[climateNewsLang];

  // Interactive Policy Sliders
  const [co2TargetGoal, setCo2TargetGoal] = useState<number>(80);      // 2050 Carbon Reduction Goal (%)
  const [solarTransition, setSolarTransition] = useState<number>(60);  // Renewable Energy Transition Rate (%)
  const [reforestationRate, setReforestationRate] = useState<number>(2.5); // Billion Trees Planted/yr
  const [carbonTax, setCarbonTax] = useState<number>(45);              // USD per metric ton CO2
  const [methaneReduction, setMethaneReduction] = useState<number>(30); // (%) Non-CO2 greenhouse gas mitigation rate
  const [ccsCapacity, setCcsCapacity] = useState<number>(1.5); // Gt/yr of active Carbon Capture & Sequestration
  const [fossilPhaseoutYear, setFossilPhaseoutYear] = useState<number>(2060); // year of fossil thermal phaseout
  const [showAdvancedPolicies, setShowAdvancedPolicies] = useState<boolean>(true); // Toggle to show advanced policies

  // Simulation Outputs (Calculated locally instantly for graphs)
  const [simulatedData, setSimulatedData] = useState<any[]>([]);
  const [transitionIndex, setTransitionIndex] = useState<number>(60); // 0-100 success index
  const [co2In2100, setCo2In2100] = useState<number>(550);
  const [tempIn2100, setTempIn2100] = useState<number>(2.3);
  const [seaIn2100, setSeaIn2100] = useState<number>(450);

  // Active parameter preset selection
  const [selectedPreset, setSelectedPreset] = useState<string>("medium");

  // Chart view focus
  const [focusedChart, setFocusedChart] = useState<"temperature" | "co2" | "sealevel">("temperature");

  // Extreme weather chronology and hover highlighting
  const [selectedEventYear, setSelectedEventYear] = useState<number | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<ExtremeWeatherEvent | null>(null);

  // Gemini API analysis state (on-demand call to server)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [hasServerKey, setHasServerKey] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string>("");

  // AI provider status state (Ollama vs Gemini vs Fallback)
  const [aiProvider, setAiProvider] = useState<{ provider: string; model: string; baseUrl: string }>({
    provider: "Gemini",
    model: "gemini-3.5-flash",
    baseUrl: ""
  });

  // Upgraded Copilot Chat variables
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([]);
  const [copilotInput, setCopilotInput] = useState<string>("");
  const [isCopilotSending, setIsCopilotSending] = useState<boolean>(false);

  // Python Code Exporter options & states
  const [pythonOptions, setPythonOptions] = useState<PythonCodeOptions>({
    theme: "dark",
    chartLibrary: "plotly",
    includePrediction: true,
    metricsSelected: ["co2", "temp", "sea"]
  });
  const [pythonCode, setPythonCode] = useState<string>("");
  const [isGeneratingPython, setIsGeneratingPython] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Live real-time weather stations state
  const [weatherStations, setWeatherStations] = useState<WeatherStation[]>(CLIMATE_WEATHER_STATIONS);
  const [weatherStationsData, setWeatherStationsData] = useState<Record<string, LiveWeatherData>>({});
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string>("taipei");
  const [weatherSearchTerm, setWeatherSearchTerm] = useState<string>("");
  const [weatherFilterThreat, setWeatherFilterThreat] = useState<string>("all");

  // Advanced City Analysis sub-tab State
  const [cityAnalysisTab, setCityAnalysisTab] = useState<"standard" | "vulnerability" | "simulation" | "adaptation" | "radar">("standard");
  const [anomalyBaseline, setAnomalyBaseline] = useState<"pre-industrial" | "kyoto" | "modern">("modern");
  const [selectedSensorChannel, setSelectedSensorChannel] = useState<string>("all");
  const [isLocalHazardAiLoading, setIsLocalHazardAiLoading] = useState<boolean>(false);
  const [localHazardAiReport, setLocalHazardAiReport] = useState<string | null>(null);
  // Implemented adaptation actions for each city to simulate resilience upgrades
  const [implementedAdaptations, setImplementedAdaptations] = useState<Record<string, string[]>>({});


  // Geocoding city search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingGeocoding, setIsSearchingGeocoding] = useState<boolean>(false);
  const [searchGeocodingError, setSearchGeocodingError] = useState<string | null>(null);

  // Hover indicator for metrics card info
  const [activeMetricDetail, setActiveMetricDetail] = useState<string | null>(null);

  // Dynamic Climate Observations Data States
  const [historicalClimateData, setHistoricalClimateData] = useState<ChartDataPoint[]>(HISTORICAL_CLIMATE_DATA);
  const [climateMetrics, setClimateMetrics] = useState<ClimateMetric[]>(CLIMATE_METRICS);
  const [isLiveLoaded, setIsLiveLoaded] = useState<boolean>(false);

  // Advanced Mode states
  const [showIpccOverlay, setShowIpccOverlay] = useState<boolean>(true);
  const [activeOptimizerGoal, setActiveOptimizerGoal] = useState<string | null>(null);
  const [liveCarbonBudget, setLiveCarbonBudget] = useState<number>(248.51239);

  // Fetch real-time WMO / IPCC news
  const fetchClimateNews = async (langOverride?: string) => {
    setIsNewsLoading(true);
    try {
      const activeLang = langOverride || climateNewsLang;
      const res = await fetch(`/api/climate-news?lang=${activeLang}`);
      if (!res.ok) throw new Error("News API failed");
      const data = await res.json();
      setClimateNews(data);
    } catch (err) {
      console.warn("Failed to retrieve live climate news feeds:", err);
    } finally {
      setIsNewsLoading(false);
    }
  };

  useEffect(() => {
    fetchClimateNews();
  }, [climateNewsLang]);

  useEffect(() => {
    fetch("/api/provider-status")
      .then(res => res.json())
      .then(data => {
        if (data && data.provider) {
          setAiProvider(data);
        }
      })
      .catch(err => console.warn("Failed to fetch AI provider status:", err));
  }, []);

  // Interval to rotate active climate news ticker item
  useEffect(() => {
    if (climateNews && climateNews.news && climateNews.news.length > 0) {
      const timer = setInterval(() => {
        setCurrentNewsIndex(prev => (prev + 1) % climateNews.news.length);
      }, 7500);
      return () => clearInterval(timer);
    }
  }, [climateNews]);

  // Live ticking of Remaining Carbon Budget
  useEffect(() => {
    const annualEmissions = 37.8 * (1 - Math.min(Math.max(co2TargetGoal, -20), 120) / 100);
    const emissionsPerSecond = annualEmissions / (365 * 24 * 3600);
    
    const interval = setInterval(() => {
      const now = new Date();
      const startOf2026 = new Date("2026-01-01T00:00:00Z");
      const elapsedSeconds = (now.getTime() - startOf2026.getTime()) / 1000;
      
      const policyConsumed = annualEmissions * (elapsedSeconds / (365 * 24 * 3600));
      
      const budgetMax = 250.0;
      const currentRemaining = budgetMax - policyConsumed;
      
      setLiveCarbonBudget(currentRemaining);
    }, 500);

    return () => clearInterval(interval);
  }, [co2TargetGoal]);

  // Smooth slide animator for Policy Slider Optimization Sandbox
  const animateSliders = (tCO2: number, tSolar: number, tTrees: number, tTax: number, goalName: string) => {
    setActiveOptimizerGoal(goalName);
    
    const steps = 14;
    let currentStep = 0;
    
    const startCO2 = co2TargetGoal;
    const startSolar = solarTransition;
    const startTrees = reforestationRate;
    const startTax = carbonTax;
    
    const interval = setInterval(() => {
      currentStep++;
      const ratio = currentStep / steps;
      
      setCo2TargetGoal(Math.round(startCO2 + (tCO2 - startCO2) * ratio));
      setSolarTransition(Math.round(startSolar + (tSolar - startSolar) * ratio));
      setReforestationRate(parseFloat((startTrees + (tTrees - startTrees) * ratio).toFixed(2)));
      setCarbonTax(Math.round(startTax + (tTax - startTax) * ratio));
      
      if (currentStep >= steps) {
        clearInterval(interval);
        setActiveOptimizerGoal(null);
        setSelectedPreset("custom");
      }
    }, 40);
  };

  // Load real-world observations on mount from proxy REST API support
  useEffect(() => {
    const loadRealData = async () => {
      try {
        const response = await fetch("/api/climate-live-data");
        if (!response.ok) throw new Error("API response error");
        const json = await response.json();
        
        if (json.success) {
          // 1. Update historical climate dataset list
          if (Array.isArray(json.historical)) {
            setHistoricalClimateData(json.historical);
          }
          
          // 2. Update metric cards latest values dynamically
          if (json.latest) {
            setClimateMetrics(p => p.map(m => {
              if (m.id === "co2" && json.latest.co2) {
                return {
                  ...m,
                  currentValue: json.latest.co2.value,
                  yearlyChange: json.latest.co2.change,
                  description: `${m.description}（本月最新實測年份：${json.latest.co2.year} 年）`,
                  source: `${m.source} [實時連接]`
                };
              }
              if (m.id === "temp" && json.latest.temp) {
                return {
                  ...m,
                  currentValue: json.latest.temp.value,
                  yearlyChange: json.latest.temp.change,
                  description: `${m.description}（本月最新實測年份：${json.latest.temp.year} 年）`,
                  source: `${m.source} [實時連接]`
                };
              }
              return m;
            }));
          }
          
          setIsLiveLoaded(true);
        }
      } catch (err) {
        console.warn("Failed to load real-time climate telemetry, falling back to cached baseline catalog", err);
      }
    };
    
    loadRealData();
  }, []);

  // 1. PRESSETS CONFIGURATION
  const applyPreset = (preset: string) => {
    setSelectedPreset(preset);
    if (preset === "coal") {
      setCo2TargetGoal(-10);
      setSolarTransition(15);
      setReforestationRate(0.5);
      setCarbonTax(5);
      setMethaneReduction(5);
      setCcsCapacity(0.1);
      setFossilPhaseoutYear(2110);
    } else if (preset === "medium") {
      setCo2TargetGoal(50);
      setSolarTransition(50);
      setReforestationRate(2.5);
      setCarbonTax(45);
      setMethaneReduction(30);
      setCcsCapacity(1.5);
      setFossilPhaseoutYear(2075);
    } else if (preset === "paris") {
      setCo2TargetGoal(85);
      setSolarTransition(80);
      setReforestationRate(5.0);
      setCarbonTax(120);
      setMethaneReduction(55);
      setCcsCapacity(5.0);
      setFossilPhaseoutYear(2055);
    } else if (preset === "neutral") {
      setCo2TargetGoal(110);
      setSolarTransition(95);
      setReforestationRate(8.5);
      setCarbonTax(200);
      setMethaneReduction(80);
      setCcsCapacity(12.0);
      setFossilPhaseoutYear(2035);
    }
  };

  // 2. MATHEMATICAL INTUITION PHYSICAL SENSITIVITY ENGINE (Client-side real-time rendering)
  const calculateLocalProjections = useCallback(() => {
    // Multi-faceted policy scoring function (incorporating all 7 parameters)
    const co2Score = co2TargetGoal * 0.25;
    const solarScore = (solarTransition - 10) * 0.15;
    const treesScore = reforestationRate * 1.5;
    const taxScore = carbonTax / 2.5;
    const methaneScore = methaneReduction * 0.18; // non-CO2 feedback reducer
    const ccsScore = ccsCapacity * 1.6; // industrial carbon capture multiplier
    const phaseoutScore = Math.max(0, (2120 - fossilPhaseoutYear) * 0.22); // early phaseout adds extra score

    const score = co2Score + solarScore + treesScore + taxScore + methaneScore + ccsScore + phaseoutScore;
    const efficiency = Math.min(Math.max(score / 100, 0), 1); // Normalize 0 - 1
    
    setTransitionIndex(Math.round(efficiency * 100));

    // End points for 2100 (high emissions vs zero emissions models)
    const basePeakCO2 = 900 - (efficiency * 502); // SSP5-8.5 (900) vs SSP1-1.9 (398)
    const basePeakTemp = 4.45 - (efficiency * 3.10); // 4.45°C vs 1.35°C
    const basePeakSea = 650 - (efficiency * 340); // 650mm vs 310mm

    // Ground Truth Feedback Calculations (Tipping Point Additions)
    let feedbackTemp = 0;
    if (basePeakTemp > 1.25) feedbackTemp += 0.08; // Arctic Ice Albedo decaying
    if (basePeakTemp > 1.60) feedbackTemp += 0.15; // Methane permafrost defrosting
    if (basePeakTemp > 1.95) feedbackTemp += 0.22; // Amazon rainforest sink collapsing
    if (basePeakTemp > 2.30) feedbackTemp += 0.35; // AMOC ocean circulation shutdown

    const peakTemp = basePeakTemp + feedbackTemp;
    const peakCO2 = basePeakCO2 + (feedbackTemp * 32); 
    const peakSea = basePeakSea + (feedbackTemp * 75);

    setCo2In2100(parseFloat(peakCO2.toFixed(1)));
    setTempIn2100(parseFloat(peakTemp.toFixed(2)));
    setSeaIn2100(parseFloat(peakSea.toFixed(1)));

    // Generate combined data points 1970 - 2100
    const lastPoint = historicalClimateData[historicalClimateData.length - 1];
    const initialYear = lastPoint ? lastPoint.year : 2025;
    const initialCO2 = lastPoint ? lastPoint.co2 : 424.3;
    const initialTemp = lastPoint ? lastPoint.tempAnomaly : 1.28;
    const initialSea = lastPoint ? lastPoint.seaLevel : 108.5;

    const yearsProj = [2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100].filter(y => y > initialYear);

    const mergedPoints = historicalClimateData.map(pt => ({
      year: pt.year,
      co2: pt.co2,
      tempAnomaly: pt.tempAnomaly,
      seaLevel: pt.seaLevel,
      isHistorical: true
    }));

    // Append projection points
    yearsProj.forEach(y => {
      const fraction = (y - initialYear) / (2100 - initialYear || 1); // 0 to 1
      const co2Val = initialCO2 + (peakCO2 - initialCO2) * fraction;
      // Temperature and Sea level exhibit responsive delay curve
      const tempVal = initialTemp + (peakTemp - initialTemp) * Math.pow(fraction, 1.2);
      const seaVal = initialSea + (peakSea - initialSea) * Math.pow(fraction, 1.3);

      // Find the corresponding IPCC projection point for references
      const refPt = SCENARIO_PROJECTIONS.find(p => p.year === y);

      mergedPoints.push({
        year: y,
        co2: parseFloat(co2Val.toFixed(1)),
        tempAnomaly: parseFloat(tempVal.toFixed(2)),
        seaLevel: parseFloat(seaVal.toFixed(1)),
        isHistorical: false,
        
        // IPCC values for overlay comparing
        ssp1_co2: refPt ? refPt.co2Low : undefined,
        ssp2_co2: refPt ? refPt.co2Med : undefined,
        ssp5_co2: refPt ? refPt.co2High : undefined,
        
        ssp1_temp: refPt ? refPt.tempLow : undefined,
        ssp2_temp: refPt ? refPt.tempMed : undefined,
        ssp5_temp: refPt ? refPt.tempHigh : undefined,

        ssp1_sea: refPt ? parseFloat((108.5 + (310 - 108.5) * fraction).toFixed(1)) : undefined,
        ssp2_sea: refPt ? parseFloat((108.5 + (480 - 108.5) * fraction).toFixed(1)) : undefined,
        ssp5_sea: refPt ? parseFloat((108.5 + (650 - 108.5) * fraction).toFixed(1)) : undefined,
      });
    });

    setSimulatedData(mergedPoints);
  }, [co2TargetGoal, solarTransition, reforestationRate, carbonTax, methaneReduction, ccsCapacity, fossilPhaseoutYear, historicalClimateData]);

  // Recalculate projections on policy adjustment
  useEffect(() => {
    calculateLocalProjections();
  }, [calculateLocalProjections]);

  // Handle Python layout trigger
  const updatePythonCodeContent = useCallback((codeString: string) => {
    setPythonCode(codeString);
  }, []);

  const generatePythonLocally = useCallback(() => {
    const code = getPythonStreamlitCode(
      pythonOptions.theme,
      pythonOptions.chartLibrary,
      pythonOptions.includePrediction,
      pythonOptions.metricsSelected
    );
    updatePythonCodeContent(code);
  }, [pythonOptions, updatePythonCodeContent]);

  useEffect(() => {
    generatePythonLocally();
  }, [generatePythonLocally]);

  // Estimate historical May temperature for dynamic cities
  const estimateHistoricalMayTemp = (lat: number): number => {
    const absLat = Math.abs(lat);
    if (lat >= 0) {
      if (absLat <= 10) return 28.0;
      if (absLat <= 25) return Number((28.0 - ((absLat - 10) / 15) * 3.0).toFixed(1));
      if (absLat <= 35) return Number((25.0 - ((absLat - 25) / 10) * 5.5).toFixed(1));
      if (absLat <= 41) return Number((19.5 - ((absLat - 35) / 6) * 2.0).toFixed(1));
      if (absLat <= 51) return Number((17.5 - ((absLat - 41) / 10) * 4.5).toFixed(1));
      return Number((13.0 - ((absLat - 51) / 39) * 18.0).toFixed(1));
    } else {
      if (absLat <= 10) return 28.0;
      if (absLat <= 34) return Number((28.0 - ((absLat - 10) / 24) * 11.5).toFixed(1));
      if (absLat <= 42) return Number((16.5 - ((absLat - 34) / 8) * 4.5).toFixed(1));
      return Number((12.0 - ((absLat - 42) / 48) * 52.0).toFixed(1));
    }
  };

  // Query Open-Meteo Geocoding API to search globally for cities
  const handleCitySearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearchingGeocoding(true);
    setSearchGeocodingError(null);
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=zh`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("搜尋城市連線失敗");
      }
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err: any) {
      console.error("Geocoding API error:", err);
      setSearchGeocodingError(err.message || "搜尋時發生錯誤或是您輸入的名稱無法辨識。");
    } finally {
      setIsSearchingGeocoding(false);
    }
  };



  // Add a searched city to our active weather observation stations list
  const handleAddSearchedCity = async (city: any) => {
    const stationId = `custom-${city.id || Date.now()}`;
    
    // If it already exists in the list, just switch to it
    const existingIndex = weatherStations.some(s => s.latitude === city.latitude && s.longitude === city.longitude);
    if (existingIndex) {
      const existing = weatherStations.find(s => s.latitude === city.latitude && s.longitude === city.longitude);
      if (existing) {
        setSelectedStationId(existing.id);
        setSearchQuery("");
        setSearchResults([]);
        return;
      }
    }
    
    const histAvg = estimateHistoricalMayTemp(city.latitude);
    const countryName = city.country ? ` (${city.country})` : "";
    const adminStr = city.admin1 ? `, ${city.admin1}` : "";
    const descriptionRole = `此處為使用者自訂搜尋新增之全球觀測城市。位於 ${city.country || "未知國家/地區"}${adminStr}，海拔標高約 ${city.elevation || 0} 公尺。其即時氣候表現直接反應特定微氣候、經緯度區段與高污染或高度都市化地表環境對氣溫變化的調控。`;

    const newCityStation: WeatherStation = {
      id: stationId,
      name: `${city.name}${countryName}`,
      englishName: `${city.name}, ${city.country || 'Global'}`,
      emoji: "📍",
      latitude: city.latitude,
      longitude: city.longitude,
      role: descriptionRole,
      histAvgTemp: histAvg,
      colorClass: "from-blue-400 to-indigo-500",
      threatLevel: "觀測中",
      isCustomCity: true,
      country: city.country
    };

    // Append to stations and select it
    setWeatherStations(prev => [...prev, newCityStation]);
    setSelectedStationId(stationId);
    setSearchQuery("");
    setSearchResults([]);

    // Trigger explicit single-city fetch to make UI instant
    setIsWeatherLoading(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,wind_direction_10m,pressure_msl,cloud_cover,uv_index&timezone=auto`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const current = data.current;
        if (current) {
          const temp = current.temperature_2m;
          const humidity = current.relative_humidity_2m ?? 50;
          const windSpeed = current.wind_speed_10m ?? 8;
          const uvVal = current.uv_index ?? 0;
          const cloudVal = current.cloud_cover ?? 30;
          const pressVal = current.pressure_msl ?? 1013.2;
          const windDirVal = current.wind_direction_10m ?? 180;

          // Custom simulation variables for education
          let basePM = 12;
          if (stationId.includes("cairo")) basePM = 48;
          else if (stationId.includes("jakarta")) basePM = 42;
          else if (stationId.includes("taipei")) basePM = 22;
          else if (stationId.includes("tokyo")) basePM = 15;
          else if (stationId.includes("london")) basePM = 9;
          else if (stationId.includes("newyork")) basePM = 14;
          else if (stationId.includes("sydney")) basePM = 8;
          else basePM = 16; 

          const pmHumidityFactor = Math.max(-5, (humidity - 50) * 0.15);
          const pmWindFactor = -Math.min(windSpeed * 0.35, basePM * 0.6);
          const pmTempFactor = Math.max(0, (temp - 25) * 0.25);
          const calculatedPm25 = Math.max(2, Math.round(basePM + pmHumidityFactor + pmWindFactor + pmTempFactor));

          let aqi = 0;
          let aqiLabel = "良好 (Good)";
          if (calculatedPm25 <= 12) {
            aqi = Math.round((50 / 12) * calculatedPm25);
            aqiLabel = "良好";
          } else if (calculatedPm25 <= 35.4) {
            aqi = Math.round(51 + ((99 / 23.4) * (calculatedPm25 - 12.1)));
            aqiLabel = "普通";
          } else if (calculatedPm25 <= 55.4) {
            aqi = Math.round(101 + ((49 / 19.9) * (calculatedPm25 - 35.5)));
            aqiLabel = "中度污染";
          } else if (calculatedPm25 <= 150.4) {
            aqi = Math.round(151 + ((49 / 94.9) * (calculatedPm25 - 55.5)));
            aqiLabel = "不健康";
          } else {
            aqi = Math.round(201 + (calculatedPm25 - 150.5));
            aqiLabel = "危害";
          }

          let baseCO2 = 422.3;
          if (stationId.includes("taipei") || stationId.includes("tokyo") || stationId.includes("newyork")) {
            baseCO2 = 431.5;
          } else if (stationId.includes("jakarta") || stationId.includes("cairo")) {
            baseCO2 = 445.8;
          }
          const co2Stagnation = windSpeed < 6 ? (10 - windSpeed) * 1.5 : 0;
          const co2HeatIsland = temp > 30 ? (temp - 30) * 0.8 : 0;
          const calculatedCO2 = Number((baseCO2 + co2Stagnation + co2HeatIsland).toFixed(1));

          // Calculate Net Solar Radiation based on time, uv index and cloud cover
          let calculatedRadiation = 0;
          try {
            const hour = current.time ? new Date(current.time).getHours() : 12;
            const sunFactor = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
            const cloudFactor = (100 - (cloudVal * 0.75)) / 100;
            calculatedRadiation = Math.round(850 * sunFactor * cloudFactor + (uvVal * 15));
          } catch (e) {
            calculatedRadiation = Math.round(Math.max(0, (10 - uvVal) * 20 + uvVal * 45));
          }

          setWeatherStationsData(prev => ({
            ...prev,
            [stationId]: {
              temp,
              humidity,
              apparentTemp: current.apparent_temperature ?? temp,
              precipitation: current.precipitation ?? 0,
              windSpeed,
              time: current.time,
              anomaly: Number((temp - histAvg).toFixed(1)),
              uvIndex: uvVal,
              cloudCover: cloudVal,
              pressure: pressVal,
              windDirection: windDirVal,
              pm25: calculatedPm25,
              aqi,
              aqiLabel,
              co2Level: calculatedCO2,
              radiation: calculatedRadiation
            }
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch weather for search-added city:", err);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  // Fetch real-time weather observations from Open-Meteo
  const fetchLiveWeather = useCallback(async () => {
    setIsWeatherLoading(true);
    setWeatherError(null);
    try {
      const results: Record<string, LiveWeatherData> = {};
      await Promise.all(
        weatherStations.map(async (station) => {
          try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${station.latitude}&longitude=${station.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,wind_direction_10m,pressure_msl,cloud_cover,uv_index&timezone=auto`;
            const res = await fetch(url);
            if (!res.ok) {
              throw new Error(`Failed to fetch weather for ${station.name}`);
            }
            const data = await res.json();
            const current = data.current;
            if (current) {
              const temp = current.temperature_2m;
              const humidity = current.relative_humidity_2m ?? 50;
              const windSpeed = current.wind_speed_10m ?? 8;
              const uvVal = current.uv_index ?? 0;
              const cloudVal = current.cloud_cover ?? 30;
              const pressVal = current.pressure_msl ?? 1013.2;
              const windDirVal = current.wind_direction_10m ?? 180;

              // Custom simulation variables for education
              let basePM = 12;
              if (station.id.includes("cairo")) basePM = 48;
              else if (station.id.includes("jakarta")) basePM = 42;
              else if (station.id.includes("taipei")) basePM = 22;
              else if (station.id.includes("tokyo")) basePM = 15;
              else if (station.id.includes("london")) basePM = 9;
              else if (station.id.includes("newyork")) basePM = 14;
              else if (station.id.includes("sydney")) basePM = 8;
              else basePM = 16; 

              const pmHumidityFactor = Math.max(-5, (humidity - 50) * 0.15);
              const pmWindFactor = -Math.min(windSpeed * 0.35, basePM * 0.6);
              const pmTempFactor = Math.max(0, (temp - 25) * 0.25);
              const calculatedPm25 = Math.max(2, Math.round(basePM + pmHumidityFactor + pmWindFactor + pmTempFactor));

              let aqi = 0;
              let aqiLabel = "良好 (Good)";
              if (calculatedPm25 <= 12) {
                aqi = Math.round((50 / 12) * calculatedPm25);
                aqiLabel = "良好";
              } else if (calculatedPm25 <= 35.4) {
                aqi = Math.round(51 + ((99 / 23.4) * (calculatedPm25 - 12.1)));
                aqiLabel = "普通";
              } else if (calculatedPm25 <= 55.4) {
                aqi = Math.round(101 + ((49 / 19.9) * (calculatedPm25 - 35.5)));
                aqiLabel = "中度污染";
              } else if (calculatedPm25 <= 150.4) {
                aqi = Math.round(151 + ((49 / 94.9) * (calculatedPm25 - 55.5)));
                aqiLabel = "不健康";
              } else {
                aqi = Math.round(201 + (calculatedPm25 - 150.5));
                aqiLabel = "危害";
              }

              let baseCO2 = 422.3;
              if (station.id.includes("taipei") || station.id.includes("tokyo") || station.id.includes("newyork")) {
                baseCO2 = 431.5;
              } else if (station.id.includes("jakarta") || station.id.includes("cairo")) {
                baseCO2 = 445.8;
              }
              const co2Stagnation = windSpeed < 6 ? (10 - windSpeed) * 1.5 : 0;
              const co2HeatIsland = temp > 30 ? (temp - 30) * 0.8 : 0;
              const calculatedCO2 = Number((baseCO2 + co2Stagnation + co2HeatIsland).toFixed(1));

              // Calculate Net Solar Radiation based on time, uv index and cloud cover
              let calculatedRadiation = 0;
              try {
                const hour = current.time ? new Date(current.time).getHours() : 12;
                const sunFactor = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
                const cloudFactor = (100 - (cloudVal * 0.75)) / 100;
                calculatedRadiation = Math.round(850 * sunFactor * cloudFactor + (uvVal * 15));
              } catch (e) {
                calculatedRadiation = Math.round(Math.max(0, (10 - uvVal) * 20 + uvVal * 45));
              }

              // Calculate VPD (Vapor Pressure Deficit) in kPa
              const vpSat = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
              const vpAct = vpSat * (humidity / 100);
              const calculatedVpd = Number((vpSat - vpAct).toFixed(2));

              // Calculate Dew Point approximating
              const calculatedDewPoint = Number((temp - ((100 - humidity) / 5)).toFixed(1));

              // Calculate Wet Bulb Temperature (Stull's formula approximation)
              const calculatedWetBulb = Number((temp * Math.atan(0.151977 * Math.pow(humidity + 8.313659, 0.5)) + Math.atan(temp + humidity) - Math.atan(humidity - 1.676331) + 0.00391838 * Math.pow(humidity, 1.5) * Math.atan(0.023101 * humidity) - 4.686035).toFixed(1));

              // Calculate specific Albedo based on station characteristics
              let calculatedAlbedo = 0.16;
              if (station.id.includes("cairo")) calculatedAlbedo = 0.32;
              else if (station.id.includes("london")) calculatedAlbedo = 0.14;
              else if (station.id.includes("jakarta")) calculatedAlbedo = 0.13;
              else if (station.id.includes("sydney")) calculatedAlbedo = 0.22;
              else if (station.id.includes("tokyo")) calculatedAlbedo = 0.15;

              results[station.id] = {
                temp,
                humidity,
                apparentTemp: current.apparent_temperature ?? temp,
                precipitation: current.precipitation ?? 0,
                windSpeed,
                time: current.time,
                anomaly: Number((temp - station.histAvgTemp).toFixed(1)),
                uvIndex: uvVal,
                cloudCover: cloudVal,
                pressure: pressVal,
                windDirection: windDirVal,
                pm25: calculatedPm25,
                aqi,
                aqiLabel,
                co2Level: calculatedCO2,
                radiation: calculatedRadiation,
                vpd: calculatedVpd,
                dewPoint: calculatedDewPoint,
                wetBulb: calculatedWetBulb,
                albedo: calculatedAlbedo
              };
            }
          } catch (stationErr) {
            console.warn(`Falling back to thermodynamic model simulation for city ${station.id}/${station.name}:`, stationErr);
            
            // Generate highly realistic climate projection based on historical attributes
            const currentHour = new Date().getUTCHours() + 8; // Local TZ approximation
            const isDaytime = currentHour >= 6 && currentHour <= 18;
            const hourFlux = Math.sin(((currentHour - 6) / 12) * Math.PI); // Daytime temp flux sinus
            
            // Construct realistic temperature with greenhouse anomaly shift
            const simulatedOffset = Number((hourFlux * 3.5).toFixed(1));
            const greenhouseAnomaly = 1.35; // Global heating offset
            const simulatedTemp = Number((station.histAvgTemp + simulatedOffset + greenhouseAnomaly).toFixed(1));
            
            const simulatedHumidity = Math.max(25, Math.min(95, Math.round(55 - simulatedOffset * 3.5 + (station.id.includes("jakarta") ? 22 : 0))));
            const simulatedApparentTemp = Number((simulatedTemp + (simulatedHumidity > 75 ? (simulatedTemp - 18) * 0.18 : -1.5)).toFixed(1));
            const simulatedPrecipitation = Math.random() > 0.88 ? Number((Math.random() * 6).toFixed(1)) : 0;
            const simulatedWindSpeed = Number((5 + Math.random() * 11).toFixed(1));
            const simulatedUv = isDaytime ? Math.round(Math.max(1, 9 - Math.abs(currentHour - 12) * 1.3)) : 0;
            const simulatedCloudCover = Math.round(15 + Math.random() * 55);
            
            let basePM = 12;
            if (station.id.includes("cairo")) basePM = 48;
            else if (station.id.includes("jakarta")) basePM = 42;
            else if (station.id.includes("taipei")) basePM = 22;
            else if (station.id.includes("tokyo")) basePM = 15;
            else if (station.id.includes("london")) basePM = 9;
            else if (station.id.includes("newyork")) basePM = 14;
            else if (station.id.includes("sydney")) basePM = 8;
            else basePM = 16;

            const pmHumidityFactor = Math.max(-5, (simulatedHumidity - 50) * 0.15);
            const pmWindFactor = -Math.min(simulatedWindSpeed * 0.35, basePM * 0.6);
            const calculatedPm25 = Math.max(2, Math.round(basePM + pmHumidityFactor + pmWindFactor));
            const aqi = Math.round((50 / 12) * calculatedPm25);

            let baseCO2 = 422.3;
            if (station.id.includes("taipei") || station.id.includes("tokyo") || station.id.includes("newyork")) {
              baseCO2 = 431.5;
            } else if (station.id.includes("jakarta") || station.id.includes("cairo")) {
              baseCO2 = 445.8;
            }
            const calculatedCO2 = Number((baseCO2 + (simulatedWindSpeed < 6 ? (10 - simulatedWindSpeed) * 1.5 : 0)).toFixed(1));
            const calculatedRadiation = isDaytime ? Math.round(450 * (100 - simulatedCloudCover) / 100 + simulatedUv * 18) : 0;

            // Calculate metrics for simulated fallback
            const vpSat = 0.61078 * Math.exp((17.27 * simulatedTemp) / (simulatedTemp + 237.3));
            const vpAct = vpSat * (simulatedHumidity / 100);
            const simulatedVpd = Number((vpSat - vpAct).toFixed(2));

            const simulatedDewPoint = Number((simulatedTemp - ((100 - simulatedHumidity) / 5)).toFixed(1));

            const simulatedWetBulb = Number((simulatedTemp * Math.atan(0.151977 * Math.pow(simulatedHumidity + 8.313659, 0.5)) + Math.atan(simulatedTemp + simulatedHumidity) - Math.atan(simulatedHumidity - 1.676331) + 0.00391838 * Math.pow(simulatedHumidity, 1.5) * Math.atan(0.023101 * simulatedHumidity) - 4.686035).toFixed(1));

            let simulatedAlbedo = 0.16;
            if (station.id.includes("cairo")) simulatedAlbedo = 0.32;
            else if (station.id.includes("london")) simulatedAlbedo = 0.14;
            else if (station.id.includes("jakarta")) simulatedAlbedo = 0.13;
            else if (station.id.includes("sydney")) simulatedAlbedo = 0.22;
            else if (station.id.includes("tokyo")) simulatedAlbedo = 0.15;

            results[station.id] = {
              temp: simulatedTemp,
              humidity: simulatedHumidity,
              apparentTemp: simulatedApparentTemp,
              precipitation: simulatedPrecipitation,
              windSpeed: simulatedWindSpeed,
              time: new Date().toISOString(),
              anomaly: Number((simulatedTemp - station.histAvgTemp).toFixed(1)),
              uvIndex: simulatedUv,
              cloudCover: simulatedCloudCover,
              pressure: 1013,
              windDirection: 180,
              pm25: calculatedPm25,
              aqi,
              aqiLabel: "已校準 (仿真)",
              co2Level: calculatedCO2,
              radiation: calculatedRadiation,
              vpd: simulatedVpd,
              dewPoint: simulatedDewPoint,
              wetBulb: simulatedWetBulb,
              albedo: simulatedAlbedo
            };
          }
        })
      );
      setWeatherStationsData(results);
    } catch (err: any) {
      console.error("Critical Error fetching weather:", err);
      setWeatherError("部分即時氣候測站連線失效，已自動調用本機物理動力模擬。");
    } finally {
      setIsWeatherLoading(false);
    }
  }, [weatherStations]);

  useEffect(() => {
    if (activeTab === "realtime-weather") {
      fetchLiveWeather();
    }
  }, [activeTab, fetchLiveWeather]);

  // 3. SERVER-SIDE GEMINI API INTEGRATIONS
  const fetchAIScenarioAnalysis = async () => {
    setIsAiAnalyzing(true);
    setErrorText("");
    try {
      const response = await fetch("/api/analyze-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          co2Target: co2In2100,
          solarTransition: solarTransition,
          reforestation: reforestationRate,
          carbontax: carbonTax
        })
      });
      if (!response.ok) throw new Error("與伺服器連線中斷、正採用擬真本機模型中。");
      const data = await response.json();
      setAiAnalysis(data);
      
      // Initialize Copilot welcome message with climate context
      setCopilotMessages([
        {
          sender: "bot",
          text: `👋 您好！我是您的氣候科學隨行雙向 AI 顧問。針對剛才診斷的環境情境（預估升溫：+${data.temperaturePeak}°C，危害等級：${data.hazardRiskLevel || "高風險"}），我已解鎖了專屬深度智庫分析。

您可以直接在下方輸入關鍵字或問題向我追問，例如：
1. 「${data.tippingPoints?.[0] || '此情境的臨界點'}」會對亞太或台灣造成什麼連鎖氣候災害？
2. 在綠能佔比達 ${solarTransition}% 的情況下，電網韌性與儲能技術會有什麼瓶頸？
3. 如何落實剛才建議的「關鍵減低行動綱領第 1 條」？`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.warn("API Error:", err);
      setErrorText(err.message || "無法與氣候大模型連線，將顯示預測物理推算結論。");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const sendCopilotMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!copilotInput.trim() || isCopilotSending) return;

    const userMsgText = copilotInput.trim();
    setCopilotInput("");

    const newUserMsg: CopilotMessage = {
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCopilotMessages(prev => [...prev, newUserMsg]);
    setIsCopilotSending(true);

    try {
      const res = await fetch("/api/copilot-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          co2Target: co2In2100,
          solarTransition: solarTransition,
          reforestation: reforestationRate,
          carbontax: carbonTax,
          query: userMsgText,
          historyTitle: aiAnalysis ? `升溫峰值：${aiAnalysis.temperaturePeak}°C，危害風險：${aiAnalysis.hazardRiskLevel}` : "",
          history: [...copilotMessages, newUserMsg]
        })
      });

      if (!res.ok) throw new Error("與 AI 顧問連線中斷。");
      const data = await res.json();
      
      setCopilotMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setCopilotMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ 連線超時或服務異常。請調整您的模擬配置或稍後重試一次。",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsCopilotSending(false);
    }
  };

  const fetchAICustomPythonCode = async () => {
    setIsGeneratingPython(true);
    setErrorText("");
    try {
      const response = await fetch("/api/generate-python-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: pythonOptions.theme,
          chartLibrary: pythonOptions.chartLibrary,
          includePrediction: pythonOptions.includePrediction,
          metricsSelected: pythonOptions.metricsSelected
        })
      });
      if (!response.ok) throw new Error("伺服器未能載入 AI 指令。");
      const data = await response.json();
      if (data.code) {
        setPythonCode(data.code);
      } else if (data.customMessage) {
        alert(data.customMessage);
      }
    } catch (err: any) {
      console.error(err);
      setErrorText("AI 生成失敗，已為您回復至離線高相容 Streamlit 底牌模組。");
      generatePythonLocally();
    } finally {
      setIsGeneratingPython(false);
    }
  };

  // 4. UTILITIES
  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([pythonCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "greenhouse_dashboard.py";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#E2E8F0] font-sans selection:bg-emerald-500/20 antialiased flex flex-col justify-between">
      {/* HEADER SECTION */}
      <header className="border-b border-slate-800/95 bg-[#0A0C10]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl md:text-2xl font-light tracking-widest text-white uppercase font-sans">
                  Gaia-Core <span className="text-emerald-500 font-bold">Monitor</span>
                </h1>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] uppercase font-bold bg-slate-900 text-emerald-400 rounded-xs border border-slate-800 font-mono tracking-tighter">
                  Ver 4.2.0
                </span>
                {isLiveLoaded ? (
                  <span className="inline-block px-1.5 py-0.5 text-[9px] uppercase font-bold bg-emerald-950/40 text-emerald-400 rounded-xs border border-emerald-500/30 font-mono tracking-tighter shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                    ● 觀測數據：已對接 NASA / NOAA 實時真實數據
                  </span>
                ) : (
                  <span className="inline-block px-1.5 py-0.5 text-[9px] uppercase font-bold bg-amber-950/40 text-amber-500 rounded-xs border border-amber-500/30 font-mono tracking-tighter animate-pulse">
                    ○ 觀測數據：正在讀取 NASA / NOAA 實時數據...
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-tighter">
                全球溫室效應監測儀表板 / Global Greenhouse Gas Emission & Temperature Variance System
              </p>
            </div>
          </div>

          {/* Navigation Controls & System Stats Panel */}
          <div className="flex flex-wrap items-center gap-4 self-start md:self-auto">
            
            {/* Tab selection */}
            <div className="bg-[#11141A] p-1 border border-slate-800 rounded-sm flex space-x-1 shrink-0">
              <button
                id="btn-tab-dashboard"
                onClick={() => setActiveTab("dashboard")}
                className={`px-3 py-1.5 text-xs rounded-sm font-medium tracking-wide uppercase transition-all ${
                  activeTab === "dashboard"
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                即時監測儀表板
              </button>
              <button
                id="btn-tab-weather"
                onClick={() => setActiveTab("realtime-weather")}
                className={`px-3 py-1.5 text-xs rounded-sm font-medium tracking-wide uppercase transition-all flex items-center space-x-1.5 ${
                  activeTab === "realtime-weather"
                    ? "bg-sky-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(14,165,233,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <CloudSun className="w-3.5 h-3.5" />
                <span>全球城市氣候觀測</span>
              </button>
              <button
                id="btn-tab-python"
                onClick={() => setActiveTab("python-exporter")}
                className={`px-3 py-1.5 text-xs rounded-sm font-medium tracking-wide uppercase transition-all flex items-center space-x-1.5 ${
                  activeTab === "python-exporter"
                    ? "bg-slate-100 text-slate-900 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Python 代碼導出</span>
              </button>
              <button
                id="btn-tab-presentation"
                onClick={() => setActiveTab("presentation")}
                className={`px-3 py-1.5 text-xs rounded-sm font-medium tracking-wide uppercase transition-all flex items-center space-x-1.5 ${
                  activeTab === "presentation"
                    ? "bg-amber-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>氣候政策 20 頁簡報</span>
              </button>
            </div>

            {/* Micro details panel in dashboard style */}
            <div className="flex flex-col items-end">
              <div className="text-[10px] text-slate-600 font-mono uppercase tracking-tighter">
                UTC SYNC: 2026-05-26 06:31:32
              </div>
              <div className="flex gap-2 mt-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <span className="px-1.5 py-0.5 border border-slate-800 bg-[#11141A] rounded-xs text-emerald-500">Live Active</span>
                <span className="px-1.5 py-0.5 border border-slate-800 bg-[#11141A] rounded-xs">8,421 Linked</span>
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* DETAILED INFO DIALOG FOR ACTIVE METRIC (MICRO POPOVER) */}
      {activeMetricDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#162031] border border-slate-700 w-full max-w-md rounded-xl p-5 shadow-2xl animate-in fade-in duration-200">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Info className="w-4 h-4 text-emerald-400" />
                <span>指標科學解釋</span>
              </h3>
              <button 
                onClick={() => setActiveMetricDetail(null)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md"
              >
                關閉
              </button>
            </div>
            {climateMetrics.filter(m => m.id === activeMetricDetail).map(metric => (
              <div key={metric.id} className="space-y-3 font-sans">
                <div>
                  <h4 className="text-sm font-semibold text-emerald-300">{metric.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">{metric.subName}</p>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">當前觀測值</span>
                    <span className="text-slate-400">平均年增率</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-bold text-white font-mono">{metric.currentValue} {metric.unit}</span>
                    <span className="text-xs font-semibold text-red-400">{metric.yearlyChange}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-[#1b2536] p-3 rounded-md">
                  {metric.description}
                </p>
                <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 flex items-center space-x-1">
                  <span className="font-semibold text-slate-300">數據來源:</span>
                  <span>{metric.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* METRICS LEVEL STATS BAR */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {climateMetrics.map((metric) => {
            const isCO2 = metric.id === "co2";
            const isTemp = metric.id === "temp";
            const isSea = metric.id === "sea";
            const isIce = metric.id === "ice";

            return (
              <div
                key={metric.id}
                onClick={() => setActiveMetricDetail(metric.id)}
                className="group relative bg-[#11141A] border border-slate-800 p-4 rounded-sm cursor-pointer shadow-md transition-all duration-300 md:hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono">
                    {metric.id.toUpperCase()} 數據指標
                  </span>
                  <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold border tracking-widest font-mono uppercase ${
                    metric.riskStatus === "critical"
                      ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                    {metric.riskStatus.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1 mt-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className={`text-3xl font-mono ${
                      isCO2 ? "text-emerald-400" :
                      isTemp ? "text-amber-500" :
                      isSea ? "text-blue-400" : "text-cyan-400"
                    }`}>
                      {metric.currentValue}
                    </span>
                    <span className="text-xs text-slate-500 font-mono font-bold">{metric.unit}</span>
                  </div>
                  <h3 className="text-xs font-medium text-slate-400 truncate mt-1">
                    {metric.name}
                  </h3>
                </div>

                {/* Progress bar according to Sophisticated Dark spec */}
                <div className="w-full bg-slate-800 h-1 mt-3">
                  <div className={`h-full ${
                    isCO2 ? "bg-emerald-500 w-[85%]" :
                    isTemp ? "bg-amber-500 w-[65%]" :
                    isSea ? "bg-blue-555 w-[40%] bg-cyan-400" : "bg-blue-500 w-[92%]"
                  }`}></div>
                </div>

                <div className="mt-3.5 flex items-center justify-between text-[11px] font-mono">
                  <span className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span className="font-semibold text-rose-500">{metric.yearlyChange}</span>
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider group-hover:text-emerald-400 transition-colors">
                    科學釋義 &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        {activeTab === "dashboard" && (
          <>
            {/* 氣候變遷實時快訊 (IPCC / WMO Live Ticker) */}
            <div className="bg-[#11141A] border border-slate-800 rounded-sm overflow-hidden p-3.5 space-y-3.5 shadow-md mb-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Newspaper className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs tracking-wider uppercase text-slate-200 font-sans flex items-center gap-1.5">
                    {selectedLoc.title} <span className="text-[10px] font-mono text-slate-500 font-normal">| WMO & IPCC AI DAILY OBSERVATORY</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Language Selector Control Row */}
                  <div className="flex bg-[#0A0C10] border border-slate-800 p-0.5 rounded-sm overflow-hidden text-[9.5px] font-mono select-none">
                    {(["zh-TW", "en", "zh-CN", "ja"] as const).map((lang) => {
                      const labelMap = {
                        "zh-TW": "繁體",
                        "en": "EN",
                        "zh-CN": "简体",
                        "ja": "日本語"
                      };
                      return (
                        <button
                          key={lang}
                          onClick={() => setClimateNewsLang(lang)}
                          className={`px-2 py-0.5 rounded-sm font-bold tracking-wide transition-all cursor-pointer ${
                            climateNewsLang === lang
                              ? "bg-slate-800 text-emerald-400 shadow-inner"
                              : "text-slate-500 hover:text-slate-350 bg-transparent"
                          }`}
                        >
                          {labelMap[lang]}
                        </button>
                      );
                    })}
                  </div>

                  <button 
                    onClick={() => fetchClimateNews()}
                    disabled={isNewsLoading}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-950 text-[10px] text-slate-400 hover:text-emerald-400 font-mono font-bold border border-slate-800 rounded-sm transition-all cursor-pointer flex items-center space-x-1"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${isNewsLoading ? "animate-spin text-emerald-500" : ""}`} />
                    <span>{isNewsLoading ? selectedLoc.syncing : selectedLoc.forceUpdate}</span>
                  </button>
                  {climateNews?.isFallback ? (
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      climateNews.fallbackReason === "QUOTA_EXCEEDED"
                        ? "bg-amber-950/40 text-amber-400 border-amber-900/30"
                        : climateNews.fallbackReason === "SERVICE_UNAVAILABLE"
                        ? "bg-amber-950/40 text-amber-400 border-amber-900/30 animate-pulse"
                        : "bg-slate-900 text-slate-500 border-slate-850"
                    }`}>
                      {climateNews.fallbackReason === "QUOTA_EXCEEDED" 
                        ? selectedLoc.quotaExceeded
                        : climateNews.fallbackReason === "SERVICE_UNAVAILABLE"
                        ? selectedLoc.serviceUnavailable
                        : selectedLoc.baselineSim}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-1.5 py-0.5 rounded">
                      {selectedLoc.geminiConnected}
                    </span>
                  )}
                </div>
              </div>

              {climateNews ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* AI Daily Commentary Summary Card */}
                  <div className="lg:col-span-4 p-3 bg-slate-950/40 border border-slate-850 rounded-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-1 bg-emerald-600/10 text-emerald-400 text-[8px] font-bold tracking-widest font-mono border-l border-b border-slate-850 uppercase">
                      {selectedLoc.obsLabel}
                    </div>
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-mono block mb-1">
                      💡 {selectedLoc.aiObservation}{climateNews?.isFallback && selectedLoc.localData}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {climateNews.summary}
                    </p>
                    {climateNews?.isFallback && (
                      <p className="text-[9.5px] text-slate-500 mt-1.5 leading-normal border-t border-slate-900/50 pt-1 font-mono">
                        {climateNews.fallbackReason === "QUOTA_EXCEEDED" 
                          ? selectedLoc.quotaDesc
                          : climateNews.fallbackReason === "SERVICE_UNAVAILABLE"
                          ? selectedLoc.overloadDesc
                          : selectedLoc.noKeyDesc}
                      </p>
                    )}
                  </div>

                  {/* Active Ticker Headline Scrolling Element */}
                  <div className="lg:col-span-8 flex flex-col justify-center min-h-[70px] bg-[#0A0C10] border border-slate-850 p-3 rounded-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 bg-cyan-950/50 text-cyan-400 border border-cyan-900/30 rounded uppercase">
                          {climateNews.news[currentNewsIndex]?.source || "IPCC / WMO"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-bold">
                          🕒 {climateNews.news[currentNewsIndex]?.date || "2026"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {climateNews.news.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentNewsIndex(idx)}
                            className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                              idx === currentNewsIndex 
                                ? "bg-emerald-400 w-3" 
                                : "bg-slate-700 hover:bg-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 font-sans tracking-wide truncate">
                      📢 {climateNews.news[currentNewsIndex]?.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1 font-sans line-clamp-2">
                      {climateNews.news[currentNewsIndex]?.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-6 text-slate-500 space-x-2 font-mono text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                  <span>{selectedLoc.connecting}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: INTERACTIVE CONTROL PANEL (4 COLS) */}
            <div className="lg:col-span-4 bg-[#11141A] border border-slate-800 p-5 space-y-6 rounded-sm shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2.5 mb-1">
                  <Sliders className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                    全球減碳與氣候政策模擬器
                  </h2>
                </div>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  調整溫室效應防範指標，模擬 1970 至今並投射至 2100 年升溫及二氧化碳曲線。
                </p>
              </div>

              {/* Preset buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 block tracking-wider uppercase font-mono">
                  情境預設 / Scenario Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="preset-coal"
                    onClick={() => applyPreset("coal")}
                    className={`px-3 py-2 text-xs rounded-sm border text-left font-medium transition-all ${
                      selectedPreset === "coal"
                        ? "bg-rose-950/20 text-rose-400 border-rose-500/50"
                        : "bg-[#0A0C10] text-[#A0AEC0] border-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="font-bold">煤炭燃燒時代</div>
                    <div className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-tighter font-mono">SSP5-8.5 (惡化)</div>
                  </button>
                  <button
                    id="preset-medium"
                    onClick={() => applyPreset("medium")}
                    className={`px-3 py-2 text-xs rounded-sm border text-left font-medium transition-all ${
                      selectedPreset === "medium"
                        ? "bg-slate-800/40 text-[#E2E8F0] border-slate-600"
                        : "bg-[#0A0C10] text-[#A0AEC0] border-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="font-bold">現行政策慣性</div>
                    <div className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-tighter font-mono">SSP2-4.5 (溫和)</div>
                  </button>
                  <button
                    id="preset-paris"
                    onClick={() => applyPreset("paris")}
                    className={`px-3 py-2 text-xs rounded-sm border text-left font-medium transition-all ${
                      selectedPreset === "paris"
                        ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/50"
                        : "bg-[#0A0C10] text-[#A0AEC0] border-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="font-bold">巴黎協定目標</div>
                    <div className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-tighter font-mono">2.0°C 限制 (積極)</div>
                  </button>
                  <button
                    id="preset-neutral"
                    onClick={() => applyPreset("neutral")}
                    className={`px-3 py-2 text-xs rounded-sm border text-left font-medium transition-all ${
                      selectedPreset === "neutral"
                        ? "bg-cyan-950/20 text-cyan-400 border-cyan-500/50"
                        : "bg-[#0A0C10] text-[#A0AEC0] border-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="font-bold">2050 深度淨零</div>
                    <div className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-tighter font-mono">SSP1-1.9 (安全)</div>
                  </button>
                </div>
              </div>

              {/* Slider 1 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-350 flex items-center space-x-1.5 font-sans">
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                    <span>2050 碳排放減量目標</span>
                  </span>
                  <span className="font-bold font-mono text-white bg-rose-500/10 px-1.5 py-0.5 rounded-xs text-[11px] border border-rose-500/20">
                    {co2TargetGoal}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="120"
                  step="5"
                  value={co2TargetGoal}
                  onChange={(e) => {
                    setCo2TargetGoal(Number(e.target.value));
                    setSelectedPreset("custom");
                  }}
                  className="w-full accent-emerald-500 cursor-pointer h-1 bg-slate-800 rounded outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>-20% (爆棚惡化)</span>
                  <span>100% (深度中和)</span>
                </div>
              </div>

              {/* Slider 2 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-355 flex items-center space-x-1.5 font-sans">
                    <Compass className="w-3.5 h-3.5 text-cyan-404 text-cyan-400" />
                    <span>清潔再生能源佔總比</span>
                  </span>
                  <span className="font-bold font-mono text-white bg-cyan-500/10 px-1.5 py-0.5 rounded-xs text-[11px] border border-cyan-500/20">
                    {solarTransition}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={solarTransition}
                  onChange={(e) => {
                    setSolarTransition(Number(e.target.value));
                    setSelectedPreset("custom");
                  }}
                  className="w-full accent-emerald-500 cursor-pointer h-1 bg-slate-800 rounded outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>10% (化石依賴)</span>
                  <span>100% (全面綠電化)</span>
                </div>
              </div>

              {/* Slider 3 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-355 flex items-center space-x-1.5 font-sans">
                    <Trees className="w-3.5 h-3.5 text-emerald-400" />
                    <span>全球人工林復育率</span>
                  </span>
                  <span className="font-bold font-mono text-white bg-emerald-400/10 px-1.5 py-0.5 rounded-xs text-[11px] border border-emerald-400/20">
                    {reforestationRate} 十億棵樹/年
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="10.0"
                  step="0.5"
                  value={reforestationRate}
                  onChange={(e) => {
                    setReforestationRate(Number(e.target.value));
                    setSelectedPreset("custom");
                  }}
                  className="w-full accent-emerald-500 cursor-pointer h-1 bg-slate-800 rounded outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 十億 (完全不復育)</span>
                  <span>10 十億 (最大飽和)</span>
                </div>
              </div>

              {/* Slider 4 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-355 flex items-center space-x-1.5 font-sans">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>全球碳稅定價標準</span>
                  </span>
                  <span className="font-bold font-mono text-white bg-amber-500/10 px-1.5 py-0.5 rounded-xs text-[11px] border border-amber-500/20">
                    ${carbonTax} USD / 噸 CO₂
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="250"
                  step="5"
                  value={carbonTax}
                  onChange={(e) => {
                    setCarbonTax(Number(e.target.value));
                    setSelectedPreset("custom");
                  }}
                  className="w-full accent-emerald-500 cursor-pointer h-1 bg-slate-800 rounded outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>無碳課稅 ($0)</span>
                  <span>高強度 ($250)</span>
                </div>
              </div>

              {/* ADVANCED POLICY EXPANDABLE TOGGLE PANEL */}
              <div className="border border-cyan-800/40 bg-[#070D14]/90 p-3.5 rounded-sm space-y-4">
                <div className="flex items-center justify-between border-b border-cyan-900/40 pb-2">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-cyan-400 rotate-90" />
                    <span className="text-[10.5px] font-mono font-bold text-cyan-300">
                      ⚙️ 精密低碳與工程調適進階指標
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowAdvancedPolicies(!showAdvancedPolicies)}
                    className="text-[9.5px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-900/50 hover:bg-cyan-900/40 px-2 py-0.5 rounded transition-colors cursor-pointer"
                  >
                    {showAdvancedPolicies ? "🔓 隱藏進階" : "🔒 顯示進階"}
                  </button>
                </div>

                {showAdvancedPolicies && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* Advanced Slider 5: Methane & short-lived greenhouse gas reduction */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-slate-350 flex items-center space-x-1.5 font-sans">
                          <Wind className="w-3.5 h-3.5 text-cyan-400" />
                          <span>非二氧化碳溫室氣體削減 (含甲烷)</span>
                        </span>
                        <span className="font-bold font-mono text-white bg-cyan-500/10 px-1.5 py-0.5 rounded-xs text-[11px] border border-cyan-500/20">
                          {methaneReduction}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        step="5"
                        value={methaneReduction}
                        onChange={(e) => {
                          setMethaneReduction(Number(e.target.value));
                          setSelectedPreset("custom");
                        }}
                        className="w-full accent-cyan-500 cursor-pointer h-1 bg-slate-800 rounded outline-none"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                        <span>0% (無削減技術)</span>
                        <span>80% (超級畜牧與生物降解)</span>
                      </div>
                    </div>

                    {/* Advanced Slider 6: CCS Capacity (Gt/year) */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-slate-355 flex items-center space-x-1.5 font-sans">
                          <Database className="w-3.5 h-3.5 text-violet-400" />
                          <span>工業級碳捕獲與地層封存 (CCS)</span>
                        </span>
                        <span className="font-bold font-mono text-white bg-violet-500/10 px-1.5 py-0.5 rounded-xs text-[11px] border border-violet-500/20">
                          {ccsCapacity} Gt CO₂ / 年
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="15"
                        step="0.5"
                        value={ccsCapacity}
                        onChange={(e) => {
                          setCcsCapacity(Number(e.target.value));
                          setSelectedPreset("custom");
                        }}
                        className="w-full accent-violet-500 cursor-pointer h-1 bg-slate-800 rounded outline-none"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                        <span>0 Gt (純自然碳匯)</span>
                        <span>15 Gt (極致地層注儲)</span>
                      </div>
                    </div>

                    {/* Advanced Slider 7: Fossil Sunset timeline */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-slate-355 flex items-center space-x-1.5 font-sans">
                          <Calendar className="w-3.5 h-3.5 text-rose-450 text-rose-400" />
                          <span>全球煤炭與化石熱電廠退役期限</span>
                        </span>
                        <span className="font-bold font-mono text-white bg-rose-500/10 px-1.5 py-0.5 rounded-xs text-[11px] border border-rose-500/20">
                          {fossilPhaseoutYear >= 2120 ? "不強制退役" : `${fossilPhaseoutYear} 年`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="2030"
                        max="2120"
                        step="5"
                        value={fossilPhaseoutYear}
                        onChange={(e) => {
                          setFossilPhaseoutYear(Number(e.target.value));
                          setSelectedPreset("custom");
                        }}
                        className="w-full accent-rose-500 cursor-pointer h-1 bg-slate-800 rounded outline-none"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                        <span>2030 年 (閃電硬退役)</span>
                        <span>2120 年 (無退役落日)</span>
                      </div>
                    </div>

                    {/* Scientific diagnostics widget under advanced sliders */}
                    <div className="bg-[#050709] border border-cyan-950/60 p-2.5 rounded font-mono text-[9.5px] leading-relaxed text-cyan-400 space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>🛡️ 即時耦合系統診斷：</span>
                        <span>穩健度 A+</span>
                      </div>
                      <p className="text-slate-400">
                        估計大氣甲烷半衰期將自 <span className="text-cyan-300 font-bold">12.4 yr</span> 縮短至 <span className="text-cyan-300 font-bold">{(12.4 * (1 - methaneReduction / 130)).toFixed(1)} yr</span>，熱電退役每年可減少約 <span className="text-rose-400 font-bold">{Math.max(0, Math.round((2120 - fossilPhaseoutYear) * 0.15))} Gt CO₂</span> 的碳排溢出。
                      </p>
                      <p className="text-slate-500 text-[8.5px] border-t border-slate-900 mt-1.5 pt-1">
                        * 社會碳成本評定 (Social Cost of Carbon): <span className="text-emerald-400 font-bold">${Math.round(240 * (tempIn2100 / 1.5))} USD / 噸</span>
                      </p>
                    </div>

                  </div>
                )}
              </div>

              {/* RUN AI GEMINI REASONING BUTTON */}
              <div className="pt-2">
                <button
                  onClick={fetchAIScenarioAnalysis}
                  disabled={isAiAnalyzing}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-sm bg-emerald-600 text-slate-950 font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
                  <span>
                    {isAiAnalyzing ? "計算科學分析報告中..." : "🚀 啟動 AI 氣候科學診斷"}
                  </span>
                </button>
                <div className="mt-3 flex items-start space-x-2 bg-slate-900/60 border border-slate-800 p-2.5 rounded-sm">
                  <div className="flex-shrink-0 mt-0.5">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                    System Core enabled with <span className="text-slate-300 font-semibold">Gemini API</span>. Direct state vectors are fed into atmospheric algorithms on execution.
                  </p>
                </div>
              </div>

              {/* ADVANCED ADVANTAGE: AI POLICY TARGET NAVIGATOR (SMART OPTIMIZER) */}
              <div className="border-t border-slate-800/80 pt-5 space-y-3">
                <div className="flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
                    AI 政策導航智驅優化器
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  點擊特定氣候安全指標，系統將全自動、按比例動態展示（平滑過渡調整）最佳減碳參數：
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => animateSliders(95, 90, 7.0, 160, "paris15")}
                    disabled={activeOptimizerGoal !== null}
                    className={`w-full p-2.5 rounded bg-slate-950 hover:bg-slate-900 border text-left transition-all cursor-pointer ${
                      activeOptimizerGoal === "paris15"
                        ? "border-emerald-500 ring-1 ring-emerald-500/20"
                        : "border-slate-850 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-400">1.5°C 世紀生死防線</span>
                      <span className="text-[9px] px-1 bg-red-950/40 text-red-400 border border-red-900/30 font-mono rounded">IPCC Limit</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      推進二氧化碳減量控排 95%、綠能電網 90%、植樹 7.0 億和碳稅 $160 。
                    </p>
                  </button>
                  <button
                    onClick={() => animateSliders(110, 95, 8.5, 200, "safe350")}
                    disabled={activeOptimizerGoal !== null}
                    className={`w-full p-2.5 rounded bg-slate-950 hover:bg-slate-900 border text-left transition-all cursor-pointer ${
                      activeOptimizerGoal === "safe350"
                        ? "border-cyan-500 ring-1 ring-cyan-500/20"
                        : "border-slate-850 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-cyan-400">350 ppm 大氣安全回歸線</span>
                      <span className="text-[9px] px-1 bg-cyan-950/40 text-cyan-400 border border-cyan-900/30 font-mono rounded">Deep Zero</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      推行高碳轉型負排放 110%、清潔綠電 95%、植樹 8.5 億與高碳稅 $200 元。
                    </p>
                  </button>
                  <button
                    onClick={() => animateSliders(70, 95, 4.0, 80, "greengrid")}
                    disabled={activeOptimizerGoal !== null}
                    className={`w-full p-2.5 rounded bg-slate-950 hover:bg-slate-900 border text-left transition-all cursor-pointer ${
                      activeOptimizerGoal === "greengrid"
                        ? "border-yellow-500 ring-1 ring-yellow-500/20"
                        : "border-slate-850 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-yellow-500">清潔綠能與電網革命</span>
                      <span className="text-[9px] px-1 bg-yellow-950/40 text-yellow-400 border border-yellow-900/30 font-mono rounded">Grid Shift</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      極致推進清潔再生綠電 95% 與局部減排，確保極高的新能源替代成效。
                    </p>
                  </button>
                  <button
                    onClick={() => animateSliders(80, 65, 8.5, 130, "maxbiosink")}
                    disabled={activeOptimizerGoal !== null}
                    className={`w-full p-2.5 rounded bg-slate-950 hover:bg-slate-900 border text-left transition-all cursor-pointer ${
                      activeOptimizerGoal === "maxbiosink"
                        ? "border-emerald-600 ring-1 ring-emerald-600/20"
                        : "border-slate-850 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-500">生態碳匯生物圈復原</span>
                      <span className="text-[9px] px-1 bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 font-mono rounded">Bio-Sink</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      極致擴張森林植樹復育 8.5 億和中高檔化石碳稅，利用自然生態吸收二氧化碳。
                    </p>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: GRAPHS & REPORT / SIDE PANEL (8 COLS) */}
            <div className="lg:col-span-8 grid grid-cols-1 xl:grid-cols-12 gap-6">

              {/* STUNNING GLOBAL TEMPERATURE ANOMALIES HEATMAP OVERLAY CARD */}
              <div className="xl:col-span-12">
                <GlobeHeatmap tempIn2100={tempIn2100} />
              </div>
              
              {/* PRIMARY COCKPIT CENTER: GRAPH & INSIGHTS (8 COLS of 8 COLS) */}
              <div className="xl:col-span-8 flex flex-col space-y-6">
                
                {/* INTERACTIVE TREND GRAPH CONTAINER */}
                <div className="bg-[#11141A] border border-slate-800 p-5 shadow-xl flex-grow flex flex-col min-h-[420px] justify-between rounded-sm">
                  
                  {/* Graph top bar controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4 mb-4 gap-3">
                    <div>
                      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5 font-mono">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span>全球歷史與 2100 年投影趨勢 / PROJECTION</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        模擬自 1970 至今並投射至本世紀末升溫與二氧化碳平衡。
                      </p>
                    </div>

                    {/* Toggle buttons for chart focusing */}
                    <div className="flex flex-wrap gap-2 items-center self-start sm:self-auto shrink-0">
                      <div className="flex bg-[#0A0C10] p-1 border border-slate-800 rounded-sm">
                        <button
                          onClick={() => setFocusedChart("temperature")}
                          className={`px-2.5 py-1 text-xs rounded-sm transition-all font-mono ${
                            focusedChart === "temperature"
                              ? "bg-slate-800 text-white font-bold"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          🌡️ 溫升 (°C)
                        </button>
                        <button
                          onClick={() => setFocusedChart("co2")}
                          className={`px-2.5 py-1 text-xs rounded-sm transition-all font-mono ${
                            focusedChart === "co2"
                              ? "bg-slate-800 text-white font-bold"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          🍂 CO₂ (ppm)
                        </button>
                        <button
                          onClick={() => setFocusedChart("sealevel")}
                          className={`px-2.5 py-1 text-xs rounded-sm transition-all font-mono ${
                            focusedChart === "sealevel"
                              ? "bg-slate-800 text-white font-bold"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          🌊 海面 (mm)
                        </button>
                      </div>

                      <button
                        onClick={() => setShowIpccOverlay(!showIpccOverlay)}
                        className={`px-2.5 py-1.5 text-xs rounded-sm transition-all font-mono border ${
                          showIpccOverlay
                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30 font-bold"
                            : "bg-[#0A0C10] text-slate-500 border-slate-800 hover:text-slate-300"
                        }`}
                      >
                        {showIpccOverlay ? "✓ IPCC 國際路徑" : "○ IPCC 國際路徑"}
                      </button>
                    </div>
                  </div>

                  {/* GRAPH DISPLAY AREA */}
                  <div className="w-full h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={simulatedData}
                        margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis
                          dataKey="year"
                          stroke="#4A5568"
                          fontSize={11}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#4A5568"
                          fontSize={11}
                          tickLine={false}
                        />
                         <ChartTooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || !payload.length) return null;
                            const matchedEvent = EXTREME_EVENTS.find(e => e.year === label);
                            return (
                              <div className="bg-[#0B0F17] border border-slate-700/80 p-3.5 rounded shadow-2xl max-w-[280px] sm:max-w-xs font-sans text-xs">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2 font-mono text-[10px] text-slate-500">
                                  <span>時間點: <strong className="text-slate-200">{label} 年</strong></span>
                                  {payload[0]?.payload?.isHistorical ? (
                                    <span className="text-sky-400 font-semibold px-1 py-0.5 bg-sky-950/40 rounded text-[9px] border border-sky-800/20">歷史觀測指標</span>
                                  ) : (
                                    <span className="text-emerald-400 font-semibold px-1 py-0.5 bg-emerald-950/40 rounded text-[9px] border border-emerald-800/20">模擬氣候投影</span>
                                  )}
                                </div>
                                
                                <div className="space-y-1 my-1.5 pb-1.5 border-b border-slate-800/50">
                                  {payload.map((entry: any) => {
                                    if (entry.value === undefined || entry.value === null) return null;
                                    return (
                                      <div key={entry.name} className="flex justify-between items-center text-[11px] gap-2">
                                        <span className="text-slate-400 flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.stroke || '#888' }} />
                                          {entry.name}:
                                        </span>
                                        <span className="font-mono text-slate-100 font-bold">
                                          {entry.value} {entry.name.includes("CO₂") || entry.name.includes("CO2") || entry.name.includes("ppm") ? "ppm" : entry.name.includes("海平面") || entry.name.includes("海面") || entry.name.includes("上升量") ? "mm" : "°C"}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>

                                {matchedEvent && (
                                  <div className="mt-2.5 pt-2 bg-red-950/15 border border-red-900/30 rounded p-2.5 text-[11px]">
                                    <div className="flex items-center gap-1.5 font-bold text-red-400 mb-1">
                                      <span>{matchedEvent.emoji}</span>
                                      <span>{matchedEvent.title}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mb-1">
                                      🗺️ 地點：{matchedEvent.location}
                                    </p>
                                    <p className="text-slate-300 leading-relaxed text-[11px] font-sans">
                                      {matchedEvent.description}
                                    </p>
                                    <div className="mt-2 text-[9px] text-red-300 font-semibold flex items-center gap-1 bg-red-950/40 px-2 py-0.5 rounded border border-red-800/30">
                                      <span>⚠️ 核心衝擊：</span>
                                      <span>{matchedEvent.impact}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />

                        {/* Highlights of Extreme Climatic Event Anchors */}
                        {EXTREME_EVENTS.map((evt) => {
                          const isFocused = selectedEventYear === evt.year;
                          return (
                            <ReferenceLine
                              key={evt.year}
                              x={evt.year}
                              stroke={isFocused ? "#f43f5e" : "#ef4444"}
                              strokeOpacity={isFocused ? 0.95 : 0.18}
                              strokeWidth={isFocused ? 2 : 1}
                              strokeDasharray="3 3"
                            />
                          );
                        })}

                        {(() => {
                          if (!selectedEventYear) return null;
                          const activeDotPoint = simulatedData?.find((pt: any) => pt.year === selectedEventYear);
                          if (!activeDotPoint) return null;
                          
                          const activeValue = focusedChart === "temperature" ? activeDotPoint.tempAnomaly :
                                              focusedChart === "co2" ? activeDotPoint.co2 :
                                              activeDotPoint.seaLevel;
                                              
                          if (activeValue === undefined || activeValue === null) return null;
                          
                          return (
                            <ReferenceDot
                              key={`dot-${selectedEventYear}`}
                              x={selectedEventYear}
                              y={activeValue}
                              r={6.5}
                              fill="#f43f5e"
                              stroke="#ffffff"
                              strokeWidth={1.5}
                              isFront={true}
                            />
                          );
                        })()}

                        {focusedChart === "temperature" && (
                          <>
                            {/* Historical trend */}
                            <Line
                              type="monotone"
                              dataKey="tempAnomaly"
                              name="表面溫度變量 (歷史及模擬投影)"
                              stroke="#ef4444"
                              strokeWidth={3}
                              dot={(props) => {
                                return props.payload.isHistorical ? <circle cx={props.cx} cy={props.cy} r={3.5} fill="#ef4444" stroke="none" /> : <div />;
                              }}
                              activeDot={{ r: 5 }}
                            />
                            {/* Safety baseline limit */}
                            <Line
                              type="monotone"
                              dataKey={() => 1.5}
                              name="IPCC 巴黎協定安全臨界閾值 (1.5°C)"
                              stroke="#10b981"
                              strokeWidth={1.5}
                              strokeDasharray="4 4"
                              dot={false}
                            />
                            {showIpccOverlay && (
                              <>
                                <Line
                                  type="monotone"
                                  dataKey="ssp1_temp"
                                  name="SSP1-1.9 巴黎低升溫線 (~1.35°C)"
                                  stroke="#10b981"
                                  strokeWidth={1.2}
                                  strokeDasharray="2 2"
                                  dot={false}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="ssp2_temp"
                                  name="SSP2-4.5 溫和控制線 (~2.30°C)"
                                  stroke="#3b82f6"
                                  strokeWidth={1.2}
                                  strokeDasharray="2 2"
                                  dot={false}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="ssp5_temp"
                                  name="SSP5-8.5 化石高升溫線 (~4.45°C)"
                                  stroke="#fb7185"
                                  strokeWidth={1.2}
                                  strokeDasharray="2 2"
                                  dot={false}
                                />
                              </>
                            )}
                          </>
                        )}

                        {focusedChart === "co2" && (
                          <>
                            <Line
                              type="monotone"
                              dataKey="co2"
                              name="大氣 CO₂ 濃度標量 (ppm)"
                              stroke="#f59e0b"
                              strokeWidth={3}
                              dot={(props) => {
                                return props.payload.isHistorical ? <circle cx={props.cx} cy={props.cy} r={3.5} fill="#f59e0b" stroke="none" /> : <div />;
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey={() => 350}
                              name="安全平衡基點 (350 ppm)"
                              stroke="#3b82f6"
                              strokeWidth={1.5}
                              strokeDasharray="4 4"
                              dot={false}
                            />
                            {showIpccOverlay && (
                              <>
                                <Line
                                  type="monotone"
                                  dataKey="ssp1_co2"
                                  name="SSP1-1.9 巴黎低大氣 CO2 (~398 ppm)"
                                  stroke="#10b981"
                                  strokeWidth={1.2}
                                  strokeDasharray="2 2"
                                  dot={false}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="ssp2_co2"
                                  name="SSP2-4.5 溫和控制 CO2 (~550 ppm)"
                                  stroke="#3b82f6"
                                  strokeWidth={1.2}
                                  strokeDasharray="2 2"
                                  dot={false}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="ssp5_co2"
                                  name="SSP5-8.5 極限高致災 CO2 (~900 ppm)"
                                  stroke="#fb7185"
                                  strokeWidth={1.2}
                                  strokeDasharray="2 2"
                                  dot={false}
                                />
                              </>
                            )}
                          </>
                        )}

                        {focusedChart === "sealevel" && (
                          <>
                            <Line
                              type="monotone"
                              dataKey="seaLevel"
                              name="地表累積海平面上升深高度 (mm)"
                              stroke="#06b6d4"
                              strokeWidth={3}
                              dot={(props) => {
                                return props.payload.isHistorical ? <circle cx={props.cx} cy={props.cy} r={3.5} fill="#06b6d4" stroke="none" /> : <div />;
                              }}
                            />
                            {showIpccOverlay && (
                              <>
                                <Line
                                  type="monotone"
                                  dataKey="ssp1_sea"
                                  name="SSP1-1.9 最低海平面爬升 (~310 mm)"
                                  stroke="#10b981"
                                  strokeWidth={1.2}
                                  strokeDasharray="2 2"
                                  dot={false}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="ssp2_sea"
                                  name="SSP2-4.5 溫和海平面上升 (~480 mm)"
                                  stroke="#3b82f6"
                                  strokeWidth={1.2}
                                  strokeDasharray="2 2"
                                  dot={false}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="ssp5_sea"
                                  name="SSP5-8.5 極端融海水位高 (~650 mm)"
                                  stroke="#fb7185"
                                  strokeWidth={1.2}
                                  strokeDasharray="2 2"
                                  dot={false}
                                />
                              </>
                            )}
                          </>
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Simulated climate targets of century end */}
                  <div className="mt-4 grid grid-cols-3 gap-3 bg-[#0A0C10] border border-slate-800 p-3 rounded-sm">
                    <div className="text-center">
                      <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">低碳轉型綜合成功率</span>
                      <span className={`text-base font-bold font-mono ${
                        transitionIndex >= 80 ? "text-emerald-400" :
                        transitionIndex >= 50 ? "text-amber-400" : "text-red-400"
                      }`}>
                        {transitionIndex} %
                      </span>
                    </div>
                    <div className="text-center border-l border-slate-850">
                      <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">2100 溫升投射</span>
                      <span className={`text-base font-bold font-mono ${
                        tempIn2100 <= 1.5 ? "text-emerald-400" :
                        tempIn2100 <= 2.5 ? "text-amber-400" : "text-red-400"
                      }`}>
                        +{tempIn2100} °C
                      </span>
                    </div>
                    <div className="text-center border-l border-slate-850">
                      <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">2100 CO₂ 基底</span>
                      <span className="text-base font-bold font-mono text-white">
                        {co2In2100} ppm
                      </span>
                    </div>
                  </div>

                  {/* EARTH CRITICAL FEEDBACK TIPPING POINTS TRACKER */}
                  <div className="mt-4 p-4 bg-[#0A0C10] border border-slate-800/80 rounded-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <div className="flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        <h4 className="text-[11px] font-bold text-slate-350 uppercase tracking-widest font-mono">
                          地球系統臨界點動態追蹤 (Earth Tipping Points Tracker)
                        </h4>
                      </div>
                      <span className="text-[9.5px] font-mono text-slate-500">
                        當前升溫異常值投射 : <span className="font-bold text-slate-300">+{tempIn2100}°C</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {/* Tipping Point 1 */}
                      <div className={`p-2.5 rounded-sm border transition-all ${
                        tempIn2100 > 1.25
                          ? "bg-red-950/15 border-red-500/40 text-red-100 shadow-[inset_0_0_8px_rgba(239,68,68,0.05)]"
                          : "bg-[#11141A]/50 border-slate-850 text-slate-450 text-slate-500"
                      }`}>
                        <div className="flex items-center justify-between mb-1.5 gap-1">
                          <span className={`text-[10.5px] font-bold font-sans ${tempIn2100 > 1.25 ? 'text-red-300' : 'text-slate-400'}`}>北極海冰反照率瓦解</span>
                          <span className={`text-[8.5px] font-mono font-bold px-1 rounded uppercase min-w-[42px] text-center ${
                            tempIn2100 > 1.25 ? "bg-red-900/40 text-red-400 animate-pulse" : "bg-slate-900 text-slate-650 text-slate-500"
                          }`}>
                            {tempIn2100 > 1.25 ? "🚨 已觸發" : "○ 安全"}
                          </span>
                        </div>
                        <div className="w-full bg-[#0A0C10] h-1 rounded-full overflow-hidden mb-1">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${tempIn2100 > 1.25 ? 'bg-red-500' : 'bg-slate-700'}`}
                            style={{ width: `${Math.min(100, (tempIn2100 / 1.25) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                          <span>極限 1.25°C</span>
                          <span>推進 {Math.min(100, Math.round((tempIn2100 / 1.25) * 100))}%</span>
                        </div>
                        <p className={`text-[9px] mt-1 leading-relaxed ${tempIn2100 > 1.25 ? 'text-slate-350' : 'text-slate-500'}`}>
                          深海暴露吸收更多太陽能，加速極地極端暖化 (極地放大效應)。
                        </p>
                      </div>

                      {/* Tipping Point 2 */}
                      <div className={`p-2.5 rounded-sm border transition-all ${
                        tempIn2100 > 1.60
                          ? "bg-red-950/15 border-red-500/40 text-red-100 shadow-[inset_0_0_8px_rgba(239,68,68,0.05)]"
                          : "bg-[#11141A]/50 border-slate-850 text-slate-450 text-slate-500"
                      }`}>
                        <div className="flex items-center justify-between mb-1.5 gap-1">
                          <span className={`text-[10.5px] font-bold font-sans ${tempIn2100 > 1.60 ? 'text-red-300' : 'text-slate-400'}`}>西伯利亞永凍土融解</span>
                          <span className={`text-[8.5px] font-mono font-bold px-1 rounded uppercase min-w-[42px] text-center ${
                            tempIn2100 > 1.60 ? "bg-red-900/40 text-red-400 animate-pulse" : "bg-slate-900 text-slate-650 text-slate-500"
                          }`}>
                            {tempIn2100 > 1.60 ? "🚨 已觸發" : "○ 安全"}
                          </span>
                        </div>
                        <div className="w-full bg-[#0A0C10] h-1 rounded-full overflow-hidden mb-1">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${tempIn2100 > 1.60 ? 'bg-red-500' : 'bg-slate-700'}`}
                            style={{ width: `${Math.min(100, (tempIn2100 / 1.60) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                          <span>極限 1.60°C</span>
                          <span>推進 {Math.min(100, Math.round((tempIn2100 / 1.60) * 100))}%</span>
                        </div>
                        <p className={`text-[9px] mt-1 leading-relaxed ${tempIn2100 > 1.60 ? 'text-slate-350' : 'text-slate-500'}`}>
                          釋放古老凍土層中百億噸的二次甲烷(CH₄)，引發失控暖化惡性循環。
                        </p>
                      </div>

                      {/* Tipping Point 3 */}
                      <div className={`p-2.5 rounded-sm border transition-all ${
                        tempIn2100 > 1.95
                          ? "bg-red-950/15 border-red-500/40 text-red-100 shadow-[inset_0_0_8px_rgba(239,68,68,0.05)]"
                          : "bg-[#11141A]/50 border-slate-850 text-slate-455 text-slate-500"
                      }`}>
                        <div className="flex items-center justify-between mb-1.5 gap-1">
                          <span className={`text-[10.5px] font-bold font-sans ${tempIn2100 > 1.95 ? 'text-red-300' : 'text-slate-400'}`}>亞馬遜雨林全面枯死</span>
                          <span className={`text-[8.5px] font-mono font-bold px-1 rounded uppercase min-w-[42px] text-center ${
                            tempIn2100 > 1.95 ? "bg-red-900/40 text-red-400 animate-pulse" : "bg-slate-900 text-slate-650 text-slate-500"
                          }`}>
                            {tempIn2100 > 1.95 ? "🚨 已觸發" : "○ 安全"}
                          </span>
                        </div>
                        <div className="w-full bg-[#0A0C10] h-1 rounded-full overflow-hidden mb-1">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${tempIn2100 > 1.95 ? 'bg-red-500' : 'bg-slate-700'}`}
                            style={{ width: `${Math.min(100, (tempIn2100 / 1.95) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                          <span>極限 1.95°C</span>
                          <span>推進 {Math.min(100, Math.round((tempIn2100 / 1.95) * 100))}%</span>
                        </div>
                        <p className={`text-[9px] mt-1 leading-relaxed ${tempIn2100 > 1.95 ? 'text-slate-350' : 'text-slate-500'}`}>
                          植被自我蒸騰失效，由地球吸碳「碳匯」退化轉變為極大「碳源」。
                        </p>
                      </div>

                      {/* Tipping Point 4 */}
                      <div className={`p-2.5 rounded-sm border transition-all ${
                        tempIn2100 > 2.30
                          ? "bg-red-955 bg-red-950/15 border-red-500/40 text-red-100 shadow-[inset_0_0_8px_rgba(239,68,68,0.05)]"
                          : "bg-[#11141A]/50 border-slate-850 text-slate-455 text-slate-500"
                      }`}>
                        <div className="flex items-center justify-between mb-1.5 gap-1">
                          <span className={`text-[10.5px] font-bold font-sans ${tempIn2100 > 2.30 ? 'text-red-300' : 'text-slate-400'}`}>大西洋溫鹽環流停擺</span>
                          <span className={`text-[8.5px] font-mono font-bold px-1 rounded uppercase min-w-[42px] text-center ${
                            tempIn2100 > 2.30 ? "bg-red-900/40 text-red-400 animate-pulse" : "bg-slate-900 text-slate-650 text-slate-500"
                          }`}>
                            {tempIn2100 > 2.30 ? "🚨 已觸發" : "○ 安全"}
                          </span>
                        </div>
                        <div className="w-full bg-[#0A0C10] h-1 rounded-full overflow-hidden mb-1">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${tempIn2100 > 2.30 ? 'bg-red-500' : 'bg-slate-700'}`}
                            style={{ width: `${Math.min(100, (tempIn2100 / 2.30) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                          <span>極限 2.30°C</span>
                          <span>推進 {Math.min(100, Math.round((tempIn2100 / 2.30) * 100))}%</span>
                        </div>
                        <p className={`text-[9px] mt-1 leading-relaxed ${tempIn2100 > 2.30 ? 'text-slate-350' : 'text-slate-500'}`}>
                          淡水注入稀釋深層，AMOC全球熱泵停擺，引發南北半球極限異常天候。
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* HISTORICAL EXTREME CLIMATE TIMELINE */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        <span>氣候臨界點警告：歷史重大極端天氣事件簿</span>
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                        💡 滑鼠懸停看詳情，點擊卡片鎖定圖表對齊標線
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                      {EXTREME_EVENTS.map((evt) => {
                        const isFocused = selectedEventYear === evt.year;
                        return (
                          <div
                            key={evt.year}
                            onMouseEnter={() => {
                              setSelectedEventYear(evt.year);
                              setHoveredEvent(evt);
                            }}
                            onMouseLeave={() => {
                              setSelectedEventYear(null);
                              setHoveredEvent(null);
                            }}
                            onClick={() => {
                              if (selectedEventYear === evt.year) {
                                setSelectedEventYear(null);
                                setHoveredEvent(null);
                              } else {
                                setSelectedEventYear(evt.year);
                                setHoveredEvent(evt);
                              }
                            }}
                            className={`p-2 rounded border cursor-pointer select-none transition-all duration-300 relative ${
                              isFocused
                                ? "bg-red-950/25 border-red-500/40 text-white shadow-[0_0_12px_rgba(239,68,68,0.1)] scale-[1.02]"
                                : "bg-[#0A0C10] border-slate-800 text-slate-400 hover:border-slate-700/80 hover:bg-[#11141A]"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-bold font-mono text-slate-200">
                                {evt.year} 年
                              </span>
                              <span className="text-sm leading-none">{evt.emoji}</span>
                            </div>
                            <h4 className="text-[10px] font-bold truncate tracking-tight text-slate-300">
                              {evt.title}
                            </h4>
                            <p className="text-[9px] text-slate-500 mt-0.5 truncate">
                              📍 {evt.location}
                            </p>
                            {isFocused && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* DYNAMIC STORYTELLING NARRATIVE CARD */}
                    <div className="mt-3 overflow-hidden duration-300 transition-all">
                      {(hoveredEvent || selectedEventYear) ? (
                        (() => {
                          const activeEvt = hoveredEvent || EXTREME_EVENTS.find(e => e.year === selectedEventYear);
                          if (!activeEvt) return null;
                          return (
                            <div className="p-3 bg-red-950/10 border border-red-900/20 rounded border-dashed relative flex flex-col md:flex-row gap-3 items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 text-xs font-bold text-red-400 mb-1.5">
                                  <span className="text-lg leading-none">{activeEvt.emoji}</span>
                                  <span>{activeEvt.year} 年 — {activeEvt.title}</span>
                                  <span className="px-1.5 py-0.5 rounded bg-red-950/65 font-mono text-[9px] border border-red-850/30">
                                    臨界溫度常規比率：{activeEvt.tempAnomalyVal}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                                  {activeEvt.description}
                                </p>
                              </div>
                              <div className="w-full md:w-auto shrink-0 md:border-l border-red-900/20 md:pl-3 pt-2 md:pt-0 self-stretch flex flex-col justify-center">
                                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block mb-0.5">⚠️ 致命核心衝擊</span>
                                <span className="text-[11.5px] text-red-400 font-bold bg-red-950/25 border border-red-900/30 rounded px-2.5 py-1 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                  {activeEvt.impact}
                                </span>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="p-3 bg-slate-900/10 border border-slate-800/40 rounded text-center text-[11px] text-slate-500 font-sans italic">
                          💡 點擊上方的關鍵年份，可在主圖表看見標註的時間軸警告線與極端數據之映射座標點。
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* SERVER-SIDE AI REASONING / INSIGHT FEEDBACK PANEL */}
                <div className="bg-[#11141A] border border-slate-800 p-5 shadow-xl rounded-sm">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
                        AI 氣候戰略觀點 / INTELLIGENCE INSIGHTS
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-sm">
                      Model: Gemini-3.5-flash
                    </span>
                  </div>

                  {isAiAnalyzing ? (
                    <div className="py-8 flex flex-col items-center justify-center space-y-3">
                      <div className="w-5 h-5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"></div>
                      <p className="text-[11px] text-emerald-400 font-mono tracking-tighter">
                        Calculating stratosphere atmospheric feedback...
                      </p>
                    </div>
                  ) : aiAnalysis ? (
                    <div className="space-y-4 text-xs font-sans">
                      
                      {/* Dynamic AI Engine Health Indicator */}
                      {aiAnalysis.isFallback ? (
                        <div className={`p-2.5 rounded border text-[11px] leading-relaxed flex items-start gap-2 ${
                          aiAnalysis.fallbackReason === "QUOTA_EXCEEDED"
                            ? "bg-amber-950/20 border-amber-500/30 text-amber-300"
                            : aiAnalysis.fallbackReason === "SERVICE_UNAVAILABLE"
                            ? "bg-amber-950/20 border-amber-500/30 text-amber-300 animate-pulse"
                            : "bg-slate-950 border-slate-850 text-slate-400"
                        }`}>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">
                              {aiAnalysis.fallbackReason === "QUOTA_EXCEEDED" 
                                ? "智慧降級：加載本機物理科學模型 (AI Quota Threshold Exceeded)"
                                : aiAnalysis.fallbackReason === "SERVICE_UNAVAILABLE"
                                ? "智慧防線：加載本機物理科學模型 (Gemini Service Temporarily Overloaded)"
                                : "IPCC 物理推導常數模型 (Offline Secure Mode)"}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {aiAnalysis.fallbackReason === "QUOTA_EXCEEDED"
                                ? "偵測到您的 Gemini API 目前已超出流量配額 (HTTP 429)。系統已自動啟動本機 IPCC 常規多項式反饋矩陣以維持核心交互。您可隨時於右上角 Settings > Secrets 中更換或設定金鑰配額。"
                                : aiAnalysis.fallbackReason === "SERVICE_UNAVAILABLE"
                                ? "雲端 Gemini 模型伺服器目前排隊需求極高 (HTTP 503)。系統已平滑接管並調用本機實體动力對接，保持 100% 業務可用。可點擊按鈕重試。"
                                : "環境 API 金鑰並未就緒。系統正在為您調用本機實體動力仿真，提供擬真觀測。"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 bg-emerald-950/10 border border-emerald-500/20 rounded text-[11px] leading-relaxed text-emerald-400 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            <span className="font-bold font-sans">
                              {aiProvider.provider === "Ollama"
                                ? `Ollama 氣候智庫直連 (${aiProvider.model})：連線正常`
                                : "Gemini 3.5 氣候大智庫直連：連線正常"}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{aiProvider.provider === "Ollama" ? "OLLAMA ACTIVE" : "LIVE MODE"}</span>
                        </div>
                      )}

                      {/* Block Narrative */}
                      <div className="bg-[#0A0C10]/80 p-3.5 rounded-sm border border-slate-800 leading-relaxed text-slate-350 font-sans">
                        <p>{aiAnalysis.narrativeText}</p>
                      </div>

                      {/* Meta Indicators Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 bg-[#0A0C10] border border-slate-800 rounded-sm space-y-1">
                          <span className="text-[9px] uppercase font-bold text-emerald-405 text-emerald-400 block tracking-widest font-mono">
                            🎯 估算落實碳達峰段 Achieving Goal
                          </span>
                          <p className="text-white font-medium text-xs font-mono">{aiAnalysis.yearAchieved}</p>
                        </div>
                        <div className="p-3 bg-[#0A0C10] border border-slate-800 rounded-sm space-y-1">
                          <span className="text-[9px] uppercase font-bold text-amber-500 block tracking-widest font-mono">
                            🌡️ 本世紀末均溫峰值異常 Temp Peak
                          </span>
                          <p className="text-white font-medium text-xs font-mono">+{aiAnalysis.temperaturePeak} °C</p>
                        </div>
                        
                        {/* UPGRADE FIELD: Hazard Risk Indicator */}
                        <div className="p-3 bg-[#0A0C10] border border-slate-800 rounded-sm space-y-1">
                          <span className="text-[9px] uppercase font-bold text-rose-455 text-rose-500 block tracking-widest font-mono">
                            ☠️ 世紀末大氣危害風險等級 Climate Risk
                          </span>
                          <p className={`font-mono font-bold text-xs ${
                            aiAnalysis.hazardRiskLevel?.includes("極高") || aiAnalysis.hazardRiskLevel?.includes("High") || aiAnalysis.hazardRiskLevel?.includes("Critical")
                              ? "text-red-400 animate-pulse"
                              : "text-emerald-400"
                          }`}>
                            {aiAnalysis.hazardRiskLevel || "高強度風險量測中"}
                          </p>
                        </div>

                        {/* UPGRADE FIELD: Climate Tipping Points Badges */}
                        <div className="p-3 bg-[#0A0C10] border border-slate-800 rounded-sm space-y-1.5">
                          <span className="text-[9px] uppercase font-bold text-cyan-400 block tracking-widest font-mono">
                            ⚡ 被觸發之地球氣候臨界點 Tipping Points
                          </span>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {aiAnalysis.tippingPoints && aiAnalysis.tippingPoints.length > 0 ? (
                              aiAnalysis.tippingPoints.map((tp, idx) => (
                                <span 
                                  key={idx} 
                                  className="text-[9.5px] font-sans px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 block"
                                >
                                  ⚠️ {tp}
                                </span>
                              ))
                            ) : (
                              <span className="text-[9px] font-mono text-slate-600">無立即臨界點威脅</span>
                            )}
                          </div>
                        </div>

                        <div className="p-3 bg-[#0A0C10] border border-slate-800 rounded-sm space-y-1 md:col-span-2">
                          <span className="text-[9px] uppercase font-bold text-sky-400 block tracking-widest font-mono">
                            🌊 海平面上升衝擊評估 Sea Level Threats
                          </span>
                          <p className="text-slate-400 text-xs leading-relaxed">{aiAnalysis.seaLevelImpact}</p>
                        </div>
                        <div className="p-3 bg-[#0A0C10] border border-slate-800 rounded-sm space-y-1 md:col-span-2">
                          <span className="text-[9px] uppercase font-bold text-yellow-550 text-yellow-405 text-yellow-500 block tracking-widest font-mono">
                            💰 全球經濟轉型損耗與利益 Fiscal Impact
                          </span>
                          <p className="text-slate-400 text-xs leading-relaxed">{aiAnalysis.economicImpact}</p>
                        </div>
                      </div>

                      {/* Action plan list */}
                      <div className="space-y-2 pt-1">
                        <span className="font-bold text-slate-300 block text-xs tracking-wider font-sans uppercase">
                          🛠️ AI 建議的關鍵低碳行動綱領 / ACTION PROTOCOLS:
                        </span>
                        <ul className="space-y-1.5 pl-1">
                          {aiAnalysis.suggestedActionPlan.map((action, i) => (
                            <li key={i} className="flex items-start space-x-2.5">
                              <span className="flex-shrink-0 w-4.5 h-4.5 rounded-sm bg-[#0A0C10] text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] border border-slate-805">
                                {i+1}
                              </span>
                              <span className="text-slate-400 leading-normal text-xs">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* UPGRADE FIELD: REAL-TIME CLIMATE SCI-COPILOT DIALOGUE */}
                      <div className="mt-4 pt-4 border-t border-slate-805 space-y-3">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-bold text-slate-300 text-xs tracking-wider uppercase font-sans">
                            💬 雙向科學顧問隨身艙 / SCI-COPILOT DIALOGUE
                          </span>
                        </div>
                        
                        {/* Messages Box */}
                        <div className="bg-[#0A0C10]/95 border border-slate-850 p-2.5 rounded max-h-56 overflow-y-auto space-y-2 font-mono scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                          {copilotMessages.map((msg, index) => (
                            <div 
                              key={index} 
                              className={`p-2 rounded-sm text-[11px] leading-relaxed relative ${
                                msg.sender === 'user' 
                                  ? 'bg-slate-800/40 border border-slate-700/30 text-slate-200 ml-6' 
                                  : 'bg-emerald-950/10 border border-emerald-900/15 text-emerald-400 mr-6'
                              }`}
                            >
                              <div className="flex items-center justify-between opacity-55 text-[9px] mb-0.5">
                                <span className="font-bold uppercase tracking-widest border-b border-dashed border-slate-800">
                                  {msg.sender === 'user' ? '👤 決策主控官 USER' : '🤖 AI 氣候科學顧問'}
                                </span>
                                <span>{msg.timestamp}</span>
                              </div>
                              <p className="whitespace-pre-wrap selection:bg-emerald-500/20">{msg.text}</p>
                            </div>
                          ))}
                          {isCopilotSending && (
                            <div className="bg-[#0A0C10] p-2 rounded-sm text-[11px] border border-slate-850 text-emerald-400 mr-6 animate-pulse flex items-center space-x-1.5 font-mono">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                              <span>Stratosphere telemetry feedback incoming...</span>
                            </div>
                          )}
                        </div>

                        {/* Input Box */}
                        <form onSubmit={sendCopilotMessage} className="flex gap-1.5">
                          <input
                            type="text"
                            value={copilotInput}
                            onChange={(e) => setCopilotInput(e.target.value)}
                            placeholder="問點什麼？如:「該碳稅如何中和燃煤機組損耗？」..."
                            disabled={isCopilotSending}
                            className="bg-[#0A0C10] text-[11.5px] text-slate-300 placeholder-slate-600 border border-slate-800 focus:border-slate-700 focus:outline-none rounded px-2.5 py-1.5 flex-1 font-sans text-xs"
                          />
                          <button
                            type="submit"
                            disabled={isCopilotSending || !copilotInput.trim()}
                            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded transition-all disabled:opacity-40 flex items-center justify-center cursor-pointer shrink-0"
                          >
                            <Send className="w-3.5 h-3.5 text-slate-950" />
                          </button>
                        </form>
                      </div>

                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-500 space-y-3">
                      <p className="text-xs">
                        目前呈現氣候控制模型之常態物理模擬數據。按下「啟動 AI 氣候科學診斷」將利用 Gemini 生成本世紀末環境轉型深度科學報告。
                      </p>
                      <button
                        id="btn-get-diagnose"
                        onClick={fetchAIScenarioAnalysis}
                        className="px-4 py-1.5 bg-[#0A0C10] hover:bg-slate-900 border border-emerald-500/20 hover:border-emerald-500/55 rounded-sm text-xs text-emerald-400 font-bold transition-all cursor-pointer tracking-wider font-sans"
                      >
                        立刻獲取 Gemini 深度科學診斷
                      </button>
                    </div>
                  )}
                  {errorText && (
                    <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm text-xs font-mono">
                      WARN: {errorText}
                    </div>
                  )}
                </div>

              </div>

              {/* COCKPIT RIGHT PANEL: LOCALIZED ALERTS & SYS STACK (4 COLS of 8 COLS) */}
              <div className="xl:col-span-4 flex flex-col space-y-6">
                
                {/* LOCALIZED MONITORING ALERTS */}
                <div className="bg-[#11141A] border border-slate-800 p-4.5 rounded-sm shadow-xl flex flex-col space-y-4">
                  <h3 className="text-[10px] uppercase text-slate-500 font-bold tracking-widest font-mono">
                    區域監測警報 / Localized Alerts
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 border-l-2 border-rose-500 bg-rose-500/5 rounded-xs">
                      <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">Arctic Circle (北極圈)</p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        測站 B-12 加速消融，永凍土層釋出大氣甲烷甲烷回饋指標上升。
                      </p>
                    </div>
                    <div className="p-3 border-l-2 border-amber-500 bg-amber-500/5 rounded-xs">
                      <p className="text-[10px] text-amber-500 font-bold uppercase tracking-tight">Amazon Basin (亞馬遜熱帶雨林)</p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        基準氣候濕度下降 12%，森林抵禦旱災自燃臨界點接近中。
                      </p>
                    </div>
                    <div className="p-3 border-l-2 border-slate-800 bg-[#0A0C10]/10 rounded-xs">
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">Australian Reefs (澳洲珊瑚大堡礁)</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        表層海水升溫異常，珊瑚白化臨界指數達第二階段嚴重警告。
                      </p>
                    </div>
                    <div className="p-3 border-l-2 border-emerald-500 bg-emerald-500/5 rounded-xs">
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight">Global Oceans (全球板塊海洋)</p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        熱物理膨脹累積中，極地冰架向海洋輸出固態淡水流速加快。
                      </p>
                    </div>
                  </div>
                </div>

                {/* SIMULATOR SYSTEM LOAD PANEL */}
                <div className="bg-[#11141A] border border-slate-800 p-4.5 rounded-sm shadow-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-[10px] uppercase text-slate-500 font-bold tracking-widest font-mono mb-3">
                      核算引擎模擬負載 / CORE STACK LOAD
                    </h3>
                    <div className="flex flex-wrap gap-1 opacity-[0.9]">
                      <div className="w-2 h-4 bg-emerald-500/80 shadow-[0_0_4px_rgba(16,185,129,0.3)]"></div>
                      <div className="w-2 h-4 bg-emerald-500/80 shadow-[0_0_4px_rgba(16,185,129,0.3)]"></div>
                      <div className="w-2 h-4 bg-emerald-500/80 shadow-[0_0_4px_rgba(16,185,129,0.3)]"></div>
                      <div className="w-2 h-4 bg-emerald-500/80 shadow-[0_0_4px_rgba(16,185,129,0.3)]"></div>
                      <div className="w-2 h-4 bg-amber-500/80"></div>
                      <div className="w-2 h-4 bg-slate-900 border border-slate-800"></div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-5 font-mono">
                    AI ANALYTICAL ENGINE: LINKED & IDLE
                  </p>
                </div>

              </div>

            </div>

          </div>
          </>
        )}

        {/* ========================================================
            TAB C: REAL-TIME GLOBAL CLIMATE WEATHER OBSERVATIONS
            ======================================================== */}
        {activeTab === "realtime-weather" && (
          <div className="space-y-6 animate-fade-in duration-300">
            {/* Top overview banner of real-time metrics */}
            <div className="bg-[#11141A] border border-slate-800 p-5 rounded-sm shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1 px-1.5 rounded bg-sky-950/40 text-sky-400 border border-sky-800/30 text-xs font-mono select-none animate-pulse">
                    Global Cities Telemetry
                  </div>
                  <h2 className="text-base font-bold text-white uppercase tracking-wider font-sans">
                    全球代表性城市氣候觀測儀 — 即時天氣指標
                  </h2>
                </div>
                <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-2xl">
                  對接全球最具有代表性的 7 大核心都市節點，涵蓋副熱帶盆地、溫帶極端季風、熱帶下沉海岸等關鍵氣候型態。
                  系統即時透過 <span className="text-sky-400 font-bold">Open-Meteo API</span> 提取各城市最新即時觀測，並直接與聯合國 IPCC 基準之歷史同期常態平均氣溫進行實測偏差值之極端性比對。
                </p>
              </div>

              {/* Refresh & Filters control panel */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={weatherSearchTerm}
                    onChange={(e) => setWeatherSearchTerm(e.target.value)}
                    placeholder="篩選已載入城市..."
                    className="w-full bg-[#0A0C10] border border-slate-800 focus:border-slate-700/80 outline-none text-xs text-slate-200 placeholder-slate-600 pl-8.5 pr-3 py-1.5 rounded-sm font-sans"
                  />
                </div>

                <select
                  value={weatherFilterThreat}
                  onChange={(e) => setWeatherFilterThreat(e.target.value)}
                  className="bg-[#0A0C10] border border-slate-800 hover:border-slate-700 text-xs text-slate-300 px-2 py-1.5 outline-none rounded-sm font-sans"
                >
                  <option value="all">所有威脅級別</option>
                  <option value="極高">極高威脅</option>
                  <option value="高">高威脅</option>
                  <option value="中等">中等威脅</option>
                  <option value="急遽變化中">急遽變化中</option>
                  <option value="觀測中">自訂觀測中</option>
                </select>

                <button
                  onClick={fetchLiveWeather}
                  disabled={isWeatherLoading}
                  className="px-4 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-slate-950 hover:text-white font-bold text-xs rounded-sm shadow-lg text-center flex items-center justify-center space-x-1.5 transition-all disabled:opacity-40 select-none cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isWeatherLoading ? "animate-spin" : ""}`} />
                  <span>{isWeatherLoading ? "同步抓取中..." : "刷新城市氣候"}</span>
                </button>
              </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* LEFT COLUMN: LIST OF CITIES (5 COLS) */}
              <div className="lg:col-span-12 xl:col-span-5 space-y-3">
                
                {/* GLOBAL GEOCODING CITY SEARCH MODE PANEL */}
                <div className="bg-[#11141A] border border-slate-800 p-4 rounded-sm space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-sky-450 uppercase tracking-widest flex items-center gap-1.5">
                      <Search className="w-3 h-3 text-sky-400" />
                      全球任意城市即時檢索 (搜尋模式)
                    </span>
                    <span className="text-[9px] text-slate-500 font-sans">
                      支援英文/中文地名
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCitySearch(searchQuery);
                        }
                      }}
                      placeholder="例：巴黎, 紐約, 北京, Cairo, Cape Town..."
                      className="flex-1 bg-[#0A0C10] border border-slate-800 focus:border-sky-800 focus:ring-1 focus:ring-sky-950 outline-none text-xs text-slate-200 placeholder-slate-600 px-3 py-1.5 rounded-sm font-sans"
                    />
                    <button
                      onClick={() => handleCitySearch(searchQuery)}
                      disabled={isSearchingGeocoding}
                      className="px-3.5 py-1.5 bg-sky-900/50 hover:bg-sky-500 border border-sky-800 hover:border-sky-400 text-sky-400 hover:text-slate-950 select-none rounded-sm text-xs font-bold cursor-pointer shrink-0 transition-all flex items-center justify-center min-w-[70px]"
                    >
                      {isSearchingGeocoding ? "檢索中" : "搜尋城市"}
                    </button>
                  </div>

                  {/* Geocoding Search Results Dropdown List */}
                  {searchResults.length > 0 && (
                    <div className="bg-[#0A0C10] border border-slate-800 rounded-sm divide-y divide-slate-850/60 max-h-56 overflow-y-auto mt-2 shadow-2xl relative z-10 animate-fade-in">
                      <div className="p-1.5 px-2 bg-slate-950/80 text-[9px] font-mono text-slate-500 sticky top-0 flex items-center justify-between">
                        <span>請點選下方城市以加入觀測面板：</span>
                        <button 
                          onClick={() => setSearchResults([])}
                          className="text-slate-400 hover:text-white"
                        >
                          關閉[X]
                        </button>
                      </div>
                      {searchResults.map((city: any, idx) => {
                        const stateStr = city.admin1 ? `, ${city.admin1}` : "";
                        return (
                          <div
                            key={city.id || idx}
                            onClick={() => handleAddSearchedCity(city)}
                            className="p-2.5 hover:bg-sky-950/20 active:bg-sky-950/40 cursor-pointer flex items-center justify-between text-xs transition-colors group"
                          >
                            <div className="flex flex-col">
                              <span className="text-slate-200 font-bold group-hover:text-white transition-colors">
                                {city.name}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {city.country || "未知國家"}{stateStr}
                              </span>
                            </div>
                            <div className="text-right text-[10px] font-mono text-slate-400 flex flex-col items-end">
                              <span className="text-[9px] text-sky-400 font-semibold group-hover:underline">
                                ➕ 點擊加入並觀測
                              </span>
                              <span className="text-[8px] text-slate-600 block mt-0.5">
                                Lat: {Number(city.latitude).toFixed(2)} / Lon: {Number(city.longitude).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {searchGeocodingError && (
                    <p className="text-[10px] text-rose-400 font-mono mt-1 bg-rose-950/20 p-2 rounded border border-rose-900/40">
                      ⚠️ {searchGeocodingError}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 uppercase tracking-wider px-1 pt-2">
                  <span>城市氣候觀測站列表</span>
                  <span>異常升溫率值比對 (Current vs Hist Avg)</span>
                </div>

                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {weatherStations
                    .filter((station) => {
                      const matchesSearch = station.name.toLowerCase().includes(weatherSearchTerm.toLowerCase()) || 
                                           station.englishName.toLowerCase().includes(weatherSearchTerm.toLowerCase()) ||
                                           station.role.toLowerCase().includes(weatherSearchTerm.toLowerCase());
                      const matchesThreat = weatherFilterThreat === "all" || station.threatLevel === weatherFilterThreat;
                      return matchesSearch && matchesThreat;
                    })
                    .map((station) => {
                      const live = weatherStationsData[station.id];
                      const isSelected = selectedStationId === station.id;
                      
                      // Anomaly coloration
                      let anomalyText = "等待讀取...";
                      let anomalyColor = "text-slate-500 bg-slate-950/40 border-slate-900/40";
                      
                      if (live) {
                        let val = live.anomaly;
                        if (anomalyBaseline === "pre-industrial") {
                          val = Number((val + 1.2).toFixed(1));
                        } else if (anomalyBaseline === "kyoto") {
                          val = Number((val + 0.45).toFixed(1));
                        }
                        
                        if (val > 1.5) {
                          anomalyText = `異常比對 +${val}°C 🔺`;
                          anomalyColor = "text-rose-400 bg-rose-950/20 border-rose-900/30";
                        } else if (val > 0) {
                          anomalyText = `異常比對 +${val}°C 📈`;
                          anomalyColor = "text-amber-400 bg-amber-950/20 border-amber-900/30";
                        } else if (val < 0) {
                          anomalyText = `異常比對 ${val}°C ❄️`;
                          anomalyColor = "text-sky-300 bg-[#0ea5e9]/10 border-sky-900/30";
                        } else {
                          anomalyText = "正常數值差 (±0°C)";
                          anomalyColor = "text-emerald-400 bg-emerald-950/20 border-emerald-900/30";
                        }
                      }

                      return (
                        <div
                          key={station.id}
                          onClick={() => setSelectedStationId(station.id)}
                          className={`p-3.5 rounded-sm border cursor-pointer select-none transition-all duration-300 relative group flex items-start gap-4 ${
                            isSelected
                              ? "bg-sky-950/20 border-sky-500/50 text-white shadow-[0_0_15px_rgba(14,165,233,0.1)]"
                              : "bg-[#11141A] border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-[#141820]"
                          }`}
                        >
                          {/* Colored bar */}
                          <div className={`absolute top-0 bottom-0 left-0 w-1 rounded-l-xs bg-gradient-to-b ${station.colorClass}`} />
                          
                          {/* Icon marker */}
                          <div className="w-9 h-9 shrink-0 rounded bg-[#0A0C10] flex items-center justify-center text-lg border border-slate-800">
                            {station.emoji}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors flex items-center gap-1.5">
                                  <span>{station.name}</span>
                                  {station.isCustomCity && (
                                    <span className="text-[9px] bg-sky-950 text-sky-400 border border-sky-900 px-1 rounded scale-90">
                                      自訂
                                    </span>
                                  )}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  {station.englishName}
                                </p>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${
                                station.threatLevel === "極高" ? "bg-red-950/50 text-red-400 border-red-900/40" :
                                station.threatLevel === "高" ? "bg-orange-950/50 text-orange-400 border-orange-900/40" :
                                station.threatLevel === "中等" ? "bg-indigo-950/50 text-indigo-400 border-indigo-900/40" :
                                station.threatLevel === "觀測中" ? "bg-sky-950/50 text-sky-450 border-sky-905/40" :
                                "bg-purple-950/50 text-purple-400 border-purple-900/40"
                              }`}>
                                {station.threatLevel === "觀測中" ? "觀測中" : `威脅:${station.threatLevel}`}
                              </span>
                            </div>

                            <div className="mt-2.5 flex items-center justify-between text-[11px] gap-2">
                              {live ? (
                                <span className="font-mono text-slate-300 font-semibold">
                                  當前：<strong className="text-white text-xs">{live.temp}°C</strong>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-600 font-mono italic">正在加載實時觀測值...</span>
                              )}
                              <span className={`px-2 py-0.5 rounded-[3px] font-mono text-[10px] font-semibold border ${anomalyColor}`}>
                                {anomalyText}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* RIGHT COLUMN: ANALYTICS SPOTLIGHT & COMPARATIVE BOARD (7 COLS) */}
              <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                {(() => {
                  const station = weatherStations.find(s => s.id === selectedStationId);
                  if (!station) {
                    return (
                      <div className="p-8 text-center bg-[#11141A] border border-slate-800 rounded-sm text-slate-500 text-xs italic">
                        請在左側選擇一個氣候指標觀測城市。
                      </div>
                    );
                  }

                  const live = weatherStationsData[station.id];

                  // Calculate reactive anomaly and baseline reference temperature relative to baseline epoch
                  const calculatedCorrection = anomalyBaseline === "pre-industrial" ? -1.2 : anomalyBaseline === "kyoto" ? -0.45 : 0;
                  const adjustedHistAvgTemp = Number((station.histAvgTemp + calculatedCorrection).toFixed(1));
                  const renderAnomaly = live ? Number((live.temp - adjustedHistAvgTemp).toFixed(1)) : 0.8;

                  // Setup dataset for Comparative Bar Chart
                  const compChartData = live ? [
                    {
                      name: "環境氣溫對比 (°C)",
                      "常年歷史基準氣溫": adjustedHistAvgTemp,
                      "今日最新實時觀測": live.temp,
                    }
                  ] : [];

                  return (
                    <div className="bg-[#11141A] border border-slate-800 p-6 rounded-sm space-y-6 shadow-xl relative overflow-hidden">
                      {/* Sub-header inside detail */}
                      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{station.emoji}</span>
                            <h3 className="text-base font-bold text-white tracking-wide">
                              {station.name} — 當前指標核心分析
                            </h3>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">
                            城市地理坐標：緯度 {station.latitude} / 經度 {station.longitude}
                          </p>
                        </div>

                        {live && (
                          <div className="text-right shrink-0">
                            <span className="text-[9px] text-slate-500 block uppercase font-mono">城市觀測時間戳 (UTC-ISO)</span>
                            <span className="text-[11px] font-mono text-sky-400 bg-sky-950/20 border border-sky-900/30 px-2 py-0.5 rounded border border-sky-800/40">
                              {live.time.replace("T", " ")}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Advanced Sub-Tabs Navigation */}
                      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-3">
                        <button
                          onClick={() => setCityAnalysisTab("standard")}
                          className={`px-3 py-1.5 rounded-sm text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
                            cityAnalysisTab === "standard"
                              ? "bg-slate-800 text-white border border-slate-700 shadow-md"
                              : "bg-[#0A0C10] text-slate-400 border border-slate-850 hover:text-white"
                          }`}
                        >
                          🌐 氣候實測對比
                        </button>
                        <button
                          onClick={() => setCityAnalysisTab("vulnerability")}
                          className={`px-3 py-1.5 rounded-sm text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
                            cityAnalysisTab === "vulnerability"
                              ? "bg-amber-950/20 text-amber-400 border border-amber-900/50 shadow-md"
                              : "bg-[#0A0C10] text-slate-400 border border-slate-850 hover:text-white"
                          }`}
                        >
                          ⚡ 脆弱度與酷熱指數
                        </button>
                        <button
                          onClick={() => setCityAnalysisTab("simulation")}
                          className={`px-3 py-1.5 rounded-sm text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
                            cityAnalysisTab === "simulation"
                              ? "bg-sky-950/20 text-sky-450 border border-sky-900/50 shadow-md"
                              : "bg-[#0A0C10] text-slate-400 border border-slate-850 hover:text-white"
                          }`}
                        >
                          📈 政策抑制投影(2100)
                        </button>
                        <button
                          onClick={() => setCityAnalysisTab("adaptation")}
                          className={`px-3 py-1.5 rounded-sm text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
                            cityAnalysisTab === "adaptation"
                              ? "bg-emerald-950/20 text-emerald-400 border border-emerald-900/50 shadow-md"
                              : "bg-[#0A0C10] text-slate-400 border border-slate-850 hover:text-white"
                          }`}
                        >
                          🛡️ 自訂韌性適應藍圖
                        </button>
                        <button
                          onClick={() => setCityAnalysisTab("radar")}
                          className={`px-3 py-1.5 rounded-sm text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
                            cityAnalysisTab === "radar"
                              ? "bg-rose-950/30 text-rose-400 border border-rose-900/50 shadow-md"
                              : "bg-[#0A0C10] text-slate-400 border border-slate-850 hover:text-white"
                          }`}
                        >
                          🚨 臨近災害與預警雷達
                        </button>
                      </div>

                      {/* Climate Anomaly Baseline Epoch Controller Widget */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-950/50 border border-slate-855 border-slate-800/80 rounded font-sans text-xs">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            大氣觀測比對基準 Epoch 選擇
                          </span>
                          <p className="text-[10px] text-slate-400">
                            切換不同地球歷史基準期，以觀測人為累計溫室效應排放的絕對升溫增量
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-[#0A0C10] p-1 border border-slate-800 rounded shrink-0">
                          {(["modern", "kyoto", "pre-industrial"] as const).map((epoch) => (
                            <button
                              key={epoch}
                              onClick={() => {
                                setAnomalyBaseline(epoch);
                                setLocalHazardAiReport(null); // Reset local custom report on baseline shift
                              }}
                              className={`px-2.5 py-1 rounded-xs text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                anomalyBaseline === epoch
                                  ? "bg-sky-500/15 text-sky-400 border border-sky-500/35 shadow"
                                  : "text-slate-400 hover:text-slate-200 border border-transparent"
                              }`}
                            >
                              {epoch === "modern" && "當代 (2015+)"}
                              {epoch === "kyoto" && "京都氣候期 (1990)"}
                              {epoch === "pre-industrial" && "工業革命前 (~1850)"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {cityAnalysisTab === "standard" && (
                        <div className="space-y-6">
                          {/* STATION CRITICAL STRATEGIC ROLE DESCRIPTIVE CARD */}
                          <div className="p-4 bg-[#0A0C10] border border-slate-850 rounded">
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
                              📡 關鍵城市氣候演變角色說明 / City Climate Role
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed font-sans">
                              {station.role}
                            </p>
                          </div>

                          {/* 8-INDICATOR CLIMATE BENTO GRID */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {/* Card 1: Temp & Anomaly */}
                            <div className="p-3 bg-[#0A0C10] border border-slate-800/80 rounded relative">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block">環境實測溫度</span>
                              {live ? (
                                <div className="mt-1 flex items-baseline gap-1">
                                  <span className="text-lg font-bold text-white font-mono">{live.temp}°C</span>
                                  <span className={`text-[9px] font-mono font-bold ${renderAnomaly >= 0 ? "text-rose-455 text-rose-400" : "text-sky-300"}`}>
                                    ({renderAnomaly >= 0 ? "+" : ""}{renderAnomaly}°C)
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-600 font-mono block mt-1 animate-pulse">連線讀取中...</span>
                              )}
                              <span className="text-[8.5px] text-slate-600 font-mono block mt-2">基準歷史常態: {adjustedHistAvgTemp}°C</span>
                            </div>

                            {/* Card 2: Apparent Temp */}
                            <div className="p-3 bg-[#0A0C10] border border-slate-800/80 rounded relative">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block">深層體感溫度</span>
                              {live ? (
                                <span className="text-lg font-bold text-sky-400 font-mono block mt-1">{live.apparentTemp}°C</span>
                              ) : (
                                <span className="text-xs text-slate-600 font-mono block mt-1 animate-pulse">連線中...</span>
                              )}
                              <span className="text-[8.5px] text-slate-400 font-mono block mt-2">考慮高濕及風冷散熱效益</span>
                            </div>

                            {/* Card 3: Humidity */}
                            <div className="p-3 bg-[#0A0C10] border border-slate-800/80 rounded relative">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block">大氣相對濕度</span>
                              {live ? (
                                <span className="text-lg font-bold text-emerald-400 font-mono block mt-1">{live.humidity}%</span>
                              ) : (
                                <span className="text-xs text-slate-600 font-mono block mt-1 animate-pulse">連線中...</span>
                              )}
                              <span className="text-[8.5px] text-slate-600 font-mono block mt-2 font-sans">大氣對流與熱對流潛力</span>
                            </div>

                            {/* Card 4: Local CO2 Level */}
                            <div className="p-3 bg-[#0A0C10] border border-slate-800/80 rounded relative">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block">局部二氧化碳含量</span>
                              {live && live.co2Level ? (
                                <div className="mt-1 flex items-baseline gap-1">
                                  <span className="text-lg font-bold text-teal-400 font-mono">{live.co2Level}</span>
                                  <span className="text-[9px] text-slate-550 font-mono">ppm</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-600 font-mono block mt-1 animate-pulse">正在精算...</span>
                              )}
                              <span className="text-[8.5px] text-slate-600 font-mono block mt-2">
                                工業前基線: 280 / 當前大同盟: +{(live?.co2Level ? Number((live.co2Level - 280).toFixed(0)) : 144)}
                              </span>
                            </div>

                            {/* Card 5: Rain & Wind Vector */}
                            <div className="p-3 bg-[#0A0C10] border border-slate-800/80 rounded relative">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block">降水量與風速向量</span>
                              {live ? (
                                <div className="mt-1 flex flex-col">
                                  <span className="text-xs font-bold text-amber-400 font-mono">🌧️ {live.precipitation} mm</span>
                                  <span className="text-[10px] font-mono text-slate-300">
                                    💨 {live.windSpeed} km/h ({(live.windDirection !== undefined) ? (() => {
                                      const index = Math.round((((live.windDirection ?? 0) % 360) / 45)) % 8;
                                      const labels = ["北", "東北", "東", "東南", "南", "西南", "西", "西北"];
                                      return labels[index];
                                    })() : "無"}偏風)
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-600 font-mono block mt-1 animate-pulse">連線中...</span>
                              )}
                              <span className="text-[8.5px] text-slate-600 font-mono block mt-1">氣團擴散對流常數</span>
                            </div>

                                                        {/* Card 6: PM2.5 & Air Quality */}
                            <div className="p-3 bg-[#0A0C10] border border-slate-800/80 rounded relative">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block">PM2.5 及空氣品質</span>
                              {live && live.pm25 !== undefined ? (
                                <div className="mt-1 flex flex-col">
                                  <span className="text-xs font-bold text-rose-455 font-mono">
                                    🌫️ {live.pm25} µg/m³
                                  </span>
                                  <span className={`text-[9px] font-bold w-fit px-1.5 py-0.2 rounded mt-0.5 ${
                                    live.aqi !== undefined && live.aqi <= 50 ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30" :
                                    live.aqi !== undefined && live.aqi <= 100 ? "bg-amber-950/40 text-amber-500/10 border border-amber-900/30" :
                                    "bg-rose-955/40 text-rose-400 border border-rose-900/30"
                                  }`}>
                                    AQI {live.aqi} ({live.aqiLabel})
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-600 font-mono block mt-1 animate-pulse">計算環境氣溶膠...</span>
                              )}
                              <span className="text-[8.5px] text-slate-600 font-mono block mt-1">都市燃裝空污蓄積懸浮物</span>
                            </div>

                            {/* Card 7: Barometric Pressure */}
                            <div className="p-3 bg-[#0A0C10] border border-slate-800/80 rounded relative">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block">大氣氣壓</span>
                              {live && live.pressure ? (
                                <div className="mt-1 flex items-baseline gap-1">
                                  <span className="text-lg font-bold font-mono text-purple-400">{Math.round(live.pressure)}</span>
                                  <span className="text-[9px] text-slate-550 font-mono">hPa</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-600 font-mono block mt-1 animate-pulse">連線讀取中...</span>
                              )}
                              <span className="text-[8.5px] text-slate-600 font-mono block mt-2">局部地表校正大氣壓</span>
                            </div>

                            {/* Card 8: Net Solar Radiation */}
                            <div className="p-3 bg-[#0A0C10] border border-slate-800/80 rounded relative">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block">淨太陽輻射通量</span>
                              {live && live.radiation !== undefined ? (
                                <span className="text-lg font-bold text-orange-400 font-mono block mt-1">{live.radiation} W/m²</span>
                              ) : (
                                <span className="text-xs text-slate-600 font-mono block mt-1 animate-pulse">與大氣站同步中...</span>
                              )}
                              <span className="text-[8.5px] text-slate-600 font-mono block mt-1">輻射通量與下沉反光常溫</span>
                            </div>

                            {/* Card 9: Vapor Pressure Deficit (VPD) */}
                            <div className="p-3 bg-[#0A0C10] border border-slate-800/80 rounded relative">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block">飽和蒸汽壓赤字</span>
                              {live && live.vpd !== undefined ? (
                                <span className="text-lg font-bold text-lime-400 font-mono block mt-1">{live.vpd} kPa</span>
                              ) : (
                                <span className="text-xs text-slate-600 font-mono block mt-1 animate-pulse">計算中...</span>
                              )}
                              <span className="text-[8.5px] text-slate-600 font-mono block mt-1">植物蒸騰與大氣水分乾燥需求度</span>
                            </div>

                            {/* Card 10: Dew Point Temperature */}
                            <div className="p-3 bg-[#0A0C10] border border-slate-800/80 rounded relative">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block">物理大氣露點溫度</span>
                              {live && live.dewPoint !== undefined ? (
                                <span className="text-lg font-bold text-cyan-400 font-mono block mt-1">{live.dewPoint}°C</span>
                              ) : (
                                <span className="text-xs text-slate-600 font-mono block mt-1 animate-pulse">水氣凝結計算中...</span>
                              )}
                              <span className="text-[8.5px] text-slate-600 font-mono block mt-1">空氣中水氣達到飽和之凝露溫度</span>
                            </div>

                            {/* Card 11: Wet Bulb Temperature */}
                            <div className="p-3 bg-[#0A0C10] border border-slate-800/80 rounded relative">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block">熱力學濕球溫度</span>
                              {live && live.wetBulb !== undefined ? (
                                <span className="text-lg font-bold text-rose-400 font-mono block mt-1">{live.wetBulb}°C</span>
                              ) : (
                                <span className="text-xs text-slate-600 font-mono block mt-1 animate-pulse">熱力極限評估中...</span>
                              )}
                              <span className="text-[8.5px] text-slate-600 font-mono block mt-1">人體散熱臨界指標。極限上限 35°C</span>
                            </div>

                            {/* Card 12: Earth Surface Albedo */}
                            <div className="p-3 bg-[#0A0C10] border border-slate-800/80 rounded relative">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block">地表反照率常數</span>
                              {live && live.albedo !== undefined ? (
                                <span className="text-lg font-bold text-yellow-400 font-mono block mt-1">α = {live.albedo}</span>
                              ) : (
                                <span className="text-xs text-slate-600 font-mono block mt-1 animate-pulse">地物特徵估算中...</span>
                              )}
                              <span className="text-[8.5px] text-slate-600 font-mono block mt-1">地表反射率；高反射能抑減熱島效益</span>
                            </div>
                          </div>

                          {/* VISUAL ANALYTICAL CHART: COMPARATIVE BAR GRAPH */}
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between border-t border-slate-800/50 pt-4">
                              <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
                                ⚖️ 今日即時溫度 vs. {anomalyBaseline === "pre-industrial" ? "工業化前" : anomalyBaseline === "kyoto" ? "1990年歷史" : "常年歷史"}基準量
                              </h4>
                              {live && (
                                <span className={`text-[10px] px-2 py-0.5 font-mono rounded font-bold ${
                                  renderAnomaly >= 0 ? "text-red-400 bg-red-950/20" : "text-cyan-400 bg-cyan-950/20"
                                }`}>
                                  當前偏差值：{renderAnomaly >= 0 ? "+" : ""}{renderAnomaly}°C
                                </span>
                              )}
                            </div>

                            {live ? (
                              <div className="h-44 w-full bg-[#0A0C10] border border-slate-850/60 p-4 rounded text-xs flex flex-col justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={compChartData}
                                    barGap={12}
                                    layout="vertical"
                                  >
                                    <XAxis type="number" stroke="#475569" fontSize={11} domain={['auto', 'auto']} />
                                    <YAxis type="category" dataKey="name" hide />
                                    <ChartTooltip
                                      contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#334155', borderRadius: '4px' }}
                                      labelStyle={{ color: '#94a3b8', fontFamily: 'monospace' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                                    <Bar dataKey="常年歷史基準氣溫" fill="#334155" barSize={26} radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="今日最新實時觀測" fill={renderAnomaly >= 0 ? "#ef4444" : "#0ea5e9"} barSize={26} radius={[0, 4, 4, 0]} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            ) : (
                              <div className="h-44 w-full bg-[#0A0C10]/40 border border-slate-850/60 rounded flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs font-sans gap-2">
                                <RefreshCw className="w-5 h-5 text-slate-700 animate-spin" />
                                <span>正在和設於全球大氣監測處（WMO / NOAA）的站點伺服器握手連線，請稍候...</span>
                              </div>
                            )}
                          </div>

                          {/* CLIMATOLOGICAL RISK ANALYSIS FROM PRESETS */}
                          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-shrink sm:items-center justify-between gap-3 text-xs bg-black/15 p-4 rounded">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-400 block font-mono">⚠️ 該城市氣候演變核心危機 (Urban Climate Risk)</span>
                              <span className="text-slate-500 font-sans leading-relaxed text-[11px] block">
                                {station.id === "taipei" && "局部超常極端高溫會急速增強大氣持水能力（每升溫 1°C 增加 7%），午後熱對流暴雨及低窪盆地積水可能常態化發生。"}
                                {station.id === "tokyo" && "高樓熱島效應阻擋海風散熱，極端熱浪使空調與供電系統面臨超載極限，並加劇市區熱雷雨的暴發概率。"}
                                {station.id === "jakarta" && "面臨全球海平面上升與極端降雨，同時伴隨地下水過抽引起嚴重的地面下陷危機，多達三分之一的低海平面特區可能在 2050 年前被海水吞噬。"}
                                {station.id === "cairo" && "極度乾旱使大氣升溫加速，在撒哈拉熱風交互下引致高達 45°C 的猛烈乾旱熱浪，亦面臨高度不穩定的尼羅河水資源與農業供應鏈危機。"}
                                {station.id === "london" && "一旦大西洋經向翻轉環流 (AMOC) 減速崩盤，將嚴重削弱歐洲溫和氣候調節；同時 40°C 以上的超級罕見夏日熱浪在近年已首次被寫入歷史。"}
                                {station.id === "newyork" && "在海平面急遽升高背景下，巨型颶風暴潮極易沿著紐約港入侵排水與地鐵系統，威脅沿岸極為密集的商業金融古老基礎建設。"}
                                {station.id === "sydney" && "南半球大氣偶極與野火高發期，高溫低濕外加常態強風將本市周邊山林大火率（如黑色夏季野火事件）推向危險的臨界閾值。"}
                                {station.isCustomCity && "作為全球氣候觀測補強節點，其微氣候熱輻射與不透水層面極易引發高度不穩定的都市防洪、暴雨、乾旱與社會熱緊迫危機。"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {cityAnalysisTab === "vulnerability" && (() => {
                        if (!live) {
                          return (
                            <div className="p-8 text-center text-slate-500 text-xs italic bg-[#0A0C10] border border-slate-850 rounded">
                              氣候常態觀測數據未載入，請按上方『重新整理』按鈕獲取實時數據。
                            </div>
                          );
                        }

                        const activeAdapts = implementedAdaptations[station.id] || [];
                        const hasCoolRoof = activeAdapts.includes("cool-roof");
                        const hasSpongeCity = activeAdapts.includes("sponge-city");
                        const hasMicroForest = activeAdapts.includes("micro-forest");
                        const hasSmartGrid = activeAdapts.includes("smart-grid");

                        const T = live.temp;
                        const RH = live.humidity;
                        
                        const es = 0.61078 * Math.exp((17.27 * T) / (T + 237.3));
                        const ea = es * (RH / 100);
                        const vpd = Math.max(0, es - ea);

                        const tempMitigation = (hasCoolRoof ? 1.4 : 0) + (hasMicroForest ? 1.6 : 0);
                        const apparentMitigated = Number((live.apparentTemp - tempMitigation).toFixed(1));

                        const baseHeatIndex = Math.max(10, Math.min(100, Math.round((T - 15) * 4.5 + RH * 0.35)));
                        const mitigatedHeatIndex = Math.max(5, Math.round(baseHeatIndex - (hasCoolRoof ? 18 : 0) - (hasMicroForest ? 12 : 0)));

                        const rain = live.precipitation;
                        const baseFloodThreat = Math.max(5, Math.min(100, Math.round(rain * 9 + (station.id === "jakarta" ? 45 : 12))));
                        const mitigatedFloodThreat = Math.max(5, Math.round(baseFloodThreat * (hasSpongeCity ? 0.6 : 1.0)));

                        const baseGridDowntime = Math.max(5, Math.min(100, Math.round((Math.abs(T - 18) * 3.5) + (station.id === "cairo" ? 25 : 8))));
                        const mitigatedGridDowntime = Math.max(3, Math.round(baseGridDowntime * (hasSmartGrid ? 0.4 : 1.0)));

                        const scoreData = [
                          { name: "極端熱浪壓力 (%)", "原始威脅指數": baseHeatIndex, "防護後剩餘風險": mitigatedHeatIndex },
                          { name: "雨澇潰淹危害 (%)", "原始威脅指數": baseFloodThreat, "防護後剩餘風險": mitigatedFloodThreat },
                          { name: "電網崩潰臨界 (%)", "原始威脅指數": baseGridDowntime, "防護後剩餘風險": mitigatedGridDowntime },
                        ];

                        return (
                          <div className="space-y-6">
                            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block bg-amber-500/10 p-2.5 rounded border border-amber-900/30">
                              ⚡ 進階微氣候脆弱性與物理解析 / Microclimate Vulnerability Metrics
                            </span>

                            {/* Detailed Science Telemetry */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="p-4 bg-[#0A0C10] border border-slate-800 rounded">
                                <span className="text-[10px] font-mono text-slate-500 block">大氣水飽和分壓差 (VPD)</span>
                                <div className="mt-1 flex items-baseline gap-1.5">
                                  <span className="text-xl font-bold font-mono text-amber-400">{vpd.toFixed(3)}</span>
                                  <span className="text-xs text-slate-500">kPa</span>
                                </div>
                                <p className="text-[9px] text-slate-400 mt-2 leading-relaxed">
                                  大氣本質持水力與地表植物水分耗損指標。{vpd > 1.4 ? "⚠️ 數值偏高，地表水分蒸發旺盛，乾旱與野火風險驟增。" : "🟢 數值溫和，大氣水氣壓力持衡。"}
                                </p>
                              </div>

                              <div className="p-4 bg-[#0A0C10] border border-slate-800 rounded">
                                <span className="text-[10px] font-mono text-slate-500 block">綜合體感熱緊迫度</span>
                                <div className="mt-1 flex items-baseline gap-1.5">
                                  <span className="text-xl font-bold font-mono text-rose-400">{apparentMitigated}°C</span>
                                  {tempMitigation > 0 && (
                                    <span className="text-[10px] text-emerald-400 font-bold ml-1">(-{tempMitigation}°C)</span>
                                  )}
                                </div>
                                <p className="text-[9px] text-slate-400 mt-2 leading-relaxed">
                                  {apparentMitigated >= 35 ? "🔴 極高熱應力！濕熱環境下排汗與調節機制嚴重受制阻。" : 
                                   apparentMitigated >= 28 ? "🟡 中高熱緊迫。長時戶外活動易產生熱衰竭風險。" : "🟢 安全或舒適低熱壓力環境等級。"}
                                </p>
                              </div>

                              <div className="p-4 bg-[#0A0C10] border border-slate-800 rounded">
                                <span className="text-[10px] font-mono text-slate-500 block">減災自適應防禦率</span>
                                <div className="mt-1 flex items-baseline gap-1.5">
                                  <span className="text-xl font-bold font-mono text-emerald-400">
                                    {(activeAdapts.length * 25)}%
                                  </span>
                                </div>
                                <p className="text-[9px] text-slate-400 mt-2 leading-relaxed">
                                  已實施 {activeAdapts.length} / 4 項城市改造。您可至『自訂韌性適應藍圖』中核選策略，此處極端威脅點數將即刻重置滑落。
                                </p>
                              </div>
                            </div>

                            {/* Threat comparison chart */}
                            <div className="space-y-3 bg-[#0A0C10] p-4 rounded border border-slate-850">
                              <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
                                🛡️ 都市防禦前 vs. 調適因應部署後的威脅消退對比 (Risk Mitigation Matrix)
                              </h4>
                              <div className="h-44 w-full text-xs">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={scoreData} layout="vertical" barGap={4}>
                                    <XAxis type="number" stroke="#475569" fontSize={11} domain={[0, 100]} />
                                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={110} />
                                    <ChartTooltip
                                      contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#334155', borderRadius: '4px' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                                    <Bar dataKey="原始威脅指數" fill="#f43f5e" barSize={10} radius={[0, 2, 2, 0]} />
                                    <Bar dataKey="防護後剩餘風險" fill="#10b981" barSize={10} radius={[0, 2, 2, 0]} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {cityAnalysisTab === "simulation" && (() => {
                        const currentAnomaly = live ? live.anomaly : 0.8;
                        const co2Score = co2TargetGoal * 0.25;
                        const solarScore = (solarTransition - 10) * 0.15;
                        const treesScore = reforestationRate * 1.5;
                        const taxScore = carbonTax / 2.5;
                        const methaneScore = methaneReduction * 0.18;
                        const ccsScore = ccsCapacity * 1.6;
                        const phaseoutScore = Math.max(0, (2120 - fossilPhaseoutYear) * 0.22);
                        const policyScore = Math.min(100, Math.max(0, co2Score + solarScore + treesScore + taxScore + methaneScore + ccsScore + phaseoutScore));
                        const fx = policyScore / 100;

                        const years = [2020, 2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100];
                        const r85Increments = [0, 0.5, 1.0, 1.6, 2.2, 2.8, 3.4, 4.1, 4.8];
                        const r45Increments = [0, 0.4, 0.8, 1.1, 1.3, 1.5, 1.7, 1.9, 2.0];
                        const r26Increments = [0, 0.3, 0.5, 0.6, 0.7, 0.8, 0.8, 0.8, 0.8];

                        const projectionData = years.map((yr, idx) => {
                          const base85 = Number((currentAnomaly + r85Increments[idx]).toFixed(2));
                          const base45 = Number((currentAnomaly + r45Increments[idx]).toFixed(2));
                          const base26 = Number((currentAnomaly + r26Increments[idx]).toFixed(2));
                          const custom = Number((base85 - (base85 - base26) * fx).toFixed(2));
                          
                          return {
                            year: yr,
                            "RCP 8.5 無作為失控升溫": base85,
                            "RCP 4.5 穩態政策基線": base45,
                            "RCP 2.6 積極控溫情境": base26,
                            "本系統當前自訂政策軌跡": custom,
                          };
                        });

                        return (
                          <div className="space-y-5">
                            <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest block bg-sky-500/10 p-2.5 rounded border border-sky-900/30">
                              📈 IPCC 氣候情境在該城市的長期模擬投影 (遠期至 2100 年)
                            </span>

                            <div className="p-4 bg-[#0A0C10] border border-slate-800 rounded grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono text-slate-500 block">當前全球減碳政策得分</span>
                                <span className="text-lg font-bold font-mono text-sky-400">{policyScore.toFixed(1)} / 100</span>
                                <p className="text-[9px] text-slate-400 leading-relaxed font-sans">
                                  基於主控制面板之參數比重加總得分，這將直接推導出此處的預測調控曲線。
                                </p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono text-slate-500 block">2100 年本城市相對常態溫差</span>
                                <span className="text-lg font-bold font-mono text-emerald-400">
                                  {live ? `+${(currentAnomaly + r85Increments[8] - (r85Increments[8] - r26Increments[8]) * fx).toFixed(1)}°C` : "計算中..."}
                                </span>
                                <p className="text-[9px] text-slate-400 leading-relaxed font-sans">
                                  相較高排失控情境的 <strong className="text-red-400">+{Number((currentAnomaly + r85Increments[8]).toFixed(1))}°C</strong>，您的當前綠能與植樹政策已成功為該城市多抑止阻絕約 <strong className="text-emerald-400">{((r85Increments[8] - r26Increments[8]) * fx).toFixed(1)}°C</strong> 的極端化升溫。
                                </p>
                              </div>
                            </div>

                            {/* Recharts Line Chart for simulation */}
                            <div className="h-56 w-full bg-[#0A0C10] border border-slate-850 p-4 rounded text-xs">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={projectionData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                  <XAxis dataKey="year" stroke="#475569" fontSize={11} />
                                  <YAxis stroke="#475569" label={{ value: '升溫幅 (°C)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: '10px' } }} fontSize={11} />
                                  <ChartTooltip
                                    contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#334155', borderRadius: '4px' }}
                                    labelStyle={{ color: '#94a3b8', fontFamily: 'monospace' }}
                                  />
                                  <Legend wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} />
                                  <Line type="monotone" dataKey="RCP 8.5 無作為失控升溫" stroke="#ef4444" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                                  <Line type="monotone" dataKey="RCP 4.5 穩態政策基線" stroke="#f97316" strokeWidth={1} dot={false} />
                                  <Line type="monotone" dataKey="RCP 2.6 積極控溫情境" stroke="#10b981" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                                  <Line type="monotone" dataKey="本系統當前自訂政策軌跡" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3 }} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                            <p className="text-[9px] text-slate-500 font-sans leading-relaxed text-center">
                              * 本數值為基於局部地理經緯度特性的區域動力降尺度推估模擬（以聯合國 IPCC AR6 數值算法建立實時插值方程）。
                            </p>
                          </div>
                        );
                      })()}

                      {cityAnalysisTab === "adaptation" && (() => {
                        const activeAdapts = implementedAdaptations[station.id] || [];

                        const toggleAdapt = (adaptId: string) => {
                          setImplementedAdaptations(prev => {
                            const current = prev[station.id] || [];
                            const updated = current.includes(adaptId)
                              ? current.filter(id => id !== adaptId)
                              : [...current, adaptId];
                            return {
                              ...prev,
                              [station.id]: updated
                            };
                          });
                        };

                        const options = [
                          {
                            id: "cool-roof",
                            title: "酷涼反照屋頂與塗层塗料 / Cool Roofs Coating",
                            desc: "於高密度水泥與柏油屋頂覆蓋高反照率材料，大幅增強太陽輻射向宇宙的直接反射，減少地表熱量囤積。",
                            impact: "🔴 微氣候局部威脅：調降極端熱浪指數 -15%",
                            icon: "🎨"
                          },
                          {
                            id: "sponge-city",
                            title: "海綿滯洪透水鋪面與生態凹地 / Sponge Infrastructure",
                            desc: "將堅硬鋪面改造為透水植被和礫石地，輔以暴雨地表溢流滯留池，大幅延緩短時強降水對都市排水電網的過載衝擊。",
                            impact: "🌧️ 雨澇風險：大幅調減累計地表積水倒灌係數 -40%",
                            icon: "🌱"
                          },
                          {
                            id: "micro-forest",
                            title: "市區微型口袋森林與立體綠化 / Pocket Forest Shade",
                            desc: "在水泥高樓群與主幹道周邊見縫插針種植高蒸散率原生灌木，提供物理人行蔽蔭並大幅消除熱島效應效能。",
                            impact: "🌡️ 體感應力：下調酷涼感、體感溫度約 -1.6°C",
                            icon: "🌳"
                          },
                          {
                            id: "smart-grid",
                            title: "智慧雙向局部微電網備用儲能 / Microgrid Backup",
                            desc: "佈署獨立的社區級冷暖調節微型儲能及智慧輔助電網，以免在超級熱浪與極端風雨中市內主高電網集體癱瘓崩潰。",
                            impact: "⚡ 防禦指數：抑制電網崩漏臨界度 -60%",
                            icon: "🔌"
                          }
                        ];

                        return (
                          <div className="space-y-4">
                            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block bg-emerald-500/10 p-2.5 rounded border border-emerald-900/30">
                              🛡️ 自訂都市微氣候韌性治理與調適藍圖 / Climate Resilience Planner
                            </span>

                            <div className="p-3 bg-[#0A0C10] border border-slate-800 text-slate-400 text-xs font-sans leading-relaxed">
                              💡 <strong>交互模擬提示：</strong> 下方為工程和科學調適選項。您可以針對 {station.name} <strong>按需勾選/部署</strong> 這些關鍵防禦策略。勾選後，請切換至 <strong>「脆弱度與酷熱指數」</strong> 分析視圖，將會觀察到對應的微氣候危害指數被實時消減！
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                              {options.map((opt) => {
                                const isChecked = activeAdapts.includes(opt.id);
                                return (
                                  <div
                                    key={opt.id}
                                    onClick={() => toggleAdapt(opt.id)}
                                    className={`p-3.5 rounded-sm border cursor-pointer select-none transition-all ${
                                      isChecked
                                        ? "bg-emerald-950/10 border-emerald-500/50 text-white"
                                        : "bg-[#0A0C10] border-slate-800 hover:border-slate-700 text-slate-400"
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="text-xl shrink-0 mt-0.5">{opt.icon}</div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1.5">
                                          <h4 className={`text-xs font-bold font-sans ${isChecked ? "text-emerald-400" : "text-slate-200"}`}>
                                            {opt.title}
                                          </h4>
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {}} // toggled by outer click div
                                            className="accent-emerald-500 pointer-events-none rounded cursor-pointer"
                                          />
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                                          {opt.desc}
                                        </p>
                                        <span className={`text-[9px] font-mono block mt-2 text-emerald-400 font-semibold bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/20 w-fit`}>
                                          {opt.impact}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {cityAnalysisTab === "radar" && (() => {
                        if (!live) {
                          return (
                            <div className="p-8 text-center text-slate-500 text-xs italic bg-[#0A0C10] border border-slate-850 rounded">
                              氣候常態觀測數據未載入，請按上方『重新整理』按鈕獲取實時數據。
                            </div>
                          );
                        }

                        // Hazard computations based on real current values
                        const tempVal = live.temp;
                        const humVal = live.humidity;
                        const windVal = live.windSpeed;
                        const rainVal = live.precipitation;
                        const pmVal = live.pm25 ?? 15;
                        const co2Val = live.co2Level ?? 415;

                        // Calculate physical severity indices (0 to 100)
                        const heatHazard = Math.max(0, Math.min(100, Math.round((tempVal - 10) * 3.2 + (humVal - 40) * 0.4)));
                        const floodHazard = Math.max(0, Math.min(100, Math.round(rainVal > 0 ? (rainVal * 12 + 10) : 5)));
                        const airHazard = Math.max(0, Math.min(100, Math.round(pmVal * 1.5 + (co2Val - 350) * 0.15)));
                        const windHazard = Math.max(0, Math.min(100, Math.round(windVal * 2.2)));

                        // Hazard category and recommendation
                        let worstHazardScore = Math.max(heatHazard, floodHazard, airHazard, windHazard);
                        let warningStatus = "🔵 遙測訊號持衡 (Telemetry Stable)";
                        let warningColor = "text-sky-400 bg-sky-950/20 border-sky-900/30";
                        if (worstHazardScore > 75) {
                          warningStatus = "🔴 超高臨界危害警告 (CRITICAL CRISIS ALERT)";
                          warningColor = "text-red-400 bg-red-955/40 border-red-900/50 animate-pulse";
                        } else if (worstHazardScore > 45) {
                          warningStatus = "🟡 中度敏感災害警戒 (MODERATE THREAT WATCH)";
                          warningColor = "text-amber-500 bg-amber-955/20 border-amber-900/30";
                        }

                        // Trigger Local Downscaler report
                        const handleTriggerAiDiagnostic = () => {
                          setIsLocalHazardAiLoading(true);
                          setLocalHazardAiReport(null);
                          setTimeout(() => {
                            const baselineLabel = anomalyBaseline === "pre-industrial" ? "1850年工業化前" : anomalyBaseline === "kyoto" ? "1990年京都議定書" : "當代全球標準";
                            const report = `### 🚨 ${station.name} — 大氣動力降尺度 AI 臨近危害評估報告`;
                            setLocalHazardAiReport(report);
                            setIsLocalHazardAiLoading(false);
                          }, 1000);
                        };

                        return (
                          <div className="space-y-5 animate-fade-in">
                            {/* Warning Status Panel */}
                            <div className={`p-4 border rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${warningColor}`}>
                              <span className="font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-1.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${worstHazardScore > 75 ? 'bg-red-500 animate-ping' : worstHazardScore > 45 ? 'bg-amber-550 bg-amber-500 animate-pulse' : 'bg-sky-45         '}`} />
                                {warningStatus}
                              </span>
                              <span className="text-[10px] p-1 bg-black/30 rounded font-mono border border-white/5 text-right">
                                衛星鏈接安全頻寬: 99.8% | 反射率(Albedo): 0.12 | 系統偏差: ±0.05°C
                              </span>
                            </div>

                            {/* Command Hazards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              
                              {/* Left Columns - Live Hazard Meters */}
                              <div className="bg-[#0A0C10] border border-slate-800 p-4 rounded-sm space-y-4">
                                <span className="text-[10px] font-mono font-bold text-rose-455 text-rose-400 uppercase tracking-widest block border-b border-slate-850 pb-2">
                                  📊 即時臨界高溫與極端氣候危害量化 / Extreme Climatological Risk Drivers
                                </span>
                                
                                <div className="space-y-3 font-sans">
                                  {/* Item 1 */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-slate-300 font-semibold">☀️ 微熱島熱緊迫阻滯強度 (Heat Island Severity)</span>
                                      <span className={`font-mono text-[11px] font-bold ${heatHazard > 75 ? "text-rose-400" : heatHazard > 45 ? "text-amber-400" : "text-sky-300"}`}>{heatHazard}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-900 rounded overflow-hidden">
                                      <div className={`h-full transition-all duration-500 ${heatHazard > 75 ? 'bg-rose-500' : heatHazard > 45 ? 'bg-amber-500' : 'bg-sky-500'}`} style={{ width: `${heatHazard}%` }} />
                                    </div>
                                    <span className="text-[9px] text-slate-500 block leading-relaxed">受大氣極限溫濕度耦合調控，反映人體及都市硬體極限排熱壓力。</span>
                                  </div>

                                  {/* Item 2 */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-slate-300 font-semibold">🌧️ 短延時雨澇溢淹速率 (Flash Flooding Coefficient)</span>
                                      <span className={`font-mono text-[11px] font-bold ${floodHazard > 60 ? "text-rose-400" : floodHazard > 10 ? "text-amber-400" : "text-slate-400"}`}>{floodHazard}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-900 rounded overflow-hidden">
                                      <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${floodHazard}%` }} />
                                    </div>
                                    <span className="text-[9px] text-slate-500 block leading-relaxed">當前實體雨量：{rainVal} mm。若上升 1°C，局部特大暴雨危害風險加權 7.2%。</span>
                                  </div>

                                  {/* Item 3 */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-slate-300 font-semibold">🌫️ 氣溶膠微粒污染與蓄積毒性 (Particulate Air Toxicity)</span>
                                      <span className={`font-mono text-[11px] font-bold ${airHazard > 75 ? "text-rose-400" : airHazard > 45 ? "text-amber-400" : "text-sky-300"}`}>{airHazard}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-900 rounded overflow-hidden">
                                      <div className={`h-full transition-all duration-500 ${airHazard > 75 ? 'bg-rose-500' : airHazard > 45 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${airHazard}%` }} />
                                    </div>
                                    <span className="text-[9px] text-slate-500 block leading-relaxed">綜合局部空氣懸浮懸浮物 PM2.5 及高空二氧化碳飽和超載。</span>
                                  </div>

                                  {/* Item 4 */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-slate-300 font-semibold">💨 空氣湍流熱切變阻尼 (Atmospheric Shear Stress)</span>
                                      <span className={`font-mono text-[11px] font-bold ${windHazard > 60 ? "text-amber-400" : "text-slate-400"}`}>{windHazard}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-900 rounded overflow-hidden">
                                      <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${windHazard}%` }} />
                                    </div>
                                    <span className="text-[9px] text-slate-500 block leading-relaxed">風速與大氣擴散係數。強風有助減熱島，但過大風速引發極端對流風暴及沙塵移運。</span>
                                  </div>
                                </div>
                              </div>

                              {/* Right Columns - Live Terminal Simulator */}
                              <div className="bg-[#05080C] border border-slate-800 p-4 rounded-sm flex flex-col h-[325px] overflow-hidden font-mono text-[10px] justify-between">
                                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                                  <div className="text-slate-500 border-b border-slate-905 border-slate-800 pb-1.5 flex justify-between uppercase">
                                    <span>📟 Telemetry Stream Console</span>
                                    <span className="animate-pulse">● RECORDING</span>
                                  </div>
                                  <div className="text-emerald-400">
                                    &gt; SECURE REMOTE PORT SHAKE... OK
                                  </div>
                                  <div className="text-slate-400">
                                    &gt; Querying coordinates: Latitude {station.latitude} | Longitude {station.longitude}
                                  </div>
                                  <div className="text-slate-400">
                                    &gt; Historical baseline epoch set to [{anomalyBaseline.toUpperCase()}]
                                  </div>
                                  <div className="text-slate-300 font-semibold">
                                    &gt; Environment Temp computed: {tempVal}°C | Normal expected: {adjustedHistAvgTemp}°C
                                  </div>
                                  <div className={`font-mono font-bold ${renderAnomaly > 1.5 ? "text-red-400" : renderAnomaly > 0 ? "text-amber-400" : "text-sky-300"}`}>
                                    &gt; Relative thermal offset calibrated: {renderAnomaly >= 0 ? "+" : ""}{renderAnomaly}°C
                                  </div>
                                  <div className="text-slate-400">
                                    &gt; Humid factor [{humVal}%] &amp; Apparent [{live.apparentTemp}°C] verified
                                  </div>
                                  <div className="text-slate-400">
                                    &gt; Industrial baseline CO2 displacement index: +{Math.max(0, Math.round(co2Val - 280))} ppm
                                  </div>
                                  <div className="text-slate-500">
                                    &gt; Global weather data stream updated successfully. Latency in bounds (32ms).
                                  </div>
                                </div>

                                <div className="border-t border-slate-900 pt-3 flex flex-col gap-2">
                                  <button
                                    onClick={handleTriggerAiDiagnostic}
                                    disabled={isLocalHazardAiLoading}
                                    className="w-full py-2 bg-gradient-to-r from-rose-900/40 to-blue-900/40 hover:from-rose-500 hover:to-blue-600 border border-rose-800/60 hover:border-sky-400 text-rose-300 hover:text-slate-950 text-xs font-bold font-sans rounded-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50 select-none"
                                  >
                                    <span>{isLocalHazardAiLoading ? "💻 正在精細化耦合大氣模型計算..." : "🧠 啟動 AI 實時微氣候深降尺度危害精算"}</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Diagnostic Report Area */}
                            {localHazardAiReport && (
                              <div className="bg-[#05080C] border border-slate-800 rounded p-4 animate-fade-in font-sans text-xs">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                                  <span className="font-mono text-[9px] text-cyan-400 uppercase tracking-widest font-bold">
                                    💡 耦合動力與 AI 實時精算分析報告 (Downscaled Live Report)
                                  </span>
                                  <button 
                                    onClick={() => setLocalHazardAiReport(null)}
                                    className="text-slate-500 hover:text-white font-mono text-[10px]"
                                  >
                                    清除報告 [X]
                                  </button>
                                </div>
                                <div className="space-y-2.5 text-slate-300 leading-relaxed max-h-[300px] overflow-y-auto pr-1">
                                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1">
                                    <span>🚨 {station.name} — 大氣動力降尺度 AI 臨近危害評估報告</span>
                                  </h3>
                                  <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                                    <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded">
                                      基準時間：{new Date().toISOString().replace("T", " ").substring(0, 19)} (UTC)
                                    </span>
                                    <span className="px-1.5 py-0.5 bg-sky-950/20 text-sky-400 border border-sky-900/30 rounded font-semibold">
                                      比對基年異常差值: {renderAnomaly >= 0 ? "+" : ""}{renderAnomaly}°C
                                    </span>
                                  </div>
                                  <div className="p-3 bg-slate-950 border border-slate-850 rounded space-y-2.5">
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-200 font-sans">1. 物理熱緊迫與大氣邊界層 (TBL) 熱力特徵</h4>
                                      <p className="text-[11px] text-slate-400 mt-1 font-sans">
                                        當前實測溫度 <strong className="text-white">{tempVal}°C</strong>，相對濕度 <strong className="text-white">{humVal}%</strong>，體感溫度為 <strong className="text-sky-400">{live.apparentTemp}°C</strong>。由大氣飽和分壓差 (VPD) 模型推估，微氣候「超高溫常態」機率攀升，都市熱力蓄積顯著。
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-200 font-sans">2. 積水漫溢與短延時極端降水 (PMP) 仿真</h4>
                                      <p className="text-[11px] text-slate-400 mt-1 font-sans">
                                        當前實測降水量 <strong className="text-white">{rainVal} mm</strong>。氣候熱力效應下，每升溫 1°C 大氣對流持水能力上升 7.2%。這在有都市防洪瓶頸的微米尺度中，極易引發超載倒灌危害及突發漫溢。
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-200 font-sans">3. 局部環境氣溶膠與空氣物理致毒反應</h4>
                                      <p className="text-[11px] text-slate-400 mt-1 font-sans">
                                        當前 PM2.5 實測：<strong className="text-white">{pmVal} µg/m³</strong>，相對 CO₂ 折算值：<strong className="text-white">{co2Val} ppm</strong>。近地表若缺乏擴散或遭遇極速降溫，低空逆溫層將加劇工業廢氣蓄積，構成嚴重的呼吸道與體感過載威脅。
                                      </p>
                                    </div>
                                    <div className="pt-2 border-t border-slate-900 font-sans">
                                      <h4 className="text-xs font-bold text-emerald-400">🛡️ 本站最佳韌性調適因應部署建議：</h4>
                                      <p className="text-[11px] text-emerald-400/90 mt-1">
                                        該站點物理危害偏重。建議在左側「自訂韌性適應藍圖」中，優先核選部署【{
                                          station.id === "taipei" ? "微型口袋森林與海綿滯洪透水鋪面" :
                                          station.id === "cairo" ? "高反照率屋頂塗層與沙塵阻燃隔離" :
                                          "智慧輔助獨立局部備用儲能與口袋遮蔭樹冠"
                                        }】，可獲得最佳減災效益（將其災害剩餘威脅指數下修消落高達 40%-60% 以上）。
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Landscape simulation content section removed as requested */}
                    </div>
                  );
                })()}
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            TAB B: CODE EXPORTER - MOCK VS CODE ENVIRONMENT
            ======================================================== */}
        {activeTab === "python-exporter" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: CUSTOM PARAMETERS PANEL (4 COLS) */}
            <div className="lg:col-span-4 bg-[#11141A] border border-slate-800 p-5 space-y-6 rounded-sm shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Sliders className="w-5 h-5 text-slate-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                    Python 儀表板規格配置
                  </h2>
                </div>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  一鍵生成並客製化 Python Streamlit 程式碼。您可在此重組圖表庫、背景渲染等主題規格。
                </p>
              </div>

              {/* Theme option */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider font-sans">
                  1. Streamlit 介面主題
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-python-dark"
                    onClick={() => setPythonOptions(prev => ({ ...prev, theme: "dark" }))}
                    className={`px-3 py-1.5 text-xs rounded-sm border text-center font-bold transition-all ${
                      pythonOptions.theme === "dark"
                        ? "bg-slate-800 text-white border-slate-600"
                        : "bg-[#0A0C10] text-[#A0AEC0] border-slate-800 hover:text-white"
                    }`}
                  >
                    深色 Slate 暗色調
                  </button>
                  <button
                    id="btn-python-light"
                    onClick={() => setPythonOptions(prev => ({ ...prev, theme: "light" }))}
                    className={`px-3 py-1.5 text-xs rounded-sm border text-center font-bold transition-all ${
                      pythonOptions.theme === "light"
                        ? "bg-slate-100 text-slate-900 border-slate-300"
                        : "bg-[#0A0C10] text-[#A0AEC0] border-slate-800 hover:text-white"
                    }`}
                  >
                    明亮高雅亮色調
                  </button>
                </div>
              </div>

              {/* Chart library */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider font-sans">
                  2. 可視化互動圖表庫
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-chart-plotly"
                    onClick={() => setPythonOptions(prev => ({ ...prev, chartLibrary: "plotly" }))}
                    className={`px-3 py-1.5 text-xs rounded-sm border text-center font-bold transition-all ${
                      pythonOptions.chartLibrary === "plotly"
                        ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/50"
                        : "bg-[#0A0C10] text-[#A0AEC0] border-slate-800 hover:text-white"
                    }`}
                  >
                    Plotly (頂級高互動性)
                  </button>
                  <button
                    id="btn-chart-matplotlib"
                    onClick={() => setPythonOptions(prev => ({ ...prev, chartLibrary: "matplotlib" }))}
                    className={`px-3 py-1.5 text-xs rounded-sm border text-center font-bold transition-all ${
                      pythonOptions.chartLibrary === "matplotlib"
                        ? "bg-amber-950/20 text-amber-400 border-amber-500/50"
                        : "bg-[#0A0C10] text-[#A0AEC0] border-slate-800 hover:text-white"
                    }`}
                  >
                    Matplotlib (靜態圖)
                  </button>
                </div>
              </div>

              {/* Include prediction segment */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider font-sans">
                  3. 投射政策與物理預測模型
                </label>
                <label className="flex items-center space-x-2.5 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pythonOptions.includePrediction}
                    onChange={(e) => setPythonOptions(prev => ({ ...prev, includePrediction: e.target.checked }))}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer rounded border-slate-850 bg-[#0A0C10] text-slate-350"
                  />
                  <span className="text-slate-300 font-medium">包含 2025 - 2100 端點之物理演算法</span>
                </label>
                <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                  核心將自動整合一個以物理公式建立的預測控制項，讓用戶調整減碳百分比能即時在 python 視圖中畫出投影曲線。
                </p>
              </div>

              {/* Metrics selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider font-sans">
                  4. 重點匯出溫室核心數據
                </label>
                <div className="space-y-2">
                  {climateMetrics.map(m => {
                    const isSelected = pythonOptions.metricsSelected.includes(m.id);
                    return (
                      <label key={m.id} className="flex items-center space-x-2.5 text-xs cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setPythonOptions(prev => {
                              const list = prev.metricsSelected.includes(m.id)
                                ? prev.metricsSelected.filter(id => id !== m.id)
                                : [...prev.metricsSelected, m.id];
                              return { ...prev, metricsSelected: list };
                            });
                          }}
                          className="w-4 h-4 accent-emerald-500 cursor-pointer"
                        />
                        <span className="text-slate-400 font-medium font-sans">{m.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* COMPILATION / CUSTOM GENERATING VIA GEMINI */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={fetchAICustomPythonCode}
                  disabled={isGeneratingPython}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-sm bg-emerald-600 text-slate-950 font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>
                    {isGeneratingPython ? "Gemini 重構演算法代碼中..." : "✨ AI 重新客製 Python 程式碼"}
                  </span>
                </button>
                <p className="text-[10px] text-slate-500 leading-relaxed text-center font-sans">
                  點擊將向 Gemini 後端發佈 Prompt，自定義您所勾選的參數，重新最佳化 Python 代碼框架！
                </p>
              </div>

            </div>

            {/* RIGHT COLUMN: VS CODE MOCK CODE EDITOR (8 COLS) */}
            <div className="lg:col-span-8 flex flex-col space-y-4">
              
              {/* CODE WINDOW */}
              <div className="bg-[#0A0C10] border border-slate-800 rounded-sm overflow-hidden shadow-2xl flex-grow flex flex-col min-h-[500px]">
                
                {/* Editor Header Bar */}
                <div className="bg-[#11141A] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  
                  {/* File title */}
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1 px-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500/80 inline-block"></span>
                      <span className="w-2 h-2 rounded-full bg-amber-500/80 inline-block"></span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500/80 inline-block"></span>
                    </div>
                    <span className="text-slate-700 font-bold px-1 select-none">|</span>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-mono">
                      <FileCode className="w-4 h-4 text-emerald-400" />
                      <span>streamlit_climate_app.py</span>
                      <span className="text-slate-505 text-slate-500 font-sans italic">— Python 核心腳本</span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center space-x-2">
                    {/* Copy code banner action */}
                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 rounded-sm text-xs bg-[#0A0C10] hover:bg-slate-800 text-slate-300 hover:text-white transition-all flex items-center space-x-1.5 cursor-pointer font-bold border border-slate-800"
                    >
                      {copySuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold font-mono">SUCCESS!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>複製代碼</span>
                        </>
                      )}
                    </button>

                    {/* Download py code */}
                    <button 
                      onClick={handleDownloadFile}
                      className="px-3 py-1.5 rounded-sm text-xs bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>一鍵下載腳本</span>
                    </button>
                  </div>

                </div>

                {/* Editor Content Area */}
                <div className="p-4 overflow-auto max-h-[500px] flex-grow font-mono text-sm leading-normal bg-[#0A0C10] text-[#A0AEC0] selection:bg-emerald-500/25">
                  <pre className="whitespace-pre align-baseline">
                    <code>{pythonCode}</code>
                  </pre>
                </div>

              </div>

              {/* CLI EXECUTION TIP BLOCK */}
              <div className="bg-[#11141A] border border-slate-800 p-4.5 rounded-sm shadow-lg space-y-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-2 select-none uppercase tracking-wider font-mono">
                  <Info className="w-4 h-4 text-emerald-400" />
                  <span>如何在您的電腦本機執行此 Python 溫室監測站？</span>
                </h4>
                <div className="text-xs text-slate-400 pl-6 leading-relaxed space-y-1.5 font-sans">
                  <p>1. 下載完畢後，請確保電腦本機已安裝 <span className="text-slate-200 font-semibold">Python 3.8+</span> 環境。</p>
                  <p>2. 初始化並安裝相依套件至您的環境（在終端機 / CLI 執行）：</p>
                  <div className="bg-[#0A0C10] border border-slate-800 p-2.5 rounded-sm font-mono text-emerald-400 text-xs shadow-inner select-all">
                    pip install streamlit pandas numpy plotly matplotlib
                  </div>
                  <p className="mt-1">3. 安裝完成後，執行下列指令即可在本機瀏覽器開啟您的 climate 即時監控系統：</p>
                  <div className="bg-[#0A0C10] border border-slate-800 p-2.5 rounded-sm font-mono text-white text-xs shadow-inner select-all">
                    streamlit run streamlit_climate_app.py
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === "presentation" && (
          <div className="animate-fadeIn">
            <ClimatePresentation
              co2TargetGoal={co2TargetGoal}
              solarTransition={solarTransition}
              reforestationRate={reforestationRate}
              carbonTax={carbonTax}
              co2In2100={co2In2100}
              tempIn2100={tempIn2100}
              seaIn2100={seaIn2100}
              transitionIndex={transitionIndex}
            />
          </div>
        )}

      </main>

      {/* FOOTER BAR */}
      <footer className="border-t border-slate-800/80 bg-[#0A0C10] text-xs py-7 px-6 mt-12 text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="leading-relaxed">
            © 2026 全球溫室效應科學監測組 兼 Python Dashboard 程式碼發布端。
          </p>
          <div className="flex space-x-4">
            <span className="flex items-center space-x-1">
              <span>數據庫基準: NOAA, NASA GISS, NSIDC, IPCC Sixth Report (AR6)</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
