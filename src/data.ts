/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClimateMetric, ChartDataPoint, ScenarioProjectionPoint, ExtremeWeatherEvent, WeatherStation } from "./types";

export const CLIMATE_METRICS: ClimateMetric[] = [
  {
    id: "co2",
    name: "大氣二氧化碳濃度 (CO₂)",
    subName: "Atmospheric CO₂ Concentration",
    currentValue: 424.3,
    unit: "ppm",
    yearlyChange: "+2.4 ppm/年",
    riskStatus: "critical",
    description: "自工業革命以前的 280 ppm 開始，在大氣中積聚的溫室氣體因化石燃料燃燒和森林砍伐而急劇增加，目前正處於數百萬年來的最高點。",
    source: "美國國家海洋暨大氣管理局 (NOAA) / Mauna Loa 觀測站"
  },
  {
    id: "temp",
    name: "全球地表平均升溫異常值",
    subName: "Global Temperature Anomaly",
    currentValue: 1.28,
    unit: "°C",
    yearlyChange: "+0.02 °C/年",
    riskStatus: "high",
    description: "與工業革命前基準 (1850-1900年平均) 相比，全球年平均地表溫度升幅。升溫若突破 1.5°C，將引發氣候臨界點的連鎖效應。",
    source: "美國航太總署戈達德太空研究所 (NASA GISS)"
  },
  {
    id: "sea",
    name: "全球海平面累計上升量",
    subName: "Cumulative Sea Level Rise",
    currentValue: 108.5,
    unit: "mm",
    yearlyChange: "+3.4 mm/年",
    riskStatus: "high",
    description: "海平面升高是由冰川與冰蓋融化，以及海水受熱體積膨脹 (熱膨脹) 所共同造成。這對全球沿海地區與島國安全帶來了直接威脅。",
    source: "衛星雷達高度計數據 (NASA / NOAA)"
  },
  {
    id: "ice",
    name: "北極夏季最小海冰面積勢力",
    subName: "Arctic Summer Sea Ice Extent",
    currentValue: 4.1,
    unit: "M km²",
    yearlyChange: "-12.2% / 十年",
    riskStatus: "high",
    description: "每年九月份北極海冰覆蓋的最小面積。由於「極地放大效應」，北極暖化速度是全球平均的三倍，冰面融化進一步降低了地球反射率 (反照率)。",
    source: "美國國家冰雪數據中心 (NSIDC)"
  }
];

export const HISTORICAL_CLIMATE_DATA: ChartDataPoint[] = [
  { year: 1970, co2: 325.68, tempAnomaly: 0.05, seaLevel: 0.0, iceExtent: 8.4, emissions: 14.9 },
  { year: 1975, co2: 331.21, tempAnomaly: 0.12, seaLevel: 5.2, iceExtent: 7.9, emissions: 17.5 },
  { year: 1980, co2: 338.74, tempAnomaly: 0.28, seaLevel: 11.4, iceExtent: 7.8, emissions: 19.4 },
  { year: 1985, co2: 346.12, tempAnomaly: 0.20, seaLevel: 18.2, iceExtent: 6.9, emissions: 20.1 },
  { year: 1990, co2: 354.34, tempAnomaly: 0.44, seaLevel: 25.8, iceExtent: 6.5, emissions: 22.2 },
  { year: 1995, co2: 360.83, tempAnomaly: 0.46, seaLevel: 32.5, iceExtent: 6.1, emissions: 23.4 },
  { year: 1998, co2: 366.80, tempAnomaly: 0.52, seaLevel: 40.2, iceExtent: 6.4, emissions: 24.8 },
  { year: 2000, co2: 369.52, tempAnomaly: 0.62, seaLevel: 44.8, iceExtent: 6.3, emissions: 25.4 },
  { year: 2005, co2: 379.80, tempAnomaly: 0.68, seaLevel: 59.2, iceExtent: 5.5, emissions: 30.6 },
  { year: 2010, co2: 389.90, tempAnomaly: 0.72, seaLevel: 72.1, iceExtent: 4.9, emissions: 33.1 },
  { year: 2012, co2: 394.10, tempAnomaly: 0.65, seaLevel: 76.5, iceExtent: 3.6, emissions: 34.5 },
  { year: 2015, co2: 400.83, tempAnomaly: 0.90, seaLevel: 84.4, iceExtent: 4.4, emissions: 35.5 },
  { year: 2020, co2: 414.24, tempAnomaly: 1.02, seaLevel: 98.4, iceExtent: 3.9, emissions: 34.8 },
  { year: 2021, co2: 416.45, tempAnomaly: 1.15, seaLevel: 100.8, iceExtent: 4.0, emissions: 36.3 },
  { year: 2024, co2: 421.90, tempAnomaly: 1.25, seaLevel: 106.1, iceExtent: 4.2, emissions: 37.4 },
  { year: 2025, co2: 424.30, tempAnomaly: 1.28, seaLevel: 108.5, iceExtent: 4.1, emissions: 37.8 }
];

