import { byId } from "../dom.js";
import { renderError } from "../ui.js";
import { addFavorite, removeFavorite, getFavorites, onFavoritesChange } from "../storage.js";
import { getCurrentUser, onUserChange } from "../auth.js";

export function createCardView({ cardId, newBtnId, saveBtnId, kind, fetcher, render, lazy = false }) {
  const card = byId(cardId);
  const likeBtn = byId(saveBtnId);
  let current = null;
  let latest = 0;
  let loaded = false;

  const isLiked = () => current != null && getFavorites().some(f => f.id === current.id);

  function syncLikeBtn() {
    const liked = isLiked();
    const signedIn = getCurrentUser() != null;
    const label = !signedIn
      ? "Sign in to like"
      : liked ? "Remove from favorites" : "Add to favorites";
    likeBtn.setAttribute("aria-pressed", liked ? "true" : "false");
    likeBtn.setAttribute("aria-label", label);
    likeBtn.setAttribute("title", label);
    likeBtn.classList.toggle("is-liked", liked);
    likeBtn.disabled = current == null;
  }

  async function load() {
    const myReq = ++latest;
    try {
      const result = await fetcher();
      if (myReq !== latest) return;
      current = result;
      render(card, current);
      loaded = true;
      syncLikeBtn();
    } catch (err) {
      if (myReq !== latest) return;
      current = null;
      renderError(card, err.message);
      syncLikeBtn();
    }
  }

  byId(newBtnId).addEventListener("click", load);
  likeBtn.addEventListener("click", () => {
    if (!current) return;
    if (!getCurrentUser()) {
      document.dispatchEvent(new Event("auth:require"));
      return;
    }
    if (isLiked()) removeFavorite(current.id);
    else addFavorite({ ...current, kind });
  });
  onFavoritesChange(syncLikeBtn);
  onUserChange(syncLikeBtn);
  syncLikeBtn();

  if (!lazy) load();

  return {
    ensureLoaded() {
      if (!loaded) load();
    }
  };
}
