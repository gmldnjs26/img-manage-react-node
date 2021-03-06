const { AWS_SECRET_KEY, AWS_ACCESS_KEY } = process.env;

const aws = require("aws-sdk");

const s3 = new aws.S3({
  secretAccessKey: AWS_SECRET_KEY,
  accessKeyId: AWS_ACCESS_KEY,
  region: "ap-northeast-1",
});

const getSignedUrl = (key) => {
  return new Promise((resovle, reject) => {
    s3.createPresignedPost(
      {
        Bucket: "first-image-storage",
        Fields: {
          key,
        },
        Expires: 300,
        Conditions: [
          ["content-length-range", 0, 50 * 1000 * 1000], // 0 ~ 50MB
          ["starts-with", "$Content-Type", "image/"], // only image
        ],
      },
      (err, data) => {
        if (err) reject(err);
        else resovle(data);
        return;
      }
    );
  });
};

module.exports = { s3, getSignedUrl };
