const PREFIX = "zakinspired:";
const FAVORITES_KEY = "favorites";
const FAVORITES_CAP = 200;

const bus = new EventTarget();

export function get(key, fallback = null) {
  const raw = localStorage.getItem(PREFIX + key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function set(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function cacheGet(key, ttlMs) {
  const entry = get(`cache:${key}`);
  if (!entry) return null;
  if (Date.now() - entry.savedAt > ttlMs) return null;
  return entry.value;
}

export function cacheSet(key, value) {
  set(`cache:${key}`, { savedAt: Date.now(), value });
}

export function getFavorites() {
  return get(FAVORITES_KEY, []);
}

export function addFavorite(item) {
  if (!item?.id) return false;
  const list = getFavorites();
  if (list.some(f => f.id === item.id)) return false;
  list.unshift({ ...item, savedAt: Date.now() });
  if (list.length > FAVORITES_CAP) list.length = FAVORITES_CAP;
  set(FAVORITES_KEY, list);
  bus.dispatchEvent(new Event("change"));
  return true;
}

export function removeFavorite(id) {
  const next = getFavorites().filter(f => f.id !== id);
  set(FAVORITES_KEY, next);
  bus.dispatchEvent(new Event("change"));
}

export function onFavoritesChange(handler) {
  bus.addEventListener("change", handler);
}
