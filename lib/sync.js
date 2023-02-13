require('dotenv').config();
const AWS = require('aws-sdk');
const readdir = require('recursive-readdir');
const Bluebird = require('bluebird');
const fs = require('fs');

const ROOT_DIR = path.join(__dirname, '..');

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  },
});

(async () => {
  let files = await readdir(path.join(ROOT_DIR, 'data'));
  files = files.map((file) => ({
    filepath: file,
    key: file.replace('data/', ''),
  }));

  await Bluebird.map(files, async (file) => {
    await s3.putObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: file.key,
      Body: fs.createReadStream(file.filepath),
      ContentType: 'image/png',
    }).promise();
    console.log('Uploaded: ', file.key);
  }, { concurrency: 20 });
})();
