import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // App bileşenini çağırıyoruz
import "./index.css"; // Global CSS dosyası

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
