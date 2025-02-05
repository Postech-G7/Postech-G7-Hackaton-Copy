import { UserRepository } from '../../domain/repositories/user.repository';
import { UserOutput, UserOutputMapper } from '../dtos/user-output';
import { BadRequestError } from '../../../shared/application/errors/bad-request-error';
import { UseCase as DefaultUseCase } from '../../../shared/application/providers/usecases/use-case';
import { UserEntity } from '../../domain/entities/user.entity';
import { InvalidPasswordError } from '../../../shared/application/errors/invalid-password-error';
import { HashProvider } from '../../../shared/application/providers/implementations/hash-provider';

export namespace UpdatePasswordUseCase {
  export type Input = {
    id: string;
    password: string;
    newPassword: string;
  };

  export type Output = UserOutput;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private userRepository: UserRepository.Repository,
      private hashProvider: HashProvider
    ) {}

    async execute(input: Input): Promise<Output> {
      const { id, password, newPassword } = input;

      if (!id) {
        throw new BadRequestError('Input data not provided');
      }

      if (!password || !newPassword) {
        throw new InvalidPasswordError(
          'Password and new password must be provided'
        );
      }

      const userEntity = await this.userRepository.findById(id);
      const isPasswordValid = await this.hashProvider.compareHash(
        password,
        userEntity.password
      );

      if (!isPasswordValid) {
        throw new InvalidPasswordError('Invalid password');
      }

      const newPassoworsIsEqualToOldPassword =
        await this.hashProvider.compareHash(
          newPassword,
          userEntity.password //hashed
        );

      if (newPassoworsIsEqualToOldPassword) {
        throw new InvalidPasswordError(
          'New password must be different than old password'
        );
      }

      const hashedPassword = await this.hashProvider.generateHash(newPassword);

      userEntity.updatePassword(hashedPassword);

      await this.userRepository.update(userEntity);

      return this.toOutput(userEntity);
    }

    private toOutput(entity: UserEntity): UserOutput {
      return UserOutputMapper.toOutput(entity);
    }
  }
}
