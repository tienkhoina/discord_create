const ChatBot = require('./app');  // Import thư viện ChatBot

// Khởi tạo một instance của bot
const bot = new ChatBot();

// Sử dụng readline để nhận câu hỏi từ người dùng
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Hàm yêu cầu người dùng nhập câu hỏi và tương tác với bot
async function askQuestion(userInput) {
    return new Promise(async (resolve) => {
        if (userInput.toLowerCase() === 'thoát') {
            bot.closeBot();  // Đóng bot nếu người dùng nhập "thoát"
            rl.close();      // Đóng giao diện readline
            resolve(null);   // Trả về null khi thoát
        } else {
            try {
                const response = await bot.askBot(userInput);  // Gọi bot và đợi câu trả lời
                resolve(response);  // Trả về câu trả lời từ bot
            } catch (error) {
                console.error('Lỗi:', error);
                resolve(error.toString());  // Trả về lỗi nếu có
            }
        }
    });
}

// Hàm để thực hiện các câu hỏi từ người dùng
async function handleUserInput() {
    rl.question('Bạn: ', async (userInput) => {
        const output = await askQuestion(userInput);  // Gọi hàm askQuestion
        if (output !== null) {
            console.log(`Bot: ${output}`);  // In ra câu trả lời từ bot
            handleUserInput();  // Gọi lại hàm để tiếp tục yêu cầu câu hỏi
        }
    });
}

// Bắt đầu hỏi người dùng
handleUserInput();
