# DRAFT — CLOSED, not filing. Kept for internal reference only.

**Decision (2026-07-06)**: Nat decided not to file this publicly — too lightweight/premature for a public GitHub issue right now; our own verified testing is sufficient for internal purposes. No GitHub issue will be filed. This draft and the underlying finding remain captured here and in the collaboration writeup/learning file in case it becomes relevant again later (e.g. if evaluating Spice.ai for a PHI-adjacent use case in the future, or if the bug resurfaces in a version bump).

**Target repo**: spiceai/spiceai
**Suggested title**: `spice run` silently ignores `task_history.captured_output: none` (and CLI override) — full tool output is always logged

---

## Summary

`runtime.task_history.captured_output` is a documented spicepod config option (introduced in v0.18.1-beta, referenced on docs.spiceai.org) intended to control whether tool-call *output* is captured in `task_history`, with `none` meaning "don't capture output." When running via the standard `spice run` CLI workflow, **setting this to `none` has no effect** — full tool-call output is captured regardless, with no error or warning that the setting was ignored.

This matters most for anyone federating a tool that returns sensitive data (PHI, PII, secrets) through Spice's MCP tool-calling or native LLM tool-use paths — the expectation from the documented config is that output capture can be disabled, and in practice, via `spice run`, it cannot be.

## Reproduction

1. `spice init spice_qs && cd spice_qs`
2. Configure a tool (MCP-federated or built-in) and set in `spicepod.yaml`:
   ```yaml
   runtime:
     task_history:
       captured_output: none
   ```
3. `spice run`
4. Call the tool (via `/v1/mcp`, `/v1/chat/completions` with `tools: auto`, or however it's wired up)
5. Query task history: `spice sql` → `SELECT captured_output FROM task_history WHERE ...;` (or equivalent)
6. **Observed**: full tool output is present in `captured_output`, despite the config.

Also tried an explicit CLI override to rule out a config-parsing issue specifically:
```
spice run -- --set-runtime task_history.captured_output=none
```
**Observed**: still fully populated.

## Root cause (traced, file:line)

`bin/spice/src/context.rs` — the `spice run` CLI wrapper appends its own `--set-runtime task_history.captured_output=truncated` **after** any user-supplied runtime overrides. Overrides are applied in argv order with last-write-wins semantics, so the CLI's hardcoded append always wins — silently, with no warning that a user-configured value was overridden.

The only way to make `captured_output: none` actually take effect is to bypass `spice run` entirely and invoke the `spiced` binary directly.

## Why this is more than a documentation gap

`captured_output` itself is real and documented — the option existing, and its intended semantics, match the docs. What's undocumented anywhere we could find is that the *standard, most common way to run Spice* (`spice run`) silently overrides this specific security-relevant setting. A user following the documented config to disable output capture, using the documented way to start the runtime, ends up with output capture silently still on. There's no error, no warning, no log line indicating an override occurred.

## Suggested fix directions (not prescriptive — happy to defer to maintainers)

- `spice run` should not silently override a user-supplied `task_history.captured_output` value — either respect it, or emit a visible warning if it's forcing a different value for some operational reason.
- If there's an intentional reason `spice run` needs `truncated` (vs. `none`) that we're missing, documenting that constraint explicitly (and surfacing it when a user's config conflicts with it) would close the gap.

## Verification methodology (for credibility / reproducibility notes)

This was found via live testing against a real running `spice run` process (not source-reading alone) — confirmed via `ps` inspection of the actual process args, then empirically verified by querying `task_history.captured_output` after setting the option two different ways (spicepod.yaml and explicit CLI override), both of which were silently ignored.

---

*(End of draft. Nothing above has been posted. Fill in exact version tested / OS / spice --version output before filing, and adjust tone/detail as you see fit.)*
