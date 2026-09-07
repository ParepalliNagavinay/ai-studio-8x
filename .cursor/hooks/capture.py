#!/usr/bin/env python3
"""Automatic prompt/response capture for the 8x assignment.

Writes only the user prompt and the final assistant reply to .agent-logs/.
Does not record thinking, tool calls, or intermediate steps.
"""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

AUTHOR = "ParepalliNagavinay"
PROJECT = "azaisai-rebuild"
TOOL = "cursor"


def utc_now() -> str:
    dt = datetime.now(timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%S.") + f"{dt.microsecond // 1000:03d}Z"


def utc_date() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def utc_stamp_for_filename() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d_%H-%M-%S")


def read_payload() -> dict:
    raw = sys.stdin.buffer.read()
    if raw.startswith(b"\xff\xfe") or raw.startswith(b"\xfe\xff"):
        text = raw.decode("utf-16", errors="replace")
    else:
        if raw.startswith(b"\xef\xbb\xbf"):
            raw = raw[3:]
        text = raw.decode("utf-8", errors="replace")
    text = text.lstrip("\ufeff").strip()
    if not text:
        return {}
    return json.loads(text)


def coerce_workspace_path(raw: str) -> Path | None:
    """Cursor on Windows sends Electron-style roots like `/C:/Users/...`."""
    s = (raw or "").strip()
    if not s:
        return None
    if s.startswith("file://"):
        s = s[7:]
    s = s.replace("\\", "/")
    match = re.match(r"^/([A-Za-z]:.*)$", s)
    if match:
        s = match.group(1)
    try:
        path = Path(s)
        if path.exists():
            return path.resolve()
        if path.drive:
            return path
    except OSError:
        return None
    return None


def workspace_root(payload: dict) -> Path:
    fallback = Path(__file__).resolve().parents[2]
    for raw in payload.get("workspace_roots") or []:
        path = coerce_workspace_path(str(raw))
        if path is not None:
            return path
    return fallback


def session_id(payload: dict) -> str:
    return (
        payload.get("conversation_id")
        or payload.get("session_id")
        or "unknown-session"
    )


def model_name(payload: dict) -> str:
    return payload.get("model_id") or payload.get("model") or "unknown-model"


def short_id(full: str) -> str:
    return full.split("-")[0] if full else "unknown"


def state_paths(root: Path, sid: str) -> tuple[Path, Path]:
    state_dir = root / ".cursor" / "hooks" / "state"
    state_dir.mkdir(parents=True, exist_ok=True)
    return state_dir / f"{sid}.json", state_dir / "hook-debug.jsonl"


def load_state(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def save_state(path: Path, state: dict) -> None:
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, indent=2), encoding="utf-8")
    tmp.replace(path)


def debug(path: Path, payload: dict) -> None:
    try:
        event = payload.get("hook_event_name")
        slim = {
            "ts": utc_now(),
            "event": event,
            "conversation_id": payload.get("conversation_id") or payload.get("session_id"),
            "model": model_name(payload),
            "has_prompt": "prompt" in payload,
            "text_len": len(payload.get("text") or ""),
            "transcript_path": payload.get("transcript_path"),
            "status": payload.get("status"),
        }
        with path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(slim) + "\n")
    except OSError:
        pass


def frontmatter(state: dict) -> str:
    return (
        "---\n"
        f"session_id: {state['session_id']}\n"
        f"date: {state['date']}\n"
        f"author: {AUTHOR}\n"
        f"model: {state.get('model') or 'unknown-model'}\n"
        f"tool: {TOOL}\n"
        f"project: {PROJECT}\n"
        f"total_exchanges: {state.get('total_exchanges', 0)}\n"
        f"first_prompt_time: {state.get('first_prompt_time') or ''}\n"
        f"last_prompt_time: {state.get('last_prompt_time') or ''}\n"
        "---\n"
    )


