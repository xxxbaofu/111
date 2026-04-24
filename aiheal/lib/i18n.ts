"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import React from "react";

export type Locale = "zh" | "en";

type Dict = Record<string, string>;

const zh: Dict = {
  "nav.home": "首页",
  "nav.product": "产品",
  "nav.demo": "示例报告",
  "nav.scenarios": "场景",
  "nav.technology": "技术",
  "nav.download": "下载",
  "nav.developers": "开发者",
  "nav.cta": "立即体验",

  "hero.eyebrow": "AI 健康管家 · Personal Health Copilot",
  "hero.title": "用数据理解你的身体，而不是猜",
  "hero.sub":
    "自动分析你的健康数据，发现潜在风险，并生成可执行的日常建议。不止是记录，而是解读。",
  "hero.primary": "立即体验",
  "hero.secondary": "查看示例报告",
  "hero.badge1": "无需登录即可查看 Demo",
  "hero.badge2": "60 秒生成首份报告",
  "hero.badge3": "端侧加密 · 数据归你所有",

  "core.eyebrow": "核心功能",
  "core.title": "不是冷冰冰的数字，而是能被理解的身体",
  "core.f1.title": "健康评分",
  "core.f1.desc": "实时生成你当前的健康状态评分，一眼看懂身体信号。",
  "core.f2.title": "趋势分析",
  "core.f2.desc": "长期追踪睡眠、心率、活动量与压力变化，发现被忽略的规律。",
  "core.f3.title": "AI 报告",
  "core.f3.desc": "自动发现风险，给出可以今天就执行的健康建议。",

  "demo.eyebrow": "示例报告",
  "demo.title": "这是你今天身体真正的样子",
  "demo.sub":
    "每份报告包含健康评分、关键发现、风险提示、AI 解读、行动建议与长期趋势。",
  "demo.score.label": "健康评分",
  "demo.score.state": "状态：良好",
  "demo.findings": "关键发现",
  "demo.finding1": "睡眠质量下降",
  "demo.finding2": "夜间心率偏高",
  "demo.finding3": "活动量较上周减少 18%",
  "demo.risk": "风险提示",
  "demo.risk.body": "近期可能存在疲劳累积风险，若持续 7 天需要主动干预。",
  "demo.analysis": "AI 分析",
  "demo.analysis.body":
    "你的睡眠时长减少，同时夜间心率偏高，可能与压力或作息不规律有关。",
  "demo.actions": "行动建议",
  "demo.action1": "提前 30 分钟入睡",
  "demo.action2": "减少晚间蓝光暴露",
  "demo.action3": "增加 15 分钟轻度运动",
  "demo.trend": "趋势",
  "demo.cta": "生成我的专属报告",

  "uc.eyebrow": "使用场景",
  "uc.title": "无论是打工人、父母还是健身党，它都懂你",
  "uc.office.title": "打工人",
  "uc.office.desc": "睡眠差但找不到原因？AI 分析背后的压力、心率与作息模式。",
  "uc.family.title": "家庭健康",
  "uc.family.desc": "父母健康数据出现异常时，第一时间推送提醒，而不是事后补救。",
  "uc.fitness.title": "健身用户",
  "uc.fitness.desc": "基于恢复度与心率区间，优化训练强度与周期。",
  "uc.chronic.title": "慢性管理",
  "uc.chronic.desc": "长期跟踪血压、血糖等指标，辅助观察干预效果。",

  "ds.eyebrow": "数据来源",
  "ds.title": "连接你已有的健康世界",
  "ds.sub": "不需要新硬件。你现在戴的、用的、测的，都能成为它的输入。",
  "ds.apple": "Apple Health",
  "ds.device": "智能设备",
  "ds.manual": "手动录入",
  "ds.medical": "医疗报告",

  "cta.title": "下载 AIHeal，60 秒读懂你的身体",
  "cta.sub": "无需填写问卷，连接数据即可生成你的第一份 AI 健康报告。",
  "cta.primary": "下载 App",
  "cta.secondary": "查看示例报告",

  "infra.eyebrow": "Infrastructure",
  "infra.title": "Personal Health AI Infrastructure",
  "infra.sub": "一套面向个人健康的 AI 基础设施：数据归你所有，智能为你所用。",
  "infra.sovereignty.title": "数据主权",
  "infra.sovereignty.desc": "数据属于用户，端到端加密，你随时可以导出或删除。",
  "infra.privacy.title": "隐私保护",
  "infra.privacy.desc": "核心分析在设备侧进行，敏感数据不上传云端。",
  "infra.decentral.title": "去中心化",
  "infra.decentral.desc": "基于可验证的分布式计算，降低单点数据风险。",
  "infra.model.title": "健康专用模型",
  "infra.model.desc": "针对健康场景训练与评估，不是通用 LLM 的副产品。",

  "dev.eyebrow": "Developers",
  "dev.title": "为健康应用提供的 AI 能力",
  "dev.sub": "通过 API、Agent 与 SDK，把健康 AI 能力接入你的产品。",
  "dev.api": "开放 API",
  "dev.agent": "健康 Agent",
  "dev.sdk": "移动端 SDK",
  "dev.entry": "查看开发者文档",

  "footer.product": "产品",
  "footer.company": "公司",
  "footer.resources": "资源",
  "footer.legal": "合规",
  "footer.rights": "© 2026 AIHeal · All rights reserved",
  "footer.privacy": "隐私政策",
  "footer.terms": "服务条款",
  "footer.tag": "让数据开始理解你",

  // Product page
  "product.eyebrow": "产品总览",
  "product.title": "一个能真正看懂你身体的 AI 管家",
  "product.sub": "从瞬时快照到长期趋势，再到 AI 解读与行动建议，形成完整闭环。",
  "product.snapshot.title": "健康快照",
  "product.snapshot.desc": "每日自动生成当前状态概要：评分、风险、建议。",
  "product.trend.title": "趋势追踪",
  "product.trend.desc": "睡眠、心率、活动、压力、恢复的长期变化曲线。",
  "product.report.title": "AI 报告",
  "product.report.desc": "用自然语言解释数据背后发生了什么、为什么、怎么做。",
  "product.compare.title": "与传统记录工具的差异",
  "product.compare.col1": "传统健康 App",
  "product.compare.col2": "AIHeal",
  "product.compare.row1.a": "展示数据",
  "product.compare.row1.b": "解读数据",
  "product.compare.row2.a": "用户自己判断",
  "product.compare.row2.b": "AI 自动发现风险",
  "product.compare.row3.a": "分散指标",
  "product.compare.row3.b": "统一健康评分",
  "product.compare.row4.a": "模糊建议",
  "product.compare.row4.b": "可执行建议",

  // Demo page
  "demopage.title": "示例报告",
  "demopage.sub": "这是一个真实结构的 Demo，未登录也可查看。",
  "demopage.logic.title": "分析逻辑",
  "demopage.logic.desc":
    "综合睡眠、心率、活动、压力等多维信号，结合个体基线，给出相对偏差而非固定阈值。",
  "demopage.risk.title": "风险检测",
  "demopage.risk.desc":
    "识别短期异常（急性风险）与长期偏离（慢性风险），并标注置信度。",
  "demopage.plan.title": "行动计划",
  "demopage.plan.desc": "把抽象建议拆成今天就能做的三件小事。",

  // Scenarios page
  "scenarios.title": "为真实的人而设计",
  "scenarios.sub": "不是大而全，而是精准解决每一类人群的核心健康问题。",

  // Technology page
  "tech.title": "个人健康 AI 的底层架构",
  "tech.sub": "把健康数据的主权重新交还给个人。",
  "tech.ownership.title": "数据主权",
  "tech.ownership.desc":
    "所有原始数据由用户自身持有，平台不构建任何二次数据资产。",
  "tech.privacy.title": "隐私保护",
  "tech.privacy.desc":
    "端侧推理 + 差分隐私 + 可选加密上云，按需粒度选择。",
  "tech.model.title": "健康 AI 模型",
  "tech.model.desc":
    "专为生理与行为信号训练，具备可解释输出与置信度评估。",
  "tech.decentral.title": "去中心化",
  "tech.decentral.desc":
    "采用可验证计算，避免平台单点掌控，长期降低监管与迁移成本。",

  // Download page
  "download.title": "立即下载 AIHeal",
  "download.sub": "支持 iOS 与 Android，连接你已有的设备。",
  "download.ios": "iOS 下载",
  "download.android": "Android 下载",
  "download.qr": "扫码下载",

  // Developers page
  "devs.title": "为开发者打造的健康 AI 能力",
  "devs.sub": "把评分、趋势、风险检测与行动建议接入你自己的产品。",
  "devs.api.title": "API",
  "devs.api.desc":
    "REST / gRPC 接口，支持结构化健康数据输入与解释性输出。",
  "devs.agent.title": "Agent",
  "devs.agent.desc":
    "可编排的健康 Agent，用于随访、提醒、数据解读等场景。",
  "devs.sdk.title": "SDK",
  "devs.sdk.desc": "iOS / Android / Web SDK，几行代码接入健康评分。",
};

