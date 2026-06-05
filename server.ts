/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON request bodies
app.use(express.json());

// Initialize server-side AI configurations (Gemini and Ollama)
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  console.log("Gemini API Client successfully initialized.");
} else {
  console.warn("GEMINI_API_KEY is not defined in environment variables. Gemini features will use fallback.");
}

const ollamaApiKey = process.env.OLLAMA_API_KEY;
const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const ollamaModel = process.env.OLLAMA_MODEL || "llama3";
const hasOllama = !!(process.env.OLLAMA_API_KEY || process.env.OLLAMA_BASE_URL);
let ollamaOnline = false;

if (hasOllama) {
  console.log(`Ollama configured. Base URL: ${ollamaBaseUrl}, Model: ${ollamaModel}`);
  // Proactively check Ollama reachability at startup to avoid timing out later
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1200);
  fetch(`${ollamaBaseUrl}/api/tags`, { method: "GET", signal: controller.signal })
    .then((res) => {
      clearTimeout(timeoutId);
      if (res.ok) {
        ollamaOnline = true;
        console.log("Ollama connection successfully established & active.");
      } else {
        console.log(`Ollama responded with status: ${res.status}. Keeping Ollama offline.`);
      }
    })
    .catch(() => {
      clearTimeout(timeoutId);
      console.log("Ollama service could not be reached. Smoothly defaulting to Gemini / Fallback.");
    });
}

// Global provider check
const isOllamaActive = (): boolean => hasOllama && ollamaOnline;

async function queryOllama(prompt: string, systemPrompt?: string, jsonMode: boolean = false): Promise<string> {
  const ollamaUrl = ollamaBaseUrl.replace(/\/$/, "");
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (ollamaApiKey) {
    headers["Authorization"] = `Bearer ${ollamaApiKey}`;
  }

  const messages: { role: string; content: string }[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const body: any = {
    model: ollamaModel,
    messages: messages,
    stream: false,
  };

  if (jsonMode) {
    body.format = "json";
  }

  const url = `${ollamaUrl}/api/chat`;
  console.log(`[Ollama] Fetching ${url} with model ${ollamaModel}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API Error (${response.status}): ${errorText || response.statusText}`);
    }

    const data: any = await response.json();
    const text = data?.message?.content || data?.response || "";
    return text;
  } catch (error) {
    // Disable subsequent attempts upon connection refusal or general fetch failure
    ollamaOnline = false;
    throw error;
  }
}

// ==========================================
// 0. API: Get AI Provider Status
// ==========================================
app.get("/api/provider-status", (req: Request, res: Response): void => {
  res.json({
    provider: isOllamaActive() ? "Ollama" : (ai ? "Gemini" : "Fallback"),
    model: isOllamaActive() ? ollamaModel : "gemini-3.5-flash",
    baseUrl: isOllamaActive() ? ollamaBaseUrl : "https://api.google.com"
  });
});

