import { VideoOutput } from '../../application/dtos/video-output';
import { Transform } from 'class-transformer';
import { CollectionPresenter } from '../../../shared/infraestructure/presenters/collection.presenter';
import { ListVideosUseCase } from '../../application/usecases/list-videos.usecase';
import { ApiProperty } from '@nestjs/swagger';

export class VideoPresenter {
  @ApiProperty({
    description: 'ID do vídeo',
  })
  id: string;

  @ApiProperty({
    description: 'Descrição do vídeo',
  })
  title: string;

  @ApiProperty({
    description: 'Status do processamento do vídeo',
  })
  status: string;

  @ApiProperty({
    description: 'Base64 do vídeo',
  })
  base64: string;

  @ApiProperty({
    description: 'ID do usuário',
  })
  userId: string;

  @ApiProperty({
    description: 'E-mail do usuário',
  })
  userEmail: string;

  @ApiProperty({
    description: 'Data de criação do vídeo',
  })
  @Transform(({ value }: { value: Date }) => value.toISOString())
  createdAt: Date;

  constructor(output: VideoOutput) {
    this.id = output.id;
    this.title = output.title;
    this.status = output.status;
    this.base64 = output.base64;
    this.userId = output.userId;
    this.userEmail = output.userEmail;
    this.createdAt = output.createdAt;
  }
}

export class VideoCollectionPresenter extends CollectionPresenter {
  data: VideoPresenter[];
  constructor(output: ListVideosUseCase.Output) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map(item => new VideoPresenter(item));
  }
}
