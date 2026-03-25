from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

# BẢNG MỚI: NGƯỜI DÙNG
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String) # Mật khẩu đã bị mã hóa

    # Mối quan hệ: 1 User có nhiều Giao dịch
    transactions = relationship("Transaction", back_populates="owner")

# BẢNG CŨ ĐƯỢC NÂNG CẤP
class Transaction(Base):
    __tablename__ = "user_transactions" # Đổi tên bảng để tạo mới hoàn toàn

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String, index=True)
    description = Column(String)
    transaction_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # KHOÁ NGOẠI: Giao dịch này thuộc về ai?
    owner_id = Column(Integer, ForeignKey("users.id")) 
    
    # Mối quan hệ ngược lại
    owner = relationship("User", back_populates="transactions")