import Router from './core/router';
import { NewsFeedView, NewsDetailView } from './page';
import { Store } from './types';

// 공유되는 값을 객체로 묶어줌
const store: Store = {
  currentPage: 1,
  feeds: [], //페이지 변경 마다 데이터를 가져오기 때문에 줄여주기 위해 배열을 이용
};

// 윈도우에 전역객체 설정
declare global {
  interface Window {
    store: Store;
  }
}

window.store = store;

const router: Router = new Router();
const newsFeedView = new NewsFeedView('root');
const newsDetailView = new NewsDetailView('root');

router.setDefaultPage(newsFeedView);
router.addRoutePath('/page/', newsFeedView);
router.addRoutePath('/show/', newsDetailView);

router.route();
