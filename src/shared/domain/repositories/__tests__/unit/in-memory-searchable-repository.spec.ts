import { userDataBuilder } from '../../../../../users/domain/testing/helpers/user-data-builder';
import { Entity } from '../../../../../shared/domain/entities/entity';
import { SearchableInMemoryRepository } from '../../in-memory-searchable-repository';
import {
  SearchParams,
  SearchResult,
} from '../../searchable-repository-contract';

const props = userDataBuilder();

type StubEntityProps = typeof props;
class StubEntity extends Entity<StubEntityProps> {}

type Filter = string;

class StubRepository extends SearchableInMemoryRepository<StubEntity, Filter> {
  sortableFields: string[] = ['name'];
  protected async applyFilter(
    items: StubEntity[],
    name: Filter
  ): Promise<StubEntity[]> {
    if (!name) {
      return items;
    }
    return items.filter(item =>
      item.props.name.toLocaleLowerCase().includes(name.toLocaleLowerCase())
    );
  }
}

let sut: StubRepository;
let entity = new StubEntity(props);

describe('SearchableInMemoryRepository unit tests', () => {
  beforeEach(() => {
    sut = new StubRepository();
    entity = new StubEntity(props);
  });

  describe('applyFilter', () => {
    it('should no filter items when filter param is null', async () => {
      const items = [entity];
      const spyFilterMethod = jest.spyOn(items, 'filter');
      const filtered = await sut['applyFilter'](items, null);
      expect(filtered).toStrictEqual(items);
      expect(spyFilterMethod).not.toHaveBeenCalled();
    });
    it('should filter items when filter param is not null', async () => {
      const newProps1 = userDataBuilder();
      const newProps2 = userDataBuilder();
      const newProps3 = userDataBuilder();
      const items = [
        entity,
        new StubEntity(newProps1),
        new StubEntity(newProps2),
        new StubEntity(newProps3),
      ];
      const spyFilterMethod = jest.spyOn(items, 'filter');

      const filtered = await sut['applyFilter'](items, entity.props.name);
      expect(filtered).toStrictEqual([entity]);
      expect(spyFilterMethod).toHaveBeenCalledTimes(1);

      const filteredUpperCase = await sut['applyFilter'](
        items,
        entity.props.name.toUpperCase()
      );
      expect(filteredUpperCase).toStrictEqual([entity]);
      expect(spyFilterMethod).toHaveBeenCalledTimes(2);

      const filteredLowerCase = await sut['applyFilter'](
        items,
        entity.props.name.toLowerCase()
      );
      expect(filteredLowerCase).toStrictEqual([entity]);
      expect(spyFilterMethod).toHaveBeenCalledTimes(3);

      const filteredWithoutItemsResult = await sut['applyFilter'](
        items,
        'fake'
      );
      expect(filteredWithoutItemsResult).toStrictEqual([]);
      expect(spyFilterMethod).toHaveBeenCalledTimes(4);

      const filteredWithoutItems = await sut['applyFilter']([], 'fake');
      expect(filteredWithoutItems).toStrictEqual([]);
      expect(spyFilterMethod).toHaveBeenCalledTimes(4);
    });
  });
  describe('applySort', () => {
    it('should not apply sort to items when sort param is null', async () => {
      const entityA = new StubEntity({ ...entity.props, name: 'A' });
      const entityB = new StubEntity({ ...entity.props, name: 'B' });
      const entityC = new StubEntity({ ...entity.props, name: 'C' });
      const items = [entityB, entityC, entityA];
      const sortedItems = await sut['applySort'](items, null, null);
      expect(sortedItems).toStrictEqual(items);
    });
    it('should not apply sort to items when sort param is not allowed', async () => {
      const entityA = new StubEntity({ ...entity.props, name: 'A' });
      const entityB = new StubEntity({ ...entity.props, name: 'B' });
      const entityC = new StubEntity({ ...entity.props, name: 'C' });
      const items = [entityB, entityC, entityA];
      const sortedItems = await sut['applySort'](items, 'fake', null);
      expect(sortedItems).toStrictEqual(items);
    });

    it('should apply desc sort to items when sort param is allowed and sortDir is null', async () => {
      const entityA = new StubEntity({ ...entity.props, name: 'A' });
      const entityB = new StubEntity({ ...entity.props, name: 'B' });
      const entityC = new StubEntity({ ...entity.props, name: 'C' });
      const items = [entityB, entityC, entityA];
      const sortedItems = await sut['applySort'](items, 'name', null);
      expect(sortedItems).toStrictEqual([entityC, entityB, entityA]);
    });

    it('should apply asc sort to items when sort param is allowed and sortDir is asc', async () => {
      const entityA = new StubEntity({ ...entity.props, name: 'A' });
      const entityB = new StubEntity({ ...entity.props, name: 'B' });
      const entityC = new StubEntity({ ...entity.props, name: 'C' });
      const items = [entityB, entityC, entityA];
      const sortedItems = await sut['applySort'](items, 'name', 'asc');
      expect(sortedItems).toStrictEqual([entityA, entityB, entityC]);
    });
  });
  describe('applyPagination', () => {
    it('should apply pagination to items', async () => {
      const entityA = new StubEntity({ ...entity.props, name: 'A' });
      const entityB = new StubEntity({ ...entity.props, name: 'B' });
      const entityC = new StubEntity({ ...entity.props, name: 'C' });
      const entityD = new StubEntity({ ...entity.props, name: 'D' });
      const entityE = new StubEntity({ ...entity.props, name: 'E' });
      const items = [entityA, entityB, entityC, entityD, entityE];
      const paginatedItems = await sut['applyPagination'](items, 2, 2);
      expect(paginatedItems).toStrictEqual([entityC, entityD]);

      const paginatedItemsLastPage = await sut['applyPagination'](items, 3, 2);
      expect(paginatedItemsLastPage).toStrictEqual([entityE]);

      const paginatedWithoutNextPage = await sut['applyPagination'](
        items,
        4,
        2
      );
      expect(paginatedWithoutNextPage).toStrictEqual([]);
    });
  });

  describe('search', () => {
    it('should apply only pagination when other params are null', async () => {
      const entity = new StubEntity(userDataBuilder());
      const items = Array(16).fill(entity);
      sut.items = items;
      const params = new SearchParams<string>({});
      const searchResultParams = await sut.search(params);
      expect(sut).toBeDefined();
      expect(searchResultParams).toStrictEqual(
        new SearchResult({
          items: Array(15).fill(entity),
          total: 16,
          currentPage: 1,
          perPage: 15,
          sort: null,
          sortDir: null,
          filter: null,
        })
      );
      expect(searchResultParams.items).toHaveLength(15);
      expect(searchResultParams.total).toBe(16);
      expect(searchResultParams.lastPage).toBe(2);
      expect(searchResultParams.currentPage).toBe(1);
      expect(searchResultParams.perPage).toBe(15);
      expect(searchResultParams.sort).toBeNull();
      expect(searchResultParams.sortDir).toBeNull();
      expect(searchResultParams.filter).toBeNull();
    });
    it('should apply only pagination when other params are null', async () => {
      const entity = new StubEntity(userDataBuilder());
      const items = Array(16).fill(entity);
      sut.items = items;
      const params = new SearchParams({
        page: 2,
        perPage: 2,
        sort: null,
        sortDir: null,
        filter: null,
      });
      const paginatedItems = await sut.search(params);
      expect(sut).toBeDefined();
      expect(paginatedItems.items).toHaveLength(2);
      expect(paginatedItems.total).toBe(16);
      expect(paginatedItems.lastPage).toBe(8);
      expect(paginatedItems.currentPage).toBe(2);
      expect(paginatedItems.perPage).toBe(2);
      expect(paginatedItems.sort).toBeNull();
      expect(paginatedItems.sortDir).toBeNull();
      expect(paginatedItems.filter).toBeNull();
    });

    it('should only paginate and filter', async () => {
      const entity1 = new StubEntity(userDataBuilder());
      const entity2 = new StubEntity(userDataBuilder());
      const entity3 = new StubEntity(userDataBuilder());
      const items = [entity1, entity2, entity3];
      sut.items = items;
      const params = new SearchParams({
        page: 1,
        perPage: 2,
        sort: null,
        sortDir: null,
        filter: entity1.props.name,
      });
      const paginatedAndFilteredItems = await sut.search(params);
      expect(sut).toBeDefined();
      expect(paginatedAndFilteredItems.items).toHaveLength(1);
      expect(paginatedAndFilteredItems.total).toBe(1);
      expect(paginatedAndFilteredItems.lastPage).toBe(1);
      expect(paginatedAndFilteredItems.currentPage).toBe(1);
      expect(paginatedAndFilteredItems.perPage).toBe(2);
      expect(paginatedAndFilteredItems.sort).toBeNull();
      expect(paginatedAndFilteredItems.sortDir).toBeNull();
      expect(paginatedAndFilteredItems.filter).toEqual(entity1.props.name);
    });
    it('should only paginate and sort page 1', async () => {
      const entity1 = new StubEntity(userDataBuilder({ name: 'A' }));
      const entity2 = new StubEntity(userDataBuilder({ name: 'B' }));
      const entity3 = new StubEntity(userDataBuilder({ name: 'C' }));
      const items = [entity1, entity2, entity3];
      sut.items = items;
      const params = new SearchParams({
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: null,
      });
      const paginatedAndSortedItems = await sut.search(params);
      expect(sut).toBeDefined();
      expect(paginatedAndSortedItems.items).toHaveLength(2);
      expect(paginatedAndSortedItems.total).toBe(3);
      expect(paginatedAndSortedItems.lastPage).toBe(2);
      expect(paginatedAndSortedItems.currentPage).toBe(1);
      expect(paginatedAndSortedItems.perPage).toBe(2);
      expect(paginatedAndSortedItems.items[0].props.name).toBe('A');
      expect(paginatedAndSortedItems.items[1].props.name).toBe('B');
    });
    it('should only paginate and sort last page', async () => {
      const entity1 = new StubEntity(userDataBuilder({ name: 'A' }));
      const entity2 = new StubEntity(userDataBuilder({ name: 'B' }));
      const entity3 = new StubEntity(userDataBuilder({ name: 'C' }));
      const items = [entity1, entity2, entity3];
      sut.items = items;
      const params = new SearchParams({
        page: 2,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: null,
      });
      const paginatedAndSortedItems = await sut.search(params);
      expect(sut).toBeDefined();
      expect(paginatedAndSortedItems.items).toHaveLength(1);
      expect(paginatedAndSortedItems.total).toBe(3);
      expect(paginatedAndSortedItems.lastPage).toBe(2);
      expect(paginatedAndSortedItems.currentPage).toBe(2);
      expect(paginatedAndSortedItems.perPage).toBe(2);
      expect(paginatedAndSortedItems.items[0].props.name).toBe('C');
    });
    it('should only paginate and sort without sortDir', async () => {
      const entity1 = new StubEntity(userDataBuilder({ name: 'A' }));
      const entity2 = new StubEntity(userDataBuilder({ name: 'B' }));
      const entity3 = new StubEntity(userDataBuilder({ name: 'C' }));
      const items = [entity1, entity2, entity3];
      sut.items = items;
      const params = new SearchParams({
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDir: null,
        filter: null,
      });
      const paginatedAndSortedItems = await sut.search(params);
      expect(sut).toBeDefined();
      expect(paginatedAndSortedItems.items).toHaveLength(2);
      expect(paginatedAndSortedItems.total).toBe(3);
      expect(paginatedAndSortedItems.lastPage).toBe(2);
      expect(paginatedAndSortedItems.currentPage).toBe(1);
      expect(paginatedAndSortedItems.perPage).toBe(2);
      expect(paginatedAndSortedItems.items[0].props.name).toBe('C');
      expect(paginatedAndSortedItems.items[1].props.name).toBe('B');
    });
    it('should paginate, sort and filter', async () => {
      const entity1 = new StubEntity(userDataBuilder({ name: 'A' }));
      const entity2 = new StubEntity(userDataBuilder({ name: 'B1' }));
      const entity3 = new StubEntity(userDataBuilder({ name: 'B2' }));
      const entity4 = new StubEntity(userDataBuilder({ name: 'C' }));
      const items = [entity1, entity2, entity3, entity4];
      sut.items = items;
      const params = new SearchParams({
        page: 1,
        perPage: 1,
        sort: 'name',
        sortDir: 'asc',
        filter: 'B',
      });
      const paginatedAndSortedItems = await sut.search(params);
      expect(sut).toBeDefined();
      expect(paginatedAndSortedItems.items).toHaveLength(1);
      expect(paginatedAndSortedItems.total).toBe(2);
      expect(paginatedAndSortedItems.lastPage).toBe(2);
      expect(paginatedAndSortedItems.currentPage).toBe(1);
      expect(paginatedAndSortedItems.perPage).toBe(1);
      expect(paginatedAndSortedItems.items[0].props.name).toBe('B1');
    });
  });
});
