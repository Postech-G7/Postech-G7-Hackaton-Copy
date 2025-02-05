import { ClassValidatorFields } from 'src/shared/domain/validators/class-validator-fields';
import { VideoProps } from '../entities/video.entity';
import {
  IsDate,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class VideoRules {
  @IsString()
  @IsNotEmpty()
  base64: string;

  @MinLength(1)
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['processing', 'completed', 'failed', 'retrieved'])
  status: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @IsOptional()
  @IsDate()
  createdAt: Date;

  constructor(data: VideoProps) {
    Object.assign(this, data);
  }
}

export class VideoValidator extends ClassValidatorFields<VideoProps> {
  validate(data: VideoProps): boolean {
    return data && super.validate(new VideoRules(data));
  }
}

export class VideoValidatorFactory {
  static create() {
    return new VideoValidator();
  }
}