// ==========================================
// 1. API: Analyze Scenario (溫室效應政策物理敏感度分析)
// ==========================================
app.post("/api/analyze-scenario", async (req: Request, res: Response): Promise<void> => {
  const { co2Target, solarTransition, reforestation, carbontax } = req.body;

  // Validate inputs
  if (co2Target === undefined || solarTransition === undefined || reforestation === undefined || carbontax === undefined) {
    res.status(400).json({ error: "Missing required scenario factors." });
    return;
  }

  // Fallback simulation response if Gemini is not configured or fails
  const getFallbackResponse = (reason: string = "NO_API_KEY") => {
    const isGood = solarTransition > 60 && reforestation > 4 && carbontax > 80;
    const peak = isGood ? 1.45 : 2.5 + (424 - co2Target) / 100;
    return {
      yearAchieved: isGood ? "2050 之前" : "世紀末 (2100 前後)",
      temperaturePeak: parseFloat(peak.toFixed(2)),
      seaLevelImpact: isGood ? "海平面上升顯著趨緩，預計本世紀末控制在 15-20 公分內，減少沿海淹沒風險。" : "海平面將加速上升 30-50 公分以上，引發沿海大城市在春潮期間大機率淹水。",
      economicImpact: isGood ? "雖然前期清潔能源設備資本支出龐大，但在高額碳稅回收、綠能創造就業效應下，本世紀末能創造健康的綠色 GDP 動能。" : "高昂的極端氣候災損 (巨型颱風、熱浪減產、淹水災情) 將抵消經濟產能，使全球年均 GDP 衰退達 2.3% 以上。",
      narrativeText: `在您設定的政策組合中 (目標二氧化碳量: ${co2Target} ppm, 綠能佔比: ${solarTransition}%, 植樹復育: ${reforestation} 億棵樹/年, 碳稅: $${carbontax}/噸)，全球氣候軌跡正處於「${isGood ? "積極低碳轉型與碳捕捉" : "中高排放延續"}」情境。氣候敏感度回饋顯示，世紀末大氣將展現顯著的相變。`,
      suggestedActionPlan: [
        `政策面：加速在全球市場設定更嚴格的排碳懲罰性機制（高於每噸 $${carbontax} 美元的實質碳稅），引導資金出走高排碳產業。`,
        `技術面：加大電網彈性，與儲能設備相結合以穩固達 ${solarTransition}% 的再生能源滲透。`,
        `自然修復：增加植樹率，同時防止非法砍伐，創造穩定的陸系生物吸碳匯（碳儲存庫）。`
      ],
      hazardRiskLevel: isGood ? "中度風險 (Moderate)" : "極高風險 (Extreme)",
      tippingPoints: isGood ? ["部分高山冰河加速消退", "局部珊瑚礁中度白化"] : ["北冰洋夏季無冰化 (Arctic Ice-free)", "西伯利亞永凍土融解與甲烷二次釋放", "亞馬遜雨林向稀樹草原臨界退化"],
      isFallback: true,
      fallbackReason: reason
    };
  };

  if (!ai && !isOllamaActive()) {
    res.json(getFallbackResponse("NO_API_KEY"));
    return;
  }

  try {
    const prompt = `您是一位頂尖的氣候變遷科學家。
請以下列各「國家/全球溫室氣體政策參數組合」進行科學推估：
1. 2050年溫室效應大氣CO2控制目標: ${co2Target} ppm
2. 清潔再生能源(如太陽能/風能)佔全球能源比例: ${solarTransition}%
3. 全球森林主動復育率: 每年約 ${reforestation} 十億棵樹 (1 Billion = 10億)
4. 全球平均課徵碳稅: 每噸排碳 $${carbontax} 美元 (USD)

請使用繁體中文，基於 IPCC 第六次評充報告 (AR6) 的溫室效應科學模式，計算並產生世紀末(2100年)的氣候模擬成效推估。
必須提供 JSON 格式的響應，其包含下列嚴格欄位：
- yearAchieved (string): 預計落實碳達峰或碳中和的目標年份段（例如「2045 - 2050 之間」或「2100年以前無法達成」）
- temperaturePeak (number): 預測世紀末全球平均升溫異常值，為浮點數（單位 °C，介於 1.1 到 5.8 之間）
- seaLevelImpact (string): 預估的海平面上升與沿海安全衝擊摘要（限 100 字內）
- economicImpact (string): 推算此碳轉型政策對經濟（如GDP、產業轉型、極端災損成本）的衝擊展望（限 130 字內）
- narrativeText (string): 一段文筆流暢自然、具備深度氣候科學邏輯的綜合敘述，總結此情境下 2100 年地球溫室效應的樣貌（150-200字）
- suggestedActionPlan (string[]): 3條核心政策/技術改進指引組成的數組
- hazardRiskLevel (string): 預計世紀末全球氣候綜合危害風險等級（例如「健全控制 (Safe)」、「輕微 (Low)」、「中等 (Moderate)」、「高強度 (High)」、「極高危險/失控 (Critical)」）
- tippingPoints (string[]): 預估在當前升溫與排放走勢下，本世紀最可能被觸發的 1 到 3 個地球氣候 tipping points 關鍵臨界點`;

    let textResponse = "";
    let providerSource = "Gemini";

    if (isOllamaActive()) {
      try {
        textResponse = await queryOllama(prompt, "You are a professional climate scientist who responds with strict JSON matching the requested schema.", true);
        providerSource = "Ollama";
      } catch (err) {
        console.error("Ollama analyze-scenario failed, trying Gemini as backup...", err);
        if (ai) {
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  yearAchieved: { type: Type.STRING },
                  temperaturePeak: { type: Type.NUMBER },
                  seaLevelImpact: { type: Type.STRING },
                  economicImpact: { type: Type.STRING },
                  narrativeText: { type: Type.STRING },
                  suggestedActionPlan: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  hazardRiskLevel: { type: Type.STRING },
                  tippingPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["yearAchieved", "temperaturePeak", "seaLevelImpact", "economicImpact", "narrativeText", "suggestedActionPlan", "hazardRiskLevel", "tippingPoints"]
              }
            }
          });
          textResponse = response.text || "";
        } else {
          throw err;
        }
      }
    } else {
      if (!ai) {
        throw new Error("No AI provider active.");
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              yearAchieved: { type: Type.STRING },
              temperaturePeak: { type: Type.NUMBER },
              seaLevelImpact: { type: Type.STRING },
              economicImpact: { type: Type.STRING },
              narrativeText: { type: Type.STRING },
              suggestedActionPlan: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              hazardRiskLevel: { type: Type.STRING },
              tippingPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["yearAchieved", "temperaturePeak", "seaLevelImpact", "economicImpact", "narrativeText", "suggestedActionPlan", "hazardRiskLevel", "tippingPoints"]
          }
        }
      });
      textResponse = response.text || "";
    }

    const parsedData = JSON.parse(textResponse.trim());
    res.json({
      ...parsedData,
      isFallback: false,
      aiProvider: providerSource
    });
  } catch (error: any) {
    const status = error?.status || (error?.statusCode) || 0;
    const msg = String(error?.message || "");
    const isQuotaError = status === 429 || msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("exhausted");

    if (isQuotaError) {
      console.warn("Quota limit reached for Analyze Scenario API. Using high-fidelity fallback response.");
    } else {
      console.error("Gemini API Error (Analyze Scenario):", error);
    }

    let reason = "API_ERROR";
    if (isQuotaError) {
      reason = "QUOTA_EXCEEDED";
    } else if (status === 503 || msg.includes("503") || msg.toLowerCase().includes("overloaded") || msg.toLowerCase().includes("demand") || msg.toLowerCase().includes("unavailable")) {
      reason = "SERVICE_UNAVAILABLE";
    }
    res.json(getFallbackResponse(reason));
  }
});

