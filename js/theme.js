import { get, set } from "./storage.js";
import { byId } from "./dom.js";

const KEY = "theme";

export function initTheme() {
  const saved = get(KEY) || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const toggle = byId("theme-toggle");
  apply(saved, toggle);
  toggle.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    apply(next, toggle);
    set(KEY, next);
  });
}

function apply(theme, toggle) {
  document.documentElement.dataset.theme = theme;
  toggle.setAttribute("aria-pressed", String(theme === "dark"));
}
