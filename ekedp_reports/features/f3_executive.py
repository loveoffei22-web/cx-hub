from dataclasses import dataclass, field
from datetime import datetime, date
from typing import Dict, List, Optional, Tuple

from ..models import Ticket
from ..config import (
    CATEGORIES, RESPONSIBLE_PARTIES, SLA_BREACH_HOURS,
    PERFORMANCE_GOOD, PERFORMANCE_WARNING,
)


@dataclass
class CategoryStats:
    category: str
    total: int = 0
    resolved: int = 0
    in_progress: int = 0
    unresolved: int = 0
    resolution_rate: float = 0.0
    sla_breach: int = 0


@dataclass
class RespStats:
    party: str
    total: int = 0
    resolved: int = 0
    in_progress: int = 0
    unresolved: int = 0
    resolution_rate: float = 0.0
    grade: str = ""


@dataclass
class ExecutiveReport:
    generated_at: datetime
    total_tickets: int
    total_sp: int
    total_app: int
    resolved: int
    in_progress: int
    unresolved: int
    resolution_rate: float
    sla_breach_count: int
    anomaly_count: int
    by_category: Dict[str, CategoryStats]
    top_unresolved: List[Ticket]
    responsible_party_stats: Dict[str, RespStats]
    period_label: str


def _norm(val: str) -> str:
    return str(val or "").strip().lower()


def _match_category(cat: str) -> str:
    cat_lower = _norm(cat)
    if not cat_lower:
        return "Other"
    for c in CATEGORIES:
        if _norm(c) in cat_lower or cat_lower in _norm(c):
            return c
    for c in CATEGORIES:
        words = _norm(c).split()
        if any(w in cat_lower for w in words if len(w) > 3):
            return c
    return "Other"


def _grade(rate: float) -> str:
    if rate >= PERFORMANCE_GOOD:
        return "MEETS TARGET"
    if rate >= PERFORMANCE_WARNING:
        return "NEEDS IMPROVEMENT"
    return "BELOW TARGET"


def _build_merged(sp_tickets: List[Ticket], app_tickets: List[Ticket]) -> List[Ticket]:
    merged: Dict[str, Ticket] = {}
    for t in sp_tickets:
        key = _norm(t.ticket_id)
        if key:
            merged[key] = t
    for t in app_tickets:
        key = _norm(t.ticket_id)
        if key and key not in merged:
            merged[key] = t
    return list(merged.values())


def _period_label(tickets: List[Ticket]) -> str:
    dates = [t.created_at for t in tickets if t.created_at]
    if not dates:
        now = datetime.now()
        return now.strftime("%B %Y")
    earliest = min(dates)
    latest = max(dates)
    span = (latest - earliest).days
    if span <= 7:
        return f"Week of {earliest.strftime('%d %B %Y')}"
    return earliest.strftime("%B %Y")


def run_executive_report(
    sp_tickets: List[Ticket],
    app_tickets: List[Ticket],
    verification_results=None,
    anomaly_results=None,
) -> ExecutiveReport:
    tickets = _build_merged(sp_tickets, app_tickets)

    resolved = sum(1 for t in tickets if t.status == "RESOLVED")
    in_progress = sum(1 for t in tickets if t.status == "IN PROGRESS")
    unresolved = sum(1 for t in tickets if t.status == "UNRESOLVED")
    total = len(tickets)
    resolution_rate = resolved / total if total else 0.0

    sla_breach_count = sum(
        1 for t in tickets
        if t.status == "UNRESOLVED"
        and t.created_at is not None
        and (t.age_hours() or 0) > SLA_BREACH_HOURS
    )

    anomaly_count = 0
    if anomaly_results is not None:
        anomaly_count = anomaly_results.total_anomalies

    by_category: Dict[str, CategoryStats] = {}
    for t in tickets:
        cat = _match_category(t.category)
        if cat not in by_category:
            by_category[cat] = CategoryStats(category=cat)
        cs = by_category[cat]
        cs.total += 1
        if t.status == "RESOLVED":
            cs.resolved += 1
        elif t.status == "IN PROGRESS":
            cs.in_progress += 1
        else:
            cs.unresolved += 1
        if (t.status == "UNRESOLVED" and t.created_at is not None
                and (t.age_hours() or 0) > SLA_BREACH_HOURS):
            cs.sla_breach += 1
    for cs in by_category.values():
        cs.resolution_rate = cs.resolved / cs.total if cs.total else 0.0

    top_unresolved = sorted(
        [t for t in tickets if t.status == "UNRESOLVED" and t.created_at],
        key=lambda t: t.created_at,
    )[:5]

    resp_stats: Dict[str, RespStats] = {}
    for t in tickets:
        party = (t.responsible_party or "").strip() or "Unassigned"
        if party not in resp_stats:
            resp_stats[party] = RespStats(party=party)
        rs = resp_stats[party]
        rs.total += 1
        if t.status == "RESOLVED":
            rs.resolved += 1
        elif t.status == "IN PROGRESS":
            rs.in_progress += 1
        else:
            rs.unresolved += 1
    for rs in resp_stats.values():
        rs.resolution_rate = rs.resolved / rs.total if rs.total else 0.0
        rs.grade = _grade(rs.resolution_rate)

    return ExecutiveReport(
        generated_at=datetime.now(),
        total_tickets=total,
        total_sp=len(sp_tickets),
        total_app=len(app_tickets),
        resolved=resolved,
        in_progress=in_progress,
        unresolved=unresolved,
        resolution_rate=resolution_rate,
        sla_breach_count=sla_breach_count,
        anomaly_count=anomaly_count,
        by_category=by_category,
        top_unresolved=top_unresolved,
        responsible_party_stats=resp_stats,
        period_label=_period_label(tickets),
    )