const en: Dict = {
  "nav.home": "Home",
  "nav.product": "Product",
  "nav.demo": "Demo",
  "nav.scenarios": "Scenarios",
  "nav.technology": "Technology",
  "nav.download": "Download",
  "nav.developers": "Developers",
  "nav.cta": "Get Started",

  "hero.eyebrow": "Your AI Health Copilot",
  "hero.title": "Understand your body through data, not guesswork",
  "hero.sub":
    "AI analyzes your health signals, detects risks, and generates actionable insights for everyday wellbeing.",
  "hero.primary": "Get Started",
  "hero.secondary": "See a sample report",
  "hero.badge1": "Demo without signup",
  "hero.badge2": "First report in 60 seconds",
  "hero.badge3": "On-device encryption · you own the data",

  "core.eyebrow": "Core features",
  "core.title": "Not another dashboard of numbers — a body you can understand",
  "core.f1.title": "Health Score",
  "core.f1.desc":
    "A single number that captures how your body is doing right now.",
  "core.f2.title": "Trend Tracking",
  "core.f2.desc":
    "Follow sleep, heart rate, activity and stress over time — see the patterns.",
  "core.f3.title": "AI Report",
  "core.f3.desc":
    "AI surfaces risks and gives you actions you can actually take today.",

  "demo.eyebrow": "Sample report",
  "demo.title": "What your body actually looks like today",
  "demo.sub":
    "Every report includes a score, key findings, risks, AI analysis, actions, and long-term trends.",
  "demo.score.label": "Health Score",
  "demo.score.state": "Status: Good",
  "demo.findings": "Key findings",
  "demo.finding1": "Sleep quality declined",
  "demo.finding2": "Elevated nighttime heart rate",
  "demo.finding3": "Activity down 18% vs last week",
  "demo.risk": "Risk",
  "demo.risk.body":
    "Potential fatigue build-up — intervention needed if this continues for 7 days.",
  "demo.analysis": "AI analysis",
  "demo.analysis.body":
    "Shorter sleep combined with higher nighttime heart rate often signals stress or inconsistent schedule.",
  "demo.actions": "Actions",
  "demo.action1": "Go to bed 30 minutes earlier",
  "demo.action2": "Cut evening blue light",
  "demo.action3": "Add 15 min of light movement",
  "demo.trend": "Trend",
  "demo.cta": "Generate my report",

  "uc.eyebrow": "Use cases",
  "uc.title": "Built for real people with real routines",
  "uc.office.title": "Office workers",
  "uc.office.desc":
    "Bad sleep with no clear reason? AI connects stress, HR and schedule.",
  "uc.family.title": "Family health",
  "uc.family.desc":
    "Get notified when a parent's baseline starts to drift — not after.",
  "uc.fitness.title": "Fitness users",
  "uc.fitness.desc": "Tune training load using recovery and HR zones.",
  "uc.chronic.title": "Chronic conditions",
  "uc.chronic.desc":
    "Track blood pressure, glucose and more to observe interventions.",

  "ds.eyebrow": "Data sources",
  "ds.title": "Works with the health data you already have",
  "ds.sub":
    "No new hardware required. What you already wear, measure and record becomes its input.",
  "ds.apple": "Apple Health",
  "ds.device": "Smart devices",
  "ds.manual": "Manual entries",
  "ds.medical": "Medical reports",

  "cta.title": "Download AIHeal and read your body in 60 seconds",
  "cta.sub":
    "No forms. Just connect your data and get your first AI health report.",
  "cta.primary": "Download App",
  "cta.secondary": "See sample report",

  "infra.eyebrow": "Infrastructure",
  "infra.title": "Personal Health AI Infrastructure",
  "infra.sub":
    "An AI stack built for personal health. Your data belongs to you — intelligence works for you.",
  "infra.sovereignty.title": "Data sovereignty",
  "infra.sovereignty.desc":
    "Data is owned by the user, end-to-end encrypted, exportable and deletable.",
  "infra.privacy.title": "Privacy by design",
  "infra.privacy.desc":
    "Core analysis runs on-device. Sensitive signals never need to leave.",
  "infra.decentral.title": "Decentralized",
  "infra.decentral.desc":
    "Verifiable distributed computation reduces single-point data risk.",
  "infra.model.title": "Health-specific AI",
  "infra.model.desc":
    "Models trained and evaluated for health — not a general LLM side-effect.",

  "dev.eyebrow": "Developers",
  "dev.title": "Health AI for the apps you build",
  "dev.sub":
    "Plug health intelligence into your product via API, Agent and SDK.",
  "dev.api": "Open API",
  "dev.agent": "Health Agent",
  "dev.sdk": "Mobile SDK",
  "dev.entry": "Read developer docs",

  "footer.product": "Product",
  "footer.company": "Company",
  "footer.resources": "Resources",
  "footer.legal": "Legal",
  "footer.rights": "© 2026 AIHeal · All rights reserved",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms",
  "footer.tag": "Let your data understand you",

  "product.eyebrow": "Product overview",
  "product.title": "An AI copilot that actually understands your body",
  "product.sub":
    "From snapshot to trend to AI interpretation to action — an end-to-end loop.",
  "product.snapshot.title": "Health snapshot",
  "product.snapshot.desc":
    "A daily summary of where you stand: score, risks and next actions.",
  "product.trend.title": "Trend tracking",
  "product.trend.desc":
    "Long-term curves of sleep, HR, activity, stress and recovery.",
  "product.report.title": "AI report",
  "product.report.desc":
    "Natural-language explanation of what happened, why and what to do.",
  "product.compare.title": "How we differ from trackers",
  "product.compare.col1": "Traditional apps",
  "product.compare.col2": "AIHeal",
  "product.compare.row1.a": "Show data",
  "product.compare.row1.b": "Interpret data",
  "product.compare.row2.a": "User figures it out",
  "product.compare.row2.b": "AI finds risks automatically",
  "product.compare.row3.a": "Scattered metrics",
  "product.compare.row3.b": "Unified health score",
  "product.compare.row4.a": "Vague suggestions",
  "product.compare.row4.b": "Actionable steps",

  "demopage.title": "Sample report",
  "demopage.sub": "A real report structure — viewable without login.",
  "demopage.logic.title": "Analysis logic",
  "demopage.logic.desc":
    "Combines sleep, HR, activity and stress against your own baseline — relative deviation, not fixed thresholds.",
  "demopage.risk.title": "Risk detection",
  "demopage.risk.desc":
    "Identifies acute (short-term) and chronic (long-term) deviations, each scored with confidence.",
  "demopage.plan.title": "Action plan",
  "demopage.plan.desc": "Breaks advice into three things you can do today.",

  "scenarios.title": "Designed for real humans",
  "scenarios.sub":
    "Not one-size-fits-all — precise answers for each audience.",

  "tech.title": "The foundation of Personal Health AI",
  "tech.sub": "Health data sovereignty, handed back to the individual.",
  "tech.ownership.title": "Data ownership",
  "tech.ownership.desc":
    "Raw data stays with the user. We build no secondary data asset.",
  "tech.privacy.title": "Privacy",
  "tech.privacy.desc":
    "On-device inference + differential privacy + optional encrypted sync.",
  "tech.model.title": "Health AI model",
  "tech.model.desc":
    "Built for physiological and behavioral signals, with explainable output.",
  "tech.decentral.title": "Decentralization",
  "tech.decentral.desc":
    "Verifiable computation avoids platform lock-in and single-point control.",

  "download.title": "Download AIHeal",
  "download.sub": "Available for iOS and Android. Works with your devices.",
  "download.ios": "Download for iOS",
  "download.android": "Download for Android",
  "download.qr": "Scan to download",

  "devs.title": "Health AI for developers",
  "devs.sub":
    "Integrate score, trend, risk detection and actions into your product.",
  "devs.api.title": "API",
  "devs.api.desc":
    "REST / gRPC endpoints with structured health inputs and explainable outputs.",
  "devs.agent.title": "Agent",
  "devs.agent.desc":
    "Composable health agents for follow-ups, reminders and data reasoning.",
  "devs.sdk.title": "SDK",
  "devs.sdk.desc":
    "iOS / Android / Web SDKs — drop in a health score in a few lines.",
};

const dictionaries: Record<Locale, Dict> = { zh, en };

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("aiheal.locale") as Locale | null;
      if (saved === "zh" || saved === "en") {
        setLocaleState(saved);
        return;
      }
      const nav = navigator.language || "";
      setLocaleState(nav.toLowerCase().startsWith("zh") ? "zh" : "en");
    } catch {
      // noop
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem("aiheal.locale", l);
    } catch {
      // noop
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[locale];
    return {
      locale,
      setLocale,
      t: (key: string) => dict[key] ?? key,
    };
  }, [locale, setLocale]);

  return React.createElement(I18nContext.Provider, { value }, children);
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
