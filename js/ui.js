import { escape } from "./dom.js";

export function renderQuote(el, quote) {
  el.innerHTML = `
    <p>${escape(quote.content)}</p>
    <span class="attribution">— ${escape(quote.author)}</span>
  `;
}

export function renderVerse(el, verse) {
  el.innerHTML = `
    <p>${escape(verse.text)}</p>
    <span class="attribution">${escape(verse.reference)}</span>
  `;
}

export function renderFavorites(el, favorites) {
  el.innerHTML = "";
  if (!favorites.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No favorites yet.";
    el.appendChild(empty);
    return;
  }
  const frag = document.createDocumentFragment();
  for (const fav of favorites) {
    const li = document.createElement("li");
    const body = document.createElement("p");
    body.textContent = fav.content || fav.text || "";
    const attr = document.createElement("span");
    attr.className = "attribution";
    attr.textContent = fav.author || fav.reference || "";
    const btn = document.createElement("button");
    btn.className = "remove";
    btn.type = "button";
    btn.textContent = "Remove";
    btn.dataset.id = fav.id;
    btn.setAttribute("aria-label", `Remove favorite by ${fav.author || fav.reference || "unknown"}`);
    li.append(body, attr, btn);
    frag.appendChild(li);
  }
  el.appendChild(frag);
}

export function renderError(el, message) {
  el.innerHTML = `<p class="error">${escape(message)}</p>`;
}
