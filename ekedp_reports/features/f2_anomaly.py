"""
Feature 2 — Anomaly Detection

Scans the merged ticket pool for six classes of anomaly:

  1. DUPLICATE_PHONE    — same customer phone number on more than one ticket
  2. DUPLICATE_METER    — same meter number on more than one ticket
  3. SLA_BREACH         — UNRESOLVED ticket open longer than SLA_BREACH_HOURS (72 h)
  4. MISSING_RESP       — ticket exists but Responsible Party column is blank
  5. STATUS_MISMATCH    — SP says RESOLVED but App says UNRESOLVED (or vice-versa)
  6. REPEAT_COMPLAINANT — same phone number appears on 3+ distinct tickets
  7. ORPHANED           — ticket in App not found in SharePoint (alias for ONLY_IN_APP)

Usage:
    from features.f2_anomaly import run_anomaly_detection
    anomalies, summary = run_anomaly_detection(sp_tickets, app_tickets)
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Dict, Optional, Tuple

from ..models import Ticket
from ..config import SLA_BREACH_HOURS, REPEAT_COMPLAINANT_THRESHOLD


# ── Anomaly dataclass ─────────────────────────────────────────────────────────

@dataclass
class Anomaly:
    anomaly_type:  str            # one of the 7 types above
    ticket_id:     str
    description:   str            # human-readable explanation
    severity:      str            # "HIGH" | "MEDIUM" | "LOW"
    sp_ticket:     Optional[Ticket] = None
    app_ticket:    Optional[Ticket] = None
    related_ids:   List[str] = field(default_factory=list)  # other affected ticket IDs


@dataclass
class AnomalySummary:
    total_tickets_checked: int = 0
    total_anomalies:       int = 0

    duplicate_phone:    int = 0
    duplicate_meter:    int = 0
    sla_breach:         int = 0
    missing_resp:       int = 0
    status_mismatch:    int = 0
    repeat_complainant: int = 0
    orphaned:           int = 0

    # Affected ticket IDs per type (for quick lookup)
    by_type: Dict[str, List[str]] = field(default_factory=dict)

    def __str__(self) -> str:
        lines = [
            "── Anomaly Detection Summary ─────────────────────────",
            f"  Tickets checked      : {self.total_tickets_checked}",
            f"  Total anomalies      : {self.total_anomalies}",
            f"",
            f"  HIGH severity",
            f"    SLA breach (>72h)  : {self.sla_breach}",
            f"    Status mismatch    : {self.status_mismatch}",
            f"  MEDIUM severity",
            f"    Duplicate phone    : {self.duplicate_phone}",
            f"    Duplicate meter    : {self.duplicate_meter}",
            f"    Repeat complainant : {self.repeat_complainant}",
            f"    Orphaned (App only): {self.orphaned}",
            f"  LOW severity",
            f"    Missing resp party : {self.missing_resp}",
            "─" * 54,
        ]
        return "\n".join(lines)


# ── Detection helpers ─────────────────────────────────────────────────────────

def _hours_open(ticket: Ticket) -> Optional[float]:
    """Return hours since ticket was created, or None if date unknown."""
    if not ticket.created_at:
        return None
    now = datetime.now()
    delta = now - ticket.created_at.replace(tzinfo=None) if ticket.created_at.tzinfo else now - ticket.created_at
    return delta.total_seconds() / 3600


def _norm(val: str) -> str:
    return str(val or "").strip().lower()


# ── Main entry point ──────────────────────────────────────────────────────────

def run_anomaly_detection(
    sp_tickets:  List[Ticket],
    app_tickets: List[Ticket],
) -> Tuple[List[Anomaly], AnomalySummary]:
    """
    Run Feature 2 anomaly detection over all tickets.

    Args:
        sp_tickets:  Tickets loaded from SharePoint
        app_tickets: Tickets loaded from App JSON

    Returns:
        (anomalies, summary)
    """
    anomalies: List[Anomaly] = []
    summary   = AnomalySummary(total_tickets_checked=len(sp_tickets) + len(app_tickets))

    # Build indexes
    sp_by_id: Dict[str, Ticket] = {_norm(t.ticket_id): t for t in sp_tickets if t.ticket_id}
    app_by_id: Dict[str, Ticket] = {_norm(t.ticket_id): t for t in app_tickets if t.ticket_id}

    # ── 1 & 2. Duplicate phone / meter ───────────────────────────────────────
    phone_map: Dict[str, List[Ticket]] = {}
    meter_map: Dict[str, List[Ticket]] = {}

    all_tickets = sp_tickets + app_tickets
    for t in all_tickets:
        p = _norm(t.phone)
        if p and len(p) >= 7:
            phone_map.setdefault(p, []).append(t)
        m = _norm(t.meter)
        if m and len(m) >= 6:
            meter_map.setdefault(m, []).append(t)

    seen_dup_phones: set = set()
    for phone, tix in phone_map.items():
        # Deduplicate by ticket_id so we don't double-count SP+App for same ticket
        unique_ids = list({_norm(t.ticket_id) for t in tix if t.ticket_id})
        if len(unique_ids) > 1:
            if phone in seen_dup_phones:
                continue
            seen_dup_phones.add(phone)
            names = list({t.customer_name for t in tix if t.customer_name})
            cname = names[0] if names else "Unknown"
            for tid in unique_ids:
                sp_t = sp_by_id.get(tid)
                app_t = app_by_id.get(tid)
                anomalies.append(Anomaly(
                    anomaly_type = "DUPLICATE_PHONE",
                    ticket_id    = tid,
                    description  = f"Phone {phone} appears on {len(unique_ids)} tickets (customer: {cname})",
                    severity     = "MEDIUM",
                    sp_ticket    = sp_t,
                    app_ticket   = app_t,
                    related_ids  = [x for x in unique_ids if x != tid],
                ))
                summary.duplicate_phone += 1

    seen_dup_meters: set = set()
    for meter, tix in meter_map.items():
        unique_ids = list({_norm(t.ticket_id) for t in tix if t.ticket_id})
        if len(unique_ids) > 1:
            if meter in seen_dup_meters:
                continue
            seen_dup_meters.add(meter)
            for tid in unique_ids:
                sp_t = sp_by_id.get(tid)
                app_t = app_by_id.get(tid)
                anomalies.append(Anomaly(
                    anomaly_type = "DUPLICATE_METER",
                    ticket_id    = tid,
                    description  = f"Meter {meter} appears on {len(unique_ids)} tickets",
                    severity     = "MEDIUM",
                    sp_ticket    = sp_t,
                    app_ticket   = app_t,
                    related_ids  = [x for x in unique_ids if x != tid],
                ))
                summary.duplicate_meter += 1

    # ── 3. SLA breach ─────────────────────────────────────────────────────────
    checked_sla: set = set()
    for t in all_tickets:
        tid = _norm(t.ticket_id)
        if not tid or tid in checked_sla:
            continue
        if _norm(t.status) in ("unresolved", "open", "pending", "new"):
            hours = _hours_open(t)
            if hours is not None and hours > SLA_BREACH_HOURS:
                checked_sla.add(tid)
                sp_t  = sp_by_id.get(tid)
                app_t = app_by_id.get(tid)
                anomalies.append(Anomaly(
                    anomaly_type = "SLA_BREACH",
                    ticket_id    = tid,
                    description  = f"Unresolved for {hours:.0f}h (SLA: {SLA_BREACH_HOURS}h)",
                    severity     = "HIGH",
                    sp_ticket    = sp_t,
                    app_ticket   = app_t,
                ))
                summary.sla_breach += 1

    # ── 4. Missing responsible party ─────────────────────────────────────────
    checked_resp: set = set()
    for t in all_tickets:
        tid = _norm(t.ticket_id)
        if not tid or tid in checked_resp:
            continue
        if not _norm(t.responsible_party):
            checked_resp.add(tid)
            sp_t  = sp_by_id.get(tid)
            app_t = app_by_id.get(tid)
            anomalies.append(Anomaly(
                anomaly_type = "MISSING_RESP",
                ticket_id    = tid,
                description  = "Responsible party is blank",
                severity     = "LOW",
                sp_ticket    = sp_t,
                app_ticket   = app_t,
            ))
            summary.missing_resp += 1

    # ── 5. Status mismatch (SP resolved ↔ App unresolved) ────────────────────
    for key in sp_by_id:
        if key not in app_by_id:
            continue
        sp_t  = sp_by_id[key]
        app_t = app_by_id[key]
        sp_s  = _norm(sp_t.status)
        app_s = _norm(app_t.status)
        if sp_s == app_s:
            continue
        resolved_set   = {"resolved", "resolution"}
        unresolved_set = {"unresolved", "open", "new", "pending"}
        sp_resolved  = any(s in sp_s  for s in resolved_set)
        app_resolved = any(s in app_s for s in resolved_set)
        sp_unr       = any(s in sp_s  for s in unresolved_set)
        app_unr      = any(s in app_s for s in unresolved_set)
        if (sp_resolved and app_unr) or (sp_unr and app_resolved):
            anomalies.append(Anomaly(
                anomaly_type = "STATUS_MISMATCH",
                ticket_id    = key,
                description  = f"SP={sp_t.status} but App={app_t.status}",
                severity     = "HIGH",
                sp_ticket    = sp_t,
                app_ticket   = app_t,
            ))
            summary.status_mismatch += 1

    # ── 6. Repeat complainant ─────────────────────────────────────────────────
    repeat_seen: set = set()
    for phone, tix in phone_map.items():
        unique_ids = list({_norm(t.ticket_id) for t in tix if t.ticket_id})
        if len(unique_ids) >= REPEAT_COMPLAINANT_THRESHOLD:
            if phone in repeat_seen:
                continue
            repeat_seen.add(phone)
            names = list({t.customer_name for t in tix if t.customer_name})
            cname = names[0] if names else "Unknown"
            # One anomaly record per phone group, attached to the first ticket
            first_id = unique_ids[0]
            anomalies.append(Anomaly(
                anomaly_type = "REPEAT_COMPLAINANT",
                ticket_id    = first_id,
                description  = f"Phone {phone} ({cname}) has {len(unique_ids)} tickets (threshold: {REPEAT_COMPLAINANT_THRESHOLD})",
                severity     = "MEDIUM",
                sp_ticket    = sp_by_id.get(first_id),
                app_ticket   = app_by_id.get(first_id),
                related_ids  = unique_ids[1:],
            ))
            summary.repeat_complainant += 1

    # ── 7. Orphaned tickets (App only) ────────────────────────────────────────
    for key, app_t in app_by_id.items():
        if key not in sp_by_id:
            anomalies.append(Anomaly(
                anomaly_type = "ORPHANED",
                ticket_id    = key,
                description  = "Ticket exists in App but not in SharePoint",
                severity     = "MEDIUM",
                sp_ticket    = None,
                app_ticket   = app_t,
            ))
            summary.orphaned += 1

    summary.total_anomalies = len(anomalies)

    # Build by_type index
    for a in anomalies:
        summary.by_type.setdefault(a.anomaly_type, []).append(a.ticket_id)

    # Sort: HIGH first, then MEDIUM, then LOW; within severity by ticket_id
    _sev_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    anomalies.sort(key=lambda a: (_sev_order.get(a.severity, 3), a.ticket_id))

    return anomalies, summary


# ── Convenience filters ───────────────────────────────────────────────────────

def filter_by_type(anomalies: List[Anomaly], anomaly_type: str) -> List[Anomaly]:
    return [a for a in anomalies if a.anomaly_type == anomaly_type]

def filter_high(anomalies: List[Anomaly]) -> List[Anomaly]:
    return [a for a in anomalies if a.severity == "HIGH"]

def filter_medium(anomalies: List[Anomaly]) -> List[Anomaly]:
    return [a for a in anomalies if a.severity == "MEDIUM"]
