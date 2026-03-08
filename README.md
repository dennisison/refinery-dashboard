# ⛽ Refinery Ops Dashboard

A production-grade oil & gas refinery monitoring dashboard built with **Astro**, **React**, **Tailwind CSS**, and **Recharts**. Designed for real-time visibility into crude throughput, product yield, unit status, and quality metrics — with a clean light mode default and a toggleable dark mode.

---

## 📸 Preview

> Light mode default — optimized for dayshift operations center displays.
> Toggle to dark mode for low-light environments or control room use.

|                  Light Mode                  |              Dark Mode               |
| :------------------------------------------: | :----------------------------------: |
| Warm parchment base, precision amber accents | Deep navy base, ember orange accents |

---

## 🚀 Live Demo

**[View on Netlify →](https://refinery-dashboard.netlify.app)**

---

## 📊 Dashboard Panels

| Panel                          | Description                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| **KPI Row**                    | Crude throughput (kBPD), net production (bbl/d), energy intensity (MJ/bbl), sulfur content (ppm) |
| **Hourly Throughput**          | 24-hour area chart — crude, gasoline, diesel, jet fuel streams                                   |
| **Product Yield Distribution** | Stacked bar chart — 7-day yield breakdown as % of crude                                          |
| **Capacity Utilization**       | SVG arc gauges per active process unit                                                           |
| **Production vs. Target**      | 8-month actual vs. target line chart                                                             |
| **Process Units**              | Live status table — CDU, VDU, FCC, HDS, RFM, ALK with temp/pressure/load                         |
| **Sulfur Output Trend**        | 9-week sulfur ppm trend with spec limit reference line                                           |
| **Alerts**                     | Operational alerts with severity levels and timestamps                                           |

---

## 🛠 Tech Stack

```
Frontend:
Astro 4.x          — Static/SSR framework (React islands via client:load)
React 18            — Interactive component layer
Tailwind CSS 3.x    — Utility-first styling
Recharts 2.x        — AreaChart, BarChart, LineChart, RadialBarChart
Lucide React        — Icon system
JetBrains Mono      — Monospace display font (Google Fonts)

Backend API:
Node.js 18+         — API server
Express.js          — Web framework
WebSocket           — Real-time data streaming
```

---

## 📁 Project Structure

```
refinery-dashboard/
├── api-server/
│   ├── package.json
│   ├── server.js
│   └── adapters/
│       ├── historianAdapter.js
│       └── oli/
│           ├── corrosionModels.js
│           ├── oliAuth.js
│           ├── oliClient.js
│           └── oliMock.js
│       └── ws/
│           └── wsServer.js
├── public/
├── src/
│   ├── components/
│   │   ├── AppShell.jsx              # Main app shell with routing and data hooks
│   │   ├── layout/
│   │   │   └── Sidebar.jsx           # Navigation sidebar
│   │   ├── pages/
│   │   │   ├── Corrosion.jsx         # Corrosion monitoring page
│   │   │   ├── CrudeSlate.jsx        # Crude slate page
│   │   │   ├── Markets.jsx           # Markets page
│   │   │   ├── Overview.jsx          # Main overview dashboard
│   │   │   ├── Quality.jsx           # Quality metrics page
│   │   │   └── UnitsDetail.jsx       # Unit details page
│   │   └── shared/
│   │       ├── KPIModal.jsx          # KPI modal
│   │       └── Theme.jsx             # Theme utilities
│   ├── hooks/
│   │   ├── useNavigation.jsx         # Navigation hook
│   │   └── useRefineryData.jsx       # Refinery data hook
│   ├── layouts/
│   │   └── Base.astro                # HTML shell with meta tags
│   ├── pages/
│   │   └── index.astro               # Entry page — mounts dashboard
│   └── styles/
│       └── global.css                # Global styles
├── astro.config.mjs                  # Astro config (React + Tailwind integrations)
├── netlify.toml                      # Netlify build config
├── package.json
├── tailwind.config.mjs               # Tailwind content paths
├── tsconfig.json                     # TypeScript config
└── README.md
```

---

## ⚙️ Local Development

### Prerequisites

| Tool    | Version            | Install                            |
| ------- | ------------------ | ---------------------------------- |
| Node.js | v18+ (LTS)         | [nodejs.org](https://nodejs.org)   |
| Git     | Latest             | [git-scm.com](https://git-scm.com) |
| npm     | Included with Node | —                                  |

### Install & Run

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/refinery-dashboard.git
cd refinery-dashboard

# 2. Install frontend dependencies
npm install

# 3. Install API server dependencies
cd api-server
npm install
cd ..

# 4. Start API server (in one terminal)
cd api-server
npm start
# Server runs on http://localhost:3001

# 5. Start frontend dev server (in another terminal)
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

### Build for Production

```bash
npm run build       # Outputs to /dist
npm run preview     # Preview the production build locally
```

---

## 🎨 Theme System

The dashboard ships with a **full dual-theme token system** — no Tailwind dark mode classes needed. Both themes are defined as plain JS objects in `RefineryDashboard.jsx` under the `themes` constant.

```js
// Switching is as simple as:
const [isDark, setIsDark] = useState(false); // false = light (default)
const t = isDark ? themes.dark : themes.light;
```

Every color, shadow, border, and glow is derived from `t.*` tokens, making it trivial to add a third theme (e.g., high-contrast, brand-specific).

### Light Mode Palette

| Token    | Value     | Usage                      |
| -------- | --------- | -------------------------- |
| `bg`     | `#f4f1ec` | Page background            |
| `accent` | `#c24918` | Primary brand / highlights |
| `teal`   | `#1a7a6e` | Good status / sulfur trend |
| `blue`   | `#2c5f8a` | Diesel / energy            |
| `amber`  | `#b5621a` | Warning state / gasoline   |

### Dark Mode Palette

| Token    | Value     | Usage                      |
| -------- | --------- | -------------------------- |
| `bg`     | `#060912` | Page background            |
| `accent` | `#e8612a` | Primary brand / highlights |
| `teal`   | `#2a9d8f` | Good status / sulfur trend |
| `blue`   | `#457b9d` | Diesel / energy            |
| `amber`  | `#f4a261` | Warning state / gasoline   |

---

## 🌐 Deployment

### Netlify (Recommended)

This repo includes a `netlify.toml` for zero-config Netlify deploys.

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

**Steps:**

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from GitHub**
3. Select this repo — build settings are auto-detected
4. Click **Deploy** — live in ~60 seconds

Every push to `main` triggers an automatic redeploy.

### Manual Deploy via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod --dir=dist
```

---

## 🗺 Roadmap

- [ ] **WebSocket integration** — replace mock data with live OPC-UA / SCADA feed
- [ ] **Units detail tab** — drill-down per process unit with historical trend charts
- [ ] **Quality tab** — RON/MON octane tracking, density, flash point monitoring
- [ ] **Inventory tab** — tank levels with capacity bar indicators
- [ ] **Drag-and-drop layout** — `react-grid-layout` for configurable widget arrangement
- [ ] **Persistent layout** — save widget config to Supabase/Postgres via JSON
- [ ] **Framer Motion** — staggered load animations, smooth panel transitions
- [ ] **Mobile responsive** — collapsible sidebar + stacked card layout for tablets
- [ ] **Alert push notifications** — browser Notification API for critical threshold breaches
- [ ] **CSV/PDF export** — one-click production report generation

---

## 🔧 Customization

### Swap in Real Data

All mock data arrays are defined at the top of `RefineryDashboard.jsx`. Replace with API calls or WebSocket subscriptions:

```jsx
// Replace static array:
const [throughputData, setThroughputData] = useState([]);

useEffect(() => {
  const ws = new WebSocket("wss://your-scada-endpoint/throughput");
  ws.onmessage = (e) => setThroughputData(JSON.parse(e.data));
  return () => ws.close();
}, []);
```

### Add a New KPI Card

```jsx
<StatCard
  label="Flare Gas Recovery"
  value="98.2"
  unit="%"
  delta="+0.3%"
  deltaPos
  icon={Wind}
  accent={t.teal}
  accentSoft={t.tealGlow}
  t={t}
/>
```

### Add a New Process Unit

```js
// In the unitStatus array:
{ name: "DHT-2", load: 83, temp: 344, pressure: 74, status: "optimal", product: "Diesel Hydrotreater" },
```

---

## 🐛 Troubleshooting

| Issue                         | Fix                                                                    |
| ----------------------------- | ---------------------------------------------------------------------- |
| Charts not rendering          | Ensure `client:load` is on `<RefineryDashboard />` in `index.astro`    |
| Tailwind classes not applying | Check `content` glob in `tailwind.config.mjs` includes `*.jsx`         |
| Fonts not loading             | Check internet connection — JetBrains Mono loads from Google Fonts CDN |
| Build fails on Netlify        | Confirm `netlify.toml` has `NODE_VERSION = "20"`                       |
| Blank page after deploy       | Check browser console for missing import or hydration error            |
| PowerShell execution error    | Run `Set-ExecutionPolicy RemoteSigned` once as Administrator           |

---

## 📦 Key Dependencies

```json
{
  "astro": "^4.0.0",
  "@astrojs/react": "^3.0.0",
  "@astrojs/tailwind": "^5.0.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "recharts": "^2.10.0",
  "lucide-react": "^0.263.0"
}
```

---

## 📄 License

MIT — free to use, fork, and adapt for internal operations dashboards, demos, or commercial projects.

---

## 🙌 Contributing

Pull requests welcome. For major feature additions (new tabs, real-time integrations, mobile layout), please open an issue first to discuss the approach.

---

_Built with [Astro](https://astro.build) · Deployed on [Netlify](https://netlify.com)_
