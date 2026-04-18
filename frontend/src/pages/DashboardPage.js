import CurrencyWidget from "../components/CurrencyWidget";
import React, { useState, useEffect } from "react";
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
  User,
  PieChart as PieChartIcon,
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
import { transactionAPI } from "../services/apiClient";
import { formatCurrency } from "../utils/formatters";
import "../assets/App.css";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
];

function DashboardPage({ currentUser, onLogout }) {
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

  const fetchTransactions = async () => {
    try {
      const response = await transactionAPI.getAll();
      setTransactions(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        onLogout();
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
      }
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text) return;
    setLoading(true);
    try {
      await transactionAPI.addAI(text);
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
        await transactionAPI.delete(id);
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
      await transactionAPI.update(id, editForm);
      setEditingId(null);
      fetchTransactions();
    } catch (error) {
      alert("Lỗi khi cập nhật!");
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (!startDate && !endDate) return true;
    const tDate = new Date(t.created_at);
    tDate.setHours(0, 0, 0, 0);
    let isAfterStart = true,
      isBeforeEnd = true;
    if (startDate)
      isAfterStart = tDate >= new Date(startDate).setHours(0, 0, 0, 0);
    if (endDate)
      isBeforeEnd = tDate <= new Date(endDate).setHours(23, 59, 59, 999);
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

  return (
    <div className="container">
      <div className="header">
        <div className="title-area">
          <Wallet size={36} color="#2563eb" />
          <h1>AI Personal Finance</h1>
        </div>
        <div className="filter-box" style={{ gap: "16px" }}>
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
            >
              <X size={18} />
            </button>
          )}
          <div
            style={{
              height: "24px",
              width: "1px",
              backgroundColor: "#e5e7eb",
              margin: "0 8px",
            }}
          ></div>
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
            <button onClick={onLogout} className="logout-btn">
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">SỐ DƯ GIAI ĐOẠN</p>
          <h2 className="stat-value">{formatCurrency(balance)}</h2>
        </div>
        <div className="stat-card">
          <div className="stat-flex">
            <div>
              <p className="stat-label">TỔNG THU NHẬP</p>
              <h2 className="stat-value income">
                +{formatCurrency(totalIncome)}
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
                -{formatCurrency(totalExpense)}
              </h2>
            </div>
            <div className="icon-box-expense">
              <TrendingDown color="#dc2626" />
            </div>
          </div>
        </div>
      </div>

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
                <Tooltip formatter={(value) => formatCurrency(value)} />
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
                  <Tooltip formatter={(value) => formatCurrency(value)} />
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

      <div className="ai-box">
        <h3 className="ai-title">
          <Sparkles size={20} color="#8b5cf6" /> Trợ lý AI Ghi chép
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
      <CurrencyWidget />
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
                        {formatCurrency(t.amount)}
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
  );
}

export default DashboardPage;
