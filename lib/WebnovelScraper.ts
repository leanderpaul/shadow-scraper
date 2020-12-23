import axios from 'axios';

import { chapterModel } from '@leanderpaul/shadow-novel-database';

const headers = {
  Host: 'www.webnovel.com',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0',
  Accept: 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'X-Requested-With': 'XMLHttpRequest',
  Referer: 'https://www.webnovel.com/book/release-that-witch_7931338406001705/becoming-a-prince_21399558403711764',
  Connection: 'keep-alive',
  Cookie:
    '_csrfToken=WOfq6k4JBZaqcjzfknfKnURExFdSZPiaO7Qod345; e1=%7B%22pid%22%3A%22qi_p_searchnoresult%22%2C%22eid%22%3A%22qi_A_bookcover%22%2C%22l1%22%3A%221%22%7D; e2=%7B%22pid%22%3A%22downloadpop%22%2C%22eid%22%3A%22qi_C_downloadpop%22%2C%22l1%22%3A1%7D; __auc=8532b84a17536fed91f7d94b9eb; _ga=GA1.2.987654152.1602945473; _fbp=fb.1.1602945473567.1925496427; para-comment-tip-show=1; __gads=ID=fe46c2924ff0d5d8-2210983b52c4004b:T=1603198375:S=ALNI_MZzbQ5hf7RHAWaXtZ7dTQppZRCv8Q; g_state={"i_l":0}; dontneedgoogleonetap=1; googleonetaplogin=1; hf=1; accept_updated_terms=1; __zlcmid=118ja2fnpxr1wDt; webnovel_uuid=1606277612_1519961920; webnovel-language=en; webnovel-content-language=en; ukey=uOCbPTEONCG; uid=4281630572; alk=ta426ed89b77ae4159bd8c384f9f7a4cc1%7C4281630572; alkts=1609051895; checkInTip=1',
  TE: 'Trailers'
};

function getURL(bookId: string, chapterId: string) {
  return `https://www.webnovel.com/go/pcm/chapter/getContent?_csrfToken=WOfq6k4JBZaqcjzfknfKnURExFdSZPiaO7Qod345&bookId=${bookId}&chapterId=${chapterId}&_=${Date.now()}`;
}

interface Content {
  content: string;
}

export class WebnovelScraper {
  bookId: string;
  chapterId: string;
  scrapeCount = 0;
  chaptersToScrape = null;

  constructor(bookId: string, chapterId: string, numberOfChapters?: number) {
    this.bookId = bookId;
    this.chapterId = chapterId;
    if (numberOfChapters) this.chaptersToScrape = numberOfChapters;
  }

  async scrapeChapter(nid: string, vid: string) {
    const res = await axios.get(getURL(this.bookId, this.chapterId), { headers });
    const chapterInfo = res.data.data.chapterInfo;
    if (chapterInfo.isAuth === 0) throw new Error(`chapter ${chapterInfo.chapterIndex} is incompleted. chapterId = ${this.chapterId}`);
    await chapterModel.createChapter({
      nid: nid,
      vid: vid,
      title: chapterInfo.chapterName,
      content: chapterInfo.contents.map((content: Content) => content.content.split('\n').join('').split('\r').join('')).join('\n'),
      matureContent: false
    });
    this.scrapeCount++;
    if (this.scrapeCount % 10 === 0) console.log('Chapters scraped = ' + this.scrapeCount);
    if (this.chaptersToScrape && this.scrapeCount >= this.chaptersToScrape) return false;
    if (chapterInfo.nextChapterId) {
      this.chapterId = chapterInfo.nextChapterId;
      return true;
    }
    return false;
  }
}
