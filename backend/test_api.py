import json
from nlp_service import process_finance_text


text_input = "Sáng nay đổ xăng đi học hết 50 ngàn đồng"
print(f"Người dùng nhập: '{text_input}'")
print("-" * 40)
print("Đang gửi dữ liệu lên Google Gemini API để bóc tách...\n")


result_dict = process_finance_text(text_input)


print("Kết quả JSON thu được:")
print(json.dumps(result_dict, indent=4, ensure_ascii=False))