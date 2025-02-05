import { PrismaClient } from '@prisma/client';
import { UserPrismaRepository } from '../../user-prisma.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundError } from '../../../../../../../shared/domain/errors/not-found-error';
import { UserEntity } from '../../../../../../domain/entities/user.entity';
import { userDataBuilder } from '../../../../../../domain/testing/helpers/user-data-builder';
import { DatabaseModule } from '../../../../../../../shared/infraestructure/database/database.module';
import { UserRepository } from '../../../../../../domain/repositories/user.repository';
import { ConflictError } from '../../../../../../../shared/domain/errors/conflict-error';

describe('UserPrismaRepository integration tests', () => {
  const prismaService = new PrismaClient();
  let sut: UserPrismaRepository;
  let module: TestingModule;

  beforeAll(async () => {
    //setupPrismaTests();
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile();
  });

  beforeEach(async () => {
    sut = new UserPrismaRepository(prismaService as any);
    await prismaService.user.deleteMany();
  });

  it('should throw error when entity not found by id', async () => {
    await expect(() => sut.findById('FakeId')).rejects.toThrow(
      new NotFoundError('UserModel not found using ID FakeId')
    );
  });

  it('should find a entity by email', async () => {
    const entity = new UserEntity(userDataBuilder({ email: 'a@a.com' }));
    await prismaService.user.create({
      data: entity.toJson(),
    });
    const output = await sut.findByEmail('a@a.com');
    expect(output.toJson()).toStrictEqual(entity.toJson());
  });

  it('should throw error when a entity not found by email', async () => {
    const entity = new UserEntity(userDataBuilder({ email: 'a@a.com' }));
    await prismaService.user.create({
      data: entity.toJson(),
    });
    await expect(() => sut.emailExists('a@a.com')).rejects.toThrow(
      new ConflictError(`Email address already used`)
    );
  });

  it('should find an entity by id', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    const newUser = await prismaService.user.create({
      data: entity.toJson(),
    });
    const output = await sut.findById(newUser.id);
    expect(output.toJson()).toStrictEqual(entity.toJson());
  });

  it('should insert a new entity', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    await sut.insert(entity);

    const createdUser = await prismaService.user.findUnique({
      where: { id: entity.id },
    });
    expect(createdUser).toStrictEqual(entity.toJson());
  });

  it('should find all entities', async () => {
    const entity1 = new UserEntity(userDataBuilder({}));
    const entity2 = new UserEntity(userDataBuilder({}));

    await sut.insert(entity1);
    await sut.insert(entity2);
    const entities = await sut.findAll();
    expect(entities).toHaveLength(2);
    expect(entities).toContainEqual(entity1);
    expect(entities).toContainEqual(entity2);
  });

  it('should find entities by email', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    await sut.insert(entity);
    const entities = await sut.findByEmail(entity.email);
    expect(entities).toStrictEqual(entity);
  });

  it('should throw error when email not found', async () => {
    await expect(() => sut.findByEmail('FakeEmail')).rejects.toThrow(
      new NotFoundError('User not found for email provided FakeEmail')
    );
  });

  it('should throw error on update when a entity not found', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    await expect(() => sut.update(entity)).rejects.toThrow(
      new NotFoundError(`UserModel not found using ID ${entity._id}`)
    );
  });

  it('should update a entity', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    await prismaService.user.create({
      data: entity.toJson(),
    });
    entity.updateName('new name');
    await sut.update(entity);
    const output = await prismaService.user.findUnique({
      where: {
        id: entity._id,
      },
    });
    expect(output.name).toBe('new name');
  });

  it('should throw error on delete when a entity not found', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    await expect(() => sut.delete(entity._id)).rejects.toThrow(
      new NotFoundError(`UserModel not found using ID ${entity._id}`)
    );
  });
  it('should delete a entity', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    await prismaService.user.create({
      data: entity.toJson(),
    });
    await sut.delete(entity._id);
    const output = await prismaService.user.findUnique({
      where: {
        id: entity._id,
      },
    });
    expect(output).toBeNull();
  });

  describe('search method tests', () => {
    it('should apply only pagination when the other params are null', async () => {
      const createdAt = new Date();
      const entities: UserEntity[] = [];
      const arrange = Array(16).fill(userDataBuilder({}));
      arrange.forEach((element, index) => {
        entities.push(
          new UserEntity({
            ...element,
            email: `test${index}@mail.com`,
            createdAt: new Date(createdAt.getTime() + index),
          })
        );
      });

      await prismaService.user.createMany({
        data: entities.map(item => item.toJson()),
      });

      const searchOutput = await sut.search(new UserRepository.SearchParams());

      expect(searchOutput).toBeInstanceOf(UserRepository.SearchResult);
      expect(searchOutput.total).toBe(16);
      expect(searchOutput.items.length).toBe(15);
      searchOutput.items.forEach(item => {
        expect(item).toBeInstanceOf(UserEntity);
      });
    });
    it('should search using filter, sort and paginate', async () => {
      const createdAt = new Date();
      const entities: UserEntity[] = [];
      const arrange = ['test', 'a', 'TEST', 'b', 'TeSt'];
      arrange.forEach((element, index) => {
        entities.push(
          new UserEntity({
            ...userDataBuilder({ name: element }),
            createdAt: new Date(createdAt.getTime() + index),
          })
        );
      });

      await prismaService.user.createMany({
        data: entities.map(item => item.toJson()),
      });

      const searchOutputPage1 = await sut.search(
        new UserRepository.SearchParams({
          page: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
          filter: 'TEST',
        })
      );

      expect(searchOutputPage1.items[0].toJson()).toMatchObject(
        entities[0].toJson()
      );
      expect(searchOutputPage1.items[1].toJson()).toMatchObject(
        entities[4].toJson()
      );

      const searchOutputPage2 = await sut.search(
        new UserRepository.SearchParams({
          page: 2,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
          filter: 'TEST',
        })
      );

      expect(searchOutputPage2.items[0].toJson()).toMatchObject(
        entities[2].toJson()
      );
    });
  });
});
