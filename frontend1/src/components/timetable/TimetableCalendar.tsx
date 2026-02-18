'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface TimetableCalendarProps {
    events: any[];
}

const TimetableCalendar: React.FC<TimetableCalendarProps> = ({ events }) => {
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
                events={events}
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                allDaySlot={false}
                height="auto"
                eventContent={(eventInfo) => (
                    <div className="p-1 text-xs">
                        <div className="font-bold">{eventInfo.event.title}</div>
                        <div>{eventInfo.event.extendedProps.room}</div>
                        <div>{eventInfo.event.extendedProps.faculty}</div>
                    </div>
                )}
            />
        </div>
    );
};

export default TimetableCalendar;
