# GroundSignal

> **Local AI. Real-world impact.**  
> *A private, open-source civic-tech web application built for the Hacktoberfest 2026 Open-Source AI Challenge ("Touch Grass" theme).*

---

## 🌿 Project Purpose & The "Touch Grass" Theme

Modern generative AI often chains users to their screens, cycling through synthetic chatbots and consuming remote cloud compute.

**GroundSignal** turns that dynamic on its head. Built directly around the **"Touch Grass"** challenge theme, GroundSignal encourages community members to disconnect from desk work, take a short walk in their local neighborhood, observe real-world public-space infrastructure issues—such as blocked wheelchair curb ramps, broken footpaths, accumulating litter, or urban heat corridors lacking shade trees—and transform those outdoor observations into constructive, actionable civic advocacy drafts using **100% private, on-device local AI**.

### Core Product Tenets
1. **Outdoor Observation is the Main Event:** The app is designed to accompany real-world physical walks.
2. **Drafts Only:** GroundSignal structures notes into respectful, factual drafts. It **never** claims to contact authorities, file citations, resolve violations, or identify individuals.
3. **Strict Air-Gap & Zero Telemetry:** Local inference runs entirely on the user's host machine via Docker Desktop Model Runner. No cloud APIs, no external telemetry, no user tracking.
4. **Human-in-the-Loop:** Users review, edit, and verify all drafts before exporting clean Markdown or JSON for neighborhood councils or community advocacy groups.
5. **No Barriers to Entry:** No login, no accounts, no GPS tracking, and no image uploads required.

---

## 🏛️ System Architecture

GroundSignal employs a deliberate two-layer development proxy architecture that guarantees absolute network boundary separation:

```
[Browser UI]
    │
    ▼ (fetch /api/...)
[Layer 1: Vite Development Proxy :5173]
    │
    ▼ (proxy to :3001)
[Layer 2: Express API & Zod Validation :3001]
    │
    ▼ (HTTP to :12434)
[Docker Desktop Model Runner :12434]
    │
    ▼ (Inference)
[Local Model: Meta Llama 3.2 (docker.io/ai/llama3.2:latest)]
```

* **Layer 1 (Vite Development Proxy):** The React frontend calls relative `/api/*` routes. Vite proxies requests to `http://localhost:3001`, eliminating CORS friction and preventing the browser from ever accessing the model runner directly.
* **Layer 2 (Express Model Client):** Express validates requests using shared Zod schemas, communicates server-to-server with Docker Model Runner on port 12434, extracts and validates structured JSON, and enforces strict non-accusatory system prompts.
* **Persistence:** Saved reports are stored in a local SQLite database under `apps/api/data/`. The database is created on demand and is excluded from version control. No cloud database exists.

---

## 📂 Monorepo Structure

```
groundsignal/
├── apps/
│   ├── api/                 # Express backend server (port 3001)
│   │   ├── src/
│   │   │   ├── routes/      # /api/health, /api/reports, /api/model
│   │   │   ├── services/    # modelService.ts (Docker Model Runner client)
│   │   │   ├── config.ts    # Server configuration & environment loading
│   │   │   ├── app.ts       # Express application factory
│   │   │   └── server.ts    # Server startup script
│   │   └── package.json
│   └── web/                 # React + Vite frontend (port 5173)
│       ├── src/
│       │   ├── components/  # Header, Footer, BrandLogo, DeleteConfirmModal
│       │   ├── views/       # Dashboard, CreateObservation, ReportReview, SavedReports, SystemStatus
│       │   ├── services/    # api.ts (relative /api client)
│       │   ├── utils/       # export.ts (Markdown & JSON)
│       │   ├── App.tsx      # Main application router & state controller
│       │   └── main.tsx     # React DOM entry point
│       ├── vite.config.ts   # Vite dev server & /api proxy configuration
│       └── package.json
├── packages/
│   └── shared/              # Shared TypeScript & Zod schemas
│       ├── src/
│       │   ├── index.ts     # Observation schemas, categories, and TypeScript types
│       │   └── __tests__/   # Schema unit tests
│       └── package.json
├── docs/
│   ├── DESIGN.md            # Google Stitch design system & screen reference
│   ├── ARCHITECTURE.md      # Detailed technical architecture diagram
│   └── DEV-SUBMISSION-DRAFT.md # Editable Hacktoberfest submission draft
├── scripts/
│   └── dev.ts               # Native cross-platform Bun dev runner
├── .env.example             # Template environment variables
├── package.json             # Root monorepo workspace manifest
├── bun.lock                 # Bun lockfile
└── README.md                # Project documentation
```

---

## ⚡ Prerequisites

