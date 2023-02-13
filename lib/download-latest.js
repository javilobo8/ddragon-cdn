const https = require('https');
const axios = require('axios').default;
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const Bluebird = require('bluebird');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const client = axios.create({ httpsAgent });
const ROOT_DIR = path.join(__dirname, '..');

const getSquareImageURL = (image, cdnVersion) => `http://ddragon.leagueoflegends.com/cdn/${cdnVersion}/img/champion/${image}`;
const getProfileIconImageURL = (image, cdnVersion) => `http://ddragon.leagueoflegends.com/cdn/${cdnVersion}/img/profileicon/${image}`;

async function getVersions() {
  const { data } = await client({ url: 'https://ddragon.leagueoflegends.com/api/versions.json' });
  return data;
}

async function getChampionData(version) {
  const { data } = await client({ url: `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json` });
  return data;
}

async function getProfileIconData(version) {
  const { data } = await client({ url: `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/profileicon.json` });
  return data;
}

async function downloadImage(url) {
  const { data } = await client({ url, responseType: 'stream' });
  return data;
}

(async () => {
  const versions = await getVersions();
  const latestVersion = versions[0];
  console.log(`Latest version: ${latestVersion}`);

  const squareImagesDir = path.join(ROOT_DIR, `/data/cdn/${latestVersion}/img/champion`);
  const championData = await getChampionData(latestVersion);
  const championNames = Object.keys(championData.data);
  const championImages = championNames.map((championName) => {
    const champion = championData.data[championName];
    const championImage = champion.image.full;
    return championImage;
  });
  await mkdirp(squareImagesDir);
  await Bluebird.map(championImages, async (image) => {
    (await downloadImage(getSquareImageURL(image, latestVersion)))
      .pipe(fs.createWriteStream(path.join(squareImagesDir, image)));
    console.log('Downloaded:', image);
  }, { concurrency: 20 });

  const profileIconImagesDir = path.join(ROOT_DIR, `/data/cdn/${latestVersion}/img/profileicon`);
  const profileIconData = await getProfileIconData(latestVersion);
  const profileiconNames = Object.keys(profileIconData.data);
  const profileiconImages = profileiconNames.map((profileiconName) => {
    const profileicon = profileIconData.data[profileiconName];
    const profileiconImage = profileicon.image.full;
    return profileiconImage;
  });
  await mkdirp(profileIconImagesDir);
  await Bluebird.map(profileiconImages, async (image) => {
    (await downloadImage(getProfileIconImageURL(image, latestVersion)))
      .pipe(fs.createWriteStream(path.join(profileIconImagesDir, image)));
    console.log('Downloaded:', image);
  }, { concurrency: 20 });
})();