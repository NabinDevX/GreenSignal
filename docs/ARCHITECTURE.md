# GroundSignal — Technical Architecture

## Architecture Overview

GroundSignal is built with a strict separation between client-side user experience, application proxy boundaries, and host-isolated local LLM inference. The design guarantees that **no sensitive field observations, location details, or prompt data ever exit the host machine**.

```mermaid
flowchart TD
    subgraph Browser ["User Browser Environment"]
        UI["React Web Application (Port 5173)"]
        LS[("Browser LocalStorage\n(Encrypted Archive)")]
        UI <-->|Read / Persist Reports| LS
    end

    subgraph Layer1 ["Layer 1: Vite Development Proxy"]
        VP["Vite Development Server (Port 5173)\nProxy route: /api/*"]
    end

    subgraph Layer2 ["Layer 2: Express API & Validation Boundary"]
        API["Express TypeScript Server (Port 3001)"]
        ZOD["Zod Schema Validation Engine\n(@groundsignal/shared)"]
        SVC["Dedicated Model Service Module\n(modelService.ts)"]
        API --> ZOD
        ZOD --> SVC
    end

    subgraph LocalRunner ["Local LLM Runtime"]
        DMR["Docker Desktop Model Runner\n(TCP Loopback Port 12434)"]
        LLAMA["On-Device Llama 3.2 Weights\n(docker.io/ai/llama3.2:latest)"]
        DMR --> LLAMA
    end

    UI -->|1. fetch('/api/reports/generate')| VP
    VP -->|2. Proxy HTTP Request| API
    SVC -->|3. POST /chat/completions| DMR
    DMR -->|4. Raw Text Completion| SVC
    SVC -->|5. Extract JSON & Validate Schema| ZOD
    API -->|6. Validated Report Payload| VP
    VP -->|7. JSON Response| UI
```

---

## The Two-Layer API Architecture

### Layer 1: Vite Development Proxy (`apps/web/vite.config.ts`)

- **Role:** Acts as the development-time reverse proxy.
- **Mechanism:** The React application issues standard relative calls (`/api/health`, `/api/reports/generate`, `/api/model/status`). Vite forwards all `/api/*` traffic to the URL configured by `VITE_API_BASE_URL` (defaulting to `http://localhost:3001`).
- **Security Benefit:** Completely eliminates CORS configuration issues in development while keeping the frontend entirely decoupled from direct backend URLs.
- **Boundary Rule:** The React browser **never** connects directly to Docker Model Runner (port 12434).

### Layer 2: Express Model-Service Client (`apps/api/src/services/modelService.ts`)

- **Role:** Owns all communication with the local Docker Model Runner.
- **Mechanism:** Express issues server-to-server HTTP requests to `http://localhost:12434/engines/v1`.
- **Validation & Defense:**
  - Request payload is sanitized using `@groundsignal/shared` Zod schemas before being formatted for inference.
  - System prompts enforce strict civic neutrality, non-accusatory language, and JSON schema conformity.
  - Output parsing extracts JSON structures, strips Markdown code fences, and validates the fields against `ModelReportOutputSchema`.
  - If the model produces malformed or empty output, the service returns structured HTTP errors (`502 Bad Gateway` or `503 Service Unavailable`) rather than fabricating fake AI output.

---

## Production Deployment Considerations

In a production environment:

1. **Unified Origin via Reverse Proxy:** Nginx, Caddy, or an edge gateway serves the static bundle built from `apps/web/dist` and proxies `/api/*` to the Express API process.
2. **API Base URL Configuration:** Alternatively, a configurable `VITE_API_BASE_URL` environment variable is compiled into the client with a strictly configured CORS whitelist on the Express API.
3. **No Vite Proxy in Production:** The Vite development server is purely a local tooling layer and is not present in production builds.

---

## Persistence & Privacy Architecture

- **Client-Side Storage:** Saved community reports are stored exclusively within browser `localStorage`.
- **No Database Requirement:** By intentionally eschewing a cloud database server, GroundSignal eliminates user tracking, account signups, and remote database leakage risks.
- **Offline Access:** Users can view, edit, search, and export existing saved reports even when the Express server or Docker Desktop Model Runner is halted.
- **Inference Requirement:** Generating _new_ AI drafts requires Docker Desktop Model Runner to be running on port 12434.
