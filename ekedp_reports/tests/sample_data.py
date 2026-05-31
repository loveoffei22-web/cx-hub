"""
Sample data generator for Feature 1 testing.

Generates a pair of matching SharePoint CSV + App JSON files with
controllable numbers of clean matches, mismatches, SP-only, and app-only
tickets.

Usage:
    python main.py sample
    python main.py sample --count 100 --mismatches 15 --only-sp 8 --only-app 6
"""

import csv
import json
import random
import string
from datetime import datetime, timedelta
from pathlib import Path
from typing import Tuple


# ── Sample pools ──────────────────────────────────────────────────────────────

FIRST_NAMES = ["Adebayo", "Chioma", "Emeka", "Fatima", "Gbenga",
               "Hauwa", "Ibrahim", "Joke", "Kunle", "Lola",
               "Musa", "Ngozi", "Olu", "Patience", "Rotimi",
               "Sola", "Taiwo", "Uche", "Victor", "Wunmi"]

LAST_NAMES  = ["Adeyemi", "Bello", "Chukwu", "Dada", "Eze",
               "Fashola", "Garba", "Hassan", "Igwe", "Johnson",
               "Kalu", "Lawal", "Mohammed", "Nwosu", "Okafor",
               "Peters", "Quadri", "Raji", "Salami", "Thomas"]

ADDRESSES   = [
    "12 Marina Road, Lagos Island",
    "45 Broad Street, Lagos",
    "7 Victoria Island Close",
    "23 Apapa Quays Road",
    "18 Ikoyi Crescent",
    "3 Dolphin Estate, Ikoyi",
    "99 Ozumba Mbadiwe Avenue",
    "55 Adeola Odeku Street, VI",
    "81 Bode Thomas Street, Surulere",
    "14 Allen Avenue, Ikeja",
]

CATEGORIES = [
    "Interruption",
    "Voltage Fluctuation",
    "Safety",
    "Disconnection",
    "Metering",
    "Billing",
    "New Connection",
    "Vandalism",
    "Street Light",
    "Transformer Fault",
]

RESPONSIBLE_PARTIES = [
    "Akeem Salami",
    "David Obisesan",
    "Hafeez Aina",
    "Isiaka Yusuf",
    "Kunle Adeyemi",
    "Lola Bello",
    "Musa Garba",
    "Ngozi Okafor",
]

STATUSES = ["RESOLVED", "IN PROGRESS", "UNRESOLVED"]

BUSINESS_UNITS = ["IKEJA", "IKOYI", "APAPA", "ISLAND", "MAINLAND"]

AGENTS = ["agent001", "agent002", "agent003", "agent004"]

SP_STATUS_MAP = {
    "RESOLVED":    "Resolved",
    "IN PROGRESS": "In Progress",
    "UNRESOLVED":  "Unresolved",
}


def _rand_phone() -> str:
    return "0" + "".join(random.choices(string.digits, k=10))


def _rand_meter() -> str:
    return "".join(random.choices(string.digits, k=11))


def _rand_date(days_back: int = 90) -> datetime:
    return datetime.now() - timedelta(days=random.randint(0, days_back),
                                      hours=random.randint(0, 23),
                                      minutes=random.randint(0, 59))


def _rand_name() -> str:
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"


def _rand_ticket_id(existing: set) -> str:
    while True:
        tid = str(random.randint(700000, 799999))
        if tid not in existing:
            existing.add(tid)
            return tid


# ── Core generators ───────────────────────────────────────────────────────────

def _make_pair(ticket_id: str) -> Tuple[dict, dict]:
    """Create a matching SP row + App item for one ticket."""
    name   = _rand_name()
    phone  = _rand_phone()
    meter  = _rand_meter()
    addr   = random.choice(ADDRESSES)
    cat    = random.choice(CATEGORIES)
    resp   = random.choice(RESPONSIBLE_PARTIES)
    status = random.choice(STATUSES)
    bu     = random.choice(BUSINESS_UNITS)
    agent  = random.choice(AGENTS)
    created = _rand_date()
    action  = f"Technician dispatched on {created.strftime('%d/%m/%Y')}" if status != "UNRESOLVED" else ""

    # App stores action_taken in "actionTaken" key; same value as SP for clean match
    sp_row = {
        "ID":                   ticket_id,
        "Title":                name,
        "CustomerPhone":        phone,
        "MeterNumber":          meter,
        "Address":              addr,
        "Category":             cat,
        "Status":               SP_STATUS_MAP[status],
        "ResponsibleParty":     resp,
        "ActionTaken":          action,
        "BusinessUnit":         bu,
        "Created":              created.strftime("%d/%m/%Y %H:%M:%S"),
        "Modified":             created.strftime("%d/%m/%Y %H:%M:%S"),
    }

    app_item = {
        "num":          ticket_id,
        "name":         name,
        "phone":        phone,
        "meter":        meter,
        "address":      addr,
        "category":     cat,
        "status":       status.lower().replace(" ", "_"),
        "resp":         resp,
        "actionTaken":  action,   # same as SP — clean match by default
        "bu":           bu,
        "agent":        agent,
        "created":      created.strftime("%Y-%m-%dT%H:%M:%S"),
        "updatedAt":    created.strftime("%Y-%m-%dT%H:%M:%S"),
    }

    return sp_row, app_item


