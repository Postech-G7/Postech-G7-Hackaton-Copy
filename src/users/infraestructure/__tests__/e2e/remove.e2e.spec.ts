import { UserRepository } from '../../../domain/repositories/user.repository';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { UsersModule } from '../../users.module';
import request from 'supertest';
import { applyGlobalConfig } from '../../../../global-config';
import { UserEntity } from '../../../domain/entities/user.entity';
import { EnvConfigModule } from '../../../../shared/infraestructure/env-config/env-config.module';
import { DatabaseModule } from '../../../../shared/infraestructure/database/database.module';
import { userDataBuilder } from '../../../domain/testing/helpers/user-data-builder';
import { HashProviderContract } from '../../../../shared/application/providers/hash-provider-interface';
import { HashProvider } from '../../../../shared/application/providers/implementations/hash-provider';
import { InvalidCredentialsError } from '../../../../shared/application/errors/Invalid-credentials-error';
describe('UsersController e2e tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: UserRepository.Repository;
  const prismaService = new PrismaClient();
  let entity: UserEntity;
  let hashProvider: HashProviderContract;
  let hashPassword: string;
  let accessToken: string;
  let InvalidCredentialsErrorFilter: InvalidCredentialsError;

  beforeAll(async () => {
    //setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [
        EnvConfigModule,
        UsersModule,
        DatabaseModule.forTest(prismaService),
        InvalidCredentialsError,
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
      userDataBuilder({ email: 'a@a.com', password: hashPassword })
    );
    await repository.insert(entity);
    const loginResponse = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: 'a@a.com', password: '1234' });
    accessToken = loginResponse.body.accessToken;
  });
  describe('DELETE /users/:id', () => {
    it('should remove a user', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/users/${entity._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204)
        .expect({});
    });
    it('should return a error with 404 code when throw NotFoundError with invalid id', async () => {
      const res = await request(app.getHttpServer())
        .delete('/users/fakeId')
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
        .delete('/users/fakeId')
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        });
    });
  });
});
