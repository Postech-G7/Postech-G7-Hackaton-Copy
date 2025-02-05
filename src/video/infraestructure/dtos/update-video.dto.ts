import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { UpdateVideoUseCase } from 'src/video/application/usecases/update-video';

export class UpdateVideoDto implements Omit<UpdateVideoUseCase.Input, 'id'> {
  @ApiProperty({
    description: 'Status do vídeo',
    enum: ['processing', 'completed', 'failed', 'retrieved'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['processing', 'completed', 'failed', 'retrieved'])
  status: 'processing' | 'completed' | 'failed' | 'retrieved';

  @ApiProperty({
    description: 'ID do vídeo',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