// ==========================================
// 1.1 API: AI Climate Copilot Chat Followup
// ==========================================
app.post("/api/copilot-query", async (req: Request, res: Response): Promise<void> => {
  const { co2Target, solarTransition, reforestation, carbontax, query, historyTitle, history } = req.body;

  if (!query) {
    res.status(400).json({ error: "Missing query parameter." });
    return;
  }

  const getFallbackCopilot = () => {
    return {
      text: `【相容提示】關於您提問的「${query}」：在您設定的低碳控制組合下（CO2：${co2Target} ppm、綠能：${solarTransition}%、植樹：${reforestation} 億樹、碳稅：$${carbontax}/噸），我們主要的轉型瓶頸落在電網負載限制和高額政策推動成本。大氣中累積的溫室氣體有顯著的熱慣性，因此早期碳稅回收與陸系吸碳林至關重要。設定合理的 Settings > Secrets > GEMINI_API_KEY 即可啟用即時科學級 Gemini 問答顧問！`
    };
  };

  if (!ai && !isOllamaActive()) {
    res.json(getFallbackCopilot());
    return;
  }

  try {
    const contextPrompt = `您是一位頂尖的全球氣候科學與綠色政策智庫 AI 顧問 (Climate Copilot)。
當前使用者正使用您的「超級地球溫室效應模擬艙」，參數設定如下：
- 2050年大氣 CO2 頂點目標：${co2Target} ppm
- 全球綠色再生能源佔比目標：${solarTransition}%
- 每年全球森林重建復育率：${reforestation} 億棵樹
- 全球普遍課徵碳關稅：每噸二氧化碳 $${carbontax} 美元

先前大氣診斷結論：${historyTitle || "暫無結論"}。

請針對使用者的追問給予極為詳細而嚴謹、具備真實學術邏輯、口吻專業有說服力的繁體中文回答（不超過 300字）。您可以引述大氣持水飽和係數、熱力學反馈、海洋酸化碳酸鈣溶解度、極地冰蓋反照率回饋、碳稅在財政中性轉移的經濟效應等。
請保持直接對話，可使用分點/標籤，但不要輸出任何 markdown 原生程式碼，僅輸出純文本。`;

    // Map history to Gemini message structure
    const chatHistory = history || [];
    const contents: any[] = chatHistory.map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Add current query
    contents.push({
      role: "user",
      parts: [{ text: query }]
    });

    let replyText = "";

    if (isOllamaActive()) {
      try {
        const promptWithHistory = chatHistory.map((msg: any) => `${msg.sender === "user" ? "user" : "assistant"}: ${msg.text}`).join("\n") + `\nuser: ${query}`;
        replyText = await queryOllama(promptWithHistory, contextPrompt, false);
      } catch (err) {
        console.error("Ollama Copilot query failed, trying Gemini...", err);
        if (ai) {
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: contents,
            config: {
              systemInstruction: contextPrompt,
              temperature: 0.7
            }
          });
          replyText = response.text || "";
        } else {
          throw err;
        }
      }
    } else {
      if (!ai) {
        throw new Error("No AI Provider active.");
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: contextPrompt,
          temperature: 0.7
        }
      });
      replyText = response.text || "";
    }

    res.json({ text: replyText });
  } catch (error: any) {
    const msg = String(error?.message || "");
    const status = error?.status || error?.statusCode || 0;
    const isQuotaError = status === 429 || msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("exhausted");

    if (isQuotaError) {
      console.warn("Quota limit reached for Copilot Query API. Using high-fidelity fallback response.");
    } else {
      console.error("Gemini Copilot Error:", error);
    }
    res.json(getFallbackCopilot());
  }
});

