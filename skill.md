---
name: ekedp-design
description: Use this skill to generate well-branded interfaces and assets for EKEDP (Eko Electricity Distribution PLC) — specifically the EKEDP Power App / Managers Hub used by the Customer Experience team at Marina HQ, Lagos. Contains essential design guidelines, colours, type tokens, fonts, brand assets, and a working UI kit of dark-mode operations-console components for prototyping. Use when building dashboards, daily-ops reports, ticket trackers, sign-in flows, slides or any other artefact for EKEDP CX.
user-invocable: true
---

# EKEDP Design Skill

Read `README.md` first — it is the source of truth for brand voice, colour, type, layout, animation, hover/press, iconography and known open questions.

After reading the README:

- `colors_and_type.css` holds every design token (`--ek-*`) plus semantic element styles. Link this file at the top of any new HTML artefact and pull tokens with `var(--ek-…)`.
- `assets/` has the **two canonical brand files you must use everywhere**:
  - **`ekedp-app-icon.png`** — favicon, nav tile, sign-in mark, slide icon, any place a single-square mark goes.
  - **`ekedp-power-app-lockup.png`** — every PDF header, Excel export header, slide footer, email signature, document, anywhere the product name appears.
  Also present: `ekedp-logo.jpg` (parent EKEDP corporate wordmark), `ekedp-mark.svg` (legacy favicon), `ekedp-bolt-hex.svg` (deprecated), `ekedp-bolt.svg` / `bolt-red.svg` / `bolt-white.svg` (solo bolt glyphs).
  **Never redraw any of these — copy them in. Never use the ⚡ emoji as the app icon.**
- `ui_kits/managers-hub/` is the working component set: sign-in, retractable sidebar, dashboard, daily report, all complaints, cumulative tracker, analytics, settings modal. Open `index.html` to use the click-through; copy individual JSX components when you need just one piece.
- `preview/` has the design-system cards (palette, type specimens, components). Useful as a visual cheat-sheet.
- `_source/` has the original imported HTML — read it for any detail this skill missed.

## When the user invokes this skill

If they give context (a goal, a screen, a slide outline), proceed:

1. Pick the right surface — **Managers Hub** (dark mode, Sora + JetBrains Mono) for any new operations / dashboard / ticket / report work. The legacy light surfaces (Shift Scheduler, Daily Report PDF, GM Report) use Montserrat + DM Sans — only reach for those when recreating those specific tools.
2. Lift the closest matching components from `ui_kits/managers-hub/`.
3. Stay strictly within the colour and type tokens in `colors_and_type.css`. Use brand red as the primary action, navy as the brand surface, status colours (green/amber/red/blue/purple) for state. Bright blue (`#1D4ED8`) is reserved for the sign-in and Daylight-theme accent.
4. Keep emoji wayfinding (🏠 📋 📨 📊 📈 🎯 🔔 🔴 ✅ ⏳ ☀️ 🌆 ⚡). It is part of the system. Only introduce SVG icons (Lucide) when there is no emoji equivalent.
5. Use the WAT timezone, Lagos business units (Mushin, Ajah, Island, Lekki, Ikoyi, Apapa), and `+234…` phone formatting in any fake data.

## If they invoke the skill with no other guidance

Ask what they want to build — a new screen, a slide, a prototype, an export, a marketing page — and ask **at least** these:

- Which surface: dark Managers Hub or legacy light CX tools?
- Static / printable vs interactive prototype?
- Do they want to expose tweaks (theme switch, colour, layout variants)?
- Real data fixtures (we have a 9-agent / 6-BU / 15-day model already) or generic?

Then act as an expert EKEDP designer and produce HTML artefacts that match the brand. Do not invent palettes, type or layout patterns that are not in this skill. Copy existing components first; only build from scratch as a last resort.

## Hard rules

- **Use `ekedp-app-icon.png` as the favicon AND the nav-tile mark, every time.** Never the ⚡ emoji, never the bolt-hex SVG, never a hand-drawn placeholder.
- **Use `ekedp-power-app-lockup.png` as the lockup on every report, slide, PDF, Excel header, and email signature.** Never re-typeset "EKEDP POWER APP" by hand.
- Never overlay the EKEDP corporate wordmark on dark navy directly — always sandwich it in a white card with 6–12 px radius and 4–14 px padding.
- Numbers are mono. KPI digits and ticket numbers use `JetBrains Mono` 800.
- Dashboard h1 greeting is **italic** Sora 800 20 px. This is signature.
- The Managers Hub default theme is **Midnight** (`#060E2B` bg). Do not ship a new screen in Daylight unless the user asked for it.
- No new emoji. No bluish-purple gradients. No glassmorphism for its own sake.
