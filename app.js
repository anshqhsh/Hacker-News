const container = document.getElementById('root'); //id값이 root를 불러옴
const ajax = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
// 공유되는 값을 객체로 묶어줌
const store = {
  currentPage: 1,
  maxPage: 0,
};

//네트워크를 통해 데이터를 가져와 객체로 변경
function getData(url) {
  ajax.open('GET', url, false); // 데이터를 동기적으로 가져옴
  ajax.send(); //데이터를 가져옴
  store.maxPage = JSON.parse(ajax.response).length / 10;

  return JSON.parse(ajax.response); // json형식으로 변환
}

// 글목록을 가져오는 함수
function newsFeed() {
  const newsFeed = getData(NEWS_URL);
  const ul = document.createElement('ul'); //테그를 생성

  const newsList = [];

  let template = `
  <div class="container mx-auto p-4">
    <h1>Hacker News</h1>
    <ul>
      {{__news_feed__}}
    </ul>
    <div>
      <a href="#/page/{{__prev_page__}}">이전 페이지</a>
      <a href="#/page/{{__next_page__}}">다음 페이지</a>
    </div>
  </div>
  `;

  for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    newsList.push(`
    <li>
      <a href="#/show/${newsFeed[i].id}">
        ${newsFeed[i].title}(${newsFeed[i].comments_count})
      </a>
    </li>
  `);
  }

  template = template.replace('{{__news_feed__}}', newsList.join('')); // 마크업을 대체
  template = template.replace(
    '{{__prev_page__}}',
    store.currentPage > 1 ? store.currentPage - 1 : 1
  );
  template = template.replace(
    '{{__next_page__}}',
    store.currentPage < store.maxPage ? store.currentPage + 1 : store.maxPage
  );

  container.innerHTML = template;
}

function newsDetail() {
  const id = location.hash.substring(7); // 주소와 관련된 데이터를 전달 #을 제거한 값을 출력
  const newsContent = getData(CONTENT_URL.replace('@id', id));

  container.innerHTML = `
  <h1> ${newsContent.title}</h1>
    <div>
      <a href="#/page/${store.currentPage}">목록으로</a>
    </div>
  `;
}

// 화면전환 location.hash에서 #은 빈값을 반환함
function router() {
  const routePath = location.hash;
  if (routePath === '') {
    newsFeed();
  } else if (routePath.indexOf('#/page/') >= 0) {
    store.currentPage = Number(routePath.substring(7));
    //indexOf 입력 문자열을 찾아 없으면 -1 값 아니면 위치 값을 전달
    newsFeed();
  } else {
    newsDetail();
  }
}

// #은 해시 해시가 바뀌었을때 이벤트가 발생 hashchange 이벤트를 사용(window에서 발생)

window.addEventListener('hashchange', router);
router();
