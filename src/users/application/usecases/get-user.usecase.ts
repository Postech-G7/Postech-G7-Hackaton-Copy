import { UserRepository } from '../../domain/repositories/user.repository';
import { UserOutput, UserOutputMapper } from '../dtos/user-output';
import { BadRequestError } from '../../../shared/application/errors/bad-request-error';
import { UseCase as DefaultUseCase } from '../../../shared/application/providers/usecases/use-case';
import { UserEntity } from '../../domain/entities/user.entity';

export namespace GetUserUseCase {
  export type Input = {
    id: string;
  };

  export type Output = UserOutput;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(private userRepository: UserRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const { id } = input;

      if (!id) {
        throw new BadRequestError('Input data not provided');
      }

      const userEntity = await this.userRepository.findById(id);

      return this.toOutput(userEntity);
    }

    private toOutput(entity: UserEntity): UserOutput {
      return UserOutputMapper.toOutput(entity);
    }
  }
}
