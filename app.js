const container = document.getElementById('root'); //id값이 root를 불러옴
const ajax = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
// 공유되는 값을 객체로 묶어줌
const store = {
  currentPage: 1,
  feeds: [], //페이지 변경 마다 데이터를 가져오기 때문에 줄여주기 위해 배열을 이용
  maxPage: 0,
};

//네트워크를 통해 데이터를 가져와 객체로 변경
function getData(url) {
  ajax.open('GET', url, false); // 데이터를 동기적으로 가져옴
  ajax.send(); //데이터를 가져옴
  store.maxPage = JSON.parse(ajax.response).length / 10;

  return JSON.parse(ajax.response); // json형식으로 변환
}

// 리스트에 읽음상태 추가
function makeFeeds(feeds) {
  for (let i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }
  return feeds;
}

// 글목록을 가져오는 함수
function newsFeed() {
  let newsFeed = store.feeds;
  const ul = document.createElement('ul'); //테그를 생성

  const newsList = [];

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

  //store에 리스트를 생성하여 서버에서 한번만 불러오게끔
  if (newsFeed.length === 0) {
    newsFeed = store.feeds = makeFeeds(getData(NEWS_URL));
  }
  console.log(newsFeed[0]);

  for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    newsList.push(`
    <div class="p-6 ${
      newsFeed[i].read ? 'bg-green-500' : 'bg-white'
    } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
        <div class="flex">
          <div class="flex-auto">
            <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>  
          </div>
          <div class="text-center text-sm">
            <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${
              newsFeed[i].comments_count
            }</div>
          </div>
        </div>
        <div class="flex mt-3">
          <div class="grid grid-cols-3 text-sm text-gray-500">
            <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
            <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
            <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
          </div>  
        </div>
      </div>    
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

//읽는곳
function newsDetail() {
  const id = location.hash.substring(7); // 주소와 관련된 데이터를 전달 #을 제거한 값을 출력
  const newsContent = getData(CONTENT_URL.replace('@id', id));

  let template = `
  <div class="bg-gray-600 min-h-screen pb-8">
  <div class="bg-white text-xl">
    <div class="mx-auto px-4">
      <div class="flex justify-between items-center py-6">
        <div class="flex justify-start">
          <h1 class="font-extrabold">Hacker News</h1>
        </div>
        <div class="items-center justify-end">
          <a href="#/page/${store.currentPage}" class="text-gray-500">
            <i class="fa fa-times"></i>
          </a>
        </div>
      </div>
    </div>
  </div>

  <div class="h-full border rounded-xl bg-white m-6 p-4 ">
    <h2>${newsContent.title}</h2>
    <div class="text-gray-400 h-20">
      ${newsContent.content}
    </div>

    {{__comments__}}

  </div>
</div>
  `;
  for (let i = 0; i < store.feeds.length; i++) {
    if (store.feeds[i].id === Number(id)) {
      store.feeds[i].read = true;
      break;
    }
  }
  function makeComment(comments, called = 0) {
    const commentString = [];

    for (let i = 0; i < comments.length; i++) {
      commentString.push(`
        <div style="padding-left: ${called * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comments[i].user}</strong> ${comments[i].time_ago}
          </div>
          <p class="text-gray-700">${comments[i].content}</p>
        </div>      
      `);

      // 대댓글을 가져옴
      if (comments[i].comments.length > 0) {
        commentString.push(makeComment(comments[i].comments, called + 1)); // 재귀 호출 하위의 comment가 없을때까지 호출
      }
    }

    return commentString.join('');
  }
  container.innerHTML = template.replace(
    '{{__comments__}}',
    makeComment(newsContent.comments)
  );
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
