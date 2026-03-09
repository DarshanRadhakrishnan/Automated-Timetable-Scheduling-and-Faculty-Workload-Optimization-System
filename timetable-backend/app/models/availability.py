from sqlalchemy import Column, Integer, Boolean, ForeignKey
from app.database import Base

class FacultyAvailability(Base):
    __tablename__ = "faculty_availability"

    id = Column(Integer, primary_key=True)
    faculty_id = Column(Integer, ForeignKey("faculties.id"))
    timeslot_id = Column(Integer, ForeignKey("timeslots.id"))
    is_available = Column(Boolean, default=True)
