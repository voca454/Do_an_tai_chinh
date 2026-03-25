import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv() # Tự động lấy thông tin từ file .env

DB_URL = "postgresql+psycopg2://admin:123456password@db:5432/finance_db"

engine = create_engine(DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Hàm hỗ trợ lấy database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()