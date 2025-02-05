//ACHO QUE NAO VAI PRECISAR
// import { VideoRepository } from '../../domain/repositories/video.repository';
// import { BadRequestError } from '../../../shared/application/errors/bad-request-error';
// import { UseCase as DefaultUseCase } from '../../../shared/application/providers/usecases/use-case';

// export namespace DeleteVideoUseCase {
//   export type Input = {
//     id: string;
//   };

//   export type Output = void;

//   export class UseCase implements DefaultUseCase<Input, Output> {
//     constructor(private videoRepository: VideoRepository.Repository) {}

//     async execute(input: Input): Promise<Output> {
//       const { id } = input;

//       if (!id) {
//         throw new BadRequestError('Input data not provided');
//       }

//       await this.videoRepository.delete(id); //Já joga o erro caso nao encontre a entidade pelo id
//     }
//   }
// }
