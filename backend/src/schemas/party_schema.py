from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, validator
from src.core.utils import parse_us_date, validate_email, validate_phone, validate_ssn


class PartyCreate(BaseModel):
    party_type: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    national_id: Optional[str] = None
    ssn: Optional[str] = None
    effective_start_date: Optional[date] = None
    effective_end_date: Optional[date] = None
    status: Optional[str] = 'ACTIVE'

    @validator("date_of_birth", pre=True, always=True)
    def parse_input_date(cls, value):
        if value is None or value == "":
            return value
        if isinstance(value, date):
            return value
        return parse_us_date(value)

    @validator("effective_start_date", pre=True, always=True)
    def parse_effective_start_date(cls, value):
        if value is None or value == "":
            return value
        if isinstance(value, date):
            return value
        return parse_us_date(value)

    @validator("effective_end_date", pre=True, always=True)
    def parse_effective_end_date(cls, value):
        if value is None or value == "":
            return value
        if isinstance(value, date):
            return value
        return parse_us_date(value)

    @validator("email", pre=True)
    def validate_email_field(cls, value):
        if value is None or value == "":
            return value
        return validate_email(value)

    @validator("contact_number", pre=True)
    def validate_contact_number_field(cls, value):
        if value is None or value == "":
            return value
        return validate_phone(value)

    @validator("ssn", pre=True)
    def validate_ssn_field(cls, value):
        if value is None or value == "":
            return value
        return validate_ssn(value)


class PartyUpdate(BaseModel):
    party_type: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    national_id: Optional[str] = None
    ssn: Optional[str] = None
    version: Optional[int] = None
    effective_start_date: Optional[date] = None
    effective_end_date: Optional[date] = None
    status: Optional[str] = None

    @validator("date_of_birth", pre=True, always=True)
    def parse_input_date(cls, value):
        if value is None or value == "":
            return value
        if isinstance(value, date):
            return value
        return parse_us_date(value)

    @validator("effective_start_date", pre=True, always=True)
    def parse_effective_start_date(cls, value):
        if value is None or value == "":
            return value
        if isinstance(value, date):
            return value
        return parse_us_date(value)

    @validator("effective_end_date", pre=True, always=True)
    def parse_effective_end_date(cls, value):
        if value is None or value == "":
            return value
        if isinstance(value, date):
            return value
        return parse_us_date(value)

    @validator("email", pre=True)
    def validate_email_field(cls, value):
        if value is None or value == "":
            return value
        return validate_email(value)

    @validator("contact_number", pre=True)
    def validate_contact_number_field(cls, value):
        if value is None or value == "":
            return value
        return validate_phone(value)

    @validator("ssn", pre=True)
    def validate_ssn_field(cls, value):
        if value is None or value == "":
            return value
        return validate_ssn(value)


class PartyOut(BaseModel):
    party_id: int
    party_type: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    gender: Optional[str]
    date_of_birth: Optional[date]
    contact_number: Optional[str]
    email: Optional[str]
    address: Optional[str]
    national_id: Optional[str]
    ssn: Optional[str]
    is_active: Optional[int]
    version: Optional[int]
    created_by: Optional[str]
    created_at: Optional[datetime]
    updated_by: Optional[str]
    updated_at: Optional[datetime]
    effective_start_date: Optional[date]
    effective_end_date: Optional[date]
    status: Optional[str]
    deleted_by: Optional[str]

    class Config:
        from_attributes = True
