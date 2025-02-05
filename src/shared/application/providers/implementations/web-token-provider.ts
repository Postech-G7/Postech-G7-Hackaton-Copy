// import { ConflictError } from 'src/shared/domain/errors/conflict-error';
// import { WebTokenProviderInterface } from '../web-token-provider-interface';
// import { BadRequestError } from '../../errors/bad-request-error';
// import * as jwt from 'jsonwebtoken';

// export class WebTokenProvider implements WebTokenProviderInterface {
//   decode<T>(token: string): T {
//     if (!token) {
//       throw new BadRequestError('Token not provided');
//     }

//     const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as T;

//     return decodedToken;
//   }
// }
