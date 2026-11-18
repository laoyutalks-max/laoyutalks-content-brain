/**
 * LAOYUTALKS AI Lab — server proxy (Cloudflare Worker)
 *
 * The website never sees the AI key. The browser sends
 *   POST /ask  {assistant, lang, messages:[{role, content}]}
 * and this Worker checks the request, adds the assistant's system
 * instructions, calls Claude with the Anthropic SDK and returns
 *   200 {answer:{summary, steps[], checks[], cautions[], related[]}}
 * or an error {error:{code, message}}.
 *
 * The Automation Lab's advisor (auto-advisor.js) uses
 *   POST /advise {lang, task, tools[], frequency, minutes, people}
 *   200 {advice:{summary, approach, tools[], workflow[], complexity,
 *                steps[], risks[], workflows[]}}
 * with the same checks, limits and error format. Hours saved are
 * never asked of the model; the page calculates them.
 *
 * Settings (wrangler.toml [vars] and secrets):
 *   ANTHROPIC_API_KEY  secret, set with `npx wrangler secret put ANTHROPIC_API_KEY`
 *   ALLOWED_ORIGINS    comma-separated sites allowed to call this Worker
 *   MODEL              Claude model id (default claude-opus-5-5)
 *   EFFORT             low | medium | high (default medium)
 *   RATE_PER_MINUTE    questions per visitor per minute (default 6)
 *
 * Privacy: questions and answers are never logged or stored here.
 */
import Anthropic from "@anthropic-ai/sdk";

const MAX_BODY_BYTES = 24000;
const MAX_MESSAGES = 20;
const MAX_USER_CHARS = 1000;
const MAX_ASSISTANT_CHARS = 4000;

/* Resource ids the answer may link to (must exist on the website) */
const RESOURCE_IDS = [
  "oee-loss-calculator", "downtime-troubleshooter", "tool-downtime-analysis", "demo-daily-report", "supervisor-daily-planner",
  "shift-handover", "demo-shift-handover", "8d-report", "tool-capa-planner", "fishbone-5why", "repeated-mistake-worksheet",
  "demo-root-cause", "manpower-gap-calculator", "skills-matrix", "production-kpi-dashboard", "tool-excel-formula",
  "weekly-action-tracker", "tool-meeting-minutes", "tool-email-writer", "difficult-conversation", "checklist-quiet-quitting",
  "escalation-report", "decision-matrix", "ai-prompt-pack",
];

const COMMON = `You answer questions from supervisors, engineers and managers on the LAOYUTALKS website, a practical-AI site for manufacturing and workplace productivity.

How to answer:
- Be practical and specific. Give the reader something they can do on the shop floor or in the office this week.
- Keep it short: a two-sentence summary, up to six steps, up to three things to check first, up to three cautions.
- If the question lacks key facts (numbers, process, what changed), say what you would need in "checks" and still give the best general guidance.
- Use plain language. Explain any technical term the first time you use it.
- In "related", list up to three LAOYUTALKS tools that fit the problem, using only these ids: ${RESOURCE_IDS.join(", ")}. Leave it empty if none fit.

Boundaries:
- Safety first. For any hazard, injury, machine guarding or lockout question, tell the reader to follow their site's safety procedure and escalate; do not give instructions to bypass a guard or interlock.
- You give general guidance, not legal, medical, HR-policy or safety-certification advice. Say so when a question needs a professional.
- Do not ask for or repeat confidential company data or personal data. If the user shares some, do not repeat it back.
- Stay within your topic area. If a question is unrelated to work, manufacturing, quality or management, say briefly what you can help with instead.
- Do not invent statistics, standards clauses or case results. If you are unsure, say so.`;

