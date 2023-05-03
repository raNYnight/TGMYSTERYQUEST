const TelegramBot = require("node-telegram-bot-api");

const token = "5995942003:AAHJ4PrxnxDrFSMJfb_c57EmKK0mgc5g8jA"
const bot = new TelegramBot("5995942003:AAHJ4PrxnxDrFSMJfb_c57EmKK0mgc5g8jA", {
  polling: true
});

const quizQuestions = [
  {
    question: "What is eternal, yet fragile and easily broken?",
    answer: "love",
  },
  {
    question: "What flower symbolizes love and passion?",
    options: ["rose", "orchid", "tulip", "lily"],
    answer: "rose",
  },
  {
    question:
      "What is greater than God, worse than the devil, and if you eat it, you will die?",
    answer: "nothing",
  },
];

let currentQuestion = 0;

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Hi! I am a quiz bot.", {
    reply_markup: {
      keyboard: [["Start Quiz"]],
      resize_keyboard: true,
    },
  });
  bot.sendVideoNote(msg.chat.id, "./video.mp4", {
    caption: "Поздравляем! Вы дали правильный ответ!",
  });
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText === "Start Quiz") {
    startQuiz(chatId);
  } else if (currentQuestion < quizQuestions.length) {
    handleAnswer(chatId, messageText);
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
  const question = quizQuestions[currentQuestion];
  const isAnswerCorrect =
    question.answer.toLowerCase() === answer.toLowerCase();

  if (isAnswerCorrect) {
    currentQuestion++;

    if (currentQuestion === quizQuestions.length) {
      bot.sendMessage(chatId, "Congratulations! You have finished the quiz.");
    } else {
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
  } else {
    if (answer !== "/start") {
      bot.sendMessage(chatId, "Incorrect answer. Please try again.");
    }
  }
}
