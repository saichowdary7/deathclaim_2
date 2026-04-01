from sqlalchemy import Column, String, BigInteger, Date, Text, Enum
from src.models.base import Base, AuditMixin


class Party(Base, AuditMixin):
    __tablename__ = "party"

    party_id = Column(BigInteger, primary_key=True, autoincrement=True)

    party_type = Column(String(50))
    first_name = Column(String(100))
    last_name = Column(String(100))

    gender = Column(Enum('M', 'F', 'UNKNOWN', name='gender_enum'))

    date_of_birth = Column(Date)

    contact_number = Column(String(30))
    email = Column(String(200))
    address = Column(Text)

    national_id = Column(String(50))
    ssn = Column(String(20))

    effective_start_date = Column(Date)
    effective_end_date = Column(Date)
    status = Column(String(20), default='ACTIVE')
    deleted_by = Column(String(255))