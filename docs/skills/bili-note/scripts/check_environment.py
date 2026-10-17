#!/usr/bin/env python3
"""Check Bili Note runtime dependencies and optional extraction paths."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
import urllib.request
from pathlib import Path
from typing import Any, Callable


SCRIPT_DIR = Path(__file__).resolve().parent

REQUIRED_SCRIPTS = (
    "run_bili_note.py",
    "extract_bilibili.py",
    "extract_bilibili_opus.py",
    "extract_video_keyframes.py",
    "archive_bili_materials.py",
    "score_bili_note.py",
    "update_note_budget_section.py",
    "check_environment.py",
)

def python_status() -> dict[str, Any]:
    version = ".".join(str(part) for part in sys.version_info[:3])
    return {
        "ok": sys.version_info >= (3, 10),
        "version": version,
        "required": ">=3.10",
    }


def scripts_status(script_dir: Path = SCRIPT_DIR) -> dict[str, Any]:
    missing = [name for name in REQUIRED_SCRIPTS if not (script_dir / name).exists()]
    return {
        "ok": not missing,
        "script_dir": str(script_dir),
        "missing": missing,
    }


def command_status(name: str, which: Callable[[str], str | None] = shutil.which) -> dict[str, Any]:
    path = which(name)
    return {"ok": bool(path), "path": path}


def gateway_key_status() -> dict[str, Any]:
    # Only report presence; never echo the key.
    return {"ok": bool(os.environ.get("MY_API_KEY", "").strip()), "env": "MY_API_KEY"}


def check_bilibili_api(api_url: str = "https://api.bilibili.com/x/web-interface/nav", timeout: float = 1.5) -> dict[str, Any]:
    try:
        req = urllib.request.Request(
            api_url,
            headers={
                "Accept": "application/json",
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
                ),
            },
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
        data = json.loads(raw or "{}")
    except Exception as exc:
        return {
            "ok": False,
            "reachable": False,
            "url": api_url,
            "error": type(exc).__name__,
            "message": str(exc),
        }

    return {
        "ok": isinstance(data, dict) and "code" in data,
        "reachable": True,
        "url": api_url,
        "code": data.get("code") if isinstance(data, dict) else None,
        "message": data.get("message") if isinstance(data, dict) else None,
    }


def evaluate_environment(
    script_dir: Path = SCRIPT_DIR,
    which: Callable[[str], str | None] = shutil.which,
    api_check: Callable[[str, float], dict[str, Any]] = check_bilibili_api,
    key_check: Callable[[], dict[str, Any]] = gateway_key_status,
    api_url: str = "https://api.bilibili.com/x/web-interface/nav",
    timeout: float = 1.5,
) -> dict[str, Any]:
    python = python_status()
    scripts = scripts_status(script_dir)
    commands = {"ffmpeg": command_status("ffmpeg", which)}
    bilibili_api = api_check(api_url, timeout)
    gateway_key = key_check()

    core_ok = bool(python["ok"] and scripts["ok"])
    public_route_ok = bool(core_ok and bilibili_api.get("ok"))
    media_ok = bool(core_ok and commands["ffmpeg"]["ok"] and gateway_key["ok"])

    capabilities = {
        "core": {
            "ok": core_ok,
            "needs": ["Python >=3.10", "bundled Bili Note scripts"],
        },
        "public_subtitles_comments_archive": {
            "ok": public_route_ok,
            "needs": ["network access to Bilibili public APIs and public opus pages"],
            "bilibili_api": bilibili_api,
            "python_packages": "stdlib only",
        },
        "audio_transcription": {
            "ok": media_ok,
            "needs": ["ffmpeg", "MY_API_KEY for the share-link and OpenRouter gateways"],
            "note": "Video comes from the share-link gateway; audio goes to microsoft/mai-transcribe-2.",
        },
        "keyframe_visual_review": {
            "ok": media_ok,
            "needs": ["ffmpeg", "MY_API_KEY for the share-link gateway", "a vision-capable model for interpretation"],
            "note": "The runner creates one 4x3 contact sheet with up to 12 representative frames; visual interpretation is performed by the active Agent.",
        },
    }

    recommendations: list[str] = []
    if not python["ok"]:
        recommendations.append(f"Use Python {python['required']}; current version is {python['version']}.")
    if not scripts["ok"]:
        recommendations.append("Download the missing scripts into the same directory.")
    if core_ok and not bilibili_api.get("ok"):
        recommendations.append("Check network access to Bilibili public APIs before running the default extraction path.")
    if core_ok and not commands["ffmpeg"]["ok"]:
        recommendations.append("Install ffmpeg before using audio transcription or keyframe visual review.")
    if core_ok and not gateway_key["ok"]:
        recommendations.append("Load MY_API_KEY from .env before using audio transcription or keyframe visual review.")

    return {
        "python": python,
        "scripts": scripts,
        "commands": commands,
        "gateway_key": gateway_key,
        "bilibili_api": bilibili_api,
        "capabilities": capabilities,
        "recommendations": recommendations,
    }


def mark(ok: bool) -> str:
    return "OK" if ok else "MISSING"


def print_human(report: dict[str, Any]) -> None:
    capabilities = report["capabilities"]
    print("Bili Note environment check")
    print("")
    print(f"- Core workflow: {mark(capabilities['core']['ok'])}")
    print(f"  Python: {report['python']['version']} (required {report['python']['required']})")
    if report["scripts"]["missing"]:
        print(f"  Missing scripts: {', '.join(report['scripts']['missing'])}")
    else:
        print("  Bundled scripts: OK")
    print(f"- Public subtitles/opus/comments/archive: {mark(capabilities['public_subtitles_comments_archive']['ok'])}")
    api = capabilities["public_subtitles_comments_archive"]["bilibili_api"]
    print(f"  Bilibili API: {'reachable' if api.get('reachable') else 'not reachable'}")
    print("  Python packages: stdlib only")
    print(f"- Audio transcription: {mark(capabilities['audio_transcription']['ok'])}")
    print(f"- Keyframe visual review: {mark(capabilities['keyframe_visual_review']['ok'])}")
    print(f"  ffmpeg: {mark(report['commands']['ffmpeg']['ok'])}")
    print(f"  MY_API_KEY: {mark(report['gateway_key']['ok'])}")

    if report["recommendations"]:
        print("")
        print("Recommendations")
        for item in report["recommendations"]:
            print(f"- {item}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON")
    parser.add_argument("--strict", action="store_true", help="Exit non-zero when the core workflow is unavailable")
    parser.add_argument("--api-url", default="https://api.bilibili.com/x/web-interface/nav", help="Bilibili public API probe endpoint")
    parser.add_argument("--timeout", type=float, default=1.5, help="Bilibili API probe timeout in seconds")
    args = parser.parse_args()

    report = evaluate_environment(api_url=args.api_url, timeout=args.timeout)
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print_human(report)

    if args.strict and not report["capabilities"]["core"]["ok"]:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
