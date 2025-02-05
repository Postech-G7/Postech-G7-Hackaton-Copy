import { UserEntity } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { BadRequestError } from '../../../shared/application/errors/bad-request-error';
import { HashProviderContract } from '../../../shared/application/providers/hash-provider-interface';
import { UserOutputMapper } from '../dtos/user-output';
import { UserOutput } from '../dtos/user-output';
import { UseCase as DefaultUseCase } from '../../../shared/application/providers/usecases/use-case';
import { InvalidCredentialsError } from '../../../shared/application/errors/Invalid-credentials-error';

export namespace SigninUseCase {
  export type Input = {
    email: string;
    password: string;
  };

  export type Output = UserOutput;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private userRepository: UserRepository.Repository,
      private hashProvider: HashProviderContract
    ) {}

    async execute(input: Input): Promise<Output> {
      const { email, password } = input;

      if (!email || !password) {
        throw new BadRequestError('Input data not provided');
      }

      const entity = await this.userRepository.findByEmail(email);

      const isPasswordValid = await this.hashProvider.compareHash(
        password,
        entity.password
      );

      if (!isPasswordValid) {
        throw new InvalidCredentialsError('Invalid password');
      }
      return this.toOutput(entity);
    }

    private toOutput(entity: UserEntity): UserOutput {
      return UserOutputMapper.toOutput(entity);
    }
  }
}
