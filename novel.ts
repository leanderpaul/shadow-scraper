import { novelModel } from '@leanderpaul/shadow-novel-database';

import { genre, tags } from './data';

const username = 'leanderpaul';

export async function createNovel() {
  const novel = await novelModel.createNovel({
    author: username,
    desc: `One will to create oceans. One will to summon the mulberry fields.

    One will to slaughter countless devils. One will to eradicate innumerable immortals.
    
    Only my will… is eternal.
    
    A Will Eternal tells the tale of Bai Xiaochun, an endearing but exasperating young man who is driven primarily by his fear of death and desire to live forever, but who deeply values friendship and family.
      `,
    genre: genre.FANTASY,
    status: 'ongoing',
    tags: [tags.ACTION, tags.COMEDY, tags.HAREM, tags.SEINEN, tags.XIANXIA, tags.MALE_PROTAGONIST],
    title: 'A Will Eternal'
  });
  console.log('Novel created successfully !');
  return novel;
}

export async function findNovel(nid: string) {
  return novelModel.findById(nid);
}

export async function createVolume(nid: string, name?: string) {
  await novelModel.updateNovel(nid, {}, false, { operation: 'add', name });
}
