# Dùng môi trường Node.js chuẩn để chạy React
FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy các file cấu hình và cài đặt thư viện npm
COPY package*.json ./
RUN npm install

# Copy toàn bộ giao diện của bạn vào hộp
COPY . .

# Mở cổng 3000 cho Frontend
EXPOSE 3000

# Lệnh khởi động React
CMD ["npm", "start"]