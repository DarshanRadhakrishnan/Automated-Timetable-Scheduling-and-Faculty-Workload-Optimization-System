import { useState } from 'react';
import { AlertCircle, Clock, MapPin, User } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
    '8:00 AM - 9:00 AM',
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
];

const TimetableGrid = ({ timetableData, conflicts }) => {
    const [hoveredCell, setHoveredCell] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);

    // Create a map of conflicts for quick lookup
    const conflictMap = new Map();
    conflicts?.forEach(conflict => {
        const key = `${conflict.timeslotId?._id || conflict.timeslotId}`;
        if (!conflictMap.has(key)) {
            conflictMap.set(key, []);
        }
        conflictMap.get(key).push(conflict);
    });

    // Group timetable data by day and time slot
    const getTimetableCell = (day, timeSlot) => {
        return timetableData.filter(entry => {
            const entryDay = entry.timeslotId?.day || entry.day;
            const entryTime = entry.timeslotId?.time || entry.time;
            return entryDay === day && entryTime === timeSlot;
        });
    };

    // Check if a cell has conflicts
    const hasConflict = (entries) => {
        if (!entries || entries.length === 0) return false;

        return entries.some(entry => {
            const timeslotId = entry.timeslotId?._id || entry.timeslotId;
            return conflictMap.has(timeslotId);
        });
    };

    const CellContent = ({ entries, day, timeSlot }) => {
        if (!entries || entries.length === 0) {
            return (
                <div className="timetable-cell bg-slate-50 dark:bg-slate-900/20 min-h-[100px] flex items-center justify-center">
                    <span className="text-xs text-slate-400 dark:text-slate-600">Free</span>
                </div>
            );
        }

        const cellHasConflict = hasConflict(entries);
        const cellKey = `${day}-${timeSlot}`;
        const isHovered = hoveredCell === cellKey;

        return (
            <div
                className={`timetable-cell min-h-[100px] relative ${cellHasConflict ? 'timetable-cell-conflict' : 'timetable-cell-occupied'
                    }`}
                onMouseEnter={() => setHoveredCell(cellKey)}
                onMouseLeave={() => setHoveredCell(null)}
                onClick={() => setSelectedCell(selectedCell === cellKey ? null : cellKey)}
            >
                {entries.map((entry, index) => {
                    const course = entry.courseId?.code || entry.course || 'N/A';
                    const faculty = entry.facultyId?.name || entry.faculty || 'N/A';
                    const room = entry.roomId?.name || entry.room || 'N/A';
                    const section = entry.sectionId?.name || entry.section || 'N/A';

                    return (
                        <div key={index} className={index > 0 ? 'mt-2 pt-2 border-t border-slate-300 dark:border-slate-600' : ''}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                                        {course}
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                                        {section}
                                    </p>
                                </div>
                                {cellHasConflict && (
                                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                )}
                            </div>

                            {/* Show details on hover or selection */}
                            {(isHovered || selectedCell === cellKey) && (
                                <div className="mt-3 space-y-1 animate-fade-in">
                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                        <User className="w-3 h-3" />
                                        <span>{faculty}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                        <MapPin className="w-3 h-3" />
                                        <span>{room}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
                {/* Header Row */}
                <div className="grid grid-cols-6 gap-3 mb-3">
                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg p-3 flex items-center justify-center font-semibold text-slate-700 dark:text-slate-200">
                        <Clock className="w-4 h-4 mr-2" />
                        Time
                    </div>
                    {DAYS.map(day => (
                        <div
                            key={day}
                            className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-3 text-center font-semibold text-primary-700 dark:text-primary-300"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Time Slot Rows */}
                <div className="space-y-3">
                    {TIME_SLOTS.map(timeSlot => (
                        <div key={timeSlot} className="grid grid-cols-6 gap-3">
                            {/* Time Column */}
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 flex items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-300">
                                {timeSlot}
                            </div>

                            {/* Day Columns */}
                            {DAYS.map(day => {
                                const entries = getTimetableCell(day, timeSlot);
                                return (
                                    <div key={`${day}-${timeSlot}`}>
                                        <CellContent entries={entries} day={day} timeSlot={timeSlot} />
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex gap-6 items-center text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-300 rounded"></div>
                    <span className="text-slate-600 dark:text-slate-300">Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-red-50 to-red-100 border border-red-400 rounded"></div>
                    <span className="text-slate-600 dark:text-slate-300">Conflict</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-50 border border-slate-200 rounded"></div>
                    <span className="text-slate-600 dark:text-slate-300">Free Slot</span>
                </div>
            </div>
        </div>
    );
};

export default TimetableGrid;
