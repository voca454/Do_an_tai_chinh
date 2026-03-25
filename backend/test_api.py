import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("Đang kiểm tra các model khả dụng cho API Key của bạn...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"👉 Tên model hợp lệ: {m.name}")
except Exception as e:
    print(f"Lỗi truy cập Key: {e}")