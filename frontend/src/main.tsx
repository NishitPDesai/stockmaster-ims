import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { store } from "./store/store";
import { restoreAuth } from "./store/slices/authSlice";
import { getStoredUser, getAuthToken } from "./lib/auth";

// Try to restore auth from localStorage on app load
// Only restore if both user and token exist
const user = getStoredUser();
const token = getAuthToken();
if (user && token) {
  store.dispatch(restoreAuth());
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
