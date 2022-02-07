// 공통요소를 코드 개선 부모 클래스에서 공통 요소를 뽑아 낸다
export default abstract class View {
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
