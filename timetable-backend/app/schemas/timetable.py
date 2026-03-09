"""Pydantic schemas for timetable API."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FacultySchema(BaseModel):
    """Faculty schema."""
    name: str
    email: str
    department: str
    max_hours_per_week: Optional[int] = 20


class CourseSchema(BaseModel):
    """Course schema."""
    code: str
    name: str
    credits: float
    hours_per_week: int
    semester: int


class SectionSchema(BaseModel):
    """Section schema."""
    name: str
    course_id: int
    capacity: int
    faculty_id: Optional[int] = None


class RoomSchema(BaseModel):
    """Room schema."""
    code: str
    name: str
    capacity: int
    floor: Optional[int] = None


class TimeSlotSchema(BaseModel):
    """TimeSlot schema."""
    day: str
    start_time: str
    end_time: str
    duration_minutes: int


class TimetableSchema(BaseModel):
    """Timetable entry schema."""
    section_id: int
    faculty_id: int
    room_id: int
    timeslot_id: int
    status: Optional[str] = "scheduled"

    class Config:
        from_attributes = True


class TimetableResponseSchema(TimetableSchema):
    """Timetable response schema."""
    id: int
    created_at: datetime
    updated_at: datetime
