// src/runner.ts
import { appendFileSync, chmodSync, existsSync as existsSync2, mkdirSync as mkdirSync2, readFileSync as readFileSync2 } from "fs";
import { dirname, join as join2 } from "path";
import { homedir as homedir2 } from "os";

// src/registry.ts
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
var REGISTRY_SCHEMA_VERSION = 1;
function getRuntimeDir() {
  return process.env.OPENCODE_SCHEDULER_RUNTIME_DIR ?? join(homedir(), ".local", "share", "opencode", "runtime");
}
function isPidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    const code = err.code;
    return code === "EPERM";
  }
}
function readRegistryEntry(path) {
  try {
    const raw = readFileSync(path, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.schemaVersion === REGISTRY_SCHEMA_VERSION && typeof parsed.pid === "number" && typeof parsed.port === "number" && typeof parsed.url === "string" && typeof parsed.workdir === "string" && typeof parsed.startedAt === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
function listRegistryEntries(dir = getRuntimeDir()) {
  if (!existsSync(dir))
    return [];
  return readdirSync(dir).filter((file) => file.endsWith(".json") && !file.endsWith(".tmp.json")).map((file) => readRegistryEntry(join(dir, file))).filter((entry) => entry !== null);
}
async function fetchWithTimeout(url, init, timeoutMs, fetchImpl = fetch) {
  const controller = new AbortController;
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}
async function discoverLiveOpencode(opts) {
  const dir = opts.dir ?? getRuntimeDir();
  const fetchImpl = opts.fetchImpl ?? fetch;
  const timeoutMs = opts.perCandidateTimeoutMs ?? 1500;
  const aliveCandidates = listRegistryEntries(dir).filter((entry) => isPidAlive(entry.pid));
  if (aliveCandidates.length === 0)
    return;
  aliveCandidates.sort((a, b) => a.startedAt < b.startedAt ? 1 : -1);
  if (opts.workdir) {
    const target = opts.workdir;
    aliveCandidates.sort((a, b) => {
      const aMatch = a.workdir === target ? 0 : 1;
      const bMatch = b.workdir === target ? 0 : 1;
      return aMatch - bMatch;
    });
  }
  for (const candidate of aliveCandidates) {
    const baseUrl = candidate.url.replace(/\/+$/, "");
    const probeUrl = `${baseUrl}/session/${encodeURIComponent(opts.sessionId)}`;
    try {
      const res = await fetchWithTimeout(probeUrl, { method: "GET" }, timeoutMs, fetchImpl);
      if (res.ok)
        return candidate;
    } catch {}
  }
  return;
}

// src/runner.ts
var SCHEDULED_PERMS = [
  { permission: "question", action: "deny", pattern: "*" },
  { permission: "plan_enter", action: "deny", pattern: "*" },
  { permission: "plan_exit", action: "deny", pattern: "*" }
];
function parseArgs(argv) {
  let jobPath = "";
  let timeoutSeconds;
  for (let i = 0;i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--job") {
      jobPath = argv[i + 1] ?? "";
      i += 1;
    } else if (arg === "--timeout-seconds") {
      const value = parseInt(argv[i + 1] ?? "", 10);
      if (Number.isFinite(value) && value >= 0)
        timeoutSeconds = value;
      i += 1;
    }
  }
  if (!jobPath) {
    throw new Error("usage: runner --job <path/to/job.json> [--timeout-seconds N]");
  }
  return { jobPath, timeoutSeconds };
}
function readJob(jobPath) {
  const raw = readFileSync2(jobPath, "utf-8");
  return JSON.parse(raw);
}
function getJobRun(job) {
  if (job.run)
    return job.run;
  return { prompt: job.prompt, attachUrl: job.attachUrl };
}
function runsJsonlPath(job) {
  const scope = job.scopeId ?? "default";
  const dir = join2(homedir2(), ".config", "opencode", "scheduler", "scopes", scope, "runs");
  return join2(dir, `${job.slug}.jsonl`);
}
function appendRunRecord(job, record) {
  const path = runsJsonlPath(job);
  const dir = dirname(path);
  if (!existsSync2(dir)) {
    mkdirSync2(dir, { recursive: true });
    try {
      chmodSync(dir, 448);
    } catch {}
  }
  const isNew = !existsSync2(path);
  appendFileSync(path, JSON.stringify(record) + `
`);
  if (isNew) {
    try {
      chmodSync(path, 384);
    } catch {}
  }
}
function newRunId() {
  const seconds = Math.floor(Date.now() / 1000);
  const random = Math.floor(Math.random() * 1e9).toString().padStart(9, "0");
  return `${seconds}-${random}`;
}
function trimBaseUrl(url) {
  return url.replace(/\/+$/, "");
}
async function getSessionBusy(baseUrl, sessionId) {
  try {
    const res = await fetchWithTimeout(`${baseUrl}/session/status`, { method: "GET" }, 1500);
    if (!res.ok)
      return false;
    const data = await res.json().catch(() => ({}));
    return Boolean(data[sessionId]);
  } catch {
    return false;
  }
}
async function pollUntilIdle(input) {
  const deadline = Date.now() + input.timeoutSeconds * 1000;
  while (Date.now() < deadline) {
    const busy = await getSessionBusy(input.baseUrl, input.sessionId);
    if (!busy)
      return true;
    await new Promise((r) => setTimeout(r, input.intervalMs));
  }
  return false;
}
async function ensureLiveSession(input) {
  if (input.existingSessionId) {
    return { sessionId: input.existingSessionId, created: false };
  }
  const res = await fetchWithTimeout(`${input.baseUrl}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: input.job.name, permission: SCHEDULED_PERMS })
  }, 5000);
  if (!res.ok) {
    throw new Error(`POST /session failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json().catch(() => null);
  if (!json?.id)
    throw new Error("POST /session returned no id");
  return { sessionId: json.id, created: true };
}
async function deliverLive(input) {
  const parts = [
    { type: "text", text: input.prompt }
  ];
  for (const file of input.files) {
    parts.push({ type: "file", url: file });
  }
  const res = await fetchWithTimeout(`${input.baseUrl}/session/${encodeURIComponent(input.sessionId)}/prompt_async`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ noReply: input.noReply, parts })
  }, 1e4);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`prompt_async ${res.status}: ${body}`.trim());
  }
  return { httpStatus: res.status };
}
async function bestEffortTuiHints(baseUrl, sessionId, message) {
  try {
    await fetchWithTimeout(`${baseUrl}/tui/select-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionID: sessionId })
    }, 1500);
  } catch {}
  try {
    await fetchWithTimeout(`${baseUrl}/tui/show-toast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, variant: "info" })
    }, 1500);
  } catch {}
}
async function preflight(input) {
  try {
    const health = await fetchWithTimeout(`${input.baseUrl}/global/health`, { method: "GET" }, 1500);
    if (!health.ok)
      return "no-server";
  } catch {
    return "no-server";
  }
  if (input.sessionId) {
    try {
      const ses = await fetchWithTimeout(`${input.baseUrl}/session/${encodeURIComponent(input.sessionId)}`, { method: "GET" }, 1500);
      if (ses.status === 404)
        return "no-session";
      if (!ses.ok)
        return "no-server";
    } catch {
      return "no-server";
    }
  }
  return "ok";
}
async function runLive(input) {
  const baseUrl = trimBaseUrl(input.attachUrl);
  const t0 = Date.now();
  const runId = newRunId();
  const timestamp = new Date().toISOString();
  const attachUrlSource = input.attachUrlSource ?? "job";
  const pre = await preflight({ baseUrl, sessionId: input.sessionId });
  if (pre === "no-server") {
    return {
      exitCode: 10,
      record: {
        runId,
        timestamp,
        delivery: "live",
        attachUrl: baseUrl,
        attachUrlSource,
        sessionId: input.sessionId,
        error: "preflight: server unreachable",
        durationMs: Date.now() - t0,
        exitCode: 10
      }
    };
  }
  if (pre === "no-session") {
    return {
      exitCode: 11,
      record: {
        runId,
        timestamp,
        delivery: "live",
        attachUrl: baseUrl,
        attachUrlSource,
        sessionId: input.sessionId,
        error: "preflight: session not found",
        durationMs: Date.now() - t0,
        exitCode: 11
      }
    };
  }
  let { sessionId } = await ensureLiveSession({
    baseUrl,
    job: input.job,
    existingSessionId: input.sessionId
  });
  if (input.deliveryPolicy === "execute") {
    const idleNow = !await getSessionBusy(baseUrl, sessionId);
    if (!idleNow) {
      const becameIdle = await pollUntilIdle({
        baseUrl,
        sessionId,
        timeoutSeconds: input.timeoutSeconds,
        intervalMs: 2000
      });
      if (!becameIdle) {
        return {
          exitCode: 10,
          record: {
            runId,
            timestamp,
            delivery: "live",
            attachUrl: baseUrl,
            attachUrlSource,
            sessionId,
            error: "session busy beyond timeout",
            durationMs: Date.now() - t0,
            exitCode: 10
          }
        };
      }
    }
  }
  const noReply = input.deliveryPolicy === "leave-message";
  try {
    const { httpStatus } = await deliverLive({
      baseUrl,
      sessionId,
      prompt: input.prompt,
      files: input.files,
      noReply
    });
    await bestEffortTuiHints(baseUrl, sessionId, `Scheduled: ${input.job.name}`);
    return {
      exitCode: 0,
      record: {
        runId,
        timestamp,
        delivery: "live",
        attachUrl: baseUrl,
        attachUrlSource,
        sessionId,
        httpStatus,
        durationMs: Date.now() - t0,
        exitCode: 0
      }
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      exitCode: 10,
      record: {
        runId,
        timestamp,
        delivery: "live",
        attachUrl: baseUrl,
        attachUrlSource,
        sessionId,
        error: msg,
        durationMs: Date.now() - t0,
        exitCode: 10
      }
    };
  }
}
async function resolveLiveAttachUrl(input) {
  const direct = input.run.attachUrl ?? input.job.attachUrl;
  if (direct)
    return { attachUrl: direct, source: "job" };
  if (input.executionPolicy === "headless-only" || !input.run.session) {
    return { attachUrl: undefined, source: "none" };
  }
  const discover = input.discover ?? discoverLiveOpencode;
  try {
    const candidate = await discover({
      sessionId: input.run.session,
      workdir: input.job.workdir
    });
    if (candidate)
      return { attachUrl: candidate.url, source: "registry" };
  } catch {}
  return { attachUrl: undefined, source: "none" };
}
async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    process.stderr.write(`runner: ${msg}
`);
    return 64;
  }
  let job;
  try {
    job = readJob(args.jobPath);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    process.stderr.write(`runner: failed to read job: ${msg}
`);
    return 64;
  }
  const run = getJobRun(job);
  const executionPolicy = job.executionPolicy ?? "prefer-live-server";
  const deliveryPolicy = job.deliveryPolicy ?? "execute";
  const timeoutSeconds = args.timeoutSeconds ?? job.timeoutSeconds ?? 60;
  const resolved = await resolveLiveAttachUrl({ job, run, executionPolicy });
  const attachUrl = resolved.attachUrl;
  if (!attachUrl || executionPolicy === "headless-only") {
    const record = {
      runId: newRunId(),
      timestamp: new Date().toISOString(),
      delivery: "live",
      attachUrl: attachUrl ? trimBaseUrl(attachUrl) : undefined,
      sessionId: run.session,
      error: !attachUrl ? "no attachUrl on job; live delivery impossible (F5 discovery found no live opencode that sees this session)" : "executionPolicy='headless-only'",
      durationMs: 0,
      exitCode: 10
    };
    appendRunRecord(job, record);
    return 10;
  }
  const prompt = (run.prompt ?? "").trim();
  if (!prompt) {
    const record = {
      runId: newRunId(),
      timestamp: new Date().toISOString(),
      delivery: "live",
      attachUrl: trimBaseUrl(attachUrl),
      sessionId: run.session,
      error: "job has no prompt; runner only handles prompt-mode delivery",
      durationMs: 0,
      exitCode: 11
    };
    appendRunRecord(job, record);
    return 11;
  }
  const attachUrlSource = resolved.source === "registry" ? "registry" : "job";
  const result = await runLive({
    job,
    attachUrl,
    attachUrlSource,
    sessionId: run.session,
    prompt,
    files: run.files ?? [],
    deliveryPolicy,
    timeoutSeconds
  });
  appendRunRecord(job, result.record);
  return result.exitCode;
}
var invokedDirectly = (() => {
  const arg1 = process.argv[1] ?? "";
  return arg1.endsWith("runner.js") || arg1.endsWith("runner.ts");
})();
if (invokedDirectly) {
  main().then((code) => process.exit(code), (error) => {
    const msg = error instanceof Error ? error.message : String(error);
    process.stderr.write(`runner: unhandled error: ${msg}
`);
    process.exit(10);
  });
}
export {
  trimBaseUrl,
  runLive,
  resolveLiveAttachUrl,
  preflight,
  pollUntilIdle,
  parseArgs,
  newRunId,
  getSessionBusy,
  ensureLiveSession,
  deliverLive,
  SCHEDULED_PERMS
};
