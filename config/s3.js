const AWS = require("aws-sdk");
const fetch = require("node-fetch");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3({
  params: {
    Bucket: process.env.S3_BUCKET,
  },
});

async function uploadImageToS3(update, { url, imagePath, type } = {}) {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer(), "binary");

  if (update) {
    s3.putObject({
      Key: imagePath,
      Body: buffer,
      ContentType: type,
    }).send();
  } else {
    s3.upload({
      Key: imagePath,
      Body: buffer,
      ContentType: type,
    }).send();
  }

  return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${imagePath}`;
}

module.exports = {
  uploadImageToS3,
};
