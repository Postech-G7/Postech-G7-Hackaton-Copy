import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WrapperDataInterceptor } from './shared/infraestructure/interceptors/wrapper-data/wrapper-data.interceptor';
import { ConflictErrorFilter } from './shared/infraestructure/exception-filters/conflict-error/conflict-error.filter';
import { NotFoundErrorFilter } from './shared/infraestructure/exception-filters/not-found-error/not-found-error.filter';
import { InvalidPasswordErrorFilter } from './shared/infraestructure/exception-filters/invalid-password-error/invalid-password-error.filter';
import { InvalidCredentialsErrorFilter } from './shared/infraestructure/exception-filters/invalid-credentials-error/invalid-credentials-error.filter';

export function applyGlobalConfig(app: INestApplication) {
  //pipes/validations:
  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422, //erro padrao para dados mal formatados
      whitelist: true, //remove campos nao esperados
      forbidNonWhitelisted: true, //recusar a requisicao se encontrar campo nao esperado
      transform: true, //transformar dados para o tipo especificado nos schemas
    })
  );
  //interceptors:
  app.useGlobalInterceptors(
    new WrapperDataInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector))
  );

  //expectionFilters:
  app.useGlobalFilters(
    new ConflictErrorFilter(),
    new NotFoundErrorFilter(),
    new InvalidPasswordErrorFilter(),
    new InvalidCredentialsErrorFilter()
  );
}
