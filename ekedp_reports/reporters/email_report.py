from datetime import datetime
from typing import Optional

NAVY   = "#0f2d6e"
GREEN  = "#16a34a"
AMBER  = "#d97706"
RED    = "#dc2626"
WHITE  = "#ffffff"
LIGHT  = "#f8fafc"
BORDER = "#e2e8f0"
GREY   = "#374151"
GOLD   = "#FFC72C"


def _cell(content: str, align: str = "left", bold: bool = False,
          bg: str = WHITE, color: str = GREY, pad: str = "7px 10px",
          border_bottom: bool = True) -> str:
    weight = "700" if bold else "400"
    bb = f"border-bottom:1px solid {BORDER};" if border_bottom else ""
    return (
        f'<td style="padding:{pad};font-family:Arial,sans-serif;font-size:12px;'
        f'color:{color};font-weight:{weight};background:{bg};{bb}'
        f'text-align:{align};">{content}</td>'
    )


def _hcell(text: str, align: str = "left") -> str:
    return (
        f'<th style="background:{NAVY};color:{WHITE};font-family:Arial,sans-serif;'
        f'font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;'
        f'padding:8px 10px;text-align:{align};white-space:nowrap;">{text}</th>'
    )


def _badge(text: str, color: str, bg: str) -> str:
    return (
        f'<span style="display:inline-block;padding:2px 9px;border-radius:12px;'
        f'background:{bg};color:{color};font-size:10px;font-weight:700;'
        f'letter-spacing:.05em;white-space:nowrap;">{text}</span>'
    )


def _grade_badge(grade: str) -> str:
    if grade == "MEETS TARGET":
        return _badge(grade, WHITE, GREEN)
    if grade == "NEEDS IMPROVEMENT":
        return _badge(grade, WHITE, AMBER)
    return _badge(grade, WHITE, RED)


def _pct_bar(rate: float) -> str:
    w = min(max(round(rate * 100), 0), 100)
    return (
        f'<table style="width:100%;border:none;border-collapse:collapse;" cellspacing="0" cellpadding="0">'
        f'<tr>'
        f'<td style="width:{w}%;background:{GREEN};height:8px;padding:0;"></td>'
        f'<td style="background:{BORDER};height:8px;padding:0;"></td>'
        f'</tr></table>'
        f'<span style="font-size:10px;color:{GREY};">{w}%</span>'
    )


def _kpi_card(label: str, value, bg: str, fg: str = WHITE) -> str:
    return (
        f'<td style="padding:0 4px;text-align:center;">'
        f'<div style="background:{bg};border-radius:8px;padding:12px 8px;'
        f'min-width:80px;">'
        f'<div style="font-family:Arial,sans-serif;font-size:9px;color:{GOLD};'
        f'font-weight:700;text-transform:uppercase;letter-spacing:.09em;'
        f'margin-bottom:5px;">{label}</div>'
        f'<div style="font-family:\'Courier New\',monospace;font-size:22px;'
        f'font-weight:900;color:{fg};">{value}</div>'
        f'</div></td>'
    )


