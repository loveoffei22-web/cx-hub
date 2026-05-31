"""
Feature 1 — Data Verification

Compares the EKEDP Power App JSON export against the SharePoint Issue
Tracker list.  Matching is done on ticket ID (app.num == SP.ID).

Fields compared:  status, responsible_party, category, action_taken
(configurable via config.COMPARE_FIELDS)

Outputs:
  - List[VerificationResult]  (machine-readable, consumed by reporters)
  - VerificationSummary       (aggregate counts)

Usage:
    from features.f1_verification import run_verification
    results, summary = run_verification(sp_tickets, app_tickets)
"""

from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional

from ..models import Ticket, VerificationResult, FieldMismatch
from ..config import COMPARE_FIELDS


# ── Normalisation helpers ─────────────────────────────────────────────────────

def _norm_str(value: str) -> str:
    """Lowercase, strip, collapse whitespace for fuzzy comparison."""
    return " ".join(str(value or "").lower().split())


def _compare_field(field_name: str, sp_val: str, app_val: str) -> Optional[FieldMismatch]:
    """
    Return a FieldMismatch if the two values are meaningfully different,
    None if they match (after normalisation).
    """
    sp_norm  = _norm_str(sp_val)
    app_norm = _norm_str(app_val)

    if sp_norm == app_norm:
        return None   # exact match after normalisation

    # Status-specific: handle common aliases
    if field_name == "status":
        # Both sides should already be canonical (RESOLVED/IN PROGRESS/UNRESOLVED)
        # but catch any remaining variants
        if sp_norm.replace(" ", "") == app_norm.replace(" ", ""):
            return None

    # Responsible party: partial match acceptable (last-name only, etc.)
    if field_name == "responsible_party":
        if sp_norm and app_norm:
            sp_words  = set(sp_norm.split())
            app_words = set(app_norm.split())
            if sp_words & app_words:          # at least one word in common
                return None

    # Category: partial match acceptable
    if field_name == "category":
        # e.g. "Interruption / Voltage / Safety / Disconnection" vs "Interruption"
        if sp_norm and app_norm:
            if sp_norm in app_norm or app_norm in sp_norm:
                return None

    # Action taken: non-empty app value is acceptable even if SP is blank
    if field_name == "action_taken":
        if not sp_norm:    # SP blank, app has something → not a mismatch, it's an update
            return None

    if not sp_norm and not app_norm:
        return None        # both blank

    return FieldMismatch(
        field_name = field_name,
        sp_value   = sp_val.strip(),
        app_value  = app_val.strip(),
    )


# ── Core verification logic ───────────────────────────────────────────────────

def _build_index(tickets: List[Ticket]) -> Dict[str, Ticket]:
    """
    Build a dict keyed by normalised ticket_id.
    When there are duplicates, keep the most recently modified one.
    """
    index: Dict[str, Ticket] = {}
    for t in tickets:
        key = _norm_str(t.ticket_id)
        if not key:
            continue
        existing = index.get(key)
        if existing is None:
            index[key] = t
        else:
            # Keep the one with the more recent modified_at
            if (t.modified_at and existing.modified_at
                    and t.modified_at > existing.modified_at):
                index[key] = t
            elif t.modified_at and not existing.modified_at:
                index[key] = t
    return index


def _verify_ticket(sp: Ticket, app: Ticket) -> VerificationResult:
    """Compare a matched SP + App ticket and return a VerificationResult."""
    mismatches: List[FieldMismatch] = []
    for f in COMPARE_FIELDS:
        sp_val  = getattr(sp,  f, "") or ""
        app_val = getattr(app, f, "") or ""
        mm = _compare_field(f, sp_val, app_val)
        if mm:
            mismatches.append(mm)

    return VerificationResult(
        ticket_id  = sp.ticket_id,
        status     = "MISMATCH" if mismatches else "MATCH",
        sp_ticket  = sp,
        app_ticket = app,
        mismatches = mismatches,
    )


# ── Summary dataclass ─────────────────────────────────────────────────────────

