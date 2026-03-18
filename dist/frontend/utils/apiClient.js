"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = exports.getToken = void 0;
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
const getToken = () => localStorage.getItem('token') || '';
exports.getToken = getToken;
const request = async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(0, exports.getToken)()}`,
            ...(options.headers || {}),
        },
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
    }
    if (response.status === 204)
        return undefined;
    return response.json();
};
exports.apiClient = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (path) => request(path, { method: 'DELETE' }),
};
