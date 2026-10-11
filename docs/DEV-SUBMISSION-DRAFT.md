# GroundSignal — Local AI. Real-world impact.

*This post is an editable submission draft for the **Hacktoberfest 2026 Open-Source AI Challenge — Week 1: "Touch Grass"**.*

---

## 🌿 Project Pitch: What is GroundSignal?

Too much modern AI development traps us behind glowing monitors, consuming cloud GPU cycles for synthetic chat prompts. 

**GroundSignal flips the script.** Aligned with the *"Touch Grass"* theme, GroundSignal encourages individuals to step outside, take an intentional walk around their local neighborhood, notice everyday public-space issues—such as blocked curb ramps, broken flagstones, obstructed bus stops, or missing urban shade—and transform those raw physical observations into constructive, actionable civic drafts using **100% on-device, local AI**.

### Key Product Principles:
1. **Touch Grass First:** The primary activity is outdoor observation.
2. **Drafts Only:** GroundSignal structures notes into respectful, factual drafts. It **never** claims to contact authorities, submit citations, resolve violations, or track individuals.
3. **Hardware Air-Gap:** Inference runs on the user's host machine via Docker Desktop Model Runner. Zero telemetry, zero cloud APIs, zero third-party tracking.
4. **Human-in-the-Loop:** Users review, edit, and verify all drafts before exporting clean Markdown or JSON for neighborhood councils or community advocacy groups.

---

## 🔗 Links & Resources

- **Source Code Repository:** `https://github.com/YOUR_USERNAME/groundsignal`
- **Video / Demo Walkthrough:** `https://youtu.be/YOUR_DEMO_VIDEO`
- **Google Stitch Design Project:** `projects/5058548363746996582`

---

## 📸 Interface & Screen Previews

* **Dashboard (Screen A):** Editorial overview, three-step guide (Notice, Draft, Act), and dynamic local archive.
* **Create Observation (Screen B):** Accessible category selector, factual narrative logger, and offline geocaching disclaimers.
* **Report Review & Export (Screen C):** Side-by-side verification matrix, Markdown (.md), and ISO-compliant JSON export.
* **Saved Reports Archive (Screen D):** Client-side encrypted storage archive with search, filter chips, and delete confirmation safeguards.
* **System Status & Diagnostics (Screen E):** Host loopback telemetry, verified model identifier tags, and zero-WAN socket auditing.

---

## 🛠️ How We Built It

### Tech Stack
- **Monorepo Runtime & Package Manager:** [Bun](https://bun.sh/)
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS
- **Design System:** Custom **Civic Intelligence System** generated with Google Stitch MCP (`assets/c85d41c5695643b8ae52a2dfac379374`)
- **Backend API:** Express, TypeScript, Zod validation
- **Local Model Runtime:** Docker Desktop Model Runner (`com.docker.llama-server` on loopback TCP port `12434`)
- **Target Model:** Meta Llama 3.2 (`docker.io/ai/llama3.2:latest`)

### Architecture: Two-Layer Air-Gapped Proxy
1. **Layer 1 (Vite Dev Proxy):** The React frontend queries relative `/api/*` endpoints. Vite proxies these requests to `http://localhost:3001`, preventing any browser cross-origin leaks.
2. **Layer 2 (Express Model Client):** Express validates incoming payloads with shared Zod schemas and executes server-side calls to Docker Model Runner on port 12434. The browser **never** speaks to the model runner directly.

---

## ✅ Genuinely Verified Features

- [x] **Monorepo Workspace:** Clean Bun workspace structure (`@groundsignal/web`, `@groundsignal/api`, `@groundsignal/shared`).
- [x] **Shared Schema Validation:** Strict Zod validation on observations, categories, and LLM responses.
- [x] **Google Stitch UI Generation:** Verified generation of 5 complete desktop screens and custom logo asset in project `5058548363746996582`.
- [x] **Vite Dev Proxy Integration:** End-to-end verified forwarding of `/api/health` from Vite (port 5173) to Express (port 3001).
- [x] **Local Model Discovery:** Confirmed model identifier `docker.io/ai/llama3.2:latest` on Docker Desktop Model Runner.
- [x] **Client-Side Persistence:** Resilient `localStorage` persistence with category filters, keyword search, and delete modals.
- [x] **Dual Export Formats:** Verified clean Markdown (`.md`) and structured JSON (`.json`) exports.
- [x] **Automated Test Suite:** 13 passing unit and integration tests covering schemas, error codes, and API contracts.

---

## ⚠️ Known Limitations & Hardware Context

- **CPU Cold-Boot Latency:** On machines without dedicated discrete GPU passthrough to Docker Desktop, initial model weight initialization on CPU can take between 45 to 90 seconds. Generous timeouts (180,000ms) are configured to ensure inference completes without premature abortion.
- **Client Storage Boundary:** Saved records reside in the user's browser `localStorage`. Clearing browser site data purges local reports; users should export valuable reports to `.md` or `.json` for long-term archiving.

---

## 🚀 Getting Started Locally

```bash
git clone https://github.com/YOUR_USERNAME/groundsignal.git
cd groundsignal

bun install

cp .env.example .env

bun run dev

bun test
```