@dataclass
class VerificationSummary:
    total_sp:          int = 0
    total_app:         int = 0
    matched:           int = 0
    clean_match:       int = 0   # matched with zero mismatches
    mismatched:        int = 0
    only_in_sp:        int = 0
    only_in_app:       int = 0

    # Field-level breakdown
    mismatches_by_field: Dict[str, int] = field(default_factory=dict)

    @property
    def match_rate(self) -> float:
        return self.matched / self.total_sp if self.total_sp else 0.0

    @property
    def clean_rate(self) -> float:
        return self.clean_match / self.matched if self.matched else 0.0

    def __str__(self) -> str:
        lines = [
            "── Verification Summary ──────────────────────────────",
            f"  SharePoint records   : {self.total_sp}",
            f"  App records          : {self.total_app}",
            f"  Matched              : {self.matched} "
            f"({self.match_rate:.1%} of SP)",
            f"    ✓ Clean match      : {self.clean_match} "
            f"({self.clean_rate:.1%} of matched)",
            f"    ✗ Mismatch         : {self.mismatched}",
            f"  Only in SharePoint   : {self.only_in_sp}",
            f"  Only in App          : {self.only_in_app}",
        ]
        if self.mismatches_by_field:
            lines.append("  Mismatches by field  :")
            for f_name, count in sorted(self.mismatches_by_field.items(),
                                        key=lambda x: -x[1]):
                lines.append(f"    {f_name:<24} {count}")
        lines.append("─" * 54)
        return "\n".join(lines)


# ── Public entry point ────────────────────────────────────────────────────────

def run_verification(
    sp_tickets:  List[Ticket],
    app_tickets: List[Ticket],
) -> Tuple[List[VerificationResult], VerificationSummary]:
    """
    Run Feature 1 verification.

    Args:
        sp_tickets:  Tickets loaded from SharePoint (via loaders.sharepoint)
        app_tickets: Tickets loaded from app JSON  (via loaders.app_json)

    Returns:
        (results, summary)
        results  — one VerificationResult per ticket, sorted by ticket_id
        summary  — aggregate counts
    """
    sp_index  = _build_index(sp_tickets)
    app_index = _build_index(app_tickets)

    results: List[VerificationResult] = []
    summary = VerificationSummary(
        total_sp  = len(sp_index),
        total_app = len(app_index),
    )

    # ── Walk every SP ticket ──────────────────────────────────────────────────
    for key, sp_t in sp_index.items():
        app_t = app_index.get(key)
        if app_t is None:
            results.append(VerificationResult(
                ticket_id  = sp_t.ticket_id,
                status     = "ONLY_IN_SP",
                sp_ticket  = sp_t,
                app_ticket = None,
            ))
            summary.only_in_sp += 1
        else:
            vr = _verify_ticket(sp_t, app_t)
            results.append(vr)
            summary.matched += 1
            if vr.status == "MATCH":
                summary.clean_match += 1
            else:
                summary.mismatched += 1
                for mm in vr.mismatches:
                    summary.mismatches_by_field[mm.field_name] = (
                        summary.mismatches_by_field.get(mm.field_name, 0) + 1
                    )

    # ── Walk app tickets not in SP ────────────────────────────────────────────
    for key, app_t in app_index.items():
        if key not in sp_index:
            results.append(VerificationResult(
                ticket_id  = app_t.ticket_id,
                status     = "ONLY_IN_APP",
                sp_ticket  = None,
                app_ticket = app_t,
            ))
            summary.only_in_app += 1

    # Sort by ticket_id numerically where possible, else alphabetically
    def _sort_key(r: VerificationResult) -> tuple:
        try:
            return (0, int(r.ticket_id))
        except (ValueError, TypeError):
            return (1, r.ticket_id)

    results.sort(key=_sort_key)
    return results, summary


# ── Convenience filter helpers ────────────────────────────────────────────────

def filter_mismatches(results: List[VerificationResult]) -> List[VerificationResult]:
    return [r for r in results if r.status == "MISMATCH"]

def filter_only_in_app(results: List[VerificationResult]) -> List[VerificationResult]:
    return [r for r in results if r.status == "ONLY_IN_APP"]

def filter_only_in_sp(results: List[VerificationResult]) -> List[VerificationResult]:
    return [r for r in results if r.status == "ONLY_IN_SP"]

def filter_clean(results: List[VerificationResult]) -> List[VerificationResult]:
    return [r for r in results if r.status == "MATCH"]
