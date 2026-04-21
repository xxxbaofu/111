"""AI explanation service for decision output."""

from __future__ import annotations

import json
from typing import Any

from openai import OpenAI

from app.config import get_settings


def build_ai_explanation(payload: dict[str, Any]) -> dict[str, Any]:
    settings = get_settings()
    if not settings.openai_api_key:
        return _fallback(payload)

    prompt = (
        "你是跨境数据操作系统的决策助理。请输出中文JSON，字段为：\n"
        '{\n'
        '  "结论": "建议测试/观望/不建议",\n'
        '  "原因": ["原因1","原因2","原因3"],\n'
        '  "打法": "如何卖",\n'
        '  "预算": "$20/day",\n'
        '  "风险": "主要风险"\n'
        "}\n\n"
        f"输入数据：{json.dumps(payload, ensure_ascii=False)}"
    )
    try:
        client = OpenAI(api_key=settings.openai_api_key)
        resp = client.responses.create(model=settings.openai_model, input=prompt)
        text = (resp.output_text or "").strip()
        if text:
            return json.loads(text)
    except Exception:
        pass
    return _fallback(payload)


def _fallback(payload: dict[str, Any]) -> dict[str, Any]:
    score = float(payload.get("score", 0))
    conclusion = "建议测试" if score >= 70 else "观望" if score >= 55 else "不建议"
    return {
        "结论": conclusion,
        "原因": [
            f"当前综合评分为 {score:.1f}/100，具备基础决策参考价值。",
            "热度、增长、讨论、竞争与广告增长已纳入统一模型。",
            "建议先做小预算验证，再根据转化反馈调整策略。",
        ],
        "打法": "先用短视频素材做场景化测试，验证点击率和转化率。",
        "预算": "$20/day",
        "风险": "同质化竞争和广告成本上升是主要风险。",
    }
