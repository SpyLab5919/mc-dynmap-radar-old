import dotenv from 'dotenv';
dotenv.config();
import { Telegraf } from 'telegraf';
import * as custom from './console.js';
import { captureCoords, captureMap } from './browser.js';
import { config, whitelist } from './init.js';
const bot = new Telegraf(process.env.BOT_TOKEN);


await bot.launch().catch((err) => console.error(err));

bot.use(async (ctx, next) => {
  //if (ctx.update.from === undefined) return; // 
  const userId = ctx.update.message?.from.id;
  const chatId = ctx.update.message?.chat.id;
  const update = ctx.update.message || ctx.update.callback_query;
  // userId == process.env.RIGHTFUL_USER_ID || 
  try {
    if (chatId == process.env.MAIN_CHAT_ID) {
      custom.log(`${ctx.update.message?.from.username} [${userId}] використав ${ctx.update.message?.text}`);
      await next();
      return;
    }

    if (userId != process.env.RIGHTFUL_USER_ID || chatId != process.env.MAIN_CHAT_ID) {
      custom.log(`${ctx.update.message?.from.username} ${userId} використав ${ctx.update.message?.text} у ${ctx.update.message?.chat.username} ${chatId}`);
      await next();
      return;
    }
    await ctx.reply('У вас немає прав.', Extra.inReplyTo(ctx.message.id));
  } catch (err) {
    console.error(err);
    ctx.reply(`Виникла помилка при виконанні програми`);
  }
});



bot.command('whitelist', (ctx) => {
  ctx.reply(whitelist.join('\n'));
});



bot.command('addplayer', (ctx) => {
  const playerName = ctx.update.message.text.split(' ')[1];

  if (playerName === undefined) {
    ctx.reply(`Введіть нік гравця`, { reply_to_message_id: ctx.message.message_id });
    return;
  }
  const user = ctx.update.message.from.username;

  custom.log(`${user} додав ${playerName} до вайтлісту.`);
  ctx.reply(`Додаю ${playerName} до вайтлісту.`);
  whitelist.push(playerName);
  db.write();
});



bot.command('removeplayer', (ctx) => {
  const playerName = ctx.update.message.text.split(' ')[1];

  if (playerName === undefined) {
    ctx.reply(`Введіть нік гравця`);
    return;
  }
  const user = ctx.update.message.from.username;
  const playerIndex = whitelist.indexOf(playerName);

  if (playerIndex !== -1) {
    custom.warn(`${user} видалив ${playerName} з вайтлісту.`);
    ctx.reply(`Видаляю ${playerName} з вайтлісту.`);
    whitelist.splice(playerIndex, 1);
  } else {
    ctx.reply(`Гравець ${playerName} не знаходиться у вайтлісті.`);
  }
  db.write();
});



bot.command('sex', async (ctx) => {
  console.log(`Секс!`);
  await ctx.reply(`Секс!`);
});
bot.command('goko_4orta', async (ctx) => {
  console.log(`/goko_4orta`);
  await ctx.reply(`/goko_4orta`);
});
bot.command('plotnaya_vsim_nashim', async (ctx) => {
  console.log(`o/`);
  await ctx.reply(`o/`);
})



bot.command('screenshot', async (ctx) => {
  await bot.telegram.sendChatAction(ctx.chat.id, 'upload_photo');

  const screenshot = await captureMap();

  await bot.telegram.sendPhoto(ctx.chat.id, { source: screenshot });
});

bot.command('whereis', async (ctx) => {
  await bot.telegram.sendChatAction(ctx.chat.id, 'upload_photo');

  const playerName = ctx.update.message.text.split(' ')[1];
  const zoom = ctx.update.message.text.split(' ')[2];
  if (playerName === undefined) {
    ctx.reply(`Введіть нік гравця`);
    return;
  }
  await scan
  const screenshot = await captureCoords([0, 0], zoom)

  await bot.telegram.sendPhoto(ctx.chat.id, { source: screenshot });

});


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

export default bot;
