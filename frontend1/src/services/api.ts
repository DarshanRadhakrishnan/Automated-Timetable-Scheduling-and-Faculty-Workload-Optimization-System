import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ── Simple in-memory GET cache (30 s TTL) ───────────────────
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 30_000; // 30 seconds

function getCached(key: string) {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
    cache.delete(key);
    return null;
}

function setCached(key: string, data: any) {
    cache.set(key, { data, ts: Date.now() });
}

/** Invalidate cache entries whose URL starts with a given prefix */
export function invalidateCache(prefix?: string) {
    if (!prefix) {
        cache.clear();
        return;
    }
    for (const key of cache.keys()) {
        if (key.startsWith(prefix)) cache.delete(key);
    }
}

// ── Axios instances ─────────────────────────────────────────
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds default timeout (up from 10 s)
});

// Separate instance for long-running operations (conflict detection, generation, etc.)
export const apiLongRunning = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 180000, // 180 seconds timeout for long operations
});

// ── Auth request interceptor ────────────────────────────────
const requestInterceptor = (config: any) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
};

api.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
apiLongRunning.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));

// ── GET-request cache interceptor (api instance only) ───────
api.interceptors.request.use((config) => {
    if (config.method === 'get') {
        const key = `${config.baseURL}${config.url}`;
        const hit = getCached(key);
        if (hit) {
            // Abort the real request and return cached data
            const source = axios.CancelToken.source();
            config.cancelToken = source.token;
            source.cancel(JSON.stringify(hit)); // pack data into cancel message
            return config;
        }
    }
    return config;
});

// ── Retry logic (exponential backoff) ───────────────────────
const RETRY_CODES = new Set([408, 429, 500, 502, 503, 504]);
const MAX_RETRIES = 2;

function shouldRetry(error: AxiosError) {
    if (!error.config) return false;
    const retries = (error.config as any).__retryCount || 0;
    if (retries >= MAX_RETRIES) return false;

    // Retry on network errors or specific status codes
    if (!error.response) return true; // network / timeout
    return RETRY_CODES.has(error.response.status);
}

async function retryInterceptor(error: AxiosError) {
    if (shouldRetry(error)) {
        const config = error.config as InternalAxiosRequestConfig & { __retryCount?: number };
        config.__retryCount = (config.__retryCount || 0) + 1;
        const delay = Math.min(1000 * 2 ** (config.__retryCount - 1), 5000);
        await new Promise((r) => setTimeout(r, delay));
        return axios(config);
    }
    return Promise.reject(error);
}

// ── Response interceptors ───────────────────────────────────
api.interceptors.response.use(
    (response) => {
        // Store successful GET responses in cache
        if (response.config.method === 'get') {
            const key = `${response.config.baseURL}${response.config.url}`;
            setCached(key, response.data);
        }
        return response;
    },
    (error) => {
        // Serve from cache on cancel (our caching mechanism)
        if (axios.isCancel(error)) {
            try {
                return Promise.resolve({ data: JSON.parse(error.message || '{}'), status: 200, cached: true } as any);
            } catch {
                return Promise.reject(error);
            }
        }
        console.error('API Error:', error.response ? error.response.data : error.message);
        return retryInterceptor(error);
    }
);

apiLongRunning.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response ? error.response.data : error.message);
        return retryInterceptor(error);
    }
);

export default api;

