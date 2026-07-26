from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Employee(Base):
    __tablename__ = "Employee"
    EmployeeID = Column(Integer, primary_key=True, autoincrement=True)
    DistrictID = Column(Integer, ForeignKey("District.DistrictID", ondelete="CASCADE"), nullable=False)
    UnitID = Column(Integer, ForeignKey("Unit.UnitID", ondelete="CASCADE"), nullable=False)
    RankID = Column(Integer, ForeignKey("Rank.RankID", ondelete="CASCADE"), nullable=False)
    DesignationID = Column(Integer, ForeignKey("Designation.DesignationID", ondelete="CASCADE"), nullable=False)
    KGID = Column(String(255))
    FirstName = Column(String(255), nullable=False)
    EmployeeDOB = Column(Date)
    GenderID = Column(Integer)
    BloodGroupID = Column(Integer)
    PhysicallyChallenged = Column(Boolean)
    AppointmentDate = Column(Date)
