import dotenv from "dotenv";
dotenv.config();
import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client, } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mime from "mime-types";


export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export const createUploadSignedUrl = async ({ key, contentType }) => {
  const command = new PutObjectCommand({
    Bucket: "sync-drive-bucket",
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

export const createGetSignedUrl = async ({ key, download = false, filename, expiresIn = 3600 }) => {
  const contentType = mime.lookup(filename) || undefined;
  const command = new GetObjectCommand({
    Bucket: "sync-drive-bucket",
    Key: key,
    ResponseContentDisposition: `${download ? "attachment" : "inline"}; filename="${encodeURIComponent(filename)}"`,
    ...(contentType && !download ? { ResponseContentType: contentType } : {}),
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn,
  });

  return url;
};

export const getS3FileMetaData = async (key) => {
  const command = new HeadObjectCommand({
    Bucket: "sync-drive-bucket",
    Key: key,
  });

  return await s3Client.send(command);
};
export const deleteS3File = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: "sync-drive-bucket",
    Key: key,
  });

  return await s3Client.send(command);
};

export const deleteS3Files = async (keys) => {
  const command = new DeleteObjectsCommand({
    Bucket: "sync-drive-bucket",
    Delete: {
      Objects: keys,
      Quiet: false, // set true to skip individual delete responses
    },
  });

  return await s3Client.send(command);
};