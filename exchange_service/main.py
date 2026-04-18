from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/convert")
def convert_currency(amount: float, from_curr: str = "USD", to_curr: str = "VND"):
    rates = {
        "USD": 25400, 
        "EUR": 27500, 
        "JPY": 165, 
        "VND": 1
    }
    
    if from_curr not in rates or to_curr not in rates:
        return {"error": "Không hỗ trợ loại tiền tệ này"}
    amount_in_vnd = amount * rates[from_curr]
    final_amount = amount_in_vnd / rates[to_curr]
    
    return {
        "amount": amount,
        "from": from_curr,
        "to": to_curr,
        "result": final_amount
    }