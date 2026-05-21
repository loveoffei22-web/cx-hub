# Agents Hub v2 — Update Notes

## 4 files changed. Replace the originals with these.

---

## What changed

### 1. Theme system — follows Midnight / Daylight / Solar / Auto
**Files: App.jsx, Shell.jsx, TicketScreens.jsx, SlotInboxExport.jsx**

A `ThemeCtx` context is defined in `App.jsx` and shared globally on `window.ThemeCtx`.
Every component reads `const th = React.useContext(window.ThemeCtx)` and uses:
- `th.bg`      — page background
- `th.surface` — sidebar/topbar/inner panels
- `th.card`    — card/table background
- `th.border`  — all borders
- `th.text`    — primary text
- `th.muted`   — secondary/label text

**Auto mode** resolves to Daylight between 06:00–17:59 WAT, Midnight otherwise.
The theme choice is saved to `localStorage` so it persists on reload.

A 4-button theme picker (🌙 ☀️ 🌅 ⏰) sits at the bottom of the sidebar.

---

### 2. All Complaints screen — aggregated, filterable, live
**File: TicketScreens.jsx → `AllComplaints` component**

Accessible from the new **📨 All Complaints** sidebar tab.

- Shows every ticket from every agent merged together
- KPI cards: Total · Resolved · In Progress · Unresolved
- Search by ticket #, name, phone, BU, issue
- Filter dropdowns: status, BU, agent name
- Agent column shows which agent owns each ticket (coloured badge)
- Sorted newest ticket number first
- 100% theme-aware — follows whichever theme is active

---

### 3. Import JSON — merge, not replace
**File: SlotInboxExport.jsx → `ImportJSON` component**
**File: App.jsx → `importAgentData` function**

Accessible from the new **📂 Import JSON** sidebar tab.

**Merge logic (in App.jsx `importAgentData`):**
```
existing tickets for that agentId  ← already in state
incoming tickets from the JSON file
→ only add tickets whose `num` is not already present
→ duplicates are silently skipped
```

This means:
- Racheal exports 18 tickets → Esther imports → 18 added for `racheal`
- Matthew exports 19 tickets → Esther imports → 19 added for `matthew`
- Tomina exports 20 tickets → Esther imports → 20 added for `tomina`
- Esther's own are already there → her file imports with 0 duplicates
- All Complaints now shows 18+19+20+Esther = full team total

**Multiple files at once:** The drop zone accepts multiple files.
Each file is processed independently and merged for its own agent.

The import log at the bottom shows every file result (✅ or ❌) with counts.

---

### 4. Ticket persistence via localStorage
**File: App.jsx**

Tickets are saved to `localStorage` key `ek_all_tickets` on every change.
On reload, the saved state is restored. This means:
- Agents don't lose their work if they refresh the page
- Imported data survives page reload
- Falls back to `window.AGENT_TICKETS` (SampleData.js) if nothing is saved yet

---

## How Esther's COB workflow now works

1. Each agent clicks **Export Day → ⬇ Download JSON** and sends the file to Esther
2. Esther opens **Import JSON** and drops all files at once (or one by one)
3. Each file merges for its agent — All Complaints updates immediately
4. All Complaints now shows the full team's tickets for the day
5. Totals in **My Tickets** are each agent's personal count for appraisals

---

## Install

Replace these 4 files in your project:
```
App.jsx
Shell.jsx
TicketScreens.jsx
SlotInboxExport.jsx
```

No other files need to change. SampleData.js, Signin.jsx, AgentPhotos.js are untouched.
