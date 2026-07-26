from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class CaseCategory(Base):
    __tablename__ = "CaseCategory"
    CaseCategoryID = Column(Integer, primary_key=True, autoincrement=True)
    LookupValue = Column(String(255), nullable=False)

class GravityOffence(Base):
    __tablename__ = "GravityOffence"
    GravityOffenceID = Column(Integer, primary_key=True, autoincrement=True)
    LookupValue = Column(String(255), nullable=False)

class CrimeHead(Base):
    __tablename__ = "CrimeHead"
    CrimeHeadID = Column(Integer, primary_key=True, autoincrement=True)
    CrimeGroupName = Column(String(255), nullable=False)
    Active = Column(Boolean, default=True, nullable=False)

class CrimeSubHead(Base):
    __tablename__ = "CrimeSubHead"
    CrimeSubHeadID = Column(Integer, primary_key=True, autoincrement=True)
    CrimeHeadID = Column(Integer, ForeignKey("CrimeHead.CrimeHeadID", ondelete="CASCADE"), nullable=False)
    CrimeHeadName = Column(String(255), nullable=False)
    SeqID = Column(Integer)

class CaseStatusMaster(Base):
    __tablename__ = "CaseStatusMaster"
    CaseStatusID = Column(Integer, primary_key=True, autoincrement=True)
    CaseStatusName = Column(String(255), nullable=False)

class State(Base):
    __tablename__ = "State"
    StateID = Column(Integer, primary_key=True, autoincrement=True)
    StateName = Column(String(255), nullable=False)
    NationalityID = Column(Integer)
    Active = Column(Boolean, default=True, nullable=False)

class District(Base):
    __tablename__ = "District"
    DistrictID = Column(Integer, primary_key=True, autoincrement=True)
    DistrictName = Column(String(255), nullable=False)
    StateID = Column(Integer, ForeignKey("State.StateID", ondelete="CASCADE"), nullable=False)
    Active = Column(Boolean, default=True, nullable=False)

class Court(Base):
    __tablename__ = "Court"
    CourtID = Column(Integer, primary_key=True, autoincrement=True)
    CourtName = Column(String(255), nullable=False)
    DistrictID = Column(Integer, ForeignKey("District.DistrictID", ondelete="CASCADE"), nullable=False)
    StateID = Column(Integer, ForeignKey("State.StateID", ondelete="CASCADE"), nullable=False)
    Active = Column(Boolean, default=True, nullable=False)

class UnitType(Base):
    __tablename__ = "UnitType"
    UnitTypeID = Column(Integer, primary_key=True, autoincrement=True)
    UnitTypeName = Column(String(255), nullable=False)
    CityDistState = Column(String(255))

class Unit(Base):
    __tablename__ = "Unit"
    UnitID = Column(Integer, primary_key=True, autoincrement=True)
    UnitName = Column(String(255), nullable=False)
    TypeID = Column(Integer, ForeignKey("UnitType.UnitTypeID", ondelete="CASCADE"), nullable=False)
    ParentUnit = Column(Integer)
    NationalityID = Column(Integer)
    StateID = Column(Integer, ForeignKey("State.StateID", ondelete="CASCADE"), nullable=False)
    DistrictID = Column(Integer, ForeignKey("District.DistrictID", ondelete="CASCADE"), nullable=False)
    Active = Column(Boolean, default=True, nullable=False)

class Rank(Base):
    __tablename__ = "Rank"
    RankID = Column(Integer, primary_key=True, autoincrement=True)
    RankName = Column(String(255), nullable=False)
    Hierarchy = Column(Integer, nullable=False)
    Active = Column(Boolean, default=True, nullable=False)

class Designation(Base):
    __tablename__ = "Designation"
    DesignationID = Column(Integer, primary_key=True, autoincrement=True)
    DesignationName = Column(String(255), nullable=False)
    Active = Column(Boolean, default=True, nullable=False)
    SortOrder = Column(Integer)

class CasteMaster(Base):
    __tablename__ = "CasteMaster"
    caste_master_id = Column(Integer, primary_key=True, autoincrement=True)
    caste_master_name = Column(String(255), nullable=False)

class ReligionMaster(Base):
    __tablename__ = "ReligionMaster"
    ReligionID = Column(Integer, primary_key=True, autoincrement=True)
    ReligionName = Column(String(255), nullable=False)

class OccupationMaster(Base):
    __tablename__ = "OccupationMaster"
    OccupationID = Column(Integer, primary_key=True, autoincrement=True)
    OccupationName = Column(String(255), nullable=False)

class Act(Base):
    __tablename__ = "Act"
    ActCode = Column(String(50), primary_key=True)
    ActDescription = Column(String(255), nullable=False)
    ShortName = Column(String(100))
    Active = Column(Boolean, default=True, nullable=False)

class Section(Base):
    __tablename__ = "Section"
    ActCode = Column(String(50), ForeignKey("Act.ActCode", ondelete="CASCADE"), primary_key=True)
    SectionCode = Column(String(50), primary_key=True)
    SectionDescription = Column(String(255))
    Active = Column(Boolean, default=True, nullable=False)

class CrimeHeadActSection(Base):
    __tablename__ = "CrimeHeadActSection"
    CrimeHeadID = Column(Integer, ForeignKey("CrimeHead.CrimeHeadID", ondelete="CASCADE"), primary_key=True)
    ActCode = Column(String(50), ForeignKey("Act.ActCode", ondelete="CASCADE"), primary_key=True)
    SectionCode = Column(String(50), primary_key=True)