export const EXTREME_EVENTS: ExtremeWeatherEvent[] = [
  {
    year: 1998,
    title: "超級聖嬰與全球珊瑚白化",
    emoji: "🪸",
    location: "全球熱帶海域",
    tempAnomalyVal: "+0.52°C",
    description: "受史詩級聖嬰現象影響，1998年全球平均氣溫大爆發，使海水溫度飆升，引發歷史上首次全球性大規模珊瑚白化，導致近16%珊瑚礁死亡。",
    impact: "全球海洋生態遭逢毀滅性打擊"
  },
  {
    year: 2005,
    title: "卡崔娜強烈颶風襲打",
    emoji: "🌀",
    location: "美國紐奧良及墨西哥灣",
    tempAnomalyVal: "+0.68°C",
    description: "墨西哥灣溫熱的海水泥漿般加溫，劇烈助長了卡崔娜颶風強度。多處海堤徹底潰決、淹水深達數公尺，引發美國史上極慘重氣候水患。",
    impact: "紐奧良淹水80%、1,836死、1,250億美元巨災損失"
  },
  {
    year: 2012,
    title: "格陵蘭表面冰蓋高達97%消融",
    emoji: "🏔️",
    location: "北極格陵蘭冰源",
    tempAnomalyVal: "+0.65°C",
    description: "極圈高溫異常，觀測發現格陵蘭地表高冰原在7月夏季有高達九成七面積在同時融解，加速海水熱量吸收及海面直接抬升。",
    impact: "一季消融高達2,500億噸高山陸冰，加速全球海漲"
  },
  {
    year: 2015,
    title: "創世紀最強聖嬰與全球陸地大乾旱",
    emoji: "🏜️",
    location: "東南亞、撒哈拉以南非洲",
    tempAnomalyVal: "+0.90°C",
    description: "超級聖嬰使太平洋水溫異常暴增，致東南亞泥炭森林因乾旱爆發大山火，非洲多個糧倉旱死，全球氣象模式徹底崩解。",
    impact: "超2,000萬人挨荒、巨額熱帶林木碳溢出"
  },
  {
    year: 2020,
    title: "澳洲「黑色夏季」野火與北極圈超常熱浪",
    emoji: "🔥",
    location: "澳洲東南部及俄羅斯西伯利亞",
    tempAnomalyVal: "+1.02°C",
    description: "澳洲野火吞滅千萬公頃森林，同時間西伯利亞觀測到創紀錄38°C熱浪。永凍土（Permafrost）融解，開始釋放大批封存的溫泥與甲烷。",
    impact: "數十億隻原生生物死傷、永凍土封閉碳釋放"
  },
  {
    year: 2021,
    title: "北美「熱能圓頂」熱浪與西歐世紀洪澇",
    emoji: "🌡️",
    location: "加拿大卑詩省 & 德國、比利時等國",
    tempAnomalyVal: "+1.15°C",
    description: "絕無僅有的「熱能圓頂」重擊加美邊境，創下 49.6°C 超限溫差；而西歐則在同年夏季遭受世紀大暴雨，洪水夾泥沙席捲整個城鎮。",
    impact: "加美熱浪致死數百人、西歐山洪爆發致240傷亡"
  },
  {
    year: 2024,
    title: "全球最熱年紀錄與東南亞全面熱浪",
    emoji: "🥵",
    location: "全亞熱帶城市及全球海洋",
    tempAnomalyVal: "+1.25°C",
    description: "2024年均溫狂破新高，氣候極端熱浪吞食全亞，體感溫度直逼50°C瓶頸。全球海洋溫度連續近一年打破歷史同期最高水平線。",
    impact: "多城全面停課、農業生產及海洋漁業遭受重塑衝擊"
  }
];

