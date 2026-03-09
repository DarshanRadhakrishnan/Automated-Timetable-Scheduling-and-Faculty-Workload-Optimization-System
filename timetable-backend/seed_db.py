from app.database import SessionLocal, engine
from app.models.faculty import Faculty
from app.models.course import Course
from app.models.section import Section
from app.models.room import Room
from app.models.timeslot import TimeSlot
from app.models.availability import FacultyAvailability
from app.database import Base

Base.metadata.create_all(bind=engine)

db = SessionLocal()

def seed():
    # ---------- FACULTY ----------
    f1 = Faculty(name="Dr. A", max_load=10)
    f2 = Faculty(name="Dr. B", max_load=10)
    db.add_all([f1, f2])

    # ---------- COURSES ----------
    c1 = Course(name="Maths", course_type="theory", hours_per_week=3)
    c2 = Course(name="OS Lab", course_type="lab", hours_per_week=2)
    db.add_all([c1, c2])

    # ---------- SECTIONS ----------
    s1 = Section(name="CSE-A", student_count=40)
    db.add(s1)

    # ---------- ROOMS ----------
    r1 = Room(room_type="theory", capacity=60)
    r2 = Room(room_type="lab", capacity=50)
    db.add_all([r1, r2])

    # ---------- TIMESLOTS ----------
    slots = []
    for day in ["Mon", "Tue", "Wed", "Thu", "Fri"]:
        for slot in range(1, 5):
            slots.append(TimeSlot(day=day, slot=slot))
    db.add_all(slots)

    db.commit()

    # ---------- AVAILABILITY ----------
    for faculty in db.query(Faculty).all():
        for ts in db.query(TimeSlot).all():
            db.add(FacultyAvailability(
                faculty_id=faculty.id,
                timeslot_id=ts.id,
                is_available=True
            ))

    db.commit()
    print("✅ Dummy data inserted successfully")

if __name__ == "__main__":
    seed()