#!/usr/bin/env python3
"""
EKEDP Reporting System — CLI entry point.

Usage:
    python main.py verify --sp IssueTracker.csv --app export.json
    python main.py verify --sp IssueTracker.csv --app export.json --html report.html
    python main.py verify --sp IssueTracker.json --app export.json --verbose
    python main.py sample   # generate sample data for testing

Features planned (Feature 2–6 will be added as subcommands):
    anomaly     Feature 2: Anomaly detection
    executive   Feature 3: Executive detail report
    responsible Feature 4: Responsible party summary
    summary     Feature 5: Weekly / monthly executive summary
    email       Feature 6: Visual email report
"""

import argparse
import sys
from datetime import datetime
from pathlib import Path


def cmd_verify(args: argparse.Namespace) -> int:
    from ekedp_reports.loaders.sharepoint import load_sharepoint_csv, load_sharepoint_json
    from ekedp_reports.loaders.app_json import load_app_json
    from ekedp_reports.features.f1_verification import run_verification
    from ekedp_reports.reporters.console import print_verification_report
    from ekedp_reports.reporters.html_report import build_verification_html, write_html_file

    sp_path  = Path(args.sp)
    app_path = Path(args.app)

    # ── Load SharePoint data ──────────────────────────────────────────────────
    print(f"  Loading SharePoint data from: {sp_path}")
    suffix = sp_path.suffix.lower()
    if suffix == ".csv":
        sp_tickets = load_sharepoint_csv(sp_path)
    elif suffix in (".json", ".js"):
        sp_tickets = load_sharepoint_json(sp_path)
    else:
        print(f"  ERROR: Unknown SharePoint file format '{suffix}'. "
              "Use .csv or .json")
        return 1
    print(f"  → {len(sp_tickets)} SharePoint tickets loaded")

    # ── Load App data ─────────────────────────────────────────────────────────
    print(f"  Loading App JSON from: {app_path}")
    app_tickets = load_app_json(app_path)
    print(f"  → {len(app_tickets)} App tickets loaded")

    # ── Run verification ──────────────────────────────────────────────────────
    print("  Running verification…")
    results, summary = run_verification(sp_tickets, app_tickets)

    # ── Console output ────────────────────────────────────────────────────────
    print_verification_report(
        results,
        summary,
        verbose    = args.verbose,
        show_clean = args.show_clean,
    )

    # ── HTML output ───────────────────────────────────────────────────────────
    if args.html:
        html = build_verification_html(results, summary)
        out_path = write_html_file(html, args.html)
        print(f"  HTML report saved → {out_path}")

    return 1 if summary.mismatched > 0 else 0


def _load_sp_app(args: argparse.Namespace):
    """Shared loader used by verify and anomaly commands."""
    from ekedp_reports.loaders.sharepoint import load_sharepoint_csv, load_sharepoint_json
    from ekedp_reports.loaders.app_json import load_app_json
    from pathlib import Path as _Path

    sp_path  = _Path(args.sp)
    app_path = _Path(args.app)

    print(f"  Loading SharePoint data from: {sp_path}")
    suffix = sp_path.suffix.lower()
    if suffix == ".csv":
        sp_tickets = load_sharepoint_csv(sp_path)
    elif suffix in (".json", ".js"):
        sp_tickets = load_sharepoint_json(sp_path)
    else:
        print(f"  ERROR: Unknown SharePoint file format '{suffix}'.")
        return None, None
    print(f"  → {len(sp_tickets)} SharePoint tickets loaded")

    print(f"  Loading App JSON from: {app_path}")
    app_tickets = load_app_json(app_path)
    print(f"  → {len(app_tickets)} App tickets loaded")

    return sp_tickets, app_tickets


def cmd_anomaly(args: argparse.Namespace) -> int:
    from ekedp_reports.features.f2_anomaly import run_anomaly_detection
    from ekedp_reports.reporters.anomaly_report import print_anomaly_report, build_anomaly_html
    from ekedp_reports.reporters.html_report import write_html_file

    sp_tickets, app_tickets = _load_sp_app(args)
    if sp_tickets is None:
        return 1

    print("  Running anomaly detection…")
    anomalies, summary = run_anomaly_detection(sp_tickets, app_tickets)

    print_anomaly_report(anomalies, summary, verbose=args.verbose)

    if args.html:
        html = build_anomaly_html(anomalies, summary)
        out_path = write_html_file(html, args.html)
        print(f"  HTML report saved → {out_path}")

    return 1 if summary.total_anomalies > 0 else 0


