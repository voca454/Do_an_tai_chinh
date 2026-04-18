// File: src/App.js
import React, { useState } from "react";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import Chatbot from "./components/Chatbot";
import { setAuthToken } from "./services/apiClient";
import "./assets/App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(localStorage.getItem("username"));

  const onLogin = (newToken, username) => {
    setAuthToken(newToken);
    setToken(newToken);
    setUser(username);
    localStorage.setItem("username", username);
  };

  const onLogout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    localStorage.removeItem("username");
  };

  return (
    <div className="app-wrapper">
      {!token ? (
        <AuthPage onLoginSuccess={onLogin} />
      ) : (
        <>
          <DashboardPage currentUser={user} onLogout={onLogout} />
          <Chatbot />
        </>
      )}
    </div>
  );
}

export default App;