def build_email_html(exec_report, anomaly_summary=None, period_summary=None) -> str:
    from ..features.f3_executive import ExecutiveReport
    from ..features.f5_summary import PeriodSummary

    er = exec_report
    gen_str = er.generated_at.strftime("%A, %d %B %Y at %H:%M WAT")
    rate_pct = f"{er.resolution_rate:.1%}"

    kpi_row = (
        _kpi_card("Total Tickets", er.total_tickets, NAVY)
        + _kpi_card("Resolved", er.resolved, GREEN)
        + _kpi_card("In Progress", er.in_progress, AMBER)
        + _kpi_card("Unresolved", er.unresolved, RED)
        + _kpi_card("Resolution Rate", rate_pct, NAVY)
        + _kpi_card("SLA Breaches", er.sla_breach_count, RED)
        + _kpi_card("Anomalies", er.anomaly_count, AMBER)
    )

    cat_rows = ""
    for cs in sorted(er.by_category.values(), key=lambda c: -c.total):
        cat_rows += (
            f'<tr>'
            + _cell(cs.category, bold=True)
            + _cell(str(cs.total), align="center")
            + _cell(str(cs.resolved), align="center", color=GREEN)
            + _cell(str(cs.in_progress), align="center", color=AMBER)
            + _cell(str(cs.unresolved), align="center", color=RED)
            + _cell(f"{cs.resolution_rate:.1%}", align="center")
            + _cell(_pct_bar(cs.resolution_rate))
            + f'</tr>'
        )

    resp_rows = ""
    for rs in sorted(er.responsible_party_stats.values(), key=lambda r: -r.resolution_rate):
        resp_rows += (
            f'<tr>'
            + _cell(rs.party, bold=True)
            + _cell(str(rs.total), align="center")
            + _cell(str(rs.resolved), align="center", color=GREEN)
            + _cell(str(rs.in_progress), align="center", color=AMBER)
            + _cell(str(rs.unresolved), align="center", color=RED)
            + _cell(f"{rs.resolution_rate:.1%}", align="center")
            + _cell(_grade_badge(rs.grade), align="center")
            + f'</tr>'
        )

    unresolved_rows = ""
    for t in er.top_unresolved:
        days_open = ""
        if t.created_at:
            delta = datetime.now() - t.created_at.replace(tzinfo=None) if t.created_at.tzinfo else datetime.now() - t.created_at
            days_open = str(delta.days)
        unresolved_rows += (
            f'<tr>'
            + _cell(f'#{t.ticket_id}', bold=True, color=NAVY)
            + _cell((t.customer_name or "—")[:30])
            + _cell(t.category or "—")
            + _cell(days_open, align="center")
            + _cell(t.responsible_party or "—")
            + f'</tr>'
        )

    anomaly_box = ""
    if anomaly_summary:
        a = anomaly_summary
        anomaly_box = f"""
        <table width="100%" cellspacing="0" cellpadding="0"
               style="border-collapse:collapse;margin-top:24px;background:{LIGHT};
                      border:1px solid {BORDER};border-radius:8px;overflow:hidden;">
          <tr>
            <td colspan="4" style="padding:10px 14px;background:{AMBER};color:{WHITE};
                font-family:Arial,sans-serif;font-size:13px;font-weight:700;">
              ⚠ Anomaly Summary — {a.total_anomalies} anomalies detected
            </td>
          </tr>
          <tr>
            {_cell(f"SLA Breaches: <strong>{a.sla_breach}</strong>", pad="8px 14px")}
            {_cell(f"Status Mismatches: <strong>{a.status_mismatch}</strong>", pad="8px 14px")}
            {_cell(f"Duplicate Phones: <strong>{a.duplicate_phone}</strong>", pad="8px 14px")}
            {_cell(f"Missing Resp: <strong>{a.missing_resp}</strong>", pad="8px 14px")}
          </tr>
          <tr>
            {_cell(f"Duplicate Meters: <strong>{a.duplicate_meter}</strong>", pad="8px 14px", border_bottom=False)}
            {_cell(f"Repeat Complainants: <strong>{a.repeat_complainant}</strong>", pad="8px 14px", border_bottom=False)}
            {_cell(f"Orphaned (App only): <strong>{a.orphaned}</strong>", pad="8px 14px", border_bottom=False)}
            {_cell("", pad="8px 14px", border_bottom=False)}
          </tr>
        </table>
        """

    period_box = ""
    if period_summary:
        ps = period_summary
        period_box = f"""
        <table width="100%" cellspacing="0" cellpadding="0"
               style="border-collapse:collapse;margin-top:20px;background:{LIGHT};
                      border:1px solid {BORDER};">
          <tr>
            <td colspan="2" style="padding:10px 14px;background:{NAVY};color:{WHITE};
                font-family:Arial,sans-serif;font-size:13px;font-weight:700;">
              Period Summary — {ps.period_label}
            </td>
          </tr>
          <tr>
            {_cell(f"Top Category: <strong>{ps.top_category}</strong>", pad="8px 14px")}
            {_cell(f"Worst Performing Party: <strong>{ps.worst_resp_party}</strong>", pad="8px 14px")}
          </tr>
        </table>
        """

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>EKEDP CX Report — {er.period_label}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellspacing="0" cellpadding="0">
<tr><td align="center" style="padding:20px 10px;">

