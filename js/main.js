import { initRouter, navigate, VIEW } from "./router.js";
import { initTheme } from "./theme.js";
import { initAuth } from "./auth.js";
import { initQuoteView } from "./views/quote.js";
import { initVerseView } from "./views/verse.js";
import { initFavoritesView } from "./views/favorites.js";
import { initAuthUI } from "./views/auth-ui.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initAuthUI();
  initAuth();
  initQuoteView();
  initVerseView();
  initFavoritesView();
  initRouter();
  navigate(VIEW.QUOTE);
});