const SYSTEM = {
  manufacturing: `You are the LAOYU Manufacturing Assistant. Your topics: production output, OEE and its losses, downtime and short stops, changeovers (SMED), line balancing, shift routines, handovers and daily production reports.\n\n${COMMON}`,
  quality: `You are the LAOYU Quality & Problem-Solving Assistant. Your topics: customer complaints, containment, 8D, root cause analysis (5 Why, fishbone / 6M), CAPA and effectiveness checks, scrap and rework, repeat defects and inspection.\n\n${COMMON}`,
  management: `You are the LAOYU Productivity & Management Assistant. Your topics: manpower planning and cover, skills, team motivation and engagement, difficult conversations, meetings and action follow-up, escalation to management, decisions and workplace productivity.\n\n${COMMON}`,
};

const ANSWER_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    steps: { type: "array", items: { type: "string" } },
    checks: { type: "array", items: { type: "string" } },
    cautions: { type: "array", items: { type: "string" } },
    related: { type: "array", items: { type: "string", enum: RESOURCE_IDS } },
  },
  required: ["summary", "steps", "checks", "cautions", "related"],
  additionalProperties: false,
};

/* ---------- Automation Advisor (POST /advise) ---------- */
const WORKFLOW_IDS = [
  "wf-production-report", "wf-ai-email", "wf-sheets", "wf-appsheet", "wf-ai-rca", "wf-doc-generation", "wf-mgmt-reporting",
  "wf-forms-checklist", "wf-downtime-qr", "wf-sheets-combine", "wf-due-alerts", "wf-appsheet-6s", "wf-manpower",
  "wf-meeting-actions", "wf-inbox-templates", "wf-request-approval",
];
const NOW_TOOLS = ["paper", "excel", "sheets", "forms", "email", "chat", "erp", "app"];
const FREQUENCIES = { several: "several times a day", daily: "once a day", weekly: "once a week", monthly: "once a month" };
const MAX_TASK_CHARS = 600;

const ADVISOR_SYSTEM = `You are ASK LAOYU, the Automation Advisor on the LAOYUTALKS website. Supervisors, engineers, planners and small-business operators describe one repetitive task; you recommend a practical way to automate it.

How to answer:
- Prefer tools most teams already have: Google Forms, Google Sheets (formulas, IMPORTRANGE, QUERY), Apps Script, AppSheet, Looker Studio, Gmail, and an AI chat tool. If the reader uses Excel or Microsoft 365, say the Microsoft equivalent (Microsoft Forms, Excel Online, Power Automate).
- "summary": one short line naming the kind of automation, e.g. "Automated daily production report".
- "approach": two or three sentences on what to change and why.
- "tools": up to five tool names.
- "workflow": exactly five short phrases, in this order: input, trigger, process, automation tool, output.
- "complexity": low (a few hours, no coding), medium (about a day, formulas or a short pasted script) or high (several days, scripts or system connections, may need IT).
- "steps": four to six concrete implementation steps, in order. If the task starts on paper, the first step digitises the capture.
- "risks": two to four honest risks or limits, including data-quality, adoption or company-rule issues that apply.
- "workflows": up to three ids of matching LAOYUTALKS library workflows, using only these ids: ${WORKFLOW_IDS.join(", ")}. Leave it empty if none fit.

Boundaries:
- Do not estimate hours or money saved; the page calculates that from the reader's own numbers.
- Do not invent statistics or case results. Do not ask for or repeat confidential company data or personal data.
- If the task is not a work task that automation could help with, say so briefly in "summary" and "approach" and leave the lists short.`;

const ADVICE_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    approach: { type: "string" },
    tools: { type: "array", items: { type: "string" } },
    workflow: { type: "array", items: { type: "string" } },
    complexity: { type: "string", enum: ["low", "medium", "high"] },
    steps: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    workflows: { type: "array", items: { type: "string", enum: WORKFLOW_IDS } },
  },
  required: ["summary", "approach", "tools", "workflow", "complexity", "steps", "risks", "workflows"],
  additionalProperties: false,
};

