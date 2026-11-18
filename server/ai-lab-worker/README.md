# AI Lab: switching on live AI

The AI Lab page (`ai-lab.html`) runs as a **prototype** until this server proxy is deployed and its address is added to the page. In prototype mode, answers come from fixed guidance written into `ai-lab.js`, nothing leaves the visitor's browser, and every answer is labelled "Prototype".

This folder is the proxy: a small Cloudflare Worker that holds the Anthropic API key, adds each assistant's instructions, checks every request and calls Claude. The website itself never sees the key.

## What you need

| Item | Why | Cost |
|---|---|---|
| Anthropic Console account and API key | Pays for the AI answers | Usage-based, per question |
| Cloudflare account (free plan) | Runs the Worker | Free plan covers 100,000 requests a day |
| Node.js (LTS) on this PC | To run the deploy command once | Free |

Cost per question depends on the model and the length of the answer. Check current prices on the Anthropic pricing page before you start, and **set a monthly spend limit in the Anthropic Console** so a spike can never produce a large bill.

## Steps (about 20 minutes)

1. **Install Node.js** from nodejs.org (LTS version).
2. **Create the API key** in the Anthropic Console. Use a workspace just for the website, and set its spend limit.
3. Open a terminal in this folder (`server/ai-lab-worker`) and install the two packages:
   ```bash
   npm install @anthropic-ai/sdk wrangler
   ```
4. **Sign in to Cloudflare** (opens a browser window):
   ```bash
   npx wrangler login
   ```
5. **Store the API key as a secret.** Paste the key when asked. It is stored in Cloudflare only, never in this repository:
   ```bash
   npx wrangler secret put ANTHROPIC_API_KEY
   ```
6. **Deploy:**
   ```bash
   npx wrangler deploy
   ```
   The command prints the Worker address, for example `https://laoyu-ai-lab.<your-name>.workers.dev`.
7. **Turn it on in the website:** in `ai-lab.js`, set
   ```js
   var ENDPOINT = "https://laoyu-ai-lab.<your-name>.workers.dev/ask";
   ```
   bump `ai-lab.js?v=` in `ai-lab.html`, and publish the site through the normal branch and pull request.

The page then shows "Live AI" instead of "Prototype", and the privacy notice changes to say that questions are sent to the AI provider.

## Settings

All in `wrangler.toml` under `[vars]`; run `npx wrangler deploy` again after a change.

| Setting | Default | Meaning |
|---|---|---|
| `ALLOWED_ORIGINS` | `https://laoyutalks-max.github.io` | Only these sites may call the Worker. Add `http://localhost:8765` for local testing. |
| `MODEL` | `claude-opus-5-5` | The Claude model. `claude-haiku-5-5` costs far less per question; try it on real questions before switching. |
| `EFFORT` | `medium` | How much the model thinks before answering: `low`, `medium` or `high`. Lower is faster and cheaper. |
| `RATE_PER_MINUTE` | `6` | Questions per visitor per minute. |

## Safety and limits built in

- The API key is a Cloudflare secret. It is never in the website, this repository or any browser.
- Each assistant has its own instructions on the server, so visitors cannot change them.
- Every request is checked: known assistant, alternating messages, at most 20 messages, at most 1,000 characters per question, at most 24 KB per request.
- Requests from sites not listed in `ALLOWED_ORIGINS` are refused.
- Answers come back in a fixed structure (summary, steps, checks, cautions, related tools), so the page never shows raw HTML from the model.
- If a safety classifier declines a question, Anthropic retries on its recommended fallback model; if that also declines, the visitor sees a polite "can't help with that" message.
- Questions and answers are not logged or stored by the Worker. Only error types are logged.

**The per-visitor limit is best effort**: each Cloudflare location keeps its own count. For a hard limit, add a rate-limiting rule in the Cloudflare dashboard (Security > WAF > Rate limiting rules) on the path `/ask`, and rely on the Anthropic spend limit as the final cap.

## Automation Advisor (same Worker)

The Automation Lab's **ASK LAOYU – Automation Advisor** (`auto-advisor.js` on `automation.html`) uses the same Worker on a second path, `/advise`. Until it is switched on, the advisor gives rule-based recommendations from keyword rules in `auto-advisor.js`, labelled "Rule-based · not live AI", and nothing leaves the browser.

To switch it on after the Worker is deployed: in `auto-advisor.js`, set
```js
var ENDPOINT = "https://laoyu-ai-lab.<your-name>.workers.dev/advise";
```
bump `auto-advisor.js?v=` in `automation.html`, and publish through a branch and pull request. If a rate-limiting rule is added in Cloudflare, cover `/advise` as well as `/ask`.

What it sends: the task description (15 to 600 characters), the tool ids ticked, the frequency, minutes and number of people. The model returns the approach, tools, five-stage workflow, complexity, steps, risks and up to three library workflow ids. It is not asked to estimate savings: the page calculates hours from the visitor's own numbers. If the Worker fails or declines, the page shows the rule-based recommendation with a note saying so.

The `/advise` path has not been run either. Test it with `npx wrangler dev` along with `/ask`.

## Testing locally

```bash
npx wrangler dev
```

This serves the Worker at `http://localhost:8787/ask`. Add `http://localhost:8765` to `ALLOWED_ORIGINS`, serve the website from the `site` folder on port 8765, and set `ENDPOINT` to `http://localhost:8787/ask` while testing. Do not publish that address.

## Not yet tested

This Worker has not been run yet: Node.js is not installed on the PC it was written on. Run it with `npx wrangler dev` and try a few questions in English and Chinese before setting `ENDPOINT` on the live site.
