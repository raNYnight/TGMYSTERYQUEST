const TelegramBot = require('node-telegram-bot-api');
const Tesseract = require('tesseract.js');
const greetingMsg = require('./hello-tg');
const token = '5995942003:AAHJ4PrxnxDrFSMJfb_c57EmKK0mgc5g8jA';
const bot = new TelegramBot(token, {
  polling: true,
  request: {
    proxy: 'http://192.168.100.66:8080',
  },
});
const quizQuestions = [
  {
    question: greetingMsg,
    answer: 'ЛИНАРА',
    loadingMsg: 'Подождите, загружаю фото',
    validate: async (msg) => {
      if (msg.photo) {
        bot.getFileLink(msg.photo[msg.photo.length - 1].file_id).then((link) => {
          Tesseract.recognize(link, 'rus').then(({ data: { text } }) => {
            const recognizedArr = text.trim().split(' ');
            const answerCombinations = [
              'ЛИН',
              'ЛИНА',
              'ЛИНАР',
              'ЛИНАРА',
              'ИНА',
              'ИНАР',
              'ИНАРА',
              'НАР',
              'НАРА',
              'АРА',
            ];
            const findName = checkImageForAnswer(recognizedArr, answerCombinations);
            bot.sendMessage(msg.chat.id, `Считано с листка: ${recognizedArr}`);
            console.log(recognizedArr);
            if (findName) {
              bot.sendMessage(msg.chat.id, `Я верю тебе, можешь идти дальше`);
              return true;
            } else {
              bot.sendMessage(msg.chat.id, `Я не верю тебе`);
            }
          });
        });
      }
    },
  },
  {
    question: './fish.png',
    questionAdd: 'Разгадай ребус',
    answer: 'РЫБОЛОВ',
    wrongMsg: 'Используй всю свою энергию чтобы разгадать данный ребус.',
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
  // bot.sendMessage(msg.chat.id, 'Hi! I am a quiz bot.', {
  //   reply_markup: {
  //     keyboard: [['Start Quiz']],
  //     resize_keyboard: true,
  //   },
  // });
  bot.sendVideoNote(msg.chat.id, './video.mp4', {
    caption: 'Поздравляем! Вы дали правильный ответ!',
    reply_markup: {
      keyboard: [['Start Quiz']],
      resize_keyboard: true,
    },
  });
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  if (msg.text === 'Start Quiz') {
    startQuiz(chatId);
  } else if (currentQuestion < quizQuestions.length) {
    await handleAnswer(chatId, msg);
  }
});

function startQuiz(chatId) {
  currentQuestion = 0;
  const question = quizQuestions[currentQuestion].question;
  const options = quizQuestions[currentQuestion].options;

  if (question.startsWith('./')) {
    // если question начинается с "./", отправляем фото
    bot.sendPhoto(chatId, question, {
      caption: quizQuestions[currentQuestion].questionAdd,
    });
  } else {
    // иначе отправляем текст вопроса
    bot.sendMessage(chatId, question, {
      parse_mode: 'MarkdownV2',
      reply_markup: {
        keyboard: options ? [options] : [],
        resize_keyboard: true,
        remove_keyboard: !options,
      },
    });
  }
}

async function handleAnswer(chatId, answer) {
  const question = quizQuestions[currentQuestion];
  const isAnswerCorrect = await question.validate(answer);
  const options = quizQuestions[currentQuestion].options;

  if (isAnswerCorrect) {
    currentQuestion++;
    if (currentQuestion === quizQuestions.length) {
      bot.sendMessage(chatId, 'Congratulations! You have finished the quiz.');
    } else {
      bot.sendMessage(chatId, quizQuestions[currentQuestion].question, {
        parse_mode: 'MarkdownV2',
        reply_markup: {
          keyboard: options ? [options] : [],
          resize_keyboard: true,
          remove_keyboard: !options,
        },
      });
    }
  } else {
    if (answer.text !== '/start') {
      bot.sendMessage(chatId, question.wrongMsg || question.loadingMsg);
    }
  }
}

function checkDefaultTask(userAnswer) {
  if (userAnswer.text.toLowerCase() === quizQuestions[currentQuestion].answer.toLowerCase()) {
    return true;
  } else {
    return false;
  }
}

function checkImageForAnswer(recognizedArr, answerCombinations) {
  for (let i = 0; i < recognizedArr.length; i++) {
    const recognizedStr = recognizedArr[i].toUpperCase();
    for (let j = 0; j < answerCombinations.length; j++) {
      const combination = answerCombinations[j];
      if (recognizedStr.includes(combination)) {
        return true;
      }
    }
  }
  return false;
}
