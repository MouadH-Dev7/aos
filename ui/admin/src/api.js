const normalizeBaseUrl = (value) => String(value || "").trim().replace(/\/+$/, "");

const buildBaseCandidates = (configuredValue, defaults) => {
  const candidates = [configuredValue, ...defaults].map(normalizeBaseUrl).filter(Boolean);
  return [...new Set(candidates)];
};

const joinBaseUrl = (baseUrl, path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

export const fetchWithFallback = async (baseUrls, path, options) => {
  let lastNetworkError = null;

  for (const baseUrl of baseUrls) {
    try {
      return await fetch(joinBaseUrl(baseUrl, path), options);
    } catch (error) {
      lastNetworkError = error;
    }
  }

  throw lastNetworkError || new Error("All API base URLs are unreachable.");
};

export const AUTH_BASE_URLS = buildBaseCandidates(import.meta.env.VITE_AUTH_BASE_URL, [
  "http://localhost:8080/api/auth",
  "http://localhost:8001",
]);

export const LISTING_BASE_URLS = buildBaseCandidates(import.meta.env.VITE_LISTING_BASE_URL, [
  "http://localhost:8080/api/listing",
  "http://localhost:8004",
]);

export const ADMIN_BASE_URLS = buildBaseCandidates(import.meta.env.VITE_ADMIN_BASE_URL, [
  "http://localhost:8080/api/admin",
  "http://localhost:8005",
]);
