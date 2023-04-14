import axios from "axios";
import { chromium } from 'playwright';
import dotenv from 'dotenv';
dotenv.config();
import { config } from "./init.js";
import * as custom from './console.js'
import { mainBorder, getOuterRectangleCenter } from './init.js';

const center = getOuterRectangleCenter(mainBorder);

//const mapURL = `${process.env.DYNMAP_URL}/?worldname=${param.worldname}&mapname=${param.mapname}&zoom=${param.zoom}&x=${param.x}&y=64&z=${param.z}`;
const browser = await chromium.launch();
const mainPage = await addNewPage(browser, center, config.defaultZoom);
async function addNewPage(browser, coords, zoom) {
  
  const page = await browser.newPage();
  const params = new URLSearchParams({
    worldname: "Borukva",
    mapname: "flat",
    zoom: zoom,
    x: coords[0],
    y: 64,
    z: coords[1]
  });
  
  await page.setViewportSize({ width: config.screenWidth, height: config.screenHeight });
  try {
    const url = process.env.DYNMAP_URL + "?" + params;
    await gotoURL(page, url);
    console.log(url);
  } catch (err) {
    const message = `Помилка підключення до ${process.env.DYNMAP_URL}`;
    custom.error(message);
    custom.error(err);
    custom.error(message);
  };
  return page;
}

async function gotoURL(page, searchParams) {
  const params = new URLSearchParams({
    worldname: searchParams.worldname || config.worldname,
    mapname: searchParams.mapname || config.mapname,
    zoom: searchParams.zoom || config.defaultZoom,
    x: searchParams.x || center[0],
    y: searchParams.y || 64,
    z: searchParams.z || center[1]
  });
  const url = process.env.DYNMAP_URL + "?" + params;
  await page.goto(url);
}

async function fetchMap() {
  let res = await axios.get(`${process.env.DYNMAP_URL}up/world/Borukva/${Date.now()}`);
  return res;
}

async function captureMap() {
  await mainPage.setViewportSize({ width: config.screenWidth, height: config.screenHeight });

  const screenshot = await mainPage.screenshot({clip: {
    x: config.imagePaddingX, y: config.imagePaddingY, width: config.imageWidth, height: config.imageHeight
  }})
    .catch((err) => {
      custom.error(err);
      //ctx.reply(`Виникла помилка при скріншоті`);
      return;
    });
  return screenshot;
}


async function captureCoords(coords, zoom = config.defaultZoom) {
  const secondPage = await addNewPage(browser, coords, zoom);

  await new Promise(resolve => setTimeout(resolve, 1_000));

  const screenshot = await secondPage.screenshot({clip: {
    x: config.imagePaddingX, y: config.imagePaddingY, width: config.imageWidth, height: config.imageHeight
  }})
    .catch((err) => {
      custom.error(err);
      // ctx.reply(`Виникла помилка при скріншоті`);
      return undefined;
    });

  


  return screenshot;
}

export { fetchMap, captureMap, captureCoords }