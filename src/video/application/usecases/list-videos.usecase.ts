import { VideoRepository } from '../../domain/repositories/video.repository';
import { VideoOutput, VideoOutputMapper } from '../dtos/video-output';
import { UseCase as DefaultUseCase } from '../../../shared/application/providers/usecases/use-case';
import { SearchInput } from '../../../shared/application/dtos/search-input';
import {
  PaginationOutput,
  PaginationOutputMapper,
} from '../../../shared/application/dtos/pagination-output';

export namespace ListVideosUseCase {
  export type Input = SearchInput<string>; //userId

  export type Output = PaginationOutput<VideoOutput>;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(private videoRepository: VideoRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const params = new VideoRepository.SearchParams(input);
      const searchResult = await this.videoRepository.search(params);
      return this.toOutput(searchResult);
    }

    private toOutput(searchResult: VideoRepository.SearchResult): Output {
      const items = searchResult.items.map(entity => {
        return VideoOutputMapper.toOutput(entity);
      });
      return PaginationOutputMapper.toOutput(items, searchResult);
    }
  }
}
