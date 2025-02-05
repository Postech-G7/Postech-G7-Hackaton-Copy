import { VideoEntity } from '../../domain/entities/video.entity';

export type VideoOutput = {
  id: string;
  title: string;
  createdAt: Date;
  status: 'processing' | 'completed' | 'failed' | 'retrieved';
  userId: string;
  userEmail: string;
  base64: string;
};

export class VideoOutputMapper {
  static toOutput(entity: VideoEntity): VideoOutput {
    return {
      id: entity.id,
      title: entity.title,
      createdAt: entity.createdAt,
      status: entity.status,
      userId: entity.userId,
      userEmail: entity.userEmail,
      base64: entity.base64,
    };
  }
}
