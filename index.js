const TelegramBot = require('node-telegram-bot-api');
const Tesseract = require('tesseract.js');

const token = '5995942003:AAHJ4PrxnxDrFSMJfb_c57EmKK0mgc5g8jA';
const bot = new TelegramBot(token, {
  polling: true,
  request: {
    proxy: 'http://192.168.100.66:8080',
  },
});

const quizQuestions = [
  {
    question:
      'Я не верю что ты - избранный участник. Напиши мне свое имя большими буквами четким шрифтом Roboto на листке бумаги и пришли мне фото с росписью.',
    answer: 'ЛИНАРА',
    wrongMsg: 'Я не верю что ты ЛИНАРА. Доказательства не приняты.',
    validate: (msg) => {
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
              return true;
            }
          });
        });
      }
      return false;
    },
  },
  {
    question: 'What is eternal, yet fragile and easily broken?',
    answer: 'love',
    wrongMsg: 'Try one more',
    validate: checkDefaultTask,
  },
  {
    question: 'What flower symbolizes love and passion?',
    options: ['rose', 'orchid', 'tulip', 'lily'],
    answer: 'rose',
    wrongMsg: 'Try one more',
    validate: checkDefaultTask,
  },
  {
    question: 'What is greater than God, worse than the devil, and if you eat it, you will die?',
    answer: 'nothing',
    wrongMsg: 'Try one more',
    validate: checkDefaultTask,
  },
];

let currentQuestion = 0;

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Hi! I am a quiz bot.', {
    reply_markup: {
      keyboard: [['Start Quiz']],
      resize_keyboard: true,
    },
  });
  // bot.sendVideoNote(msg.chat.id, './video.mp4', {
  //   caption: 'Поздравляем! Вы дали правильный ответ!',
  // });
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (msg.text) console.log('text');
  if (msg.photo) console.log('photo');
  if (msg.text === 'Start Quiz') {
    console.log('starting');
    startQuiz(chatId);
  } else if (currentQuestion < quizQuestions.length) {
    handleAnswer(chatId, msg);
  }
});

function startQuiz(chatId) {
  currentQuestion = 0;
  const question = quizQuestions[currentQuestion].question;
  const options = quizQuestions[currentQuestion].options;

  bot.sendMessage(chatId, question, {
    reply_markup: {
      keyboard: options ? [options] : [],
      resize_keyboard: true,
      remove_keyboard: !options,
    },
  });
}

function handleAnswer(chatId, answer) {
  console.log(answer);
  const question = quizQuestions[currentQuestion];
  const isAnswerCorrect = question.validate(answer);
  const options = quizQuestions[currentQuestion].options;

  if (isAnswerCorrect) {
    currentQuestion++;

    if (currentQuestion === quizQuestions.length) {
      bot.sendMessage(chatId, 'Congratulations! You have finished the quiz.');
    } else {
      bot.sendMessage(chatId, question, {
        reply_markup: {
          keyboard: options ? [options] : [],
          resize_keyboard: true,
          remove_keyboard: !options,
        },
      });
    }
  } else {
    if (answer.text !== '/start') {
      bot.sendMessage(chatId, question.wrongMsg);
    }
  }
}

function checkDefaultTask(userAnswer, currentQuestion) {
  if (userAnswer.text.toLowerCase() === quizQuestions[currentQuestion].answer.toLowerCase()) {
    return true;
  } else {
    return false;
  }
}
