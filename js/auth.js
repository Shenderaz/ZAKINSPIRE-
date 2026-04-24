import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./firebase.js";
import { attachUser } from "./storage.js";

const googleProvider = new GoogleAuthProvider();
const bus = new EventTarget();
let current = null;

export function initAuth() {
  onAuthStateChanged(auth, user => {
    current = user;
    attachUser(user);
    bus.dispatchEvent(new Event("change"));
  });
}

export function onUserChange(handler) {
  bus.addEventListener("change", handler);
}

export function getCurrentUser() {
  return current;
}

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOut() {
  return fbSignOut(auth);
}

export function friendlyAuthError(err) {
  const code = err?.code || "";
  switch (code) {
    case "auth/invalid-email": return "That email address doesn't look right.";
    case "auth/missing-password": return "Please enter a password.";
    case "auth/weak-password": return "Password must be at least 6 characters.";
    case "auth/email-already-in-use": return "An account with this email already exists.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found": return "Email or password is incorrect.";
    case "auth/popup-closed-by-user": return "Sign-in cancelled.";
    case "auth/popup-blocked": return "Your browser blocked the sign-in popup. Allow popups for this site and try again.";
    case "auth/operation-not-allowed": return "This sign-in method isn't enabled in Firebase. Enable it under Authentication → Sign-in method.";
    case "auth/network-request-failed": return "Network error. Check your connection.";
    default: return err?.message || "Something went wrong. Please try again.";
  }
}
