const TelegramBot = require('node-telegram-bot-api');
const request = require('request');

// Replace the value below with the Telegram token you receive from @BotFather
const token = '6124226504:AAF1vaiLxWQsB2eWiaeZs9-N7I5dSl691PM';

// Create a new bot instance
const bot = new TelegramBot(token, { polling: true });

// Define a global variable to store the selected level
let selectedLevel = '';

// Define the endpoint URL that contains the JSON data
const dataEndpoint = 'https://api.npoint.io/8006441b3f5c483a170f';

// Define the function to fetch the JSON data from the endpoint URL
function fetchData() {
  return new Promise((resolve, reject) => {
    request(dataEndpoint, { json: true }, (err, res, body) => {
      if (err) reject(err);
      resolve(body);
    });
  });
}

// Handle the '/start' command to display the documentation
bot.onText(/\/start/, async (msg) => {
    const reply = `Welcome to my Telegram bot!\n\nHere's how to use this bot:\n\n1. Type /show level to view all available levels.\n\n2. Select a level by typing /select levelX, where X is the level number.\n\n3. Select a subject by typing /iselect levelX subjectY, where X is the level number and Y is the subject name.\n\n4. View all books under the selected subject.\n\nEnjoy!`;
    bot.sendMessage(msg.chat.id, reply);
  });
  
// Handle the '/show level' command to display all available levels
bot.onText(/\/show level/, async (msg) => {
  try {
    const data = await fetchData();
    const levels = Object.keys(data);
    const reply = levels.map((level) => `/${level}`).join('\n');
    bot.sendMessage(msg.chat.id, `Available levels:\n${reply}`);
  } catch (err) {
    console.error(err);
    bot.sendMessage(msg.chat.id, 'Sorry, something went wrong.');
  }
});

// Handle the '/select levelX' command to display all subjects under the selected level
bot.onText(/\/select (\w+)/, async (msg, match) => {
  try {
    const data = await fetchData();
    const level = match[1];
    const subjects = data[level];
    if (!subjects) {
      bot.sendMessage(msg.chat.id, 'Invalid level selected.');
      return;
    }
    selectedLevel = level;
    const reply = Object.keys(subjects).map((subject) => `/${level}-${subject}`).join('\n');
    bot.sendMessage(msg.chat.id, `Subjects under ${level}:\n${reply}`);
  } catch (err) {
    console.error(err);
    bot.sendMessage(msg.chat.id, 'Sorry, something went wrong.');
  }
});

// Handle the '/iselect levelX subjectY' command to display all book names and URLs under the selected subject
bot.onText(/\/iselect (\w+)-(\w+)/, async (msg, match) => {
  try {
    const data = await fetchData();
    const level = match[1];
    const subject = match[2];
    const subjects = data[level];
    if (!subjects || !subjects[subject]) {
      bot.sendMessage(msg.chat.id, 'Invalid level or subject selected.');
      return;
    }
    const books = subjects[subject];
    const reply = Object.keys(books)
      .map((id) => `${books[id].name}: ${books[id].bookLink}`)
      .join('\n');
    bot.sendMessage(msg.chat.id, `Books under ${level} ${subject}:\n${reply}`);
  } catch (err) {
    console.error(err);
    bot.sendMessage(msg.chat.id, 'Sorry, something went wrong.');
  }
});
