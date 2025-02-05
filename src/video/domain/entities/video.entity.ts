import { Entity } from '../../../shared/domain/entities/entity';
import { EntityValidationError } from '../../../shared/domain/errors/validation-error';
import { VideoValidatorFactory } from '../validators/video.validator';

export type VideoProps = {
  title: string;
  createdAt?: Date;
  status: 'processing' | 'completed' | 'failed' | 'retrieved';
  userId: string;
  userEmail: string;
  base64: string;
};

export class VideoEntity extends Entity<VideoProps> {
  constructor(props: VideoProps, id?: string) {
    VideoEntity.validate(props);
    super(props, id);
    this.props.createdAt = props.createdAt ?? new Date();
  }

  static validate(data: VideoProps) {
    const validator = VideoValidatorFactory.create();
    const isValid = validator.validate(data);
    if (!isValid) {
      throw new EntityValidationError(validator.errors);
    }
  }

  updateStatus(value: 'processing' | 'completed' | 'failed' | 'retrieved') {
    this.props.status = value;
  }

  get base64(): string {
    return this.props.base64;
  }

  get title(): string {
    return this.props.title;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get status(): 'processing' | 'completed' | 'failed' | 'retrieved' {
    return this.props.status;
  }

  get userId(): string {
    return this.props.userId;
  }

  get userEmail(): string {
    return this.props.userEmail;
  }
}
