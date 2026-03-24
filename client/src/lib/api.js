const configuredBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');

export const apiUrl = (path) => {
    if (!path) {
        return configuredBaseUrl || '/';
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return configuredBaseUrl ? `${configuredBaseUrl}${normalizedPath}` : normalizedPath;
};

export const getAuthHeaders = (token) => (
    token ? { Authorization: `Bearer ${token}` } : {}
);

export const apiRequest = async (url, options = {}) => {
    const response = await fetch(apiUrl(url), options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || data.error || `Request failed (${response.status})`);
    }

    return data;
};
