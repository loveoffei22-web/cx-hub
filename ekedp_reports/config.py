"""
EKEDP Reporting System — central configuration.
All field mappings, thresholds, and constants live here.
"""

from dataclasses import dataclass, field
from typing import Dict, List

# ── Agents ───────────────────────────────────────────────────────────────────
AGENTS: List[str] = [
    "Racheal Ogunleke",
    "Matthew Akhigbe",
    "Tomina Egbokwu",
    "Esther Okafor",
    "Loveth Okpara",
]

# ── Responsible Parties ───────────────────────────────────────────────────────
RESPONSIBLE_PARTIES: List[str] = [
    "Olusegun Owokade",
    "Ogheneyoreme Agbroko",
    "Clara Olutola",
    "Holyland Umude",
    "Mojibola Adefuwa",
    "David Obisesan",
    "Nonye Angelina Nnadozie",
    "Glory Chinyere",
    "Festus Moko",
    "Adetoun Adetola",
    "Adetoun Adebayo",
]

# ── Categories ────────────────────────────────────────────────────────────────
CATEGORIES: List[str] = [
    "PPM Maintenance",
    "Interruption / Voltage / Safety / Disconnection",
    "Metering",
    "Billing",
    "Band Reclassification",
    "Onboarding / Change of Address",
    "Mycron",
    "AMISA",
    "PPM Support",
    "General First Contact Resolution",
]

# ── Status normalisation maps ─────────────────────────────────────────────────
# Both sides get normalised to these canonical values before comparison.
APP_STATUS_MAP: Dict[str, str] = {
    "resolved":    "RESOLVED",
    "progress":    "IN PROGRESS",
    "in progress": "IN PROGRESS",
    "in_progress": "IN PROGRESS",
    "inprogress":  "IN PROGRESS",
    "unresolved":  "UNRESOLVED",
    "open":        "UNRESOLVED",
    "pending":     "IN PROGRESS",
}

SP_STATUS_MAP: Dict[str, str] = {
    "resolved":    "RESOLVED",
    "resolution":  "RESOLVED",
    "in progress": "IN PROGRESS",
    "inprogress":  "IN PROGRESS",
    "unresolved":  "UNRESOLVED",
    "open":        "UNRESOLVED",
    "new":         "UNRESOLVED",
    "active":      "UNRESOLVED",
    "pending":     "IN PROGRESS",
}

# ── SharePoint CSV column aliases ─────────────────────────────────────────────
# Maps any variant column name → canonical internal name.
SP_COLUMN_ALIASES: Dict[str, str] = {
    # Ticket ID
    "id":                    "sp_id",
    "ticketid":              "sp_id",
    "ticket id":             "sp_id",
    "ticket_id":             "sp_id",
    "issueid":               "sp_id",
    # Title = customer name in EKEDP SharePoint schema
    "title":                 "customer_name",
    # Description / complaint text
    "complaint":             "description",
    "complaintdescription":  "description",
    "issue":                 "description",
    "issuedescription":      "description",
    # Status
    "status":                "status",
    "ticketstatus":          "status",
    "issuestatus":           "status",
    # Responsible party
    "responsibleparty":      "responsible_party",
    "responsible party":     "responsible_party",
    "responsible":           "responsible_party",
    "assignedto":            "responsible_party",
    "assigned to":           "responsible_party",
    "assignee":              "responsible_party",
    # Category
    "category":              "category",
    "complaintcategory":     "category",
    "complaint category":    "category",
    "type":                  "category",
    # Action taken
    "actiontaken":           "action_taken",
    "action taken":          "action_taken",
    "actionnote":            "action_taken",
    "resolutionnote":        "action_taken",
    "note":                  "action_taken",
    "notes":                 "action_taken",
    # Customer
    "customername":          "customer_name",
    "customer name":         "customer_name",
    "customer":              "customer_name",
    "name":                  "customer_name",
    # Phone
    "phone":                 "phone",
    "customerphone":         "phone",
    "customer phone":        "phone",
    "telephone":             "phone",
    "phonenumber":           "phone",
    "phone number":          "phone",
    "mobile":                "phone",
    # Meter / account
    "meter":                 "meter",
    "meterno":               "meter",
    "meter no":              "meter",
    "meternumber":           "meter",
    "accountno":             "meter",
    "account no":            "meter",
    "accountnumber":         "meter",
    # Business unit
    "businessunit":          "business_unit",
    "business unit":         "business_unit",
    "bu":                    "business_unit",
    "district":              "business_unit",
    # Dates
    "created":               "created_at",
    "createdon":             "created_at",
    "datecreated":           "created_at",
    "receiveddate":          "created_at",
    "modified":              "modified_at",
    "modifiedon":            "modified_at",
    "lastupdated":           "modified_at",
    # Agent
    "agent":                 "agent",
    "agentname":             "agent",
    "loggedby":              "agent",
}

# ── App JSON field mappings → canonical internal name ─────────────────────────
APP_FIELD_MAP: Dict[str, str] = {
    "num":         "app_id",
    "id":          "app_uuid",
    "name":        "customer_name",
    "phone":       "phone",
    "meter":       "meter",
    "bu":          "business_unit",
    "category":    "category",
    "issue":       "description",
    "status":      "status",
    "resp":        "responsible_party",
    "note":        "action_taken",
    "actionTaken": "action_taken",
    "action":      "action_taken",
    "created":     "created_at",
    "receivedAt":  "created_at",
    "updatedAt":   "modified_at",
    "agent":       "agent",
    "agentId":     "agent",
    "resolvedDate":"resolved_date",
    "addr":        "address",
    "address":     "address",
    "email":       "email",
    "time":        "time",
    "day":         "day",
}

# ── SLA thresholds ────────────────────────────────────────────────────────────
SLA_BREACH_HOURS: int = 72          # UNRESOLVED > 72h = breach
REPEAT_COMPLAINANT_THRESHOLD: int = 3   # same phone ≥ 3 = repeat
DUPLICATE_PHONE_THRESHOLD: int = 1  # same phone > 1 = potential dup
PERFORMANCE_GOOD: float = 0.80      # ≥80% resolution = MEETS TARGET
PERFORMANCE_WARNING: float = 0.60   # 60–79% = NEEDS IMPROVEMENT
                                    # <60% = BELOW TARGET

# ── Email recipients ──────────────────────────────────────────────────────────
EMAIL_TO: List[str] = [
    "love.offei@ekedp.com",
    "ayodele.idowu@ekedp.com",
]
EMAIL_FROM: str = "customercare@ekedp.com"

# ── Comparison fields for verification ───────────────────────────────────────
# These fields are compared when a ticket is found in both sources.
COMPARE_FIELDS: List[str] = [
    "status",
    "responsible_party",
    "category",
    "action_taken",
]
