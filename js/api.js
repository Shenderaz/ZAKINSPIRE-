import { cacheGet, cacheSet } from "./storage.js";

const QUOTES = "https://dummyjson.com/quotes";
const BIBLE = "https://bible-api.com";

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function cachedJson(url, ttlMs) {
  const cached = cacheGet(url, ttlMs);
  if (cached) return cached;
  const value = await getJson(url);
  cacheSet(url, value);
  return value;
}

export async function fetchRandomQuote() {
  const data = await getJson(`${QUOTES}/random`);
  return { id: String(data.id), content: data.quote, author: data.author };
}

export async function fetchVerse({ reference, translation = "web" } = {}) {
  const url = `${BIBLE}/${encodeURIComponent(reference)}?translation=${translation}`;
  const data = await cachedJson(url, 1000 * 60 * 60);
  const text = (data.text || "").trim();
  const label = (data.translation_id || translation).toUpperCase();
  return {
    id: `verse:${translation}:${reference}`,
    text,
    reference: `${data.reference || reference} (${label})`
  };
}
