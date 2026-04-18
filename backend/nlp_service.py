import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def process_finance_text(text: str):
    try:
        
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        prompt = f"""
        Phân tích câu: '{text}'
        Trả về DUY NHẤT một đối tượng JSON, không kèm chữ nào khác:
        {{
            "amount": (số thực),
            "category": (Ăn uống, Di chuyển, Mua sắm, Lương, Khác),
            "transaction_type": (expense hoặc income),
            "description": (mô tả ngắn)
        }}
        """
        
        response = model.generate_content(prompt)
        
       
        res_text = response.text.strip()
        if "```json" in res_text:
            res_text = res_text.split("```json")[1].split("```")[0].strip()
        elif "```" in res_text:
            res_text = res_text.split("```")[1].split("```")[0].strip()
            
        return json.loads(res_text)
        
    except Exception as e:
        print(f"Lỗi AI: {e}")
        return {
            "amount": 0.0, 
            "category": "Khác", 
            "transaction_type": "expense", 
            "description": f"Lỗi: {str(e)}"
        }
def chat_with_financial_data(user_query: str, transaction_data: list):
    """ Hàm này dùng để Chatbot phân tích dữ liệu và trả lời câu hỏi """
    # Nếu bạn đang dùng gemini-2.5-flash thì đổi lại tên model cho khớp nhé
    model = genai.GenerativeModel('gemini-2.5-flash') 
    
    prompt = f"""
    Bạn là một trợ lý tài chính cá nhân thông minh, thân thiện và xưng là "AI".
    Dưới đây là danh sách toàn bộ lịch sử giao dịch của tôi (định dạng JSON):
    {transaction_data}

    NHIỆM VỤ CỦA BẠN:
    Dựa VÀO ĐÚNG DỮ LIỆU TRÊN, hãy trả lời câu hỏi sau của tôi. 
    Nếu tôi hỏi tính tổng, hãy tự động cộng các khoản tiền lại. Trả lời ngắn gọn,
    tự nhiên, và định dạng số tiền VND cho dễ nhìn.
    
    Câu hỏi của tôi: "{user_query}"
    """
    response = model.generate_content(prompt)
    return response.text