import { byId } from "./dom.js";

export const VIEW = {
  QUOTE: "quote",
  VERSE: "verse",
  FAVORITES: "favorites"
};

const VIEWS = {
  [VIEW.QUOTE]: { btn: "nav-quote", view: "quote-view" },
  [VIEW.VERSE]: { btn: "nav-verse", view: "verse-view" },
  [VIEW.FAVORITES]: { btn: "nav-favorites", view: "favorites-view" }
};

export function initRouter() {
  for (const [name, ids] of Object.entries(VIEWS)) {
    byId(ids.btn).addEventListener("click", () => navigate(name));
  }
}

export function navigate(name) {
  for (const [n, ids] of Object.entries(VIEWS)) {
    const active = n === name;
    byId(ids.view).hidden = !active;
    byId(ids.btn).setAttribute("aria-pressed", String(active));
  }
  const heading = byId(VIEWS[name].view).querySelector("h2");
  heading?.focus?.();
  document.dispatchEvent(new CustomEvent("view:change", { detail: { name } }));
}
