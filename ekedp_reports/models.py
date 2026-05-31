"""
Shared data models — every loader produces these; every feature consumes them.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Dict, Any


@dataclass
class Ticket:
    """
    Canonical ticket representation.  Both SharePoint and app data
    are normalised into this before any comparison or analysis.
    """
    # ── Identity ──────────────────────────────────────────────────────────────
    ticket_id:        str            # the matching key (num / SP ID)
    source:           str            # "sharepoint" | "app" | "merged"

    # ── Customer ──────────────────────────────────────────────────────────────
    customer_name:    str  = ""
    phone:            str  = ""
    meter:            str  = ""
    address:          str  = ""
    email:            str  = ""
    business_unit:    str  = ""

    # ── Complaint ─────────────────────────────────────────────────────────────
    description:      str  = ""
    category:         str  = ""

    # ── Resolution ────────────────────────────────────────────────────────────
    status:           str  = ""      # canonical: RESOLVED / IN PROGRESS / UNRESOLVED
    responsible_party:str  = ""
    action_taken:     str  = ""
    resolved_date:    str  = ""

    # ── Metadata ──────────────────────────────────────────────────────────────
    agent:            str  = ""
    created_at:       Optional[datetime] = None
    modified_at:      Optional[datetime] = None

    # ── Raw fields (preserved for debugging) ─────────────────────────────────
    raw:              Dict[str, Any] = field(default_factory=dict)

    def age_hours(self, as_of: Optional[datetime] = None) -> Optional[float]:
        """Hours since ticket was created (relative to `as_of`, default now)."""
        if not self.created_at:
            return None
        ref = as_of or datetime.utcnow()
        delta = ref - self.created_at.replace(tzinfo=None) if self.created_at.tzinfo else ref - self.created_at
        return delta.total_seconds() / 3600

    def is_unresolved(self) -> bool:
        return self.status == "UNRESOLVED"

    def is_resolved(self) -> bool:
        return self.status == "RESOLVED"

    def is_in_progress(self) -> bool:
        return self.status == "IN PROGRESS"


@dataclass
class FieldMismatch:
    """Describes a single field difference between two sources."""
    field_name:   str
    sp_value:     str
    app_value:    str

    def __str__(self) -> str:
        return f"{self.field_name}: SP='{self.sp_value}' | APP='{self.app_value}'"


@dataclass
class VerificationResult:
    """
    Output of Feature 1 — one result per ticket that was checked.
    """
    ticket_id:   str
    status:      str   # "MATCH" | "MISMATCH" | "ONLY_IN_APP" | "ONLY_IN_SP"
    sp_ticket:   Optional[Ticket]
    app_ticket:  Optional[Ticket]
    mismatches:  list  = field(default_factory=list)  # List[FieldMismatch]

    @property
    def has_mismatches(self) -> bool:
        return len(self.mismatches) > 0

    @property
    def mismatch_fields(self) -> list:
        return [m.field_name for m in self.mismatches]
