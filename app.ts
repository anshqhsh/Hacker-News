//type alias interface는 = 을 지우면 됨
interface Store {
  currentPage: number;
  feeds: NewsFeed[]; // 생성한 newsFeed라는 형식이 들어가는 배열이라는 뜻
}
interface News {
  readonly id: number;
  readonly time_ago: number;
  readonly title: string;
  readonly url: string;
  readonly user: string;
  readonly content: string;
}

interface NewsFeed extends News {
  readonly comments_count: number;
  readonly points: number;
  read?: boolean; // optional 속성
}

interface NewsDetail extends News {
  readonly comments: NewsComment[];
}

interface NewsComment extends News {
  readonly comments: NewsComment[];
  readonly level: number;
}
interface RouteInfo {
  path: string;
  page: View;
}

const ajax: XMLHttpRequest = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
// 공유되는 값을 객체로 묶어줌
const store: Store = {
  currentPage: 1,
  feeds: [], //페이지 변경 마다 데이터를 가져오기 때문에 줄여주기 위해 배열을 이용
};

// 공통요소로 네트워크로 api를 호출
class Api {
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
class NewsFeedApi extends Api {
  getData(): NewsFeed[] {
    return this.getRequest<NewsFeed[]>();
  }
}

class NewsDetailApi extends Api {
  getData(): NewsDetail {
    return this.getRequest<NewsDetail>();
  }
}

// 공통요소를 코드 개선 부모 클래스에서 공통 요소를 뽑아 낸다
abstract class View {
  // 속성
  private template: string;
  private renderTemplate: string; // 기존의 템플릿을 가지고 있으면서 화면을 랜더링 할때는 이 템플릿을 이용하고 새로운 값을 받을땐 원본 키값을 채운다
  private container: HTMLElement;
  private htmlList: string[];

  constructor(containerId: string, template: string) {
    const containerElement = document.getElementById(containerId);
    if (!containerElement) {
      throw '최상위 컨테이너가 없어 UI를 진행하지 못합니다.'; // 종료
    }
    this.container = containerElement;
    this.template = template;
    this.renderTemplate = template;
    this.htmlList = [];
  }

  //메소드
  // 슈퍼클래스 기능 요소 - container에 innerHtml에 데이터를 넣고 있음
  protected updateView(): void {
    this.container.innerHTML = this.renderTemplate;
    this.renderTemplate = this.template; // setTemplateData 전 초기 값으로
  }

  //html 조각을 추가
  protected addHtml(htmlString: string): void {
    this.htmlList.push(htmlString);
  }
  protected getHtml(): string {
    const snapshot = this.htmlList.join('');
    this.clearHtmlList();
    return snapshot;
  }

  // key를 받아 데이터 변환
  protected setTemplateData(key: string, value: string): void {
    this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value);
  }

  private clearHtmlList(): void {
    this.htmlList = []; // newsfeedview와 Newsdetail에서 사용이 되며 값을 한번 add가 되어지고 있기 때문에 한번 초기화 해줘야한다.
  }

  // 자식의 구현을 하라는 마킹 추상 메소드
  abstract render(): void;
}

// 화면전환 location.hash에서 #은 빈값을 반환함
class Router {
  routeTable: RouteInfo[];
  defaultRoute: RouteInfo | null;

  constructor() {
    // this.route 의 경우에는 브라우저의 이벤트시스템이 호출하게됨
    // 이 호출 시의 route는 라우터의 instance가 아니고
    // defaultRouter나 routerTable 정보에 접근이 불가능함
    // 현재 등록 시점을 고정 시켜주기 위해 bind를 사용
    window.addEventListener('hashchange', this.route.bind(this));

    this.routeTable = [];
    this.defaultRoute = null;
  }
  setDefaultPage(page: View): void {
    this.defaultRoute = { path: '', page };
  }
  addRoutePath(path: string, page: View): void {
    this.routeTable.push({ path, page });
  }
  route() {
    const routePath = location.hash;
    if (routePath === '' && this.defaultRoute) {
      this.defaultRoute.page.render();
    }
    for (const routeInfo of this.routeTable) {
      if (routePath.indexOf(routeInfo.path) >= 0) {
        routeInfo.page.render();
        break;
      }
    }
  }
}

// 글목록을 표시 하는 클래스
class NewsFeedView extends View {
  // 클래스 인스턴스
  private api: NewsFeedApi;
  private feeds: NewsFeed[];

