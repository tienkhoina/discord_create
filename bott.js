const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

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

client.once('ready', () => {
    console.log(`Đăng nhập thành công với tài khoản ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!hello') {
        message.reply('Xin chào! Tôi có thể giúp gì cho bạn hôm nay?');
    } else if (message.content.startsWith('!rep')) {
        // Lấy chuỗi con từ câu lệnh
        const userInput = message.content.substring(5).trim(); // Cắt bỏ '!rep ' và loại bỏ khoảng trắng
        console.log(userInput);
        // Kiểm tra xem chuỗi con có tồn tại không
        if (userInput) {
            try {
                const output = await askQuestion(userInput); // Gọi hàm askQuestion và chờ câu trả lời
                console.log(output);
                message.reply(output); // Gửi câu trả lời về Discord
            } catch (error) {
                message.reply('Đã xảy ra lỗi khi xử lý yêu cầu của bạn.');
            }
        } else {
            message.reply('Vui lòng nhập một câu hỏi sau khi gõ "!rep".');
        }
    }
});

client.login();
