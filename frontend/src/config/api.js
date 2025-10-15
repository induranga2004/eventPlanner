const DEFAULT_NODE_API_BASE = 'http://localhost:4000/api';
const DEFAULT_NODE_UPLOAD_BASE = 'http://localhost:4000';
const DEFAULT_PLANNER_API_BASE = 'http://127.0.0.1:1800';

const stripTrailingSlash = (value) => (value ? value.replace(/\/+$/, '') : '');
const ensureLeadingSlash = (value) => (value?.startsWith('/') ? value : `/${value || ''}`);

export const getNodeApiBase = () =>
  stripTrailingSlash(import.meta.env.VITE_API_BASE_URL) || DEFAULT_NODE_API_BASE;

export const getNodeUploadBase = () => {
  const explicit = stripTrailingSlash(import.meta.env.VITE_NODE_UPLOAD_BASE);
  if (explicit) return explicit;

  const apiBase = getNodeApiBase();
  return apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
};

export const getPlannerApiBase = () =>
  stripTrailingSlash(import.meta.env.VITE_API_BASE) || DEFAULT_PLANNER_API_BASE;

export const getPlannerHeaders = (headers = {}) => {
  const apiKey = import.meta.env.VITE_PLANNER_API_KEY;
  if (apiKey) {
    return { ...headers, 'X-API-Key': apiKey };
  }
  return headers;
};

export const buildNodeApiUrl = (path = '') => `${getNodeApiBase()}${ensureLeadingSlash(path)}`;

export const buildPlannerApiUrl = (path = '') => `${getPlannerApiBase()}${ensureLeadingSlash(path)}`;

export const buildNodeAssetUrl = (path = '') => {
  const relative = path?.startsWith('/') ? path : `/${path || ''}`;
  return `${getNodeUploadBase()}${relative}`;
};
