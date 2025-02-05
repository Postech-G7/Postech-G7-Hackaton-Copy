import { Readable } from 'stream';

export interface StorageInterface {
  upload(file: Express.Multer.File, destination: string): Promise<string>;
  download(filePath: string): Promise<Readable>;
  delete(filePath: string): Promise<void>;
  listFiles(prefix?: string): Promise<string[]>;
}
