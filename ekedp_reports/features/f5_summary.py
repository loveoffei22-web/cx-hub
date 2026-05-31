from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from typing import Dict, List, Optional

from ..models import Ticket
from ..config import SLA_BREACH_HOURS
from .f3_executive import (
    CategoryStats, RespStats, _build_merged, _match_category,
    _grade, _norm,
)


@dataclass
class PeriodSummary:
    period_label: str
    period_type: str
    total: int
    resolved: int
    in_progress: int
    unresolved: int
    resolution_rate: float
    top_category: str
    worst_resp_party: str
    anomaly_count: int
    sla_breach_count: int
    by_category: Dict[str, CategoryStats] = field(default_factory=dict)
    by_responsible: Dict[str, RespStats] = field(default_factory=dict)


def _most_recent_monday() -> date:
    today = date.today()
    return today - timedelta(days=today.weekday())


def _compute_period(tickets: List[Ticket]) -> PeriodSummary:
    raise NotImplementedError


def _build_summary(
    tickets: List[Ticket],
    period_label: str,
    period_type: str,
) -> PeriodSummary:
    total = len(tickets)
    resolved = sum(1 for t in tickets if t.status == "RESOLVED")
    in_progress = sum(1 for t in tickets if t.status == "IN PROGRESS")
    unresolved = sum(1 for t in tickets if t.status == "UNRESOLVED")
    resolution_rate = resolved / total if total else 0.0

    sla_breach_count = sum(
        1 for t in tickets
        if t.status == "UNRESOLVED"
        and t.created_at is not None
        and (t.age_hours() or 0) > SLA_BREACH_HOURS
    )

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

    top_category = max(by_category.values(), key=lambda cs: cs.total).category if by_category else "—"

    by_responsible: Dict[str, RespStats] = {}
    for t in tickets:
        party = (t.responsible_party or "").strip() or "Unassigned"
        if party not in by_responsible:
            by_responsible[party] = RespStats(party=party)
        rs = by_responsible[party]
        rs.total += 1
        if t.status == "RESOLVED":
            rs.resolved += 1
        elif t.status == "IN PROGRESS":
            rs.in_progress += 1
        else:
            rs.unresolved += 1
    for rs in by_responsible.values():
        rs.resolution_rate = rs.resolved / rs.total if rs.total else 0.0
        rs.grade = _grade(rs.resolution_rate)

    qualified = [rs for rs in by_responsible.values() if rs.total >= 3]
    if qualified:
        worst_resp_party = min(qualified, key=lambda rs: rs.resolution_rate).party
    elif by_responsible:
        worst_resp_party = min(by_responsible.values(), key=lambda rs: rs.resolution_rate).party
    else:
        worst_resp_party = "—"

    return PeriodSummary(
        period_label=period_label,
        period_type=period_type,
        total=total,
        resolved=resolved,
        in_progress=in_progress,
        unresolved=unresolved,
        resolution_rate=resolution_rate,
        top_category=top_category,
        worst_resp_party=worst_resp_party,
        anomaly_count=0,
        sla_breach_count=sla_breach_count,
        by_category=by_category,
        by_responsible=by_responsible,
    )


def run_weekly_summary(
    sp_tickets: List[Ticket],
    app_tickets: List[Ticket],
    week_start: Optional[date] = None,
) -> PeriodSummary:
    if week_start is None:
        week_start = _most_recent_monday()
    week_end = week_start + timedelta(days=7)
    all_tickets = _build_merged(sp_tickets, app_tickets)
    filtered = [
        t for t in all_tickets
        if t.created_at and week_start <= t.created_at.date() < week_end
    ]
    start_str = week_start.strftime("%d %b")
    end_str = (week_end - timedelta(days=1)).strftime("%d %b %Y")
    label = f"Week {start_str}–{end_str}"
    return _build_summary(filtered, label, "weekly")


def run_monthly_summary(
    sp_tickets: List[Ticket],
    app_tickets: List[Ticket],
    year: int,
    month: int,
) -> PeriodSummary:
    all_tickets = _build_merged(sp_tickets, app_tickets)
    filtered = [
        t for t in all_tickets
        if t.created_at and t.created_at.year == year and t.created_at.month == month
    ]
    label = datetime(year, month, 1).strftime("%B %Y")
    return _build_summary(filtered, label, "monthly")
