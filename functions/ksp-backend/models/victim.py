from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Victim(Base):
    __tablename__ = "Victim"
    
    VictimMasterID = Column(Integer, primary_key=True, autoincrement=True)
    CaseMasterID = Column(Integer, ForeignKey("CaseMaster.CaseMasterID", ondelete="CASCADE"), nullable=False)
    VictimName = Column(String(255), nullable=False)
    AgeYear = Column(Integer)
    GenderID = Column(Integer)
    VictimPolice = Column(String(10))
