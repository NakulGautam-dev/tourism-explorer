# 🌍 Tourism Explorer — HyperDart Standalone Component

> **HyperDart Hackathon Project**  
> A smart, standalone hyperDart travel companion that understands natural-language travel queries (e.g., *"tourist attractions in NYC"*, *"museums in Delhi"*, *"things to do in Paris"*) and helps users decide what is truly worth seeing in any destination at a glance.

---

## 🧭 1. Problem Statement & Idea

### The Problem
When travelers plan trips, they search broad questions like *"things to do in Paris"* or *"places to visit in Kyoto"*. Typical search engines return long lists of travel blog articles, ad-heavy aggregator pages, and generic directories mixing restaurants, hotels, and souvenir shops with actual sights.

### The Solution: Tourism Explorer
**Tourism Explorer** is an intelligent, high-density hyperDart standalone component designed to:
1. **Understand Travel Intent:** Parses natural-language search queries to extract destination entities and specific category preferences (e.g., *Museums*, *Monuments*, *Temples*, *Forts*, *Parks*, *Viewpoints*, *Historic Sites*).
2. **Present Real Sights at a Glance:** Filters out commercial noise (restaurants, fast food, shops) to prioritize genuine cultural, historic, scenic, and architectural points of interest.
3. **Offer Depth Without Clutter ("Dig Deeper"):** Displays clean summary cards, rich detail modals, star ratings, and Google Maps directions.
4. **Extra Superpowers:**
   - **🗓️ 1-Day Smart Day Planner:** Automatically groups nearby attractions by geographic proximity into Morning, Afternoon, and Evening slots to prevent backtracking.
   - **☀️ Live Visit Weather Forecast:** Real-time weather data from Open-Meteo with personalized sightseeing advice (e.g., whether to explore outdoor viewpoints or indoor museums).
   - **🗺️ Interactive Vector Map:** Custom SVG map canvas with numbered attraction pins, suggested walking path, and pan/zoom controls that function smoothly in both narrow sidebar (320–400px) and wide mainline (720px) formats.
   - **📍 Distance & Directions:** Calculates Haversine distances from both the city center and the user's GPS/IP location.

---

## 🏗️ 2. Architecture & Design Decisions

### System Architecture Diagram

```
                        ┌─────────────────────────────────────────┐
                        │            hyperDart Platform           │
                        │  - Keyword & Regex query matching       │
                        │  - Injects searchData & UIOptions       │
                        └───────────────────┬─────────────────────┘
                                            │ (Props via withHD)
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          React + Vite Frontend (src/frontend/)                          │
│                                                                                         │
│  ┌───────────────────────┐  ┌─────────────────────────┐  ┌───────────────────────────┐  │
│  │   WeatherWidget       │  │   CategoryFilter        │  │   InteractiveMap          │  │
│  │   - Live Open-Meteo   │  │   - Intent pills        │  │   - Numbered pins         │  │
│  │   - Travel tips       │  │   - Auto-category tag   │  │   - Works in sidebar/main │  │
│  └───────────────────────┘  └─────────────────────────┘  └───────────────────────────┘  │
│  ┌───────────────────────┐  ┌─────────────────────────┐  ┌───────────────────────────┐  │
│  │   AttractionCard      │  │   DayPlanner            │  │   PlaceDetailModal        │  │
│  │   - Rating, distance  │  │   - Morning / Aft / Eve │  │   - Dig deeper info       │  │
│  │   - Time & highlights │  │   - Proximity routing   │  │   - Google Maps direct    │  │
│  └───────────────────────┘  └─────────────────────────┘  └───────────────────────────┘  │
└───────────────────────────────────────────┬─────────────────────────────────────────────┘
                                            │ REST Calls (/api/places, /api/weather)
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    Express Backend on Cloudflare Workers (src/backend/)                 │
│                                                                                         │
│   • Keeps Geoapify Places API key 100% server-side & secret (never in client bundle)    │
│   • Strict negative filter: removes catering, fast-food, supermarkets, shopping malls    │
│   • In-memory caching layer for sub-millisecond repeated queries                        │
│   • Resilient fallback engine for demo cities (NYC, Paris, Rome, Delhi, Kurukshetra,    │
│     Tokyo) ensuring 100% uptime during live reviews even without third-party API keys   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions
- **Strict Separation of Concerns & Security:** All API keys are kept strictly within `src/backend/` running inside Cloudflare Workers. Zero credentials appear in the frontend bundle.
- **Adaptive Dual-Mode Layout:**
  - **Sidebar Mode (`format: 'sidebar'` / ~320-400px):** Tabbed interface (`Sights`, `Day Plan`, `Map`) with high-density vertical layout and compact widgets.
  - **Mainline Mode (`format: 'mainline'` / ~720px):** Dual-column layout displaying the attractions feed on the left and the interactive map alongside the 1-day itinerary on the right.
- **Theme-Aware Styling:** Supports `light`, `dark`, and `lightsOut` modes natively based on `UIOptions.themeName`.
- **Zero Heavy Map Dependencies:** Instead of loading heavy third-party mapping libraries requiring API tokens and failing in offline sandboxes, we built a responsive, math-projected SVG vector map that pins coordinates with zero external dependencies.

---

## 📡 3. Data Sources & APIs

| Service | Endpoint / Library | Purpose | Security |
| :--- | :--- | :--- | :--- |
| **Geoapify Places API** | `https://api.geoapify.com/v2/places` | Real-time POI discovery filtered by coordinates and tourism categories | Protected server-side in `src/backend/` |
| **Open-Meteo Weather API** | `https://api.open-meteo.com/v1/forecast` | Current temperature, precipitation chance, and sightseeing recommendations | Free public API proxy |
| **Curated Demo Knowledge Base** | In-memory verified dataset | Curated tourist spots for NYC, Paris, Rome, Delhi, Kurukshetra, and Tokyo | Embedded in backend for offline demo resilience |