<table width="700" cellspacing="0" cellpadding="0"
       style="max-width:700px;background:{WHITE};border-radius:10px;
              overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.1);">

  <tr>
    <td style="background:{NAVY};padding:20px 24px;">
      <table width="100%" cellspacing="0" cellpadding="0"><tr>
        <td>
          <div style="font-size:18px;font-weight:900;color:{WHITE};font-family:Arial,sans-serif;">
            ⚡ EKEDP Customer Experience Report
          </div>
          <div style="font-size:11px;color:rgba(255,255,255,.7);margin-top:4px;font-family:Arial,sans-serif;">
            {er.period_label} &nbsp;·&nbsp; Generated: {gen_str}
          </div>
          <div style="font-size:10px;color:{GOLD};margin-top:3px;font-family:Arial,sans-serif;
                      letter-spacing:.07em;">
            Powered by EKEDP CX Reporting System
          </div>
        </td>
      </tr></table>
    </td>
  </tr>

  <tr>
    <td style="padding:14px 16px;background:{LIGHT};border-bottom:1px solid {BORDER};">
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>{kpi_row}</tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:20px 24px;">

      <div style="font-family:Arial,sans-serif;font-size:14px;font-weight:700;
                  color:{NAVY};border-left:4px solid {NAVY};padding-left:10px;
                  margin-bottom:10px;margin-top:4px;">
        Category Breakdown
      </div>
      <table width="100%" cellspacing="0" cellpadding="0"
             style="border-collapse:collapse;border:1px solid {BORDER};">
        <tr>
          {_hcell("Category")}
          {_hcell("Total", "center")}
          {_hcell("Resolved", "center")}
          {_hcell("In Progress", "center")}
          {_hcell("Unresolved", "center")}
          {_hcell("Rate", "center")}
          {_hcell("% Bar")}
        </tr>
        {cat_rows}
      </table>

      <div style="font-family:Arial,sans-serif;font-size:14px;font-weight:700;
                  color:{NAVY};border-left:4px solid {NAVY};padding-left:10px;
                  margin-bottom:10px;margin-top:24px;">
        Responsible Party Performance
      </div>
      <table width="100%" cellspacing="0" cellpadding="0"
             style="border-collapse:collapse;border:1px solid {BORDER};">
        <tr>
          {_hcell("Party")}
          {_hcell("Total", "center")}
          {_hcell("Resolved", "center")}
          {_hcell("In Progress", "center")}
          {_hcell("Unresolved", "center")}
          {_hcell("Rate", "center")}
          {_hcell("Grade", "center")}
        </tr>
        {resp_rows}
      </table>

      <div style="font-family:Arial,sans-serif;font-size:14px;font-weight:700;
                  color:{RED};border-left:4px solid {RED};padding-left:10px;
                  margin-bottom:10px;margin-top:24px;">
        Top 5 Unresolved Tickets (Oldest First)
      </div>
      <table width="100%" cellspacing="0" cellpadding="0"
             style="border-collapse:collapse;border:1px solid {BORDER};">
        <tr>
          {_hcell("Ticket #")}
          {_hcell("Customer")}
          {_hcell("Category")}
          {_hcell("Days Open", "center")}
          {_hcell("Responsible Party")}
        </tr>
        {unresolved_rows if unresolved_rows else f'<tr>{_cell("No unresolved tickets.", color=GREEN)}</tr>'}
      </table>

      {anomaly_box}
      {period_box}

    </td>
  </tr>

  <tr>
    <td style="background:{LIGHT};border-top:1px solid {BORDER};padding:12px 24px;">
      <table width="100%" cellspacing="0" cellpadding="0"><tr>
        <td style="font-family:Arial,sans-serif;font-size:10px;color:#94a3b8;">
          Sent from customercare@ekedp.com &nbsp;|&nbsp; EKEDP CX Reporting System
        </td>
        <td style="text-align:right;font-family:'Courier New',monospace;
                   font-size:10px;color:#94a3b8;">
          {gen_str}
        </td>
      </tr></table>
    </td>
  </tr>

</table>