export const SCENARIO_PROJECTIONS: ScenarioProjectionPoint[] = [
  { year: 2025, co2Low: 424, co2Med: 424, co2High: 424, tempLow: 1.28, tempMed: 1.28, tempHigh: 1.28 },
  { year: 2030, co2Low: 432, co2Med: 438, co2High: 442, tempLow: 1.38, tempMed: 1.42, tempHigh: 1.48 },
  { year: 2040, co2Low: 438, co2Med: 456, co2High: 478, tempLow: 1.48, tempMed: 1.61, tempHigh: 1.82 },
  { year: 2050, co2Low: 435, co2Med: 478, co2High: 524, tempLow: 1.50, tempMed: 1.80, tempHigh: 2.15 },
  { year: 2060, co2Low: 428, co2Med: 498, co2High: 585, tempLow: 1.48, tempMed: 1.95, tempHigh: 2.58 },
  { year: 2070, co2Low: 420, co2Med: 518, co2High: 658, tempLow: 1.45, tempMed: 2.08, tempHigh: 3.02 },
  { year: 2080, co2Low: 410, co2Med: 535, co2High: 735, tempLow: 1.42, tempMed: 2.18, tempHigh: 3.48 },
  { year: 2090, co2Low: 405, co2Med: 546, co2High: 815, tempLow: 1.39, tempMed: 2.25, tempHigh: 3.96 },
  { year: 2100, co2Low: 398, co2Med: 550, co2High: 900, tempLow: 1.35, tempMed: 2.30, tempHigh: 4.45 }
];

