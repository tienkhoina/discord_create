const { spawn } = require('child_process');

class ChatBot {
    constructor() {
        this.pythonProcess = null;
        this.outputBuffer = ''; // Buffer để lưu trữ dữ liệu từ Python
        this.initializeBot(); // Khởi tạo bot khi class được khởi tạo
    }

    // Hàm khởi tạo tiến trình Python
    initializeBot() {
        this.pythonProcess = spawn('python', ['python/bot_chat.py']);

        // Khi nhận dữ liệu từ stdout của Python
        this.pythonProcess.stdout.on('data', (data) => {
            this.outputBuffer += data.toString(); // Lưu vào buffer
        });

        // Khi tiến trình Python có lỗi
        this.pythonProcess.stderr.on('data', (data) => {
            console.error(`Error: ${data.toString()}`);
        });

        // Khi tiến trình Python kết thúc
        this.pythonProcess.on('close', (code) => {
            console.log(`Python process exited with code ${code}`);
        });
    }

    // Hàm gửi câu hỏi tới bot và nhận kết quả
    askBot(question) {
        return new Promise((resolve, reject) => {
            // Reset buffer trước khi gửi câu hỏi
            this.outputBuffer = '';

            // Gửi câu hỏi tới bot
            this.pythonProcess.stdin.write(`${question}\n`);

            // Đợi phản hồi từ Python
            const checkResponse = () => {
                if (this.outputBuffer) {
                    resolve(this.outputBuffer.trim()); // Trả về phản hồi từ bot
                } else {
                    setTimeout(checkResponse, 100); // Kiểm tra lại sau 100ms
                }
            };

            checkResponse(); // Bắt đầu kiểm tra phản hồi
        });
    }

    // Đóng tiến trình Python (khi không cần sử dụng nữa)
    closeBot() {
        this.pythonProcess.stdin.end();  // Đóng stdin của Python
        this.pythonProcess.kill();       // Kết thúc tiến trình Python
    }
}

// Export class ChatBot để sử dụng trong các file khác
module.exports = ChatBot;
