import { ValidationError } from '../../../../../shared/domain/errors/validation-error';
import { UserEntity } from '../../../../domain/entities/user.entity';
import { User } from '@prisma/client';

export class UserModelMapper {
  static toEntity(model: User) {
    const { name, email, password, createdAt } = model;
    const entity = {
      name,
      email,
      password,
      createdAt,
    };
    try {
      return new UserEntity(entity, model.id);
    } catch (error) {
      throw new ValidationError('Entity not loaded');
    }
  }
}
