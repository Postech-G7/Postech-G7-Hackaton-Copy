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
import { UpdateUserDto } from '../../dtos/update-user.dto';
import { EnvConfigModule } from '../../../../shared/infraestructure/env-config/env-config.module';
import { userDataBuilder } from '../../../domain/testing/helpers/user-data-builder';
import { DatabaseModule } from '../../../../shared/infraestructure/database/database.module';
import { UserOutputMapper } from '../../../application/dtos/user-output';
import { HashProviderContract } from '../../../../shared/application/providers/hash-provider-interface';
import { HashProvider } from '../../../../shared/application/providers/implementations/hash-provider';

describe('UsersController e2e tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: UserRepository.Repository;
  let updateUserDto: UpdateUserDto;
  const prismaService = new PrismaClient();
  let entity: UserEntity;
  let hashProvider: HashProviderContract;
  let hashPassword: string;
  let accessToken: string;

  beforeAll(async () => {
    // setupPrismaTests()
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
    updateUserDto = {
      name: 'test name',
    };
    await prismaService.user.deleteMany();
    entity = new UserEntity(
      userDataBuilder({ email: 'a@a.com', password: hashPassword })
    );
    await repository.insert(entity);
    const loginResponse = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: 'a@a.com', password: '1234' });
    accessToken = loginResponse.body.accessToken;
  });

  describe('PUT /users/:id', () => {
    it('should update a user', async () => {
      updateUserDto.name = 'test name';
      const res = await request(app.getHttpServer())
        .put(`/users/${entity._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateUserDto)
        .expect(200);
      const user = await repository.findById(entity._id);
      const userOutput = UserOutputMapper.toOutput(user);
      const presenter = UsersController.userToResponse(userOutput);
      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual(serialized);
    });

    it('should return a error with 422 code when the request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .put(`/users/${entity._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'name should not be empty',
        'name must be a string',
      ]);
    });

    it('should return a error with 404 code when throw NotFoundError with invalid id', async () => {
      const res = await request(app.getHttpServer())
        .put('/users/fakeId')
        .send(updateUserDto)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)
        .expect({
          statusCode: 404,
          error: 'Not Found',
          message: 'UserModel not found using ID fakeId',
        });
    });
    it('should return a error with 401 code when the request is not authorized', async () => {
      const res = await request(app.getHttpServer())
        .put('/users/fakeId')
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        });
    });
  });
});
