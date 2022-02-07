import { RouteInfo } from '../types';
import View from './view';

// 화면전환 location.hash에서 #은 빈값을 반환함
export default class Router {
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
