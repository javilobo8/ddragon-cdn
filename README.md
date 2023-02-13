# Data Dragon Mirroring

This project mirrors the League of Legends static data from the Riot Games API. It is intended to be used as a backup for the data. By default, the images will be downloaded and uploaded to an S3 bucket.

It skips HTTPS verification, so it is not recommended to use this for anything other than a backup.

It will download all champion square images and profileicon images.

## Usage

Create .env file with the following contents:

```bash
AWS_S3_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXX
AWS_S3_SECRET_KEY=XXXXXXXXXXXXXXXXXXXX
AWS_S3_BUCKET=bucket-name
```

Then run the following commands:

Download all images:
```bash
node download-latest.js
```

Upload all images to S3:
```bash
node sync.js
```