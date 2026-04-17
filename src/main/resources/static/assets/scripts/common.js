HTMLElement.VISIBLE_ATTR_NAME = 'data-visible'

/**@return {HTMLElement}*/
HTMLElement.prototype.hide = function () {
    this.removeAttribute(HTMLElement.VISIBLE_ATTR_NAME);
    return this;
}

/**@return {boolean}*/
HTMLElement.prototype.isVisible = function () {

}

// '/**'치고 엔터 치면 아래 요소 알아서 만들어 줌 / 파람은 매개변수에 대한 지정 / 리턴은 변수 타입 지정?
/**
 * @param {boolean}b
 * @return {HTMLElement}
 */
HTMLElement.prototype.setVisible = function (b) {
    if (b === true){
        this.setAttribute(HTMLElement.VISIBLE_ATTR_NAME, '');
    } else if(b === false){
        this.removeAttribute(HTMLElement.VISIBLE_ATTR_NAME);
    }
    return this;
}

//프로토타입은 화살표함수 쓰면 안됨
/**@return {HTMLElement}*/
HTMLElement.prototype.show = function () {
    //속성 지정하는 것
    this.setAttribute(HTMLElement.VISIBLE_ATTR_NAME, '');
    return this;
}

class CustomObject{
    static ATTR_NAME = 'data-object';
    static COMP_ATTR_NAME = 'data-component';
}

//자바에서 하는 클래스 만들이 스크립트에서도 할 수 있음
//new 할 때 (객체화 할 때) 다이얼로그 집어넣고싶어서 아래 함수 씀
class Dialog {
    static ATTR_VALUE = 'dialog';
    static MODAL_COLLAPSED_ATTR_NAME = 'data-collapsed';
    static MODAL_ATTR_NAME = 'dialog.modal';
    static MODAL_TITLE_ATTR_VALUE = 'dialog.modal.title';
    static MODAL_CONTENT_ATTR_VALUE = 'dialog.modal.content';
    static MODAL_BUTTON_CONTAINER_ATTR_VALUE = 'dialog.modal.buttonContainer';
    static MODAL_BUTTON_ATTR_VALUE = 'dialog.modal.button';

    /**@type {HTMLElement}*/
    $element; //멤버 변수
    /**@type {HTMLElement[]}*/
    $modals = [];

    //얘가 생성자
    //args 전달 받게 하기
    //파람에 {}은 타입 / 그 다음 그 안에 오브젝트 명시! / {타입} or {{오브젝트}}
    /**
     * @param {{$element?: HTMLElement}} args
     */
    constructor(args = {}) {
        //로그인에는 다이알로그 요소가 없음. 퉁치고싶다 = param element에 ? 붙이고 args = {} 해주기 그리고 아래와 같은 코드 작성
        if (args?.$element === null){
            args ??= {};
            args.$element = document.createElement('div');
            args.$element.setAttribute(CustomObject.ATTR_NAME, Dialog.ATTR_VALUE);
            document.body.prepend(args.$element);
        }
        this.$element = args.$element;
    }

    /**
     * @param {HTMLElement} $modal
     * @return {boolean}
     */
    hide($modal){
        const modalIndex = this.$modals.indexOf($modal);
        if (modalIndex === -1){
            return false;
        }
        $modal.hide();
        setTimeout(() => $modal.remove(), 1000);
        this.$modals.splice(modalIndex, 1);
        if (this.$modals.length === 0){
            this.$element.hide();
        } else {
            // -1 : 마지막 인자 가져오는 것
            this.$modals.at(-1).removeAttribute(Dialog.MODAL_COLLAPSED_ATTR_NAME);
        }
        return true;
    }

    /**
     * @param {{title: string, content: string, isContentHTML?: boolean, buttons?: {caption: string, onclick?:function(HTMLElement?)}[] }}args
     * @return {HTMLElement}
     * */
    show(args){
        const $modal = document.createElement('div');
        $modal.setAttribute(CustomObject.COMP_ATTR_NAME, Dialog.MODAL_ATTR_NAME);
        const $title = document.createElement('div');
        $title.setAttribute(CustomObject.COMP_ATTR_NAME, Dialog.MODAL_TITLE_ATTR_VALUE);
        $title.innerText = args.title;
        const $content = document.createElement('div');
        $content.setAttribute(CustomObject.COMP_ATTR_NAME, Dialog.MODAL_CONTENT_ATTR_VALUE);
        if (args.isContentHTML === true){
            $content.innerHTML = args.content;
        } else{
            $content.innerText = args.content;
        }
        $modal.append($title, $content);
        if (args.buttons != null && args.buttons.length > 0){
            const $buttonContainer = document.createElement('div');
            $buttonContainer.setAttribute(CustomObject.COMP_ATTR_NAME, Dialog.MODAL_BUTTON_CONTAINER_ATTR_VALUE);
            for (const button of args.buttons){
                const $button = document.createElement('button');
                $button.setAttribute(CustomObject.COMP_ATTR_NAME, Dialog.MODAL_BUTTON_ATTR_VALUE);
                $button.innerText = button.caption;
                if (typeof  button.onclick === 'function'){
                    $button.addEventListener('click', () => button.onclick($modal));
                }
                $buttonContainer.append($button);
            }
            $modal.append($buttonContainer);
        }
        this.$modals.forEach(($modal) => $modal.setAttribute(Dialog.MODAL_COLLAPSED_ATTR_NAME, ''));
        this.$modals.push($modal);
        this.$element.append($modal);
        this.$element.show();
        setInterval(() => $modal.show(), 50);
        return $modal;
    }

