import { UserEntity } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { BadRequestError } from '../../../shared/application/errors/bad-request-error';
import { HashProvider } from '../../../shared/application/providers/hash-provider';
import { UserOutputMapper } from '../dtos/user-output';
import { UserOutput } from '../dtos/user-output';
import { UseCase as DefaultUseCase } from '../../../shared/application/providers/usecases/use-case';

export namespace SignupUseCase {
  export type Input = {
    name: string;
    email: string;
    password: string;
  };

  export type Output = UserOutput;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private userRepository: UserRepository.Repository,
      private hashProvider: HashProvider
    ) {}

    async execute(input: Input): Promise<Output> {
      const { email, password, name } = input;

      if (!email || !password || !name) {
        throw new BadRequestError('Input data not provided');
      }

      await this.userRepository.emailExists(email);

      const hashedPassword = await this.hashProvider.generateHash(password);

      const userEntity = new UserEntity(
        Object.assign(input, {
          password: hashedPassword,
        })
      );

      await this.userRepository.insert(userEntity);

      return UserOutputMapper.toOutput(userEntity);
    }
  }
}
