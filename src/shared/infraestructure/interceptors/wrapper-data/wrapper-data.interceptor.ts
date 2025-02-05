import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class WrapperDataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(body => {
        console.log('wrapperDataInterceptor.body', body);
        const isBodyNull = !body;
        const isMetaAttributeDefined = body && 'meta' in body;
        const isAccessToken = body && 'accessToken' in body;
        console.log(
          'wrapperDataInterceptor.isBodyNull',
          isBodyNull,
          'wrapperDataInterceptor.isMetaAttributeDefined',
          isMetaAttributeDefined,
          'wrapperDataInterceptor.isAccessToken',
          isAccessToken
        );
        return isBodyNull || isMetaAttributeDefined || isAccessToken
          ? body
          : { data: body };
      })
    );
  }
}
//O operador map recebe o valor que está sendo emitido pelo Observable. Normalmente, em um contexto de uma requisição HTTP, esse valor é o body da resposta. Portanto, quando você faz map(body => { ... }), você está lidando com o body da resposta que foi gerada pelo manipulador de rota.
