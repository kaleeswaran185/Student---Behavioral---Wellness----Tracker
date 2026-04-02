const DEPLOYED_FRONTEND_ORIGIN = 'https://studentbehavioralwellnesstracker.vercel.app';
const DEPLOYED_API_BASE_URL = 'https://sbwt-api.onrender.com';

export const normalizeBaseUrl = (value) => {
    const rawValue = String(value || '').trim();

    if (!rawValue) {
        return '';
    }

    const withoutTrailingSlash = rawValue.replace(/\/+$/, '');

    try {
        const parsed = new URL(withoutTrailingSlash);
        if (parsed.hostname.includes('_')) {
            return '';
        }
        const normalizedPath = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/+$/, '');
        return `${parsed.origin}${normalizedPath}`;
    } catch (_error) {
        return '';
    }
};

export const resolveApiBaseUrl = ({
    configuredBaseUrl = import.meta.env?.VITE_API_BASE_URL,
    currentOrigin = typeof window !== 'undefined' ? window.location.origin : '',
} = {}) => {
    const normalizedConfiguredBaseUrl = normalizeBaseUrl(configuredBaseUrl);
    const normalizedCurrentOrigin = normalizeBaseUrl(currentOrigin);
    const deployedFallbackBaseUrl =
        normalizedCurrentOrigin === DEPLOYED_FRONTEND_ORIGIN ? DEPLOYED_API_BASE_URL : '';

    if (normalizedConfiguredBaseUrl && normalizedConfiguredBaseUrl !== normalizedCurrentOrigin) {
        return normalizedConfiguredBaseUrl;
    }

    return deployedFallbackBaseUrl;
};

const configuredBaseUrl = resolveApiBaseUrl();

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
