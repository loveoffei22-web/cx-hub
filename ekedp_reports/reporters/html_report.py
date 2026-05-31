"""
HTML reporter — produces a self-contained HTML file (and email-safe HTML string)
from Feature 1 verification results.

Styling:
  - Navy header  #0f2d6e
  - Inline CSS only (email-safe)
  - Colour-coded status badges
  - No external dependencies
"""

from datetime import datetime
from typing import List
from pathlib import Path

from ..models import VerificationResult
from ..features.f1_verification import VerificationSummary
from ..config import EMAIL_FROM


# ── CSS / Colour constants ─────────────────────────────────────────────────────
NAVY        = "#0f2d6e"
GOLD        = "#FFC72C"
GREEN       = "#065F46"
GREEN_BG    = "#D1FAE5"
AMBER       = "#92400E"
AMBER_BG    = "#FEF3C7"
RED         = "#991B1B"
RED_BG      = "#FEE2E2"
BLUE        = "#1E3A8A"
BLUE_BG     = "#DBEAFE"
GREY        = "#374151"
GREY_BG     = "#F3F4F6"
BORDER      = "#E5E7EB"
WHITE       = "#FFFFFF"


STATUS_STYLE = {
    "MATCH":       (GREEN,  GREEN_BG,  "✓ CLEAN MATCH"),
    "MISMATCH":    (RED,    RED_BG,    "✗ MISMATCH"),
    "ONLY_IN_SP":  (AMBER,  AMBER_BG,  "◌ ONLY IN SP"),
    "ONLY_IN_APP": (BLUE,   BLUE_BG,   "◆ ONLY IN APP"),
}

TICKET_STATUS_STYLE = {
    "RESOLVED":    (GREEN,  GREEN_BG),
    "IN PROGRESS": (AMBER,  AMBER_BG),
    "UNRESOLVED":  (RED,    RED_BG),
}


def _badge(text: str, color: str, bg: str) -> str:
    return (
        f'<span style="display:inline-block;padding:2px 8px;border-radius:12px;'
        f'background:{bg};color:{color};font-size:10px;font-weight:700;'
        f'letter-spacing:.06em;white-space:nowrap;">{text}</span>'
    )


def _status_badge(status: str) -> str:
    color, bg = TICKET_STATUS_STYLE.get(status.upper(), (GREY, GREY_BG))
    return _badge(status or "—", color, bg)


def _ver_badge(ver_status: str) -> str:
    color, bg, label = STATUS_STYLE.get(ver_status, (GREY, GREY_BG, ver_status))
    return _badge(label, color, bg)


def _pct_bar(pct: float, color: str = NAVY, height: int = 8) -> str:
    """Simple inline CSS percentage bar."""
    w = min(max(round(pct * 100), 0), 100)
    return (
        f'<div style="background:#E5E7EB;border-radius:4px;height:{height}px;'
        f'width:140px;display:inline-block;vertical-align:middle;">'
        f'<div style="background:{color};width:{w}%;height:{height}px;'
        f'border-radius:4px;"></div></div> '
        f'<span style="font-size:11px;color:{GREY};font-weight:700;">{w}%</span>'
    )


def _th(text: str, align: str = "left") -> str:
    return (
        f'<th style="background:{NAVY};color:{WHITE};font-family:Arial,sans-serif;'
        f'font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;'
        f'padding:8px 10px;text-align:{align};white-space:nowrap;">{text}</th>'
    )


def _td(content: str, align: str = "left", bold: bool = False,
        color: str = GREY, extra: str = "") -> str:
    weight = "700" if bold else "400"
    return (
        f'<td style="padding:7px 10px;font-family:Arial,sans-serif;font-size:12px;'
        f'color:{color};font-weight:{weight};border-bottom:1px solid {BORDER};'
        f'text-align:{align};{extra}">{content}</td>'
    )


def _section_header(title: str, count: int, color: str, bg: str) -> str:
    return (
        f'<tr><td colspan="99" style="padding:12px 14px 8px;background:{bg};'
        f'font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:{color};'
        f'border-top:3px solid {color};">{title} '
        f'<span style="font-size:11px;font-weight:400;">({count} tickets)</span>'
        f'</td></tr>'
    )