</td></tr>
</table>
</body>
</html>"""
    return html


def build_responsible_html(resp_stats: dict) -> str:
    from datetime import datetime as _dt
    gen_str = _dt.now().strftime("%A, %d %B %Y at %H:%M WAT")

    rows = ""
    for rs in sorted(resp_stats.values(), key=lambda r: -r.resolution_rate):
        rows += f"""
        <tr>
          <td style="padding:8px 12px;font-family:Arial,sans-serif;font-size:13px;
                     color:{GREY};font-weight:700;border-bottom:1px solid {BORDER};">{rs.party}</td>
          <td style="padding:8px 12px;font-family:Arial,sans-serif;font-size:13px;
                     color:{GREY};text-align:center;border-bottom:1px solid {BORDER};">{rs.total}</td>
          <td style="padding:8px 12px;font-family:Arial,sans-serif;font-size:13px;
                     color:{GREEN};text-align:center;border-bottom:1px solid {BORDER};">{rs.resolved}</td>
          <td style="padding:8px 12px;font-family:Arial,sans-serif;font-size:13px;
                     color:{AMBER};text-align:center;border-bottom:1px solid {BORDER};">{rs.in_progress}</td>
          <td style="padding:8px 12px;font-family:Arial,sans-serif;font-size:13px;
                     color:{RED};text-align:center;border-bottom:1px solid {BORDER};">{rs.unresolved}</td>
          <td style="padding:8px 12px;font-family:Arial,sans-serif;font-size:13px;
                     color:{GREY};text-align:center;border-bottom:1px solid {BORDER};">{rs.resolution_rate:.1%}</td>
          <td style="padding:8px 12px;text-align:center;border-bottom:1px solid {BORDER};">{_grade_badge(rs.grade)}</td>
        </tr>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>EKEDP Responsible Party Summary</title>
<style>
  body {{ margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif; }}
  table.main {{ max-width:900px;margin:auto;background:#fff;border-radius:10px;
                overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.1); }}
</style>
</head>
<body>
<table class="main" width="900" cellspacing="0" cellpadding="0">
  <tr>
    <td style="background:{NAVY};padding:20px 24px;">
      <div style="font-size:18px;font-weight:900;color:{WHITE};">
        EKEDP — Responsible Party Performance
      </div>
      <div style="font-size:11px;color:rgba(255,255,255,.7);margin-top:4px;">
        Generated: {gen_str}
      </div>
    </td>
  </tr>
  <tr>
    <td style="padding:20px 24px;">
      <table width="100%" cellspacing="0" cellpadding="0"
             style="border-collapse:collapse;border:1px solid {BORDER};">
        <tr>
          <th style="background:{NAVY};color:{WHITE};font-family:Arial,sans-serif;
                     font-size:10px;font-weight:700;text-transform:uppercase;
                     padding:10px 12px;text-align:left;">Party</th>
          <th style="background:{NAVY};color:{WHITE};font-family:Arial,sans-serif;
                     font-size:10px;font-weight:700;text-transform:uppercase;
                     padding:10px 12px;text-align:center;">Total</th>
          <th style="background:{NAVY};color:{WHITE};font-family:Arial,sans-serif;
                     font-size:10px;font-weight:700;text-transform:uppercase;
                     padding:10px 12px;text-align:center;">Resolved</th>
          <th style="background:{NAVY};color:{WHITE};font-family:Arial,sans-serif;
                     font-size:10px;font-weight:700;text-transform:uppercase;
                     padding:10px 12px;text-align:center;">In Progress</th>
          <th style="background:{NAVY};color:{WHITE};font-family:Arial,sans-serif;
                     font-size:10px;font-weight:700;text-transform:uppercase;
                     padding:10px 12px;text-align:center;">Unresolved</th>
          <th style="background:{NAVY};color:{WHITE};font-family:Arial,sans-serif;
                     font-size:10px;font-weight:700;text-transform:uppercase;
                     padding:10px 12px;text-align:center;">Rate</th>
          <th style="background:{NAVY};color:{WHITE};font-family:Arial,sans-serif;
                     font-size:10px;font-weight:700;text-transform:uppercase;
                     padding:10px 12px;text-align:center;">Grade</th>
        </tr>
        {rows}
      </table>
    </td>
  </tr>
  <tr>
    <td style="background:#f8fafc;border-top:1px solid {BORDER};padding:12px 24px;">
      <span style="font-family:Arial,sans-serif;font-size:10px;color:#94a3b8;">
        EKEDP CX Reporting System &nbsp;·&nbsp; customercare@ekedp.com
      </span>
    </td>
  </tr>
</table>
</body>
</html>"""
