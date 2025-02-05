import { VideoEntity, VideoProps } from '../entities/video.entity';
import {
  SearchableRepositoryInterface,
  SearchParams as DefaultSearchParams,
  SearchResult as DefaultSearchResult,
} from '../../../shared/domain/repositories/searchable-repository-contract';

export namespace VideoRepository {
  export type Filter = string;

  export class SearchParams extends DefaultSearchParams<Filter> {}

  export class SearchResult extends DefaultSearchResult<VideoEntity, Filter> {}

  export interface Repository
    extends SearchableRepositoryInterface<
      VideoEntity,
      string,
      SearchParams,
      SearchResult
    > {}
}
