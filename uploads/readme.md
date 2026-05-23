# EKEDP Design System

A design system for **EKEDP Power App — Managers Hub**, the internal operations console used by the Customer Experience team at **Eko Electricity Distribution PLC (EKEDP)**, Marina HQ, Lagos.

The Managers Hub is a dark-mode SPA where CX managers track complaint tickets coming in from the EKEDP mobile app: a dashboard with live KPIs, a daily report log, an all-complaints searchable table, a cumulative tracker by responsible party, and analytics charts. It supports four runtime themes (Midnight default, Daylight, Solar, Custom).

This system extracts the visual + content vocabulary so a designer or coding agent can produce new screens, slides, and reports that look at home alongside it.

> **Brand essence.** EKEDP is a Nigerian power utility. The visual identity centres on **deep navy + brand red + white** with a **lightning bolt** as the mark. The Managers Hub adds bright accent blues (`#1D4ED8`, `#60A5FA`) for primary interactive moments — the sign-in card, daylight theme accents, info badges.

---

## Sources

This system was reverse-engineered from these inputs. They are not bundled in the project, but originals are stored under `_source/` for reference.

- **`uploads/EKEDP CX Hub.html`** → `_source/managers-hub/EKEDP_Managers_Hub.html` — **the authoritative product**. A single-file SPA titled *"EKEDP Power App — Managers Hub"* with sign-in, sidebar nav, 5 screens, theme picker, logo upload, JSON/Excel import, and OneDrive sync.
- GitHub: <https://github.com/loveoffei22-web/ekedp-cx-hub> — earlier iteration. Contains a light-mode Shift Scheduler (`index.html`), printable Daily Report (`daily_report.html`), and a complaints workbench (`reporting-tool.html`). Useful as a secondary reference for the light/print surfaces.
- GitHub: <https://github.com/loveoffei22-web/ekedp-reporting-tool> — earlier `CX_Operations_Hub_v2.html` (predecessor of the Managers Hub) and two related tools.

You can open these GitHub repositories directly to do a deeper / fuller recreation than what is captured here.

---

## Product Context

EKEDP's CX team (~9 named agents — Mojibola, Ogheneyoreme, Holyland, Nonye, Adetoun, Olusegun, Clara, Glory, Festus, plus admins) operates from Marina HQ. The Managers Hub is the dashboard their **managers** use to:

1. **Dashboard** — see today's KPIs (total / resolved / in progress / unresolved / today's complaints), a "Responsible Parties" leaderboard with % resolution bars, "Recent Status Updates" feed, and "Unresolved — Action Needed" callouts.
2. **Daily Report** — drill into a single day's tickets. Side panel lists every day with a count badge; another panel exports slot reports (9AM Handover, 12PM Update, 1–2PM Midday, 4–5PM COB) and Excel/PDF/HTML. Ticket table with #, time, customer, phone, BU, category, address, status, note.
3. **All Complaints** — searchable, filterable table across all days. Filters: status, BU, category, day. Sorted newest first.
4. **Cumulative Tracker** — running totals by Responsible Party, with % resolution pills.
5. **Analytics** — bar charts (category breakdown, business unit, resolution rate by party, status distribution) + daily volume trend column chart.

Settings modal handles theme switching, logo upload, data import (Excel/JSON/paste), OneDrive/SharePoint sync URL, team/access (admin only), and account.

The audience is internal CX managers. Tone is operational, slightly formal, occasionally warm in greetings.

---

## CONTENT FUNDAMENTALS

**Voice.** Operational, factual, and confident. Headlines name things directly ("Daily Report", "All Complaints", "Cumulative Complaint Tracker"). When the product greets a user it is brief and lightly warm ("Welcome back 👋", "Good morning, CX Team ☀️").

**Casing.**
- Page titles: Title Case. ("Daily Report", "All Complaints", "Analytics & Insights")
- Eyebrows, KPI labels, table headers, section labels: **ALL-CAPS** with `letter-spacing: .06–.14em`. ("TOTAL COMPLAINTS", "RESPONSIBLE PARTY", "DAY OF OPS", "ACTIONS")
- Buttons: Sentence case, often with a leading icon ("⬇ Export Excel", "⟳ Sync", "📂 Import Snapshot").
- Status pills: **ALL-CAPS** ("RESOLVED", "IN PROGRESS", "UNRESOLVED", "DUPLICATE").

