import api from './api';

export const getCourses = async () => {
    const response = await api.get('/course');
    return response.data.data || [];
};

export const createCourse = async (data: any) => {
    const response = await api.post('/course', data);
    return response.data.data;
};

export const updateCourse = async (id: string, data: any) => {
    const response = await api.put(`/course/${id}`, data);
    return response.data.data;
};

export const deleteCourse = async (id: string) => {
    await api.delete(`/course/${id}`);
};
