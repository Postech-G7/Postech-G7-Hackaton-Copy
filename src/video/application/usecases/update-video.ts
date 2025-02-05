import { BadRequestError } from '../../../shared/application/errors/bad-request-error';
import { UseCase as DefaultUseCase } from '../../../shared/application/providers/usecases/use-case';
import { InvalidPasswordError } from '../../../shared/application/errors/invalid-password-error';
import { VideoRepository } from 'src/video/domain/repositories/video.repository';
import { VideoOutput, VideoOutputMapper } from '../dtos/video-output';
import { VideoEntity } from 'src/video/domain/entities/video.entity';

export namespace UpdateVideoUseCase {
  export type Input = {
    id: string;
    status: 'processing' | 'completed' | 'failed' | 'retrieved';
  };

  export type Output = VideoOutput;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(private videoRepository: VideoRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const { id, status } = input;

      if (!id) {
        throw new BadRequestError('Input data not provided');
      }

      if (!status) {
        throw new InvalidPasswordError('Status must be provided');
      }

      const videoEntity = await this.videoRepository.findById(id);

      videoEntity.updateStatus(status);

      await this.videoRepository.update(videoEntity);

      return this.toOutput(videoEntity);
    }

    private toOutput(entity: VideoEntity): VideoOutput {
      return VideoOutputMapper.toOutput(entity);
    }
  }
}
