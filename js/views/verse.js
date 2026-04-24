import { fetchVerse } from "../api.js";
import { renderVerse } from "../ui.js";
import { createCardView } from "./createCardView.js";

const PICKS = [
  "John 3:16",
  "Psalm 23:1",
  "Romans 8:28",
  "Philippians 4:13",
  "Proverbs 3:5",
  "Isaiah 41:10",
  "Jeremiah 29:11",
  "Joshua 1:9",
  "Matthew 11:28",
  "2 Corinthians 5:7"
];

const randomPick = () => ({ reference: PICKS[Math.floor(Math.random() * PICKS.length)] });

export function initVerseView() {
  return createCardView({
    cardId: "verse-card",
    newBtnId: "new-verse",
    saveBtnId: "save-verse",
    kind: "verse",
    fetcher: () => fetchVerse(randomPick()),
    render: renderVerse,
    lazy: true
  });
}
