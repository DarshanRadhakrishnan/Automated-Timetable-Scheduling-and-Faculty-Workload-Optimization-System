from app.models.timetable import Timetable
from app.models.availability import FacultyAvailability
from app.models.course import Course


# ---------- HELPER CHECKS ----------

def is_faculty_available(db, faculty_id, timeslot_id):
    return db.query(FacultyAvailability).filter_by(
        faculty_id=faculty_id,
        timeslot_id=timeslot_id,
        is_available=True
    ).first() is not None


def has_faculty_clash(db, faculty_id, timeslot_id):
    return db.query(Timetable).filter_by(
        faculty_id=faculty_id,
        timeslot_id=timeslot_id
    ).first() is not None


def has_room_clash(db, room_id, timeslot_id):
    return db.query(Timetable).filter_by(
        room_id=room_id,
        timeslot_id=timeslot_id
    ).first() is not None


def has_section_clash(db, section_id, timeslot_id):
    return db.query(Timetable).filter_by(
        section_id=section_id,
        timeslot_id=timeslot_id
    ).first() is not None


# ---------- CORE GENERATOR ----------

def generate_timetable(db, sections, section_courses, faculties, rooms, timeslots):
    """
    section_courses: dict { section_id: [Course, Course, ...] }
    """

    timetable_entries = []

    # Clear old timetable (important for reruns)
    db.query(Timetable).delete()
    db.commit()

    for section in sections:
        courses = section_courses.get(section.id, [])

        for course in courses:
            assigned = False

            for timeslot in timeslots:
                # Section cannot have two classes at same time
                if has_section_clash(db, section.id, timeslot.id):
                    continue

                for faculty in faculties:
                    if not is_faculty_available(db, faculty.id, timeslot.id):
                        continue

                    if has_faculty_clash(db, faculty.id, timeslot.id):
                        continue

                    for room in rooms:
                        # HARD CONSTRAINTS
                        if room.capacity < section.student_count:
                            continue

                        if room.room_type != course.course_type:
                            continue

                        if has_room_clash(db, room.id, timeslot.id):
                            continue

                        # ✅ ALL HARD CONSTRAINTS SATISFIED
                        entry = Timetable(
                            section_id=section.id,
                            course_id=course.id,
                            faculty_id=faculty.id,
                            room_id=room.id,
                            timeslot_id=timeslot.id
                        )

                        db.add(entry)
                        timetable_entries.append(entry)
                        assigned = True
                        break

                    if assigned:
                        break
                if assigned:
                    break

            if not assigned:
                print(f"Warning: No feasible slot for course {course.name} in section {section.name}")

    # Single commit (important)
    db.commit()
    
    # Convert to dict for JSON serialization
    return [
        {
            "id": entry.id,
            "section_id": entry.section_id,
            "course_id": entry.course_id,
            "faculty_id": entry.faculty_id,
            "room_id": entry.room_id,
            "timeslot_id": entry.timeslot_id
        }
        for entry in timetable_entries
    ]