import axios from "axios";

// Trỏ thẳng đến cổng 8001 của Microservice mới!
const exchangeClient = axios.create({
  baseURL: "http://127.0.0.1:8001",
});

export const getConversion = (amount, from) => {
  return exchangeClient.get(`/convert?amount=${amount}&from=${from}&to=VND`);
};