def _introduce_mismatch(sp_row: dict, app_item: dict) -> None:
    """Randomly alter one or two fields to create a detectable mismatch."""
    choices = ["status", "category", "resp"]
    random.shuffle(choices)
    for field in choices[:random.randint(1, 2)]:
        if field == "status":
            new_status = random.choice([s for s in STATUSES if s != app_item["status"].upper().replace("_", " ")])
            app_item["status"] = new_status.lower().replace(" ", "_")
        elif field == "category":
            new_cat = random.choice([c for c in CATEGORIES if c != sp_row["Category"]])
            app_item["category"] = new_cat
        elif field == "resp":
            new_resp = random.choice([r for r in RESPONSIBLE_PARTIES if r != sp_row["ResponsibleParty"]])
            app_item["resp"] = new_resp


# ── Public writer ─────────────────────────────────────────────────────────────

def write_sample_files(
    out_dir:    str  = "sample_data",
    n_total:    int  = 50,
    n_mismatch: int  = 8,
    n_only_sp:  int  = 5,
    n_only_app: int  = 4,
) -> Tuple[Path, Path]:
    """
    Generate and write sample SharePoint CSV + App JSON files.

    Args:
        out_dir:    Output directory path
        n_total:    Total matched tickets (both SP and App)
        n_mismatch: How many of the matched tickets to introduce mismatches in
        n_only_sp:  Tickets that appear only in SharePoint
        n_only_app: Tickets that appear only in the App

    Returns:
        (sp_path, app_path) — paths to the written files
    """
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)

    existing_ids: set = set()
    sp_rows:  list = []
    app_items: list = []

    # ── Matched tickets ───────────────────────────────────────────────────────
    mismatch_indices = set(random.sample(range(n_total), min(n_mismatch, n_total)))
    for i in range(n_total):
        tid = _rand_ticket_id(existing_ids)
        sp_row, app_item = _make_pair(tid)
        if i in mismatch_indices:
            _introduce_mismatch(sp_row, app_item)
        sp_rows.append(sp_row)
        app_items.append(app_item)

    # ── SP-only tickets ───────────────────────────────────────────────────────
    for _ in range(n_only_sp):
        tid = _rand_ticket_id(existing_ids)
        sp_row, _ = _make_pair(tid)
        sp_rows.append(sp_row)

    # ── App-only tickets ──────────────────────────────────────────────────────
    for _ in range(n_only_app):
        tid = _rand_ticket_id(existing_ids)
        _, app_item = _make_pair(tid)
        app_items.append(app_item)

    # ── Shuffle to make it realistic ──────────────────────────────────────────
    random.shuffle(sp_rows)
    random.shuffle(app_items)

    # ── Write CSV ─────────────────────────────────────────────────────────────
    sp_path = out / "IssueTracker_sample.csv"
    fieldnames = list(sp_rows[0].keys())
    with open(sp_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(sp_rows)

    # ── Write JSON ────────────────────────────────────────────────────────────
    app_path = out / "AppExport_sample.json"
    export = {
        "tickets":    app_items,
        "exportedAt": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "exportedBy": {"name": "Sample Generator", "role": "system"},
    }
    app_path.write_text(json.dumps(export, indent=2), encoding="utf-8")

    # ── Print summary ─────────────────────────────────────────────────────────
    print(f"\n  Generated sample data:")
    print(f"    Matched tickets      : {n_total}  ({len(mismatch_indices)} with mismatches)")
    print(f"    SP-only tickets      : {n_only_sp}")
    print(f"    App-only tickets     : {n_only_app}")
    print(f"    Total SP rows        : {len(sp_rows)}")
    print(f"    Total App items      : {len(app_items)}")

    return sp_path, app_path
