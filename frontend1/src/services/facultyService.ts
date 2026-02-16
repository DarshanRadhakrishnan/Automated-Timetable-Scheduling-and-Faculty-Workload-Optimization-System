import api from './api';

export const getFaculties = async () => {
    const response = await api.get('/faculty');
    return response.data.data || [];
};

export const createFaculty = async (data: any) => {
    const response = await api.post('/faculty', data);
    return response.data.data;
};

export const updateFaculty = async (id: string, data: any) => {
    const response = await api.put(`/faculty/${id}`, data);
    return response.data.data;
};

export const deleteFaculty = async (id: string) => {
    await api.delete(`/faculty/${id}`);
};