def cmd_executive(args: argparse.Namespace) -> int:
    from ekedp_reports.features.f1_verification import run_verification
    from ekedp_reports.features.f2_anomaly import run_anomaly_detection
    from ekedp_reports.features.f3_executive import run_executive_report
    from ekedp_reports.reporters.console import print_executive_report
    from ekedp_reports.reporters.email_report import build_email_html
    from ekedp_reports.reporters.html_report import write_html_file

    sp_tickets, app_tickets = _load_sp_app(args)
    if sp_tickets is None:
        return 1

    print("  Running verification…")
    _, ver_summary = run_verification(sp_tickets, app_tickets)
    print("  Running anomaly detection…")
    _, anomaly_summary = run_anomaly_detection(sp_tickets, app_tickets)
    print("  Building executive report…")
    report = run_executive_report(sp_tickets, app_tickets,
                                  verification_results=ver_summary,
                                  anomaly_results=anomaly_summary)
    print_executive_report(report)

    if args.html:
        html = build_email_html(report, anomaly_summary=anomaly_summary)
        out_path = write_html_file(html, args.html)
        print(f"  HTML report saved → {out_path}")
    return 0


def cmd_responsible(args: argparse.Namespace) -> int:
    from ekedp_reports.features.f4_responsible import run_responsible_summary_full
    from ekedp_reports.reporters.console import print_responsible_report
    from ekedp_reports.reporters.email_report import build_responsible_html
    from ekedp_reports.reporters.html_report import write_html_file

    sp_tickets, app_tickets = _load_sp_app(args)
    if sp_tickets is None:
        return 1

    print("  Building responsible party summary…")
    resp_stats, _ = run_responsible_summary_full(sp_tickets, app_tickets)
    print_responsible_report(resp_stats)

    if args.html:
        html = build_responsible_html(resp_stats)
        out_path = write_html_file(html, args.html)
        print(f"  HTML report saved → {out_path}")
    return 0


def cmd_weekly(args: argparse.Namespace) -> int:
    from datetime import date as _date
    from ekedp_reports.features.f3_executive import run_executive_report
    from ekedp_reports.features.f5_summary import run_weekly_summary
    from ekedp_reports.reporters.console import print_period_summary
    from ekedp_reports.reporters.email_report import build_email_html
    from ekedp_reports.reporters.html_report import write_html_file

    sp_tickets, app_tickets = _load_sp_app(args)
    if sp_tickets is None:
        return 1

    week_start = None
    if args.week_start:
        week_start = _date.fromisoformat(args.week_start)

    print("  Building weekly summary…")
    period = run_weekly_summary(sp_tickets, app_tickets, week_start=week_start)
    print_period_summary(period)

    if args.html:
        exec_report = run_executive_report(sp_tickets, app_tickets)
        html = build_email_html(exec_report, period_summary=period)
        out_path = write_html_file(html, args.html)
        print(f"  HTML report saved → {out_path}")
    return 0


def cmd_monthly(args: argparse.Namespace) -> int:
    from datetime import date as _date
    from ekedp_reports.features.f3_executive import run_executive_report
    from ekedp_reports.features.f5_summary import run_monthly_summary
    from ekedp_reports.reporters.console import print_period_summary
    from ekedp_reports.reporters.email_report import build_email_html
    from ekedp_reports.reporters.html_report import write_html_file

    sp_tickets, app_tickets = _load_sp_app(args)
    if sp_tickets is None:
        return 1

    today = _date.today()
    year  = args.year  if args.year  else today.year
    month = args.month if args.month else today.month

    print("  Building monthly summary…")
    period = run_monthly_summary(sp_tickets, app_tickets, year=year, month=month)
    print_period_summary(period)

    if args.html:
        exec_report = run_executive_report(sp_tickets, app_tickets)
        html = build_email_html(exec_report, period_summary=period)
        out_path = write_html_file(html, args.html)
        print(f"  HTML report saved → {out_path}")
    return 0


