"""Data models package."""
from .faculty import Faculty
from .course import Course
from .section import Section
from .room import Room
from .timeslot import TimeSlot
from .availability import FacultyAvailability
from .timetable import Timetable

__all__ = [
    "Faculty",
    "Course",
    "Section",
    "Room",
    "TimeSlot",
    "FacultyAvailability",
    "Timetable",
]