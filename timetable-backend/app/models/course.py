from sqlalchemy import Column, Integer, String
from app.database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    course_type = Column(String)  # theory / lab
    hours_per_week = Column(Integer)
