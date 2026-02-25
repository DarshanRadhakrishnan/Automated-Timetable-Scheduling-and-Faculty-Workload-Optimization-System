'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface TimetableEntry {
    _id: string;
    day: string;
    timeslotId: {
        startTime: string;
        endTime: string;
        day: string;
    };
    sectionId: { name: string };
    courseId: { name: string };
    facultyId: { name: string };
    roomId: { name: string };
}

interface TimetableCalendarProps {
    timetable?: TimetableEntry[]; // Accept raw timetable
    events?: any[]; // Keep backwards compatibility if needed
    onEventClick?: (entry: any) => void;
}

const TimetableCalendar: React.FC<TimetableCalendarProps> = ({ timetable = [], events: propEvents, onEventClick }) => {

    // Transform timetable entries to FullCalendar events
    const generatedEvents = React.useMemo(() => {
        if (propEvents) return propEvents;

        return timetable.map(entry => {
            // Map day string to a date or recurring event
            // Simple approach: Use recurring events based on day of week
            const daysMap: { [key: string]: number } = {
                'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
            };

            return {
                id: entry._id,
                title: `${entry.courseId?.name} (${entry.sectionId?.name})`,
                startTime: entry.timeslotId?.startTime,
                endTime: entry.timeslotId?.endTime,
                daysOfWeek: [daysMap[entry.timeslotId?.day || 'Monday']],
                extendedProps: {
                    room: entry.roomId?.name,
                    faculty: entry.facultyId?.name,
                    entry: entry
                }
            };
        });
    }, [timetable, propEvents]);

    return (
        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 dark:text-white">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={generatedEvents}
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                allDaySlot={false}
                height="auto"
                eventClick={(info) => {
                    if (onEventClick) {
                        onEventClick(info.event.extendedProps.entry);
                    }
                }}
                eventContent={(eventInfo) => (
                    <div className="p-1 text-xs overflow-hidden">
                        <div className="font-bold truncate">{eventInfo.event.title}</div>
                        <div className="truncate text-gray-600 dark:text-gray-300">{eventInfo.event.extendedProps.room}</div>
                        <div className="truncate italic">{eventInfo.event.extendedProps.faculty}</div>
                    </div>
                )}
            />
        </div>
    );
};

export default TimetableCalendar;
