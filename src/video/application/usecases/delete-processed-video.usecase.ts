import { GoogleCloudStorageService } from '../../../shared/infraestructure/storage/implementations/google-cloud-storage';
import { VideoRepository } from '../../domain/repositories/video.repository';
import { BadRequestError } from '../../../shared/application/errors/bad-request-error';
import { UseCase as DefaultUseCase } from '../../../shared/application/providers/usecases/use-case';

export namespace DeleteProcessedVideoUseCase {
  export type Input = { id: string };
  export type Output = void;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly storageService: GoogleCloudStorageService,
      private readonly videoRepository: VideoRepository.Repository
    ) {}

    async execute(input: Input): Promise<Output> {
      if (!input?.id) {
        throw new BadRequestError('Input data not provided');
      }
      const video = await this.videoRepository.findById(input.id); //já emite not found error

      const videoFileName = `${video.id}.zip`;

      await this.storageService.delete(videoFileName);
      await this.videoRepository.delete(input.id);
    }
  }
}
