import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UploadProcessedVideoUseCase } from 'src/video/application/usecases/upload-processed-video.usecase';

//toBeImplemented
export class UploadProcessedVideoDto
  implements UploadProcessedVideoUseCase.Input
{
  @ApiProperty({
    description: 'Video ID',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Express Multer Video File',
  })
  @IsString()
  @IsNotEmpty()
  file: Express.Multer.File;

  @ApiProperty({
    description: 'Destination for the file',
  })
  @IsString()
  @IsNotEmpty()
  destination: string;
}
