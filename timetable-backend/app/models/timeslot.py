from sqlalchemy import Column, Integer, String
from app.database import Base

class TimeSlot(Base):
    __tablename__ = "timeslots"

    id = Column(Integer, primary_key=True)
    day = Column(String)
    slot = Column(Integer)
