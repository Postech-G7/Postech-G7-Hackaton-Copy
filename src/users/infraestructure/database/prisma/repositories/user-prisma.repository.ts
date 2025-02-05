import { ConflictError } from '../../../../../shared/domain/errors/conflict-error';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found-error';
import { PrismaService } from '../../../../../shared/infraestructure/database/prisma/prisma.service';
import { UserEntity } from '../../../../domain/entities/user.entity';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import { UserModelMapper } from '../models/user-model.mapper';

export class UserPrismaRepository implements UserRepository.Repository {
  sortableFields: string[] = ['name', 'createdAt'];

  constructor(private prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity> {
    try {
      const model = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      });
      return UserModelMapper.toEntity(model);
    } catch (error) {
      throw new NotFoundError(`User not found for email provided ${email}`);
    }
  }

  async emailExists(email: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (user) {
      throw new ConflictError(`Email address already used`);
    }
  }

  //search params:
  //page: number;
  //perPage = 15;
  //sort: string | null; (name, createdAt)
  //sortDir: SortDirection | null; (asc, desc)
  //filter: Filter | null; ('marina')
  async search(
    props: UserRepository.SearchParams
  ): Promise<UserRepository.SearchResult> {
    const sortable = this.sortableFields?.includes(props.sort); //name or createdAt
    const orderByField = sortable ? props.sort : 'createdAt';
    const orderByDir = sortable ? props.sortDir : 'desc';
    const filter = props.filter || null;
    const count = await this.prismaService.user.count({
      ...(props.filter && {
        where: {
          name: {
            contains: filter,
            mode: 'insensitive', //case insensitive
          },
        },
      }),
    });

    const models = await this.prismaService.user.findMany({
      ...(props.filter && {
        where: {
          name: {
            contains: filter,
            mode: 'insensitive', //case insensitive
          },
        },
      }),
      orderBy: {
        [orderByField]: orderByDir,
      },
      skip: props.page && props.page > 0 ? (props.page - 1) * props.perPage : 1, //quantidade a ser pulada
      take: props.perPage,
    });

    return new UserRepository.SearchResult({
      items: models.map(model => UserModelMapper.toEntity(model)),
      total: count,
      currentPage: props.page,
      perPage: props.perPage,
      sort: props.sort,
      sortDir: props.sortDir,
      filter: props.filter,
    });
  }

  async insert(entity: UserEntity): Promise<void> {
    await this.prismaService.user.create({
      data: entity.toJson(),
    });
  }

  async update(entity: UserEntity): Promise<void> {
    await this._get(entity._id);
    await this.prismaService.user.update({
      data: entity.toJson(),
      where: {
        id: entity._id,
      },
    });
  }

  async findById(id: string): Promise<UserEntity> {
    return await this._get(id);
  }

  async findAll(): Promise<UserEntity[]> {
    const models = await this.prismaService.user.findMany();
    return models.map(model => UserModelMapper.toEntity(model));
  }

  async delete(id: string): Promise<void> {
    await this._get(id);
    await this.prismaService.user.delete({
      where: { id },
    });
  }

  protected async _get(id: string): Promise<UserEntity> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id,
        },
      });
      return UserModelMapper.toEntity(user);
    } catch (error) {
      throw new NotFoundError(`UserModel not found using ID ${id}`);
    }
  }
}