export const getPythonStreamlitCode = (
  theme: "dark" | "light" | "dynamic",
  chartLibrary: "plotly" | "matplotlib" | "altair",
  includePrediction: boolean,
  metricsSelected: string[]
): string => {
  const isDark = theme === "dark" || theme === "dynamic";
  const bgCode = isDark ? `"#0f172a"` : `"#ffffff"`;
  const textCode = isDark ? `"#f8fafc"` : `"#0f172a"`;
  const plotTheme = isDark ? `"plotly_dark"` : `"plotly"`;

  return `import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px

# 1. 頁面標題與佈局配置
st.set_page_config(
    page_title="全球溫室效應即時監測儀表板",
    page_icon="🌍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 套用深淺色主題微調
st.markdown("""
<style>
    .metric-card {
        padding: 1.5rem;
        border-radius: 0.75rem;
        background-color: ${isDark ? "#1e293b" : "#f1f5f9"};
        border: 1px solid ${isDark ? "#334155" : "#e2e8f0"};
        margin-bottom: 1rem;
    }
</style>
""", unsafe_allow_html=True)

# 2. 歷史與預測數據載入
# 數據來源：科學觀測研究機構
years_hist = np.array([1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2024, 2025])
co2_hist = np.array([325.68, 331.21, 338.74, 346.12, 354.34, 360.83, 369.52, 379.80, 389.90, 400.83, 414.24, 421.90, 424.30])
temp_hist = np.array([0.05, 0.12, 0.28, 0.20, 0.44, 0.46, 0.62, 0.68, 0.72, 0.90, 1.02, 1.25, 1.28])
sea_hist = np.array([0.0, 5.2, 11.4, 18.2, 25.8, 32.5, 44.8, 59.2, 72.1, 84.4, 98.4, 106.1, 108.5])
ice_hist = np.array([8.4, 7.9, 7.8, 6.9, 6.5, 6.1, 6.3, 5.5, 4.9, 4.4, 3.9, 4.2, 4.1])

df_historical = pd.DataFrame({
    'Year': years_hist,
    'CO2': co2_hist,
    'TempAnomaly': temp_hist,
    'SeaLevel': sea_hist,
    'IceExtent': ice_hist
})

# 3. 側邊欄互動控制項
st.sidebar.title("🛠️ 政策模擬與控制盤")
st.sidebar.info("調整以下低碳轉型政策指標，即時估算至 2100 年的溫室效應發展趨勢。")

co2_policy = st.sidebar.slider(
    "1. 2050 碳排放減量目標 (%)", 
    min_value=-20, 
    max_value=120, 
    value=80, 
    step=10,
    help="以現行排放量為基準，至2050年減少的化石燃料碳排放佔比。100% 代表全球淨零。"
)

green_energy = st.sidebar.slider(
    "2. 清潔能源轉型速率 (%)", 
    min_value=10, 
    max_value=100, 
    value=60, 
    step=5,
    help="非化石能源在全部能源供給結構中的目標佔比。"
)

reforest = st.sidebar.slider(
    "3. 全球森林復育規模 (十億棵樹/年)", 
    min_value=0.0, 
    max_value=10.0, 
    value=2.5, 
    step=0.5,
    help="每年成功種植並存活的植樹規模，能有效發揮吸碳效應。"
)

carbon_tax = st.sidebar.slider(
    "4. 全球平均碳稅 ($ / 噸 CO₂)", 
    min_value=0, 
    max_value=250, 
    value=45, 
    step=5,
    help="對工業製造與交通能源課徵的碳價格，愈高將使化石燃料退場愈快。"
)

# 4. 根據控制參數進行預測模型計算 (簡化物理模型)
years_proj = np.array([2025, 2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100])

# 理論基礎：氣候敏感度受碳減排、綠能、森林及碳稅加權影響
reduction_score = (co2_policy * 0.45) + ((green_energy - 20) * 0.25) + (reforest * 2.5) + (carbon_tax / 1.5)
# 換算為 2100 年升溫與 CO2 抑制效能
policy_efficiency = min(max(reduction_score / 100.0, 0.0), 1.0) 

# 計算預測點
co2_2100_predicted = 900 - (policy_efficiency * 502) # SSP5-8.5 (900) vs SSP1-1.9 (398)
temp_2100_predicted = 4.45 - (policy_efficiency * 3.10) # 4.45°C vs 1.35°C
sea_2100_predicted = 650 - (policy_efficiency * 410)

co2_proj = np.zeros(len(years_proj))
temp_proj = np.zeros(len(years_proj))
sea_proj = np.zeros(len(years_proj))

for i, y in enumerate(years_proj):
    factor = (y - 2025) / 75.0
    co2_proj[i] = 424 + (co2_2100_predicted - 424) * factor
    # 稍微做非線性模擬
    temp_proj[i] = 1.28 + (temp_2100_predicted - 1.28) * (factor ** 1.2)
    sea_proj[i] = 108.5 + (sea_2100_predicted - 108.5) * (factor ** 1.3)

df_projected = pd.DataFrame({
    'Year': years_proj,
    'CO2': co2_proj,
    'TempAnomaly': temp_proj,
    'SeaLevel': sea_proj
})

# 5. 主儀表板區域
st.title("🌍 全球溫室效應即時監測儀表板")
st.markdown("這個 Python Streamlit 儀表板呈現了關鍵溫室效應指標，並整合基於多政策權重的氣候敏感物理模擬。")

# 6. 即時現況 Metrics
st.subheader("📊 即時氣候核心指標 (觀測數據)")
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.metric("大氣 CO₂ 濃度", f"{df_historical['CO2'].iloc[-1]:.1f} ppm", "+2.4 ppm/年")
    st.caption("工業革命前：280 ppm | 源自 NOAA觀測")
    st.markdown('</div>', unsafe_allow_html=True)

with col2:
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.metric("全球地表升溫異常值", f"+{df_historical['TempAnomaly'].iloc[-1]:.2f} °C", "+0.02 °C/年")
    st.caption("臨界警戒線：1.5 °C | 源自 NASA GISS")
    st.markdown('</div>', unsafe_allow_html=True)

with col3:
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.metric("海平面累計上升量", f"{df_historical['SeaLevel'].iloc[-1]:.1f} mm", "+3.4 mm/年")
    st.caption("自 1993 至今起算 | 源自衛星高度計")
    st.markdown('</div>', unsafe_allow_html=True)

with col4:
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.metric("北極精簡夏季海冰", f"{df_historical['IceExtent'].iloc[-1]:.1f} M km²", "-12.2% /十年")
    st.caption("九月最小覆蓋面積 | 源自 NSIDC")
    st.markdown('</div>', unsafe_allow_html=True)

# 7. 可視化圖表
st.subheader("📈 歷史紀錄與政策投影分析")

# 讓使用者選擇想看的圖表
tab1, tab2 = st.tabs(["🔥 溫室效應與全球升溫關係", "🌊 海平面上升歷史與預測"])

with tab1:
    fig_temp = go.Figure()
    # 歷史升溫
    fig_temp.add_trace(go.Scatter(
        x=df_historical['Year'], 
        y=df_historical['TempAnomaly'],
        mode='lines+markers', 
        name='歷史觀測升溫 (°C)',
        line=dict(color='#ef4444', width=3),
        marker=dict(size=6)
    ))
    
    # 預測升溫 (若勾選或符合條件)
    if ${includePrediction}:
        fig_temp.add_trace(go.Scatter(
            x=df_projected['Year'], 
            y=df_projected['TempAnomaly'],
            mode='lines', 
            name='政策模擬升溫目標 (°C)',
            line=dict(color='#f59e0b', width=3, dash='dash')
        ))
        
    fig_temp.update_layout(
        title="1970 - 2100年 全球平均地表升溫趨勢",
        xaxis_title="年份",
        yaxis_title="升溫幅度 (°C)",
        template=${plotTheme},
        paper_bgcolor=${bgCode},
        plot_bgcolor=${bgCode},
        font=dict(color=${textCode})
    )
    st.plotly_chart(fig_temp, use_container_width=True)

with tab2:
    fig_sea = go.Figure()
    fig_sea.add_trace(go.Scatter(
        x=df_historical['Year'], 
        y=df_historical['SeaLevel'],
        mode='lines+markers', 
        name='歷史海平面高度 (mm)',
        line=dict(color='#06b6d4', width=3)
    ))
    
    if ${includePrediction}:
        fig_sea.add_trace(go.Scatter(
            x=df_projected['Year'], 
            y=df_projected['SeaLevel'],
            mode='lines', 
            name='模擬海平面路徑 (mm)',
            line=dict(color='#3b82f6', width=3, dash='dash')
        ))
        
    fig_sea.update_layout(
        title="1970 - 2100年 全球海平面高度上升趨勢",
        xaxis_title="年份",
        yaxis_title="累計上升量 (mm)",
        template=${plotTheme},
        paper_bgcolor=${bgCode},
        plot_bgcolor=${bgCode},
        font=dict(color=${textCode})
    )
    st.plotly_chart(fig_sea, use_container_width=True)

# 8. 政策結果彙報
st.subheader("🔔 氣候模擬情境成效評估")
score_pct = int(policy_efficiency * 100)

col_a, col_b = st.columns([1, 2])
with col_a:
    st.metric("低碳转型成功指數 (CS Index)", f"{score_pct}%")
    if score_pct > 80:
        st.success("🎉 高度成功！全球溫升可順利壓制在 +1.5°C 世紀末的安全防護網以內。")
    elif score_pct > 50:
        st.warning("⚠️ 警示成效。預期 2100 溫升將落在 +2.1°C ~ +2.3°C，氣候極端風險偏高。")
    else:
        st.error("🚨 嚴重失控！依照此政策，本世紀末升溫將加速突破 +3.5°C，海平面將上升超過 50 公分。")

with col_b:
    st.markdown(f"""
    **政策結論摘要（綜合分析與建議）：**
    
    透過您所調整的政策參數組合，模型估計本世紀末的 **CO₂ 均衡濃度將趨近於 {co2_2100_predicted:.1f} ppm**。
    
    1. **碳稅推動**：此碳稅設定 (\${carbon_tax} USD/噸) 可促使化石能源在製造業中平均以 2.5倍的速度汰換。
    2. **清潔能源**：清潔能源占比達 {green_energy}%，預估可使本世紀中葉以前減少累計高達 450 GtCO₂ 的額外碳排壓力。
    3. **復育森林**：每年 {reforest} 十億棵樹的規模，可自 2035 年起為地球提供每年 ~{reforest * 1.25:.1f} GtCO₂ 的陸系碳匯。
    
    *備註：以上計算基於 IPCC 第六次評估報告 (AR6) 簡化敏感度關聯，數據為模擬演示用途。*
    """)

# 9. 顯示數據表
if st.checkbox("🔍 檢視歷史原始觀測數據與預測表"):
    col_d1, col_d2 = st.columns(2)
    with col_d1:
        st.write("🍂 歷史真實觀測數據(1970-2025)", df_historical)
    with col_d2:
        st.write("🔮 下一階段政策情境預測數值(2025-2100)", df_projected)
`;
};