def header(state: dict) -> str:
    sid = short_id(state["session_id"])
    date = state["date"]
    return (
        f"\n# Session Log - {date}\n\n"
        f"Session: `{sid}` | Project: `{PROJECT}` | Author: `{AUTHOR}`\n\n"
        "---\n"
    )


def ensure_log(root: Path, state: dict) -> Path:
    logs = root / ".agent-logs"
    logs.mkdir(parents=True, exist_ok=True)
    log_path = state.get("log_path")
    if log_path and Path(log_path).exists():
        return Path(log_path)
    fname = f"{utc_stamp_for_filename()}_{state['session_id']}.md"
    path = logs / fname
    state["log_path"] = str(path)
    state.setdefault("date", utc_date())
    path.write_text(frontmatter(state) + header(state), encoding="utf-8")
    return path


def rewrite_frontmatter(path: Path, state: dict) -> None:
    text = path.read_text(encoding="utf-8")
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            rest = text[end + 4 :]
            path.write_text(frontmatter(state) + rest, encoding="utf-8")
            return
    path.write_text(frontmatter(state) + "\n" + text, encoding="utf-8")


def append_entry(
    path: Path,
    *,
    entry_type: str,
    num: int,
    sid: str,
    timestamp: str,
    model: str,
    body: str,
) -> None:
    short = short_id(sid)
    block = (
        f"\n[LOG_ENTRY type={entry_type} num={num} session={short}]\n"
        f"timestamp: {timestamp}\n"
        f"model: {model}\n\n"
        f"{body.rstrip()}\n\n"
    )
    with path.open("a", encoding="utf-8") as fh:
        fh.write(block)


def extract_user_query(text: str) -> str:
    match = re.search(r"<user_query>\s*(.*?)\s*</user_query>", text, re.DOTALL)
    if match:
        return match.group(1)
    return text


def content_text(message: dict) -> str:
    content = (message or {}).get("content")
    if isinstance(content, str):
        return content
    parts = []
    if isinstance(content, list):
        for item in content:
            if isinstance(item, dict) and item.get("type") == "text":
                parts.append(item.get("text") or "")
    return "\n".join(parts)


def last_turn_from_transcript(transcript_path: str | None) -> tuple[str, str]:
    if not transcript_path:
        return "", ""
    path = Path(transcript_path)
    if not path.exists():
        return "", ""
    user = ""
    assistant_chunks: list[str] = []
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return "", ""
    for line in lines:
        line = line.strip()
        if not line:
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError:
            continue
        role = row.get("role")
        text = content_text(row.get("message") or row)
        if role == "user":
            user = extract_user_query(text)
            assistant_chunks = []
        elif role == "assistant" and text.strip():
            assistant_chunks.append(text.strip())
    return user, "\n\n".join(assistant_chunks)


def handle_session_start(root: Path, payload: dict, state: dict) -> dict:
    state["session_id"] = session_id(payload)
    state["date"] = utc_date()
    state["model"] = model_name(payload)
    state.setdefault("total_exchanges", 0)
    state.setdefault("prompt_count", 0)
    state.setdefault("response_count", 0)
    ensure_log(root, state)
    return state


def handle_prompt(root: Path, payload: dict, state: dict) -> dict:
    prompt = payload.get("prompt")
    if prompt is None:
        prompt = ""
    sid = session_id(payload)
    state["session_id"] = sid
    state["date"] = state.get("date") or utc_date()
    state["model"] = model_name(payload)
    ts = utc_now()
    state["prompt_count"] = int(state.get("prompt_count") or 0) + 1
    num = state["prompt_count"]
    if not state.get("first_prompt_time"):
        state["first_prompt_time"] = ts
    state["last_prompt_time"] = ts
    state["pending_response"] = True
    state["latest_response_text"] = ""
    log_path = ensure_log(root, state)
    append_entry(
        log_path,
        entry_type="PROMPT",
        num=num,
        sid=sid,
        timestamp=ts,
        model=state["model"],
        body=prompt if isinstance(prompt, str) else json.dumps(prompt),
    )
    rewrite_frontmatter(log_path, state)
    return state


