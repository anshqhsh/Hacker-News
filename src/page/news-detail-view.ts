import View from '../core/view';
import { NewsDetailApi } from '../core/api';
import { NewsDetail, NewsComment } from '../types';
import { CONTENT_URL } from '../config';

const template = `
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
//읽는 곳
export default class NewsDetailView extends View {
  constructor(containerId: string) {
    super(containerId, template);
  }
  render() {
    const id = location.hash.substring(7); // 주소와 관련된 데이터를 전달 #을 제거한 값을 출력
    const api = new NewsDetailApi(CONTENT_URL.replace('@id', id));
    const newsDetail: NewsDetail = api.getData();

    for (let i = 0; i < window.store.feeds.length; i++) {
      if (window.store.feeds[i].id === Number(id)) {
        window.store.feeds[i].read = true;
        break;
      }
    }
    this.setTemplateData('comments', this.makeComment(newsDetail.comments));
    this.setTemplateData('currentPage', String(window.store.currentPage));
    this.setTemplateData('title', newsDetail.title);
    this.setTemplateData('currentPage', String(window.store.currentPage));
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