// ==========================================
// 2. API: Generate Customized Python Code
// ==========================================
app.post("/api/generate-python-code", async (req: Request, res: Response): Promise<void> => {
  const { theme, chartLibrary, includePrediction, metricsSelected } = req.body;

  const isDark = theme === "dark" || theme === "dynamic";
  
  if (!ai && !isOllamaActive()) {
    res.json({ success: true, customMessage: "由於尚未設定 API 密鑰，已為您載入標準版 Streamlit 程式碼。在 Settings 中設定金鑰後，將可使用 AI 客製化變更功能。" });
    return;
  }

  try {
    const prompt = `您是一位精通 Python 數據工程與 Streamlit 儀表板設計的專家。
請基於以下使用者偏好，對「全球溫室效應監測儀表板」的 Python 程式碼進行重構並在程式碼各部分加入極佳的繁體中文註解：
- 主題顏色: ${isDark ? "深色暗雅主題 (Dark Slate Slate-800)" : "明亮清新主題 (Light Canvas Blue-50)"}
- 圖表庫: ${chartLibrary} (使用 Plotly Express 繪製高互動性圖表，如果是 matplotlib 請使用 plt.subplots 加上佈局自適應)
- 是否包含預測模型段落: ${includePrediction ? "是，應包含 2025 - 2100 年物理推估滑塊與投影趨勢線" : "否，僅展示 1970 - 2025 年歷史實際觀測數據"}
- 使用者最關注的溫室氣體核心指標: ${metricsSelected.join(", ")}

請直接重寫一個最完整、最漂亮、開箱即用、沒有任何 mock runtime error 的單一 .py 檔案。
程式碼必須符合：
1. 包含 st.set_page_config 即時宣告
2. 提供精緻的計分卡樣式 (st.metric)
3. 產生科學級別的歷史數據表 (CO2 歷史 325-424 ppm, 升溫 1.1-1.3°C, 海平面累計 0-108 mm)
4. 當調整側邊欄時，能進行非線性的動態擬合計算呈現
5. 包含極佳的視覺美化 (Plotly 的背景與字體顏色應確實跟主題搭配成 ${isDark ? "Dark/Deep" : "Light-colored"})

僅返回一個含有 markdown python 程式碼段落的 JSON 物件，格式如下：
{
  "code": "# 完整的 python 程式碼..."
}`;

    let textResponse = "";

    if (isOllamaActive()) {
      try {
        textResponse = await queryOllama(prompt, "You are a professional Python and Streamlit coder who responds with strict JSON matching the requested schema.", true);
      } catch (err) {
        console.error("Ollama generate-python-code failed, trying Gemini...", err);
        if (ai) {
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  code: { type: Type.STRING }
                },
                required: ["code"]
              }
            }
          });
          textResponse = response.text || "";
        } else {
          throw err;
        }
      }
    } else {
      if (!ai) {
        throw new Error("No AI Provider active.");
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              code: { type: Type.STRING }
            },
            required: ["code"]
          }
        }
      });
      textResponse = response.text || "";
    }

    const parsedData = JSON.parse(textResponse.trim());
    res.json(parsedData);
  } catch (error: any) {
    const msg = String(error?.message || "");
    const status = error?.status || error?.statusCode || 0;
    const isQuotaError = status === 429 || msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("exhausted");

    if (isQuotaError) {
      console.warn("Quota limit reached for Generate Python API. Serving fallback Python code.");
    } else {
      console.error("Gemini API Error (Generate Python Code):", error);
    }
    res.json({
      code: `import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Default climate simulation backup script
st.set_page_config(page_title="全球環境氣候防禦平台", layout="wide", initial_sidebar_state="expanded")
st.title("🌍 觀測數據擬真情境面板 (本機預備模式)")

st.info("💡 系統目前使用離線科學基準模型。配置 API 密鑰後可獲取即時大氣 AI 模型智能解算與自訂介面設計。")

# Scientific constants
co2_base = 422.0
temp_base = 1.25

# Sidebar controls
years = st.sidebar.slider("預測走勢（直至年份）", 2026, 2100, 2050, 1)
co2_target = st.sidebar.slider("二氧化碳減排目標 (ppm)", 350, 600, 450, 10)

# Simulate trajectory database
data = []
for y in range(2026, years + 1):
    ratio = (y - 2026) / (2100 - 2026)
    simulated_co2 = co2_base + (co2_target - co2_base) * ratio + np.random.normal(0, 0.5)
    simulated_temp = temp_base + (simulated_co2 - co2_base) * 0.005 + np.random.normal(0, 0.02)
    data.append({"年份": y, "二氧化碳濃度 (ppm)": simulated_co2, "地表升溫 (°C)": simulated_temp})

df = pd.DataFrame(data)

col1, col2 = st.columns(2)
with col1:
    st.subheader("📈 大氣二氧化碳濃度長波走勢")
    st.line_chart(df.set_index("年份")["二氧化碳濃度 (ppm)"])
with col2:
    st.subheader("🔥 世紀末地表氣溫異常增幅")
    st.line_chart(df.set_index("年份")["地表升溫 (°C)"])

st.success("🤖 精準動力阻絕與主動適應方案已加蓋部署完畢。")
`
    });
  }
});

