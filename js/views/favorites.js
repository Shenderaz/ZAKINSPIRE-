import { byId } from "../dom.js";
import { getFavorites, removeFavorite, onFavoritesChange } from "../storage.js";
import { renderFavorites } from "../ui.js";
import { VIEW } from "../router.js";

export function initFavoritesView() {
  const list = byId("favorites-list");
  let dirty = true;

  const refresh = () => {
    renderFavorites(list, getFavorites());
    dirty = false;
  };

  list.addEventListener("click", e => {
    const btn = e.target.closest(".remove");
    if (btn) removeFavorite(btn.dataset.id);
  });

  onFavoritesChange(() => { dirty = true; });

  document.addEventListener("view:change", e => {
    if (e.detail.name === VIEW.FAVORITES && dirty) refresh();
  });
}
