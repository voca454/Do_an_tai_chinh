from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import jwt # Thư viện tạo thẻ Token
from datetime import datetime, timedelta
import models
from database import engine, get_db
from pydantic import BaseModel
from nlp_service import process_finance_text

# ==========================================
# PHẦN 1: CẤU HÌNH BẢO MẬT & MẬT KHẨU
# ==========================================
SECRET_KEY = "khoa_bi_mat_cua_do_an_tot_nghiep" # Chìa khóa để tạo Token
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 # Token sống được 60 phút


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Mã hóa mật khẩu
import bcrypt

# Mã hóa mật khẩu (Dùng trực tiếp bcrypt bản mới)
def get_password_hash(password: str):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

# Kiểm tra mật khẩu
def verify_password(plain_password: str, hashed_password: str):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# Tạo thẻ Token
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Hàm kiểm tra xem ai đang đăng nhập
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực thông tin, vui lòng đăng nhập lại",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user


# ==========================================
# PHẦN 2: KHỞI TẠO APP & DATABASE
# ==========================================
app = FastAPI(title="AI Personal Finance API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

# Định dạng dữ liệu
class UserCreate(BaseModel):
    username: str
    password: str

class TransactionCreate(BaseModel):
    amount: float
    category: str
    description: str
    transaction_type: str


# ==========================================
# PHẦN 3: API ĐĂNG KÝ & ĐĂNG NHẬP
# ==========================================
@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Kiểm tra xem tên đăng nhập đã có ai dùng chưa
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Tên đăng nhập này đã tồn tại!")
    
    # Mã hóa mật khẩu và lưu vào DB
    hashed_password = get_password_hash(user.password)
    new_user = models.User(username=user.username, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    return {"message": "Đăng ký tài khoản thành công!"}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Tìm user trong Database
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    
    # Sai tên hoặc sai mật khẩu
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Tài khoản hoặc mật khẩu không đúng!")
    
    # Cấp thẻ Token
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "username": user.username}


# ==========================================
# PHẦN 4: API GIAO DỊCH (Đã được bảo vệ)
# ==========================================
@app.get("/transactions/")
def get_transactions(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Lấy dữ liệu của ĐÚNG CÁI NGƯỜI ĐANG ĐĂNG NHẬP (Lọc theo owner_id)
    transactions = db.query(models.Transaction).filter(models.Transaction.owner_id == current_user.id).order_by(models.Transaction.id.desc()).all()
    return transactions

@app.post("/transactions/ai")
def create_transaction_via_ai(text_input: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        ai_data = process_finance_text(text_input)
        new_transaction = models.Transaction(
            amount=ai_data['amount'],
            category=ai_data['category'],
            description=ai_data['description'],
            transaction_type=ai_data['transaction_type'],
            owner_id=current_user.id  # ĐÁNH DẤU TIỀN NÀY LÀ CỦA AI
        )
        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)
        return {"message": "AI đã lưu dữ liệu thành công!", "data": new_transaction}
    except Exception as e:
        return {"error": str(e)}

@app.put("/transactions/{transaction_id}")
def update_transaction(transaction_id: int, item: TransactionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Chỉ cho phép sửa nếu giao dịch đó thuộc về mình
    db_transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id, models.Transaction.owner_id == current_user.id).first()
    if db_transaction:
        db_transaction.amount = item.amount
        db_transaction.category = item.category
        db_transaction.description = item.description
        db_transaction.transaction_type = item.transaction_type
        db.commit()
        db.refresh(db_transaction)
        return {"message": "Cập nhật thành công!"}
    return {"error": "Không tìm thấy giao dịch hoặc bạn không có quyền sửa"}

@app.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Chỉ cho phép xóa nếu giao dịch đó thuộc về mình
    db_transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id, models.Transaction.owner_id == current_user.id).first()
    if db_transaction:
        db.delete(db_transaction)
        db.commit()
        return {"message": "Đã xóa thành công!"}
    return {"error": "Không tìm thấy giao dịch hoặc bạn không có quyền xóa"}
class ChatRequest(BaseModel):
    message: str

# API Chatbot Tài chính
@app.post("/chat")
def chat_with_ai(request: ChatRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        # 1. Lấy toàn bộ giao dịch của người dùng hiện tại
        transactions = db.query(models.Transaction).filter(models.Transaction.owner_id == current_user.id).all()
        
        # 2. Rút gọn dữ liệu cho AI dễ đọc
        tx_list = [
            {
                "ngay": t.created_at.strftime("%d/%m/%Y"),
                "mo_ta": t.description,
                "so_tien": t.amount,
                "danh_muc": t.category,
                "loai": "Thu" if t.transaction_type == "income" else "Chi"
            } for t in transactions
        ]
        
        # 3. Gọi file nlp_service để AI phân tích và trả lời
        from nlp_service import chat_with_financial_data
        ai_reply = chat_with_financial_data(request.message, tx_list)
        
        return {"reply": ai_reply}
    except Exception as e:
        return {"error": str(e)}