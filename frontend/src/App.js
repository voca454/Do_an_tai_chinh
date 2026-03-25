import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Send,
  History,
  Sparkles,
  Trash2,
  Edit2,
  Check,
  X,
  Calendar,
  PieChart as PieChartIcon,
  User,
  MessageCircle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

function App() {
  // ==========================================
  // STATE CHO AUTH (ĐĂNG NHẬP/ĐĂNG KÝ)
  // ==========================================
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem("username"),
  );
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authForm, setAuthForm] = useState({ username: "", password: "" });

  // Thiết lập tự động đính kèm Token vào mọi request gửi đi
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
  // STATE CHO CHATBOT
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Chào bạn! Mình có thể giúp gì cho việc quản lý tài chính của bạn?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  // ==========================================
  // STATE CHO GIAO DỊCH
  // ==========================================
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    amount: 0,
    category: "",
    description: "",
    transaction_type: "expense",
  });

  // ==========================================
  // HÀM XỬ LÝ AUTH
  // ==========================================
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (isLoginMode) {
      // Logic Đăng nhập (FastAPI yêu cầu gửi dạng Form URL Encoded)
      const formData = new URLSearchParams();
      formData.append("username", authForm.username);
      formData.append("password", authForm.password);
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/login",
          formData,
        );
        setToken(response.data.access_token);
        setCurrentUser(response.data.username);
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("username", response.data.username);
        setAuthForm({ username: "", password: "" }); // Xóa form
      } catch (error) {
        alert("❌ Sai tài khoản hoặc mật khẩu!");
      }
    } else {
      // Logic Đăng ký (Gửi dạng JSON bình thường)
      try {
        await axios.post("http://127.0.0.1:8000/register", authForm);
        alert("✅ Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
        setIsLoginMode(true); // Tự động chuyển qua form đăng nhập
        setAuthForm({ ...authForm, password: "" }); // Xóa pass cũ
      } catch (error) {
        alert("❌ Tên đăng nhập đã tồn tại hoặc có lỗi xảy ra!");
      }
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setTransactions([]); // Xóa dữ liệu trên màn hình
  };

  // ==========================================
  // HÀM XỬ LÝ GIAO DỊCH
  // ==========================================
  const fetchTransactions = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/transactions/");
      setTransactions(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleLogout(); // Nếu Token hết hạn thì tự động đăng xuất
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
      }
    }
  };

  // Chỉ lấy dữ liệu khi ĐÃ ĐĂNG NHẬP
  useEffect(() => {
    if (token) {
      fetchTransactions();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text) return;
    setLoading(true);
    try {
      await axios.post(
        `http://127.0.0.1:8000/transactions/ai?text_input=${text}`,
      );
      setText("");
      fetchTransactions();
    } catch (error) {
      alert("❌ Lỗi kết nối đến Server AI!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa giao dịch này không?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/transactions/${id}`);
        fetchTransactions();
      } catch (error) {
        alert("Lỗi khi xóa giao dịch!");
      }
    }
  };

  const handleEditClick = (t) => {
    setEditingId(t.id);
    setEditForm({
      amount: t.amount,
      category: t.category,
      description: t.description,
      transaction_type: t.transaction_type,
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.put(`http://127.0.0.1:8000/transactions/${id}`, editForm);
      setEditingId(null);
      fetchTransactions();
    } catch (error) {
      alert("Lỗi khi cập nhật!");
    }
  };
  // HÀM GỬI TIN NHẮN CHATBOT
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessages = [...chatMessages, { sender: "user", text: chatInput }];
    setChatMessages(newMessages);
    setChatInput("");
    setIsChatting(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/chat", {
        message: chatInput,
      });
      if (response.data.reply) {
        setChatMessages([
          ...newMessages,
          { sender: "bot", text: response.data.reply },
        ]);
      } else {
        setChatMessages([
          ...newMessages,
          {
            sender: "bot",
            text: "Xin lỗi, tôi đang gặp sự cố khi đọc dữ liệu.",
          },
        ]);
      }
    } catch (error) {
      setChatMessages([
        ...newMessages,
        { sender: "bot", text: "Lỗi kết nối đến Server!" },
      ]);
    } finally {
      setIsChatting(false);
    }
  };
  // ==========================================
  // LOGIC LỌC & TÍNH TOÁN (Giữ nguyên)
  // ==========================================
  const filteredTransactions = transactions.filter((t) => {
    if (!startDate && !endDate) return true;
    const tDate = new Date(t.created_at);
    tDate.setHours(0, 0, 0, 0);

    let isAfterStart = true;
    let isBeforeEnd = true;

    if (startDate) {
      const sDate = new Date(startDate);
      sDate.setHours(0, 0, 0, 0);
      isAfterStart = tDate >= sDate;
    }

    if (endDate) {
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      isBeforeEnd = tDate <= eDate;
    }
    return isAfterStart && isBeforeEnd;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.transaction_type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.transaction_type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const barChartData = [
    { name: "Giai đoạn này", Thu: totalIncome, Chi: totalExpense },
  ];
  const expenseByCategory = filteredTransactions
    .filter((t) => t.transaction_type === "expense")
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
  const pieChartData = Object.keys(expenseByCategory).map((key) => ({
    name: key,
    value: expenseByCategory[key],
  }));
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
  ];

  // ==========================================
  // GIAO DIỆN CHƯA ĐĂNG NHẬP
  // ==========================================
  if (!token) {
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

  // ==========================================
  // GIAO DIỆN CHÍNH (KHI ĐÃ ĐĂNG NHẬP)
  // ==========================================
  return (
    <div className="app-wrapper">
      <div className="container">
        {/* Header & Bộ Lọc & Nút Đăng Xuất */}
        <div className="header">
          <div className="title-area">
            <Wallet size={36} color="#2563eb" />
            <h1>AI Personal Finance</h1>
          </div>

          <div className="filter-box" style={{ gap: "16px" }}>
            {/* Lọc Ngày */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="filter-label">Từ ngày:</span>
              <input
                type="date"
                className="filter-date"
                value={startDate}
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="filter-label">Đến ngày:</span>
              <input
                type="date"
                className="filter-date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            {(startDate || endDate) && (
              <button
                className="clear-filter-btn"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                title="Xóa bộ lọc"
              >
                <X size={18} />
              </button>
            )}

            {/* Dấu gạch dọc ngăn cách */}
            <div
              style={{
                height: "24px",
                width: "1px",
                backgroundColor: "#e5e7eb",
                margin: "0 8px",
              }}
            ></div>

            {/* Khu vực Thông tin User & Đăng xuất */}
            <div className="user-badge">
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#374151",
                  fontWeight: "bold",
                }}
              >
                <User size={18} color="#2563eb" /> Xin chào, {currentUser}!
              </span>
              <button onClick={handleLogout} className="logout-btn">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* --- CÁC KHỐI BÊN DƯỚI GIỮ NGUYÊN HOÀN TOÀN --- */}
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">SỐ DƯ GIAI ĐOẠN</p>
            <h2 className="stat-value">{balance.toLocaleString()} ₫</h2>
          </div>
          <div className="stat-card">
            <div className="stat-flex">
              <div>
                <p className="stat-label">TỔNG THU NHẬP</p>
                <h2 className="stat-value income">
                  +{totalIncome.toLocaleString()} ₫
                </h2>
              </div>
              <div className="icon-box-income">
                <TrendingUp color="#059669" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-flex">
              <div>
                <p className="stat-label">TỔNG CHI TIÊU</p>
                <h2 className="stat-value expense">
                  -{totalExpense.toLocaleString()} ₫
                </h2>
              </div>
              <div className="icon-box-expense">
                <TrendingDown color="#dc2626" />
              </div>
            </div>
          </div>
        </div>

        {/* Biểu đồ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "16px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "20px",
                color: "#374151",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <TrendingUp size={20} color="#2563eb" /> So sánh Thu - Chi
            </h3>
            <div style={{ width: "100%", height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={barChartData}>
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip
                    formatter={(value) => `${value.toLocaleString()} ₫`}
                  />
                  <Legend />
                  <Bar dataKey="Thu" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Chi" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "16px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "20px",
                color: "#374151",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <PieChartIcon size={20} color="#8b5cf6" /> Cơ cấu Chi tiêu
            </h3>
            <div style={{ width: "100%", height: 250 }}>
              {pieChartData.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `${value.toLocaleString()} ₫`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6b7280",
                  }}
                >
                  Chưa có dữ liệu
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input AI */}
        <div className="ai-box">
          <h3 className="ai-title">
            <Sparkles size={20} color="#8b5cf6" />
            Trợ lý AI Ghi chép
          </h3>
          <form onSubmit={handleSubmit} className="ai-form">
            <input
              className="ai-input"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nhập tự nhiên: 'Đi xem phim hết 150k'..."
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className={`ai-button ${loading ? "loading" : "ready"}`}
            >
              {loading ? (
                "AI đang nghĩ..."
              ) : (
                <>
                  <Send size={18} /> Gửi AI
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bảng dữ liệu */}
        <div className="table-box">
          <div className="table-header">
            <History size={20} color="#374151" />
            <h3>Lịch sử giao dịch</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>MÔ TẢ</th>
                <th>DANH MỤC</th>
                <th>LOẠI</th>
                <th style={{ textAlign: "right" }}>SỐ TIỀN</th>
                <th style={{ textAlign: "center" }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      color: "#6b7280",
                      padding: "24px",
                    }}
                  >
                    Không có giao dịch nào.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id}>
                    {editingId === t.id ? (
                      <>
                        <td>
                          <input
                            className="edit-input"
                            type="text"
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                description: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="edit-input"
                            type="text"
                            value={editForm.category}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                category: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <select
                            className="edit-input"
                            value={editForm.transaction_type}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                transaction_type: e.target.value,
                              })
                            }
                          >
                            <option value="expense">Chi</option>
                            <option value="income">Thu</option>
                          </select>
                        </td>
                        <td>
                          <input
                            className="edit-input amount"
                            type="number"
                            value={editForm.amount}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                amount: parseFloat(e.target.value),
                              })
                            }
                          />
                        </td>
                        <td className="action-cell">
                          <button
                            className="icon-btn save"
                            onClick={() => handleSaveEdit(t.id)}
                          >
                            <Check size={20} />
                          </button>
                          <button
                            className="icon-btn cancel"
                            onClick={() => setEditingId(null)}
                          >
                            <X size={20} />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="desc-text">{t.description}</td>
                        <td>
                          <span className="tag">{t.category}</span>
                        </td>
                        <td>
                          <span
                            className={`type-badge ${t.transaction_type === "income" ? "type-income" : "type-expense"}`}
                          >
                            {t.transaction_type === "income" ? (
                              <>
                                <TrendingUp size={16} /> Thu
                              </>
                            ) : (
                              <>
                                <TrendingDown size={16} /> Chi
                              </>
                            )}
                          </span>
                        </td>
                        <td
                          className={`amount-text ${t.transaction_type === "income" ? "income" : "expense"}`}
                        >
                          {t.transaction_type === "income" ? "+" : "-"}
                          {t.amount.toLocaleString()} ₫
                        </td>
                        <td className="action-cell">
                          <button
                            className="icon-btn edit"
                            onClick={() => handleEditClick(t)}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            className="icon-btn delete"
                            onClick={() => handleDelete(t.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* --- KHUNG CHATBOT NỔI --- */}
      <div className="chatbot-wrapper">
        {/* Cửa sổ Chat */}
        {isChatOpen && (
          <div className="chatbot-window">
            <div className="chat-header">
              <Sparkles size={20} /> AI Financial Advisor
              <button
                onClick={() => setIsChatOpen(false)}
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="chat-body">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-msg ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
              {isChatting && (
                <div className="chat-msg bot">AI đang suy nghĩ... 🤔</div>
              )}
            </div>

            <form className="chat-footer" onSubmit={handleSendChat}>
              <input
                type="text"
                className="chat-input"
                placeholder="Ví dụ: Tính tổng tiền ăn uống..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isChatting}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={isChatting}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        )}

        {/* Nút Tròn để bật/tắt Chatbot */}
        {!isChatOpen && (
          <button
            className="chatbot-toggle-btn"
            onClick={() => setIsChatOpen(true)}
          >
            <MessageCircle size={28} />
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
