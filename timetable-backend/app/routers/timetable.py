from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.services.generator import generate_timetable
from app.models import faculty, course, section, room, timeslot

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/generate")
def generate(db: Session = Depends(get_db)):
    # Get all data
    sections = db.query(section.Section).all()
    courses = db.query(course.Course).all()
    
    # Create section_courses mapping
    section_courses = {}
    for sec in sections:
        section_courses[sec.id] = courses
    
    result = generate_timetable(
        db,
        sections,
        section_courses,
        db.query(faculty.Faculty).all(),
        db.query(room.Room).all(),
        db.query(timeslot.TimeSlot).all()
    )
    
    return {"message": "Timetable generated", "entries": len(result), "data": result}


## **Quick Fix: Check seed_db.py Output**
