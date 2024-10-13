import sys
import io

# Thiết lập mã hóa cho đầu vào và đầu ra
sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


import mysql.connector
from sentence_transformers import SentenceTransformer, util

# Kết nối với cơ sở dữ liệu MySQL
db = mysql.connector.connect(
   host="localhost",
   user="root",
   password="Letienkhoi1710",
   database="testAi"
)

cursor = db.cursor()
cursor.execute("SELECT question, answer FROM question_answer")
data = cursor.fetchall()

questions = [row[0] for row in data]
answers = [row[1] for row in data]

# Tính toán embeddings cho các câu hỏi
model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
question_embeddings = model.encode(questions, convert_to_tensor=True)

# Hàm tìm câu hỏi tương tự và trả lời
def chatbot_response(user_question):
    user_question_embedding = model.encode(user_question, convert_to_tensor=True)
    cosine_scores = util.pytorch_cos_sim(user_question_embedding, question_embeddings)[0]
    best_match_index = cosine_scores.argmax()
    best_score = cosine_scores[best_match_index]

    # Kiểm tra mức độ tương đồng, ngưỡng tương đồng là 0.7
    if best_score < 0.7:
        return None, best_score
    return answers[best_match_index], best_score

# Vòng lặp chat
while True:
    try:
        # Đọc đầu vào từ stdin
        user_input = input()
        if user_input.lower() == 'thoát':
            break
        
        bot_response, score = chatbot_response(user_input)
        
        if bot_response is None:
            print("Tôi nên trả lời thế nào?")

            user_answer = input()
            
            query = f"SELECT COUNT(*) FROM question_answer;"
            cursor.execute(query)
        
            Id = int(cursor.fetchone()[0])
            # Lưu câu hỏi và câu trả lời mới vào cơ sở dữ liệu
            cursor.execute("INSERT INTO question_answer(question, answer, id) VALUES (%s, %s, %s)", (user_input, user_answer, Id + 1))
            db.commit()
            
            # Cập nhật danh sách câu hỏi và câu trả lời
            questions.append(user_input)
            answers.append(user_answer)
            
            # Tính toán lại embeddings cho câu hỏi mới
            question_embeddings = model.encode(questions, convert_to_tensor=True)
            print("Cảm ơn bạn, tôi đã ghi nhớ câu trả lời.")
        else:
            print( bot_response)
    except EOFError:
        print("Bot: Đã xảy ra lỗi khi đọc đầu vào.")
        break
