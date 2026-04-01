from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from src.models.party_model import Party
from src.repositories.base import BaseRepository


class PartyRepository(BaseRepository):

    async def create(self, db: AsyncSession, data: dict):
        party = Party(**data)
        await self.add(db, party)
        await db.refresh(party)
        return party

    async def get_all(self, db: AsyncSession):
        query = select(Party).where(Party.is_active == 1)
        return await super().get_all(db, query)

    async def get_by_id(self, db: AsyncSession, party_id: int):
        query = select(Party).where(
            Party.party_id == party_id,
            Party.is_active == 1
        )
        return await self.get_one(db, query)

    async def update(self, db: AsyncSession, existing, data: dict):
        return await super().update(db, existing, data)

    async def update_with_version(self, db: AsyncSession, existing, data: dict, expected_version: int):
        stmt = (
            update(Party)
            .where(Party.party_id == existing.party_id, Party.version == expected_version)
            .values(**data)
        )

        result = await db.execute(stmt)
        if result.rowcount != 1:
            return None

        await db.flush()
        await db.refresh(existing)
        return existing

    async def delete(self, db: AsyncSession, existing):
        return await super().soft_delete(db, existing)