  constructor(containerId: string) {
    let template = `
      <div class="bg-gray-600 min-h-screen">
          <div class="bg-white text-xl">
            <div class="mx-auto px-4">
              <div class="flex justify-between items-center py-6">
                <div class="flex justify-start">
                  <h1 class="font-extrabold">Hacker News</h1>
                </div>
                <div class="items-center justify-end">
                  <a href="#/page/{{__prev_page__}}" class="text-gray-500">
                    Previous
                  </a>
                  <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
                    Next
                  </a>
                </div>
              </div> 
            </div>
          </div>
          <div class="p-4 text-2xl text-gray-700">
            {{__news_feed__}}        
          </div>
        </div>
      `;
    super(containerId, template);

    this.api = new NewsFeedApi(NEWS_URL);

    this.feeds = store.feeds;

    //store에 리스트를 생성하여 서버에서 한번만 불러오게끔
    if (this.feeds.length === 0) {
      this.feeds = store.feeds = this.api.getData();
      this.makeFeeds(); // 리드속성 추가
    }
  }

  // 화면 그려주는 부분
  render(): void {
    store.currentPage = Number(location.hash.substring(7) || 1);
    for (
      let i = (store.currentPage - 1) * 10;
      i < store.currentPage * 10;
      i++
    ) {
      const { read, id, title, comments_count, user, points, time_ago } =
        this.feeds[i];
      this.addHtml(`
    <div class="p-6 ${
      read ? 'bg-green-500' : 'bg-white'
    } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
        <div class="flex">
          <div class="flex-auto">
            <a href="#/show/${id}">${title}</a>  
          </div>
          <div class="text-center text-sm">
            <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${comments_count}</div>
          </div>
        </div>
        <div class="flex mt-3">
          <div class="grid grid-cols-3 text-sm text-gray-500">
            <div><i class="fas fa-user mr-1"></i>${user}</div>
            <div><i class="fas fa-heart mr-1"></i>${points}</div>
            <div><i class="far fa-clock mr-1"></i>${time_ago}</div>
          </div>  
        </div>
      </div>    
  `);
    }

    this.setTemplateData('news_feed', this.getHtml());
    this.setTemplateData(
      'prev_page',
      String(store.currentPage > 1 ? store.currentPage - 1 : 1)
    );
    this.setTemplateData('next_page', String(store.currentPage + 1));

    this.updateView();
  }

  // 리스트에 읽음상태 추가
  private makeFeeds() {
    for (let i = 0; i < this.feeds.length; i++) {
      this.feeds[i].read = false;
    }
  }
}

//읽는 곳
class NewsDetailView extends View {
  constructor(containerId: string) {
    let template = `
  <div class="bg-gray-600 min-h-screen pb-8">
  <div class="bg-white text-xl">
    <div class="mx-auto px-4">
      <div class="flex justify-between items-center py-6">
        <div class="flex justify-start">
          <h1 class="font-extrabold">Hacker News</h1>
        </div>
        <div class="items-center justify-end">
          <a href="#/page/{{__currentPage__}}" class="text-gray-500">
            <i class="fa fa-times"></i>
          </a>
        </div>
      </div>
    </div>
  </div>

  <div class="h-full border rounded-xl bg-white m-6 p-4 ">
    <h2>{{__title__}}</h2>
    <div class="text-gray-400 h-20">
      {{__content__}}
    </div>

    {{__comments__}}

  </div>
</div>
  `;
    super(containerId, template);
  }
  render() {
    const id = location.hash.substring(7); // 주소와 관련된 데이터를 전달 #을 제거한 값을 출력
    const api = new NewsDetailApi(CONTENT_URL.replace('@id', id));
    const newsDetail: NewsDetail = api.getData();

    for (let i = 0; i < store.feeds.length; i++) {
      if (store.feeds[i].id === Number(id)) {
        store.feeds[i].read = true;
        break;
      }
    }
    this.setTemplateData('comments', this.makeComment(newsDetail.comments));
    this.setTemplateData('currentPage', String(store.currentPage));
    this.setTemplateData('title', newsDetail.title);
    this.setTemplateData('currentPage', String(store.currentPage));
    this.updateView();
  }

  makeComment(comments: NewsComment[]): string {
    for (let i = 0; i < comments.length; i++) {
      const comment: NewsComment = comments[i];

      this.addHtml(`
        <div style="padding-left: ${comment.level * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comment.user}</strong> ${comment.time_ago}
          </div>
          <p class="text-gray-700">${comment.content}</p>
        </div>      
      `);

      // 대댓글을 가져옴
      if (comment.comments.length > 0) {
        this.addHtml(this.makeComment(comments[i].comments)); // 재귀 호출 하위의 comment가 없을때까지 호출
      }
    }

    return this.getHtml();
  }
}

const router: Router = new Router();
const newsFeedView = new NewsFeedView('root');
const newsDetailView = new NewsDetailView('root');

router.setDefaultPage(newsFeedView);
router.addRoutePath('/page/', newsFeedView);
router.addRoutePath('/show/', newsDetailView);

router.route();
