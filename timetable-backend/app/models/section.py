from sqlalchemy import Column, Integer, String
from app.database import Base

class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    student_count = Column(Integer)
