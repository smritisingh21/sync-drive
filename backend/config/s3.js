import dotenv from "dotenv";
dotenv.config();
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

console.log({
  region: process.env.AWS_REGION,
  keyId: process.env.AWS_ACCESS_KEY_ID,
  secretKey:process.env.AWS_SECRET_KEY,
});

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

export const createUploadSignedUrl = async ({ key, contentType }) => {
  const command = new PutObjectCommand({
    Bucket: "sync-drive-storage",
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
    signableHeaders: new Set(["content-type"]),
  });
  console.log("Uploading in S3...");

  return url;
};

export const createGetSignedUrl = async ({key, download = false, filename, }) => {
  const command = new GetObjectCommand({
    Bucket: "sync-drive-storage",
    Key: key,
    ResponseContentDisposition: `${download ? "attachment" : "inline"}; filename=${encodeURIComponent(filename)}`,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
  });

  return url;
};

export const getS3FileMetaData = async (key) => {
  const command = new HeadObjectCommand({
    Bucket: "sync-drive-storage",
    Key: key,
  });

  return await s3Client.send(command);
};
