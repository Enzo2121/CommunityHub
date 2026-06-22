const BASE_URL = import.meta.env.VITE_API_URL;
const PROJECT_KEY = import.meta.env.VITE_PROJECT_KEY;

/**
 * Build headers with required X-Project-Key + optional auth token.
 */
function buildHeaders(token = null) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Project-Key': PROJECT_KEY,
  };
  if (token) {
    headers['X-Auth-Token'] = token;
  }
  return headers;
}

/**
 * Core request helper.
 * @param {string} path     - API path, e.g. '/auth/login.php'
 * @param {object} options  - fetch options override
 * @param {string} token    - auth token (optional)
 */
async function request(path, options = {}, token = null) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...buildHeaders(token),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || data?.error || `HTTP Error ${response.status}`;
    throw new Error(message);
  }

  return data;
}

/**
 * GET request.
 */
export function get(path, token = null) {
  return request(path, { method: 'GET' }, token);
}

/**
 * POST request with JSON body.
 */
export function post(path, body = {}, token = null) {
  return request(path, { method: 'POST', body: JSON.stringify(body) }, token);
}