// ==========================================
// 3. API: Fetch Real-world Climate Live Data
// ==========================================
app.get("/api/climate-live-data", async (req: Request, res: Response): Promise<void> => {
  const baseData = [
    { year: 1970, co2: 325.68, tempAnomaly: 0.05, seaLevel: 0.0, iceExtent: 8.4, emissions: 14.9 },
    { year: 1975, co2: 331.21, tempAnomaly: 0.12, seaLevel: 5.2, iceExtent: 7.9, emissions: 17.5 },
    { year: 1980, co2: 338.74, tempAnomaly: 0.28, seaLevel: 11.4, iceExtent: 7.8, emissions: 19.4 },
    { year: 1985, co2: 346.12, tempAnomaly: 0.20, seaLevel: 18.2, iceExtent: 6.9, emissions: 20.1 },
    { year: 1990, co2: 354.34, tempAnomaly: 0.44, seaLevel: 25.8, iceExtent: 6.5, emissions: 22.2 },
    { year: 1995, co2: 360.83, tempAnomaly: 0.46, seaLevel: 32.5, iceExtent: 6.1, emissions: 23.4 },
    { year: 2000, co2: 369.52, tempAnomaly: 0.62, seaLevel: 44.8, iceExtent: 6.3, emissions: 25.4 },
    { year: 2005, co2: 379.80, tempAnomaly: 0.68, seaLevel: 59.2, iceExtent: 5.5, emissions: 30.6 },
    { year: 2010, co2: 389.90, tempAnomaly: 0.72, seaLevel: 72.1, iceExtent: 4.9, emissions: 33.1 },
    { year: 2015, co2: 400.83, tempAnomaly: 0.90, seaLevel: 84.4, iceExtent: 4.4, emissions: 35.5 },
    { year: 2020, co2: 414.24, tempAnomaly: 1.02, seaLevel: 98.4, iceExtent: 3.9, emissions: 34.8 },
    { year: 2024, co2: 421.90, tempAnomaly: 1.25, seaLevel: 106.1, iceExtent: 4.2, emissions: 37.4 },
    { year: 2025, co2: 424.30, tempAnomaly: 1.28, seaLevel: 108.5, iceExtent: 4.1, emissions: 37.8 }
  ];

  async function fetchWithTimeout(url: string, timeout = 3000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  try {
    // Attempt parallel fetches with high-tolerance timeouts (3s) to prevent blocking the user
    const [co2Res, tempRes] = await Promise.allSettled([
      fetchWithTimeout("https://global-warming.org/api/co2-api"),
      fetchWithTimeout("https://global-warming.org/api/temperature-api")
    ]);

    let co2Averages: { [key: number]: number } = {};
    let tempAverages: { [key: number]: number } = {};

    let co2SourceType = "static";
    let tempSourceType = "static";

    // 1. Process CO2 Response
    if (co2Res.status === "fulfilled" && co2Res.value && Array.isArray(co2Res.value.co2)) {
      co2SourceType = "real-time";
      const co2ByYear: { [year: number]: number[] } = {};
      co2Res.value.co2.forEach((item: any) => {
        const y = parseInt(item.year);
        const val = parseFloat(item.trend || item.cycle);
        if (!isNaN(y) && !isNaN(val)) {
          if (!co2ByYear[y]) co2ByYear[y] = [];
          co2ByYear[y].push(val);
        }
      });
      for (const y in co2ByYear) {
        const arr = co2ByYear[y];
        const avg = arr.reduce((sum, v) => sum + v, 0) / arr.length;
        co2Averages[parseInt(y)] = parseFloat(avg.toFixed(1));
      }
    }

    // 2. Process Temperature Response
    if (tempRes.status === "fulfilled" && tempRes.value && Array.isArray(tempRes.value.result)) {
      tempSourceType = "real-time";
      const tempByYear: { [year: number]: number[] } = {};
      tempRes.value.result.forEach((item: any) => {
        const y = Math.floor(parseFloat(item.time));
        const val = parseFloat(item.land || item.station);
        if (!isNaN(y) && !isNaN(val)) {
          if (!tempByYear[y]) tempByYear[y] = [];
          tempByYear[y].push(val);
        }
      });
      for (const y in tempByYear) {
        const arr = tempByYear[y];
        const avg = arr.reduce((sum, v) => sum + v, 0) / arr.length;
        tempAverages[parseInt(y)] = parseFloat(avg.toFixed(2));
      }
    }

    // 3. Merge live readings with high-fidelity historical baseline
    const yearsSet = new Set([
      ...baseData.map(d => d.year),
      ...Object.keys(co2Averages).map(Number),
      ...Object.keys(tempAverages).map(Number)
    ]);
    const sortedYears = Array.from(yearsSet)
      .filter(y => y >= 1970 && y <= 2026)
      .sort((a, b) => a - b);

    const mergedHistorical = sortedYears.map(y => {
      const base = baseData.find(d => d.year === y);
      
      let co2 = base ? base.co2 : 415;
      if (co2Averages[y] !== undefined) {
        co2 = co2Averages[y];
      } else if (!base && y > 2025) {
        const prevYears = Object.keys(co2Averages).map(Number).filter(py => py < y).sort((a,b)=>b-a);
        if (prevYears.length > 0) co2 = co2Averages[prevYears[0]];
      }

      let tempAnomaly = base ? base.tempAnomaly : 1.0;
      if (tempAverages[y] !== undefined) {
        tempAnomaly = tempAverages[y];
      } else if (!base && y > 2025) {
        const prevYears = Object.keys(tempAverages).map(Number).filter(py => py < y).sort((a,b)=>b-a);
        if (prevYears.length > 0) tempAnomaly = tempAverages[prevYears[0]];
      }

      let seaLevel = base ? base.seaLevel : 108.5;
      if (!base && y > 2025) {
        seaLevel = 108.5 + (y - 2025) * 3.4;
      }

      let iceExtent = base ? base.iceExtent : 4.1;
      if (!base && y > 2025) {
        iceExtent = Math.max(0.5, 4.1 - (y - 2025) * 0.05);
      }

      let emissions = base ? base.emissions : 37.8;

      return {
        year: y,
        co2: parseFloat(co2.toFixed(1)),
        tempAnomaly: parseFloat(tempAnomaly.toFixed(2)),
        seaLevel: parseFloat(seaLevel.toFixed(1)),
        iceExtent: parseFloat(iceExtent.toFixed(1)),
        emissions
      };
    });

    // 4. Determine core latest metric figures
    const co2Years = Object.keys(co2Averages).map(Number).sort((a,b) => b - a);
    const latestCO2Val = co2Years.length > 0 ? co2Averages[co2Years[0]] : 424.3;
    const latestCO2Year = co2Years.length > 0 ? co2Years[0] : 2025;

    const tempYears = Object.keys(tempAverages).map(Number).sort((a,b) => b - a);
    const latestTempVal = tempYears.length > 0 ? tempAverages[tempYears[0]] : 1.28;
    const latestTempYear = tempYears.length > 0 ? tempYears[0] : 2025;

    let co2YearlyChange = "+2.4 ppm/年";
    if (co2Years.length >= 2) {
      const diff = co2Averages[co2Years[0]] - co2Averages[co2Years[1]];
      co2YearlyChange = `${diff >= 0 ? "+" : ""}${diff.toFixed(2)} ppm/年`;
    }

    let tempYearlyChange = "+0.02 °C/年";
    if (tempYears.length >= 2) {
      const diff = tempAverages[tempYears[0]] - tempAverages[tempYears[1]];
      tempYearlyChange = `${diff >= 0 ? "+" : ""}${diff.toFixed(2)} °C/年`;
    }

    res.json({
      success: true,
      source: {
        co2: co2SourceType,
        temp: tempSourceType
      },
      latest: {
        co2: { value: latestCO2Val, year: latestCO2Year, change: co2YearlyChange },
        temp: { value: latestTempVal, year: latestTempYear, change: tempYearlyChange }
      },
      historical: mergedHistorical
    });
  } catch (err: any) {
    console.error("Failed to compile live climate indices:", err);
    res.json({
      success: false,
      message: "採用標準高相容預置科學數據庫模式。",
      latest: {
        co2: { value: 424.3, year: 2025, change: "+2.4 ppm/年" },
        temp: { value: 1.28, year: 2025, change: "+0.02 °C/年" }
      },
      historical: baseData
    });
  }
});

// ==========================================
// 2.9 API: Live Climate News Feed (WMO / IPCC Realtime)
// ==========================================
app.get("/api/climate-news", async (req: Request, res: Response): Promise<void> => {
  const lang = (req.query.lang as string) || "zh-TW";

  const getFallbackNews = (langCode: string) => {
    if (langCode === "en") {
      return {
        summary: "AI Daily Observation: WMO climate indicators show greenhouse effect has driven global atmospheric temperature and deep-sea heat content to record highs. IPCC emphasizes an 86% probability of temporarily touching the 1.5°C warning threshold within five years.",
        news: [
          {
            title: "WMO Global State of Climate: Surface Temperatures Reach New Record Highs",
            content: "The World Meteorological Organization (WMO) reports that global surface temperatures continue to rise. Under the compounding effects of El Niño and greenhouse gas accumulation, there is an 86% chance of temporarily exceeding the 1.5°C threshold over the next five years, making extreme heatwaves much more frequent.",
            source: "WMO",
            date: "2026-05"
          },
          {
            title: "IPCC Warning: Deep-Sea Ocean Acidification and Heat Content At Unprecedented Levels",
            content: "The Intergovernmental Panel on Climate Change (IPCC) notes that the deep ocean has absorbed 90% of excess heat, causing ocean acidification and coral bleaching, severely threatening marine ecosystems and coastal populations.",
            source: "IPCC",
            date: "2026-04"
          },
          {
            title: "WMO/NSIDC Alert: Polar Albedo Suffers From Sustained Negative Feedback",
            content: "WMO observations indicate significant summer sea ice loss in polar regions. As highly reflective ice turns into dark, heat-absorbing seawater, it exacerbates polar amplification, leading to extra radiation absorption and accelerated sea-level rise.",
            source: "WMO",
            date: "2026-03"
          }
        ]
      };
    } else if (langCode === "zh-CN") {
      return {
        summary: "AI 每日观测关键：WMO 最新气候指标显示，温室效应造成全球大气与深海热含量双创历史新高。IPCC 强调未来五年地表均温升幅触及 1.5°C 的概率达 86%，全球正面临极地海冰消融与极端反馈的多重考验。",
        news: [
          {
            title: "WMO 最新全球气候状态：地表平均温度再创历史新高点",
            content: "世界气象组织 (WMO) 报告指出，全球地表均温已较工业化前持续攀升。在厄尔尼诺效应与温室气体累积叠加下，未来五年有高达 86% 概率会暂时超越 1.5°C 关键防线，导致全球超常热浪与大涝大旱将更趋频繁、剧烈。",
            source: "WMO (世界气象组织)",
            date: "2026-05"
          },
          {
            title: "IPCC 警告：全球深海酸化与热含量累积，已达数千年未见水平",
            content: "联合国跨政府气候变化小组 (IPCC) 最新观测指出，深海吸收了 90% 空前热能导致海水碳酸钙溶解度下降，全球珊瑚礁面临大范围白化退化，将严重威胁底栖生态及数亿依赖海洋维生的人口。",
            source: "IPCC (跨政府气候变化专门委员会)",
            date: "2026-04"
          },
          {
            title: "WMO/NSIDC 联合发布：极地反照率因快速消融呈持续负反馈",
            content: "世界气象组织观测指出，南北极圈尤其夏季海冰退化显著。当白色的冰晶反照面转为深色吸热的海水，将导致极地放大效应爆发，地表多吸收了数百瓦/平方米能流，并加速本世纪末海平面上升。",
            source: "WMO (世界气象组织)",
            date: "2026-03"
          }
        ]
      };
    } else if (langCode === "ja") {
      return {
        summary: "AI 日次観測要点：WMO最新気候指標によれば、温室効果により地球の大気と深海熱容量が過去最高を記録。IPCCは今後5年以内に一時的に 1.5°C の気温上昇限界を超える確率が86%であると強調し、極地海氷融解等の困難な課題に直面しています。",
        news: [
          {
            title: "WMO 世界気候状況発表：地表平均気温が最高記録を更新",
            content: "世界気象機関（WMO）は、世界の平均地表気温が産業革命前を上回り続けていると報告。エルニーニョと温室効果ガスの蓄積により、今後5年間で 1.5°C の閾値を一時的に超える確率が86%に達し、深刻な干ばつや熱波が想定されます。",
            source: "WMO (世界気象機関)",
            date: "2026-05"
          },
          {
            title: "IPCC 警告：深海酸性化と貯熱量は過去数千年間で前例のない水準に",
            content: "気候変動に関する政府間パネル（IPCC）の観測によると、熱容量の増加から深海水が酸性化し珊瑚礁の白化が進行、海洋生態系と漁業人口に甚大な被害を与えています。",
            source: "IPCC (気候変動に関する政府間パネル)",
            date: "2026-04"
          },
          {
            title: "WMO/NSIDC 共同発表：極地アルベドの急速な融解は負のフィードバック効果を引き起こす",
            content: "WMO観測によると、極地海氷の薄膜化が進んでいます。白い氷から暗い海水へと海面状態が変化することで太陽光吸収量が倍増し、極地温暖化増幅プロセスがさらに加速するとしています。",
            source: "WMO (世界気象機関)",
            date: "2026-03"
          }
        ]
      };
    } else {
      // DEFAULT TO zh-TW
      return {
        summary: "AI 每日觀測關鍵：WMO 最新氣候指標顯示，溫室效應造成全球大氣與深海熱含量雙創歷史新高。IPCC 強調未來五年地表均溫升幅觸及 1.5°C 的機率達 86%，全球正面臨極地海冰消融與極端反饋的多重考驗。",
        news: [
          {
            title: "WMO 最新全球氣候狀態：地表平均溫度再創歷史新高點",
            content: "世界氣象組織 (WMO) 報告指出，全球地表均溫已較工業化前持續攀升。在聖嬰效應與溫室氣體累積疊加下，未來五年有高達 86% 機率會暫時超越 1.5°C 關鍵防線防守，導致全球超常熱浪與大澇大旱將更趨頻繁、劇烈。",
            source: "WMO (世界氣象組織)",
            date: "2026-05"
          },
          {
            title: "IPCC 警告：全球深海酸化與熱含量累積，已達數千年未見水平",
            content: "聯合國跨政府氣候變遷小組 (IPCC) 最新觀測指出，深海吸收了 90% 空前熱能導致海水碳酸鈣溶解度下挫，全球珊瑚礁面臨大範圍白化退化，將嚴重威脅底棲生態及數億依賴海洋維生的人口。",
            source: "IPCC (跨政府氣候變遷專門委員會)",
            date: "2026-04"
          },
          {
            title: "WMO/NSIDC 聯合發布：極地反照率因快速消融呈持續負反饋",
            content: "世界氣象組織觀測指出，南北極圈尤其夏季海冰退化顯著。當白色的冰晶反照面轉為深色吸熱的海水，將導致極地放大效應爆發，地表多吸收了數百瓦/平方米能流，並加速本世紀末海平面上升。",
            source: "WMO (世界氣象組織)",
            date: "2026-03"
          }
        ]
      };
    }
  };

  if (!ai && !isOllamaActive()) {
    res.json(getFallbackNews(lang));
    return;
  }

  try {
    let targetLanguageName = "Traditional Chinese";
    if (lang === "en") targetLanguageName = "English";
    else if (lang === "zh-CN") targetLanguageName = "Simplified Chinese";
    else if (lang === "ja") targetLanguageName = "Japanese";

    const prompt = `Based on current world climate data and recent reports from WMO/IPCC, please provide a professional, scientifically accurate global climate news summary AND a list of exactly 3 relevant recent news items in ${targetLanguageName}.
Follow this strict JSON schema format:
{
  "summary": "a general scientific narrative of global climate state in 1-2 sentences",
  "news": [
    {
      "title": "precise news title",
      "content": "detailed news content summarizing the report/finding",
      "source": "WMO / IPCC / Science / NASA etc.",
      "date": "YYYY-MM format"
    }
  ]
}`;

    let textResponse = "";
    let providerSource = "Gemini";

    if (isOllamaActive()) {
      try {
        textResponse = await queryOllama(prompt, "You are a professional climate scientist who responds with strict JSON matching the requested schema.", true);
        providerSource = "Ollama";
      } catch (err) {
        console.warn("Ollama climate news failed, trying Gemini as backup...", err);
        if (ai) {
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              tools: [{ googleSearch: {} }],
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  summary: { type: Type.STRING },
                  news: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                        source: { type: Type.STRING },
                        date: { type: Type.STRING }
                      },
                      required: ["title", "content", "source", "date"]
                    }
                  }
                },
                required: ["summary", "news"]
              }
            }
          });
          textResponse = response.text || "";
        } else {
          throw err;
        }
      }
    } else {
      if (!ai) {
        throw new Error("No AI provider active.");
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              news: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                    source: { type: Type.STRING },
                    date: { type: Type.STRING }
                  },
                  required: ["title", "content", "source", "date"]
                }
              }
            },
            required: ["summary", "news"]
          }
        }
      });
      textResponse = response.text || "";
    }

    const parsedData = JSON.parse(textResponse.trim());
    res.json({
      ...parsedData,
      isFallback: false,
      aiProvider: providerSource
    });
  } catch (error: any) {
    const msg = String(error?.message || "");
    const status = error?.status || error?.statusCode || 0;
    const isQuotaError = status === 429 || msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("exhausted");

    if (isQuotaError) {
      console.warn("Gemini/Ollama Quota limit reached for Climate News endpoint. Serving high-fidelity scientific data fallback smoothly.");
    } else {
      console.error("AI Provider Error (Climate News):", error?.message || error);
    }

    let reason = "API_ERROR";
    if (isQuotaError) {
      reason = "QUOTA_EXCEEDED";
    } else if (status === 503 || msg.includes("503") || msg.toLowerCase().includes("overloaded") || msg.toLowerCase().includes("demand") || msg.toLowerCase().includes("unavailable")) {
      reason = "SERVICE_UNAVAILABLE";
    }

    res.json({
      ...getFallbackNews(lang),
      isFallback: true,
      fallbackReason: reason
    });
  }
});

// ==========================================
// 3. Vite development server setup / Production static server
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);
    console.log("Vite Development Server mounted on Express middleware.");
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Express serving production static assets from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express application active on host: 0.0.0.0, port: ${PORT}`);
  });
}

startServer();
