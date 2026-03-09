import api from './api';

export const getRooms = async () => {
    const response = await api.get('/room');
    return response.data.data || [];
};

export const createRoom = async (data: any) => {
    const response = await api.post('/room', data);
    return response.data.data;
};

export const updateRoom = async (id: string, data: any) => {
    const response = await api.put(`/room/${id}`, data);
    return response.data.data;
};

export const deleteRoom = async (id: string) => {
    await api.delete(`/room/${id}`);
};