def maybe_backfill_prompt(log_path: Path, payload: dict, state: dict, transcript_user: str) -> None:
    if state.get("pending_response"):
        return
    if not transcript_user:
        return
    try:
        existing = log_path.read_text(encoding="utf-8")
    except OSError:
        existing = ""
    if transcript_user in existing:
        return
    ts = utc_now()
    sid = session_id(payload)
    state["prompt_count"] = int(state.get("prompt_count") or 0) + 1
    if not state.get("first_prompt_time"):
        state["first_prompt_time"] = ts
    state["last_prompt_time"] = ts
    state["pending_response"] = True
    append_entry(
        log_path,
        entry_type="PROMPT",
        num=state["prompt_count"],
        sid=sid,
        timestamp=ts,
        model=state["model"],
        body=transcript_user,
    )


def write_response(root: Path, payload: dict, state: dict, body: str) -> dict:
    sid = session_id(payload)
    state["session_id"] = sid
    state["date"] = state.get("date") or utc_date()
    state["model"] = model_name(payload) or state.get("model")
    log_path = ensure_log(root, state)
    transcript_user, _transcript_assistant = last_turn_from_transcript(
        payload.get("transcript_path")
    )
    maybe_backfill_prompt(log_path, payload, state, transcript_user)

    if int(state.get("response_count") or 0) >= int(state.get("prompt_count") or 0):
        if not state.get("pending_response"):
            return state

    state["response_count"] = int(state.get("prompt_count") or 1)
    state["total_exchanges"] = state["response_count"]
    state["pending_response"] = False
    state["latest_response_text"] = ""
    ts = utc_now()
    append_entry(
        log_path,
        entry_type="RESPONSE",
        num=state["response_count"],
        sid=sid,
        timestamp=ts,
        model=state.get("latest_response_model") or state["model"],
        body=body,
    )
    rewrite_frontmatter(log_path, state)
    return state


def handle_agent_response(root: Path, payload: dict, state: dict) -> dict:
    text = payload.get("text")
    if isinstance(text, str) and text.strip():
        state["latest_response_text"] = text
        state["latest_response_model"] = model_name(payload)
        return write_response(root, payload, state, text.strip())
    return state


def handle_stop(root: Path, payload: dict, state: dict) -> dict:
    sid = session_id(payload)
    state["session_id"] = sid
    state["date"] = state.get("date") or utc_date()
    state["model"] = model_name(payload)
    body = (state.get("latest_response_text") or "").strip()
    _transcript_user, transcript_assistant = last_turn_from_transcript(
        payload.get("transcript_path")
    )
    if not body:
        body = transcript_assistant
    if not body:
        ensure_log(root, state)
        return state
    return write_response(root, payload, state, body)


def main() -> int:
    try:
        payload = read_payload()
    except json.JSONDecodeError:
        sys.stdout.write("{}\n")
        return 0

    event = payload.get("hook_event_name") or ""
    try:
        root = workspace_root(payload)
        sid = session_id(payload)
        state_path, debug_path = state_paths(root, sid)
        debug(debug_path, payload)
        state = load_state(state_path)

        if event == "sessionStart":
            state = handle_session_start(root, payload, state)
        elif event == "beforeSubmitPrompt":
            state = handle_prompt(root, payload, state)
        elif event == "afterAgentResponse":
            state = handle_agent_response(root, payload, state)
        elif event == "stop":
            state = handle_stop(root, payload, state)

        save_state(state_path, state)
    except Exception as exc:
        try:
            root = workspace_root(payload)
            _, debug_path = state_paths(root, session_id(payload))
            with debug_path.open("a", encoding="utf-8") as fh:
                fh.write(json.dumps({"ts": utc_now(), "error": str(exc)}) + "\n")
        except OSError:
            pass

    sys.stdout.write("{}\n")
    return 0


if __name__ == "__main__":
    os.environ.setdefault("PYTHONUTF8", "1")
    raise SystemExit(main())
