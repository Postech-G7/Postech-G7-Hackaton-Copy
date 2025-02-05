import { VideoRepository } from '../../domain/repositories/video.repository';
import { VideoOutput, VideoOutputMapper } from '../dtos/video-output';
import { BadRequestError } from '../../../shared/application/errors/bad-request-error';
import { UseCase as DefaultUseCase } from '../../../shared/application/providers/usecases/use-case';
import { VideoEntity } from '../../domain/entities/video.entity';

export namespace GetVideoUseCase {
  export type Input = {
    id: string;
  };

  export type Output = VideoOutput;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(private videoRepository: VideoRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const { id } = input;

      if (!id) {
        throw new BadRequestError('Input data not provided');
      }

      const videoEntity = await this.videoRepository.findById(id);

      return this.toOutput(videoEntity);
    }

    private toOutput(entity: VideoEntity): VideoOutput {
      return VideoOutputMapper.toOutput(entity);
    }
  }
}
