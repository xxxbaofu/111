"""CLI entrypoint for Selection Radar v0.1."""

from __future__ import annotations

import argparse
import json
import logging
import sys

from apscheduler.schedulers.blocking import BlockingScheduler

from selection_radar.config import get_settings
from selection_radar.pipeline import SelectionRadarPipeline


def _run_stage(pipeline: SelectionRadarPipeline, stage: str) -> None:
    if stage == "collect":
        count = pipeline.run_data_collection()
        print(f"[collect] inserted raw posts: {count}")
    elif stage == "extract":
        count = pipeline.run_ai_extraction()
        print(f"[extract] inserted products: {count}")
    elif stage == "validate":
        count = pipeline.run_market_validation()
        print(f"[validate] upserted market records: {count}")
    elif stage == "score":
        count = pipeline.run_scoring_and_classification()
        print(f"[score] scored products: {count}")
    elif stage == "output":
        pipeline.write_outputs()
        print("[output] wrote report files into output directory")
    else:
        raise ValueError(f"Unsupported stage: {stage}")


def run_once(pipeline: SelectionRadarPipeline) -> None:
    for stage in ("collect", "extract", "validate", "score", "output"):
        _run_stage(pipeline, stage)


def run_daily_scheduler(pipeline: SelectionRadarPipeline) -> None:
    scheduler = BlockingScheduler()
    # 00:00 抓数据
    scheduler.add_job(lambda: _run_stage(pipeline, "collect"), "cron", hour=0, minute=0)
    # 00:10 AI提取
    scheduler.add_job(lambda: _run_stage(pipeline, "extract"), "cron", hour=0, minute=10)
    # 00:20 验证市场
    scheduler.add_job(lambda: _run_stage(pipeline, "validate"), "cron", hour=0, minute=20)
    # 00:30 打分
    scheduler.add_job(lambda: _run_stage(pipeline, "score"), "cron", hour=0, minute=30)
    # 00:40 输出
    scheduler.add_job(lambda: _run_stage(pipeline, "output"), "cron", hour=0, minute=40)
    print("Scheduler started. Jobs at 00:00/00:10/00:20/00:30/00:40 every day.")
    scheduler.start()


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Selection Radar v0.1")
    parser.add_argument(
        "--mode",
        choices=["run-once", "schedule", "stage"],
        default="run-once",
        help="run-once: full pipeline once; schedule: daily scheduler; stage: run one stage.",
    )
    parser.add_argument(
        "--stage",
        choices=["collect", "extract", "validate", "score", "output"],
        default="collect",
        help="When --mode stage, select stage to run.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    args = parse_args(argv or sys.argv[1:])
    settings = get_settings()
    pipeline = SelectionRadarPipeline(settings)

    if args.mode == "run-once":
        summary = pipeline.run_all()
        print(json.dumps(summary, ensure_ascii=False))
    elif args.mode == "schedule":
        run_daily_scheduler(pipeline)
    else:
        _run_stage(pipeline, args.stage)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