# ── Main HTML builder ─────────────────────────────────────────────────────────

def build_verification_html(
    results:    List[VerificationResult],
    summary:    VerificationSummary,
    title:      str = "EKEDP Data Verification Report",
    generated:  datetime | None = None,
) -> str:
    """
    Build a complete self-contained HTML report for Feature 1.
    Returns an HTML string suitable for:
      - Writing to a .html file
      - Embedding as email body in Power Automate
    """
    generated = generated or datetime.now()
    gen_str = generated.strftime("%A, %d %B %Y at %H:%M WAT")

    mismatches = [r for r in results if r.status == "MISMATCH"]
    only_sp    = [r for r in results if r.status == "ONLY_IN_SP"]
    only_app   = [r for r in results if r.status == "ONLY_IN_APP"]
    clean      = [r for r in results if r.status == "MATCH"]

    clean_rate = f"{summary.clean_rate:.1%}" if summary.matched else "—"
    match_rate = f"{summary.match_rate:.1%}" if summary.total_sp else "—"

    # ── KPI cards ─────────────────────────────────────────────────────────────
    kpi_cards_html = ""
    kpi_data = [
        ("SharePoint",    summary.total_sp,    NAVY,    WHITE),
        ("App Records",   summary.total_app,   "#1E3A8A", WHITE),
        ("Clean Match",   summary.clean_match, GREEN,   WHITE),
        ("Mismatches",    summary.mismatched,  RED,     WHITE),
        ("Only in SP",    summary.only_in_sp,  AMBER,   WHITE),
        ("Only in App",   summary.only_in_app, BLUE,    WHITE),
    ]
    for label, value, bg, fg in kpi_data:
        kpi_cards_html += (
            f'<td style="width:16.6%;padding:0 4px;">'
            f'<div style="background:{bg};border-radius:8px;padding:12px 10px;text-align:center;">'
            f'<div style="font-family:Arial,sans-serif;font-size:10px;color:{GOLD};'
            f'font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px;">'
            f'{label}</div>'
            f'<div style="font-family:\'Courier New\',monospace;font-size:24px;'
            f'font-weight:900;color:{fg};">{value}</div>'
            f'</div></td>'
        )

    # ── Mismatch field breakdown ──────────────────────────────────────────────
    field_breakdown_rows = ""
    if summary.mismatches_by_field:
        for fname, cnt in sorted(summary.mismatches_by_field.items(), key=lambda x: -x[1]):
            pct = cnt / summary.mismatched if summary.mismatched else 0
            field_breakdown_rows += (
                f'<tr>'
                f'{_td(fname.replace("_", " ").title(), bold=True)}'
                f'{_td(str(cnt), align="right", color=RED, bold=True)}'
                f'{_td(_pct_bar(pct, RED))}'
                f'</tr>'
            )

    # ── Mismatch rows ─────────────────────────────────────────────────────────
    mismatch_rows_html = ""
    if mismatches:
        mismatch_rows_html += (
            f'<tr>'
            + _th("Ticket #")
            + _th("Customer")
            + _th("BU")
            + _th("Field")
            + _th("SharePoint Value")
            + _th("App Value")
            + _th("SP Status")
            + _th("App Status")
            + "</tr>"
        )
        for r in mismatches:
            sp  = r.sp_ticket
            app = r.app_ticket
            cust  = (sp.customer_name if sp else (app.customer_name if app else "")) or "—"
            bu    = (sp.business_unit  if sp else (app.business_unit  if app else "")) or "—"
            sp_st  = (sp.status  if sp  else "") or "—"
            app_st = (app.status if app else "") or "—"
            for i, mm in enumerate(r.mismatches):
                tid_cell  = f'<strong>#{r.ticket_id}</strong>' if i == 0 else ""
                cust_cell = cust if i == 0 else ""
                bu_cell   = bu   if i == 0 else ""
                sp_st_cell  = _status_badge(sp_st)  if i == 0 else ""
                app_st_cell = _status_badge(app_st) if i == 0 else ""
                field_label = mm.field_name.replace("_", " ").title()
                mismatch_rows_html += (
                    f'<tr style="background:{"#FFF7F7" if i % 2 == 0 else WHITE};">'
                    + _td(tid_cell,  bold=i == 0, color=NAVY)
                    + _td(cust_cell[:30])
                    + _td(bu_cell)
                    + _td(f'<em style="color:{GREY};font-size:11px;">{field_label}</em>')
                    + _td(f'<span style="color:{RED};">{mm.sp_value[:50] or "—"}</span>')
                    + _td(f'<span style="color:{BLUE};">{mm.app_value[:50] or "—"}</span>')
                    + _td(sp_st_cell)
                    + _td(app_st_cell)
                    + "</tr>"
                )

    # ── Only-in-SP rows ───────────────────────────────────────────────────────
    only_sp_rows_html = ""
    if only_sp:
        only_sp_rows_html = (
            f'<tr>'
            + _th("Ticket #")
            + _th("Customer")
            + _th("Phone")
            + _th("BU")
            + _th("Category")
            + _th("Status")
            + _th("Created")
            + "</tr>"
        )
        for r in only_sp:
            t = r.sp_ticket
            created = t.created_at.strftime("%d %b %Y") if t.created_at else "—"
            only_sp_rows_html += (
                f'<tr style="background:{AMBER_BG}20;">'
                + _td(f'<strong>#{r.ticket_id}</strong>', color=NAVY)
                + _td((t.customer_name or "—")[:30])
                + _td(t.phone or "—")
                + _td(t.business_unit or "—")
                + _td((t.category or "—")[:35])
                + _td(_status_badge(t.status))
                + _td(created)
                + "</tr>"
            )

    # ── Only-in-App rows ──────────────────────────────────────────────────────
    only_app_rows_html = ""
    if only_app:
        only_app_rows_html = (
            f'<tr>'
            + _th("Ticket #")
            + _th("Customer")
            + _th("Phone")
            + _th("Agent")
            + _th("Category")
            + _th("Status")
            + _th("Created")
            + "</tr>"
        )
        for r in only_app:
            t = r.app_ticket
            created = t.created_at.strftime("%d %b %Y") if t.created_at else "—"
            only_app_rows_html += (
                f'<tr style="background:{BLUE_BG}30;">'
                + _td(f'<strong>#{r.ticket_id}</strong>', color=NAVY)
                + _td((t.customer_name or "—")[:30])
                + _td(t.phone or "—")
                + _td((t.agent or "—")[:25])
                + _td((t.category or "—")[:35])
                + _td(_status_badge(t.status))
                + _td(created)
                + "</tr>"
            )

    # ── Assemble HTML ─────────────────────────────────────────────────────────
    mismatch_section = ""
    if mismatches:
        mismatch_section = f"""
        <h2 style="font-family:Arial,sans-serif;font-size:15px;color:{RED};
                   border-left:4px solid {RED};padding-left:10px;margin-top:28px;">
          ✗ Mismatches — {len(mismatches)} tickets with field differences
        </h2>
        {_breakdown_table(field_breakdown_rows) if field_breakdown_rows else ""}
        <table width="100%" cellspacing="0" cellpadding="0"
               style="border-collapse:collapse;margin-top:12px;border:1px solid {BORDER};">
          {mismatch_rows_html}
        </table>
        """

    only_sp_section = ""
    if only_sp:
        only_sp_section = f"""
        <h2 style="font-family:Arial,sans-serif;font-size:15px;color:{AMBER};
                   border-left:4px solid {AMBER};padding-left:10px;margin-top:28px;">
          ◌ Only in SharePoint — {len(only_sp)} tickets not found in App
        </h2>
        <table width="100%" cellspacing="0" cellpadding="0"
               style="border-collapse:collapse;margin-top:12px;border:1px solid {BORDER};">
          {only_sp_rows_html}
        </table>
        """

    only_app_section = ""
    if only_app:
        only_app_section = f"""
        <h2 style="font-family:Arial,sans-serif;font-size:15px;color:{BLUE};
                   border-left:4px solid {BLUE};padding-left:10px;margin-top:28px;">
          ◆ Only in App — {len(only_app)} tickets not in SharePoint
        </h2>
        <p style="font-family:Arial,sans-serif;font-size:11px;color:{GREY};margin-top:4px;">
          These tickets were logged by agents but have not been synced to SharePoint.
          They may be orphaned records.
        </p>
        <table width="100%" cellspacing="0" cellpadding="0"
               style="border-collapse:collapse;margin-top:12px;border:1px solid {BORDER};">
          {only_app_rows_html}
        </table>
        """

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellspacing="0" cellpadding="0"
       style="max-width:960px;margin:20px auto;background:{WHITE};
              border-radius:10px;overflow:hidden;
              box-shadow:0 2px 12px rgba(0,0,0,.10);">

  <!-- ── HEADER ── -->
  <tr>
    <td style="background:{NAVY};padding:20px 24px;">
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td>
            <div style="font-size:9px;font-weight:700;color:{GOLD};
                        letter-spacing:.14em;text-transform:uppercase;margin-bottom:4px;">
              EKEDP · CUSTOMER EXPERIENCE DEPARTMENT
            </div>
            <div style="font-size:20px;font-weight:900;color:{WHITE};line-height:1.2;">
              {title}
            </div>
            <div style="font-size:11px;color:rgba(255,255,255,.65);margin-top:4px;">
              Generated: {gen_str} &nbsp;·&nbsp;
              Sent from: {EMAIL_FROM}
            </div>
          </td>
          <td style="text-align:right;white-space:nowrap;">
            <div style="background:rgba(255,255,255,.12);border-radius:8px;
                        padding:8px 14px;display:inline-block;">
              <div style="font-size:9px;color:{GOLD};font-weight:700;
                          letter-spacing:.1em;text-transform:uppercase;">Match Rate</div>
              <div style="font-size:26px;font-weight:900;color:{WHITE};
                          font-family:'Courier New',monospace;">{match_rate}</div>
              <div style="font-size:9px;color:rgba(255,255,255,.6);">
                Clean: {clean_rate}
              </div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ── KPI CARDS ── -->
  <tr>
    <td style="padding:14px 16px;background:#F8FAFC;
               border-bottom:1px solid {BORDER};">
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>{kpi_cards_html}</tr>
      </table>
    </td>
  </tr>

  <!-- ── BODY ── -->
  <tr>
    <td style="padding:20px 24px;">

      {mismatch_section}
      {only_sp_section}
      {only_app_section}

      {"<p style='font-family:Arial,sans-serif;font-size:13px;color:" + GREEN + ";margin-top:28px;'>"
        "✓ All " + str(len(clean)) + " matched tickets are consistent between SharePoint and the App.</p>"
        if not mismatches and clean else ""}

    </td>
  </tr>

  <!-- ── FOOTER ── -->
  <tr>
    <td style="background:#F8FAFC;border-top:1px solid {BORDER};
               padding:12px 24px;">
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="font-family:Arial,sans-serif;font-size:10px;color:#94A3B8;">
            EKEDP Customer Experience Department ·
            This report is auto-generated. Do not reply to this email.
          </td>
          <td style="text-align:right;font-family:'Courier New',monospace;
                     font-size:10px;color:#94A3B8;">
            {gen_str}
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>
</body>
</html>"""
    return html


def _breakdown_table(rows_html: str) -> str:
    return f"""
    <table cellspacing="0" cellpadding="0"
           style="border-collapse:collapse;margin:10px 0 16px;
                  border:1px solid {BORDER};min-width:320px;">
      <tr>
        {_th("Field")}
        {_th("Count", align="right")}
        {_th("Share")}
      </tr>
      {rows_html}
    </table>
    """


def write_html_file(html: str, path: str | Path) -> Path:
    """Write HTML string to file and return the resolved path."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(html, encoding="utf-8")
    return path
