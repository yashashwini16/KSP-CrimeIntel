from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from .database import Base

class CaseMaster(Base):
    __tablename__ = "CaseMaster"
    CaseMasterID = Column(Integer, primary_key=True, autoincrement=True)
    CrimeNo = Column(String(50))
    CaseNo = Column(String(50))
    CrimeRegisteredDate = Column(Date)
    PolicePersonID = Column(Integer, ForeignKey("Employee.EmployeeID", ondelete="CASCADE"), nullable=False)
    PoliceStationID = Column(Integer, ForeignKey("Unit.UnitID", ondelete="CASCADE"), nullable=False)
    CaseCategoryID = Column(Integer, ForeignKey("CaseCategory.CaseCategoryID", ondelete="CASCADE"), nullable=False)
    GravityOffenceID = Column(Integer, ForeignKey("GravityOffence.GravityOffenceID", ondelete="CASCADE"), nullable=False)
    CrimeMajorHeadID = Column(Integer, ForeignKey("CrimeHead.CrimeHeadID", ondelete="CASCADE"), nullable=False)
    CrimeMinorHeadID = Column(Integer, ForeignKey("CrimeSubHead.CrimeSubHeadID", ondelete="CASCADE"), nullable=False)
    CaseStatusID = Column(Integer, ForeignKey("CaseStatusMaster.CaseStatusID", ondelete="CASCADE"), nullable=False)
    CourtID = Column(Integer, ForeignKey("Court.CourtID", ondelete="SET NULL"))
    IncidentFromDate = Column(DateTime)
    IncidentToDate = Column(DateTime)
    InfoReceivedPSDate = Column(DateTime)
    latitude = Column(Numeric(10, 6))
    longitude = Column(Numeric(10, 6))
    BriefFacts = Column(Text)
    created_at = Column(DateTime, default=func.now(), nullable=False)

class ComplainantDetails(Base):
    __tablename__ = "ComplainantDetails"
    ComplainantID = Column(Integer, primary_key=True, autoincrement=True)
    CaseMasterID = Column(Integer, ForeignKey("CaseMaster.CaseMasterID", ondelete="CASCADE"), nullable=False)
    ComplainantName = Column(String(255), nullable=False)
    AgeYear = Column(Integer)
    OccupationID = Column(Integer, ForeignKey("OccupationMaster.OccupationID", ondelete="SET NULL"))
    ReligionID = Column(Integer, ForeignKey("ReligionMaster.ReligionID", ondelete="SET NULL"))
    CasteID = Column(Integer, ForeignKey("CasteMaster.caste_master_id", ondelete="SET NULL"))
    GenderID = Column(Integer)

class ActSectionAssociation(Base):
    __tablename__ = "ActSectionAssociation"
    CaseMasterID = Column(Integer, ForeignKey("CaseMaster.CaseMasterID", ondelete="CASCADE"), primary_key=True)
    ActID = Column(String(50), ForeignKey("Act.ActCode", ondelete="CASCADE"), primary_key=True)
    SectionID = Column(String(50), primary_key=True)
    ActOrderID = Column(Integer)
    SectionOrderID = Column(Integer)

class ChargesheetDetails(Base):
    __tablename__ = "ChargesheetDetails"
    CSID = Column(Integer, primary_key=True, autoincrement=True)
    CaseMasterID = Column(Integer, ForeignKey("CaseMaster.CaseMasterID", ondelete="CASCADE"), nullable=False)
    csdate = Column(DateTime)
    cstype = Column(String(1))
    PolicePersonID = Column(Integer, ForeignKey("Employee.EmployeeID", ondelete="SET NULL"))
