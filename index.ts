import db from '@leanderpaul/shadow-novel-database';

import { createNovel, findNovel } from './novel';
import { scrapers } from './lib';

const volumeIndex = 0;

async function scrape(nid?: string) {
  const novel = await (nid ? findNovel(nid) : createNovel());
  const vid = novel.volumes[volumeIndex].vid;
  const Scraper = scrapers.webnovel;
  const scraper = new Scraper('8093963805004105', '21727068732575742');
  let hasNext = true;
  try {
    while (hasNext) {
      hasNext = await scraper.scrapeChapter(novel.nid, vid);
    }
  } catch (err) {
    console.log(err);
  }
  console.log('Completed scraping !');
  db.disconnect();
}

db.connect();
scrape();
