import { initRouter, navigate, VIEW } from "./router.js";
import { initTheme } from "./theme.js";
import { initQuoteView } from "./views/quote.js";
import { initVerseView } from "./views/verse.js";
import { initFavoritesView } from "./views/favorites.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initQuoteView();
  initVerseView();
  initFavoritesView();
  initRouter();
  navigate(VIEW.QUOTE);
});
