from datetime import datetime, date

from src.repositories.party_repo import PartyRepository
from src.core.exceptions import AppException

repo = PartyRepository()


def _serialize_model(instance):
    """
    Convert SQLAlchemy model → JSON-safe dict
    """
    def serialize(value):
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        return value

    return {
        col: serialize(getattr(instance, col))
        for col in instance.__table__.columns.keys()
    }


def _changed_fields(old_data: dict, new_data: dict):
    IGNORE_FIELDS = {"updated_at", "version", "updated_by"}

    changed = [
        key for key in sorted(set(old_data.keys()) | set(new_data.keys()))
        if old_data.get(key) != new_data.get(key)
        and key not in IGNORE_FIELDS
    ]
    return ",".join(changed)


class PartyService:

    async def create_party(self, db, payload, user, request):
        data = payload.dict(exclude_none=True)
        data["created_by"] = user["username"]

        try:
            party = await repo.create(db, data)

            new_data = _serialize_model(party)

            request.state.audit_context = {
                "table_name": "party",
                "record_id": party.party_id,
                "action_type": "INSERT",
                "old_values": {},
                "new_values": new_data,
                "changed_fields": _changed_fields({}, new_data),
                "acted_by": user["username"],
            }

            return new_data

        except Exception:
            await db.rollback()
            raise AppException("Internal server error", 500)

    async def get_all_parties(self, db, request):
        parties = await repo.get_all(db)
        return [_serialize_model(party) for party in parties]

    async def get_party_by_id(self, db, party_id, request):
        party = await repo.get_by_id(db, party_id)
        if not party:
            raise AppException("Party not found", 404)
        return _serialize_model(party)

    async def update_party(self, db, party_id, payload, user, request):
        existing = await repo.get_by_id(db, party_id)

        if not existing:
            raise AppException("Party not found", 404)

        print("UPDATE API HIT")

        if payload.version is not None and payload.version != existing.version:
            raise AppException("Version mismatch - record already updated", 409)

        old_data = _serialize_model(existing)
        current_version = existing.version

        incoming = payload.dict(exclude_unset=True, exclude_none=True)
        incoming.pop("version", None)

        changed_data = {
            key: value
            for key, value in incoming.items()
            if getattr(existing, key) != value
        }

        if not changed_data:
            return old_data

        update_data = changed_data
        update_data["updated_by"] = user["username"]
        update_data["version"] = current_version + 1
        update_data["updated_at"] = datetime.utcnow()

        try:
            print("STEP 1: Before update")
            updated = await repo.update_with_version(db, existing, update_data, current_version)
            if not updated:
                raise AppException("Version mismatch - record already updated", 409)
            print("STEP 1: Before update")

            new_data = _serialize_model(updated)
            print("STEP 2: After update")

            request.state.audit_context = {
                "table_name": "party",
                "record_id": party_id,
                "action_type": "UPDATE",
                "old_values": old_data,
                "new_values": new_data,
                "changed_fields": _changed_fields(old_data, new_data),
                "acted_by": user["username"],
            }
            print("STEP 3: After serialize")

            return new_data

        except AppException:
            raise
        except Exception:
            await db.rollback()
            raise AppException("Internal server error", 500)

    async def delete_party(self, db, party_id, user, request):
        existing = await repo.get_by_id(db, party_id)

        if not existing:
            raise AppException("Party not found", 404)

        old_data = _serialize_model(existing)

        # ✅ update fields before delete
        existing.updated_by = user["username"]
        existing.deleted_by = user["username"]
        existing.updated_at = datetime.utcnow()
        existing.version += 1

        try:
            await repo.delete(db, existing)  # ✅ FIXED

            new_data = _serialize_model(existing)

            request.state.audit_context = {
                "table_name": "party",
                "record_id": party_id,
                "action_type": "DELETE",
                "old_values": old_data,
                "new_values": new_data,
                "changed_fields": _changed_fields(old_data, new_data),
                "acted_by": user["username"],
            }

            return {"message": "deleted"}

        except Exception:
            await db.rollback()
            raise AppException("Internal server error", 500)