import View from '../core/view';

//type alias interface는 = 을 지우면 됨
export interface Store {
  currentPage: number;
  feeds: NewsFeed[]; // 생성한 newsFeed라는 형식이 들어가는 배열이라는 뜻
}
export interface News {
  readonly id: number;
  readonly time_ago: number;
  readonly title: string;
  readonly url: string;
  readonly user: string;
  readonly content: string;
}

export interface NewsFeed extends News {
  readonly comments_count: number;
  readonly points: number;
  read?: boolean; // optional 속성
}

export interface NewsDetail extends News {
  readonly comments: NewsComment[];
}

export interface NewsComment extends News {
  readonly comments: NewsComment[];
  readonly level: number;
}
export interface RouteInfo {
  path: string;
  page: View;
}
