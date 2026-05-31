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

    dispatch = {"verify": cmd_verify, "anomaly": cmd_anomaly, "sample": cmd_sample}
    handler = dispatch.get(args.command)
    if not handler:
        parser.print_help()
        sys.exit(1)

    print(f"\n  EKEDP Reporting System — {args.command.upper()}")
    print(f"  {datetime.now().strftime('%A %d %B %Y %H:%M')}\n")
    sys.exit(handler(args))


if __name__ == "__main__":
    main()
