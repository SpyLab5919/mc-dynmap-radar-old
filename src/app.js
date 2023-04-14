import dotenv from 'dotenv';
dotenv.config();


import { pointInPolygon } from 'geometric';
import bot from './bot.js';
import * as custom from './console.js';
import { config, whitelist, mainBorder } from './init.js';
import { fetchMap } from './browser.js';

custom.log("Бота запущено");
bot.telegram.sendMessage(process.env.RIGHTFUL_USER_ID, "Бота запущено");

let delay = config.defaultDelay;

let intrudersInBorders = [];

await scanMap();


async function scanMap() {
  try {
    let res = await fetchMap();
    let intruders = [];
    res.data.players.forEach((player) => {
      if (player?.world !== 'Borukva') return;
      if (whitelist.indexOf(player.name) !== -1) return;

      let index = intrudersInBorders.map(e => e.name).indexOf(player.name);
      if (index === -1) {
        if (pointInPolygon([player.x, player.z], mainBorder)) {
          intruders.push(player);
        }
      } else {
        intrudersInBorders[index] = player;
      }
    });

    intruders.forEach((intruder) => {
      intrudersInBorders.push(intruder);
      alert(intruder);
    });

    intrudersInBorders.forEach((intruder) => {
      if (intruder.world === "Borukva")
        if (pointInPolygon([intruder.x, intruder.z], mainBorder))
          return;
      intrudersInBorders.pop(intruder);
      cancel(intruder)
    });
  } catch (err) {
    custom.error(err);
  };
  setTimeout(() => scanMap(), delay);
}

async function alert(intruder) {
  const message = `Виявлено порушника ${intruder.name} [${intruder.x}, ${intruder.y}, ${intruder.z}]\n` +
    `/screenshot`;
  await new Promise(resolve => setTimeout(resolve, 1_000));
  bot.telegram.sendMessage(process.env.MAIN_CHAT_ID, message);
  custom.log(message);
}

function cancel(intruder) {
  const message = `${intruder.name} покинув радіус дії станції`;
  bot.telegram.sendMessage(process.env.MAIN_CHAT_ID, message);
  custom.log(message);
}


