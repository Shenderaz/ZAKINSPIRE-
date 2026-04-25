import { byId } from "../dom.js";
import {
  signInWithGoogle,
  signUpWithEmail,
  signInWithEmail,
  signOut,
  onUserChange,
  getCurrentUser,
  friendlyAuthError,
} from "../auth.js";

export function initAuthUI() {
  const signInBtn = byId("auth-signin");
  const signOutBtn = byId("auth-signout");
  const userLabel = byId("auth-user");
  const modal = byId("auth-modal");
  const closeBtn = byId("auth-close");
  const googleBtn = byId("auth-google");
  const form = byId("auth-form");
  const emailInput = byId("auth-email");
  const passwordInput = byId("auth-password");
  const submitBtn = byId("auth-submit");
  const toggleLink = byId("auth-toggle");
  const modeTitle = byId("auth-title");
  const toggleText = byId("auth-toggle-text");
  const errorEl = byId("auth-error");

  let mode = "signin";
  let busy = false;

  function openModal() {
    errorEl.textContent = "";
    form.reset();
    modal.hidden = false;
    emailInput.focus();
  }

  function closeModal() {
    if (busy) return;
    modal.hidden = true;
    errorEl.textContent = "";
  }

  function setMode(next) {
    mode = next;
    if (mode === "signin") {
      modeTitle.textContent = "Sign in";
      submitBtn.textContent = "Sign in";
      toggleText.textContent = "Don't have an account?";
      toggleLink.textContent = "Create one";
      passwordInput.autocomplete = "current-password";
    } else {
      modeTitle.textContent = "Create account";
      submitBtn.textContent = "Create account";
      toggleText.textContent = "Already have an account?";
      toggleLink.textContent = "Sign in";
      passwordInput.autocomplete = "new-password";
    }
    errorEl.textContent = "";
  }

  function setBusy(next) {
    busy = next;
    submitBtn.disabled = next;
    googleBtn.disabled = next;
    closeBtn.disabled = next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    errorEl.textContent = "";
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
      errorEl.textContent = "Email and password are required.";
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") await signInWithEmail(email, password);
      else await signUpWithEmail(email, password);
      closeModal();
    } catch (err) {
      errorEl.textContent = friendlyAuthError(err);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    errorEl.textContent = "";
    setBusy(true);
    try {
      await signInWithGoogle();
      closeModal();
    } catch (err) {
      errorEl.textContent = friendlyAuthError(err);
    } finally {
      setBusy(false);
    }
  }

  function firstName(user) {
    if (user.displayName) return user.displayName.trim().split(/\s+/)[0];
    if (user.email) return user.email.split("@")[0];
    return "Signed in";
  }

  function renderUser() {
    const user = getCurrentUser();
    if (user) {
      signInBtn.hidden = true;
      signOutBtn.hidden = false;
      userLabel.hidden = false;
      userLabel.textContent = firstName(user);
    } else {
      signInBtn.hidden = false;
      signOutBtn.hidden = true;
      userLabel.hidden = true;
      userLabel.textContent = "";
    }
  }

  signInBtn.addEventListener("click", openModal);
  document.addEventListener("auth:require", () => {
    setMode("signin");
    openModal();
  });
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", e => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });
  googleBtn.addEventListener("click", handleGoogle);
  form.addEventListener("submit", handleSubmit);
  toggleLink.addEventListener("click", () => {
    setMode(mode === "signin" ? "signup" : "signin");
  });
  signOutBtn.addEventListener("click", async () => {
    try { await signOut(); } catch (err) { console.error(err); }
  });

  onUserChange(renderUser);
  setMode("signin");
  // Hide until first onAuthStateChanged fires to avoid a "Sign in" flash for returning users.
  signInBtn.hidden = true;
  signOutBtn.hidden = true;
}
