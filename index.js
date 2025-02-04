require('dotenv').config();
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TARGET_PRICE = parseFloat(process.env.TARGET_PRICE); // Giá mục tiêu
const DROP_PERCENTAGE = parseFloat(process.env.DROP_PERCENTAGE); // % giảm tối đa

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

let lastPrice = null;

async function getPrice() {
    try {
        const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=ADAUSDT');
        const currentPrice = parseFloat(response.data.price);

        console.log(`Giá ADA hiện tại: ${currentPrice} USDT`);

        if (currentPrice <= TARGET_PRICE) {
            sendAlert(`⚠ Giá ADA đã giảm xuống ${currentPrice} USDT (Dưới ${TARGET_PRICE} USDT)`);
        }

        if (lastPrice && ((lastPrice - currentPrice) / lastPrice) * 100 >= DROP_PERCENTAGE) {
            sendAlert(`⚠ Giá ADA đã giảm ${DROP_PERCENTAGE}% xuống còn ${currentPrice} USDT`);
        }

        lastPrice = currentPrice;
    } catch (error) {
        console.error('Lỗi khi lấy giá:', error);
    }
}

function sendAlert(message) {
    bot.sendMessage(TELEGRAM_CHAT_ID, message);
    console.log(`Đã gửi cảnh báo: ${message}`);
}

// Kiểm tra giá mỗi 30 giây
setInterval(getPrice, 5000);

getPrice(); // Gọi ngay khi chạy