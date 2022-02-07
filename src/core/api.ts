import { NewsFeed, NewsDetail } from '../types';
// 공통요소로 네트워크로 api를 호출
export class Api {
  // 내부 저장
  url: string;
  ajax: XMLHttpRequest;
  // 클래스는 초기화 과정이 필요 url, XMLHttpRequest
  // instance 객체에 저장
  constructor(url: string) {
    this.url = url;
    this.ajax = new XMLHttpRequest();
  }

  protected getRequest<AjaxResponse>(): AjaxResponse {
    this.ajax.open('GET', this.url, false); // 데이터를 동기적으로 가져옴
    this.ajax.send(); //데이터를 가져옴

    return JSON.parse(this.ajax.response); // json형식으로 변환
  }
}
// 클래스를 통해서 더 확실한 목적을 갖게됨
export class NewsFeedApi extends Api {
  getData(): NewsFeed[] {
    return this.getRequest<NewsFeed[]>();
  }
}

export class NewsDetailApi extends Api {
  getData(): NewsDetail {
    return this.getRequest<NewsDetail>();
  }
}
