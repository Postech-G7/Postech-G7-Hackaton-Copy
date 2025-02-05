import { Entity } from '../../../shared/domain/entities/entity';
import { SearchResult } from '../../../shared/domain/repositories/searchable-repository-contract';

export type PaginationOutput<Item> = {
  items: Item[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
};

type Filter = string | null;

export class PaginationOutputMapper {
  static toOutput<Item>(
    items: Item[],
    result: SearchResult<Entity, Filter>
  ): PaginationOutput<Item> {
    return {
      items,
      total: result.total,
      currentPage: result.currentPage,
      perPage: result.perPage,
      lastPage: result.lastPage,
    };
  }
}