**Example header chain:**
> EKEDP POWER APP / Managers Hub
> Good morning, CX Team ☀️ *(italic, larger)*
> EKEDP Customer Experience · Marina HQ

**Person.** Reports speak about the operation ("Day 1–15 · 201 complaints"). The user is greeted by name when known ("Good morning, Love Offei"). "You" appears only in form labels ("Your name", "Sign in to your access.").

**Numbers.** Foregrounded. Anything you can count uses `JetBrains Mono`. KPI counts sit at ~28–38px with 9–10px uppercase labels. Mono is also used for the clock, ticket #'s, percentage pills, and small `S/N` columns.

**Emoji.** Used as **navigation and section icons** — meaningfully, not decoratively:
- Nav tabs: `🏠 Dashboard`, `📋 Daily Report`, `📨 All Complaints`, `📊 Cumulative`, `📈 Analytics`
- Sidebar groups: `🎯 Responsible Parties`, `🔔 Recent Status Updates`, `🔴 Unresolved — Action Needed`
- Slot reports: `☀️ 9AM Handover`, `🕛 12PM Update`, `🌤️ 1–2PM Midday`, `🌆 4–5PM COB`
- Settings: `🎨 Theme`, `🖼 Brand logo`, `📋 Import data`, `☁️ OneDrive / SharePoint sync`, `👥 Team & access`, `⚙ Settings`, `✕`
- Action buttons: `⬇ Export`, `⟳ Sync`, `📂 Import`, `📊 Excel`, `🔎 Search`
- Status: `✅ Resolved`, `⏳ In Progress`, `🔴 Unresolved`
- Time-of-day: `☀️ ☀ 🌤 🌙` in greetings

These emoji are core to the visual identity — keep them when recreating screens. **Do not invent new emoji.** For genuinely new icon needs, fall back to Lucide (see Iconography).

**Localisation cues.**
- Lagos / **WAT** timezone (West African Time).
- Dates: `15 May 2026`, never US-format.
- Day-of-month framing: `Day 15`, `Day 1–15`, `Day of Ops`.
- Business units = Lagos districts: **Mushin, Ajah, Island, Lekki, Apapa, Ikoyi**.
- Phone numbers: `+234…` format.
- Currency (if it appears): **NGN ₦**.

**Specific phrases to reuse:**
- "EKEDP Customer Experience · Marina HQ"
- "EKEDP Power App · Managers Hub"
- "Mobile App Channel"
- "Day 1–15 · 201 complaints"
- "Resolution by Responsible Party"
- "Unresolved — Action Needed"
- "Live · WAT"

**Vibe.** Operational confidence. Numbers are the protagonist. Copy is dense, but well-rested with whitespace inside cards. Slightly warmer than a pure ops console — the italic morning greeting, emoji wayfinding, and rounded radii signal "this is a friendly place to do serious work."

---

## VISUAL FOUNDATIONS

**Theme system.** The Managers Hub ships **four runtime themes**:

| Theme | Bg / surface / card | Accent | Use |
|---|---|---|---|
| **Midnight** *(default)* | `#060E2B` · `#0D1B45` · `#111D4A` | Brand red `#E30613` | Default. Night-shift / always-on console feel. |
| **Daylight** | `#F4F6FB` · `#FFFFFF` · `#FFFFFF` | Bright blue `#1D4ED8` | Daytime mode, more legible in bright rooms. |
| **Solar** | `#2A1A06` · `#3F2C12` · `#52391B` | Amber `#F59E0B` | Warm afternoon mode. Rarely used. |
| **Custom** | `#0A0F1A` · `#121826` · `#1A2236` | User-picked | Slot for a custom accent colour. |

The system auto-suggests a theme by time of day if "auto-switch" is on. **Midnight is the default and the canonical surface.**

