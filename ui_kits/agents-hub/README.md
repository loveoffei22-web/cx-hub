# UI Kit · Agents Hub

The **EKEDP Power App — Agents Hub** is the hub for the 5 CX team members who handle complaints on the mobile-app channel. Separate from Love's Managers Hub. Same brand, lighter chrome, tinted with each agent's colour.

Open `index.html`. Sign in with any of the 5 names and password **`ekedp2026`**.

## Agents

| Colour | Name | Email |
|---|---|---|
| 🟢 Green | Matthew Akhigbe | matthew.akhigbe@ekedp.com |
| 🩷 Pink | Racheal Ogunleke | racheal.ogunleke@ekedp.com |
| 🟣 Purple | Tomina Egbokwu | tomina.egbokwu@ekedp.com |
| 🔴 Red | Esther Okafor | esther.okafor@ekedp.com |
| 🟡 Yellow | Loveth Okpara | loveth.okpara@ekedp.com |

Every screen is tinted with the active agent's colour — top bar, sidebar accent, active tab, CTA buttons, modal headers.

## Screens

| Tab | What it does |
|---|---|
| 📋 **My Tickets** | Filtered to the signed-in agent's tickets. Click any row → Update modal. Filter chips for All / Resolved / In Progress / Unresolved. Age badges (green < 3d, amber 3–6d, red ≥ 7d). |
| ➕ **Add Ticket** | Paste raw SharePoint complaint text → phone, ticket #, meter auto-detect. Fill in BU, category, responsible party, issue, action taken. Save. |
| 🌤️ **Slot Updates** | One-click WhatsApp message builder for **Midday (1–2 PM)** and **COB (4–5 PM)**. Generates plain-text WhatsApp-ready message with bold (`*…*`) markers. "📋 Copy text" → paste into WhatsApp group. |
| 📥 **Inbox** | Messages and data pushes from Love (placeholder until OneDrive sync is wired). |
| 📤 **Export Day** | Download the agent's day as JSON for Love's hub to ingest via the shared OneDrive folder. Copy-to-clipboard or download as `.json`. |

## Files

- `index.html` — entry point. Loads React + Babel + all scripts.
- `SampleData.js` — fake ticket fixtures per agent.
- `Signin.jsx` — pick-name + password screen.
- `Shell.jsx` — sidebar + topbar + screen routing.
- `TicketScreens.jsx` — MyTickets / AddTicket / UpdateTicket modal.
- `SlotInboxExport.jsx` — SlotUpdates / Inbox / ExportDay.
- `App.jsx` — orchestrator with sign-in gate and toast.

## What's intentionally not built (yet)

- **OneDrive sync.** Inbox is placeholder content. Export Day produces a real JSON file you can drop in OneDrive manually until we wire the URL.
- **Role enforcement.** Anyone signed in can view any tab; in production the agent only sees their own tickets (the data fixture already does this).
- **SLA monitoring.** Love said *"deal with #5 much later"* — deferred.
