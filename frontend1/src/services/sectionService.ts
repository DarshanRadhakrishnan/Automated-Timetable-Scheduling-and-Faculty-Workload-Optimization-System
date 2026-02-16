import api from './api';

export const getSections = async () => {
    const response = await api.get('/section');
    return response.data.data || [];
};

export const createSection = async (data: any) => {
    const response = await api.post('/section', data);
    return response.data.data;
};

export const updateSection = async (id: string, data: any) => {
    const response = await api.put(`/section/${id}`, data);
    return response.data.data;
};

export const deleteSection = async (id: string) => {
    await api.delete(`/section/${id}`);
};
