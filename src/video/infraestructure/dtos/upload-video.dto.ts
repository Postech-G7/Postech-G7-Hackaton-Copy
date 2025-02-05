import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UploadVideoUseCase } from 'src/video/application/usecases/upload-video.usecase';

export class UploadVideoDto implements UploadVideoUseCase.Input {
  @ApiProperty({
    description: 'Express Multer Video File',
  })
  @IsString()
  @IsNotEmpty()
  file: Express.Multer.File;

  @ApiProperty({
    description: 'Token JWT do usuário',
  })
  @IsString()
  @IsNotEmpty()
  jwtToken: string;
}
