import api, { apiLongRunning } from './api';

// ==================== DYNAMIC RESCHEDULING SERVICES ====================

/**
 * Postpone a class to another time slot
 * @param entryId - Timetable entry ID to postpone
 * @param newTimeslotId - New timeslot ID
 * @param checkAvailability - Whether to check room availability first
 */
export const postponeClass = async (entryId: string, newTimeslotId: string, checkAvailability = true) => {
    const response = await api.post('/rescheduling/apply-changes', {
        updates: [{
            entryId,
            type: 'update',
            changes: { timeslotId: newTimeslotId }
        }]
    });
    return response.data;
};

/**
 * Cancel a class completely
 * @param entryId - Timetable entry ID to cancel
 */
export const cancelClass = async (entryId: string) => {
    const response = await api.post('/rescheduling/apply-changes', {
        updates: [{
            entryId,
            type: 'cancel'
        }]
    });
    return response.data;
};

/**
 * Assign substitute faculty to a class
 * @param entryId - Timetable entry ID
 * @param newFacultyId - Substitute faculty ID
 */
export const assignSubstituteFaculty = async (entryId: string, newFacultyId: string) => {
    const response = await api.post('/rescheduling/apply-changes', {
        updates: [{
            entryId,
            type: 'update',
            changes: { facultyId: newFacultyId }
        }]
    });
    return response.data;
};

/**
 * Check room availability for a specific timeslot
 * @param roomId - Room ID to check
 * @param timeslotId - Timeslot ID to check
 * @param proposalId - Proposal ID (default 1)
 */
export const checkRoomAvailability = async (roomId: string, timeslotId: string, proposalId: number = 1) => {
    const response = await api.get(`/timetable?proposalId=${proposalId}`);
    const entries = response.data.data || [];

    // Check if room is occupied at this timeslot
    const conflict = entries.find((entry: any) =>
        entry.roomId?._id === roomId && entry.timeslotId?._id === timeslotId
    );

    return {
        available: !conflict,
        conflict: conflict || null
    };
};

/**
 * Find substitute faculty for a faculty on leave
 * @param facultyId - Faculty ID on leave
 * @param day - Day of the week
 * @param proposalId - Proposal ID (default 1)
 */
export const findSubstituteFaculty = async (facultyId: string, day: string, proposalId: number = 1) => {
    const response = await api.post('/rescheduling/check-faculty-leave', {
        facultyId,
        day,
        proposalId
    });
    return response.data;
};

/**
 * Find alternative rooms for a room under maintenance
 * @param roomId - Room ID under maintenance
 * @param day - Day of the week
 * @param proposalId - Proposal ID (default 1)
 */
export const findAlternativeRooms = async (roomId: string, day: string, proposalId: number = 1) => {
    const response = await api.post('/rescheduling/check-room-maintenance', {
        roomId,
        day,
        proposalId
    });
    return response.data;
};

/**
 * Handle public holiday rescheduling
 * @param day - Day marked as public holiday
 * @param proposalId - Proposal ID (default 1)
 */
export const rescheduleHoliday = async (day: string, proposalId: number = 1) => {
    const response = await apiLongRunning.post('/rescheduling/check-holiday', {
        day,
        proposalId
    });
    return response.data;
};

/**
 * Apply multiple changes at once
 * @param updates - Array of updates to apply
 */
export const applyBulkChanges = async (updates: Array<{
    entryId: string;
    type: 'update' | 'cancel';
    changes?: any;
}>) => {
    const response = await api.post('/rescheduling/apply-changes', {
        updates
    });
    return response.data;
};

/**
 * Get all available faculties
 */
export const getAvailableFaculties = async () => {
    const response = await api.get('/faculty');
    return response.data.data || [];
};

/**
 * Get all available rooms
 */
export const getAvailableRooms = async () => {
    const response = await api.get('/room');
    return response.data.data || [];
};

/**
 * Get all timeslots
 */
export const getTimeslots = async () => {
    const response = await api.get('/timeslot');
    return response.data.data || [];
};
