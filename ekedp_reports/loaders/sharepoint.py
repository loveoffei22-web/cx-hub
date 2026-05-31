"""
SharePoint loader — accepts either a CSV file exported from the Issue Tracker
list OR a JSON payload from the SharePoint REST API.

Usage:
    from loaders.sharepoint import load_sharepoint_csv, load_sharepoint_api

    tickets = load_sharepoint_csv("IssueTracker.csv")
    tickets = load_sharepoint_api(site_url, list_id, access_token)
"""

import csv
import json
import re
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
from io import StringIO

from ..models import Ticket
from ..config import SP_COLUMN_ALIASES, SP_STATUS_MAP


# ── helpers ───────────────────────────────────────────────────────────────────

def _normalise_key(raw: str) -> str:
    """Strip whitespace, lowercase, remove non-alphanum for column alias lookup."""
    return re.sub(r"[^a-z0-9]", "", raw.strip().lower())


def _map_columns(header: List[str]) -> Dict[int, str]:
    """
    Build index→canonical-name map for CSV header row.
    Unrecognised columns are kept as-is (lowercased, underscored).
    """
    mapping: Dict[int, str] = {}
    for idx, col in enumerate(header):
        norm = _normalise_key(col)
        canonical = SP_COLUMN_ALIASES.get(norm) or SP_COLUMN_ALIASES.get(col.strip().lower())
        mapping[idx] = canonical if canonical else col.strip().lower().replace(" ", "_")
    return mapping


def _parse_date(value: str) -> Optional[datetime]:
    if not value or not value.strip():
        return None
    value = value.strip()
    formats = [
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
        "%d/%m/%Y %H:%M:%S",
        "%d/%m/%Y",
        "%m/%d/%Y %H:%M:%S",
        "%m/%d/%Y",
        "%d-%b-%Y",
        "%d-%b-%Y %H:%M:%S",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    return None


def _normalise_status(raw: str) -> str:
    key = raw.strip().lower()
    return SP_STATUS_MAP.get(key, raw.strip().upper())


def _normalise_phone(phone: str) -> str:
    """Strip all non-digit characters; prepend 0 if starts with country code 234."""
    digits = re.sub(r"\D", "", phone or "")
    if digits.startswith("234") and len(digits) >= 13:
        digits = "0" + digits[3:]
    return digits


def _row_to_ticket(row: Dict[str, str]) -> Ticket:
    """Convert a normalised CSV row dict to a Ticket object."""
    raw_id = row.get("sp_id") or row.get("id") or ""

    return Ticket(
        ticket_id         = str(raw_id).strip(),
        source            = "sharepoint",
        customer_name     = row.get("customer_name", "").strip(),
        phone             = _normalise_phone(row.get("phone", "")),
        meter             = re.sub(r"\s+", "", row.get("meter", "")),
        address           = row.get("address", "").strip(),
        email             = row.get("email", "").strip().lower(),
        business_unit     = row.get("business_unit", "").strip().upper(),
        description       = row.get("description", "").strip(),
        category          = row.get("category", "").strip().title(),
        status            = _normalise_status(row.get("status", "")),
        responsible_party = row.get("responsible_party", "").strip(),
        action_taken      = row.get("action_taken", "").strip(),
        resolved_date     = row.get("resolved_date", "").strip(),
        agent             = row.get("agent", "").strip(),
        created_at        = _parse_date(row.get("created_at", "")),
        modified_at       = _parse_date(row.get("modified_at", "")),
        raw               = dict(row),
    )


# ── Public loaders ─────────────────────────────────────────────────────────────

def load_sharepoint_csv(path: str | Path) -> List[Ticket]:
    """
    Load tickets from a SharePoint CSV export.

    The function auto-detects BOM, CRLF, and common column name variants.
    Returns a list of normalised Ticket objects.
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"SharePoint CSV not found: {path}")

    text = path.read_text(encoding="utf-8-sig")   # utf-8-sig strips BOM
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    reader = csv.reader(StringIO(text))
    rows = list(reader)
    if not rows:
        raise ValueError("SharePoint CSV is empty")

    header = rows[0]
    col_map = _map_columns(header)

    tickets: List[Ticket] = []
    for line_no, raw_row in enumerate(rows[1:], start=2):
        if not any(cell.strip() for cell in raw_row):
            continue   # skip blank lines
        row_dict: Dict[str, str] = {}
        for idx, value in enumerate(raw_row):
            canonical = col_map.get(idx, f"col_{idx}")
            row_dict[canonical] = value
        t = _row_to_ticket(row_dict)
        if not t.ticket_id:
            print(f"  [SP loader] Line {line_no}: skipped — no ticket ID")
            continue
        tickets.append(t)

    return tickets


def load_sharepoint_json(path: str | Path) -> List[Ticket]:
    """
    Load tickets from a SharePoint REST API JSON response saved to file.
    Expects either:
      - {"value": [...]} — standard OData list response
      - [...] — plain array
    """
    path = Path(path)
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    items = data.get("value", data) if isinstance(data, dict) else data
    if not isinstance(items, list):
        raise ValueError("Could not find a list of items in the JSON file")

    tickets: List[Ticket] = []
    for item in items:
        row = {SP_COLUMN_ALIASES.get(_normalise_key(k), k.lower()): str(v or "")
               for k, v in item.items()}
        t = _row_to_ticket(row)
        if t.ticket_id:
            tickets.append(t)
    return tickets


def load_sharepoint_api_response(json_text: str) -> List[Ticket]:
    """
    Parse a raw SharePoint REST API response string (for use inside Power Automate
    or any runtime that gives you the JSON as a string).
    """
    data = json.loads(json_text)
    items = data.get("value", data) if isinstance(data, dict) else data
    tickets: List[Ticket] = []
    for item in items:
        row = {SP_COLUMN_ALIASES.get(_normalise_key(k), k.lower()): str(v or "")
               for k, v in item.items()}
        t = _row_to_ticket(row)
        if t.ticket_id:
            tickets.append(t)
    return tickets
