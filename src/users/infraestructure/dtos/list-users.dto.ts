import { SortDirection } from '../../../shared/domain/repositories/searchable-repository-contract';
import { ListUsersUseCase } from '../../application/usecases/list-users.usecase';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ListUsersDto implements ListUsersUseCase.Input {
  @ApiPropertyOptional({
    description: 'Página a ser retornada',
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Quantidade de registros por página',
  })
  @IsOptional()
  perPage?: number;

  @ApiPropertyOptional({
    description: 'Atributo definido para ordenar os dados',
  })
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional({
    description: 'Direção da ordenação: crescente ou decrescente',
  })
  @IsOptional()
  sortDir?: SortDirection;

  @ApiPropertyOptional({
    description: 'Valor do atributo usado para filtrar os dados',
  })
  @IsOptional()
  filter?: string;
}
