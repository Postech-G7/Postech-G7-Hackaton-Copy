import { UserEntity } from '../../domain/entities/user.entity';

export interface UserOutput {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

export class UserOutputMapper {
  static toOutput(entity: UserEntity): UserOutput {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      password: entity.password,
      createdAt: entity.createdAt,
    };
  }
}
