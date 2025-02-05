import { Storage } from '@google-cloud/storage';

const BUCKET_NAME = process.env.GCLOUD_STORAGE_BUCKET;

const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  keyFilename: process.env.GCLOUD_KEY_FILENAME,
});

export const cloudStorage = {
  storage,
  bucket: storage.bucket(BUCKET_NAME),
};
