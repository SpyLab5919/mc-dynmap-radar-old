import dotenv from 'dotenv';
dotenv.config();
import openDb from './db.js';
console. log("in bot");
import {Telegraf} from 'telegraf';
import {chromium} from 'playwright';

console. log("import telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);
console. log(process.env.BOT_TOKEN);
console. log(process.env.DYNMAP_URL);

console. log("new Telegraf");

const db = await openDb('./db/whitelist.json');
let whitelist = db.data;

await bot.launch().catch((err) => console.error(err));
console. log("bot.launch");

bot.use(async (ctx, next) => {
  //if (ctx.update.from === undefined) return; // 
  const userId = ctx.update.message?.from.id;
  const chatId = ctx.update.message?.chat.id;
  const update = ctx.update.message || ctx.update.callback_query;
// userId == process.env.RIGHTFUL_USER_ID || 
  if (chatId == process.env.MAIN_CHAT_ID) {
    next();
    return;
  }
  
  // await ctx.reply('У вас немає прав.');
  if (userId != process.env.RIGHTFUL_USER_ID && chatId != process.env.MAIN_CHAT_ID) {
    next();
    console.log(`[${new Date().toISOString()}] Використання команди ${ctx.update.message?.text} користувачем ${ctx.update.message?.from.username} ${userId} у ${ctx.update.message?.chat.username} ${chatId}`);
    return;
  }
  next();

});

bot.command('seewhitelist', (ctx) => {
  // console.log(ctx);
  ctx.reply(whitelist.join(' \n'));
});

bot.command('addadmin', (ctx) => {
  const user = ctx.update.message.from.username;
  const playerName = ctx.update.message.text.split(' ')[1];

  console.log(`[${new Date().toISOString()}] ${user} додав ${playerName} до вайтлісту.`);
  ctx.reply(`Додаю ${playerName} до вайтлісту.`);
  whitelist.push(playerName);
  db.write();
});

bot.command('addplayer', (ctx) => {
  const user = ctx.update.message.from.username;
  const playerName = ctx.update.message.text.split(' ')[1];

  console.log(`[${new Date().toISOString()}] ${user} додав ${playerName} до вайтлісту.`);
  ctx.reply(`Додаю ${playerName} до вайтлісту.`);
  whitelist.push(playerName);
  db.write();
});

bot.command('removeplayer', (ctx) => {
  const user = ctx.update.message.from.username;
  const playerName = ctx.update.message.text.split(' ')[1];
  const playerIndex = whitelist.indexOf(playerName);

  if (playerIndex !== -1) {
    console.log(`[${new Date().toISOString()}] ${user} видалив ${playerName} з вайтлісту.`);
    ctx.reply(`Видаляю ${playerName} з вайтлісту.`);
    whitelist.splice(playerIndex, 1);
  } else {
    console.log(`[${new Date().toISOString()}] Гравець ${playerName} не знаходиться у вайтлісті.`);
    ctx.reply(`Гравець ${playerName} не знаходиться у вайтлісті.`);
  }
  db.write();
});

bot.command('sex', (ctx) => {
  console.log(`Секс!`);
  ctx.reply(`Секс!`);
});
bot.command('goko_4orta', (ctx) => {
  console.log(`/goko_4orta`);
  ctx.reply(`/goko_4orta`);
});

bot.command('screenshot', async (ctx) => {
  await bot.telegram.sendChatAction(ctx.chat.id, 'typing');

  const url = "http://borukva.space:3405/?worldname=Borukva&mapname=flat&zoom=2&x=450&y=64&z=-950";
  const delay = 1_000 * ctx.update.message.text.split(' ')[1] || 3_000;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1200, height: 700 });

  try {
  await page.goto(url);
  } catch(err) {
    console.log(`[${new Date().toISOString()}] Помилка підключення до динмапи`);
    console.log(err);
    ctx.reply(`Помилка підключення до динмапи`);
    return;
  };

  await new Promise(resolve => setTimeout(resolve, delay))
  .catch((err) => {
    console.log(err);
  });

  const screenshot = await page.screenshot({
    clip: {x: 250, y: 0, width: 700, height: 700}
  });

  await browser.close();

  await bot.telegram.sendPhoto(ctx.chat.id, { source: screenshot });
  console.log(`[${new Date().toISOString()}] Скріншот мапи`);
});

export default bot;
