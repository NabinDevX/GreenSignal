# GroundSignal — Design System & Stitch Reference

## Overview
GroundSignal's visual identity is built around the **Civic Intelligence System**, designed to project quiet competence, institutional stewardship, and local citizen agency. The design rejects synthetic neon aesthetics, aggressive gradients, and faux analytics in favor of **Modern Civic Editorial** and **Architectural Minimalism**.

---

## Google Stitch Project & Screen Registry

* **Stitch Project ID:** `5058548363746996582`
* **Stitch Design System ID:** `assets/c85d41c5695643b8ae52a2dfac379374` (*Civic Intelligence System*)

### Generated Screens & Assets

| Screen Title | Screen ID | Type / Device | Visual Role |
| :--- | :--- | :--- | :--- |
| **GroundSignal Logo** | `524d52d5059b4c0d97f17801e6148a72` | SVG Mark | Stylized botanical leaf paired with radial broadcast signal arcs |
| **GroundSignal Dashboard (Screen A)** | `64ec0d1626614f979c2088abcea09542` | Desktop (2560x4788) | Editorial hero, three-step walk workflow, live local report cards, zero-telemetry trust bar |
| **Create Observation (Screen B)** | `4f22a10589da4fceb198e72fe5da3dbc` | Desktop (2560x2428) | Category selector chips, narrative input, geocache disclaimer, real-time token synthesis ticker |
| **Report Review and Export (Screen C)** | `0dc588a9e05d49efa01697f194f9e174` | Desktop (2560x3074) | Human-in-the-loop draft review, editable field matrix, Markdown/JSON export, cryptographic audit |
| **Saved Reports Archive (Screen D)** | `e0b39fe7e1d9414c986391a4d7235cb2` | Desktop (2560x2662) | Local browser storage archive, search/filter toolbar, delete confirmation modal, bulk JSON export |
| **Local AI Status & Diagnostics (Screen E)**| `c1790855c41d428eb674d657f4c247c8` | Desktop (2560x4102) | Loopback port 12434 connection health, model parameters, air-gap proof, interactive ping test |

---

## Design Tokens

### Color Palette

| Token | Hex | Role | Usage |
| :--- | :--- | :--- | :--- |
| `primary` | `#19381F` | Deep Forest Green | Primary CTAs, active navigation indicators, key branding accents |
| `primary-dark` | `#122814` | Pine Pitch | Hover states, focused interaction states, high-priority system bars |
| `secondary` | `#476550` | Forest Secondary | Supporting headers and accent icons |
| `accent-sage` | `#7D9D85` | Muted Sage | Status badge outlines, category pills, subtle iconography |
| `sage-light` | `#EEF3EF` | Sage Tint | Status pill background, metadata chip fill |
| `sage-border` | `#D5E0D7` | Sage Hairline | Soft borders on badges and metadata containers |
| `charcoal` | `#1C1F1D` | Rich Charcoal | Editorial headings, body text, primary interface data |
| `charcoal-muted` | `#59605A` | Muted Slate | Secondary labels, timestamps, helper text |
| `canvas-base` | `#F8FAF6` | Archival Cream | Page background; low eye-strain canvas |
| `surface-panel`| `#FFFFFF` | Warm White | Card containers, modals, form controls |
| `border-subtle` | `#E2E5E1` | Botanical Gray-Green | Hairline 1px structural borders |

### Typography Hierarchy

* **Editorial Headlines (`Newsreader`):** Humanistic serif typography used for view titles, strategic dashboard headers, and report review titles.
* **Operational UI (`Public Sans`):** Clean, balanced sans-serif used for navigational links, form labels, narrative descriptions, and card copy.
* **Telemetry & Model Metadata (`JetBrains Mono`):** Applied to technical metrics, model IDs (`docker.io/ai/llama3.2:latest`), port references, and execution timings. Numeric tables enforce `tabular-nums`.

### Spacing & Grid System

* **8px Modular baseline grid**
* Container maxWidth: `1440px` (max-w-7xl)
* Responsive Breakpoints:
  * **Desktop (1024px+):** Multi-column editorial cards, side-by-side action bars.
  * **Tablet (768px – 1023px):** Compact grid layouts with preserved padding.
  * **Mobile (< 768px):** Linear vertical stacked layout, full-width touch targets (minimum 44px), collapsible drawer menu.

---

## Reusable UI Components

1. **`BrandLogo`:** Native SVG implementation of the Stitch leaf and signal broadcast mark.
2. **`Header`:** Sticky top navigation with Hardware Trust Ribbon, real-time Model Runner state pill, tab navigation with badge counts, and "+ New Observation" quick action.
3. **`Footer`:** Persistent Civic OS footer with Local Privacy Ledger Banner, edge diagnostics links, and open-source attribution.
4. **`CategorySelector`:** Tactile pill selector supporting all six permitted civic categories: *Accessibility, Footpath, Litter, Public Safety, Green Space, Other*.
5. **`DeleteConfirmModal`:** Accessible modal overlay emphasizing that records are saved exclusively in client-side storage without cloud backup.
6. **`LocalAIStatus` (SystemStatusView):** Visual health dashboard showing loopback status, ping benchmark terminal, and air-gapped security checklist.

---

## Differences Between Stitch Mockups and Production Implementation

* **Mocked Metrics Removed:** Stitch designs included conceptual metrics (e.g. simulated latency tickers). The production React components replace simulated values with real measured roundtrips from the `/api/model/ping` endpoint.
* **Dynamic Local Storage:** Report counts on the dashboard and archive derive dynamically from actual browser `localStorage` records rather than hardcoded mock integers.
* **Live Form State & Abort Handling:** The observation creation form incorporates live progressive state transitions (Connecting → Synthesizing → Validating) mapped to real `AbortController` requests.
