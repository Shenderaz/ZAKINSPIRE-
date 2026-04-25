let el = null;
let hideTimer = null;

function ensureEl() {
  if (el) return el;
  el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.hidden = true;
    document.body.appendChild(el);
  }
  return el;
}

export function showToast(message, ms = 4000) {
  const node = ensureEl();
  node.textContent = message;
  node.hidden = false;
  node.classList.add("toast--visible");
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    node.classList.remove("toast--visible");
    setTimeout(() => { node.hidden = true; }, 250);
  }, ms);
}
