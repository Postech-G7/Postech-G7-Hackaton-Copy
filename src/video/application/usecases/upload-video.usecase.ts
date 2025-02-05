import { VideoRepository } from '../../domain/repositories/video.repository';
import { VideoOutput, VideoOutputMapper } from '../dtos/video-output';
import { BadRequestError } from '../../../shared/application/errors/bad-request-error';
import { UseCase as DefaultUseCase } from '../../../shared/application/providers/usecases/use-case';
import { VideoEntity } from '../../domain/entities/video.entity';
import { AuthService } from 'src/auth/infraestructure/auth.service';

export namespace UploadVideoUseCase {
  export type Input = {
    file: Express.Multer.File;
    jwtToken: string;
  };

  export type Output = VideoOutput;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private videoRepository: VideoRepository.Repository,
      private authService: AuthService
    ) {}

    async execute(input: Input): Promise<Output> {
      const { file, jwtToken } = input;

      if (!file || !file.buffer) {
        throw new BadRequestError('File is missing or invalid');
      }
      //VALIDAR COMO PEGAR O TOKEN DOS HEADERS
      const decodedToken = await this.authService.verifyJwt<{
        email: string;
        id: string;
      }>(jwtToken);

      const videoEntity = new VideoEntity({
        title: file.originalname,
        userEmail: decodedToken.email,
        base64: file.buffer.toString('base64'),
        userId: decodedToken.id,
        status: 'processing',
        createdAt: new Date(),
      });

      await this.videoRepository.insert(videoEntity);

      return this.toOutput(videoEntity);
    }

    private toOutput(entity: VideoEntity): VideoOutput {
      return VideoOutputMapper.toOutput(entity);
    }
  }
}
