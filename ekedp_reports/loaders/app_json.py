"""
App JSON loader — accepts the export format produced by the EKEDP Power App
(the same format written to localStorage ek_v2_tickets and exported via the
Agents Hub / Managers Hub Export screens).

Expected formats:
  1. {"tickets": [...], "exportedAt": "...", "exportedBy": {...}}
  2. {"data": [...], ...}
  3. [...]   — bare array

Usage:
    from loaders.app_json import load_app_json
    tickets = load_app_json("EKEDP_AllComplaints.json")
"""

import json
import re
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

from ..models import Ticket
from ..config import APP_FIELD_MAP, APP_STATUS_MAP


# ── helpers ───────────────────────────────────────────────────────────────────

def _parse_date(value: str) -> Optional[datetime]:
    if not value or not str(value).strip():
        return None
    value = str(value).strip()
    formats = [
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
        "%d/%m/%Y %H:%M:%S",
        "%d/%m/%Y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    return None


def _normalise_status(raw: str) -> str:
    key = str(raw).strip().lower()
    return APP_STATUS_MAP.get(key, raw.strip().upper())


def _normalise_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", str(phone) or "")
    if digits.startswith("234") and len(digits) >= 13:
        digits = "0" + digits[3:]
    return digits


def _item_to_ticket(item: Dict[str, Any]) -> Ticket:
    """Convert a raw app JSON item dict → Ticket."""

    # Build a normalised flat dict using APP_FIELD_MAP
    norm: Dict[str, str] = {}
    for raw_key, value in item.items():
        canonical = APP_FIELD_MAP.get(raw_key)
        if canonical and canonical not in norm:   # first mapping wins
            norm[canonical] = str(value) if value is not None else ""

    # ticket_id = the numeric ticket number shown as "#XXXXXX" in the app
    ticket_id = str(norm.get("app_id") or item.get("num") or "").strip()

    # created_at: prefer "created" over "receivedAt"
    created_raw  = item.get("created") or item.get("receivedAt") or norm.get("created_at", "")
    modified_raw = item.get("updatedAt") or item.get("modifiedAt") or norm.get("modified_at", "")

    # category: app stores it in both "category" and "issue" fields
    category  = (item.get("category") or item.get("issue") or "").strip().title()
    description = (item.get("issue") or item.get("category") or "").strip()

    agent = (item.get("agent") or item.get("agentId") or "").strip()

    return Ticket(
        ticket_id         = ticket_id,
        source            = "app",
        customer_name     = norm.get("customer_name", "").strip(),
        phone             = _normalise_phone(norm.get("phone", "")),
        meter             = re.sub(r"\s+", "", norm.get("meter", "")),
        address           = norm.get("address", "").strip(),
        email             = norm.get("email", "").strip().lower(),
        business_unit     = norm.get("business_unit", "").strip().upper(),
        description       = description,
        category          = category,
        status            = _normalise_status(norm.get("status", "")),
        responsible_party = norm.get("responsible_party", "").strip(),
        action_taken      = norm.get("action_taken", "").strip(),
        resolved_date     = norm.get("resolved_date", "").strip(),
        agent             = agent,
        created_at        = _parse_date(created_raw),
        modified_at       = _parse_date(modified_raw),
        raw               = item,
    )


# ── Public loader ─────────────────────────────────────────────────────────────

def load_app_json(path: str | Path) -> List[Ticket]:
    """
    Load tickets from an EKEDP Power App JSON export file.
    Returns a list of normalised Ticket objects.
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"App JSON not found: {path}")

    text = path.read_text(encoding="utf-8-sig")
    data = json.loads(text)

    # Unwrap envelope
    if isinstance(data, dict):
        items = data.get("tickets") or data.get("data") or []
        if not items:
            # Maybe the dict IS a single ticket
            if "num" in data or "id" in data:
                items = [data]
    elif isinstance(data, list):
        items = data
    else:
        raise ValueError("Unrecognised app JSON format")

    tickets: List[Ticket] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        t = _item_to_ticket(item)
        if not t.ticket_id:
            continue
        tickets.append(t)

    return tickets


def load_app_json_string(json_text: str) -> List[Ticket]:
    """
    Parse a raw app JSON string — useful when the JSON arrives as a string
    from Power Automate or a webhook rather than a file.
    """
    data = json.loads(json_text)
    if isinstance(data, dict):
        items = data.get("tickets") or data.get("data") or ([data] if "num" in data else [])
    else:
        items = data if isinstance(data, list) else []

    return [t for item in items
            if isinstance(item, dict)
            for t in [_item_to_ticket(item)]
            if t.ticket_id]
