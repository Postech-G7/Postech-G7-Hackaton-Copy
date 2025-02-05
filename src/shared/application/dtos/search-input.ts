import { SortDirection } from '../../../shared/domain/repositories/searchable-repository-contract';

export type SearchInput<Filter> = {
  page?: number;
  perPage?: number;
  sort?: string | null;
  sortDir?: SortDirection | null;
  filter?: Filter | null;
};
