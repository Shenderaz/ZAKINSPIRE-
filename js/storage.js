import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase.js";
import { showToast } from "./toast.js";

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

let _favorites = readLocal();
let _user = null;
let _unsubFirestore = null;
let _attachGen = 0;

function readLocal() {
  return get(FAVORITES_KEY, []);
}

function writeLocal(list) {
  set(FAVORITES_KEY, list);
}

function emit() {
  bus.dispatchEvent(new Event("change"));
}

function docId(id) {
  return encodeURIComponent(id);
}

function favoritesCol(uid) {
  return collection(db, "users", uid, "favorites");
}

export async function attachUser(user) {
  const myGen = ++_attachGen;

  if (_unsubFirestore) {
    _unsubFirestore();
    _unsubFirestore = null;
  }

  _user = user;

  if (!user) {
    _favorites = readLocal();
    emit();
    return;
  }

  const local = readLocal();
  if (local.length) {
    try {
      await Promise.all(
        local.map(item =>
          setDoc(doc(favoritesCol(user.uid), docId(item.id)), item, { merge: true })
        )
      );
      if (myGen !== _attachGen) return;
      writeLocal([]);
    } catch (err) {
      console.error("Failed to merge local favorites into cloud:", err);
      if (myGen !== _attachGen) return;
    }
  }

  const q = query(favoritesCol(user.uid), orderBy("savedAt", "desc"));
  _unsubFirestore = onSnapshot(
    q,
    snap => {
      if (myGen !== _attachGen) return;
      _favorites = snap.docs.map(d => d.data());
      emit();
    },
    err => {
      console.error("Favorites snapshot error:", err);
      showToast("Couldn't sync favorites: " + (err?.message || err));
    }
  );
}

export function getFavorites() {
  return _favorites.slice();
}

export function addFavorite(item) {
  if (!item?.id) return false;
  if (_favorites.some(f => f.id === item.id)) return false;
  const entry = { ...item, savedAt: Date.now() };

  if (_user) {
    _favorites = [entry, ..._favorites];
    emit();
    setDoc(doc(favoritesCol(_user.uid), docId(item.id)), entry)
      .catch(err => {
        console.error("Add favorite failed:", err);
        _favorites = _favorites.filter(f => f.id !== item.id);
        emit();
        showToast("Couldn't save: " + (err?.message || err));
      });
  } else {
    _favorites = [entry, ...readLocal().filter(f => f.id !== item.id)];
    if (_favorites.length > FAVORITES_CAP) _favorites.length = FAVORITES_CAP;
    writeLocal(_favorites);
    emit();
  }
  return true;
}

export function removeFavorite(id) {
  if (_user) {
    const removed = _favorites.find(f => f.id === id);
    if (!removed) return;
    _favorites = _favorites.filter(f => f.id !== id);
    emit();
    deleteDoc(doc(favoritesCol(_user.uid), docId(id)))
      .catch(err => {
        console.error("Remove favorite failed:", err);
        _favorites = [removed, ..._favorites];
        emit();
        showToast("Couldn't remove: " + (err?.message || err));
      });
  } else {
    _favorites = readLocal().filter(f => f.id !== id);
    writeLocal(_favorites);
    emit();
  }
}

export function onFavoritesChange(handler) {
  bus.addEventListener("change", handler);
}