    /**
     * @param {string} title
     * @param {string} content
     * @param {{isContentHTML?: boolean, buttonCaption?: string, buttonOnclick?: function(HTMLElement?)}|undefined} args
     * @return {HTMLElement}
     */
    showSimpleOk(title, content, args = {isContentHTML: false, buttonCaption: '확인', buttonOnclick: undefined}){
        return this.show({
            title: title,
            content: content,
            isContentHTML: args?.isContentHTML,
            buttons: [
                {
                    caption: args?.buttonCaption ?? '확인',
                    onclick: ($modal) => {
                        this.hide($modal);
                        if (typeof args?.buttonOnclick === 'function'){
                            args?.buttonOnclick($modal);
                        }
                    }
                }
            ]
        })
    }

    /**
     * @param {string}title
     * @param {string}content
     * @param {{isContentHTML?: boolean, yesButtonCaption?: string, yesButtonOnclick?: function(HTMLElement?), noButtonCaption?: string, noButtonOnclick?: function(HTMLElement?)}|undefined} args
     * @return {HTMLElement}
     */
    showSimpleYesNo(title, content, args = {isContentHTML: false, yesButtonCaption: '네', yesButtonOnclick: undefined, noButtonCaption: '아니요', noButtonOnclick: undefined}) {
        return this.show({
            title: title,
            content: content,
            isContentHTML: args?.isContentHTML,
            buttons: [
                {
                    caption: args?.noButtonCaption ?? '아니요',
                    onclick: ($modal) => {
                        this.hide($modal);
                        if (typeof args?.noButtonOnclick === 'function'){
                            args?.noButtonOnclick($modal);
                        }
                    }
                },
                {
                    caption: args?.yesButtonCaption ?? '네',
                    onclick: ($modal) => {
                        this.hide($modal);
                        if (typeof args?.yesButtonOnclick === 'function'){
                            args?.yesButtonOnclick($modal);
                        }
                    }
                }
            ]
        })
    }
}

class Loading {
    /** @type {HTMLElement} */
    $element;

    /** @type {{$element?: HTMLElement}|undefined} args */
    constructor(args = {}) {
        args ??= {};
        if (args.$element == null) {
            const $element = document.createElement('div');
            $element.setAttribute('data-object', 'loading');
            const $icon = document.createElement('div');
            $icon.setAttribute('data-component', 'loading.icon');
            const $message = document.createElement('div');
            $message.setAttribute('data-component', 'loading.message');
            $element.append($icon, $message);
            document.body.prepend($element);
            args.$element = $element;
        }
        this.$element = args.$element;
    }

    /** @type {HTMLElement} */
    hide() {
        return this.$element.hide();
    }

    /** @type {HTMLElement} */
    show() {
        return this.$element.show();
    }
}



class CustomLabelObject{
    //멤버변수
    /**@type {HTMLLabelElement}*/
    $element;
    /**@type {HTMLElement}*/
    $caption;
    /**@type {HTMLElement[]}*/
    $fields = [];
    /**@type {HTMLElement|undefined}*/
    $hintWrapper;
    /**@type {HTMLElement|undefined}*/
    $warningWrapper;

    /**@param {{$element: HTMLLabelElement}} args*/
    constructor(args) {
        this.$element = args.$element;
        this.$caption = this.$element.querySelector('[data-component~="label.caption"]');
        this.$fields = Array.from(this.$element.querySelectorAll('[data-component~="label.field"]'));
        this.$hintWrapper = this.$element.querySelector('[data-component~="label.hintWrapper"]');
        this.$warningWrapper = this.$element.querySelector('[data-component~="label.warningWrapper"]');
    }

    /**
     * @param {string|undefined} text
     * @return {boolean}
     */
    showHint(text = undefined){
        if (this.$hintWrapper == null){
            return false;
        }
        if (typeof text === 'string'){
            this.$hintWrapper.querySelector('[data-component="label.messageCaption"]').innerText = text;
        }
        this.$hintWrapper.show();
        return true;
    }

    hideHint() {
        this.$hintWrapper?.hide();
    }

    hideWarning() {
        this.$warningWrapper?.hide();
    }

    /**
     * @param {string|undefined} text
     * @return {boolean}
     */
    showWarning(text = undefined){
        if (this.$warningWrapper == null){
            return false;
        }
        if (typeof text === 'string'){
            this.$warningWrapper.querySelector('[data-component~="label.messageCaption"]').innerText = text;
        }
        this.$warningWrapper.show();
        return true;
    }
}

//외부에서 선언 못하도록 빼놓음. 단, const가 아닌 window를 적으면 외부에서 쓸 수 있음
document.addEventListener('DOMContentLoaded', () => {
    window.dialog = new Dialog({
        $element: document.body.querySelector(':scope > [data-object="dialog"]')
    });
    const labelObjectMap = {};
    document.body.querySelectorAll('[data-object="label"]').forEach(($label) => {
        const name = $label.getAttribute('data-name');
        if (name == null){
            console.warn('커스텀 라벨 오브젝트가 이름(data-name) 속성을 가지고 있지 않음으로 생략합니다.', $label);
        } else if (labelObjectMap[name] != null){
            console.warn(`커스텀 라벨 오브젝트 중 주어진 이름(${name})이 중복되어 할당되어 있음으로 생략합니다.`, $label);
        } else {
            labelObjectMap[name] = new CustomLabelObject({
                $element: $label
            });
        }
    });
    window.labelObjectMap = labelObjectMap;
});