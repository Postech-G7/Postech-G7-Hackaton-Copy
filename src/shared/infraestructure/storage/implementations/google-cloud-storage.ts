import { Readable } from 'stream';
import { StorageInterface } from '../storage-interface';
import * as fs from 'fs';
import { cloudStorage } from '../config/cloud-storage.config';
import { NotFoundError } from 'src/shared/domain/errors/not-found-error';
import { BadRequestError } from 'src/shared/application/errors/bad-request-error';

export class GoogleCloudStorageService implements StorageInterface {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.GCLOUD_STORAGE_BUCKET;
  }

  async upload(
    file: Express.Multer.File,
    destination: string
  ): Promise<string> {
    if (!file || !file.buffer) {
      throw new BadRequestError('Video file not provided');
    }

    const bucket = cloudStorage.bucket;
    const fileUpload = bucket.file(destination + file.originalname);

    await fileUpload.save(file.buffer, {
      metadata: { contentType: file.mimetype },
      resumable: false,
    });

    return fileUpload.publicUrl();
  }

  async download(fileId: string): Promise<Readable> {
    const bucketName = this.bucketName;
    const fileName = `${fileId}.zip`;

    fs.mkdirSync('downloads', { recursive: true });

    const downloadOptions = {
      destination: './downloads/' + fileName,
    };

    const file = cloudStorage.storage.bucket(bucketName).file(fileName);
    await file.download(downloadOptions);

    const filePath = `./downloads/${fileId}.zip`;

    const fileStream = fs.createReadStream(filePath);

    fileStream.on('error', err => {
      console.error('File stream error:', err);
      throw new NotFoundError('File not found');
    });

    return fileStream;
  }

  async delete(fileName: string): Promise<void> {
    //filename ou filepath?
    const bucket = cloudStorage.bucket;
    await bucket.file(fileName).delete();
  }

  async listFiles(prefix?: string): Promise<string[]> {
    const bucket = cloudStorage.bucket;
    const [files] = await bucket.getFiles({ prefix });
    return files.map(file => file.name);
  }
}
