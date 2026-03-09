import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const useTimetableStore = create((set, get) => ({
    // State
    timetableData: [],
    versions: [],
    selectedVersion: null,
    conflicts: [],
    loading: false,
    error: null,

    // Actions
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    // Fetch timetable versions
    fetchVersions: async () => {
        try {
            set({ loading: true, error: null });
            const response = await axios.get(`${API_BASE_URL}/timetable/versions`);
            const versions = response.data.data || [];
            set({
                versions,
                selectedVersion: versions.length > 0 ? versions[0].id : null,
                loading: false
            });

            // Automatically fetch the first version's data
            if (versions.length > 0) {
                get().fetchTimetable(versions[0].id);
            }
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch versions',
                loading: false
            });
        }
    },

    // Fetch timetable data for a specific version
    fetchTimetable: async (proposalId) => {
        try {
            set({ loading: true, error: null });
            const response = await axios.get(`${API_BASE_URL}/timetable`, {
                params: { proposalId }
            });
            set({
                timetableData: response.data.data || [],
                selectedVersion: proposalId,
                loading: false
            });

            // Also fetch conflicts for this version
            get().fetchConflicts(proposalId);
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch timetable',
                loading: false
            });
        }
    },

    // Fetch conflicts for a specific version
    fetchConflicts: async (proposalId) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/timetable/conflicts/detect`, {
                proposalId
            });
            set({ conflicts: response.data.data || [] });
        } catch (error) {
            console.error('Failed to fetch conflicts:', error);
        }
    },

    // Generate new timetable
    generateTimetable: async () => {
        try {
            set({ loading: true, error: null });
            const response = await axios.post(`${API_BASE_URL}/timetable/generate`);

            // Refresh versions after generation
            await get().fetchVersions();

            set({ loading: false });
            return response.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to generate timetable',
                loading: false
            });
            throw error;
        }
    },

    // Resolve conflicts
    resolveConflicts: async (proposalId) => {
        try {
            set({ loading: true, error: null });
            const response = await axios.post(`${API_BASE_URL}/timetable/conflicts/resolve`, {
                proposalId
            });

            // Refresh the timetable data
            await get().fetchTimetable(proposalId);

            set({ loading: false });
            return response.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to resolve conflicts',
                loading: false
            });
            throw error;
        }
    },
}));

export default useTimetableStore;
