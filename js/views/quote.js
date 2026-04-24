import { fetchRandomQuote } from "../api.js";
import { renderQuote } from "../ui.js";
import { createCardView } from "./createCardView.js";

export function initQuoteView() {
  return createCardView({
    cardId: "quote-card",
    newBtnId: "new-quote",
    saveBtnId: "save-quote",
    kind: "quote",
    fetcher: () => fetchRandomQuote(),
    render: renderQuote
  });
}
