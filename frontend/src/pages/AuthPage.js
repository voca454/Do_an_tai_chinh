// File: src/pages/AuthPage.js
import React, { useState } from "react";
import { Wallet } from "lucide-react";
import { authAPI } from "../services/apiClient";
import "../assets/App.css";

function AuthPage({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authForm, setAuthForm] = useState({ username: "", password: "" });

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (isLoginMode) {
      const formData = new URLSearchParams();
      formData.append("username", authForm.username);
      formData.append("password", authForm.password);
      try {
        const response = await authAPI.login(formData);
        onLoginSuccess(response.data.access_token, response.data.username);
      } catch (error) {
        alert("❌ Sai tài khoản hoặc mật khẩu!");
      }
    } else {
      try {
        await authAPI.register(authForm);
        alert("✅ Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
        setIsLoginMode(true);
        setAuthForm({ ...authForm, password: "" });
      } catch (error) {
        alert("❌ Tên đăng nhập đã tồn tại hoặc có lỗi xảy ra!");
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h2 className="auth-title">
          <Wallet color="#2563eb" size={32} />
          {isLoginMode ? "Đăng Nhập Quản Lý" : "Tạo Tài Khoản Mới"}
        </h2>
        <form onSubmit={handleAuthSubmit}>
          <div className="auth-input-group">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              className="auth-input"
              required
              value={authForm.username}
              onChange={(e) =>
                setAuthForm({ ...authForm, username: e.target.value })
              }
              placeholder="Nhập tên tài khoản..."
            />
          </div>
          <div className="auth-input-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              className="auth-input"
              required
              value={authForm.password}
              onChange={(e) =>
                setAuthForm({ ...authForm, password: e.target.value })
              }
              placeholder="Nhập mật khẩu..."
            />
          </div>
          <button type="submit" className="auth-button">
            {isLoginMode ? "Đăng Nhập" : "Đăng Ký Tài Khoản"}
          </button>
        </form>
        <p className="auth-switch">
          {isLoginMode ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          <span onClick={() => setIsLoginMode(!isLoginMode)}>
            {isLoginMode ? "Đăng ký ngay" : "Đăng nhập"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
