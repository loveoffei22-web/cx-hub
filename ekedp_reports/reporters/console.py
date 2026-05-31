"""
Console / plain-text reporter for Feature 1 verification results.
"""

from typing import List
from ..models import VerificationResult
from ..features.f1_verification import VerificationSummary


STATUS_ICONS = {
    "MATCH":       "✓",
    "MISMATCH":    "✗",
    "ONLY_IN_SP":  "◌",
    "ONLY_IN_APP": "◆",
}

STATUS_LABELS = {
    "MATCH":       "CLEAN MATCH",
    "MISMATCH":    "MISMATCH",
    "ONLY_IN_SP":  "ONLY IN SHAREPOINT",
    "ONLY_IN_APP": "ONLY IN APP",
}


def print_verification_report(
    results: List[VerificationResult],
    summary: VerificationSummary,
    verbose: bool = False,
    show_clean: bool = False,
) -> None:
    """
    Print a human-readable verification report to stdout.

    Args:
        results:    Output from run_verification()
        summary:    Summary from run_verification()
        verbose:    Print full ticket details for each mismatch
        show_clean: Also print clean-match rows (noisy; off by default)
    """
    print()
    print("═" * 65)
    print("  EKEDP DATA VERIFICATION REPORT")
    print("═" * 65)
    print(summary)

    # ── Group results ─────────────────────────────────────────────────────────
    mismatches  = [r for r in results if r.status == "MISMATCH"]
    only_sp     = [r for r in results if r.status == "ONLY_IN_SP"]
    only_app    = [r for r in results if r.status == "ONLY_IN_APP"]
    clean       = [r for r in results if r.status == "MATCH"]

    # ── Mismatches ────────────────────────────────────────────────────────────
    if mismatches:
        print(f"\n  ✗  MISMATCHES  ({len(mismatches)} tickets)\n")
        print(f"  {'Ticket':<12} {'Customer':<22} {'Field':<22} {'SharePoint':<20} {'App'}")
        print("  " + "-" * 100)
        for r in mismatches:
            sp  = r.sp_ticket
            app = r.app_ticket
            cust = (sp.customer_name if sp else (app.customer_name if app else ""))[:22]
            for i, mm in enumerate(r.mismatches):
                tid   = r.ticket_id if i == 0 else ""
                cname = cust if i == 0 else ""
                sp_v  = mm.sp_value[:20]  if mm.sp_value  else "—"
                app_v = mm.app_value[:35] if mm.app_value else "—"
                print(f"  #{tid:<11} {cname:<22} {mm.field_name:<22} {sp_v:<20} {app_v}")
            if verbose and r.sp_ticket:
                _print_ticket_details("  SP ", r.sp_ticket)
            if verbose and r.app_ticket:
                _print_ticket_details("  APP", r.app_ticket)
            print()

    # ── Only in SP ────────────────────────────────────────────────────────────
    if only_sp:
        print(f"\n  ◌  ONLY IN SHAREPOINT  ({len(only_sp)} tickets)\n")
        print(f"  {'Ticket':<12} {'Customer':<25} {'Status':<14} {'Category'}")
        print("  " + "-" * 75)
        for r in only_sp:
            t = r.sp_ticket
            print(f"  #{r.ticket_id:<11} {(t.customer_name or '')[:25]:<25}"
                  f" {t.status:<14} {(t.category or '')[:30]}")

    # ── Only in App ───────────────────────────────────────────────────────────
    if only_app:
        print(f"\n  ◆  ONLY IN APP  ({len(only_app)} tickets)\n")
        print(f"  {'Ticket':<12} {'Customer':<25} {'Status':<14} {'Agent':<20} {'Category'}")
        print("  " + "-" * 90)
        for r in only_app:
            t = r.app_ticket
            print(f"  #{r.ticket_id:<11} {(t.customer_name or '')[:25]:<25}"
                  f" {t.status:<14} {(t.agent or '')[:20]:<20} {(t.category or '')[:30]}")

    # ── Clean matches (opt-in) ────────────────────────────────────────────────
    if show_clean and clean:
        print(f"\n  ✓  CLEAN MATCHES  ({len(clean)} tickets)\n")
        for r in clean:
            sp = r.sp_ticket
            print(f"  #{r.ticket_id:<11} {(sp.customer_name or '')[:30]:<30} {sp.status}")

    print()
    print("═" * 65)


