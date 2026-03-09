from sqlalchemy import Column, Integer, String
from app.database import Base

class Conflict(Base):
    __tablename__ = "conflicts"

    id = Column(Integer, primary_key=True)
    type = Column(String)        # faculty / room / section
    entity_id = Column(Integer)
    timeslot_id = Column(Integer)
    reason = Column(String)
