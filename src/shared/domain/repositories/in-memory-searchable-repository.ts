import { Entity } from '../entities/entity';
import { InMemoryRepository } from './in-memory-repository';
import {
  SearchableRepositoryInterface,
  SearchParams,
  SearchResult,
} from './searchable-repository-contract';

export abstract class SearchableInMemoryRepository<E extends Entity, Filter>
  extends InMemoryRepository<E>
  implements
    SearchableRepositoryInterface<
      E,
      Filter,
      SearchParams<Filter>,
      SearchResult<E, Filter>
    >
{
  abstract sortableFields: string[];

  async search(params: SearchParams<Filter>): Promise<SearchResult<E, Filter>> {
    const itemsFiltered = await this.applyFilter(this.items, params.filter);
    const itemsSorted = await this.applySort(
      itemsFiltered,
      params.sort,
      params.sortDir
    );
    const itemsPaginated = await this.applyPagination(
      itemsSorted,
      params.page,
      params.perPage
    );
    return new SearchResult({
      items: itemsPaginated,
      total: itemsFiltered.length,
      currentPage: params.page,
      perPage: params.perPage,
      sort: params.sort,
      sortDir: params.sortDir,
      filter: params.filter,
    });
  }

  protected abstract applyFilter(
    items: E[],
    filter: Filter | null
  ): Promise<E[]>;

  protected async applySort(
    items: E[],
    sort: SearchParams<Filter>['sort'] | null,
    sortDir: SearchParams<Filter>['sortDir']
  ): Promise<E[]> {
    if (!sort || !this.sortableFields.includes(sort)) {
      return items;
    }
    return [...items].sort((entityA: E, entityB: E) => {
      if (entityA.props[sort] < entityB.props[sort]) {
        return sortDir === 'asc' ? -1 : 1;
      }
      if (entityA.props[sort] > entityB.props[sort]) {
        return sortDir === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  protected async applyPagination(
    items: E[],
    page: SearchParams<string>['page'],
    perPage: SearchParams<string>['perPage']
  ): Promise<E[]> {
    const start = (page - 1) * perPage;
    const limit = start + perPage;
    return items.slice(start, limit);
  }
}
