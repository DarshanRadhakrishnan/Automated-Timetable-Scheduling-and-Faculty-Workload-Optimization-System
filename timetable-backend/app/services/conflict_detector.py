from app.models.timetable import Timetable
from app.models.conflict import Conflict

def detect_conflicts(db):
    conflicts = []
    entries = db.query(Timetable).all()

    for e in entries:
        # Faculty conflict
        if db.query(Timetable).filter(
            Timetable.faculty_id == e.faculty_id,
            Timetable.timeslot_id == e.timeslot_id,
            Timetable.id != e.id
        ).first():
            conflicts.append(Conflict(
                type="faculty",
                entity_id=e.faculty_id,
                timeslot_id=e.timeslot_id,
                reason="Faculty double booked"
            ))

        # Room conflict
        if db.query(Timetable).filter(
            Timetable.room_id == e.room_id,
            Timetable.timeslot_id == e.timeslot_id,
            Timetable.id != e.id
        ).first():
            conflicts.append(Conflict(
                type="room",
                entity_id=e.room_id,
                timeslot_id=e.timeslot_id,
                reason="Room double booked"
            ))

        # Section conflict
        if db.query(Timetable).filter(
            Timetable.section_id == e.section_id,
            Timetable.timeslot_id == e.timeslot_id,
            Timetable.id != e.id
        ).first():
            conflicts.append(Conflict(
                type="section",
                entity_id=e.section_id,
                timeslot_id=e.timeslot_id,
                reason="Section overlap"
            ))

    db.bulk_save_objects(conflicts)
    db.commit()
    return conflicts