def _print_ticket_details(label: str, t) -> None:
    print(f"    {label}  #{t.ticket_id}  {t.customer_name}")
    print(f"         Status: {t.status}  |  Resp: {t.responsible_party}")
    print(f"         Category: {t.category}")
    print(f"         Action: {t.action_taken[:60] if t.action_taken else '—'}")


def format_summary_line(summary: VerificationSummary) -> str:
    """One-line summary string for logging / email subject."""
    return (
        f"SP:{summary.total_sp} | App:{summary.total_app} | "
        f"Matched:{summary.matched} | ✗:{summary.mismatched} | "
        f"OnlySP:{summary.only_in_sp} | OnlyApp:{summary.only_in_app}"
    )


def print_executive_report(report) -> None:
    print()
    print("═" * 65)
    print("  EKEDP EXECUTIVE REPORT")
    print("═" * 65)
    print(f"  Period          : {report.period_label}")
    print(f"  Generated       : {report.generated_at.strftime('%A %d %B %Y %H:%M')}")
    print(f"  SharePoint      : {report.total_sp} tickets")
    print(f"  App             : {report.total_app} tickets")
    print(f"  Total (merged)  : {report.total_tickets}")
    print()
    print(f"  Resolved        : {report.resolved}")
    print(f"  In Progress     : {report.in_progress}")
    print(f"  Unresolved      : {report.unresolved}")
    print(f"  Resolution Rate : {report.resolution_rate:.1%}")
    print(f"  SLA Breaches    : {report.sla_breach_count}")
    print(f"  Anomalies       : {report.anomaly_count}")
    print()
    if report.by_category:
        print(f"  {'Category':<40} {'Total':>5}  {'Resolved':>8}  {'Rate':>6}")
        print("  " + "-" * 65)
        for cs in sorted(report.by_category.values(), key=lambda c: -c.total):
            print(f"  {cs.category:<40} {cs.total:>5}  {cs.resolved:>8}  {cs.resolution_rate:>5.1%}")
    print()
    if report.top_unresolved:
        print(f"  Top {len(report.top_unresolved)} Oldest Unresolved:")
        for t in report.top_unresolved:
            age = f"{t.age_hours():.0f}h" if t.age_hours() else "?"
            print(f"    #{t.ticket_id:<10} {(t.customer_name or '')[:25]:<25} {age}")
    print()
    print("═" * 65)


def print_responsible_report(resp_stats: dict) -> None:
    print()
    print("═" * 65)
    print("  EKEDP RESPONSIBLE PARTY REPORT")
    print("═" * 65)
    print(f"  {'Party':<30} {'Total':>5}  {'Resolved':>8}  {'Rate':>6}  Grade")
    print("  " + "-" * 65)
    for rs in sorted(resp_stats.values(), key=lambda r: r.resolution_rate):
        print(f"  {rs.party:<30} {rs.total:>5}  {rs.resolved:>8}  "
              f"{rs.resolution_rate:>5.1%}  {rs.grade}")
    print()
    print("═" * 65)


def print_period_summary(ps) -> None:
    print()
    print("═" * 65)
    print(f"  EKEDP {ps.period_type.upper()} SUMMARY — {ps.period_label}")
    print("═" * 65)
    print(f"  Total tickets   : {ps.total}")
    print(f"  Resolved        : {ps.resolved}")
    print(f"  In Progress     : {ps.in_progress}")
    print(f"  Unresolved      : {ps.unresolved}")
    print(f"  Resolution Rate : {ps.resolution_rate:.1%}")
    print(f"  SLA Breaches    : {ps.sla_breach_count}")
    print(f"  Anomalies       : {ps.anomaly_count}")
    print(f"  Top Category    : {ps.top_category}")
    print(f"  Worst Performer : {ps.worst_resp_party}")
    print()
    if ps.by_category:
        print(f"  {'Category':<40} {'Total':>5}  {'Rate':>6}")
        print("  " + "-" * 55)
        for cs in sorted(ps.by_category.values(), key=lambda c: -c.total):
            print(f"  {cs.category:<40} {cs.total:>5}  {cs.resolution_rate:>5.1%}")
    print()
    print("═" * 65)
