import json
import re
from datetime import datetime, date
from src.models.audit_model import AuditLog



def json_serializer(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    return str(obj)


def parse_us_date(date_str: str) -> date:
    """
    Convert MM-DD-YYYY or YYYY-MM-DD → date object (for DB storage)
    """
    if isinstance(date_str, date):
        return date_str

    if not date_str or date_str == "":
        return None

    try:
        # Try YYYY-MM-DD format first (HTML date input)
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        try:
            # Try MM-DD-YYYY format
            return datetime.strptime(date_str, "%m-%d-%Y").date()
        except ValueError:
            raise ValueError("Invalid date format. Expected YYYY-MM-DD or MM-DD-YYYY")


def validate_email(value: str) -> str:
    if value is None or value == "":
        return value

    email_pattern = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    if not email_pattern.match(value):
        raise ValueError("Invalid email format")
    return value


def validate_phone(value: str) -> str:
    if value is None or value == "":
        return value

    phone_pattern = re.compile(r"^\+?[0-9\-()\s]{7,20}$")
    if not phone_pattern.match(value):
        raise ValueError("Invalid phone number format")
    return value


def validate_ssn(value: str) -> str:
    if value is None or value == "":
        return value

    ssn_pattern = re.compile(r"^(?:\d{3}-\d{2}-\d{4}|\d{9})$")
    if not ssn_pattern.match(value):
        raise ValueError("Invalid SSN format")
    return value


def build_audit_log(old_data, new_data, action, user, table, record_id):

    IGNORE_FIELDS = {"version", "updated_by", "updated_at", "created_at"}

    if action == "INSERT":
        changed_fields = [
            k for k in new_data.keys()
            if k not in IGNORE_FIELDS
        ]

    elif action == "DELETE":
        changed_fields = [
            k for k in old_data.keys()
            if k not in IGNORE_FIELDS
        ]

    else:  # UPDATE
        changed_fields = [
            k for k in new_data
            if old_data.get(k) != new_data.get(k)
            and k not in IGNORE_FIELDS
        ]

    return AuditLog(
        table_name=table,
        record_id=record_id,
        action_type=action,
        old_values=json.dumps(old_data, default=str),
        new_values=json.dumps(new_data, default=str),
        changed_fields=",".join(changed_fields),
        acted_by=user
    )
