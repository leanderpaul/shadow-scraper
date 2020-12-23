const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const { htmlToText } = require('html-to-text');

const dataModel = require('./model');

/**
 * MongoDB connecions.
 */
const mongodbUser = { user: 'tester', password: 'password' };
mongoose.connect('mongodb://localhost/testdb', { auth: mongodbUser, useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true });
mongoose.connection.on('connected', () => console.log('connected to DB !'));
mongoose.connection.on('error', console.error);

/**
 * Scraper Constants
 */
const inputArg = process.argv[2] || '';
const hostname = 'https://novelfull.com';
const novelName = inputArg.replace(hostname, '').split('/')[1];
const intialUrl = inputArg.replace(hostname, '');
const chapterTitleSelector = '.chapter-title';
const contentSelector = '#chapter-content';
const nextChapterSelector = '#next_chap';
const noOfPagesToScrape = 9999;
let pageScrapedCount = 0;
let index = 0;

/**
 *
 * @param {string} str
 */
function formatHTML(str) {
  return htmlToText(str).split('\n').join(' ');
}

/**
 *
 * @param {string} url
 */
async function scrapePage(url) {
  try {
    if (!url) return console.log('No Next Chapter');
    const uri = hostname + url;
    const res = await axios.default.get(uri);
    const $ = cheerio.load(res.data);
    const title = $(chapterTitleSelector).text();
    const content = $(`${contentSelector} p`)
      .map(function () {
        const html = $(this).html();
        return formatHTML(html);
      })
      .get()
      .join('\n');
    const data = { novel: novelName, url: uri, title, data: content, index: ++index };
    await dataModel.create(data);
    pageScrapedCount++;
    const nextChapterUrl = $(nextChapterSelector).attr('href');
    console.log(`Scraped ${index} chapter ${data.title}`);
    if (pageScrapedCount < noOfPagesToScrape) await scrapePage(nextChapterUrl);
  } catch (err) {
    console.error(err);
    console.log('Error in URL: ', hostname + url);
    process.exit();
  }
}

async function scraper() {
  console.log(`Novel Name: ${novelName}`);
  index = await dataModel.countDocuments({ novel: novelName });
  if (!inputArg) console.error('Input url required !');
  else await scrapePage(intialUrl);
  mongoose.connection.close();
}

scraper();
