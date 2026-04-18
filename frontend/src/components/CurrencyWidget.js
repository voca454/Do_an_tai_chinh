import React, { useState } from "react";
import { getConversion } from "../services/exchangeClient";
import { formatCurrency } from "../utils/formatters";
import { RefreshCw } from "lucide-react";

function CurrencyWidget() {
  const [amount, setAmount] = useState(1);
  const [currency, setCurrency] = useState("USD");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    setLoading(true);
    try {
      const res = await getConversion(amount, currency);
      setResult(res.data.result);
    } catch (error) {
      alert("Lỗi kết nối đến Microservice Tỷ giá!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        marginTop: "20px",
      }}
    >
      <h4
        style={{
          margin: "0 0 12px 0",
          color: "#1e293b",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <RefreshCw size={18} color="#0284c7" /> Công cụ đổi Ngoại tệ
        (Microservice)
      </h4>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: "80px",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
          }}
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
          }}
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="JPY">JPY</option>
        </select>
        <button
          onClick={handleConvert}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#0284c7",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {loading ? "..." : "Quy đổi"}
        </button>
      </div>
      {result !== null && (
        <p
          style={{ margin: "12px 0 0 0", fontWeight: "bold", color: "#16a34a" }}
        >
          Kết quả: {formatCurrency(result)}
        </p>
      )}
    </div>
  );
}

export default CurrencyWidget;
