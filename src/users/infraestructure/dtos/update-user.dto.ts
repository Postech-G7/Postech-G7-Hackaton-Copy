import { UpdateUserUseCase } from '../../application/usecases/update-user.usecase';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto implements Omit<UpdateUserUseCase.Input, 'id'> {
  @ApiProperty({
    description: 'Novo Nome do usuário',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
