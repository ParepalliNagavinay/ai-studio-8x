# Capture test

Written from files that exist in this repository after two successful canary sessions. Nothing below is invented.

## 1. Tool and model

From the session log front matter:

- **Tool:** `cursor`
- **Model:** `grok-4.6`
- **Author recorded in logs:** `ParepalliNagavinay`
- **Project:** `azaisai-rebuild`

The same values appear on each `[LOG_ENTRY]` (`model: grok-4.6`).

## 2. Capture mechanism and config changed

Automatic capture uses **Cursor project hooks**. They run `.cursor/hooks/capture.cmd`, which starts `C:\Python314\python.exe` on `.cursor/hooks/capture.py`. The script reads the hook JSON from stdin and appends only the user prompt and the final assistant reply to `.agent-logs/`.

**Config file changed:** `.cursor/hooks.json`

Events wired there:

- `sessionStart`
- `beforeSubmitPrompt`
- `afterAgentResponse`
- `stop`

Related files also added in this repo (not a substitute for the hook):

- `.cursor/hooks/capture.py`
- `.cursor/hooks/capture.cmd`
- `.cursor/rules/agent-capture.mdc`

`.agent-logs/` is not listed in `.gitignore`. `.cursor/hooks/state/` is.

## 3. Log files that contain the canaries

Two separate Cursor sessions, two files:

1. `.agent-logs/2026-09-07_11-33-50_8c8e7ba4-8eb3-4445-a735-fc0648b13b27.md`  
   Absolute: `C:\Users\DELL\Projects\azaisai-rebuild\.agent-logs\2026-09-07_11-33-50_8c8e7ba4-8eb3-4445-a735-fc0648b13b27.md`  
   Session: `8c8e7ba4-8eb3-4445-a735-fc0648b13b27`  
   Canary: `CAPTURE TEST 4 — 8x assignment, Parepalli Nagavinay`

2. `.agent-logs/2026-09-07_11-45-08_dc3529c3-4c64-455b-8055-b774d2b97c79.md`  
   Absolute: `C:\Users\DELL\Projects\azaisai-rebuild\.agent-logs\2026-09-07_11-45-08_dc3529c3-4c64-455b-8055-b774d2b97c79.md`  
   Session: `dc3529c3-4c64-455b-8055-b774d2b97c79`  
   Canary: `CAPTURE TEST 5 — 8x assignment, Parepalli Nagavinay`

Those are the only `*.md` files under `.agent-logs/` besides this write-up living at the repo root.

## 4. Both canary entries, pasted raw

Copied from the log files without editing.

### Session `8c8e7ba4` (CAPTURE TEST 4)

```
[LOG_ENTRY type=PROMPT num=1 session=8c8e7ba4]
timestamp: 2026-09-07T11:33:50.627Z
model: grok-4.6

CAPTURE TEST 4 — 8x assignment, Parepalli Nagavinay


[LOG_ENTRY type=RESPONSE num=1 session=8c8e7ba4]
timestamp: 2026-09-07T11:33:50.737Z
model: grok-4.6

**CAPTURE TEST 4 received.**

Hooks in `.cursor/hooks.json` will log this turn automatically (`beforeSubmitPrompt`, `afterAgentResponse`, `stop`). I did not write anything under `.agent-logs/`.

- Assignment: **8x**
- Name: **Parepalli Nagavinay**
```

### Session `dc3529c3` (CAPTURE TEST 5)

The first prompt line in this file is stored with a mojibake em dash (`â€"`). That is what the log contains.

```
[LOG_ENTRY type=PROMPT num=1 session=dc3529c3]
timestamp: 2026-09-07T11:45:09.969Z
model: grok-4.6

CAPTURE TEST 5 â€” 8x assignment, Parepalli Nagavinay


[LOG_ENTRY type=RESPONSE num=1 session=dc3529c3]
timestamp: 2026-09-07T11:45:37.387Z
model: grok-4.6

**CAPTURE TEST 5 received.**

Hooks in `.cursor/hooks.json` will log this turn automatically (`beforeSubmitPrompt`, `afterAgentResponse`, `stop`). I did not write anything under `.agent-logs/`.

- Assignment: **8x**
- Name: **Parepalli Nagavinay**
```

The same session file also contains a second prompt/response pair for the same canary (prompt text recovered from the transcript with a correct em dash, plus the assistant’s internal line before the final reply). That pair is in the log as `num=2`; it is not a third session.

## 5. What was tried first that did not work

These are failures that actually happened while installing capture. Earlier canary attempts (unnumbered `CAPTURE TEST`, `CAPTURE TEST 2`, `CAPTURE TEST 3`) did **not** produce files under `.agent-logs/`. Only TEST 4 and TEST 5 did.

1. **`create_project` on Windows** failed (`spawn /bin/sh ENOENT`). The repo was created with `git init` instead.

2. **First hook command** was `python .cursor/hooks/capture.py` in `.cursor/hooks.json`. Cursor did not invoke that successfully on the first canary.

3. **`loop_limit: 0` on the `stop` hook** was invalid. Cursor required `loop_limit` to be a positive integer or `null`. Until that was removed, project hooks did not load as intended. Cursor later reported hooks loaded after the field was dropped.

4. **Switching to `.cursor/hooks/capture.cmd`** made Cursor run the hook (exit 0 in the Hooks execution log), but `.agent-logs/` still had only `.gitkeep`. Root cause found in the real stdin JSON: `workspace_roots` is `/C:/Users/DELL/Projects/azaisai-rebuild`. `pathlib.Path` treated that as a bad Windows path; `mkdir` failed with WinError 123; the exception was swallowed and the hook still exited 0. Fix: `coerce_workspace_path()` in `.cursor/hooks/capture.py` (comment in that file: `Cursor on Windows sends Electron-style roots like /C:/Users/...`).

5. **`capture.cmd` stdin / encoding.** The cmd wrapper now forces UTF-8 (`PYTHONUTF8`, `PYTHONIOENCODING`, `python -X utf8`) and Python also accepts UTF-16 stdin. TEST 5’s first stored prompt still shows `â€"` instead of `—`.

6. **Synthetic / diagnostic log files** were used to smoke-test the script (`11111111-...`, `diag-stdin`, `test-session-001`). Those were not the required canaries. The diagnostic `diag-stdin.md` file was deleted so it would not be mixed with real canaries. `test-session-001.json` remains under gitignored hook state.

7. **Usage-limit errors** aborted some Agent turns (`You've hit your usage limit...`), including after TEST 4’s capture fix and TEST 3 (`User aborted request`). Those sessions did not complete a recorded canary in `.agent-logs/`.

No AzaisAi application code was started for this write-up.