---

## 🛠️ 4. Tech Stack & Libraries

- **Frontend:** React 19 / 18, Vite 6, `@hyperdart/frontend` (`withHD`), `@hyperdart/sandbox`, `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`.
- **Backend:** Express 5, Cloudflare Workers runtime via `@cloudflare/workers-types` and `wrangler`, `cors`, `body-parser`.
- **Build & Packaging:** `vite build` (ES library mode), `wrangler build`, `validate-publish.js`.
- **Repository:** [https://github.com/NakulGautam-dev/tourism-explorer](https://github.com/NakulGautam-dev/tourism-explorer)

---

## 🚀 5. Local Development & Workflow

### 1. Install Dependencies
```bash
# Frontend root dependencies
npm install --legacy-peer-deps

# Backend worker dependencies
cd src/backend && npm install && cd ../..
```

### 2. Start Local Servers
In **Terminal 1** (Backend Worker, port 3001):
```bash
cd src/backend
npm start
```

In **Terminal 2** (Frontend Sandbox, port 5173):
```bash
npm start
```
Open [http://localhost:5173](http://localhost:5173) to preview the component inside the hyperDart Sandbox with test queries.

### 3. Build & Validate
```bash
# Build frontend
npm run build

# Build backend
npm --prefix src/backend run build

# Pre-publish validation check
npm run prepublishOnly
```

---

## 🧪 6. Handled Example Queries

| User Query | Component Behavior & Output |
| :--- | :--- |
| **Tourist attractions in NYC** | Renders premier sights (Statue of Liberty, Central Park, The Met, Empire State Building, Brooklyn Bridge) with distances and day planner. |
| **Things to do in Paris** | Shows top attractions worth visiting (Eiffel Tower, Louvre Museum, Notre-Dame, Arc de Triomphe). |
| **Landmarks in Rome** | Prioritizes historic monuments (Colosseum, Pantheon, Trevi Fountain). |
| **museums in Delhi** | Auto-filters strictly to Museums (National Museum, NGMA, National Crafts Museum, National Science Centre) with active query intent banner. |
| **best places to visit in Kurukshetra** | Surfaces cultural and spiritual landmarks (Brahma Sarovar, Jyotisar, Kurukshetra Panorama, Sheikh Chilli Tomb). |
| **Sights near Tokyo** | Highlights top sights and viewpoints (Senso-ji Temple, Tokyo Skytree, Meiji Jingu Shrine). |

---

## 🏆 7. Hackathon Submission Checklist

- [x] React + Vite frontend wrapped with `withHD`.
- [x] Express backend on Cloudflare Workers keeping API keys secure.
- [x] `triggers.keywords` and `query_format.regex` configured in `hyperdart.config.js`.
- [x] Responsive layout for both `sidebar` and `mainline` views.
- [x] Full support for `light`, `dark`, and `lightsOut` themes.
- [x] Category extraction from natural language queries.
- [x] Useful details (ratings, address, description, distance from center & user).
- [x] Smart 1-Day Itinerary Planner bonus feature.
- [x] Destination weather forecast bonus feature.
- [x] Interactive vector map bonus feature.
- [x] Distance calculation from user location (`searchData.userLocation`).
- [x] `scripts/validate-publish.js` passes with zero errors.
- [x] `.gitignore` configured to prevent committing keys or build outputs.
- [x] Publish held until final user review.

---

## 👤 Author & Acknowledgements
- Developed for the **hyperDart Hackathon**.
- Built with React, Vite, Express, and the hyperDart Component SDK.
