/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ClimateMetric {
  id: string;
  name: string;
  subName: string;
  currentValue: number;
  unit: string;
  yearlyChange: string;
  riskStatus: "low" | "medium" | "high" | "critical";
  description: string;
  source: string;
}

export interface ChartDataPoint {
  year: number;
  co2?: number;          // ppm
  tempAnomaly?: number;  // °C
  seaLevel?: number;     // mm
  iceExtent?: number;    // million km²
  emissions?: number;    // GtCO2
}

export interface ScenarioProjectionPoint {
  year: number;
  co2Low: number;
  co2Med: number;
  co2High: number;
  tempLow: number;
  tempMed: number;
  tempHigh: number;
}

export interface AIAnalysisRequest {
  co2Target: number;       // ppm
  solarTransition: number; // % of total energy
  reforestation: number;   // billion trees/year
  carbontax: number;       // USD per ton
}

export interface AIAnalysisResponse {
  yearAchieved: string;
  temperaturePeak: number;
  seaLevelImpact: string;
  economicImpact: string;
  narrativeText: string;
  suggestedActionPlan: string[];
  hazardRiskLevel?: string;       // 極高, 高, 中等, 輕微, 健全控制等
  tippingPoints?: string[];        // 觸發的氣候臨界點列表
  isFallback?: boolean;
  fallbackReason?: string;
}

export interface CopilotMessage {
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export interface ClimateNewsItem {
  title: string;
  content: string;
  source: string;
  date: string;
}

export interface ClimateNewsResponse {
  summary: string;
  news: ClimateNewsItem[];
  isFallback?: boolean;
  fallbackReason?: string;
}

export interface PythonCodeOptions {
  theme: "dark" | "light" | "dynamic";
  chartLibrary: "plotly" | "matplotlib" | "altair";
  includePrediction: boolean;
  metricsSelected: string[];
}

export interface ExtremeWeatherEvent {
  year: number;
  title: string;
  emoji: string;
  tempAnomalyVal?: string;
  description: string;
  location: string;
  impact: string;
}

export interface WeatherStation {
  id: string;
  name: string;
  englishName: string;
  emoji: string;
  latitude: number;
  longitude: number;
  role: string;
  histAvgTemp: number;
  colorClass: string;
  threatLevel: "極高" | "高" | "中等" | "急遽變化中" | "觀測中";
  isCustomCity?: boolean;
  country?: string;
}

export interface LiveWeatherData {
  temp: number;
  humidity: number;
  apparentTemp: number;
  precipitation: number;
  windSpeed: number;
  time: string;
  anomaly: number;
  // New indicators
  uvIndex?: number;
  cloudCover?: number;
  pressure?: number;
  windDirection?: number;
  pm25?: number;
  aqi?: number;
  aqiLabel?: string;
  co2Level?: number;
  radiation?: number;
  dewPoint?: number;
  vpd?: number;
  wetBulb?: number;
  albedo?: number;
}

export interface LandscapeGenerationResponse {
  imageUrl: string;
  prompt: string;
  isFallback: boolean;
  fallbackReason?: string;
  description: string;
}



