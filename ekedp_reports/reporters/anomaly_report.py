"""
Console + HTML reporter for Feature 2 anomaly detection results.
"""

from typing import List
from ..features.f2_anomaly import Anomaly, AnomalySummary


SEV_ICONS = {"HIGH": "🔴", "MEDIUM": "🟡", "LOW": "🔵"}
TYPE_LABELS = {
    "DUPLICATE_PHONE":    "Duplicate Phone",
    "DUPLICATE_METER":    "Duplicate Meter",
    "SLA_BREACH":         "SLA Breach",
    "MISSING_RESP":       "Missing Responsible Party",
    "STATUS_MISMATCH":    "Status Mismatch (SP ↔ App)",
    "REPEAT_COMPLAINANT": "Repeat Complainant",
    "ORPHANED":           "Orphaned (App only)",
}


# ── Console reporter ──────────────────────────────────────────────────────────

def print_anomaly_report(
    anomalies: List[Anomaly],
    summary:   AnomalySummary,
    verbose:   bool = False,
) -> None:
    print()
    print("═" * 65)
    print("  EKEDP ANOMALY DETECTION REPORT")
    print("═" * 65)
    print(summary)

    if not anomalies:
        print("  ✓  No anomalies detected.\n")
        print("═" * 65)
        return

    # Group by type for display
    type_order = [
        "SLA_BREACH", "STATUS_MISMATCH",
        "DUPLICATE_PHONE", "DUPLICATE_METER", "REPEAT_COMPLAINANT", "ORPHANED",
        "MISSING_RESP",
    ]
    groups: dict = {}
    for a in anomalies:
        groups.setdefault(a.anomaly_type, []).append(a)

    for atype in type_order:
        items = groups.get(atype, [])
        if not items:
            continue
        label = TYPE_LABELS.get(atype, atype)
        icon  = SEV_ICONS.get(items[0].severity, "•")
        print(f"\n  {icon}  {label.upper()}  ({len(items)})\n")
        print(f"  {'Ticket':<12} {'Customer':<25} {'Detail'}")
        print("  " + "-" * 80)
        for a in items:
            t = a.sp_ticket or a.app_ticket
            cust = (t.customer_name[:24] if t and t.customer_name else "")
            rel = f"  [also: {', '.join('#'+r for r in a.related_ids[:3])}]" if a.related_ids else ""
            print(f"  #{a.ticket_id:<11} {cust:<25} {a.description}{rel}")
            if verbose and t:
                print(f"           Status: {t.status}  |  Resp: {t.responsible_party or '—'}")
                if t.created_at:
                    print(f"           Created: {t.created_at.strftime('%d/%m/%Y %H:%M')}")
        print()

    print("═" * 65)


# ── HTML reporter ─────────────────────────────────────────────────────────────

_SEV_COLOR = {"HIGH": "#dc2626", "MEDIUM": "#d97706", "LOW": "#2563eb"}
_SEV_BG    = {"HIGH": "#fef2f2", "MEDIUM": "#fffbeb", "LOW": "#eff6ff"}


