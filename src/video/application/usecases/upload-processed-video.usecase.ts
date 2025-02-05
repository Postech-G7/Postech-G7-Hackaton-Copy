import { GoogleCloudStorageService } from '../../../shared/infraestructure/storage/implementations/google-cloud-storage';
import { VideoRepository } from '../../domain/repositories/video.repository';
import { BadRequestError } from '../../../shared/application/errors/bad-request-error';
import { UseCase as DefaultUseCase } from '../../../shared/application/providers/usecases/use-case';

//toBeImplemented
export namespace UploadProcessedVideoUseCase {
  export type Input = {
    file: Express.Multer.File;
    destination: string;
    id: string;
  };
  export type Output = void;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly storageService: GoogleCloudStorageService,
      private readonly videoRepository: VideoRepository.Repository
    ) {}
    //toBeImplemented
    //faz o upload para o storage
    async execute(input: Input): Promise<Output> {
      if (!input?.file || !input?.destination) {
        throw new BadRequestError('Input data not provided');
      }

      await this.storageService.upload(input.file, input.destination);

      const videoEntity = await this.videoRepository.findById(input.id);

      videoEntity.updateStatus('completed');
    }
  }
}