/* Returns an error message, or null when the advisor request is valid */
function validateAdvice(body) {
  if (!body || typeof body !== "object") return "Body must be a JSON object.";
  if (body.lang !== "en" && body.lang !== "zh") return "lang must be en or zh.";
  if (typeof body.task !== "string" || body.task.trim().length < 15 || body.task.length > MAX_TASK_CHARS) return `task must be 15 to ${MAX_TASK_CHARS} characters.`;
  if (!Array.isArray(body.tools) || body.tools.length > NOW_TOOLS.length || !body.tools.every((t) => NOW_TOOLS.includes(t))) return "tools must be a list of known tool ids.";
  if (!Object.prototype.hasOwnProperty.call(FREQUENCIES, body.frequency)) return "Unknown frequency.";
  if (!Number.isInteger(body.minutes) || body.minutes < 1 || body.minutes > 480) return "minutes must be a whole number from 1 to 480.";
  if (!Number.isInteger(body.people) || body.people < 1 || body.people > 1000) return "people must be a whole number from 1 to 1000.";
  return null;
}

/* Best-effort limit per Worker instance. For a hard limit, also add a
   Cloudflare rate-limiting rule (see README). */
const hits = new Map();
function limited(key, perMinute) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < 60000);
  if (recent.length >= perMinute) { hits.set(key, recent); return true; }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
}

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function reply(status, data, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...(origin ? cors(origin) : {}) },
  });
}

function fail(status, code, message, origin) {
  return reply(status, { error: { code, message } }, origin);
}

/* Returns an error message, or null when the request is valid */
function validate(body) {
  if (!body || typeof body !== "object") return "Body must be a JSON object.";
  if (!Object.prototype.hasOwnProperty.call(SYSTEM, body.assistant)) return "Unknown assistant.";
  if (body.lang !== "en" && body.lang !== "zh") return "lang must be en or zh.";
  const m = body.messages;
  if (!Array.isArray(m) || m.length < 1 || m.length > MAX_MESSAGES) return `messages must hold 1 to ${MAX_MESSAGES} items.`;
  for (let i = 0; i < m.length; i++) {
    const msg = m[i];
    const want = i % 2 === 0 ? "user" : "assistant";
    if (!msg || msg.role !== want) return "messages must alternate user / assistant, starting with user.";
    if (typeof msg.content !== "string" || !msg.content.trim()) return "Each message needs text content.";
    const limit = want === "user" ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS;
    if (msg.content.length > limit) return `A ${want} message is longer than ${limit} characters.`;
  }
  if (m[m.length - 1].role !== "user") return "The last message must be from the user.";
  return null;
}

/* One structured-output call to Claude. Returns {answer} or {error: Response}. */
async function askClaude(env, system, messages, schema, okOrigin) {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1 });
  let response;
  try {
    response = await client.beta.messages.create({
      model: env.MODEL || "claude-opus-5-5",
      max_tokens: 16000,
      system,
      messages,
      output_config: { effort: env.EFFORT || "medium", format: { type: "json_schema", schema } },
      /* If a safety classifier declines, Anthropic retries on its recommended fallback model */
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return { error: fail(503, "busy", "The AI service is busy. Please try again shortly.", okOrigin) };
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
      console.error("Anthropic rejected the API key"); return { error: fail(503, "unavailable", "The AI Lab is not configured.", okOrigin) };
    }
    if (error instanceof Anthropic.BadRequestError) { console.error("Bad request to Anthropic:", error.status); return { error: fail(502, "upstream", "The AI service could not answer.", okOrigin) }; }
    if (error instanceof Anthropic.APIError) { console.error("Anthropic API error:", error.status); return { error: fail(502, "upstream", "The AI service could not answer.", okOrigin) }; }
    console.error("Could not reach Anthropic"); return { error: fail(502, "upstream", "The AI service could not be reached.", okOrigin) };
  }

  if (response.stop_reason === "refusal") return { error: fail(422, "declined", "The assistant can't help with that request.", okOrigin) };
  if (response.stop_reason === "max_tokens") return { error: fail(502, "too_long", "The answer was too long. Please ask a narrower question.", okOrigin) };

  const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  let answer;
  try { answer = JSON.parse(text); } catch { return { error: fail(502, "bad_answer", "The answer came back in an unexpected format.", okOrigin) }; }
  if (!answer || typeof answer.summary !== "string") return { error: fail(502, "bad_answer", "The answer came back in an unexpected format.", okOrigin) };
  return { answer };
}