def build_anomaly_html(anomalies: List[Anomaly], summary: AnomalySummary) -> str:
    from datetime import datetime

    kpi_items = [
        ("SLA Breaches",        summary.sla_breach,         "#dc2626"),
        ("Status Mismatches",   summary.status_mismatch,    "#dc2626"),
        ("Duplicate Phones",    summary.duplicate_phone,    "#d97706"),
        ("Duplicate Meters",    summary.duplicate_meter,    "#d97706"),
        ("Repeat Complainants", summary.repeat_complainant, "#d97706"),
        ("Orphaned (App only)", summary.orphaned,           "#d97706"),
        ("Missing Resp Party",  summary.missing_resp,       "#2563eb"),
    ]

    kpi_html = "".join(
        f'<div class="kpi-card"><div class="kpi-val" style="color:{clr}">{val}</div>'
        f'<div class="kpi-lbl">{lbl}</div></div>'
        for lbl, val, clr in kpi_items
    )

    def rows_for_type(atype: str) -> str:
        items = [a for a in anomalies if a.anomaly_type == atype]
        if not items:
            return ""
        label = TYPE_LABELS.get(atype, atype)
        sev   = items[0].severity
        hdr_c = _SEV_COLOR[sev]
        rows  = ""
        for a in items:
            t    = a.sp_ticket or a.app_ticket
            cust = (t.customer_name if t and t.customer_name else "—")
            stat = (t.status if t and t.status else "—")
            resp = (t.responsible_party if t and t.responsible_party else "—")
            cre  = (t.created_at.strftime("%d/%m/%Y") if t and t.created_at else "—")
            rel  = ", ".join(f"#{r}" for r in a.related_ids[:3]) or "—"
            rows += (
                f"<tr>"
                f"<td>#{a.ticket_id}</td>"
                f"<td>{cust}</td>"
                f"<td>{a.description}</td>"
                f"<td>{stat}</td>"
                f"<td>{resp}</td>"
                f"<td>{cre}</td>"
                f"<td>{rel}</td>"
                f"</tr>\n"
            )
        return (
            f'<h3 style="color:{hdr_c};margin-top:24px">{label} ({len(items)})</h3>'
            f'<table><thead><tr>'
            f'<th>Ticket</th><th>Customer</th><th>Detail</th>'
            f'<th>Status</th><th>Responsible Party</th><th>Created</th><th>Related</th>'
            f'</tr></thead><tbody>{rows}</tbody></table>'
        )

    type_order = [
        "SLA_BREACH", "STATUS_MISMATCH",
        "DUPLICATE_PHONE", "DUPLICATE_METER", "REPEAT_COMPLAINANT", "ORPHANED",
        "MISSING_RESP",
    ]
    tables_html = "".join(rows_for_type(t) for t in type_order)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EKEDP Anomaly Detection Report</title>
<style>
  body{{font-family:'Segoe UI',Arial,sans-serif;margin:0;background:#f0f4f8;color:#1e293b}}
  .header{{background:linear-gradient(135deg,#0f2d6e,#1a4fa8);color:#fff;padding:28px 36px}}
  .header h1{{margin:0 0 4px;font-size:1.5rem;font-weight:700}}
  .header p{{margin:0;opacity:.8;font-size:.9rem}}
  .content{{max-width:1100px;margin:0 auto;padding:24px 20px}}
  .kpi-row{{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:28px}}
  .kpi-card{{background:#fff;border-radius:10px;padding:16px 20px;min-width:130px;
             box-shadow:0 1px 4px rgba(0,0,0,.1);flex:1}}
  .kpi-val{{font-size:2rem;font-weight:700;line-height:1}}
  .kpi-lbl{{font-size:.78rem;color:#64748b;margin-top:4px}}
  .summary-box{{background:#fff;border-radius:10px;padding:16px 20px;
                box-shadow:0 1px 4px rgba(0,0,0,.1);margin-bottom:24px;
                font-size:.9rem;white-space:pre-wrap;font-family:monospace}}
  table{{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;
         overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);margin-bottom:16px;font-size:.85rem}}
  th{{background:#0f2d6e;color:#fff;padding:10px 12px;text-align:left;font-weight:600}}
  td{{padding:9px 12px;border-bottom:1px solid #e2e8f0}}
  tr:last-child td{{border-bottom:none}}
  tr:hover td{{background:#f8fafc}}
  .badge{{display:inline-block;padding:2px 8px;border-radius:99px;font-size:.75rem;font-weight:600}}
  .badge-high{{background:#fef2f2;color:#dc2626}}
  .badge-med{{background:#fffbeb;color:#d97706}}
  .badge-low{{background:#eff6ff;color:#2563eb}}
  h3{{color:#0f2d6e;border-bottom:2px solid #e2e8f0;padding-bottom:6px}}
</style>
</head>
<body>
<div class="header">
  <h1>⚡ EKEDP — Anomaly Detection Report</h1>
  <p>Generated {datetime.now().strftime('%A %d %B %Y at %H:%M WAT')}
     &nbsp;|&nbsp; Tickets checked: {summary.total_tickets_checked}
     &nbsp;|&nbsp; Anomalies found: {summary.total_anomalies}</p>
</div>
<div class="content">
  <div class="kpi-row">{kpi_html}</div>
  {tables_html}
</div>
</body>
</html>"""
