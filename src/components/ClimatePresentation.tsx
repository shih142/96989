/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import PptxGenJS from "pptxgenjs";
import {
  Globe,
  Sliders,
  TrendingUp,
  AlertTriangle,
  Flame,
  Waves,
  Trees,
  Coins,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  FileText,
  Info,
  Compass
} from "lucide-react";

interface ClimatePresentationProps {
  co2TargetGoal: number;
  solarTransition: number;
  reforestationRate: number;
  carbonTax: number;
  co2In2100: number;
  tempIn2100: number;
  seaIn2100: number;
  transitionIndex: number;
}

export default function ClimatePresentation({
  co2TargetGoal,
  solarTransition,
  reforestationRate,
  carbonTax,
  co2In2100,
  tempIn2100,
  seaIn2100,
  transitionIndex
}: ClimatePresentationProps) {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [lang, setLang] = useState<"zh-TW" | "en">("zh-TW");
  const [isAutoplay, setIsAutoplay] = useState<boolean>(false);
  const [autoplayProgress, setAutoplayProgress] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [signedPact, setSignedPact] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>("");

  const totalPages = 20;
  const autoplayIntervalMs = 7000; // 7 seconds per slide
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Score calculations matching general dashboard
  const policyScore = Math.min(
    100,
    Math.max(
      0,
      co2TargetGoal * 0.4 +
        (solarTransition - 10) * 0.25 +
        reforestationRate * 2.5 +
        carbonTax / 1.5
    )
  );

  const getEnvRating = (score: number, currentLang: "zh-TW" | "en") => {
    if (score >= 75) {
      return currentLang === "zh-TW" ? "積極共生生態圈 (Optimal Harmony)" : "Active Ecological Harmony";
    } else if (score >= 50) {
      return currentLang === "zh-TW" ? "漸進轉型調和期 (Moderate Transition)" : "Progressive Policy Transition";
    } else {
      return currentLang === "zh-TW" ? "氣候危機引燃區 (Crisis Inevitable)" : "Climate Crisis Ignition Risk";
    }
  };

  // Handle Autoplay timer
  useEffect(() => {
    if (isAutoplay) {
      setAutoplayProgress(0);
      const step = 100 / (autoplayIntervalMs / 100); // 100 steps
      
      progressIntervalRef.current = setInterval(() => {
        setAutoplayProgress((prev) => {
          if (prev >= 100) {
            setCurrentPage((p) => (p + 1) % totalPages);
            return 0;
          }
          return prev + step;
        });
      }, 100);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setAutoplayProgress(0);
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isAutoplay, currentPage]);

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Generate complete PDF/Markdown script to copy
  const getRawMarkdownReport = () => {
    return `# 2100 全球與都市氣候投影分析簡報 / Climate Policy Slides Report
Generated on: 2026-06-03 UTC

## 【核心政策參數指標彙整 | Global Active Policy Setup】
- 2050年全球減碳目標 (2050 Carbon Reduction Target): ${co2TargetGoal}%
- 綠能與再生能源轉型率 (Renewable Energy Transition): ${solarTransition}%
- 每年植樹森林再造速度 (Global Reforestation Speed): ${reforestationRate} Billion/yr
- 碳定價 / 全球碳稅 (Carbon Pricing Lever): $${carbonTax} USD/ton
- 系統評定政策整合得分 (Synthesis Policy Score): ${policyScore.toFixed(1)} / 100
- 世紀末環境綜合評級 (Planetary Resiliency Rating): ${getEnvRating(policyScore, "en")}

---

## 簡報頁目 20 頁完整內容綱要 (Slides Details)

### Page 1: 世紀末氣候危機與地球極限預演
- 綱要: 評估世紀末暖化大考驗。
- 投影數值: 2100年預估二氧化碳 ${co2In2100} ppm，地球均溫估計升幅 +${tempIn2100}°C。

### Page 2: 二氧化碳（CO2）累積與大氣溫室效應
- 綱要: 水汽與人類二氧化碳排放在大氣中形成厚厚的保溫毯，當前濃度達歷史頂點。
- 數據: 工業前 280 ppm → 2026年 424 ppm → 2100 預估 ${co2In2100} ppm。

### Page 3: 全球溫度升高异常與行星臨界點威脅
- 綱要: +1.5°C 是極地永凍土、珊瑚礁、極圈海冰、大西洋環流存亡的臨界關卡。
- 預估: 2100年升溫預算為 +${tempIn2100}°C。

### Page 4: 海水熱膨脹與海冰消融：海平面肆虐上升
- 綱要: 極地高山冰川大量融解加上海水體積膨脹，使台北、雅加達、紐約遭受淹沒威脅。
- 預算: 世紀末累積海平面上升抬升量預期為 ${seaIn2100} mm。

### Page 5: 氣候浩劫重擊：全球極端異常歷史
- 綱要: 熱帶白化、極強颶風強降雨、特大乾旱与山火，警示極端變異已成常規。

### Page 6: 能源再生革命：阻絕高碳排放源頭
- 綱要: 加速將高污染煤炭重電置換。將再生電網提升至 ${solarTransition}% 能強力截斷每年燃燒排碳。

### Page 7: 森林與大自然吸收：主動碳儲存匯
- 綱要: 植物固碳與禁止毀林是完美的非機械碳捕獲手段。設定每年植樹 ${reforestationRate} 十億，提供強勁的自然負排放儲留。

### Page 8: 碳定價機制：以資本力量抑制新增碳源
- 綱要: 以每噸 $${carbonTax} 美元價格向排碳源頭課稅，讓高碳技術失去市場優勢。

### Page 9: 氣候命運交織：全球聯合政策得分診斷
- 綱要: 得分量化指標為 ${policyScore.toFixed(1)} 分，評級為「${getEnvRating(policyScore, "zh-TW")}」。

### Page 10: 都市熱島效應：大都市地區的超高溫與綠化調適
- 綱要: 都市水泥地蓄熱。提高林頂覆蓋與建築頂樓植栽，能有效提供物理防曬遮陰、拉低都市尖峰耗能。

### Page 11: 極地冰蓋與反照率反饋：海冰與永凍土存亡
- 綱要: 極地海冰消失使深色大洋裸露，從反射陽光轉為吸收太陽輻射，形成暖化加速失控之內生回饋。

### Page 12: 海洋熱浪與海洋酸化：全球珊瑚大白化與深海生態
- 綱要: 溫室氣體大量溶入海水造成碳酸酸化，劇烈削弱碳酸鈣生物固骨能力，破壞海洋食物網基底。

### Page 13: 北極永凍土融解：萬年有機碳釋放與地崩
- 綱要: 萬年冰凍層解體，自發釋放高溫室效應的甲烷與二氧化碳，導致地基位移與熱力失衡。

### Page 14: 農業危機與糧食安全：全球作物的乾旱與荒漠化
- 綱要: 升溫促使乾旱地沙漠化。全球小麥玉米主產區的水土流失將引發區域歉收與地緣氣候難民潮。

### Page 15: 淡水資源危機：高山冰雪消逝與千萬人口缺水
- 綱要: 亞洲水塔喜馬拉雅及南美安地斯冰川萎縮，旱季河川補給劇減，直接爆發大都市飲水危机。

### Page 16: 物種快速滅絕：生態鏈解體與自然資本剝落
- 綱要: 局部微型氣候漂移速度超越野外動植物本能適應，使孤島與原始保護區生態支柱相繼倒塌。

### Page 17: 北方針葉林野火：加拿大與西伯利亞野火自發排碳回饋
- 綱要: 乾燥高溫助長大規模泥炭地和森林燎原山火，大量碳釋放形成自發性的劇烈排碳反饋。

### Page 18: 大西洋環流（AMOC）放慢：歐洲急凍與環流崩潰威脅
- 綱要: 格陵蘭冰洋傾卸億萬噸冷淡水，削弱大西洋經向翻轉環流，部分溫帶面臨極端速凍与大災。

### Page 19: 氣候金融補償基金：建立全球環境氣候正義
- 綱要: 歷史累積碳排大多來自先進國，但傷害卻由小島國與赤道脆弱國最先承受。提供基金協助其建設調適長堤。

### Page 20: 挽回無可替代的家園：我們共同的約定
- 綱要: 二十一世紀是決定地球是和諧綠野或是乾枯沙漠的轉捩點。填寫電郵認證您與下一代的承諾！
`;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(getRawMarkdownReport());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadPptx = async () => {
    const pptx = new PptxGenJS();
    
    pptx.layout = "LAYOUT_16x9";
    
    const content = slidesContent[lang];

    pptx.defineSlideMaster({
      title: "MASTER_SLIDE",
      background: { color: "0D1016" }, // Dark theme
    });

    content.forEach((slideData) => {
      const slide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
      
      // Step Label
      slide.addText(slideData.step + " | " + slideData.label, {
        x: 0.5,
        y: 0.3,
        fontSize: 10,
        color: "00E5FF",
        bold: true,
        fontFace: "Courier New",
      });

      // Title
      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.7,
        w: 9,
        h: 0.6,
        fontSize: 24,
        color: "FFFFFF",
        bold: true,
        fontFace: "Arial",
      });

      // Subtitle
      slide.addText(slideData.subtitle, {
        x: 0.5,
        y: 1.3,
        w: 9,
        h: 0.5,
        fontSize: 14,
        color: "94A3B8",
        fontFace: "Arial",
      });

      // Bullets
      const bulletTexts = slideData.bullets.map(b => {
        let text = b
          .replace(/{co2TargetGoal}/g, co2TargetGoal.toString())
          .replace(/{tempIn2100}/g, tempIn2100.toString())
          .replace(/{seaIn2100}/g, seaIn2100.toString())
          .replace(/{solarTransition}/g, solarTransition.toString())
          .replace(/{reforestationRate}/g, reforestationRate.toString());
        return { text };
      });
      
      slide.addText(bulletTexts, {
        x: 0.5,
        y: 2.0,
        w: 9,
        h: 1.5,
        fontSize: 14,
        color: "CBD5E1",
        bullet: true,
        margin: 0.1,
        lineSpacing: 24,
      });

      // Live Stats Block
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 3.7,
        w: 9,
        h: 1.2,
        fill: { color: "11141A" },
        line: { color: "1E293B", dashType: "solid" }
      });

      slide.addText(slideData.liveTitle, {
        x: 0.6,
        y: 3.8,
        w: 8.8,
        h: 0.3,
        fontSize: 10,
        color: "94A3B8",
        bold: true,
        fontFace: "Courier New"
      });

      let currentX = 0.6;
      const statW = 8.8 / slideData.liveStats.length;
      slideData.liveStats.forEach((stat) => {
        slide.addText([
          { text: stat.name + "\n", options: { fontSize: 10, color: "64748B" } },
          { text: String(stat.value) + "\n", options: { fontSize: 16, color: "FFFFFF", bold: true, fontFace: "Courier New" } },
          { text: stat.desc, options: { fontSize: 9, color: "00FF66" } }
        ], {
          x: currentX,
          y: 4.1,
          w: statW - 0.1,
          h: 0.7,
          align: "left",
          valign: "top"
        });
        currentX += statW;
      });

      // Footer
      slide.addText(slideData.footerQuote, {
        x: 0.5,
        y: 5.2,
        w: 9,
        h: 0.3,
        fontSize: 10,
        color: "64748B",
        italic: true
      });
    });

    await pptx.writeFile({ fileName: `Climate_Policy_Report_${new Date().toISOString().split("T")[0]}.pptx` });
  };

  const handleSignPact = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSignedPact(true);
    }
  };

  // Multilingual Slides Database
  const slidesContent = {
    "zh-TW": [
      {
        id: 1,
        step: "PAGE 01 / 20",
        label: "主題導論 | START OF JOURNEY",
        icon: <Globe className="w-8 h-8 text-emerald-400" />,
        title: "世紀末氣候危機與地球極限預演",
        subtitle: "利用自訂氣候政策與全球韌性模型，在人為暖化臨界點前重建永續平衡",
        bullets: [
          "與工業化前（1850-1900）大氣環境相比，當前全球地表均溫升幅已達 +1.28°C。",
          "本預演簡報系統將引導大眾認知碳排放累積、極地反照率削減與海平面攀升之關聯性。",
          "您目前的全球政策情境設定，正在推演 2100 年地球是陷入崩潰還是邁向生態共生。"
        ],
        liveTitle: "💡 當前全球自訂情境推估",
        liveStats: [
          { name: "2100 大氣二氧化碳", value: `${co2In2100} ppm`, desc: co2In2100 > 500 ? "大氣負荷劇烈，熱阻加倍" : "積極減排，貼近安全警戒" },
          { name: "2100 地球地表升溫", value: `+${tempIn2100} °C`, desc: tempIn2100 > 2.0 ? "跨越 2.0°C 紅線，威脅嚴重" : "防守 1.5°C 存續目標中" },
          { name: "政策綜合治理評分", value: `${policyScore.toFixed(0)} 分`, desc: `治理星級：${getEnvRating(policyScore, "zh-TW")}` }
        ],
        footerQuote: "「我們是第一代真正看見氣候變遷重擊，也是最後一代有能力行動的人類。」"
      },
      {
        id: 2,
        step: "PAGE 02 / 20",
        label: "二氧化碳追蹤 | ATMOSPHERIC CO₂",
        icon: <Compass className="w-8 h-8 text-indigo-400" />,
        title: "大氣二氧化碳累積與全球保溫效果",
        subtitle: "大氣保溫層吸收並阻隔了地球向外輻射熱量，使全球熱容量攀升",
        bullets: [
          "二氧化碳是溫室效應的第一大驅動力。工業革命前大氣中濃度恆定於約 280 ppm。",
          "隨化石能源大量燃燒與全球森林過渡砍伐，當前2026年大氣濃度已達到 424 ppm。",
          "如果缺乏積極行動（CO₂ 減排目標僅設為 {co2TargetGoal}%），高碳排放會在數十年間封死地表並致熱力過載。"
        ],
        liveTitle: "⚠️ 2100 溫室濃度動態路徑預估",
        liveStats: [
          { name: "目標減碳力度百分比", value: `${co2TargetGoal}%`, desc: "代表 2050 阻絕新建污染實力的程度" },
          { name: "2100 預估大氣濃度", value: `${co2In2100} ppm`, desc: co2In2100 > 480 ? "溫室累積引發自發反饋加熱" : "大氣增量得到顯著阻絕" }
        ],
        footerQuote: "每增加 1 ppm 二氧化碳，地球都將捕獲相當於數百萬顆原子彈覆蓋大氣的熱焓能流。"
      },
      {
        id: 3,
        step: "PAGE 03 / 20",
        label: "升溫紅線 | PLANETARY WARMING",
        icon: <Flame className="w-8 h-8 text-rose-500" />,
        title: "全球平均升温異常與行星臨界點威脅",
        subtitle: "升溫不僅是暖和，還預示著大自然自動調節系統的全面潰敗",
        bullets: [
          "科學界警告：氣候升溫若突破 1.5°C，將啟動地球系統的自我極限失衡。",
          "這些「翻轉臨界點（Tipping Points）」包括北極海冰全面消融、亞馬遜雨林乾枯、西伯利亞永凍土融化釋放上億噸甲烷。",
          "當前模擬在 2100 年將使全球升溫達到 +{tempIn2100}°C，極大提高這些骨牌效應引爆的機率。"
        ],
        liveTitle: "🌡️ 行星臨界點溫度計對比",
        liveStats: [
          { name: "1.5°C 存續警戒線", value: "已超越可能性", desc: "極地與珊瑚礁進入重損害或死滅邊緣" },
          { name: "2.0°C 生態失衡臨界", value: "骨牌效應連鎖", desc: "雨林和永凍土甲烷會自發爆發" },
          { name: "您當前決策世紀末升溫", value: `+${tempIn2100}°C`, desc: tempIn2100 < 1.8 ? "🌱 成功阻絕災難性失衡" : "🔥 精確指向大範圍生態混亂" }
        ],
        footerQuote: "「當系統跨越臨界點，人類的任何減排都將無法阻止溫度自主上升。」"
      },
      {
        id: 4,
        step: "PAGE 04 / 20",
        label: "海面上升 | OCEAN LEVEL THREAT",
        icon: <Waves className="w-8 h-8 text-sky-400" />,
        title: "海水體積膨脹與海冰消融：永久淹海",
        subtitle: "海水受熱（熱膨脹）以及陸地冰蓋融解流入大洋，促使海平面劇烈抬升",
        bullets: [
          "衛星高密測量證實，全球海平面正以 +3.4 mm/年 的加速度往上爬升。",
          "水患不僅影響島嶼面貌，還會使地下水遭受鹽份入侵，阻斷沿海大都市的生活安全。",
          "世紀末全球海平面已計算上升達 {seaIn2100} mm。台北、雅加達、紐約多數碼頭低窪防線將面臨威脅。"
        ],
        liveTitle: "🌊 海水平面高程警示線 (2100)",
        liveStats: [
          { name: "海平面累計上升高度", value: `${seaIn2100} mm`, desc: `等同於 ${(seaIn2100 / 10).toFixed(1)} 公分垂直高度，水潮直入內陸` },
          { name: "沿海城市生存空間影響", value: seaIn2100 > 400 ? "⚠️ 常態性大潮浸沒低凹平原" : "🛡️ 本地海堤與滯洪池大體可阻防" }
        ],
        footerQuote: "液體熱膨脹是不會停下的物理定律，大洋的巨大熱慣性需要數百年才能穩定下來。"
      },
      {
        id: 5,
        step: "PAGE 05 / 20",
        label: "極端常態 | CHRONOLOGY OF EXTREMES",
        icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
        title: "極端異常：全球大旱、巨澇與風暴潮連鎖",
        subtitle: "氣候變動使氣壓流向極端，造成百年罕見的「氣候怪獸」化為家常便飯",
        bullets: [
          "過去數十年，從 1998 年大白化、2005 年卡崔娜颶風到當下極地熱空氣異常盤旋。",
          "大氣溫差不均使急流 (Jet Stream) 停滯，局部地區暴現超高強降水或長達數月的熱浪。",
          "氣候損害已造成全球每年數千億美元的經濟財富折損與環境難民激增。"
        ],
        liveTitle: "🔔 本世紀氣候常規特寫（基於現行高溫）",
        liveStats: [
          { name: "局部大淹水威脅倍率", value: `${(1 + tempIn2100 * 0.3).toFixed(1)} 倍`, desc: "大氣每升溫 1°C 能多容納約 7% 的水汽含量" },
          { name: "夏日高強度熱浪天數", value: `預估延長 ${(tempIn2100 * 12).toFixed(0)} 天`, desc: "高加溫使城市熱島熱值在無風帶盤旋" }
        ],
        footerQuote: "「氣候浩劫不是突然發生的爆破，而是緩慢席捲、逐漸捏碎我們繁華文明的日常澇旱。」"
      },
      {
        id: 6,
        step: "PAGE 06 / 20",
        label: "電網革命 | GRID DECARBONISATION",
        icon: <Sliders className="w-8 h-8 text-emerald-400" />,
        title: "能源革命：光電及風能置換傳統高溫室源頭",
        subtitle: "擺脫火電對大氣的加害，建立高韌性的無碳基載電網",
        bullets: [
          "傳統發電與重工業排放佔了大氣新增碳的三分之二以上，綠電百分百轉型是活路。",
          "光電、風電的大規模併網（您此時設定了高達 {solarTransition}% 轉型率目標）是遏止高碳增量的決定性政策。",
          "配套高儲能、碳捕集 (CCS) 系統，方可打破「燃用碳才安全」的資本迷思。"
        ],
        liveTitle: "🔌 電力轉型成功指標 (Success Metric)",
        liveStats: [
          { name: "設定綠色轉型目標比例", value: `${solarTransition}%`, desc: "代表低碳電網全面替代舊火力電網的決心" },
          { name: "零排放阻絕率乘數", value: `${(solarTransition * 0.95).toFixed(1)}%`, desc: "直接削減原發電排碳。化石資本面臨深度減值" }
        ],
        footerQuote: "「陽光與風不會向世界寄送账單，這是一場從資源掠奪轉向生態和諧的終極工程革命。」"
      },
      {
        id: 7,
        step: "PAGE 07 / 20",
        label: "大自然碳匯 | NATURAL CARBON SINKS",
        icon: <Trees className="w-8 h-8 text-teal-400" />,
        title: "重植森林再造：大自然的綠野肺葉呼吸",
        subtitle: "利用大自然自帶的光合固碳循環，建立強大的自然負排放吸碳緩衝",
        bullets: [
          "樹木是大自然數億萬年進化最安全的「光合碳捕集工程器」，成本低廉且帶來豐富多樣生態。",
          "您已設定每年在全球植樹森林再造約 {reforestationRate} 十億棵，這極大強化了土壤碳匯儲能。",
          "阻止雨林濫伐與培育海草床（藍碳），每年能從大氣中回收億萬噸的多餘温室殘留。"
        ],
        liveTitle: "🌲 綠野造林與自然負排放投影",
        liveStats: [
          { name: "自訂造林速率目標 / 年", value: `${reforestationRate} 十億棵`, desc: "為地球增添呼吸固碳面積，抵消重工業碳外溢" },
          { name: "大自然吸收吸返乘數", value: `約 ${(reforestationRate * 1.8).toFixed(1)}% 溫室抵消`, desc: "透過大自然根系碳螯合，將大氣游離碳鎖入厚土" }
        ],
        footerQuote: "「播種森林是我們寫給下一個世紀最溫柔的情書。」"
      },
      {
        id: 8,
        step: "PAGE 08 / 20",
        label: "綠色稅制 | CARBON PRICING LEVER",
        icon: <Coins className="w-8 h-8 text-yellow-500" />,
        title: "全球碳稅定價：利用市場槓桿清洗傳統高耗能",
        subtitle: "讓破壞地球付出真實、高昂的商業成本，使淨零科技全面勝出",
        bullets: [
          "氣候損害在傳統商業上常常是「外部化的免費成本」。企業排碳卻由全人類承擔代價。",
          "對每噸排碳開徵 ${carbonTax} 美元的高碳稅，能立刻洗牌各板塊。煤電鐵鋼在市場競用中將被完全淘汰。",
          "課稅收取的巨額資金，能反向補貼氫能、碳回收技術以及弱勢氣候灾區的生存工程。"
        ],
        liveTitle: "💰 行星商業碳稅抑制預計",
        liveStats: [
          { name: "課徵碳定價稅率 (USD/Ton)", value: `$${carbonTax}`, desc: "在您制定的價格下，高碳科技生存空間受阻" },
          { name: "淨零環保科技資金引流", value: `預估補貼激增 ${Math.min(300, carbonTax * 6)}%`, desc: "引導全球數萬億投資轉向對環境無害的新綠色專利" }
        ],
        footerQuote: "「只要破壞氣候依然是免費的，大氣就不可能得到真正的原諒與康復。」"
      },
      {
        id: 9,
        step: "PAGE 09 / 20",
        label: "決策成績單 | POLICY SCORECARD",
        icon: <Sparkles className="w-8 h-8 text-amber-400" />,
        title: "氣候政策交織：全球治理統合成績單",
        subtitle: "單一方案孤掌難鳴，唯有多管齊下的氣候韌性，方能保全家園",
        bullets: [
          "四大核心變量（目標、綠能、造林、碳稅）必須達成緊密化學反應，始得發揮 1+1 > 2 的協同抗阻效果。",
          "您推導的 global policy score 得分為 {policyScore}%，這代表目前的系統性防禦力度能大幅度重塑末日預言。",
          "我們必須持續在各大洲、大都市推動全面的低碳與調適（Adaptation）行動。"
        ],
        liveTitle: "📊 四維綜合反饋綜合診斷 (Scorecard)",
        liveStats: [
          { name: "全球氣候融合總體評分", value: `${policyScore.toFixed(1)} / 100`, desc: `韌性等級：${getEnvRating(policyScore, "zh-TW")}` },
          { name: "升溫控制與海面防守狀態", value: tempIn2100 > 1.8 ? "🚨 格局艱鉅，需加大稅制與綠能深度" : "❇️ 進展傑出，地球升溫軌跡已顯著拉平" }
        ],
        footerQuote: "「我們不是在拯救冰川與海豹，而是在親手抉擇子孫後代在 2100 年是否有尊嚴地呼吸。」"
      },
      {
        id: 10,
        step: "PAGE 10 / 20",
        label: "都市蓄熱 | URBAN HEAT ISLANDS",
        icon: <Trees className="w-8 h-8 text-emerald-400" />,
        title: "都市熱島效應：大都市地區的超高溫與綠化調適",
        subtitle: "柏油和水泥結構大量吸收日光輻射，使百萬人口都市化身熔爐",
        bullets: [
          "由於缺乏林冠遮蔽且佈滿冷氣排瓦，重工業城市及人口稠密區均溫比鄉野高出 +3.0°C 至 +7.0°C。",
          "致命的高溫熱浪將急遽加重電網空調負荷，並威脅長者與低所得社群的生命健康。",
          "推動「林頂林冠綠護網(Urban Canopies)」與垂直屋頂植栽，能主動遮蔭並透過植物蒸騰散熱降溫。"
        ],
        liveTitle: "🏙️ 都市多層級蓄熱調度指標",
        liveStats: [
          { name: "都市蓄熱溢額估值", value: `+${(2.8 + tempIn2100 * 0.9).toFixed(1)} °C`, desc: "都市中心常態性高於周邊森林鄉野的熱溫" },
          { name: "綠頂 canopy 防守潛力", value: reforestationRate > 2.5 ? "🛡️ 樹冠遮蔭與蒸發散熱效率偏高" : "⚠️ 造林率不足，都市遭受熱浪高位曝露" }
        ],
        footerQuote: "樹蔭就像大自然的防曬乳，其物理遮蔽与叶面蒸發比任何人工空調更節能高效。"
      },
      {
        id: 11,
        step: "PAGE 11 / 20",
        label: "反射衰減 | ALBEDO RETREAT",
        icon: <Info className="w-8 h-8 text-sky-300" />,
        title: "極地冰蓋與反照率反饋：海冰消融惡性循環",
        subtitle: "當潔白海冰消逝，黑色的深層海洋將吸收高達 90% 的陽光輻射",
        bullets: [
          "冰雪擁有高達 0.8 的「太陽反照率(Albedo)」，能將多數光熱彈回太空。裸露的海水反射率僅有 0.1。",
          "溫室升溫融化海冰，引發「升溫 → 冰融 → 裸海吸熱 → 再升溫」的強大內生自發正回饋機制。",
          "這也是北極升溫速率比地球均值快上 3 到 4 倍（北極放大效應）的頭號罪魁禍首。"
        ],
        liveTitle: "❄️ 地表光能反射效能指標 (Albedo index)",
        liveStats: [
          { name: "全球淨反照率衰減估計", value: `-${(3 + tempIn2100 * 2.8).toFixed(1)}%`, desc: "高加溫促使深色吸熱帶範圍廣泛蔓延" },
          { name: "北極消融冰川存續年資", value: tempIn2100 > 2.2 ? "🚨 2040 左右可能迎來首度無海冰夏季" : "❇️ 升溫控制良好，夏季長年冰蓋大體保全" }
        ],
        footerQuote: "丟失了反射鏡的雪白地球，宛如在無遮攔的烈日下套上吸熱重黑外袍。"
      },
      {
        id: 12,
        step: "PAGE 12 / 20",
        label: "海洋酸化 | OCEAN ACIDIFICATION",
        icon: <Waves className="w-8 h-8 text-blue-400" />,
        title: "海洋熱浪與海洋酸化：海水生態的重度浩劫",
        subtitle: "海洋承接了人類 90% 的超額熱量，更直接吸收了 30% 排放的二氧化碳",
        bullets: [
          "二氧化碳溶於大洋形成大量碳酸，導致海水 pH 值顯著跌落，酸度已比工業革命前攀升了 30%。",
          "酸化奪走了海水中碳酸根離子，使貝類、珊瑚礁、浮游碳酸生物無法構建其堅硬的碳酸鈣殼體。",
          "配合海水熱浪，全球珊瑚大白化以及魚類產帶死滅，預估正以致命速度折損海洋生物鏈的根基。"
        ],
        liveTitle: "🐚 海水酸化與珊瑚礁敏感度預估",
        liveStats: [
          { name: "預測2100年海洋pH值", value: (8.11 - (co2In2100 - 280) * 0.0007).toFixed(3), desc: `工業前平均基準為 8.12，酸度急劇爬坡` },
          { name: "全球暖水珊瑚存活警戒", value: tempIn2100 > 1.5 ? (tempIn2100 > 2.0 ? "🚨 瀕臨滅絕" : "⚠️ 90% 以上白化退化期") : "🌱 殘留約半數可尋林庇護" }
        ],
        footerQuote: "「海洋是生命之源。當海水變得不適合建殼，半數大洋生物的生存齒輪將卡死。」"
      },
      {
        id: 13,
        step: "PAGE 13 / 20",
        label: "永凍瓦解 | PERMAFROST THAW",
        icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
        title: "北極永凍土融解：凍結萬年的甲烷時光彈",
        subtitle: "西伯利亞與加拿大地底下，禁錮著比當前大氣多兩倍的龐大有機碳",
        bullets: [
          "隨極地急速暖化，長年封凍的凍上土開始塌陷（熱卡斯特地貌），使地下有機物暴露且發酵。",
          "缺氧發酵將釋放高溫室強度的甲烷(CH₄)；甲烷在20年尺度下的保溫能力是二氧化碳的 80 倍。",
          "一旦永凍土大範圍跨越崩漏臨界點，其爆發式的排碳將使任何人類減碳協議失去阻攔意義。"
        ],
        liveTitle: "🌋 凍土甲烷洩漏與自發碳排回饋",
        liveStats: [
          { name: "永凍土退化總體面積", value: `${(tempIn2100 * 18.5).toFixed(1)}%`, desc: "高熱導致土層變軟塌陷，地基全面軟化" },
          { name: "預估自發排碳溢出效應", value: tempIn2100 > 2.0 ? "🚨 甲烷釋放處於高度正反饋" : "❇️ 凍層穩固，低速零星背景洩出" }
        ],
        footerQuote: "封凍萬年的遠古泥炭地藏有天量死魂，如今正在全球發威升溫的背景下被逐一喚醒。"
      },
      {
        id: 14,
        step: "PAGE 14 / 20",
        label: "農林歉收 | AGRICULTURAL DECAY",
        icon: <AlertTriangle className="w-8 h-8 text-orange-400" />,
        title: "農業危機與糧食安全：全球可耕地沙漠化",
        subtitle: "異常的溫度高峰與嚴重的水汽失衡，正無情擠壓著人類生存的麵包圈",
        bullets: [
          "升溫每增加 1°C，全球玉米、小麥主要產區預期將暴跌 5% 至 10% 的收成量。",
          "高溫使昆蟲爆發繁衍期，且地表強烈蒸發導致水鹽化，使沃土化為乾涸板結的盐土。",
          "極端氣候帶來的歉收與物價暴漲，正直接威脅低收入脆弱區的生存，加劇跨國地緣不穩定。"
        ],
        liveTitle: "🌾 2100 糧食產能衰減敏感度",
        liveStats: [
          { name: "核心糧產地常態失收機率", value: `預估達 ${(tempIn2100 * 15).toFixed(0)}%`, desc: "百年一遇的全球農業大旱縮年為每十年輪值" },
          { name: "糧食脆弱地區飢餓威脅", value: tempIn2100 > 1.8 ? "🚨 缺糧帶高度擴散，乾旱加重" : "🛡️ 本地儲留與保水補貼尚可適應" }
        ],
        footerQuote: "「人類與野獸無異，距離無糧填肚的全面動盪只有九餐的距離。」"
      },
      {
        id: 15,
        step: "PAGE 15 / 20",
        label: "淡水枯枯 | WATER CRISIS",
        icon: <Sliders className="w-8 h-8 text-cyan-300" />,
        title: "淡水資源危機：高山高海拔冰雪與儲水枯竭",
        subtitle: "被譽為「亞洲水塔」與「南美之腎」的各大冰川，正在急速縮小",
        bullets: [
          "喜馬拉雅、安第斯、阿爾卑斯冰川提供全球數十億人口乾旱季的穩定河川源頭流注。",
          "冰蓋的短暫暴融雖然在短期會引發山洪盆漏，但隨後將滑入百年未見的慢性乾涸。",
          "地下蓄水層亦因超抽灌溉急遽崩跌。高鹽度地下水與乾焦河床，正演變為地缘政治的必爭之處。"
        ],
        liveTitle: "💧 全球重大流域乾旱赤字估算",
        liveStats: [
          { name: "高山冰水庫存儲餘量", value: `預估僅剩 ${(Math.max(10, 100 - tempIn2100 * 25)).toFixed(0)}%`, desc: "極大萎縮，河源在春末後接近枯漏" },
          { name: "流域衝突跨國保證指數", value: tempIn2100 > 2.1 ? "🚨 極度惡劣，面臨缺水地緣分水爭端" : "❇️ 調度尚可，大體藉政策減碳保全冰源" }
        ],
        footerQuote: "「下一次的世界級局部擦槍走火，起因不會是黑色石油，而是清澈乾淨的生命淡水。」"
      },
      {
        id: 16,
        step: "PAGE 16 / 20",
        label: "多樣崩落 | SPECIES CONSTRAINTS",
        icon: <Trees className="w-8 h-8 text-green-400" />,
        title: "物種快速滅絕期：生態支柱支零解體",
        subtitle: "氣候帶移轉速度超越多數陸生脊椎動物、昆蟲及植物的演化极限",
        bullets: [
          "隨著大氣高加溫，物種必須以每年數公里的速度移向高緯度或高海拔去尋找涼爽庇護所。",
          "然而，公路群、超高工廠與碎片化的水泥市區斷開了相連的自然走廊，使野生動物無路可逃。",
          "一旦關鍵「基石物種」(如授粉蜜蜂、森林真菌) 倒塌，整座森林或草原的固碳韌性將土崩瓦解。"
        ],
        liveTitle: "🐾 行星物種滅絕風險動態矩陣",
        liveStats: [
          { name: "物種局部瀕絕比例", value: `${(tempIn2100 * 9.5).toFixed(1)}%`, desc: "代表其生存氣候生態棲位完全從原產地消失" },
          { name: "棲息走廊中斷破碎率", value: reforestationRate < 3.0 ? "🚨 森林破碎，野生動物遷徙困難" : "❇️ 積極林下修補，動物保留遷徙網格" }
        ],
        footerQuote: "這是不流血且無聲的屠殺。地表上的每個物種，正在以一千倍於自然常態的速率淡出地景。"
      },
      {
        id: 17,
        step: "PAGE 17 / 20",
        label: "針葉山火 | BOREAL WILDFIRES",
        icon: <Flame className="w-8 h-8 text-red-500" />,
        title: "北方針葉林野火：加拿大與西伯利亞的無盡灰燼",
        subtitle: "跨越萬里的寒帶針葉林正在經歷高溫大旱，轉為全球碳增量的定時炸彈",
        bullets: [
          "高緯度氣候暖化是全球均速的三倍。乾燥雷擊引燃了大範圍、難以撲滅的深層泥炭地野火。",
          "光是 2023 年加拿大野火的單季碳排放，即為人類總排放額外的強大附屬添加，形成可怕的額外正回饋。",
          "遮天蔽日的PM2.5毒煙，更南下鎖牢整個北美和歐亞各大都市，造成長期的空氣與健康浩劫。"
        ],
        liveTitle: "🔥 高緯度燎原山火頻率與損害",
        liveStats: [
          { name: "寒林年均野火燒失面積", value: `${(tempIn2100 * 2.8).toFixed(1)} 倍飆升`, desc: "高加溫促使原野木材極度乾焦易燃" },
          { name: "自發性森林固碳資產折損", value: tempIn2100 > 1.9 ? "🚨 寒帶肺葉森林從吸碳碳匯墮為排碳源" : "❇️ 大火在控制中，林區保有長年儲留" }
        ],
        footerQuote: "當本應儲藏溫室二氧化碳的冰天雪地也開始自燃，人類在碳排放盤查上的努力將顯得極其渺小。"
      },
      {
        id: 18,
        step: "PAGE 18 / 20",
        label: "大洋環流 | AMOC SHUTDOWN",
        icon: <Waves className="w-8 h-8 text-indigo-400" />,
        title: "大西洋環流放慢：歐洲急凍與全球季風帶乾癟",
        subtitle: "格陵蘭融冰傾卸天量的淡水，極大淡化了北大西洋的重鹽分海水",
        bullets: [
          "「大西洋經向翻轉環流（AMOC）」宛如行星巨大的熱水器，將赤道溫暖水流送往西北歐。",
          "淡水比重大幅輕於含鹽水，不再能於高溫飽和後沉入深海，使整個深海循環輸送帶面臨速度滑落。",
          "AMOC 放慢將使歐洲少掉暖流眷顧而有速凍威脅，同時重創西非和南亞的季節性降水帶。"
        ],
        liveTitle: "🌀 溫鹽翻轉環流 (AMOC) 減速預警",
        liveStats: [
          { name: "環流系統流量減速估算", value: `-${(tempIn2100 * 14.5).toFixed(1)}%`, desc: "世界洋流輸送帶運作能動性正在顯著收縮" },
          { name: "北大西洋臨界點破裂機率", value: tempIn2100 > 2.3 ? "🚨 高位警戒：世紀末面临系統性衰退" : "❇️ 大體安全：洋流得以在底線前維持脈動" }
        ],
        footerQuote: "大洋環流是地球的血液。血液循環若受阻，陸地上的局部氣壓調度將全面失控。"
      },
      {
        id: 19,
        step: "PAGE 19 / 20",
        label: "環境正義 | CLIMATE FINANCE",
        icon: <Coins className="w-8 h-8 text-yellow-500" />,
        title: "氣候補償與正義：彌合歷史排碳造成的權益失衡",
        subtitle: "最不發達國家與低窪島國在歷史上排放极少，卻遭受最慘痛的水淹和風暴",
        bullets: [
          "已開發國家利用百年化石高碳創造了巨額財富。然而，小島國及赤道脆弱群體正失去其唯一的領土家園。",
          "全球氣候補償基金（「Loss and Damage Fund」）是氣候正義的底線，旨在由高排碳國出資補貼脆弱地區。",
          "您目前制定的 $${carbonTax} 碳稅，能有效抽調資本，主動援助雅加達或吐瓦魯等面臨威脅的人口聚落。"
        ],
        liveTitle: "💵 全球公正轉型與氣候補償基金分配",
        liveStats: [
          { name: "碳稅收入補貼潛力", value: `$${(carbonTax * 4.5).toFixed(0)} 億美元/年`, desc: "來自高排碳罰稅所得，即時流注綠色援助" },
          { name: "被威脅島國大遷徙推避率", value: carbonTax > 70 ? "🛡️ 充足防護：能全面修繕河堤與防洪長城" : "⚠️ 補貼短缺，島國居民面臨常態性侵沒與被迫撤走" }
        ],
        footerQuote: "「如果我們不為氣候受害者提供公正的退路，氣候大遷徙帶來的地緣不穩將席捲每座富裕的高牆。」"
      },
      {
        id: 20,
        step: "PAGE 20 / 20",
        label: "結語與行動 | CALL TO ACTION",
        icon: <FileText className="w-8 h-8 text-emerald-400" />,
        title: "我們共同的契約：挽回無可替代的地球",
        subtitle: "用主動理性的決策替代被動的失衡崩潰，在此時此刻簽署綠色條約",
        bullets: [
          "氣候變遷並非不可避免的死局。您剛才在沙盒桌面上制定的每一步數值配置，在現實世界中皆有實體科技得以支持。",
          "轉向微型電網、推動碳稅共識、倡導城市防洪適應。這是一場全人類與時間賽跑的生存意志大對決。",
          "讓我們從今天開始，在各自的社區、機構與大都市，攜手構建那道抵禦風暴與海浸的生態巨牆。"
        ],
        liveTitle: "🖊️ 行星永續同盟簽署協議",
        liveStats: [
          { name: "決策人認證狀態", value: signedPact ? "✅ 條款認證完畢 | 同盟成立" : "❌ 等待聯合宣誓", desc: signedPact ? "您已向全球宣告共同維護 2100 地景綠野" : "請在下方填寫電郵誓簽" }
        ],
        footerQuote: "「地球能滿足人類的生存需要，但無法滿足人類的無限貪婪。」— 甘地"
      }
    ],
    "en": [
      {
        id: 1,
        step: "PAGE 01 / 20",
        label: "INTRODUCTION | START OF JOURNEY",
        icon: <Globe className="w-8 h-8 text-emerald-400" />,
        title: "2100 Century Climate Projections",
        subtitle: "Using interactive sandbox policy scenarios to reconstruct planetary safety before the tipping point.",
        bullets: [
          "Compared to the pre-industrial baseline (1850-1900), global mean surface temperature has already risen by +1.28°C.",
          "This interactive report demonstrates the direct physical linkage between CO2 buildup, polar albedo loss, and ocean rises.",
          "Your current active policies are writing the destiny of Earth's critical ecosystems for the year 2100."
        ],
        liveTitle: "💡 Current Active Projections State",
        liveStats: [
          { name: "2100 Atmospheric CO2", value: `${co2In2100} ppm`, desc: co2In2100 > 500 ? "Severe overload, greenhouse traps magnified" : "Robust target trajectory, nearing safe bounds" },
          { name: "2100 Global Warming", value: `+${tempIn2100} °C`, desc: tempIn2100 > 2.0 ? "Warning: cross 2°C threshold triggers collapse" : "Successfully aiming within the Paris 1.5°C threshold" },
          { name: "Global Synthesis Score", value: `${policyScore.toFixed(0)} / 100`, desc: `Resiliency Rating: ${getEnvRating(policyScore, "en")}` }
        ],
        footerQuote: "'We are the first generation to feel the impact of climate change, and the last generation that can do something about it.'"
      },
      {
        id: 2,
        step: "PAGE 02 / 20",
        label: "CO2 TRAJECTORY | ATMOSPHERIC BACKBONE",
        icon: <Compass className="w-8 h-8 text-indigo-400" />,
        title: "Atmospheric CO₂ Accumulation & Radiative Forcing",
        subtitle: "Human carbon emissions create a dense blanket trapping infrared energy back to Earth.",
        bullets: [
          "Carbon dioxide is the principal driver of anthropomorphic climate change, originally balanced at roughly 280 ppm.",
          "Fueled by fossil fuels and heavy logging, our current 2026 atmospheric concentration stands at 424.3 ppm.",
          "Failing to implement strong emission cuts (current reduction target: {co2TargetGoal}%) yields catastrophic heating over decades."
        ],
        liveTitle: "⚠️ 2100 CO2 Concentrating Path",
        liveStats: [
          { name: "Active Reduction Rate Target", value: `${co2TargetGoal}%`, desc: "Reflects global ambition to prevent new heavy carbon projects" },
          { name: "Forecast 2100 Conc.", value: `${co2In2100} ppm`, desc: co2In2100 > 480 ? "Heavy heating loops run out of boundary control" : "Greenhouse concentration growth checked markedly" }
        ],
        footerQuote: "For every 1 ppm of carbon added, we trap the energy equivalent of millions of atomic bombs in our ocean system."
      },
      {
        id: 3,
        step: "PAGE 03 / 20",
        label: "HEATING CRITICALS | GLOBAL TIPPING POINTS",
        icon: <Flame className="w-8 h-8 text-rose-500" />,
        title: "Mean Surface Anomaly & Planetary Escaping Points",
        subtitle: "Planetary warming is not linear; it threatens biological feedback loops beyond human control.",
        bullets: [
          "The scientific consensus is clear: warming past 1.5°C to 2.0°C risks activating massive climate trigger-points.",
          "These feedback triggers include melting Arctic summer permafrost, dieback of the Amazon core, and collapse of oceanic circulation.",
          "Your current sandbox setup projects a 2100 world of +{tempIn2100}°C, which directly impacts the safety window of these systems."
        ],
        liveTitle: "🌡️ Planetary Warning Thermometer Comparing",
        liveStats: [
          { name: "1.5°C CO₂ Guardrail", value: "Survival Threat Critical", desc: "Corals and low-lying ice sheets experience devastating structural decay" },
          { name: "2.0°C Irreversible Threshold", value: "Escaping Cascade Risk", desc: "Permafrost releases methane, compounding human-made heating cascades" },
          { name: "Your Projected Heating", value: `+${tempIn2100}°C`, desc: tempIn2100 < 1.8 ? "🌱 Safe: managed within tolerable boundaries" : "🔥 Extreme: leading to widespread biome breakdown" }
        ],
        footerQuote: "'Once tipping points are crossed, nothing humanity does can stop the Earth from heating up on its own.'"
      },
      {
        id: 4,
        step: "PAGE 04 / 20",
        label: "SEALEVEL RISE | WATERLINES RISE",
        icon: <Waves className="w-8 h-8 text-sky-400" />,
        title: "Ocean-Water Thermal Expansion & Glacial Sinking",
        subtitle: "Melting polar glaciers and expanding warm sea waters drive massive sea-level rise.",
        bullets: [
          "Recent radar altimetry reveals oceans are rising at a compounding rate of +3.4 mm per year.",
          "Rising water infiltrates critical city groundwater aquifers, raising salinity, and ruining drinking reserves.",
          "Under your current projection, sea level will rise {seaIn2100} mm by 2100, breaching coastal defenses in Taipei, Jakarta, and New York."
        ],
        liveTitle: "🌊 Net Cumulative Sea Level Rise (2100)",
        liveStats: [
          { name: "Total Vertical Ocean Rise", value: `${seaIn2100} mm`, desc: `Roughly ${(seaIn2100 / 10).toFixed(1)} cm. Extreme high-tides surge inland` },
          { name: "Metropolitan Flood Severity", value: seaIn2100 > 400 ? "⚠️ High risk of permanent inundation for sub-sea level structures" : "🛡️ Managed: manageable with robust coastal sea-walls" }
        ],
        footerQuote: "Oceanic thermal expansion is governed by unstoppable thermodynamics. The heat index requires centuries to resolve."
      },
      {
        id: 5,
        step: "PAGE 05 / 20",
        label: "THE NEW NORMAL | DISASTER CHRONOLOGY",
        icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
        title: "Chronology of Global Climate Extremes & Hard Losses",
        subtitle: "Warming triggers massive atmospheric jet stream shifts, locking severe floods and wildfires in place.",
        bullets: [
          "Historically, events like the 1998 bleaching, 2005 Hurricane Katrina and polar atmospheric disruptions were stark indicators.",
          "As more warm air holds water vapor (approx. +7% volume per +1°C rise), downpours shatter historic records.",
          "Severe droughts fuel vast wildfires, leading to trillions in damages and millions of climate refugees worldwide."
        ],
        liveTitle: "🔔 Century Extreme Weather Factor Analysis",
        liveStats: [
          { name: "Downpour Intensity Multiplier", value: `${(1 + tempIn2100 * 0.3).toFixed(1)}x`, desc: "Increased heat drives severe atmospheric precipitation concentration" },
          { name: "Extended Summer Heatwaves", value: `+${(tempIn2100 * 12).toFixed(0)} Days`, desc: "Planetary heat domes trap scorching air over high density urban grids" }
        ],
        footerQuote: "'Climate change is not a sudden explosion; it is a slow, crushing everyday erosion of our complex civilizations.'"
      },
      {
        id: 6,
        step: "PAGE 06 / 20",
        label: "POWER GRID | ENERGY REVOLUTION",
        icon: <Sliders className="w-8 h-8 text-emerald-400" />,
        title: "Energy Grid Decarbonization: Retiring Fossil Fuels",
        subtitle: "Shifting production directly toward wind and solar to sever carbon dependency.",
        bullets: [
          "Power generation and heavy industry contribute over 70% of human carbon emissions.",
          "Rapid deployment of solar, wind and nuclear (your target: {solarTransition}% of global matrix) has direct mitigation effects.",
          "Pairing renewable grids with high-density grid storage breaks the dependency loop on high-carbon coal plants."
        ],
        liveTitle: "🔌 Decarbonization Matrix & Power Transition Index",
        liveStats: [
          { name: "Clean Power Transition Rate", value: `${solarTransition}%`, desc: "Represents global determination to swap fossil fuels with clean alternatives" },
          { name: "Grid Carbon Reduction Factor", value: `${(solarTransition * 0.95).toFixed(1)}%`, desc: "Directly curtails atmospheric addition from grid generators." }
        ],
        footerQuote: "'The sun and the wind do not send a bill. This is the ultimate technological shift towards ecological integration.'"
      },
      {
        id: 7,
        step: "PAGE 07 / 20",
        label: "BIOSPHERE RESILIENCE | NATURAL SINKS",
        icon: <Trees className="w-8 h-8 text-teal-400" />,
        title: "Global Core Reforestation: Nature's Carbon Sponges",
        subtitle: "Reclaiming barren lands to naturally sequester and lock away surplus CO2.",
        bullets: [
          "Trees use photosynthesis, a cheap and highly regenerative way to sequester carbon from global air.",
          "Your current target of planting {reforestationRate} Billion trees/year directly boosts carbon capture pools in soil and biomass.",
          "Rebuilding wetlands, preserving core mangroves, and stopping Amazon logging are crucial negative-emissions levers."
        ],
        liveTitle: "🌲 Biosphere Carbon Storage Projection",
        liveStats: [
          { name: "Annual Reforestation Pace", value: `${reforestationRate} Billion`, desc: "Injects planetary breathing power to absorb industrial carbon leakages" },
          { name: "Global Sequestration Multiplier", value: `Approx. ${(reforestationRate * 1.8).toFixed(1)}% offset`, desc: "Safely locks atmospheric carbon back into soil and wood fiber pathways" }
        ],
        footerQuote: "'Planting forests is the gentlest love letter we can write to the next century.'"
      },
      {
        id: 8,
        step: "PAGE 08 / 20",
        label: "CARBON TAX | FINANCIAL MOTIVATION",
        icon: <Coins className="w-8 h-8 text-yellow-500" />,
        title: "Global Carbon Pricing: Economic Levers For Net-Zero",
        subtitle: "Penalizing harmful emissions to redirect global investment capital toward clean innovation.",
        bullets: [
          "Climate damages have long been treated as an 'unpriced external cost' where polluters paid nothing.",
          "Enforcing a tax of ${carbonTax} USD per metric ton changes the equation. Fossil energy instantly loses cost-competitiveness.",
          "Tax revenues fund green subsidies, nuclear research, and help protect vulnerable global coastal communities."
        ],
        liveTitle: "💰 Carbon Pricing Impact Forecast",
        liveStats: [
          { name: "Global Carbon Fee (USD/ton)", value: `$${carbonTax}`, desc: "Under this carbon price, high heating technologies lose business validity" },
          { name: "Green Tech Venture Allocation", value: `Estimated +${Math.min(300, carbonTax * 6)}%`, desc: "Trillions of market investment capital shift away from polluting industries" }
        ],
        footerQuote: "'As long as destroying our climate remains free, the atmosphere cannot truly recover.'"
      },
      {
        id: 9,
        step: "PAGE 09 / 20",
        label: "POLICY SYNERGY | SCORECARD SUMMARY",
        icon: <Sparkles className="w-8 h-8 text-amber-400" />,
        title: "Planet-Wide Synergy: The Master Climate Scorecard",
        subtitle: "No single policy succeeds in isolation. A unified resilient portfolio is key.",
        bullets: [
          "Combining targets, smart grids, forest sinks, and carbon tax levers triggers exponential compound benefits.",
          "Your integrated policy index score is {policyScore}%, representing the capacity to reshape planetary heating forecasts.",
          "We must accelerate the deployment of localized adaptation upgrades alongside carbon mitigation."
        ],
        liveTitle: "📊 Integrated Four-Axis Synthesis Diagnose",
        liveStats: [
          { name: "Global Policy Integration Score", value: `${policyScore.toFixed(1)} / 100`, desc: `Rating: ${getEnvRating(policyScore, "en")}` },
          { name: "Global Surface Heating Deflector", value: tempIn2100 > 1.8 ? "🚨 High Warning: Redouble efforts to stabilize atmosphere" : "❇️ Excellent progress: global heating curve successfully flattened" }
        ],
        footerQuote: "'We are not trying to save the glaciers and seals; we are deciding whether the next generation can live with dignity.'"
      },
      {
        id: 10,
        step: "PAGE 10 / 20",
        label: "URBAN STORAGE | HEAT ISLAND EFFECTS",
        icon: <Trees className="w-8 h-8 text-emerald-400" />,
        title: "Urban Heat Island Decay: High Heating In Metropolises",
        subtitle: "Asphalt and heavy concrete store immense solar radiation, baking millions of residents.",
        bullets: [
          "Lacking tree shade and crowded with AC units, inner cities average +3.0°C to +7.0°C higher than neighboring woods.",
          "Extreme thermal spikes load electricity dispatch systems with immense energy bills, hurting poor communities.",
          "Installing multi-tier urban tree crowns, parks, and vertical rooftop plants cools cities via physical shade and transpirational cooling."
        ],
        liveTitle: "🏙️ Metropolitan Heat Exposure Diagnose Index",
        liveStats: [
          { name: "Urban Extra Heat Stress", value: `+${(2.8 + tempIn2100 * 0.9).toFixed(1)} °C`, desc: "Consistent temperature excess compared to rural baselines" },
          { name: "Canopy Shade Defense Factor", value: reforestationRate > 2.5 ? "🛡️ Robust tree-cover vapor scattering cooling" : "⚠️ High vulnerability due to lack of municipal plant infrastructure" }
        ],
        footerQuote: "Tree shadows act as planetary umbrellas. Leaf evaporation absorbs massive kinetic heat before it hits concrete."
      },
      {
        id: 11,
        step: "PAGE 11 / 20",
        label: "REFLECTION DECAY | SOLAR INSOLATION",
        icon: <Info className="w-8 h-8 text-sky-300" />,
        title: "Polar Ice Sheets & Planetary Albedo Feedback Loops",
        subtitle: "Melting white glaciers expose deep blue ocean water, trapping over 90% of solar radiation.",
        bullets: [
          "Ice has a planetary Albedo of 0.8, reflecting most solar heat, while dark water's factor is barely 0.1.",
          "Losing sea ice starts a dangerous loop: 'Warming melts ice, exposing dark water, which absorbs more heat, melting more ice.'",
          "This runaway process causes the poles to heat up 3 to 4 times faster than the rest of the planet (Arctic Amplification)."
        ],
        liveTitle: "❄️ Global Solar Energy Reflective Index",
        liveStats: [
          { name: "Net Global Albedo Sinking Rate", value: `-${(3 + tempIn2100 * 2.8).toFixed(1)}%`, desc: "Meltdown of cryospheric reflectors increases ocean heat storage" },
          { name: "Ice-Free Summer Projection Yr", value: tempIn2100 > 2.2 ? "🚨 Warning: Ice-free summers likely by 2040" : "❇️ Ice-sheets largely stabilized under active scenario" }
        ],
        footerQuote: "Losing planetary solar mirrors turns a cool Earth into an efficient heat-absorber."
      },
      {
        id: 12,
        step: "PAGE 12 / 20",
        label: "ACIDIFYING SEAS | CORAL CRISIS",
        icon: <Waves className="w-8 h-8 text-blue-400" />,
        title: "Ocean Warming & Marine Acidification: Coral Bleaching",
        subtitle: "The world's oceans took in over 90% of human heat buildup and 30% of CO2 emissions.",
        bullets: [
          "Inhaled CO2 converts to carbonic acid, making oceans 30% more acidic than historical averages.",
          "Acidification strips carbonate ions from seawater, hampering crabs, oysters, and reefs from building shells.",
          "Compounded by marine heatwaves, global coral whitening triggers a catastrophic decline of marine food networks."
        ],
        liveTitle: "🐚 Seawater Chemical Stress Metrics",
        liveStats: [
          { name: "Estimated 2100 Ocean pH", value: (8.11 - (co2In2100 - 280) * 0.0007).toFixed(3), desc: "Down from 8.12 pre-industrial baseline, signaling massive stress" },
          { name: "Warm-Coral Reef Survival", value: tempIn2100 > 1.5 ? "🚨 Near Total Extirpation" : "🌱 Vulnerable but partially preserved" }
        ],
        footerQuote: "'When waters grow acidic, marine biodiversity struggles to anchor its critical habitats.'"
      },
      {
        id: 13,
        step: "PAGE 13 / 20",
        label: "PERMAFROST LOOPS | UNDERGROUND CO2",
        icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
        title: "Arctic Permafrost Thawing: The Sleeping Methane Giant",
        subtitle: "Northern frozen land traps twice as much carbon as our entire active atmosphere.",
        bullets: [
          "As high-latitude zones warm, deep frozen soils rot (thermokarst), releasing legacy organic matter.",
          "Decaying organic tissue in wetlands generates methane (CH4), holding 80x more greenhouse potential than CO2 over 20 years.",
          "Breaching permafrost limits risks releasing a carbon bomb, rendering human grid efforts obsolete."
        ],
        liveTitle: "🌋 Cryospheric Methane Outgassing Index",
        liveStats: [
          { name: "Permafrost Area Loss Est.", value: `${(tempIn2100 * 18.5).toFixed(1)}%`, desc: "Worrying ground collapse de-stabilizes local infrastructure" },
          { name: "Runaway Methane Release Risk", value: tempIn2100 > 2.0 ? "🚨 High Runway Risk" : "❇️ Managed within stable limits" }
        ],
        footerQuote: "Locked underground for millennia, organic carbon reserves are awakening as global heating expands."
      },
      {
        id: 14,
        step: "PAGE 14 / 20",
        label: "FOOD SECURITY | AGRICULTURAL DECORUM",
        icon: <AlertTriangle className="w-8 h-8 text-orange-400" />,
        title: "Global Harvest Failure: Desertification of Breadbaskets",
        subtitle: "Drastic heating spikes deplete agricultural soil moisture, hitting basic crops.",
        bullets: [
          "For every 1°C of mean heating, global corn, rice, and wheat yields decrease by 5% to 10%.",
          "Excessive heat causes rapid insect breeding and draws deep salts up, making farmland unusable.",
          "Food price spikes and supply breakdowns trigger severe crises, leading to geostrategic population migration."
        ],
        liveTitle: "🌾 Century Yield Contraction Prognosis",
        liveStats: [
          { name: "Major Breadbasket Fail Probability", value: `Approx. ${(tempIn2100 * 15).toFixed(0)}%`, desc: "Unprecedented drought cycles strike major soil fields" },
          { name: "Populations Facing Food Stress", value: tempIn2100 > 1.8 ? "🚨 Millions exposed globally" : "🛡️ Managed: food storage buffers absorb regional shocks" }
        ],
        footerQuote: "'Farmland degradation is the silent driver of historic geopolitical shifts.'"
      },
      {
        id: 15,
        step: "PAGE 15 / 20",
        label: "SWEETWATER LACK | RIVER DEPLETION",
        icon: <Sliders className="w-8 h-8 text-cyan-300" />,
        title: "The Water Stress Crisis: Disappearing Glacier Basins",
        subtitle: "Vast high-altitude glaciers feeding global rivers are rapidly melting away.",
        bullets: [
          "The Himalayas, Andes, and Alps supply billions of humans with reliable irrigation water during dry seasons.",
          "Initial glacier melt fuels flooding, followed by decades of river shrinkage and dry water tables.",
          "Over-pumped aquifers collapse, turning freshwater access into a primary source of geostrategic tension."
        ],
        liveTitle: "💧 Global Watershed Deficit Metric",
        liveStats: [
          { name: "Glacial Ice Reserve Remaining", value: `${(Math.max(10, 100 - tempIn2100 * 25)).toFixed(0)}%`, desc: "Severely shrunk, river flows diminish in dry seasons" },
          { name: "Major Basin Security Index", value: tempIn2100 > 2.1 ? "🚨 Severe water shortages" : "❇️ Stabilized: glacial melt slowed by mitigation" }
        ],
        footerQuote: "'The geostrategic disputes of the coming decades will be fought over freshwater, not crude oil.'"
      },
      {
        id: 16,
        step: "PAGE 16 / 20",
        label: "BIODIVERSITY LOSS | HABITAT FRAGMENT",
        icon: <Trees className="w-8 h-8 text-green-400" />,
        title: "The Sixth Mass Extinction: Ecosystem Unraveling",
        subtitle: "Warming shifting speeds are leaving wildlife species stranded with nowhere to go.",
        bullets: [
          "Warming forces species to migrate kilometers each year to track tolerable heat niches.",
          "Human highways, factories, and cities block these corridors, trapping wildlife in shrinking reserves.",
          "Collapsing key species (like active bees or soil fungi) disrupts natural carbon sequestration networks."
        ],
        liveTitle: "🐾 Species Extirpation Risk Estimator",
        liveStats: [
          { name: "Species Committed to Extinct", value: `${(tempIn2100 * 9.5).toFixed(1)}%`, desc: "Climate niches disappear entirely from historical zones" },
          { name: "Habitat Corridor Connection", value: reforestationRate < 3.0 ? "🚨 Fragmented wildlife paths" : "❇️ Forest corridor restoration is shielding migration paths" }
        ],
        footerQuote: "Ecosystem decay is a silent cascade. Losing key species weakens the entire carbon absorption network."
      },
      {
        id: 17,
        step: "PAGE 17 / 20",
        label: "BOREAL FIRES | INTENSE ATMOSPHERE",
        icon: <Flame className="w-8 h-8 text-red-500" />,
        title: "Boreal Wildfires: Runaway Smoke in Siberian Woods",
        subtitle: "Vast northern pine forests are drying out, releasing massive legacy carbon.",
        bullets: [
          "Dry conditions prompt intense fires, burning deep peatlands and releasing huge carbon loads.",
          "The intense 2023 Canadian fires released more carbon than entire national industrial outputs combined.",
          "Thick smoke billows south, clogging air quality across major industrial metropolises for weeks."
        ],
        liveTitle: "🔥 Boreal Forest Burn Rate & Outflow",
        liveStats: [
          { name: "Annual Core Boreal Forest Burned", value: `${(tempIn2100 * 2.8).toFixed(1)}x Increase`, desc: "Increased heat leaves woodlands dry and prone to lightning fires" },
          { name: "Forest Sinks Carbon Flipping", value: tempIn2100 > 1.9 ? "🚨 Forests become net emitters" : "❇️ Forests maintained as active carbon sinks" }
        ],
        footerQuote: "When primary carbon-storing forests turn into emitters, planetary carbon accounting becomes a challenge."
      },
      {
        id: 18,
        step: "PAGE 18 / 20",
        label: "THERMOHALINE SLIP | OCEAN TRANSPORT",
        icon: <Waves className="w-8 h-8 text-indigo-400" />,
        title: "大西洋海洋輸送帶：歐洲速凍與季風帶失衡",
        subtitle: "Freshwater runoff from Greenland threatens the Atlantic Thermohaline circulation.",
        bullets: [
          "The Atlantic Meridional Overturning Circulation (AMOC) distributes tropical warm waters to Northern Europe.",
          "Lighter freshwater disrupts the sinking warm salty water, slowing the oceanic circulation belt.",
          "A slowed AMOC risks dropping European temperatures and shifting seasonal monsoon rainfall bands."
        ],
        liveTitle: "🌀 AMOC Slowdown & Early Warning Indicators",
        liveStats: [
          { name: "Atlantic Overturning Velocity", value: `-${(tempIn2100 * 14.5).toFixed(1)}%`, desc: "Ocean conveyor belt is seeing a measurable slowdown in flow rates" },
          { name: "AMOC Tipping Failure Chance", value: tempIn2100 > 2.3 ? "🚨 High Risk: Century-end collapse possible" : "❇️ Safe: Current flow rates within historical bounds" }
        ],
        footerQuote: "Ocean currents distribute warmth. Stopping them alters weather patterns globally."
      },
      {
        id: 19,
        step: "PAGE 19 / 20",
        label: "GLOBAL HEALTH | CLIMATE FINANCE PACT",
        icon: <Coins className="w-8 h-8 text-yellow-500" />,
        title: "Climate Justice & Compensation: Resolving the Balance",
        subtitle: "Developing countries and low islands bear the brunt of storms but contributed least.",
        bullets: [
          "Industrialized nations built wealth using fossil fuels, while low-lying island nations lose space to live.",
          "The Loss and Damage Fund aims to redistribute capital to protect vulnerable communities from high tide rises.",
          "Your carbon fee of $${carbonTax} draws resources to finance dikes and defenses in cities under water rise threat."
        ],
        liveTitle: "💵 International Redistribution and Resilience Pool",
        liveStats: [
          { name: "Annual Adaptive Capital Raised", value: `$${(carbonTax * 4.5).toFixed(0)}B/Yr`, desc: "Drawn from global emission levies, instantly funding dike upgrades" },
          { name: "Island Inundation Delay Factor", value: carbonTax > 70 ? "🛡️ Solid: Flood resilience walls active" : "⚠️ Weak: Low-lying islands face forced evacuation risks" }
        ],
        footerQuote: "'Climate justice isn't a gift; it's a structural requirement for global geostrategic stability.'"
      },
      {
        id: 20,
        step: "PAGE 20 / 20",
        label: "DECISION & COVENANT | ACTION PLAN",
        icon: <FileText className="w-8 h-8 text-emerald-400" />,
        title: "Our Shared Global Covenant: Shielding the Earth",
        subtitle: "Trade passive ecological decay for an active climate adaptation pact.",
        bullets: [
          "Climate change is not an unstoppable fate. Every variable in this sandbox has real-world solutions that can be scaled today.",
          "Upgrading grids, implementing carbon tax, and shielding coastal cities are planetary survival requirements.",
          "Let us construct the ecological defenses required to withstand future storms starting in our own communities."
        ],
        liveTitle: "🖊️ Planetary Sustainability Treaty Signature",
        liveStats: [
          { name: "Signing Authority Status", value: signedPact ? "✅ PACT SIGNED | CLIMATE COALITION ACTIVE" : "❌ PENDING SIGNATURE", desc: signedPact ? "You have formally signed the planetary recovery compact" : "Please submit your email below to sign the pact" }
        ],
        footerQuote: "'The Earth provides enough to satisfy every man's need, but not every man's greed.' — Mahatma Gandhi"
      }
    ]
  };

  const activeSlide = slidesContent[lang][currentPage];

  return (
    <div className="bg-[#0D1016] border border-slate-800 rounded-sm shadow-2xl p-5 md:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto text-slate-100">
      
      {/* Presentation Navigation Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h2 className="text-sm font-extrabold tracking-widest text-[#00E5FF] uppercase font-mono">
              {lang === "zh-TW" ? "氣候變遷與適應沙盒 20頁巨型簡報" : "Climate Change & Policy Sandbox 20-Page Full Slide Deck"}
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            {lang === "zh-TW" 
              ? "動態讀取您在側邊欄配置的參數，為您客製化呈現 20 頁世紀末地球升溫命運與適應報告"
              : "Dynamically compiles active sandbox settings to generate a 20-page century's end adaptation report."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Autoplay Slider Controller */}
          <button
            onClick={() => setIsAutoplay(!isAutoplay)}
            className={`px-2.5 py-1.5 rounded-sm text-[10px] font-bold font-mono tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
              isAutoplay 
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" 
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title={lang === "zh-TW" ? "開啟/暫停自動輪播簡報頁面" : "Toggle Automatic Slideshow Playback"}
          >
            {isAutoplay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoplay ? (lang === "zh-TW" ? "暫停播送" : "AUTOPLAYING") : (lang === "zh-TW" ? "自動播放" : "AUTOPLAY")}</span>
          </button>

          {/* Traditional/English Language Toggle */}
          <div className="flex bg-[#07090C] border border-slate-800 p-0.5 rounded-sm select-none">
            {(["zh-TW", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded-sm text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                  lang === l
                    ? "bg-slate-800 text-emerald-400"
                    : "text-slate-500 hover:text-slate-400 bg-transparent"
                }`}
              >
                {l === "zh-TW" ? "繁體中文" : "English"}
              </button>
            ))}
          </div>

          {/* Copy Report Button */}
          <button
            onClick={handleCopyReport}
            className="px-2.5 py-1.5 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-900 text-indigo-300 rounded-sm text-[10px] font-bold tracking-wide cursor-pointer flex items-center gap-1.5 transition-all"
            title={lang === "zh-TW" ? "複製整份 20 頁簡報之 Markdown 完整草案" : "Copy full 20-slide deck as Markdown document"}
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400 animate-bounce" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? (lang === "zh-TW" ? "已複製簡報草案!" : "COPIED!") : (lang === "zh-TW" ? "導出簡報文字" : "EXPORT TEXT")}</span>
          </button>
          
          {/* Download PPTX Button */}
          <button
            onClick={handleDownloadPptx}
            className="px-2.5 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-900 text-emerald-300 rounded-sm text-[10px] font-bold tracking-wide cursor-pointer flex items-center gap-1.5 transition-all"
            title={lang === "zh-TW" ? "下載 20 頁 PowerPoint 簡報檔案" : "Download PPTX 20-slide deck"}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === "zh-TW" ? "下載 PPTX 檔案" : "DOWNLOAD PPTX"}</span>
          </button>
        </div>
      </div>

      {/* Embedded slide-autoplay linear bar loader */}
      {isAutoplay && (
        <div className="w-full h-1 bg-slate-900 rounded-sm overflow-hidden relative">
          <motion.div 
            className="h-full bg-gradient-to-r from-emerald-500 to-sky-500"
            style={{ width: `${autoplayProgress}%` }}
          />
        </div>
      )}

      {/* Main Slides Content Layout: Left Table of Contents Quick Links, Right Big Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Index Rail - Quick Jump */}
        <div className="lg:col-span-1 bg-[#090C11] border border-slate-850 p-3 rounded-sm space-y-2 select-none max-h-[640px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <span className="text-[10px] font-bold font-mono tracking-widest text-[#00E5FF] uppercase block mb-2 border-b border-slate-800 pb-1.5">
            {lang === "zh-TW" ? "簡報目錄 20 頁" : "Slide Navigation Index"}
          </span>
          <div className="grid grid-cols-5 lg:grid-cols-1 gap-1.5">
            {slidesContent[lang].map((slide, idx) => {
              const active = currentPage === idx;
              return (
                <button
                  key={slide.id}
                  onClick={() => {
                    setCurrentPage(idx);
                    setIsAutoplay(false);
                  }}
                  className={`px-2 py-1.5 rounded-xs text-[10.5px] font-medium text-left transition-all cursor-pointer block truncate ${
                    active
                      ? "bg-emerald-950/30 text-emerald-400 border border-emerald-900/50 shadow-inner font-bold"
                      : "bg-[#050608]/50 text-slate-400 border border-transparent hover:bg-slate-900/50 hover:text-slate-200"
                  }`}
                >
                  <span className="font-mono text-[9px] text-slate-500 mr-1.5">{(idx+1).toString().padStart(2, "0")}</span>
                  <span className="hidden lg:inline">{slide.title}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-850 hidden lg:block space-y-2 mt-4">
            <span className="text-[9px] text-slate-500 uppercase block font-mono">
              {lang === "zh-TW" ? "沙盒對接動態引數" : "ACTIVE SANDBOX ARGUMENTS"}
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono text-slate-400 bg-slate-950/50 p-2.5 rounded border border-slate-900">
              <div>減碳目標: <span className="text-emerald-400 font-bold">{co2TargetGoal}%</span></div>
              <div>太陽再生: <span className="text-sky-400 font-bold">{solarTransition}%</span></div>
              <div>植樹造林: <span className="text-emerald-400 font-bold">{reforestationRate}B</span></div>
              <div>碳稅定價: <span className="text-yellow-400 font-bold">${carbonTax}</span></div>
            </div>
          </div>
        </div>

        {/* Master Active Slide Canvas Presentation Screen */}
        <div className="lg:col-span-3 min-h-[480px] bg-[#11141A] border border-slate-800 rounded-sm p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Slide Meta Tag Header inside frame */}
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-widest bg-emerald-950/60 text-emerald-400 px-2.5 py-0.5 border border-emerald-900/40 rounded-sm font-bold">
                    {activeSlide.step}
                  </span>
                  <span className="text-[10.5px] font-bold font-mono tracking-widest text-[#00E5FF] uppercase">
                    {activeSlide.label}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {lang === "zh-TW" ? "IPCC 氣候政策沙盒投影系統" : "IPCC Climate Sandbox Platform"}
                </div>
              </div>

              {/* Slide Title */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {activeSlide.icon}
                  <h1 className="text-lg md:text-xl font-black text-slate-200 tracking-tight font-sans">
                    {activeSlide.title}
                  </h1>
                </div>
                <p className="text-[11.5px] text-slate-400 font-sans leading-relaxed pl-1">
                  {activeSlide.subtitle}
                </p>
              </div>

              {/* Core Bullets Points */}
              <div className="space-y-3 bg-[#0A0C11]/80 border border-slate-850 p-4 rounded-sm">
                {activeSlide.bullets.map((bullet, id) => (
                  <div key={id} className="flex items-start space-x-2 text-xs text-slate-300 leading-relaxed">
                    <span className="text-emerald-500 mt-1 shrink-0 font-mono">■</span>
                    <p className="font-sans">
                      {/* Dynamic replace templates in bullet strings if present */}
                      {bullet
                        .replace(/{co2TargetGoal}/g, co2TargetGoal.toString())
                        .replace(/{tempIn2100}/g, tempIn2100.toString())
                        .replace(/{seaIn2100}/g, seaIn2100.toString())
                        .replace(/{solarTransition}/g, solarTransition.toString())
                        .replace(/{reforestationRate}/g, reforestationRate.toString())}
                    </p>
                  </div>
                ))}
              </div>

              {/* Live compilation interactive calculations preview */}
              <div className="bg-slate-950/65 border border-slate-850 rounded-sm p-4 space-y-3">
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block border-b border-slate-800 pb-1">
                  {activeSlide.liveTitle}
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {activeSlide.liveStats.map((stat, id) => (
                    <div key={id} className="bg-[#0D1016]/80 p-2.5 rounded border border-slate-850 flex flex-col justify-between">
                      <span className="text-[9.5px] text-slate-500 truncate">{stat.name}</span>
                      <span className="text-sm md:text-md font-extrabold text-white tracking-tight mt-1 font-mono">
                        {stat.value}
                      </span>
                      <span className="text-[9px] text-[#00FF66] mt-0.5 leading-tight">
                        {stat.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive page-specific ending interactive block on Page 20 */}
              {currentPage === 19 && (
                <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/40 rounded-sm space-y-3 mt-4">
                  <span className="text-[10.5px] font-sans font-bold text-emerald-400 block">
                    {lang === "zh-TW" ? "✍️ 您的決定：一同加入永續行動宣誓同盟" : "✍️ Your Turn: Join the Sustainable Recovery Compact"}
                  </span>
                  
                  {!signedPact ? (
                    <form onSubmit={handleSignPact} className="flex gap-2">
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder={lang === "zh-TW" ? "輸入您的電子信箱認證地球承諾..." : "Enter your email to pledge carbon defense..."}
                        className="bg-[#050608] border border-slate-800 rounded-sm px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500 w-full font-mono placeholder:text-slate-600"
                        id="pledge-email-input"
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-sm text-xs transition-all cursor-pointer whitespace-nowrap align-middle"
                        id="btn-submit-pledge"
                      >
                        {lang === "zh-TW" ? "認證盟約" : "SIGN PACT"}
                      </button>
                    </form>
                  ) : (
                    <div className="text-xs text-emerald-400 font-sans flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
                      <span>
                        {lang === "zh-TW" 
                          ? `感謝簽署同盟！您的倡導防護信箱（${emailInput}）已記入世紀末生存聯盟協議，治理總評得分：${policyScore.toFixed(1)}分！` 
                          : `Thank you for pledging! Combined covenant signed for (${emailInput}) with overall safety score: ${policyScore.toFixed(1)}.`}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Core Footer Slides Controller Button Row */}
          <div className="border-t border-slate-850 pt-5 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-slate-800">
            <div className="text-xs text-slate-400 font-sans italic">
              {activeSlide.footerQuote}
            </div>

            <div className="flex items-center gap-2.5 select-none self-end">
              <button
                onClick={() => {
                  handlePrev();
                  setIsAutoplay(false);
                }}
                className="w-8 h-8 rounded-full border border-slate-800 bg-[#0A0C11] hover:bg-slate-900 border:active-slate-700 hover:border-slate-700 hover:text-white text-slate-400 flex items-center justify-center cursor-pointer transition-all"
                title={lang === "zh-TW" ? "回到上一頁" : "Back to Previous Slide"}
                id="btn-slide-prev"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-[11.5px] font-mono tracking-wider font-extrabold text-slate-300">
                {currentPage + 1} / {totalPages}
              </span>

              <button
                onClick={() => {
                  handleNext();
                  setIsAutoplay(false);
                }}
                className="w-8 h-8 rounded-full border border-slate-800 bg-[#0A0C11] hover:bg-slate-900 border:active-slate-700 hover:border-slate-700 hover:text-white text-slate-400 flex items-center justify-center cursor-pointer transition-all"
                title={lang === "zh-TW" ? "前進下一頁" : "Proceed to Next Slide"}
                id="btn-slide-next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
