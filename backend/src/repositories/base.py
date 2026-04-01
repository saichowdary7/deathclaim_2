from sqlalchemy.ext.asyncio import AsyncSession


class BaseRepository:

    async def add(self, db: AsyncSession, instance):
        db.add(instance)
        await db.flush()
        return instance

    async def get_one(self, db: AsyncSession, query):
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def get_all(self, db: AsyncSession, query):
        result = await db.execute(query)
        return result.scalars().all()

    async def update(self, db: AsyncSession, instance, data: dict):
        for key, value in data.items():
            setattr(instance, key, value)
        await db.flush()
        return instance

    async def soft_delete(self, db: AsyncSession, instance):
        instance.is_active = 0
        await db.flush()
        return instance
