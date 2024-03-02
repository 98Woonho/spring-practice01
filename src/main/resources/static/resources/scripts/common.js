const dialog = document.getElementById('dialog');

if (dialog) { // undefined도 아니고 null도 아닐 때 = 요소가 존재할 때
    dialog.createButton = function(text, onclick) { // dialog.createButton(text, onclick) 형태로 사용하여, object를 반환하는 함수 생성
        return {
            text: text,
            onclick: onclick
        };
    }

    dialog.hide = function() {
        dialog.classList.remove('visible');
    }

    dialog.show = function(params) {
        const modal = dialog.querySelector(':scope > [rel="modal"]') // <div id="dialog">의 자식인 <div class="modal" rel="modal"> 태그를 modal에 저장.
        const buttonContainer = modal.querySelector(':scope > [rel="buttonContainer"]'); // <div class="modal" rel="modal">의 자식인 <div class="button-container" rel="buttonContainer"> 태그를 buttonContainer에 저장
        modal.querySelector(':scope > [rel="title"]').innerText = params['title']; // <div class="modal" rel="modal">의 자식인 <div class="title" rel="title">제목</div> 태그에 params['title'] 에 있는 Text 삽입.
        modal.querySelector(':scope > [rel="content"]').innerHTML = params['content']; // <div class="modal" rel="modal">의 자식인 <div class="content" rel="content">내용</div> 태그에 params['content'] 에 있는 HTML 삽입.
        buttonContainer.innerHTML = ''; // 초기화 후에 마지막에 버튼 추가 해줘야 함.
        if (params['buttons'] && params['buttons'].length > 0) {
            for (const button of params['buttons']) {
                const buttonElement = document.createElement('div'); // <div></div> 생성
                buttonElement.classList.add('button'); // <div class="button"><div> class="button" 추가
                buttonElement.innerText = button['text']; // text 추가
                buttonElement.onclick = button['onclick']; // click시 onclick에 있는 내용 실행
                buttonContainer.append(buttonElement); // rel="buttonContainer" 가 있는 태그의 자식에 buttonElement를 append
            }
        }
        dialog.classList.add('visible');
    }
}

const loading = document.getElementById('loading');

if (loading) {
    loading.hide = function() {
        loading.classList.remove('visible');
    }
    loading.show = function() {
        loading.classList.add('visible');
    }
}

// input 태그에 대한 regex
HTMLInputElement.prototype.testRegex = function() {
    // 개발자 도구에 mainForm['infoEmail'].testRegex(); 를 하면 this에 mainForm['infoEmail']이 들어가서 return 해줌.
    return new RegExp(this.dataset.regex).test(this.value);
}

// textarea 태그에 대한 regex
HTMLTextAreaElement.prototype.testRegex = HTMLInputElement.prototype.testRegex;