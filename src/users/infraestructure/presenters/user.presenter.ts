import { UserOutput } from '../../application/dtos/user-output';
import { Transform } from 'class-transformer';
import { CollectionPresenter } from '../../../shared/infraestructure/presenters/collection.presenter';
import { ListUsersUseCase } from '../../application/usecases/list-users.usecase';
import { ApiProperty } from '@nestjs/swagger';

export class UserPresenter {
  @ApiProperty({
    description: 'ID do usuário',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do usuário',
  })
  name: string;

  @ApiProperty({
    description: 'E-mail do usuário',
  })
  email: string;

  @ApiProperty({
    description: 'Data de criação do usuário',
  })
  @Transform(({ value }: { value: Date }) => value.toISOString())
  createdAt: Date;

  constructor(output: UserOutput) {
    this.id = output.id;
    this.name = output.name;
    this.email = output.email;
    this.createdAt = output.createdAt;
  }
}

export class UserCollectionPresenter extends CollectionPresenter {
  data: UserPresenter[];
  constructor(output: ListUsersUseCase.Output) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map(item => new UserPresenter(item));
  }
}
