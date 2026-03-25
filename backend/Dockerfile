# Dùng môi trường Python 3.12 chuẩn
FROM python:3.12-slim

# Tạo thư mục làm việc trong hộp Docker
WORKDIR /app

# Copy file danh sách thư viện vào và cài đặt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code backend của bạn vào hộp
COPY . .

# Mở cổng 8000 cho Backend
EXPOSE 8000

# Lệnh khởi động Server khi bật Docker
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]