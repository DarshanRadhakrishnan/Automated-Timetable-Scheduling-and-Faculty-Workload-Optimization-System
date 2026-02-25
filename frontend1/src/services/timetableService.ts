import api, { apiLongRunning } from './api';

export const getTimetables = async (proposalId?: number) => {
    // Fetch timetable for specific proposal or all if not specified
    const url = proposalId ? `/timetable?proposalId=${proposalId}` : '/timetable';
    const response = await api.get(url);
    return response.data.data || [];
};

export const generateTimetable = async () => {
    const response = await apiLongRunning.post('/timetable/generate');
    return response.data; // Returns { bestSchedule, rankings }
};

export const getRankings = async () => {
    // Get metadata about all 3 proposals
    const response = await api.get('/timetable/versions');
    return response.data.data || [];
};

export const detectConflicts = async (proposalId: number = 1) => {
    const response = await apiLongRunning.post('/timetable/conflicts/detect', { proposalId });
    return response.data;
};

export const resolveConflicts = async (proposalId: number = 1) => {
    const response = await apiLongRunning.post('/timetable/conflicts/resolve', { proposalId });
    return response.data;
};

export const clearTimetable = async () => {
    const response = await api.delete('/timetable');
    return response.data;
};

export const getStats = async () => {
    const response = await api.get('/timetable/stats');
    return response.data.data;
};