1. **[Bun](https://bun.sh/)** (version 1.0 or newer)
2. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** with the **Models** feature enabled.
3. **Llama 3.2** pulled in Docker Desktop (`docker model pull llama3.2`).

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
bun install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Ensure `.env` matches your local Docker Model Runner settings:
```ini
PORT=3001
VITE_API_PROXY_BASE_URL=http://localhost:3001
MODEL_RUNNER_BASE_URL=http://localhost:12434/engines/v1
MODEL_NAME=docker.io/ai/llama3.2:latest
MODEL_REQUEST_TIMEOUT_MS=180000
DATABASE_PATH=apps/api/data/groundsignal.sqlite
```
`PORT`, `MODEL_RUNNER_BASE_URL`, `MODEL_NAME`, `MODEL_REQUEST_TIMEOUT_MS`, and `DATABASE_PATH` are read by the API. `VITE_API_PROXY_BASE_URL` configures the frontend development proxy target. The SQLite path is optional and defaults to `apps/api/data/groundsignal.sqlite`.

Environment files and runtime database files are intentionally ignored by Git. Commit only `.env.example`; copy it to `.env` for local configuration.

### 3. Start Development Servers
```bash
bun run dev
```
This automatically boots:
* **Express API:** `http://localhost:3001`
* **Vite Web Client:** `http://localhost:5173`

Visit `http://localhost:5173` in your browser.

---

## 🧪 Available Scripts

All scripts are executed via **Bun**:

| Command | Action |
| :--- | :--- |
| `bun run dev` | Runs the API and Web development scripts across the Bun workspace |
| `bun run build` | Compiles the shared package, types, and creates the Vite production bundle |
| `bun run typecheck` | Runs TypeScript typechecks across `@groundsignal/*` packages |
| `bun run lint` | Runs type/linter validation across all workspace packages |
| `bun run test` | Executes unit and integration test suites via Bun's native test runner |

## 🐳 Render Deployment

The repository includes an [`apps/api/Dockerfile`](./apps/api/Dockerfile), [`apps/api/docker-entrypoint.sh`](./apps/api/docker-entrypoint.sh), and [`render.yaml`](./render.yaml) for deploying the backend API and a local Ollama model in one Render web service. The React/Vite frontend can be deployed separately to Vercel.

When the frontend is deployed to Vercel, configure this build-time environment variable:

```ini
VITE_API_BASE_URL=https://your-groundsignal-api.onrender.com
```

Local development leaves `VITE_API_BASE_URL` empty and continues to use the Vite `/api` proxy.

The container has two processes:

* **Ollama** runs on `127.0.0.1:11434`, so the model API is reachable only from inside the container.
* **GroundSignal API** listens on Render's public `PORT` and exposes the `/api/*` routes.

The public API uses the internal model URL:

```ini
MODEL_RUNNER_BASE_URL=http://127.0.0.1:11434/v1
MODEL_NAME=smollm2:135m
```

On startup, the entrypoint waits for Ollama, pulls the configured model, and starts the API. Set `MODEL_NAME` to another Ollama-compatible model if needed.

> **Render free-tier limitation:** the free instance has limited RAM, CPU, ephemeral storage, and startup time. The Render configuration therefore defaults to the small `smollm2:135m` model. Larger models such as `llama3.2:1b` may exceed the available resources or make cold starts too slow. The SQLite archive is also lost when the instance is recreated. For a reliable public deployment, use a paid instance with persistent storage or run a larger model separately. The model endpoint remains private when it is bound to `127.0.0.1`.

---

## 🔍 Model Verification & Smoke Test

To verify connectivity with Docker Desktop Model Runner:

```bash
curl http://localhost:12434/engines/v1/models

curl http://127.0.0.1:5173/api/health
```

Expected health output:
```json
{
  "status": "ok",
  "apiVersion": "1.0.0",
  "modelRunner": {
    "status": "connected",
    "endpoint": "http://localhost:12434/engines/v1",
    "modelId": "docker.io/ai/llama3.2:latest",
    "availableModels": ["docker.io/ai/llama3.2:latest"]
  }
}
```

---

## 🎨 Google Stitch Design Integration

The user interface follows the **Civic Intelligence System** generated in Google Stitch:
* **Stitch Project ID:** `5058548363746996582`
* **Design System ID:** `assets/c85d41c5695643b8ae52a2dfac379374`
* **Screens Generated:**
  * Screen A: `64ec0d1626614f979c2088abcea09542` (Dashboard)
  * Screen B: `4f22a10589da4fceb198e72fe5da3dbc` (Create Observation)
  * Screen C: `0dc588a9e05d49efa01697f194f9e174` (Report Review and Export)
  * Screen D: `e0b39fe7e1d9414c986391a4d7235cb2` (Saved Reports Archive)
  * Screen E: `c1790855c41d428eb674d657f4c247c8` (Local AI Diagnostics)

See [`docs/DESIGN.md`](./docs/DESIGN.md) for full design token breakdowns and design choices.

---

## 🛡️ Privacy, Limitations, & Ethics

* **Zero Cloud Surveillance:** Your walking routes, notes, and photos never touch third-party cloud infrastructure.
* **Non-Accusatory Civic Language:** System prompts strictly forbid speculation, legal judgments, or targeting specific individuals.
* **Human Accountability:** AI provides drafts; citizens hold editorial authority.
* **Local Storage:** Saved reports remain in the local SQLite archive and are never sent to a cloud database. Export them to Markdown (`.md`) or JSON (`.json`) for permanent records.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`.
3. Verify all tests and type checks pass: `bun run typecheck && bun test`.
4. Commit your changes and open a pull request.
