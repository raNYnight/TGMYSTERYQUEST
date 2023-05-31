const TelegramBot = require('node-telegram-bot-api');
const Tesseract = require('tesseract.js');
const { task1, task2 } = require('./components/bot-messages');
const token = '5995942003:AAHJ4PrxnxDrFSMJfb_c57EmKK0mgc5g8jA';
const bot = new TelegramBot(token, {
  polling: true,
  request: {
    proxy: 'http://192.168.100.66:8080',
  },
});
const quizQuestions = [
  {
    question: task1,
    answer: 'ЛИНАРА',
    rigthAnswer: `Я верю тебе, можешь идти дальше`,
    wrongAnswer: `Я не верю тебе. Загрузи фотографию с понятным мне(роботу) текстом и своей росписью, чтобы я убедился что ты избранница`,
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
              return true;
            } else {
              return false;
            }
          });
        });
      }
    },
  },
  {
    question: '👨‍⚕️🔪🚪🔒👦👮‍♂️',
    answer: 'Блудный сын',
    rigthAnswer: `Умница, малышка!`,
    wrongAnswer: `Близко...Попробуй еще разочек)`,
    validate: checkDefaultTask,
  },
  {
    question: '🕵️‍♂️🇩🇰🌉🚧🚘🇸🇪🕵️‍♂️',
    answer: 'Мост',
    rigthAnswer: `Гений мысли! Так держать!`,
    wrongAnswer: `Ты на верном пути. Попробуй еще разок!`,
    validate: checkDefaultTask,
  },
  {
    question: '🚘💨💥👊😎💰❤️',
    answer: 'Форсаж',
    rigthAnswer: `Лучшая, бубуська<3`,
    wrongAnswer: `а-а`,
    validate: checkDefaultTask,
  },
  {
    img: './assets/task5.jpg',
    audio: './assets/best.mp3',
    question:
      'У нас было много запоминающихся моментов.Вспомнишь, что за трек прикреплен к этой фотокарточке?',
    answer: 'Лучше всех',
    rigthAnswer: `Нет. Ты - лучше всех!!!`,
    wrongAnswer: `Я уверен, что ты знаешь ответ. ПРосто напиши название)`,
    validate: checkDefaultTask,
  },

  {
    img: './assets/fish.png',
    question:
      'Дорогая, сейчас тебе предлагается погрузиться в мир загадок и разгадок. Твое последнее задание - разгадать ребус!',
    answer: 'РЫБОЛОВ',
    wrongMsg: 'Используй всю свою энергию чтобы разгадать данный ребус.',
    validate: checkDefaultTask,
  },
];

let currentQuestion = 0;

bot.onText(/\/start/, (msg) => {
  // bot.sendVideoNote(msg.chat.id, './assets/video.mp4', {
  //   caption: '',
  //   reply_markup: {
  //     keyboard: [['Start Quiz']],
  //     resize_keyboard: true,
  //     one_time_keyboard: true,
  //   },
  // });
  bot.sendMessage(msg.chat.id, './video.mp4', {
    caption: '',
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
  bot.sendMessage(chatId, question, {
    parse_mode: 'MarkdownV2',
    reply_markup: {
      remove_keyboard: true,
    },
  });
}

async function handleAnswer(chatId, answer) {
  const isAnswerCorrect = await quizQuestions[currentQuestion].validate(answer);

  if (isAnswerCorrect) {
    currentQuestion++;
    bot.sendMessage(chatId, quizQuestions[currentQuestion].rigthAnswer);
    if (currentQuestion === quizQuestions.length) {
      bot.sendMessage(
        chatId,
        'Congratulations! Ты справилась со всеми заданиями. В качестве награды ты получишь презент!'
      );
    } else {
      const question = quizQuestions[currentQuestion];
      bot.sendMessage(chatId, question.rigthAnswer);
      switch (question.id) {
        case 0:
          console.log('case', question.id, 'curr', currentQuestion);

          bot.sendMessage(chatId, question.question, {
            parse_mode: 'MarkdownV2',
          });
          break;
        case 1:
          console.log('case', question.id, 'curr', currentQuestion);
          bot.sendMessage(chatId, task2).then(() => bot.sendMessage(chatId, question.question));

          break;
        case 2:
        case 3:
          console.log('case', question.id, 'curr', currentQuestion);
          bot.sendMessage(chatId, question.question);
          break;

        case 4:
          console.log('case', question.id, 'curr', currentQuestion);
          bot.sendPhoto(chatId, question.img, {
            caption: question.question,
          });
          break;
        case 5:
          console.log('case', question.id, 'curr', currentQuestion);
          bot.sendAudio(chatId);
          bot.sendPhoto(chatId, question.img, {
            caption: question.question,
          });
          break;
      }
    }
  } else {
    if (answer.text !== '/start') {
      bot.sendMessage(chatId, quizQuestions[currentQuestion].wrongAnswer);
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
