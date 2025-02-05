import { Module } from '@nestjs/common';
import { VideosController } from './video.controller';
import { VideoRepository } from '../domain/repositories/video.repository';
import { VideoPrismaRepository } from './database/prisma/repositories/video-prisma.repository';

import { AuthModule } from '../../auth/infraestructure/auth.module';
import { PrismaService } from '../../shared/infraestructure/database/prisma/prisma.service';

import { DeleteProcessedVideoUseCase } from '../application/usecases/delete-processed-video.usecase';
import { RetrieveProcessedVideoUseCase } from '../application/usecases/retrieve-processed-video.usecase';
import { UploadProcessedVideoUseCase } from '../application/usecases/upload-processed-video.usecase';
import { UploadVideoUseCase } from '../application/usecases/upload-video.usecase';
import { ProcessVideoUseCase } from '../application/usecases/process-video.usecase';
import { GetVideoUseCase } from '../application/usecases/get-video.usecase';
import { ListVideosUseCase } from '../application/usecases/list-videos.usecase';
import { GoogleCloudStorageService } from '../../shared/infraestructure/storage/implementations/google-cloud-storage';
import { AuthService } from 'src/auth/infraestructure/auth.service';
import { UpdateVideoUseCase } from '../application/usecases/update-video';

@Module({
  imports: [AuthModule],
  controllers: [VideosController],
  providers: [
    { provide: 'PrismaService', useClass: PrismaService },
    {
      provide: 'VideoRepository',
      useFactory: (prismaService: PrismaService) =>
        new VideoPrismaRepository(prismaService),
      inject: ['PrismaService'],
    },
    { provide: 'StorageService', useClass: GoogleCloudStorageService },
    {
      provide: DeleteProcessedVideoUseCase.UseCase,
      useFactory: (
        videoRepository: VideoRepository.Repository,
        storageService: GoogleCloudStorageService
      ) => {
        return new DeleteProcessedVideoUseCase.UseCase(
          storageService,
          videoRepository
        );
      },
      inject: ['VideoRepository', 'StorageService'],
    },
    {
      provide: RetrieveProcessedVideoUseCase.UseCase,
      useFactory: (
        videoRepository: VideoRepository.Repository,
        storageService: GoogleCloudStorageService
      ) => {
        return new RetrieveProcessedVideoUseCase.UseCase(
          storageService,
          videoRepository
        );
      },
      inject: ['VideoRepository'],
    },
    {
      provide: UploadProcessedVideoUseCase.UseCase,
      useFactory: (
        videoRepository: VideoRepository.Repository,
        storageService: GoogleCloudStorageService
      ) => {
        return new UploadProcessedVideoUseCase.UseCase(
          storageService,
          videoRepository
        );
      },
      inject: ['VideoRepository', 'StorageService'],
    },
    {
      provide: UploadVideoUseCase.UseCase,
      useFactory: (
        videoRepository: VideoRepository.Repository,
        authService: AuthService
      ) => {
        return new UploadVideoUseCase.UseCase(videoRepository, authService);
      },
      inject: ['VideoRepository'],
    },
    {
      provide: ProcessVideoUseCase.UseCase,
      useFactory: (videoRepository: VideoRepository.Repository) => {
        return new ProcessVideoUseCase.UseCase(videoRepository);
      },
      inject: ['VideoRepository'],
    },
    {
      provide: GetVideoUseCase.UseCase,
      useFactory: (videoRepository: VideoRepository.Repository) => {
        return new GetVideoUseCase.UseCase(videoRepository);
      },
      inject: ['VideoRepository'],
    },
    {
      provide: UpdateVideoUseCase.UseCase,
      useFactory: (videoRepository: VideoRepository.Repository) => {
        return new UpdateVideoUseCase.UseCase(videoRepository);
      },
      inject: ['VideoRepository'],
    },
    {
      provide: ListVideosUseCase.UseCase,
      useFactory: (videoRepository: VideoRepository.Repository) => {
        return new ListVideosUseCase.UseCase(videoRepository);
      },
      inject: ['VideoRepository'],
    },
  ],
})
export class VideoModule {}