export const CLIMATE_WEATHER_STATIONS: WeatherStation[] = [
  {
    id: "taipei",
    name: "台北 (副熱帶盆地熱島)",
    englishName: "Taipei, Taiwan",
    emoji: "🏙️",
    latitude: 25.03,
    longitude: 121.56,
    role: "副熱帶季風盆地城市。因地形盆地效應與密集的都市鋼筋水泥結構，致都市熱島效應極具威脅，亦受梅雨及颱風短延時強降雨、午後特大熱對流危害暴增之複合型威脅。",
    histAvgTemp: 25.0,
    colorClass: "from-indigo-500 to-purple-600",
    threatLevel: "中等"
  },
  {
    id: "tokyo",
    name: "東京 (溫帶季風超大都市)",
    englishName: "Tokyo, Japan",
    emoji: "🗼",
    latitude: 35.67,
    longitude: 139.65,
    role: "世界上人口最密集的大都市圈之一。高層大樓與柏油蓄熱造成嚴重的都市微氣候化；近年極端熱浪導致的「超熱夜」與梅雨季異常出梅現象激增。",
    histAvgTemp: 19.5,
    colorClass: "from-blue-500 to-indigo-600",
    threatLevel: "中等"
  },
  {
    id: "jakarta",
    name: "雅加達 (熱帶雨林下沉海岸)",
    englishName: "Jakarta, Indonesia",
    emoji: "🇮🇩",
    latitude: -6.20,
    longitude: 106.81,
    role: "熱帶季風季雨林區。同時面臨嚴重的地下水過度抽取引致「土地下陷」及「海平面上升」，沿海低窪城區頻繁遭海水倒灌吞噬，急需建立遷都計劃避災。",
    histAvgTemp: 28.0,
    colorClass: "from-cyan-400 to-teal-500",
    threatLevel: "極高"
  },
  {
    id: "cairo",
    name: "開羅 (極端乾燥沙漠熱浪)",
    englishName: "Cairo, Egypt",
    emoji: "🐪",
    latitude: 30.04,
    longitude: 31.23,
    role: "典型的熱帶沙漠氣候（亞熱帶乾旱）。高密度的都市水泥在撒哈拉熱風肆虐下，極端高溫動輒突破 45°C，尼羅河供水負荷極限，引發長久的水資源、糧食危機。",
    histAvgTemp: 26.0,
    colorClass: "from-amber-500 to-orange-650",
    threatLevel: "高"
  },
  {
    id: "london",
    name: "倫敦 (溫帶海洋性氣候)",
    englishName: "London, United Kingdom",
    emoji: "🎡",
    latitude: 51.50,
    longitude: -0.12,
    role: "溫帶海洋性氣候。深受北大西洋暖流調節，但若大西洋經向翻轉環流 (AMOC) 崩潰，可能引發全歐洲異常酷寒與風暴；2022年首度錄得創紀錄的40°C空前酷暑高溫。",
    histAvgTemp: 13.0,
    colorClass: "from-sky-450 to-blue-500",
    threatLevel: "急遽變化中"
  },
  {
    id: "newyork",
    name: "紐約 (溫帶陸性海岸風暴)",
    englishName: "New York City, USA",
    emoji: "🗽",
    latitude: 40.71,
    longitude: -74.00,
    role: "溫帶大陸性濕潤與沿海交界。因紐約港高密度填海與複雜低窪地鐵系統，近年遭受暴雨引發之「山洪暴發」及颶風暴雨潮（如珊迪、艾達颶風）重創海水灌注威脅。",
    histAvgTemp: 17.5,
    colorClass: "from-slate-500 to-slate-700",
    threatLevel: "高"
  },
  {
    id: "sydney",
    name: "雪梨 (南半球極端野火溫帶)",
    englishName: "Sydney, Australia",
    emoji: "🦘",
    latitude: -33.86,
    longitude: 151.20,
    role: "副熱帶季風濕潤/地中海溫帶過渡帶。深受聖嬰與印度洋偶極響應，近十年澳洲「黑色夏季」使森林大火頻率、劇烈暴風雨、海洋珊瑚與海岸線侵蝕升至歷史巔峰值。",
    histAvgTemp: 16.5,
    colorClass: "from-rose-500 to-pink-600",
    threatLevel: "急遽變化中"
  }
];

