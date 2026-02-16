import api from './api';

export const getTimeslots = async () => {
    const response = await api.get('/timeslot');
    return response.data.data || [];
};

export const createTimeslot = async (data: any) => {
    const response = await api.post('/timeslot', data);
    return response.data.data;
};

export const updateTimeslot = async (id: string, data: any) => {
    const response = await api.put(`/timeslot/${id}`, data);
    return response.data.data;
};

export const deleteTimeslot = async (id: string) => {
    await api.delete(`/timeslot/${id}`);
};
