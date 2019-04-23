const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');

const token = '728222047:AAEA3hw316d6xXfcgVDf46drLdD8Jhyzad8';
const bot = new TelegramBot(token, {polling: true});
 
bot.onText(/\/start/, (msg, match) => {
    let chatId = msg.chat.id
    bot.sendMessage(chatId, "Please right /show followed by a word to look for matches");
}) 

bot.onText(/\/show (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    console.log(match[1])
    bot.sendMessage(chatId, "Looking for " + (match[1]) + ". Give me a moment mate");
    (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        let url;
        let targetPage = await "https://rule34.paheal.net/post/list/" + encodeURIComponent(match[1].trim()) +"/1"
        
        await page.goto(targetPage);
        await page.waitFor('div[class=tnc]');
        await page.click('div.tnc p:nth-child(3) a:nth-child(1)');
        let pass = await page.evaluate(() => {
            return document.getElementById('paginator');
        })
        if (await pass) {
            await page.waitFor('section[id=paginator]');
            await page.click('section#paginator div:nth-child(1) a:nth-child(1)');
            await page.waitFor(2000);
            url = await page.evaluate(() => {
                let elements = document.getElementsByClassName("shm-thumb");
                let pick = Math.floor(Math.random() * elements.length);
                return elements[pick].childNodes[2].href;
            });
            await(function () {
                console.log(url);
                if (/.jpg$/.test(url)) {
                    try {
                        bot.sendPhoto(chatId, url);
                    } catch(e) {
                        bot.sendMessage(chatId, "something wrong with the file... Try again, plz");
                    }
                } else if (/.mp4$/.test(url)) {
                    try {
                        bot.sendMessage(chatId, "getting you a video, might take a while...");
                        bot.sendVideo(chatId, url);
                    } catch(e) {
                        bot.sendMessage(chatId, "something wrong with the file... Try again, plz");
                    }
                } else {
                    try {
                        bot.sendMessage(chatId, "getting you something, hold on");
                        bot.sendDocument(chatId, url);
                    } catch(e) {
                        bot.sendMessage(chatId, "something wrong with the file... Try again, plz");
                    }        
                }
            })();
        } else {
            bot.sendMessage(chatId, "there's nothing for " + match[1] + ". Maybe look for something else?")
        }

    })();
})
