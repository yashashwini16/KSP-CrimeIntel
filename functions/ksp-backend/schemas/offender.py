"""Pydantic schemas for Offender / Accused endpoint responses."""

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class FIRBriefSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    fir_number: str
    date: date
    crime_type: str
    district: str
    status: str


class LinkBriefSchema(BaseModel):
    id: int
    linked_accused_id: int
    linked_accused_name: str
    link_type: str
    weight: float


class OffenderSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    age: int | None = None
    gender: str | None = None
    address: str | None = None
    photo_url: str | None = None
    risk_score: int = Field(default=0, ge=0, le=100)
    fir_count: int = 0


class OffenderDetail(BaseModel):
    id: int
    name: str
    age: int | None = None
    gender: str | None = None
    address: str | None = None
    phone: str | None = None
    photo_url: str | None = None
    created_at: datetime
    risk_score: int = Field(default=0, ge=0, le=100)
    firs: list[FIRBriefSchema] = Field(default_factory=list)
    links: list[LinkBriefSchema] = Field(default_factory=list)
