import { Controller, Get, INestApplication } from '@nestjs/common';
import { ConflictErrorFilter } from '../../conflict-error.filter';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictError } from '../../../../../domain/errors/conflict-error';
import request from 'supertest';

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new ConflictError('Conflicting data');
  }
}

describe('ConflictErrorFilter (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [StubController],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalFilters(new ConflictErrorFilter());
    await app.init();
  });

  it('should be defined', () => {
    expect(new ConflictErrorFilter()).toBeDefined();
  });

  it('should catch a ConflictError', () => {
    return request(app.getHttpServer()).get('/stub').expect(409).expect({
      statusCode: 409,
      error: 'ConflictError',
      message: 'Conflicting data',
    });
  });
});
