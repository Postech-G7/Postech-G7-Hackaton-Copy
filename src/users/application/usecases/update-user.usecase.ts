import { UserRepository } from '../../domain/repositories/user.repository';
import { UserOutput, UserOutputMapper } from '../dtos/user-output';
import { BadRequestError } from '../../../shared/application/errors/bad-request-error';
import { UseCase as DefaultUseCase } from '../../../shared/application/providers/usecases/use-case';
import { UserEntity } from '../../domain/entities/user.entity';

export namespace UpdateUserUseCase {
  export type Input = {
    id: string;
    name: string;
  };

  export type Output = UserOutput;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(private userRepository: UserRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const { id, name } = input;

      if (!id || !name) {
        throw new BadRequestError('Input data not provided');
      }

      const userEntity = await this.userRepository.findById(id); //Já joga o erro caso nao encontre a entidade pelo id

      userEntity.updateName(name);

      await this.userRepository.update(userEntity);

      const updatedUser = await this.userRepository.findById(id);

      return this.toOutput(updatedUser);
    }

    private toOutput(entity: UserEntity): UserOutput {
      return UserOutputMapper.toOutput(entity);
    }
  }
}
