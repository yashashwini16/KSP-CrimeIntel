from sqlalchemy import Column, Integer, String, Text, ForeignKey, Date, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class Accused(Base):
    __tablename__ = "Accused"
    
    AccusedMasterID = Column(Integer, primary_key=True, autoincrement=True)
    CaseMasterID = Column(Integer, ForeignKey("CaseMaster.CaseMasterID", ondelete="CASCADE"), nullable=False)
    AccusedName = Column(String(255), nullable=False)
    AgeYear = Column(Integer)
    GenderID = Column(Integer)
    PersonID = Column(String(50))
    Address = Column(Text)
    PhotoUrl = Column(String(255))
    RiskScore = Column(Integer, default=0)
    
    # Existing relationships needed for frontend:
    # We will redefine source_links and target_links if needed in link.py or here
    # financial_transactions as well.
    # To avoid circular imports immediately, we won't define relationship() here 
    # until we set up all models properly or we can use string references.

class ArrestSurrender(Base):
    __tablename__ = "ArrestSurrender"
    
    ArrestSurrenderID = Column(Integer, primary_key=True, autoincrement=True)
    CaseMasterID = Column(Integer, ForeignKey("CaseMaster.CaseMasterID", ondelete="CASCADE"), nullable=False)
    ArrestSurrenderTypeID = Column(Integer)
    ArrestSurrenderDate = Column(Date)
    ArrestSurrenderStateId = Column(Integer, ForeignKey("State.StateID", ondelete="SET NULL"))
    ArrestSurrenderDistrictId = Column(Integer, ForeignKey("District.DistrictID", ondelete="SET NULL"))
    PoliceStationID = Column(Integer, ForeignKey("Unit.UnitID", ondelete="SET NULL"))
    IOID = Column(Integer, ForeignKey("Employee.EmployeeID", ondelete="SET NULL"))
    CourtID = Column(Integer, ForeignKey("Court.CourtID", ondelete="SET NULL"))
    AccusedMasterID = Column(Integer, ForeignKey("Accused.AccusedMasterID", ondelete="CASCADE"), nullable=False)
    IsAccused = Column(Boolean)
    IsComplainantAccused = Column(Boolean)
