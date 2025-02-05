/* eslint-disable prettier/prettier */
import { VideoRepository } from '../../domain/repositories/video.repository';
import { UseCase as DefaultUseCase } from '../../../shared/application/providers/usecases/use-case';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';
import { BadRequestError } from '../../../shared/application/errors/bad-request-error';

export namespace ProcessVideoUseCase {
  export type Input = {
    id: string;
  };

  export type Output = void;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(private videoRepository: VideoRepository.Repository) {}

    private createTempDir(id: string): string {
      const tempDir = path.join(process.cwd(), 'temp', id);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      return tempDir;
    }

    private async processVideo(videoPath: string, outputDir: string): Promise<string[]> {
      return new Promise((resolve, reject) => {
        const screenshots: string[] = [];
        
        ffmpeg(videoPath)
          .on('end', () => resolve(screenshots))
          .on('error', (err) => reject(err))
          .on('progress', (progress) => {
            const screenshotPath = path.join(outputDir, `screenshot-${progress.frames}.png`);
            screenshots.push(screenshotPath);
          })
          .screenshots({
            count: 30,
            folder: outputDir,
            filename: 'screenshot-%i.png',
          });
      });
    }

    private async createZipFile(screenshots: string[], outputDir: string): Promise<string> {
      const zipPath = path.join(outputDir, 'screenshots.zip');
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      return new Promise((resolve, reject) => {
        output.on('close', () => resolve(zipPath));
        archive.on('error', (err) => reject(err));

        archive.pipe(output);
        screenshots.forEach((screenshot) => {
          archive.file(screenshot, { name: path.basename(screenshot) });
        });
        archive.finalize();
      });
    }

    private cleanup(tempDir: string): void {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }

    async execute(input: Input): Promise<Output> {
      const { id } = input;

      // Get video from repository
      const video = await this.videoRepository.findById(id);
      if (!video) {
        throw new BadRequestError('Video not found');
      }

      const tempDir = this.createTempDir(id);
      const videoPath = path.join(tempDir, 'video.mp4');

      try {
        // Write base64 to temp file
        const videoBuffer = Buffer.from(video.base64, 'base64');
        fs.writeFileSync(videoPath, videoBuffer);

        // Process video and generate screenshots
        const screenshots = await this.processVideo(videoPath, tempDir);

        // Create zip file with screenshots
        const zipPath = await this.createZipFile(screenshots, tempDir);

        // Update video status to processed
        video.updateStatus('processed');
        await this.videoRepository.update(video);

        // Cleanup temporary files
        this.cleanup(tempDir);
      } catch (error) {
        // Cleanup on error
        this.cleanup(tempDir);
        
        // Update video status to error
        video.updateStatus('error');
        await this.videoRepository.update(video);
        
        throw error;
      }
    }
  }
}