**Colour.** Brand core stays constant across themes: navy `#001F5C`, red `#E30613`. Status semantics also stay constant: `#16A34A` green (resolved), `#D97706` amber (in progress), `#DC2626` crimson (unresolved), `#3B82F6` blue (info / total), `#8B5CF6` purple (today / night-shift). On the dark surface, status text uses lighter variants — `#4ADE80`, `#FCD34D`, `#F87171`, `#93C5FD` — over a `15–20%` opacity coloured background. See `colors_and_type.css` for all tokens.

**Type.**
- **Sora** is the only sans family in the Managers Hub. Weights 300–800 are loaded; 600–800 is used for headings, 400–500 for body. **Headings on the dashboard are *italic*** (`font-style: italic`) at weight 800 — a small but signature affordance.
- **JetBrains Mono** for any number you can count: KPI digits, clock, ticket numbers, percentages, daily-volume axis labels.
- The earlier light-mode tools shipped Montserrat + DM Sans. These are kept in `colors_and_type.css` as `--ek-font-display` / `--ek-font-body` for backward-compatible work on those surfaces (Daily Report PDF, GM Report), but new work should default to Sora.

**Backgrounds.** No imagery, no patterns. Solid fills and 2–3-stop gradients only.
- Dashboard hero: `linear-gradient(135deg,#001040 0%,#001F5C 50%,#0a0020 100%)` with a faint red radial overlay (`radial-gradient(circle, rgba(227,6,19,.12) 0%, transparent 70%)`) anchored top-right.
- Sign-in card: page bg `linear-gradient(165deg,#FFFFFF 0%,#F0F6FF 55%,#DDEBFF 100%)` with a `linear-gradient(135deg,#60A5FA,#1D4ED8)` icon tile.
- Daylight theme hero: `linear-gradient(135deg,#DBEAFE 0%,#BFDBFE 50%,#E0E7FF 100%)`.
- Solar theme hero: `linear-gradient(135deg,#52391B 0%,#92400E 45%,#F59E0B 110%)`.

**Animation.** Restrained.
- `0.25s ease` on sidebar collapse (width + padding).
- `0.15–0.20s` on hover state colour/background.
- `0.6s` on bar-chart `width` fills.
- A toast bottom-right slides in `0.3s` (`translateY(80px → 0)` + opacity).
- A "Live" status dot pulses via `box-shadow` ring (`2s infinite`).
- **No springs, bounces, or scale shenanigans.**

