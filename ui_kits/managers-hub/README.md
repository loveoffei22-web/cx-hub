# UI Kit · Managers Hub

A pixel-faithful, click-through recreation of the **EKEDP Power App — Managers Hub** built as small reusable React components. Open `index.html` to use it; component sources are alongside.

This is the **primary** UI kit. It is a recreation, not a re-design.

## Files

| File | What's inside |
|---|---|
| `index.html` | Loads React + Babel + all components and renders the full app shell. |
| `SampleData.js` | Fake data set — responsible parties, business units, day list, sample tickets, status updates, chart data. Exposed as `window.EK_DATA`. |
| `Components.jsx` | Atoms: `<Pill>`, `<StatusBadge>`, `<BuPill>`, `<Mono>`, `<KpiTile>`, `<ReportKpi>`, `<Card>`. |
| `Nav.jsx` | Left retractable sidebar — 188 px expanded, 56 px collapsed. Active tab has a 2 px red left-border. Includes `<NavBtn>` (Settings / Sync / Export / Sign out). |
| `Signin.jsx` | White sign-in overlay with the blue gradient hex bolt mark. |
| `Dashboard.jsx` | Hero (greeting + day badge), 5-up KPI grid, "Responsible Parties" leaderboard, "Recent Status Updates" feed, "Unresolved — Action Needed" callout. |
| `DailyReport.jsx` | Inner-sidebar (actions + slot reports + day list) + 4-up KPI + ticket table. Exports `<TicketTable>` so other screens can reuse it. |
| `AllComplaints.jsx` | Filters (search / status / BU / category) + tall scrollable table. |
| `Cumulative.jsx` | Grand totals + per-responsible-party resolution table with % pills. |
| `Analytics.jsx` | Bar chart cards (category, BU, resolution rate), daily volume column chart, status distribution. |
| `Settings.jsx` | Modal — theme picker (Midnight / Daylight / Solar / Custom), brand logo upload, import data, account. |
| `App.jsx` | Orchestrator: sign-in → main app shell with nav + active screen + settings + toast. |

## Reusing components

Each script ends with `Object.assign(window, {...})` so the next script can pull what it needs from the global scope (React + Babel scopes don't share by default). Load order is fixed in `index.html`; new components should be added before `App.jsx`.

## Things that are deliberately not built

- Real data flow (everything is fixtures).
- The Excel / JSON import paths (buttons render but do nothing).
- The OneDrive / SharePoint sync settings sub-section (panel content not built).
- The team & access sub-section (admin only).

These are intentionally cosmetic in the kit; they are documented in the source `_source/managers-hub/EKEDP_Managers_Hub.html` if you want to rebuild them.
