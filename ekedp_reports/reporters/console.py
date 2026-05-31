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
