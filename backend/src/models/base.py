try:
    from sqlalchemy.orm import DeclarativeBase, declared_attr

    class Base(DeclarativeBase):
        pass
except ImportError:
    from sqlalchemy.orm import declarative_base, declared_attr
    Base = declarative_base()

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func


class AuditMixin:

    @declared_attr
    def is_active(cls):
        return Column(Integer, default=1)

    @declared_attr
    def version(cls):
        return Column(Integer, default=1)

    @declared_attr
    def created_by(cls):
        return Column(String(255))

    @declared_attr
    def created_at(cls):
        return Column(DateTime, default=func.now())

    @declared_attr
    def updated_by(cls):
        return Column(String(255))

    @declared_attr
    def updated_at(cls):
        return Column(DateTime, onupdate=func.now())