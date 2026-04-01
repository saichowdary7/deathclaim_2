import json
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from src.core.database import AsyncSessionLocal
from src.models.audit_model import AuditLog


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)

        audit_context = getattr(request.state, "audit_context", None)
        if audit_context is None:
            return response

        try:
            audit = AuditLog(
                table_name=audit_context.get("table_name"),
                record_id=audit_context.get("record_id", 0),
                action_type=audit_context.get("action_type"),
                old_values=json.dumps(audit_context.get("old_values"), default=str),
                new_values=json.dumps(audit_context.get("new_values"), default=str),
                changed_fields=json.dumps(audit_context.get("changed_fields"), default=str),
                acted_by=audit_context.get("acted_by"),
            )
            async with AsyncSessionLocal() as session:
                session.add(audit)
                await session.commit()
        except Exception:
            pass

        return response
