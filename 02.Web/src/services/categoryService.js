import api from "./api";

const CACHE_KEY = "categories_cache_v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const getCategories = async (forceRefresh = false) => {
  try {
    if (!forceRefresh) {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.ts && Date.now() - parsed.ts < CACHE_TTL_MS && Array.isArray(parsed.data)) {
          return parsed.data;
        }
      }
    }

    const res = await api.get("/admin/categories");
    // API returns { success: true, data: [...] }
    const data = res.data?.data || res.data || [];
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch (e) {
      // ignore storage errors
      console.warn('Could not cache categories:', e.message);
    }
    return data;
  } catch (err) {
    // On error, try to return cached value if exists
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return parsed.data || [];
      } catch (e) {
        return [];
      }
    }
    throw err;
  }
};

export default { getCategories };
