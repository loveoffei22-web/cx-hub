from typing import Dict, List, Tuple

from ..models import Ticket
from .f3_executive import RespStats, _build_merged, _norm, _grade


def run_responsible_summary(
    sp_tickets: List[Ticket],
    app_tickets: List[Ticket],
) -> Dict[str, RespStats]:
    tickets = _build_merged(sp_tickets, app_tickets)
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
    return resp_stats


def run_responsible_summary_full(
    sp_tickets: List[Ticket],
    app_tickets: List[Ticket],
) -> Tuple[Dict[str, RespStats], List[RespStats]]:
    resp_stats = run_responsible_summary(sp_tickets, app_tickets)
    sorted_list = sorted(resp_stats.values(), key=lambda rs: rs.resolution_rate)
    return resp_stats, sorted_list
