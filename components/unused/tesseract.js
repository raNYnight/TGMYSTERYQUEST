const TelegramBot = require('node-telegram-bot-api');
const Tesseract = require('tesseract.js');

// Токен вашего бота
const token = '5995942003:AAHJ4PrxnxDrFSMJfb_c57EmKK0mgc5g8jA';
const bot = new TelegramBot(token, {
  polling: true,
  request: {
    proxy: 'http://192.168.100.66:8080',
  },
});
bot.on('message', (msg) => {
  if (msg.photo) {
    bot.getFileLink(msg.photo[msg.photo.length - 1].file_id).then((link) => {
      Tesseract.recognize(link, 'rus').then(({ data: { text } }) => {
        const answer = text.trim().toUpperCase();
        const answArr = answer.split(' ');
        const searchStr = 'ЛИНАРА';
        const findName = answArr.find((str) => str === searchStr);
        bot.sendMessage(msg.chat.id, `Считано с листка: ${answer.split()}`);
        console.log(findName);
        if (findName) {
          bot.sendMessage(msg.chat.id, `Я верю тебе, можешь идти дальше`);
        } else {
          bot.sendMessage(msg.chat.id, 'Я не верю что ты ЛИНАРА. Доказательства не приняты.');
        }
      });
    });
  } else {
    bot.sendMessage(msg.chat.id, 'Фото с листком текста, отправить ты должен.');
  }
});
