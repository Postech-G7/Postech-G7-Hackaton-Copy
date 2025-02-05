import { UserEntity } from '../../../../domain/entities/user.entity';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found-error';
import { SearchableInMemoryRepository } from '../../../../../shared/domain/repositories/in-memory-searchable-repository';
import { SortDirection } from '../../../../../shared/domain/repositories/searchable-repository-contract';
import { ConflictError } from '../../../../../shared/domain/errors/conflict-error';

export class UserInMemoryRepository
  extends SearchableInMemoryRepository<UserEntity, string>
  implements UserRepository.Repository
{
  sortableFields: string[] = ['name', 'createdAt'];
  async findByEmail(email: string): Promise<UserEntity> {
    const entity = this.items.find(item => item.email === email);
    if (!entity) {
      throw new NotFoundError(`User not found for email provided ${email}`);
    }
    return entity;
  }
  async emailExists(email: string): Promise<void> {
    const user = this.items.find(item => item.email === email);
    if (user) {
      throw new ConflictError('Email already exists');
    }
  }

  protected async applyFilter(
    items: UserEntity[],
    filter: UserRepository.Filter | null
  ): Promise<UserEntity[]> {
    if (!filter) {
      return items;
    }
    return items.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }

  protected async applySort(
    items: UserEntity[],
    sort: string | null,
    sortDir: SortDirection | null
  ): Promise<UserEntity[]> {
    if (!sort || !this.sortableFields.includes(sort)) {
      return super.applySort(items, 'createdAt', 'desc');
    }
    return super.applySort(items, sort, sortDir);
  }
}
