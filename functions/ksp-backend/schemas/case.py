from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CaseSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    fir_number: str
    date: date
    crime_type: str
    district: str
    station: str | None = None
    status: str
    modus_operandi: str | None = None
    accused_count: int | None = None
    victim_count: int | None = None


class CaseAccused(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    age: int | None = None
    gender: str | None = None
    role: str | None = None


class CaseVictim(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str | None = None
    age: int | None = None
    gender: str | None = None
    injury_type: str | None = None


class CaseLocation(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    latitude: Decimal
    longitude: Decimal
    address: str | None = None


class CaseDetail(CaseSummary):
    narrative: str | None = None
    created_at: datetime
    accused: list[CaseAccused] = Field(default_factory=list)
    victims: list[CaseVictim] = Field(default_factory=list)
    locations: list[CaseLocation] = Field(default_factory=list)


class SimilarCase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    fir_number: str
    crime_type: str
    district: str
    similarity_score: float
    rationale: str | None = None