**Hover states.**
- Tabs / sidebar items: bg → `rgba(255,255,255,.05–.08)`; text → `#fff`.
- Buttons: bg lightens by `.04–.10` opacity.
- Table rows: subtle `rgba(59,130,246,.08)` blue wash on ticket rows (they're clickable).
- KPI cards: `box-shadow` lift + `translateY(-2px)` only on dashboard.

**Press / active.**
- Active nav tab: red **left border** `2px solid #E30613` + `rgba(227,6,19,.10)` background tint, white text. (On the older horizontal-tab variant in the v2 file, the active mark is a `3px bottom-border` in red.)
- Active theme card in the picker: `2px border #3B82F6`.
- Sign-in submit: red glow shadow `0 8px 20px rgba(29,78,216,.28)`.

**Borders.** `1px solid #1E3070` is the canonical dark-mode border. Light-mode equivalent is `1px solid #E2E8F0`. State-coloured tiles use `1.5px solid` borders. Inputs in modals use `1px solid var(--border)`.

**Shadows.**
- Cards on dark: none. Separation is by border + slightly lighter background.
- Modal: `0 0 0 1px` border + `backdrop-filter: blur(6px)` on a `rgba(0,0,0,.55)` scrim.
- Toast: `0 8px 32px rgba(0,0,0,.4)`.
- Sign-in card (on light bg): `0 20px 60px rgba(15,30,79,.15), 0 0 0 1px rgba(15,30,79,.06)`.
- Sign-in icon tile: `0 12px 32px rgba(29,78,216,.32)`.

**Corner radii.** `6px` chips, `7–8px` buttons/inputs, `10px` cards, `12px` dashboard cards, `14px` (legacy daily-report sections), `16px` modals, `20px` sign-in card, `999px` (`.pct-b`) status percentage pills.

**Cards.**
```
background: var(--card);          /* #111D4A on midnight */
border:     1px solid var(--border); /* #1E3070 */
border-radius: 10–12px;
overflow:   hidden;
```
KPI cards add a **3px top accent stripe** (`::after`, full-width, in the state colour). Card headers have a `1px solid border-bottom`, the body has `padding: 14–18px`.

**Transparency / blur.**
- Sidebar: `rgba(6,14,43,.97) + backdrop-filter: blur(12px)`.
- Modal scrim: `rgba(0,0,0,.55) + backdrop-filter: blur(6px)`.
- Otherwise solid fills — no glassmorphism for its own sake.

**Layout.**
- Left **retractable** sidebar: `188px` expanded, `56px` collapsed. Click the logo to toggle. Daily Report has an inner second sidebar (`210px`) for day list + slot reports.
- Body content: full-width, padded `22–28px` horizontal. KPI grid is `repeat(5,1fr)` on dashboard, `repeat(4,1fr)` on daily report and cumulative.
- Tables: full-width, `border-collapse: collapse`, sticky headers when scrolling. Max-height ~`62vh` for the All Complaints table.
- Modal max-width `560px`, vertically centred with `padding: 60px 20px 20px` from top.

**Capsules vs gradients.**
- **Status pills, badges, percentage pills** = capsules. Solid (alpha) tinted background + matching colored text. `border-radius: 10–20px`.
- **Primary CTAs, sign-in button, hero blocks** = gradients. Multi-stop, never single-colour.

**Imagery.** None. The lightning-bolt mark and the EKEDP wordmark are the only graphics. Reports are all data + chrome.

**Scrollbars.** Customised — `5px width`, track `var(--bg)`, thumb `var(--sub)` rounded.

---

## ICONOGRAPHY

EKEDP's tools have **no installed icon library**. Iconography is a mix:

1. **The EKEDP logo + lightning bolt mark.** Saved into `assets/`:
   - **`assets/ekedp-app-icon.png`** — official Managers Hub app icon. White rounded square, navy "E", yellow bolt. **Use this as the favicon, in-app nav tile, sign-in mark, and as the icon on any slide/email/document. Always — never the bolt-hex SVG or the ⚡ emoji.**
   - **`assets/ekedp-power-app-lockup.png`** — horizontal "EKEDP POWER APP" lockup. **Use this for every PDF header, every Excel export header, every slide footer, every email signature, and anywhere the product is named.**
   - `assets/ekedp-logo.jpg` — corporate horizontal wordmark ("EKEDP / EKO ELECTRICITY DISTRIBUTION PLC"). Use for the parent organisation, not the Power App specifically — formal letters, corporate reports, GM materials.
   - `assets/ekedp-mark.svg` — legacy favicon variant (rounded square, navy bg, gold bolt with red stroke). Older surfaces only. **Prefer `ekedp-app-icon.png`.**
   - `assets/ekedp-bolt-hex.svg` *(initial substitution — deprecated)* — kept for backward compat with anything still pointing at it.
   - `assets/ekedp-bolt.svg` / `assets/bolt-red.svg` / `assets/bolt-white.svg` — solo bolt glyphs for in-product decoration.

2. **Unicode emoji as section/nav/action icons** — heavy and deliberate. See the Content Fundamentals section above for the canonical list. Treat these as part of the system; keep them when recreating screens.

3. **The "⚡" lightning emoji** is used inside the red nav-bar logo tile as a fallback when a custom logo isn't uploaded. The Managers Hub provides a logo upload that swaps this for an image.

4. **No imported icon library.** New work that needs a richer set (Settings gears, Search, Filter, Trash, Bell, User) should use **Lucide** (CDN: `https://unpkg.com/lucide-static@latest/font/Lucide.css`) at `1.5px` stroke. **This is a substitution flag** — EKEDP does not have a defined icon family. Lucide is the closest visual match for a system that wants minimal, line-based glyphs.

5. **Inline SVG shapes** for in-product graphics: bar fills, trend columns, pulse dots, status dots — drawn directly with HTML/CSS, no SVG icon assets needed.

---

## Files in this system

```
README.md                  ← you are here
SKILL.md                   ← Claude Skill manifest (drop into Claude Code as a skill folder)
colors_and_type.css        ← all design tokens + semantic element styles
assets/                    ← logos, bolt marks
  ekedp-logo.jpg             EKEDP horizontal wordmark (582×284 raster — full colour)
  ekedp-bolt-hex.svg         Managers Hub hex+bolt favicon, blue gradient
  ekedp-mark.svg             Legacy CX-Hub favicon, navy + gold bolt + red stroke
  ekedp-bolt.svg             Red bolt with navy stroke
  bolt-red.svg               Silhouette red bolt, transparent bg
  bolt-white.svg             White bolt (used inside sign-in icon tile)
preview/                   ← static HTML cards rendered in the Design System tab
ui_kits/
  managers-hub/            ← dark-mode primary UI kit
    README.md              ← what's inside, load order, reusable atoms
    index.html             ← clickthrough: sign-in → dashboard → daily → all complaints → cumulative → analytics
    SampleData.js          ← fake data fixtures (9 agents, 6 BUs, 15 days, ticket sample)
    Components.jsx         ← Pill, StatusBadge, BuPill, Mono, KpiTile, ReportKpi, Card
    Nav.jsx                ← retractable sidebar
    Signin.jsx             ← sign-in overlay
    Dashboard.jsx, DailyReport.jsx, AllComplaints.jsx, Cumulative.jsx, Analytics.jsx, Settings.jsx
    App.jsx                ← orchestrator (sign-in gate, active screen, toast)
_source/                   ← imported originals for reference (read-only — copy out what you need)
  managers-hub/EKEDP_Managers_Hub.html  ← authoritative live product
  cx-hub/{index.html,daily_report.html,reporting-tool.html}                     ← earlier light-mode tools
  reporting-tool/{CX_Operations_Hub_v2.html,Daily_Report.html,reporting-tool-unbundled-fixed.html}
```

> **No light-mode UI kit yet.** The earlier light-mode tools (Shift Scheduler, printable Daily Report, GM Report) are not built as a separate kit. If you need to recreate them, copy the relevant HTML out of `_source/cx-hub/` — the styles are self-contained and the colour tokens in `colors_and_type.css` cover that surface too (Montserrat + DM Sans are loaded under `--ek-font-display` / `--ek-font-body`).

---

## How to use

1. Decide your surface:
   - **Primary**: dark-mode Managers Hub — set `<body class="ek-dark">` (or `data-theme="midnight"`), use Sora + JetBrains Mono.
   - **Secondary / print**: light-mode CX surfaces — leave the default light theme, use Montserrat + DM Sans.
2. Link `colors_and_type.css` in `<head>` and pull tokens with `var(--ek-…)`.
3. Lift components from the relevant UI kit. Each kit's `index.html` is a working clickthrough — copy the markup or import the JSX.
4. Always use the real logo/bolt asset from `assets/`. Never redraw them.

---

## Open questions for the user

- **Vector logo.** The shipped logo is a 582×284 raster (JPEG, base64-embedded in the source HTML). A vector (SVG / AI / PDF) would let us scale cleanly to any size. Do you have one?
- **Brand palette truth.** The Managers Hub uses bright blues (`#1D4ED8`, `#60A5FA`) for the sign-in and Daylight theme accents — distinct from the navy-only stance in earlier files. Should the official brand list those as tertiaries, or keep them as theme-only?
- **Sora as official type.** Sora is the only family Managers Hub loads. Is Sora EKEDP's official typeface, or pragmatic-only-because-it's-on-Google-Fonts? If you have a corporate typeface, please share.
- **Icon system.** I've flagged Lucide as a substitution for any genuinely new icon needs. Confirm or replace.
- **Emoji policy.** Heavy emoji use is part of the current product. Want to keep it long-term, or migrate to a real icon set?