def cmd_sample(args: argparse.Namespace) -> int:
    """Generate sample CSV + JSON files for testing."""
    from ekedp_reports.tests.sample_data import write_sample_files
    sp_path, app_path = write_sample_files(
        args.out_dir,
        n_total    = args.count,
        n_mismatch = args.mismatches,
        n_only_sp  = args.only_sp,
        n_only_app = args.only_app,
    )
    print(f"  Sample SharePoint CSV → {sp_path}")
    print(f"  Sample App JSON       → {app_path}")
    print(f"\n  Run verification:")
    print(f"  python main.py verify --sp {sp_path} --app {app_path} --html report.html")
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="ekedp-reports",
        description="EKEDP CX Reporting & Data Verification System",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # ── verify subcommand ─────────────────────────────────────────────────────
    p_verify = sub.add_parser("verify", help="Feature 1: Data verification")
    p_verify.add_argument("--sp",  required=True,
                          help="SharePoint CSV or JSON file path")
    p_verify.add_argument("--app", required=True,
                          help="App JSON export file path")
    p_verify.add_argument("--html", default=None,
                          help="Write HTML report to this file path")
    p_verify.add_argument("--verbose",    action="store_true",
                          help="Print full ticket details for each mismatch")
    p_verify.add_argument("--show-clean", action="store_true",
                          help="Also list clean-match tickets")

    # ── anomaly subcommand ────────────────────────────────────────────────────
    p_anomaly = sub.add_parser("anomaly", help="Feature 2: Anomaly detection")
    p_anomaly.add_argument("--sp",  required=True,
                           help="SharePoint CSV or JSON file path")
    p_anomaly.add_argument("--app", required=True,
                           help="App JSON export file path")
    p_anomaly.add_argument("--html", default=None,
                           help="Write HTML report to this file path")
    p_anomaly.add_argument("--verbose", action="store_true",
                           help="Print full ticket details for each anomaly")

    # ── executive subcommand ──────────────────────────────────────────────────
    p_exec = sub.add_parser("executive", help="Feature 3: Executive report")
    p_exec.add_argument("--sp",  required=True)
    p_exec.add_argument("--app", required=True)
    p_exec.add_argument("--html", default=None)

    # ── responsible subcommand ────────────────────────────────────────────────
    p_resp = sub.add_parser("responsible", help="Feature 4: Responsible party summary")
    p_resp.add_argument("--sp",  required=True)
    p_resp.add_argument("--app", required=True)
    p_resp.add_argument("--html", default=None)

    # ── weekly subcommand ─────────────────────────────────────────────────────
    p_weekly = sub.add_parser("weekly", help="Feature 5: Weekly summary")
    p_weekly.add_argument("--sp",  required=True)
    p_weekly.add_argument("--app", required=True)
    p_weekly.add_argument("--html", default=None)
    p_weekly.add_argument("--week-start", default=None,
                          help="Week start date YYYY-MM-DD (default: most recent Monday)")

    # ── monthly subcommand ────────────────────────────────────────────────────
    p_monthly = sub.add_parser("monthly", help="Feature 5: Monthly summary")
    p_monthly.add_argument("--sp",  required=True)
    p_monthly.add_argument("--app", required=True)
    p_monthly.add_argument("--html", default=None)
    p_monthly.add_argument("--year",  type=int, default=None)
    p_monthly.add_argument("--month", type=int, default=None)

    # ── sample subcommand ─────────────────────────────────────────────────────
    p_sample = sub.add_parser("sample", help="Generate sample test data")
    p_sample.add_argument("--out-dir",   default="sample_data",
                          help="Output directory (default: sample_data/)")
    p_sample.add_argument("--count",     type=int, default=50,
                          help="Total tickets to generate (default: 50)")
    p_sample.add_argument("--mismatches",type=int, default=8,
                          help="How many to make mismatched (default: 8)")
    p_sample.add_argument("--only-sp",   type=int, default=5,
                          help="How many only in SP (default: 5)")
    p_sample.add_argument("--only-app",  type=int, default=4,
                          help="How many only in App (default: 4)")

    args = parser.parse_args()

    # Make sure the package root is on the path when running as a script
    root = Path(__file__).parent
    if str(root) not in sys.path:
        sys.path.insert(0, str(root.parent))

    dispatch = {
        "verify":      cmd_verify,
        "anomaly":     cmd_anomaly,
        "sample":      cmd_sample,
        "executive":   cmd_executive,
        "responsible": cmd_responsible,
        "weekly":      cmd_weekly,
        "monthly":     cmd_monthly,
    }
    handler = dispatch.get(args.command)
    if not handler:
        parser.print_help()
        sys.exit(1)

    print(f"\n  EKEDP Reporting System — {args.command.upper()}")
    print(f"  {datetime.now().strftime('%A %d %B %Y %H:%M')}\n")
    sys.exit(handler(args))


if __name__ == "__main__":
    main()
