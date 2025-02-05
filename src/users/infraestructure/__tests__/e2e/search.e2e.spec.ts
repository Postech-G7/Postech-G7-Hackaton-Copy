import { UserRepository } from '../../../domain/repositories/user.repository';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { UsersModule } from '../../users.module';
import request from 'supertest';
import { UsersController } from '../../users.controller';
import { instanceToPlain } from 'class-transformer';
import { applyGlobalConfig } from '../../../../global-config';
import { UserEntity } from '../../../domain/entities/user.entity';
import { EnvConfigModule } from '../../../../shared/infraestructure/env-config/env-config.module';
import { DatabaseModule } from '../../../../shared/infraestructure/database/database.module';
import { userDataBuilder } from '../../../domain/testing/helpers/user-data-builder';
import { HashProviderContract } from '../../../../shared/application/providers/hash-provider-interface';
import { HashProvider } from '../../../../shared/application/providers/implementations/hash-provider';
describe('UsersController e2e tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: UserRepository.Repository;
  const prismaService = new PrismaClient();
  let hashProvider: HashProviderContract;
  let hashPassword: string;
  let accessToken: string;
  let entity: UserEntity;

  beforeAll(async () => {
    //setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [
        EnvConfigModule,
        UsersModule,
        DatabaseModule.forTest(prismaService),
      ],
    }).compile();
    app = module.createNestApplication();
    applyGlobalConfig(app);
    await app.init();
    repository = module.get<UserRepository.Repository>('UserRepository');
    hashProvider = new HashProvider();
    hashPassword = await hashProvider.generateHash('1234');
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany();

    entity = new UserEntity(
      userDataBuilder({
        email: 'a@a.com',
        password: hashPassword,
      })
    );
    await repository.insert(entity);

    const loginResponse = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: 'a@a.com', password: '1234' })
      .expect(200);
    accessToken = loginResponse.body.accessToken;
  });
  describe('GET /users', () => {
    it('should return the users ordered by createdAt', async () => {
      const createdAt = new Date();
      const entities: UserEntity[] = [];
      const arrange = Array(3).fill(userDataBuilder({}));
      arrange.forEach((element, index) => {
        entities.push(
          new UserEntity({
            ...element,
            email: `a${index}@a.com`,
            createdAt: new Date(createdAt.getTime() + index),
          })
        );
      });
      await prismaService.user.deleteMany();
      await prismaService.user.createMany({
        data: entities.map(item => item.toJson()),
      });
      const searchParams = {};
      const queryParams = new URLSearchParams(searchParams as any).toString();
      const res = await request(app.getHttpServer())
        .get(`/users/?${queryParams}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(Object.keys(res.body)).toStrictEqual(['data', 'meta']);
      expect(res.body).toStrictEqual({
        data: [...entities]
          .reverse()
          .map(item => instanceToPlain(UsersController.userToResponse(item))),
        meta: {
          total: 3,
          currentPage: 1,
          perPage: 15,
          lastPage: 1,
        },
      });
    });

    it('should return the users ordered by createdAt', async () => {
      const entities: UserEntity[] = [];
      const arrange = ['test', 'a', 'TEST', 'b', 'TeSt'];
      arrange.forEach((element, index) => {
        entities.push(
          new UserEntity({
            ...userDataBuilder({}),
            name: element,
            email: `a${index}@a.com`,
          })
        );
      });
      await prismaService.user.createMany({
        data: entities.map(item => item.toJson()),
      });
      const searchParams = {
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: 'TEST',
      };
      const queryParams = new URLSearchParams(searchParams as any).toString();
      const res = await request(app.getHttpServer())
        .get(`/users/?${queryParams}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(Object.keys(res.body)).toStrictEqual(['data', 'meta']);
      expect(res.body).toStrictEqual({
        data: [entities[0], entities[4]].map(item =>
          instanceToPlain(UsersController.userToResponse(item))
        ),
        meta: {
          total: 3,
          currentPage: 1,
          perPage: 2,
          lastPage: 2,
        },
      });
    });

    it('should return a error with 422 code when the query params is invalid', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/?fakeId=10')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual(['property fakeId should not exist']);
    });

    it('should return a error with 401 code when the request is not authorized', async () => {
      const res = await request(app.getHttpServer())
        .get('/users')
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        });
    });
  });
});