function strings(v, max) {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim()).slice(0, max) : [];
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const okOrigin = allowedOrigins(env).includes(origin) ? origin : "";

    if (url.pathname !== "/ask" && url.pathname !== "/advise") return fail(404, "not_found", "Not found.", okOrigin);
    if (request.method === "OPTIONS") return okOrigin ? new Response(null, { status: 204, headers: cors(okOrigin) }) : new Response(null, { status: 403 });
    if (request.method !== "POST") return fail(405, "method", "Use POST.", okOrigin);
    if (!okOrigin) return fail(403, "origin", "This site is not allowed to use the AI Lab.", "");
    if (!env.ANTHROPIC_API_KEY) { console.error("ANTHROPIC_API_KEY is not set"); return fail(503, "unavailable", "The AI Lab is not configured.", okOrigin); }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (limited(ip, Number(env.RATE_PER_MINUTE) || 6)) return fail(429, "rate", "Too many questions. Please wait a minute.", okOrigin);

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return fail(413, "too_large", "Request is too large.", okOrigin);
    let body;
    try { body = JSON.parse(raw); } catch { return fail(400, "bad_json", "Body is not valid JSON.", okOrigin); }
    const advise = url.pathname === "/advise";
    const problem = advise ? validateAdvice(body) : validate(body);
    if (problem) return fail(400, "invalid", problem, okOrigin);

    const language = body.lang === "zh"
      ? "\n\nWrite every field of the answer in Simplified Chinese. Keep standard terms such as OEE, 8D, CAPA and SMED, and tool names, as they are."
      : "\n\nWrite every field of the answer in English.";

    if (advise) {
      const question = `Task: ${body.task.trim()}\nTools used today: ${body.tools.length ? body.tools.join(", ") : "none given"}\nHow often: ${FREQUENCIES[body.frequency]}\nMinutes each time: ${body.minutes}\nPeople doing it: ${body.people}`;
      const out = await askClaude(env, ADVISOR_SYSTEM + language, [{ role: "user", content: question }], ADVICE_SCHEMA, okOrigin);
      if (out.error) return out.error;
      const a = out.answer;
      if (typeof a.approach !== "string") return fail(502, "bad_answer", "The answer came back in an unexpected format.", okOrigin);
      return reply(200, {
        advice: {
          summary: a.summary,
          approach: a.approach,
          tools: strings(a.tools, 6),
          workflow: strings(a.workflow, 5),
          complexity: ["low", "medium", "high"].includes(a.complexity) ? a.complexity : "medium",
          steps: strings(a.steps, 8),
          risks: strings(a.risks, 6),
          workflows: strings(a.workflows, 3).filter((id) => WORKFLOW_IDS.includes(id)),
        },
      }, okOrigin);
    }

    const out = await askClaude(env, SYSTEM[body.assistant] + language, body.messages.map((m) => ({ role: m.role, content: m.content })), ANSWER_SCHEMA, okOrigin);
    if (out.error) return out.error;
    const answer = out.answer;

    return reply(200, {
      answer: {
        summary: answer.summary,
        steps: strings(answer.steps, 8),
        checks: strings(answer.checks, 5),
        cautions: strings(answer.cautions, 5),
        related: strings(answer.related, 3).filter((id) => RESOURCE_IDS.includes(id)),
      },
    }, okOrigin);
  },
};
