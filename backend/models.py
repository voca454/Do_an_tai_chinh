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


class Transaction(Base):
    __tablename__ = "user_transactions" 

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String, index=True)
    description = Column(String)
    transaction_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    

    owner_id = Column(Integer, ForeignKey("users.id")) 
    
   
    owner = relationship("User", back_populates="transactions")