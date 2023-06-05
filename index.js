const TelegramBot = require('node-telegram-bot-api');
const Tesseract = require('tesseract.js');
const { task1, task2 } = require('./components/bot-messages');
const token = '5995942003:AAHJ4PrxnxDrFSMJfb_c57EmKK0mgc5g8jA';
const bot = new TelegramBot(token, {
  polling: true,
  // request: {
  //   proxy: 'http://192.168.100.66:8080',
  // },
});
const quizQuestions = [
  {
    id: 0,
    question: task1,
    answer: 'ЛИНАРА',
    loading: 'Пошла загрузка...',
    rigthAnswer: `Я верю тебе, можешь идти дальше`,
    wrongAnswer: `Я не верю тебе. Загрузи фотографию с понятным мне(роботу) текстом и своей росписью, чтобы я убедился что ты избранница`,
    validate: async (msg) => {
      if (!msg.photo) {
        return false;
      }

      const link = await bot.getFileLink(msg.photo[msg.photo.length - 1].file_id);
      const {
        data: { text },
      } = await Tesseract.recognize(link, 'rus');
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
      // bot.sendMessage(msg.chat.id, `Считано с листка: ${recognizedArr}`);
      if (findName) {
        bot.sendMessage(msg.chat.id, quizQuestions[currentQuestion].rigthAnswer);
        return true;
      }
      return false;
    },
  },
  {
    id: 1,
    question:
      'Первая загадка: 👨‍⚕️🔪🚪🔒👦👮‍♂️\\. Подсказка \\(Открывать только после 3х попыток\\)\\: ||    3 и 4 эмодзи показывают, что эмодзи 1 находится под замком \\(за решеткой\\)||',
    answer: 'Блудный сын',
    rigthAnswer: `Умница, малышка!`,
    wrongAnswer: `Близко...Попробуй еще разочек)`,
    validate: checkDefaultTask,
  },
  {
    id: 2,
    question:
      'Загадка 2: 🕵️‍♂️🇩🇰🌉🚧🚘🇸🇪🕵️‍♂️ \\. Подсказка ||Да тут слишком просто, пупус, обойдесся без подсказок я думаю||',
    answer: 'Мост',
    rigthAnswer: `Гений мысли! Так держать!`,
    wrongAnswer: `Ты на верном пути. Попробуй еще разок!`,
    validate: checkDefaultTask,
  },
  {
    id: 3,
    question: '🚘💨💥👊😎💰❤️',
    answer: 'Форсаж',
    rigthAnswer: `Лучшая, бубуська<3`,
    wrongAnswer: `а-а`,
    validate: checkDefaultTask,
  },
  {
    id: 4,
    img: './assets/task5.jpg',
    audio: './assets/best.mp3',
    question:
      'У нас было много запоминающихся моментов.Вспомнишь, что за трек прикреплен к этой фотокарточке?',
    answer: 'Лучше всех',
    rigthAnswer: `Нет. Ты - лучше всех!!! Слушай композицию и переходим к следующему заданию:)`,
    wrongAnswer: `Я уверен, что ты знаешь ответ. ПРосто напиши название)`,
    validate: checkDefaultTask,
  },

  {
    id: 5,
    img: './assets/fish.png',
    question:
      'Дорогая, сейчас тебе предлагается погрузиться в мир загадок и разгадок. Твое последнее задание - разгадать ребус!',
    answer: 'РЫБОЛОВ',
    wrongMsg: 'Используй всю свою энергию чтобы разгадать данный ребус.',
    rigthAnswer:
      'Congratulations! Ты справилась со всеми заданиями. В качестве награды ты получишь презент!',
    validate: checkDefaultTask,
  },
  {
    id: 6,
    rigthAnswer:
      'Congratulations! Ты справилась со всеми заданиями. В качестве награды ты получишь презент!',
  },
];

let currentQuestion = 0;

bot.onText(/\/start/, (msg) => {
  bot.sendVideoNote(msg.chat.id, './assets/video.mp4', {
    caption: '',
    reply_markup: {
      keyboard: [['Я ready. Стартуем.']],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  if (currentQuestion !== 6 && msg.text !== 'Я ready. Стартуем.') {
    await handleAnswer(chatId, msg);
  } else if (msg.text === 'Я ready. Стартуем.') {
    startQuiz(chatId);
  }
});

function startQuiz(chatId) {
  currentQuestion = 0;
  const question = quizQuestions[0].question;
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
    switch (quizQuestions[currentQuestion].id) {
      case 0:
        bot.sendMessage(chatId, quizQuestions[currentQuestion].question);
        break;
      case 1:
        bot.sendMessage(chatId, task2).then(() =>
          bot.sendMessage(chatId, quizQuestions[currentQuestion].question, {
            parse_mode: 'MarkdownV2',
          })
        );

        break;
      case 2:
      case 3:
        bot.sendMessage(chatId, quizQuestions[currentQuestion].question, {
          parse_mode: 'MarkdownV2',
        });
        break;

      case 4:
        bot.sendPhoto(chatId, quizQuestions[currentQuestion].img, {
          caption: quizQuestions[currentQuestion].question,
        });
        break;
      case 5:
        bot.sendAudio(chatId, quizQuestions[currentQuestion - 1].audio).then(() =>
          bot.sendPhoto(chatId, quizQuestions[currentQuestion].img, {
            caption: quizQuestions[currentQuestion].question,
          })
        );
        break;
      case 6:
        break;
    }
  } else {
    if (answer.text !== '/start') {
      bot.sendMessage(chatId, quizQuestions[currentQuestion].wrongAnswer);
    }
  }
}

function checkDefaultTask(msg) {
  const correctAnswer = quizQuestions[currentQuestion].answer.toLowerCase();
  const userText = msg.text.toLowerCase();
  if (userText === correctAnswer) {
    bot.sendMessage(msg.chat.id, this.rigthAnswer);
    return true;
  }
  return false;
}

function checkImageForAnswer(recognizedArr, answerCombinations) {
  return recognizedArr.some((recognizedStr) => {
    const upperCaseStr = recognizedStr.toUpperCase();
    return answerCombinations.some((combination) => {
      return upperCaseStr.includes(combination);
    });
  });
}
