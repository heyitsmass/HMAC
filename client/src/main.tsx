import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import Protector from "./components/Protector.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Protector>
      <App />
    </Protector>
  </React.StrictMode>
);
//<App />
