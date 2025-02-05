import { NotFoundError } from '../../../../../shared/domain/errors/not-found-error';
import { PrismaService } from '../../../../../shared/infraestructure/database/prisma/prisma.service';
import { VideoEntity } from '../../../../domain/entities/video.entity';
import { VideoRepository } from '../../../../domain/repositories/video.repository';
import { VideoModelMapper } from '../models/video-model.mapper';

export class VideoPrismaRepository implements VideoRepository.Repository {
  sortableFields: string[] = ['userId', 'createdAt'];

  constructor(private prismaService: PrismaService) {}

  async search(
    props: VideoRepository.SearchParams
  ): Promise<VideoRepository.SearchResult> {
    const sortable = this.sortableFields?.includes(props.sort);
    const orderByField = sortable ? props.sort : 'createdAt';
    const orderByDir = sortable ? props.sortDir : 'desc';
    const filter = props.filter || null;
    const count = await this.prismaService.video.count({
      ...(props.filter && {
        where: {
          userId: {
            equals: filter,
          },
        },
      }),
    });
    const models = await this.prismaService.video.findMany({
      ...(props.filter && {
        where: {
          userId: {
            equals: filter,
          },
        },
      }),
      orderBy: {
        [orderByField]: orderByDir,
      },
      skip: props.page && props.page > 0 ? (props.page - 1) * props.perPage : 1, //quantidade a ser pulada
      take: props.perPage,
    });

    return new VideoRepository.SearchResult({
      items: models.map(model => VideoModelMapper.toEntity(model)),
      total: count,
      currentPage: props.page,
      perPage: props.perPage,
      sort: props.sort,
      sortDir: props.sortDir,
      filter: props.filter,
    });
  }

  async insert(entity: VideoEntity): Promise<void> {
    await this.prismaService.video.create({
      data: entity.toJson(),
    });
  }

  async update(entity: VideoEntity): Promise<void> {
    await this._get(entity._id);
    await this.prismaService.video.update({
      data: entity.toJson(),
      where: {
        id: entity._id,
      },
    });
  }

  async findById(id: string): Promise<VideoEntity> {
    return await this._get(id);
  }

  async findAll(): Promise<VideoEntity[]> {
    const models = await this.prismaService.video.findMany();
    return models.map(model => VideoModelMapper.toEntity(model));
  }

  async delete(id: string): Promise<void> {
    await this._get(id);
    await this.prismaService.video.delete({
      where: { id },
    });
  }

  protected async _get(id: string): Promise<VideoEntity> {
    try {
      const video = await this.prismaService.video.findUnique({
        where: {
          id,
        },
      });
      return VideoModelMapper.toEntity(video);
    } catch (error) {
      throw new NotFoundError(`Video not found using ID ${id}`);
    }
  }
}
