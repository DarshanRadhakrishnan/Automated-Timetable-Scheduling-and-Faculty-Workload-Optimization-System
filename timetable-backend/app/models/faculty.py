from sqlalchemy import Column, Integer, String
from app.database import Base

class Faculty(Base):
    __tablename__ = "faculties"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    max_load = Column(Integer, nullable=False)
