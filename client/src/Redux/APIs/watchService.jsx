// src/Redux/APIs/watchAPI.js
import Axios from './Axios';

// Ghi nhận tiến độ
export const upsertWatchService = async (payload) => {
    const { data } = await Axios.post('/watch', payload);
    return data;
};

// Tiếp tục xem
export const getContinueWatchingService = async () => {
    const { data } = await Axios.get('/watch/me/continue');
    return data?.data || [];
};

// Đã xem gần đây
export const getRecentlyWatchedService = async () => {
    const { data } = await Axios.get('/watch/me/recent');
    return data?.data || [];
};

// State resume
export const getPlaybackStateService = async (params) => {
    const { data } = await Axios.get('/watch/me/state', { params });
    return data?.data || null;
};

// Xoá 1 mục
export const deleteOnePlaybackService = async (token, movieId) => {
    const { data } = await Axios.delete(`/watch/me/${movieId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
};

// Xoá toàn bộ
export const clearAllPlaybackService = async () => {
    const { data } = await Axios.delete('/watch/me');
    return data;
};

// Admin top
export const adminTopWatchedService = async () => {
    const { data } = await Axios.get('/watch/admin/top');
    return data?.data || [];
};
